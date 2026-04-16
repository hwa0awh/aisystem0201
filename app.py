# -*- coding: utf-8 -*-
"""
Flask 백엔드 서버
- /api/pronunciation  : ETRI 발음평가 API
- /api/generate       : CLOVA Studio 발표 대본 생성 (분할 생성)
- /api/pptx-generate  : PPTX -> 슬라이드별 대본 생성 (병렬 처리 + 재시도)
"""

from flask import Flask, request, jsonify, send_from_directory
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
import base64
import os
import io
import subprocess
import tempfile
import glob
import traceback
import time

app = Flask(__name__, static_folder="static")

# =============================================
# 설정값 (여기만 수정하세요)
# =============================================
ETRI_API_KEY   = ""
CLOVA_API_KEY  = ""
STDICT_API_KEY = ""   # 표준국어대사전 OpenAPI 키
# =============================================

ETRI_URL_KOR  = "http://epretx.etri.re.kr:8000/api/WiseASR_PronunciationKor"
ETRI_URL_ENG  = "http://epretx.etri.re.kr:8000/api/WiseASR_Pronunciation"
CLOVA_URL     = "https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-005"
CLOVA_URL_VIS = "https://clovastudio.stream.ntruss.com/v1/openai/chat/completions"  # OpenAI 호환
STDICT_SEARCH_URL = "https://stdict.korean.go.kr/api/search.do"
STDICT_VIEW_URL   = "https://stdict.korean.go.kr/api/view.do"
STDICT_CERTKEY    = "9051"   # 표준국어대사전 고정 certkey_no

MAX_TOKENS_PER_CALL = 4096
SLIDES_PER_CHUNK    = 5   # 대본 생성 시 한 번에 처리할 슬라이드 수
VISION_WORKERS      = 3   # 비전 AI 병렬 호출 수 (API 제한 고려)
MAX_RETRY           = 3   # 실패 시 재시도 횟수
RETRY_DELAY         = 2   # 재시도 대기 시간 (초)


@app.route("/")
def index():
    return send_from_directory("static", "index.html")


# ── 발음평가 ────────────────────────────────
@app.route("/api/pronunciation", methods=["POST"])
def pronunciation():
    try:
        language   = request.form.get("language", "korean")
        script     = request.form.get("script", "")
        audio_file = request.files.get("audio")

        if not audio_file:
            return jsonify({"error": "음성 파일이 없습니다."}), 400

        audio_b64 = base64.b64encode(audio_file.read()).decode("utf-8")
        url = ETRI_URL_KOR if language == "korean" else ETRI_URL_ENG

        payload = {"argument": {"language_code": language, "audio": audio_b64}}
        if script:
            payload["argument"]["script"] = script

        resp = requests.post(
            url,
            headers={
                "Content-Type": "application/json; charset=UTF-8",
                "Authorization": ETRI_API_KEY
            },
            json=payload,
            timeout=30,
        )
        return jsonify(resp.json()), resp.status_code

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── CLOVA 단일 호출 (재시도 포함) ───────────
def call_clova_once(messages, max_tokens=MAX_TOKENS_PER_CALL):
    for attempt in range(1, MAX_RETRY + 1):
        try:
            resp = requests.post(
                CLOVA_URL,
                headers={
                    "Authorization": f"Bearer {CLOVA_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "messages": messages,
                    "maxTokens": max_tokens,
                    "temperature": 0.7,
                    "topP": 0.85,
                    "repetitionPenalty": 1.1,
                },
                timeout=180,
            )
            if resp.status_code == 200:
                return resp.json(), resp.status_code
            # 429 (Too Many Requests) 면 더 오래 대기
            if resp.status_code == 429:
                print(f"[CLOVA] 429 Too Many Requests, {attempt}번째 재시도 대기 중...")
                time.sleep(RETRY_DELAY * attempt * 2)
            else:
                time.sleep(RETRY_DELAY * attempt)
        except requests.exceptions.Timeout:
            print(f"[CLOVA] 타임아웃, {attempt}번째 재시도...")
            time.sleep(RETRY_DELAY * attempt)
        except Exception as e:
            print(f"[CLOVA] 오류: {e}, {attempt}번째 재시도...")
            time.sleep(RETRY_DELAY * attempt)

    return {"error": "최대 재시도 초과"}, 500


