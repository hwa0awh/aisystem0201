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
ETRI_API_KEY  = "YOUR_ETRI_API_KEY"
CLOVA_API_KEY = "YOUR_CLOVA_API_KEY"
# =============================================

ETRI_URL_KOR  = "http://epretx.etri.re.kr:8000/api/WiseASR_PronunciationKor"
ETRI_URL_ENG  = "http://epretx.etri.re.kr:8000/api/WiseASR_Pronunciation"
CLOVA_URL     = "https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-005"
CLOVA_URL_VIS = "https://clovastudio.stream.ntruss.com/v1/openai/chat/completions"  # OpenAI 호환

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


# ── PPTX 대본 생성 API ──────────────────────
@app.route("/api/pptx-generate", methods=["POST"])
def pptx_generate():
    try:
        pptx_file = request.files.get("pptx")
        duration  = int(request.form.get("duration", 5))
        audience  = request.form.get("audience", "일반 직장인")
        style     = request.form.get("style", "격식체")
        extra     = request.form.get("extra", "")

        if not pptx_file:
            return jsonify({"error": "PPTX 파일이 없습니다."}), 400
        if not pptx_file.filename.lower().endswith(".pptx"):
            return jsonify({"error": ".pptx 파일만 업로드 가능합니다."}), 400

        file_bytes = pptx_file.read()

        # 1단계: python-pptx로 텍스트 추출
        slides = []
        try:
            slides = extract_pptx_text(file_bytes)
        except Exception:
            traceback.print_exc()

        # 2단계: 텍스트 없으면 비전 AI로 병렬 추출
        has_content = any(text != "(텍스트 없음)" for _, text in slides)
        use_vision  = not has_content

        if use_vision:
            print("[비전 추출] 이미지 기반 슬라이드 감지 → 병렬 텍스트 추출 시작")
            images    = pptx_to_images(file_bytes)
            args_list = [(i + 1, img) for i, img in enumerate(images)]

            # VISION_WORKERS개씩 병렬 처리 (순서 보장)
            with ThreadPoolExecutor(max_workers=VISION_WORKERS) as executor:
                results = list(executor.map(extract_text_from_image, args_list))

            # 순서 정렬 후 slides 구성
            slides = sorted(results, key=lambda x: x[0])
            print(f"[비전 추출] 전체 {len(slides)}장 완료")

        if not slides:
            return jsonify({"error": "슬라이드 내용을 읽을 수 없습니다."}), 400

        extracted_text = "\n".join(
            f"[{num}페이지]\n{text}" for num, text in slides
        )

        # 3단계: 슬라이드별 대본 생성
        result, status = generate_script_by_slides(slides, duration, audience, style, extra)

        if status == 200:
            result["slide_count"]    = len(slides)
            result["extracted_text"] = extracted_text
            result["used_vision"]    = use_vision

        return jsonify(result), status

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