# ── 일반 대본 분할 생성 ─────────────────────
def get_parts(duration):
    if duration <= 3:
        return ["서론", "본론", "결론"]
    elif duration <= 7:
        return ["서론", "본론1", "본론2", "결론"]
    elif duration <= 15:
        return ["서론", "본론1", "본론2", "본론3", "결론"]
    else:
        return ["서론", "본론1", "본론2", "본론3", "본론4", "결론"]


def generate_script_chunked(base_info, parts, style_info):
    full_script = ""
    total_prompt_tokens = 0
    total_completion_tokens = 0

    system_msg = {
        "role": "system",
        "content": "당신은 전문 발표 대본 작가입니다. 지시한 파트만 작성하고 다른 파트는 절대 작성하지 마세요."
    }

    for part in parts:
        context = f"\n\n[지금까지 작성된 내용]\n{full_script}" if full_script else ""

        prompt = f"""{base_info}{style_info}{context}

[지시]
지금 반드시 [{part}] 파트만 작성하세요. 다른 파트는 작성하지 마세요.
파트 시작은 반드시 [{part}]로 표시하세요.
자연스러운 구어체로 충분히 길게 작성하세요."""

        data, status = call_clova_once([system_msg, {"role": "user", "content": prompt}])

        if status != 200:
            return {"error": f"{part} 생성 실패"}, status

        part_text = data["result"]["message"]["content"]
        usage = data["result"]["usage"]
        total_prompt_tokens     += usage["promptTokens"]
        total_completion_tokens += usage["completionTokens"]
        full_script += "\n\n" + part_text.strip()

    return {
        "result": {
            "message": {"role": "assistant", "content": full_script.strip()},
            "finishReason": "stop",
            "usage": {
                "promptTokens":     total_prompt_tokens,
                "completionTokens": total_completion_tokens,
                "totalTokens":      total_prompt_tokens + total_completion_tokens,
            }
        }
    }, 200


# ── PPTX 슬라이드별 대본 생성 ───────────────
def generate_script_by_slides(slides, duration, audience, style, extra):
    total_slides   = len(slides)
    secs_per_slide = (duration * 60) / total_slides

    full_script = ""
    last_chunk_tail = ""  # 이전 청크 마지막 2문장 (자연스러운 연결용)
    total_prompt_tokens = 0
    total_completion_tokens = 0

    # 전체 슬라이드 목차 (매 호출마다 전달해서 전체 흐름 파악)
    outline = "\n".join(
        f"  {num}페이지: {text[:40].replace(chr(10), ' ')}{'...' if len(text) > 40 else ''}"
        for num, text in slides
    )

    system_msg = {
        "role": "system",
        "content": (
            "당신은 전문 발표 대본 작가입니다. "
            "전체 발표의 흐름과 통일성을 유지하면서 지시한 슬라이드 페이지의 대본만 작성하세요. "
            "이전 내용과 자연스럽게 이어지도록 작성하고, 같은 주제를 다루는 하나의 발표처럼 일관된 톤을 유지하세요."
        )
    }

    chunks = [slides[i:i + SLIDES_PER_CHUNK] for i in range(0, total_slides, SLIDES_PER_CHUNK)]

    for chunk_idx, chunk in enumerate(chunks):
        start_num = chunk[0][0]
        end_num   = chunk[-1][0]
        is_first  = chunk_idx == 0
        is_last   = chunk_idx == len(chunks) - 1

        chunk_text = ""
        for num, text in chunk:
            chunk_text += f"\n[{num}페이지]\n{text}\n"

        # 이전 청크 마지막 내용 (연결 고리)
        prev_context = f"\n[이전 대본 마지막 부분 - 여기서 자연스럽게 이어서 작성]\n{last_chunk_tail}" if last_chunk_tail else ""

        prompt = f"""하나의 발표 대본을 나눠서 작성하고 있습니다. 전체 흐름을 유지하며 이번 파트를 작성해주세요.

[전체 발표 정보]
- 전체 슬라이드: {total_slides}페이지 / 전체 발표 시간: {duration}분
- 청중 대상: {audience} / 발표 스타일: {style}
{f"- 추가 요청: {extra}" if extra else ""}
- 슬라이드당 발표 시간: 약 {secs_per_slide:.0f}초

[전체 슬라이드 목차 - 전체 흐름 파악용]
{outline}

[이번에 작성할 슬라이드: {start_num}~{end_num}페이지]
{chunk_text}
{prev_context}

[작성 규칙]
1. 반드시 [{start_num}페이지]부터 [{end_num}페이지]까지만 작성
2. 각 페이지 시작은 [{start_num}페이지], [{start_num + 1}페이지] 형태로 표시
3. ★ 슬라이드에 적힌 텍스트 내용만 사용하고 절대 임의로 내용을 만들어내지 마세요
4. ★ 슬라이드에 없는 사실, 수치, 이름, 기능 등을 추가하지 마세요
5. 슬라이드 내용을 그대로 읽지 말고 발표자가 말하듯 자연스럽게 풀어서 설명
6. 이전 내용과 자연스럽게 이어지는 전환 문장으로 시작{"(첫 페이지이므로 인사말로 시작)" if is_first else ""}
7. {"마지막 파트이므로 발표를 마무리하는 클로징 멘트로 끝내기" if is_last else "다음 슬라이드로 넘어가는 전환 문장으로 끝내기"}
8. 전체 발표와 동일한 톤과 스타일 유지
9. 각 페이지를 약 {secs_per_slide:.0f}초 분량으로 충분히 작성"""

        data, status = call_clova_once([system_msg, {"role": "user", "content": prompt}])

        if status != 200:
            return {"error": f"{start_num}~{end_num}페이지 생성 실패"}, status

        chunk_script = data["result"]["message"]["content"].strip()
        usage = data["result"]["usage"]
        total_prompt_tokens     += usage["promptTokens"]
        total_completion_tokens += usage["completionTokens"]
        full_script += "\n\n" + chunk_script

        # 다음 청크 연결을 위해 마지막 2문장 저장
        sentences = [s.strip() for s in chunk_script.replace("\n", " ").split(".") if s.strip()]
        last_chunk_tail = ". ".join(sentences[-2:]) + "." if len(sentences) >= 2 else chunk_script[-200:]

        print(f"[대본 생성] {start_num}~{end_num}페이지 완료 ({chunk_idx+1}/{len(chunks)})")

    return {
        "result": {
            "message": {"role": "assistant", "content": full_script.strip()},
            "finishReason": "stop",
            "usage": {
                "promptTokens":     total_prompt_tokens,
                "completionTokens": total_completion_tokens,
                "totalTokens":      total_prompt_tokens + total_completion_tokens,
            }
        }
    }, 200


# ── 일반 대본 생성 API ──────────────────────
@app.route("/api/generate", methods=["POST"])
def generate():
    try:
        data     = request.get_json()
        topic    = data.get("topic", "")
        duration = int(data.get("duration", 5))
        audience = data.get("audience", "일반 직장인")
        style    = data.get("style", "격식체")
        extra    = data.get("extra", "")

        if not topic:
            return jsonify({"error": "발표 주제를 입력해주세요."}), 400

        target_chars = duration * 250
        parts = get_parts(duration)

        base_info = f"""[발표 정보]
- 발표 주제: {topic}
- 발표 시간: {duration}분 (총 약 {target_chars}자 분량, {len(parts)}개 파트로 나눠 작성)
- 청중 대상: {audience}
- 전체 파트 구성: {' -> '.join(parts)}"""

        style_info = f"""
- 발표 스타일: {style}
{f"- 추가 요청: {extra}" if extra else ""}
- 청중을 부르는 호칭 포함, 실제로 말하듯 자연스러운 구어체로 작성"""

        result, status = generate_script_chunked(base_info, parts, style_info)
        return jsonify(result), status

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── PPTX 텍스트 추출 ────────────────────────
def extract_pptx_text(file_bytes):
    try:
        from pptx import Presentation
    except ImportError:
        raise RuntimeError("python-pptx 미설치")

    prs    = Presentation(io.BytesIO(file_bytes))
    slides = []

    for i, slide in enumerate(prs.slides, 1):
        slide_texts = []

        def collect_texts(shape):
            if shape.has_text_frame:
                for para in shape.text_frame.paragraphs:
                    # 런(run) 단위로 쪼개서 수직탭(\v) 등 특수문자 포함 텍스트도 처리
                    full = para.text.replace("\x0b", "\n").replace("\r", "").strip()
                    if full:
                        slide_texts.append(full)
            if shape.has_table:
                for row in shape.table.rows:
                    for cell in row.cells:
                        t = cell.text.replace("\x0b", "\n").strip()
                        if t:
                            slide_texts.append(t)
            # 그룹 shape 재귀 처리
            if shape.shape_type == 6:
                try:
                    for s in shape.shapes:
                        collect_texts(s)
                except Exception:
                    pass

        for shape in slide.shapes:
            collect_texts(shape)

        # 슬라이드 노트
        try:
            notes = slide.notes_slide.notes_text_frame.text.strip()
            if notes:
                slide_texts.append(f"(발표자 노트: {notes})")
        except Exception:
            pass

        slides.append((i, "\n".join(slide_texts) if slide_texts else "(텍스트 없음)"))

    return slides


# ── 이미지 → 텍스트 (OpenAI 호환 엔드포인트, 재시도 포함) ──
def extract_text_from_image(args):
    idx, img_bytes = args
    for attempt in range(1, MAX_RETRY + 1):
        try:
            img_b64  = base64.b64encode(img_bytes).decode()
            data_uri = f"data:image/jpeg;base64,{img_b64}"

            resp = requests.post(
                CLOVA_URL_VIS,
                headers={
                    "Authorization": f"Bearer {CLOVA_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "HCX-005",
                    "messages": [
                        {"role": "system", "content": "이미지에서 텍스트를 추출하는 AI입니다."},
                        {"role": "user", "content": [
                            {"type": "image_url", "image_url": {"url": data_uri}},
                            {"type": "text", "text": "이 슬라이드에 있는 모든 텍스트를 빠짐없이 추출해줘. 제목, 본문, 키워드 모두 포함. 텍스트만 출력하고 설명은 하지 마."}
                        ]}
                    ],
                    "max_tokens": 500,
                    "temperature": 0.1,
                },
                timeout=60,
            )
            if resp.status_code == 200:
                text = resp.json()["choices"][0]["message"]["content"].strip()
                print(f"[비전 추출] {idx}페이지 완료")
                return idx, text
            if resp.status_code == 429:
                print(f"[비전 추출] {idx}페이지 429 Too Many Requests, {attempt}번째 재시도 대기...")
                time.sleep(RETRY_DELAY * attempt * 2)
            else:
                print(f"[비전 추출] {idx}페이지 {attempt}번째 실패: HTTP {resp.status_code}")
                time.sleep(RETRY_DELAY * attempt)
        except Exception as e:
            print(f"[비전 추출] {idx}페이지 {attempt}번째 실패: {e}")
            time.sleep(RETRY_DELAY * attempt)

    print(f"[비전 추출] {idx}페이지 최종 실패 - 빈 텍스트로 처리")
    return idx, "(텍스트 추출 실패)"


# ── PPTX → 이미지 변환 ──────────────────────
def pptx_to_images(file_bytes):
    with tempfile.TemporaryDirectory() as tmpdir:
        pptx_path = os.path.join(tmpdir, "input.pptx")
        pdf_path  = os.path.join(tmpdir, "input.pdf")

        with open(pptx_path, "wb") as f:
            f.write(file_bytes)

        subprocess.run(
            ["libreoffice", "--headless", "--convert-to", "pdf", "--outdir", tmpdir, pptx_path],
            capture_output=True, timeout=300
        )
        if not os.path.exists(pdf_path):
            raise RuntimeError("PPTX -> PDF 변환 실패")

        subprocess.run(
            ["pdftoppm", "-jpeg", "-r", "72", pdf_path, os.path.join(tmpdir, "slide")],
            capture_output=True, timeout=300
        )

        image_files = sorted(glob.glob(os.path.join(tmpdir, "slide-*.jpg")))
        return [open(f, "rb").read() for f in image_files]


# ── PDF 페이지별 텍스트 추출 ─────────────────
def extract_pdf_text(file_bytes):
    import pdfplumber
    pages = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for i, page in enumerate(pdf.pages, 1):
            text = (page.extract_text() or "").strip()
            pages.append((i, text if text else "(텍스트 없음)"))
    return pages


# ── PDF → 이미지 변환 (스캔 PDF용) ───────────
def pdf_to_images(file_bytes):
    with tempfile.TemporaryDirectory() as tmpdir:
        pdf_path = os.path.join(tmpdir, "input.pdf")
        with open(pdf_path, "wb") as f:
            f.write(file_bytes)
        subprocess.run(
            ["pdftoppm", "-jpeg", "-r", "72", pdf_path, os.path.join(tmpdir, "page")],
            capture_output=True, timeout=300
        )
        image_files = sorted(glob.glob(os.path.join(tmpdir, "page-*.jpg")))
        return [open(f, "rb").read() for f in image_files]


# ── PPTX / PDF 대본 생성 API ─────────────────
@app.route("/api/pptx-generate", methods=["POST"])
def pptx_generate():
    try:
        upload_file = request.files.get("pptx")
        duration    = int(request.form.get("duration", 5))
        audience    = request.form.get("audience", "일반 직장인")
        style       = request.form.get("style", "격식체")
        extra       = request.form.get("extra", "")

        if not upload_file:
            return jsonify({"error": "파일이 없습니다."}), 400

        filename   = upload_file.filename.lower()
        file_bytes = upload_file.read()
        is_pdf     = filename.endswith(".pdf")
        is_pptx    = filename.endswith(".pptx")

        if not is_pdf and not is_pptx:
            return jsonify({"error": ".pptx 또는 .pdf 파일만 업로드 가능합니다."}), 400

        slides     = []
        use_vision = False

        if is_pptx:
            # PPTX: python-pptx 시도 → 실패 시 비전
            try:
                slides = extract_pptx_text(file_bytes)
            except Exception:
                traceback.print_exc()

            has_content = any(text != "(텍스트 없음)" for _, text in slides)
            use_vision  = not has_content

            if use_vision:
                print("[비전 추출] PPTX 이미지 기반 → 병렬 텍스트 추출")
                images    = pptx_to_images(file_bytes)
                args_list = [(i + 1, img) for i, img in enumerate(images)]
                with ThreadPoolExecutor(max_workers=VISION_WORKERS) as executor:
                    results = list(executor.map(extract_text_from_image, args_list))
                slides = sorted(results, key=lambda x: x[0])

        elif is_pdf:
            # PDF: pdfplumber 시도 → 텍스트 없으면 비전
            try:
                slides = extract_pdf_text(file_bytes)
            except Exception:
                traceback.print_exc()

            has_content = any(text != "(텍스트 없음)" for _, text in slides)
            use_vision  = not has_content

            if use_vision:
                print("[비전 추출] PDF 스캔본 감지 → 이미지 변환 후 텍스트 추출")
                images    = pdf_to_images(file_bytes)
                args_list = [(i + 1, img) for i, img in enumerate(images)]
                with ThreadPoolExecutor(max_workers=VISION_WORKERS) as executor:
                    results = list(executor.map(extract_text_from_image, args_list))
                slides = sorted(results, key=lambda x: x[0])

        if not slides:
            return jsonify({"error": "내용을 읽을 수 없습니다."}), 400

        extracted_text = "\n".join(f"[{num}페이지]\n{text}" for num, text in slides)
        result, status = generate_script_by_slides(slides, duration, audience, style, extra)

        if status == 200:
            result["slide_count"]    = len(slides)
            result["extracted_text"] = extracted_text
            result["used_vision"]    = use_vision

        return jsonify(result), status

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── 발음 코칭용 파일 텍스트 추출 API ──────────
@app.route("/api/extract-script", methods=["POST"])
def extract_script():
    try:
        upload_file = request.files.get("file")
        if not upload_file:
            return jsonify({"error": "파일이 없습니다."}), 400

        filename   = upload_file.filename.lower()
        file_bytes = upload_file.read()

        if filename.endswith(".txt"):
            text = file_bytes.decode("utf-8", errors="ignore").strip()

        elif filename.endswith(".docx"):
            from docx import Document
            doc   = Document(io.BytesIO(file_bytes))
            text  = "\n".join(p.text for p in doc.paragraphs if p.text.strip())

        elif filename.endswith(".pdf"):
            import pdfplumber
            lines = []
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    t = page.extract_text()
                    if t:
                        lines.append(t.strip())
            text = "\n".join(lines)

        else:
            return jsonify({"error": ".txt .docx .pdf 파일만 지원합니다."}), 400

        if not text:
            return jsonify({"error": "파일에서 텍스트를 추출할 수 없습니다."}), 400

        return jsonify({"text": text}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── 대본 docx 다운로드 ────────────────────────
@app.route("/api/download-docx", methods=["POST"])
def download_docx():
    try:
        from docx import Document
        from flask import send_file

        data   = request.get_json()
        script = data.get("script", "").strip()
        title  = data.get("title", "발표대본")

        if not script:
            return jsonify({"error": "대본 내용이 없습니다."}), 400

        doc = Document()
        doc.add_heading(title, level=1)
        for line in script.split("\n"):
            doc.add_paragraph(line)

        buf = io.BytesIO()
        doc.save(buf)
        buf.seek(0)

        return send_file(
            buf,
            as_attachment=True,
            download_name=f"{title}.docx",
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── 대본 PDF 다운로드 (CIDFont 한글 지원) ────
@app.route("/api/download-pdf", methods=["POST"])
def download_pdf():
    try:
        from flask import send_file
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.cidfonts import UnicodeCIDFont
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas as rl_canvas

        data   = request.get_json()
        script = data.get("script", "").strip()
        title  = data.get("title", "발표대본")

        if not script:
            return jsonify({"error": "대본 내용이 없습니다."}), 400

        # 한글 CID 폰트 등록
        font_name = "HYSMyeongJo-Medium"
        pdfmetrics.registerFont(UnicodeCIDFont(font_name))

        W, H      = A4
        margin    = 50        # pt
        col_w     = W - margin * 2
        line_h    = 18
        font_sz   = 11
        title_sz  = 16

        buf = io.BytesIO()
        c   = rl_canvas.Canvas(buf, pagesize=A4)

        def start_page(is_first=False):
            c.setFont(font_name, font_sz)
            y = H - margin
            if is_first:
                # 제목
                c.setFont(font_name, title_sz)
                c.drawString(margin, y, title)
                c.setFont(font_name, font_sz)
                y -= title_sz + 16
            return y

        y = start_page(is_first=True)

        for para in script.split("\n"):
            if not para.strip():
                y -= line_h * 0.5
                if y < margin:
                    c.showPage()
                    y = start_page()
                continue

            # 글자 단위 줄바꿈
            line = ""
            for ch in para:
                if c.stringWidth(line + ch, font_name, font_sz) > col_w:
                    if y < margin + line_h:
                        c.showPage()
                        y = start_page()
                    c.drawString(margin, y, line)
                    y -= line_h
                    line = ch
                else:
                    line += ch

            if line:
                if y < margin + line_h:
                    c.showPage()
                    y = start_page()
                c.drawString(margin, y, line)
                y -= line_h

            y -= 4  # 단락 간격

        c.save()
        buf.seek(0)

        return send_file(
            buf,
            as_attachment=True,
            download_name=f"{title}.pdf",
            mimetype="application/pdf"
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── 표준국어대사전 발음 조회 (search → view 2단계) ──
def lookup_pronunciation(word):
    """
    1단계: search.do 로 target_code 획득
    2단계: view.do 로 pronunciation_info 조회
    실패하거나 발음 정보 없으면 None 반환
    """
    try:
        # 1단계: target_code 획득
        search_resp = requests.get(
            STDICT_SEARCH_URL,
            params={
                "key":      STDICT_API_KEY,
                "q":        word,
                "req_type": "json",
            },
            timeout=5,
        )
        if search_resp.status_code != 200:
            return None

        items = search_resp.json().get("channel", {}).get("item", [])
        if not items:
            return None

        target_code = items[0].get("target_code")
        if not target_code:
            return None

        # 2단계: view.do 로 발음 정보 조회
        view_resp = requests.get(
            STDICT_VIEW_URL,
            params={
                "certkey_no": STDICT_CERTKEY,
                "key":        STDICT_API_KEY,
                "type_search": "view",
                "req_type":   "json",
                "method":     "TARGET_CODE",
                "q":          target_code,
            },
            timeout=5,
        )
        if view_resp.status_code != 200:
            return None

        item = view_resp.json().get("channel", {}).get("item", {})
        pron_list = item.get("word_info", {}).get("pronunciation_info", [])
        if pron_list:
            return pron_list[0].get("pronunciation")

        return None

    except Exception as e:
        print(f"[사전 API] '{word}' 조회 실패: {e}")
        return None


# ── 발음 잡단 분석 API ──────────────────────────
@app.route("/api/analyze-pronunciation", methods=["POST"])
def analyze_pronunciation():
    import json, re
    try:
        data   = request.get_json()
        script = data.get("script", "").strip()
        if not script:
            return jsonify({"error": "대본 텍스트가 없습니다."}), 400

        # 1단계: CLOVA로 발음 주의 단어 목록 추출
        messages = [
            {
                "role": "system",
                "content": (
                    "당신은 한국어 발음 교육 전문가입니다. "
                    "발표 대본에서 실제로 발음이 표기와 다른 단어만 엄선하여 "
                    "JSON 배열로만 응답하세요. 설명 텍스트 없이 JSON만 출력하세요."
                )
            },
            {
                "role": "user",
                "content": f"""아래 발표 대본에서 발음 주의 단어를 찾아주세요.

[포함 기준 - 반드시 아래 조건을 모두 충족해야 함]
1. 반드시 대본에 실제로 등장하는 단어만 포함
2. 표기와 실제 발음이 반드시 달라야 함 (예: 국물→[궁물], 협력→[혐녁], 닫혀→[다쳐])
3. 연음·경음화·비음화·구개음화 등 음운 변동이 명확히 일어나는 단어
4. 외래어·전문용어 중 발음이 실제로 헷갈리기 쉬운 것

[제외 기준 - 아래 해당하면 절대 포함하지 말 것]
- 표기와 발음이 동일한 단어 (예: 추세→[추세], 인식→[인식] 제외)
- 단순히 어렵거나 긴 단어라도 발음 변동이 없으면 제외
- 발음 변동이 확실하지 않으면 제외

반드시 아래 JSON 형식으로만 응답 (다른 텍스트 절대 금지):
[
  {{"word": "단어", "pronunciation": "[발음]", "reason": "구체적 음운 변동 규칙"}},
  ...
]

대본:
{script[:3000]}"""
            }
        ]

        clova_resp, status = call_clova_once(messages, max_tokens=1000)
        if status != 200:
            return jsonify({"error": "CLOVA 분석 실패"}), status

        raw        = clova_resp["result"]["message"]["content"].strip()
        json_match = re.search(r'\[.*\]', raw, re.DOTALL)
        if not json_match:
            return jsonify({"error": "분석 결과 파싱 실패", "raw": raw}), 500

        clova_words = json.loads(json_match.group())

        # 2단계: 표준국어대사전 API로 공식 발음 조회 (있으면 덮어씀)
        highlights = []
        seen_words = set()  # 중복 단어 제거용

        for item in clova_words:
            word       = item.get("word", "").strip()
            clova_pron = item.get("pronunciation", "").strip()
            reason     = item.get("reason", "")

            # ── 필터 1: 빈 단어 / 중복 제거
            if not word or word in seen_words:
                continue
            seen_words.add(word)

            # ── 필터 2: 대본에 실제로 등장하는지 확인 (0회 등장 제거)
            positions, start = [], 0
            while True:
                idx = script.find(word, start)
                if idx == -1:
                    break
                positions.append({"start": idx, "end": idx + len(word)})
                start = idx + len(word)

            if not positions:
                print(f"[발음 분석] '{word}' 대본에 없음 → 제외")
                continue

            # ── 표준국어대사전으로 공식 발음 조회
            official = lookup_pronunciation(word)

            if official:
                pron   = f"[{official}]"
                source = "표준국어대사전"
                # ── 필터 3: 사전 발음과 표기가 동일하면 제거
                if official == word:
                    print(f"[발음 분석] '{word}' 발음 동일 → 제외")
                    continue
            else:
                pron   = clova_pron
                source = "AI 분석"
                # ── 필터 3: CLOVA 발음과 표기가 동일하면 제거
                # 괄호 제거 후 비교 (예: [인식] → 인식)
                pron_clean = clova_pron.strip("[]").strip()
                if pron_clean == word:
                    print(f"[발음 분석] '{word}' AI 발음 동일 → 제외")
                    continue

            highlights.append({
                "word":          word,
                "pronunciation": pron,
                "reason":        reason,
                "source":        source,
                "positions":     positions,
            })

        return jsonify({"highlights": highlights, "word_count": len(highlights)}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
