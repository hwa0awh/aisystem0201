# -*- coding: utf-8 -*-
"""
Flask 백엔드 서버
- /api/pronunciation  : CLOVA Speech (NAVER) 발음평가 API
- /api/generate       : CLOVA Studio 발표 대본 생성 (분할 생성)
- /api/pptx-generate  : PPTX -> 슬라이드별 대본 생성 (병렬 처리 + 재시도)
"""

from flask import Flask, request, jsonify, send_from_directory
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
import base64
import os
import io
import re
import random
import subprocess
import tempfile
import glob
import traceback
import time
import bcrypt
import firebase_admin
from firebase_admin import credentials, firestore
from flask_swagger_ui import get_swaggerui_blueprint
from flask_cors import CORS
import json
from datetime import datetime, timezone, timedelta
import jwt as pyjwt

app = Flask(__name__, static_folder="static", static_url_path="")
CORS(app)  # 전체 CORS 허용

# ── Firestore 초기화 ──────────────────────────────────────────────────────
_FIRESTORE_KEY_PATH = os.environ.get("FIRESTORE_KEY", os.path.join(os.path.dirname(__file__), "firestore_key.json"))
if not firebase_admin._apps:
    _cred = credentials.Certificate(_FIRESTORE_KEY_PATH)
    firebase_admin.initialize_app(_cred)
db = firestore.client()

# ── Swagger UI 설정 ───────────────────────────────────────────────────────
SWAGGER_URL  = "/api/docs"
API_SPEC_URL = "/api/swagger.json"
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL, API_SPEC_URL,
    config={"app_name": "SKOACH API"}
)
app.register_blueprint(swaggerui_blueprint)

@app.route(API_SPEC_URL)
def swagger_spec():
    spec = {
        "openapi": "3.0.0",
        "info": {
            "title":       "SKOACH API",
            "description": "발표 코칭 서비스 SKOACH 백엔드 API",
            "version":     "1.0.0",
        },
        "servers": [{"url": "/"}],
        "tags": [
            {"name": "auth",          "description": "인증 (로그인/로그아웃)"},
            {"name": "users",         "description": "사용자 관리"},
            {"name": "script",        "description": "대본 생성"},
            {"name": "pronunciation", "description": "발음 분석"},
        ],
        "paths": {
            "/api/users": {
                "post": {
                    "tags":    ["users"],
                    "summary": "회원가입",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": ["name", "email", "password"],
                                    "properties": {
                                        "name":     {"type": "string", "example": "홍길동"},
                                        "email":    {"type": "string", "example": "hong@example.com"},
                                        "password": {"type": "string", "example": "password123"},
                                    },
                                }
                            }
                        },
                    },
                    "responses": {
                        "201": {"description": "회원가입 성공"},
                        "400": {"description": "입력값 오류 또는 이메일 중복"},
                        "500": {"description": "서버 오류"},
                    },
                },
                "get": {
                    "tags":    ["users"],
                    "summary": "전체 사용자 목록 조회",
                    "responses": {
                        "200": {"description": "사용자 목록 반환"},
                        "500": {"description": "서버 오류"},
                    },
                },
            },
            "/api/auth/login": {
                "post": {
                    "tags":    ["auth"],
                    "summary": "로그인 (구버전, /v1/auth/signin 권장)",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": ["email", "password"],
                                    "properties": {
                                        "email":    {"type": "string", "example": "hong@test.com"},
                                        "password": {"type": "string", "example": "test123"},
                                    },
                                }
                            }
                        },
                    },
                    "responses": {
                        "201": {"description": "로그인 성공, accessToken + refreshToken 반환"},
                        "401": {"description": "이메일 또는 비밀번호 불일치"},
                        "500": {"description": "서버 오류"},
                    },
                },
            },
            "/v1/auth/signin": {
                "post": {
                    "tags":    ["auth"],
                    "summary": "로그인",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": ["email", "password"],
                                    "properties": {
                                        "email":    {"type": "string", "example": "dydals3440@gmail.com"},
                                        "password": {"type": "string", "example": "Smu123!!"},
                                    },
                                },
                                "example": {
                                    "email":    "dydals3440@gmail.com",
                                    "password": "Smu123!!",
                                }
                            }
                        },
                    },
                    "responses": {
                        "201": {
                            "description": "로그인 성공",
                            "content": {
                                "application/json": {
                                    "example": {
                                        "status":     True,
                                        "statusCode": 201,
                                        "message":    "요청이 성공했습니다.",
                                        "data": {
                                            "id":           "20",
                                            "name":         "메두",
                                            "accessToken":  "eyJhbGci...",
                                            "refreshToken": "eyJhbGci...",
                                        }
                                    }
                                }
                            }
                        },
                        "400": {"description": "필수 파라미터 누락"},
                        "401": {"description": "이메일 또는 비밀번호 불일치"},
                        "500": {"description": "서버 오류"},
                    },
                },
            },
            "/api/auth/logout": {
                "post": {
                    "tags":    ["auth"],
                    "summary": "로그아웃",
                    "responses": {
                        "200": {"description": "로그아웃 성공"},
                    },
                },
            },
            "/api/users/{user_id}": {
                "get": {
                    "tags":    ["users"],
                    "summary": "사용자 단건 조회",
                    "parameters": [{"name": "user_id", "in": "path", "required": True, "schema": {"type": "string"}}],
                    "responses": {
                        "200": {"description": "사용자 정보 반환"},
                        "404": {"description": "사용자 없음"},
                        "500": {"description": "서버 오류"},
                    },
                },
                "delete": {
                    "tags":    ["users"],
                    "summary": "사용자 삭제",
                    "parameters": [{"name": "user_id", "in": "path", "required": True, "schema": {"type": "string"}}],
                    "responses": {
                        "200": {"description": "삭제 성공"},
                        "404": {"description": "사용자 없음"},
                        "500": {"description": "서버 오류"},
                    },
                },
            },
        },
    }
    return jsonify(spec)


# =============================================
# 설정값 (여기만 수정하세요)
# =============================================
CLOVA_API_KEY        = "nv-31a142f72d024115a79e993fba44ac26DTxx"
CLOVA_SPEECH_DOMAIN = "skoach"                        # CLOVA Speech 도메인 코드
CLOVA_SPEECH_SECRET = "f3d3b9adaab44e66881e4ee2f652819e"     # CLOVA Speech Secret (도메인 상세에서 확인)
CLOVA_SPEECH_INVOKE = "https://clovaspeech-gw.ncloud.com/external/v1/15521/2860e628e44e9f35b5fd996993397d57aa07df249c1d2526bb5d3efdeb26f7dc" # Invoke URL (도메인 상세에서 확인)
STDICT_API_KEY      = "53FD912F69F9E78B5A55C70B7C8C5BFF"   # 표준국어대사전 OpenAPI 키
# =============================================
CLOVA_URL     = "https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-005"
CLOVA_URL_VIS = "https://clovastudio.stream.ntruss.com/v1/openai/chat/completions"  # OpenAI 호환
STDICT_SEARCH_URL = "https://stdict.korean.go.kr/api/search.do"
STDICT_VIEW_URL   = "https://stdict.korean.go.kr/api/view.do"
STDICT_CERTKEY    = "9051"   # 표준국어대사전 고정 certkey_no
JWT_SECRET        = os.environ.get("JWT_SECRET", "skoach-secret-key-change-in-production")
JWT_EXPIRE_HOURS  = 24        # 토큰 만료 시간 (시간 단위)

MAX_TOKENS_PER_CALL = 4096
SLIDES_PER_CHUNK    = 5   # 대본 생성 시 한 번에 처리할 슬라이드 수
VISION_WORKERS      = 3   # 비전 AI 병렬 호출 수 (API 제한 고려)
MAX_RETRY           = 3   # 실패 시 재시도 횟수
RETRY_DELAY         = 2   # 재시도 대기 시간 (초)


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def index(path):
    # API 요청은 제외
    if path.startswith("api/"):
        from flask import abort
        abort(404)
    # 실제 static 파일이 있으면 그대로 서빙
    static_file = os.path.join(app.static_folder, path)
    if path and os.path.exists(static_file):
        return send_from_directory(app.static_folder, path)
    # 나머지는 모두 index.html (React Router가 처리)
    return send_from_directory(app.static_folder, "index.html")


# ── 발음평가 (CLOVA Speech 장문 인식) ────────
@app.route("/api/pronunciation", methods=["POST"])
def pronunciation():
    try:
        language   = request.form.get("language", "korean")
        script     = request.form.get("script", "")
        audio_file = request.files.get("audio")

        if not audio_file:
            return jsonify({"error": "음성 파일이 없습니다."}), 400

        audio_bytes = audio_file.read()
        filename    = audio_file.filename.lower()

        # 확장자 → CLOVA Speech format 매핑
        ext_format_map = {
            ".wav":  "WAV",
            ".mp3":  "MP3",
            ".m4a":  "M4A",
            ".aac":  "AAC",
            ".ogg":  "OGG",
            ".webm": "WEBM",
            ".flac": "FLAC",
        }
        ext        = os.path.splitext(filename)[1].lower()
        audio_fmt  = ext_format_map.get(ext, "WAV")
        lang_code  = "ko-KR" if language == "korean" else "en-US"

        # 장문 인식: Invoke URL + /recognizer/upload (multipart)
        invoke_url = CLOVA_SPEECH_INVOKE.rstrip("/")
        url        = f"{invoke_url}/recognizer/upload"

        # 요청 파라미터 JSON (CLOVA Speech 공식 파라미터)
        import json as _json
        params = _json.dumps({
            "language":   lang_code,
            "completion": "sync",
        })

        resp = requests.post(
            url,
            headers={
                "X-CLOVASPEECH-API-KEY": CLOVA_SPEECH_SECRET,
            },
            files={
                "media":  (audio_file.filename, audio_bytes, "application/octet-stream"),
                "params": (None, params, "application/json"),
            },
            timeout=120,
        )

        print(f"[CLOVA Speech 응답] {resp.status_code}: {resp.text[:300]}")

        if resp.status_code != 200:
            return jsonify({
                "error":  f"CLOVA Speech 오류: {resp.status_code}",
                "detail": resp.text,
            }), resp.status_code

        clova_result    = resp.json()
        recognized_text = clova_result.get("text", "")

        # 대본과 비교해 유사도 점수 계산
        score = None
        if script and recognized_text:
            score = _calc_similarity_score(script, recognized_text)

        return jsonify({
            "return_object": {
                "recognized": recognized_text,
                "score":      score,
            },
            "clova_raw": clova_result,
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


def _calc_similarity_score(script: str, recognized: str) -> float:
    """
    대본과 인식된 텍스트를 단어 단위로 비교해 1~5점 점수 반환.
    """
    import unicodedata

    def normalize(text):
        text = unicodedata.normalize("NFC", text)
        text = re.sub(r"[^\w\s]", "", text, flags=re.UNICODE)
        return text.lower().split()

    s_words = normalize(script)
    r_words = normalize(recognized)

    if not s_words:
        return None

    matched = sum(1 for w in s_words if w in r_words)
    ratio   = matched / len(s_words)

    if ratio >= 0.90:
        return 5
    elif ratio >= 0.75:
        return 4
    elif ratio >= 0.55:
        return 3
    elif ratio >= 0.35:
        return 2
    else:
        return 1


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


def strip_markdown(text: str) -> str:
    import re as _re
    text = _re.sub(r"[*]{2}(.+?)[*]{2}", r"\1", text)
    text = _re.sub(r"__(.+?)__", r"\1", text)
    text = _re.sub(r"(?<![*])[*](?![*])(.+?)(?<![*])[*](?![*])", r"\1", text)
    text = _re.sub(r"(?<!_)_(?!_)(.+?)(?<!_)_(?!_)", r"\1", text)
    text = _re.sub(r"^#{1,6}\s+", "", text, flags=_re.MULTILINE)
    text = _re.sub(r"^\s*[-*]\s+", "", text, flags=_re.MULTILINE)
    text = _re.sub(r"^\s*\d+\.\s+", "", text, flags=_re.MULTILINE)
    return text.strip()


def generate_script_chunked(base_info, parts, style_info):
    full_script = ""
    total_prompt_tokens = 0
    total_completion_tokens = 0

    system_msg = {
        "role": "system",
        "content": "당신은 전문 발표 대본 작가입니다. 지시한 파트만 작성하고 다른 파트는 절대 작성하지 마세요.\n절대 마크다운 문법(**굵게**, *기울임*, # 제목, - 목록 등)을 사용하지 마세요. 순수 텍스트로만 작성하세요."
    }

    for part in parts:
        context = f"\n\n[지금까지 작성된 내용]\n{full_script}" if full_script else ""

        name_instruction = ""
        if part == "서론":
            korean_names = [
                "김민준", "이서연", "박지호", "최수아", "정우진",
                "강하은", "조민서", "윤도현", "임채원", "한지우",
                "오세훈", "신예린", "권태양", "문소희", "배준혁"
            ]
            random_name = random.choice(korean_names)
            name_instruction = f"\n- 발표자 이름은 반드시 '{random_name}'으로 하세요. AI나 시스템 이름(CLOVA, GPT 등)은 절대 사용하지 마세요."

        prompt = f"""{base_info}{style_info}{context}

[지시]
지금 반드시 [{part}] 파트만 작성하세요. 다른 파트는 작성하지 마세요.
파트 시작은 반드시 [{part}]로 표시하세요.
자연스러운 구어체로 충분히 길게 작성하세요.{name_instruction}\n마크다운 문법(**굵게**, *기울임*, # 제목 등)은 절대 사용하지 마세요. 순수 텍스트만 사용하세요."""

        data, status = call_clova_once([system_msg, {"role": "user", "content": prompt}])

        if status != 200:
            return {"error": f"{part} 생성 실패"}, status

        part_text = strip_markdown(data["result"]["message"]["content"].strip())
        usage = data["result"]["usage"]
        total_prompt_tokens     += usage["promptTokens"]
        total_completion_tokens += usage["completionTokens"]
        # 파트 태그가 없으면 강제로 추가
        if not part_text.startswith(f"[{part}]"):
            part_text = f"[{part}]\n\n" + part_text
        full_script += "\n\n" + part_text

    return {
        "script": full_script.strip(),
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
            "당신은 대학생 팀 발표를 위한 전문 대본 작가입니다.\n"
            "아래의 말투 원칙을 반드시 지켜 실제 사람이 발표하는 것처럼 자연스러운 구어체 대본을 작성하세요.\n\n"
            "[말투 원칙]\n"
            "1. 호흡 단위로 쉼표 삽입: 긴 문장은 의미 단위마다 쉼표(,)로 끊어 발표자가 숨을 쉴 수 있게 작성하세요.\n"
            "   예) '저희는, 실제 발표 경험이 있는 대학생들을 대상으로 인터뷰를 진행했습니다.'\n"
            "2. 슬라이드 전환 시 청중에게 질문을 던지는 형식으로 자연스럽게 넘어가세요.\n"
            "   예) '그렇다면 이러한 서비스는 어떤 구조로 구현되었을까요?'\n"
            "   예) '지금부터 저희 서비스의 전체 시스템 구조에 대해 설명드리겠습니다.'\n"
            "3. 중요한 메시지는 짧은 단문으로 분리해 임팩트를 주세요.\n"
            "   예) '즉, 저희는 단순히 대본만 생성하는 것이 아니라,\\n실제 발표 연습 과정까지 함께 지원합니다.'\n"
            "4. 열거 항목은 먼저 전체 구성을 예고한 뒤 '첫 번째는 ~', '두 번째는 ~', '마지막으로 ~' 형식으로 나열하세요.\n"
            "   예) '발표 순서는 다음과 같습니다. 먼저 ~ 설명드리고, 이후 ~ 소개하겠습니다.'\n"
            "5. 주어는 '저희는', '저희 서비스는'으로 통일하세요. '본 발표에서는' 같은 문어체 주어는 절대 금지.\n"
            "6. 문장 끝은 반드시 '~하겠습니다', '~하였습니다', '~드리겠습니다', '~있습니다'로 마무리하세요.\n"
            "   '~이에요', '~해요' 등 비격식 종결어미는 사용하지 마세요.\n"
            "7. 문어체·보고서체 표현 금지:\n"
            "   '본 발표에서는 ~을 살펴보겠습니다' → '오늘은 ~에 대해 말씀드리겠습니다'\n"
            "   '~임을 알 수 있다' → '~라는 것을 확인할 수 있었습니다'\n"
            "   '~하여야 한다' → '~해야 합니다'\n"
            "   '~을 제안한다' → '~을 제안드립니다'\n\n"
            "반드시 아래 두 가지 원칙을 최우선으로 지키세요.\n"
            "첫째, 슬라이드에 있는 내용만 사용하세요. 슬라이드에 없는 사실, 수치, 예시, 이름은 절대 추가하지 마세요.\n"
            "둘째, 위 말투 원칙에 따라 실제 사람이 청중 앞에서 말하는 것처럼 자연스러운 구어체로 작성하세요.\n"
            "전체 발표의 흐름과 통일성을 유지하면서 지시한 슬라이드 페이지의 대본만 작성하세요.\n"
            "셋째, **굵게**, *기울임*, # 제목, - 목록 등 마크다운 문법을 절대 사용하지 마세요. 순수 텍스트로만 작성하세요.\n"
            "넷째, 각 페이지 시작은 반드시 [N페이지] 형식으로 표시하고, 페이지 간 빈 줄 하나로 구분하세요. 절대 생략하거나 합치지 마세요."
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
2. ★★★ 페이지 구분 (절대 원칙)\n   - 반드시 각 페이지 시작에 [{start_num}페이지], [{start_num + 1}페이지] 형태로 페이지 번호를 표시하세요.\n   - 페이지 번호는 절대 생략하거나 합치지 마세요.\n   - 각 페이지 대본은 빈 줄 하나로 구분하세요.\n   - 예시 형식:\n     [{start_num}페이지]\n     (대본 내용)\n\n     [{start_num + 1}페이지]\n     (대본 내용)

3. ★★ 슬라이드 내용 준수 (절대 원칙)
   - 슬라이드에 명시된 텍스트, 수치, 키워드만 사용하세요.
   - 슬라이드에 없는 사실, 수치, 예시, 이름, 기능을 절대 추가하지 마세요.
   - 슬라이드 내용이 부족하더라도 임의로 내용을 보충하거나 창작하지 마세요.
   - 위반 예시(절대 금지): 슬라이드에 없는 "예를 들어 A사는 ~", "연구에 따르면 ~", "최근 ~% 증가" 등

4. ★★ 구어체 사용 (절대 원칙)
   - 실제 사람이 청중 앞에서 말하듯 자연스러운 구어체로 작성하세요.
   - 쉼표(,)로 호흡을 나눠 발표자가 읽기 편하게 작성하세요.
     예) '저희는, 실제 발표 경험이 있는 대학생들을 대상으로 인터뷰를 진행했습니다.'
   - 슬라이드 전환 시 청중에게 질문을 던지는 형식으로 연결하세요.
     예) '그렇다면 ~는 어떤 구조로 구현되었을까요?'
   - 열거 항목은 '첫 번째는 ~', '두 번째는 ~', '마지막으로 ~' 형식으로 작성하세요.
   - 주어는 '저희는', '저희 서비스는'으로 통일하세요. '본 발표에서는' 등 문어체 주어 절대 금지.
   - 문장 끝은 '~하겠습니다', '~하였습니다', '~드리겠습니다'로 마무리하세요.
   - 문어체·보고서체 표현을 구어체로 바꾸세요.
     · '본 발표에서는 ~을 살펴보겠습니다' → '오늘은 ~에 대해 말씀드리겠습니다'
     · '~임을 알 수 있다' → '~라는 것을 확인할 수 있었습니다'
     · '~하여야 한다' → '~해야 합니다'
     · '~에 대한 고찰이 필요하다' → '~에 대해 한번 생각해볼 필요가 있습니다'
   - 짧고 끊어지는 문장을 활용하세요. 한 문장이 너무 길어지지 않도록 하세요.

5. 슬라이드 내용을 그대로 읽지 말고 핵심만 골라 말하듯 풀어서 설명
6. 이전 내용과 자연스럽게 이어지는 전환 문장으로 시작{"(첫 페이지이므로 인사말로 시작)" if is_first else ""}
7. {"마지막 파트이므로 발표를 마무리하는 클로징 멘트로 끝내기" if is_last else "다음 슬라이드로 넘어가는 전환 문장으로 끝내기"}
8. 전체 발표와 동일한 톤과 스타일 유지
9. 각 페이지를 약 {secs_per_slide:.0f}초 분량으로 충분히 작성\n10. ★ 마크다운 문법 절대 금지: **굵게**, *기울임*, # 제목, - 목록 등 사용 금지. 순수 텍스트로만 작성"""

        data, status = call_clova_once([system_msg, {"role": "user", "content": prompt}])

        if status != 200:
            return {"error": f"{start_num}~{end_num}페이지 생성 실패"}, status

        chunk_script = strip_markdown(data["result"]["message"]["content"].strip())
        usage = data["result"]["usage"]
        total_prompt_tokens     += usage["promptTokens"]
        total_completion_tokens += usage["completionTokens"]
        # 첫 페이지 태그가 없으면 강제 추가
        if not re.search(rf'\[{start_num}페이지\]', chunk_script):
            chunk_script = f"[{start_num}페이지]\n\n" + chunk_script
        full_script += "\n\n" + chunk_script

        # 다음 청크 연결을 위해 마지막 2문장 저장
        sentences = [s.strip() for s in chunk_script.replace("\n", " ").split(".") if s.strip()]
        last_chunk_tail = ". ".join(sentences[-2:]) + "." if len(sentences) >= 2 else chunk_script[-200:]

        print(f"[대본 생성] {start_num}~{end_num}페이지 완료 ({chunk_idx+1}/{len(chunks)})")

    # ── 생성 완료 후 검증 단계 ─────────────────────────────
    print("[대본 검증] 이상 내용 검증 시작...")
    verified_script, warnings = verify_script(full_script.strip(), slides)
    print(f"[대본 검증] 완료 - 경고 {len(warnings)}건")

    return {
        "script": verified_script,
        "result": {
            "message": {"role": "assistant", "content": verified_script},
            "finishReason": "stop",
            "usage": {
                "promptTokens":     total_prompt_tokens,
                "completionTokens": total_completion_tokens,
                "totalTokens":      total_prompt_tokens + total_completion_tokens,
            }
        },
        "warnings": warnings,
    }, 200


# ── 대본 검증 함수 ───────────────────────────
def verify_script(script: str, slides: list) -> tuple:
    """
    생성된 대본을 CLOVA AI로 검증.
    슬라이드 원문과 대조해 임의 내용·수치·문어체 등 문제 항목을 찾아
    자동 수정된 대본과 경고 목록을 반환.
    """
    # 슬라이드 전체 원문 합산 (검증 컨텍스트용, 최대 3000자)
    slide_source = "\n".join(f"[{num}페이지] {text}" for num, text in slides)
    slide_source = slide_source[:3000]

    verify_prompt = f"""아래는 PPT 슬라이드를 바탕으로 생성된 발표 대본입니다.
슬라이드 원문과 대본을 꼼꼼히 비교하여 문제가 있는 부분을 찾아주세요.

[슬라이드 원문]
{slide_source}

[생성된 대본]
{script[:4000]}

[검증 기준]
1. 슬라이드에 없는 수치, 통계, 퍼센트(%) 가 대본에 등장하는가?
2. 슬라이드에 없는 기업명, 인물명, 브랜드명이 등장하는가?
3. 슬라이드에 없는 사례, 연구결과, 인용구가 등장하는가?
4. 문어체·보고서체 표현이 남아있는가? (예: "~임을 알 수 있다", "본 발표에서는", "~하여야 한다")
5. 슬라이드 내용과 반대되거나 모순되는 내용이 있는가?

[응답 형식 - 반드시 아래 형식으로만 응답]
문제없음: (문제가 전혀 없으면 이 한 줄만 작성)

또는 문제가 있으면:
경고1: [페이지] / [문제유형] / [해당 문장] / [수정 제안]
경고2: [페이지] / [문제유형] / [해당 문장] / [수정 제안]
...
(최대 10개까지만 작성)"""

    try:
        verify_system = {
            "role": "system",
            "content": "당신은 발표 대본 품질 검수 전문가입니다. 슬라이드 원문에 없는 내용이 대본에 포함되었는지 정확하게 검증합니다."
        }
        data, status = call_clova_once(
            [verify_system, {"role": "user", "content": verify_prompt}],
            max_tokens=800
        )

        if status != 200:
            print(f"[대본 검증] API 호출 실패: {status}")
            return script, []

        raw = data["result"]["message"]["content"].strip()
        print(f"[대본 검증] 결과:\n{raw}")

        # "문제없음" 이면 경고 없이 반환
        if raw.startswith("문제없음"):
            return script, []

        # 경고 파싱
        warnings = []
        for line in raw.splitlines():
            line = line.strip()
            if not line or not line.startswith("경고"):
                continue
            # "경고N: [페이지] / [유형] / [문장] / [수정]" 파싱
            parts = line.split(":", 1)[-1].strip().split(" / ")
            if len(parts) >= 3:
                warnings.append({
                    "page":       parts[0].strip() if len(parts) > 0 else "",
                    "type":       parts[1].strip() if len(parts) > 1 else "",
                    "sentence":   parts[2].strip() if len(parts) > 2 else "",
                    "suggestion": parts[3].strip() if len(parts) > 3 else "",
                })

        return script, warnings

    except Exception as e:
        print(f"[대본 검증] 예외 발생: {e}")
        return script, []


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

        # ── 수정 모드 감지 ──────────────────────────────────────
        is_edit_mode = "[현재 대본]" in topic or "[전체 대본]" in topic

        if is_edit_mode:
            # 전체 대본 추출
            script_match = re.search(r'\[현재 대본\]\n([\s\S]+)', topic)
            if not script_match:
                script_match = re.search(r'\[전체 대본\]\n([\s\S]+?)(?=\n\[지시사항\]|$)', topic)
            full_script = script_match.group(1).strip() if script_match else ""

            # 수정 요청 추출
            request_match = re.search(r'\[수정 요청\]\n([\s\S]+?)(?=\n\[|$)', topic)
            request_msg = request_match.group(1).strip() if request_match else topic

            # 1순위: 요청에 파트 키워드 명시 ([서론], [본론1], [1페이지] 등)
            part_match = re.search(r'\[(서론|본론\d*|결론|\d+페이지)\]', request_msg)

            if part_match and full_script:
                part = part_match.group(0)
                print(f"[수정 모드] {part} 파트 명시 수정: {request_msg}")
            else:
                # 2순위: 요청 내용으로 파트 추론
                infer_map = {
                    "결론": ["마지막", "끝", "인사", "클로징", "마무리", "결론", "클로즈"],
                    "서론": ["처음", "시작", "도입", "인트로", "첫", "서론", "오프닝"],
                    "본론": ["중간", "내용", "본론"],
                }
                part = None
                for part_key, keywords in infer_map.items():
                    if any(kw in request_msg for kw in keywords):
                        part_match2 = re.search(rf'\[({part_key}\d*)\]|\[(\d+페이지)\]', full_script)
                        if part_match2:
                            part = part_match2.group(0)
                            break

                if part:
                    print(f"[수정 모드] {part} 파트 추론 수정: {request_msg}")

            if part and full_script:
                # 페이지 형식([1페이지])이면 전체 대본에서 해당 페이지만 수정 후 전체 반환
                is_page_format = bool(re.search(r'\[\d+페이지\]', full_script))

                if is_page_format:
                    # 페이지 형식도 파트 내용만 반환 (프론트 replacePart가 교체)
                    messages = [
                        {
                            "role": "system",
                            "content": "당신은 발표 대본 수정 전문가입니다. 요청한 페이지만 수정하고 해당 페이지 내용만 출력하세요. 다른 페이지는 절대 출력하지 마세요."
                        },
                        {
                            "role": "user",
                            "content": f"""아래 발표 대본에서 {part} 내용만 수정 요청에 맞게 수정해줘.

[수정 요청]
{request_msg}

[전체 대본]
{full_script}

[지시사항]
- 반드시 {part} 내용만 새로 작성
- 페이지 시작은 반드시 {part}로 표시
- 다른 페이지는 절대 포함하지 말 것
- {part} 내용만 출력"""
                        }
                    ]
                    data_resp, status = call_clova_once(messages, max_tokens=2048)
                    if status != 200:
                        return jsonify({"error": "파트 수정 실패"}), status
                    new_part = data_resp["result"]["message"]["content"].strip()
                    return jsonify({
                        "result": {
                            "message": {"role": "assistant", "content": new_part},
                            "finishReason": "stop",
                            "usage": data_resp["result"]["usage"]
                        }
                    }), 200
                else:
                    # 서론/본론/결론 형식 - 파트만 반환 (프론트에서 replacePart 처리)
                    messages = [
                        {
                            "role": "system",
                            "content": "당신은 발표 대본 수정 전문가입니다. 요청한 파트만 수정하고 해당 파트 내용만 출력하세요. 다른 파트는 절대 출력하지 마세요."
                        },
                        {
                            "role": "user",
                            "content": f"""아래 발표 대본에서 {part} 파트만 수정 요청에 맞게 수정해줘.

[수정 요청]
{request_msg}

[전체 대본]
{full_script}

[지시사항]
- 반드시 {part} 파트 내용만 새로 작성
- 파트 시작은 반드시 {part}로 표시
- 다른 파트는 절대 포함하지 말 것
- 전체 대본의 흐름과 톤 유지
- {part} 내용만 출력"""
                        }
                    ]
                    data_resp, status = call_clova_once(messages, max_tokens=2048)
                    if status != 200:
                        return jsonify({"error": "파트 수정 실패"}), status

                    new_part = data_resp["result"]["message"]["content"].strip()
                    return jsonify({
                        "result": {
                            "message": {"role": "assistant", "content": new_part},
                            "finishReason": "stop",
                            "usage": data_resp["result"]["usage"]
                        }
                    }), 200

            else:
                # 전체 수정
                print(f"[수정 모드] 전체 수정: {request_msg}")
                messages = [
                    {
                        "role": "system",
                        "content": "당신은 발표 대본 수정 전문가입니다. 수정 요청에 맞게 대본을 수정하세요. 파트 구조([서론], [본론1] 등)는 유지하세요."
                    },
                    {"role": "user", "content": topic}
                ]
                data_resp, status = call_clova_once(messages, max_tokens=4096)
                if status != 200:
                    return jsonify({"error": "수정 실패"}), status
                return jsonify(data_resp), status

        # ── 신규 대본 생성 ──────────────────────────────────────
        print(f"[생성 모드] 주제: {topic[:50]}")
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

    # shape_type 상수
    # 13 = Picture, 6 = Group, 14 = OLE Object(embedded image 포함)
    # 16 = Media (동영상/오디오)
    IMAGE_SHAPE_TYPES = {13, 14}
    MEDIA_SHAPE_TYPES = {16}  # MSO_SHAPE_TYPE.MEDIA

    prs    = Presentation(io.BytesIO(file_bytes))
    slides = []

    for i, slide in enumerate(prs.slides, 1):
        slide_texts  = []
        has_image    = False   # 이미지/그림 shape 포함 여부
        has_video    = False   # 동영상 shape 포함 여부

        def collect_texts(shape):
            nonlocal has_image, has_video
            if shape.shape_type in IMAGE_SHAPE_TYPES:
                has_image = True
            # shape_type 16 또는 관계 타입으로 동영상 감지
            if shape.shape_type in MEDIA_SHAPE_TYPES:
                has_video = True
            # python-pptx 관계(relationship) 기반 동영상 추가 감지
            try:
                for rel in shape.part.rels.values():
                    if "video" in rel.reltype.lower() or "media" in rel.reltype.lower():
                        has_video = True
            except Exception:
                pass
            if shape.has_text_frame:
                for para in shape.text_frame.paragraphs:
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

        # 동영상 슬라이드는 건너뜀
        if has_video:
            print(f"[PPTX 추출] {i}페이지: 동영상 감지 → 건너뜀")
            continue

        text = "\n".join(slide_texts) if slide_texts else "(텍스트 없음)"
        slides.append((i, text, has_image))  # has_image 함께 반환

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
                        {"role": "system", "content": "당신은 프레젠테이션 슬라이드에서 텍스트를 정확하게 추출하는 전문 AI입니다. 표, 그래프, 차트, 이미지 안의 텍스트도 빠짐없이 추출합니다."},
                        {"role": "user", "content": [
                            {"type": "image_url", "image_url": {"url": data_uri}},
                            {"type": "text", "text": """이 슬라이드의 모든 텍스트를 빠짐없이 추출해줘.

[추출 대상 - 반드시 포함]
1. 제목, 소제목, 본문 텍스트
2. 표(table): 각 셀의 내용을 행/열 구조로 추출 (예: "항목|수치|비율")
3. 그래프/차트: 축 레이블, 범례, 데이터 레이블, 수치 값
4. 아이콘/도형 안의 텍스트
5. 이미지 캡션, 출처 표기

[출력 형식]
- 텍스트만 출력, 설명 금지
- 표는 "|" 구분자로 셀 내용 구분
- 그래프는 "축명: 값" 형태로 수치 나열
- 내용이 없는 슬라이드면 "(내용 없음)" 출력"""}
                        ]}
                    ],
                    "max_tokens": 800,
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
    from pptx import Presentation

    # 슬라이드 실제 크기(인치) 기준으로 DPI 동적 계산
    # 목표: 가로 1920px 이하 (CLOVA 비전 API 권장 크기)
    TARGET_WIDTH_PX = 1920
    try:
        prs = Presentation(io.BytesIO(file_bytes))
        slide_width_inch = prs.slide_width.inches  # 예: 일반=13.3", 2배=26.7"
        dpi = int(TARGET_WIDTH_PX / slide_width_inch)
        dpi = max(72, min(dpi, 150))  # 72~150 사이로 클램프
    except Exception:
        dpi = 144  # fallback

    print(f"[PPTX 변환] 슬라이드 너비={slide_width_inch:.1f}\" → DPI={dpi}")

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
            ["pdftoppm", "-jpeg", "-r", str(dpi), pdf_path, os.path.join(tmpdir, "slide")],
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
            ["pdftoppm", "-jpeg", "-r", "150", pdf_path, os.path.join(tmpdir, "page")],
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
            # ── PPTX: 슬라이드별 하이브리드 추출 ──────────────────
            # 1) python-pptx 로 텍스트 + 이미지 shape 여부 추출
            raw_slides = []  # (idx, text, has_image)
            try:
                raw_slides = extract_pptx_text(file_bytes)
            except Exception:
                traceback.print_exc()

            if not raw_slides:
                # python-pptx 자체가 실패한 경우 → 전체 비전
                print("[비전 추출] python-pptx 실패 → 전체 슬라이드 비전 추출")
                images    = pptx_to_images(file_bytes)
                args_list = [(i + 1, img) for i, img in enumerate(images)]
                with ThreadPoolExecutor(max_workers=VISION_WORKERS) as executor:
                    results = list(executor.map(extract_text_from_image, args_list))
                slides     = [(idx, text) for idx, text in sorted(results)]
                use_vision = True
            else:
                # 2) 이미지 포함 슬라이드만 비전으로 보정
                image_slide_idxs = [
                    idx for idx, text, has_img in raw_slides if has_img
                ]

                vision_results = {}
                if image_slide_idxs:
                    print(f"[비전 추출] 이미지 포함 슬라이드 {image_slide_idxs} → 비전 보정")
                    use_vision = True
                    pptx_images = pptx_to_images(file_bytes)  # 전체 슬라이드 이미지

                    target_args = [
                        (idx, pptx_images[idx - 1])
                        for idx in image_slide_idxs
                        if idx - 1 < len(pptx_images)
                    ]
                    with ThreadPoolExecutor(max_workers=VISION_WORKERS) as executor:
                        for v_idx, v_text in executor.map(extract_text_from_image, target_args):
                            vision_results[v_idx] = v_text

                # 3) 슬라이드별 최종 텍스트 합성
                for idx, pptx_text, has_img in raw_slides:
                    if idx in vision_results:
                        v_text = vision_results[idx]
                        # python-pptx 텍스트와 비전 결과를 합쳐서 중복 최소화
                        if pptx_text and pptx_text != "(텍스트 없음)":
                            final_text = f"{pptx_text}\n[이미지 인식 추가]\n{v_text}"
                        else:
                            final_text = v_text
                    else:
                        final_text = pptx_text
                    slides.append((idx, final_text))

        elif is_pdf:
            # PDF: pdfplumber 시도 → 텍스트 없으면 비전
            try:
                pdf_pages = extract_pdf_text(file_bytes)
            except Exception:
                traceback.print_exc()
                pdf_pages = []

            has_content = any(text != "(텍스트 없음)" for _, text in pdf_pages)
            use_vision  = not has_content

            if use_vision:
                print("[비전 추출] PDF 스캔본 감지 → 이미지 변환 후 텍스트 추출")
                images    = pdf_to_images(file_bytes)
                args_list = [(i + 1, img) for i, img in enumerate(images)]
                with ThreadPoolExecutor(max_workers=VISION_WORKERS) as executor:
                    results = list(executor.map(extract_text_from_image, args_list))
                slides = [(idx, text) for idx, text in sorted(results)]
            else:
                slides = pdf_pages

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


# ── 발음 변화 규칙 판별 (규칙 기반 + CLOVA 폴백) ────────────────────────
def _get_pronunciation_type(reason: str) -> str:
    """reason 문자열에서 발음 변동 유형을 추출"""
    if "장단음" in reason:
        return "장단음"
    if "연음" in reason:
        return "연음"
    if "비음화" in reason or "경음화" in reason or "격음화" in reason or "유음화" in reason or "구개음화" in reason:
        return "음운변동"
    return "표기불일치"


def _get_pronunciation_reason(word: str, pronunciation: str) -> str:
    """
    표기(word)와 발음(pronunciation)을 비교해 음운 변동 규칙을 판별.
    규칙이 매칭되면 설명 문자열 반환, 매칭 실패 시 CLOVA에 설명 요청.
    """
    # 한글 자모 분리 유틸
    ONSET  = list("ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ")
    NUCLEUS = list("ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅜㅟㅠㅡㅢㅣ")
    CODA   = list(" ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ")

    def decompose(char):
        """한글 한 글자를 (초성, 중성, 종성) 인덱스로 분해. 한글 아니면 None."""
        code = ord(char) - 0xAC00
        if code < 0 or code > 11171:
            return None
        return code // 28 // 21, (code // 28) % 21, code % 28

    def get_coda(char):
        d = decompose(char)
        return CODA[d[2]] if d else ""

    def get_onset(char):
        d = decompose(char)
        return ONSET[d[0]] if d else ""

    # 표기와 발음이 같으면 설명 불필요 (호출되면 안 되지만 방어)
    if word == pronunciation:
        return ""

    # ── 규칙별 패턴 매칭 ────────────────────────────────────────
    # 각 규칙은 (조건 함수, 설명 문자열) 쌍으로 정의

    rules = []

    # 비음화: ㄱ/ㄷ/ㅂ 받침 + ㄴ/ㅁ → ㅇ/ㄴ/ㅁ
    # 예) 국물→궁물, 밥먹→밤먹, 앞마당→암마당
    for i in range(len(word) - 1):
        coda  = get_coda(word[i])
        onset = get_onset(word[i + 1])
        if coda in ("ㄱ", "ㄲ", "ㅋ") and onset in ("ㄴ", "ㅁ"):
            return "비음화: 받침 'ㄱ'이 비음(ㄴ/ㅁ) 앞에서 'ㅇ'으로 바뀌어 발음됩니다."
        if coda in ("ㄷ", "ㅅ", "ㅆ", "ㅈ", "ㅊ", "ㅌ", "ㅎ") and onset in ("ㄴ", "ㅁ"):
            return "비음화: 받침 'ㄷ'계열이 비음(ㄴ/ㅁ) 앞에서 'ㄴ'으로 바뀌어 발음됩니다."
        if coda in ("ㅂ", "ㅍ", "ㄼ", "ㄿ", "ㅄ") and onset in ("ㄴ", "ㅁ"):
            return "비음화: 받침 'ㅂ'계열이 비음(ㄴ/ㅁ) 앞에서 'ㅁ'으로 바뀌어 발음됩니다."

    # 유음화: ㄴ+ㄹ 또는 ㄹ+ㄴ → ㄹㄹ
    # 예) 신라→실라, 난로→날로
    for i in range(len(word) - 1):
        coda  = get_coda(word[i])
        onset = get_onset(word[i + 1])
        if (coda == "ㄴ" and onset == "ㄹ") or (coda == "ㄹ" and onset == "ㄴ"):
            return "유음화: 'ㄴ'과 'ㄹ'이 만나면 둘 다 'ㄹ'로 바뀌어 발음됩니다."

    # 경음화: 장애음 받침(ㄱ/ㄷ/ㅂ) + 평음(ㄱㄷㅂㅅㅈ) → 된소리
    # 예) 국밥→국빱, 옷걸이→옫꺼리
    for i in range(len(word) - 1):
        coda  = get_coda(word[i])
        onset = get_onset(word[i + 1])
        if coda in ("ㄱ", "ㄲ", "ㅋ", "ㄷ", "ㅅ", "ㅆ", "ㅈ", "ㅊ", "ㅌ", "ㅂ", "ㅍ") \
                and onset in ("ㄱ", "ㄷ", "ㅂ", "ㅅ", "ㅈ"):
            return "경음화: 받침 뒤에 오는 예사소리(ㄱ/ㄷ/ㅂ/ㅅ/ㅈ)가 된소리로 바뀌어 발음됩니다."

    # 격음화(자음 축약): ㅎ + 평음 또는 평음 + ㅎ → 거센소리
    # 예) 놓고→노코, 입학→이팍
    for i in range(len(word) - 1):
        coda  = get_coda(word[i])
        onset = get_onset(word[i + 1])
        if coda == "ㅎ" and onset in ("ㄱ", "ㄷ", "ㅈ"):
            return "격음화: 받침 'ㅎ'이 뒤 자음(ㄱ/ㄷ/ㅈ)과 합쳐져 거센소리(ㅋ/ㅌ/ㅊ)로 발음됩니다."
        if coda in ("ㄱ", "ㄷ", "ㅂ") and onset == "ㅎ":
            return "격음화: 받침(ㄱ/ㄷ/ㅂ)이 'ㅎ'과 합쳐져 거센소리(ㅋ/ㅌ/ㅍ)로 발음됩니다."

    # 연음: 받침 + 모음 시작 음절 → 받침이 다음 음절 초성으로 이동
    # 예) 읽어→일거, 닭이→달기
    for i in range(len(word) - 1):
        coda  = get_coda(word[i])
        onset = get_onset(word[i + 1])
        if coda and coda != " " and onset == "ㅇ":
            return "연음: 앞 음절의 받침이 뒤 음절의 첫소리로 이어져 발음됩니다."

    # 구개음화: ㄷ/ㅌ 받침 + 이(ㅣ) → ㅈ/ㅊ
    # 예) 굳이→구지, 같이→가치
    for i in range(len(word) - 1):
        coda  = get_coda(word[i])
        d_next = decompose(word[i + 1])
        if d_next:
            nucleus_next = NUCLEUS[d_next[1]]
            if coda == "ㄷ" and nucleus_next == "ㅣ":
                return "구개음화: 받침 'ㄷ'이 모음 'ㅣ' 앞에서 'ㅈ'으로 바뀌어 발음됩니다."
            if coda == "ㅌ" and nucleus_next == "ㅣ":
                return "구개음화: 받침 'ㅌ'이 모음 'ㅣ' 앞에서 'ㅊ'으로 바뀌어 발음됩니다."

    # 장단음: 발음 기호에 ː 포함된 경우
    if "ː" in pronunciation:
        return "장단음: 이 단어의 첫 음절은 길게 발음합니다."

    # ── 규칙 매칭 실패 → CLOVA에 설명 요청 ────────────────────
    print(f"[발음 규칙] '{word}'→'{pronunciation}' 규칙 미매칭, CLOVA 설명 요청")
    try:
        prompt = f"""단어 '{word}'의 표준 발음이 [{pronunciation}]인 이유를 한국어 발음 규칙 관점에서 1~2문장으로 간결하게 설명해줘.
규칙 이름(비음화, 경음화, 연음, 격음화, 유음화, 구개음화 등)을 반드시 포함하고, 어떤 자음/모음이 어떻게 바뀌는지 설명해.
예시: '비음화: 받침 ㄱ이 비음 ㅁ 앞에서 ㅇ으로 바뀌어 [궁물]로 발음됩니다.'
설명만 출력하고 다른 말은 하지 마."""

        data, status = call_clova_once(
            [
                {"role": "system", "content": "당신은 한국어 발음 교육 전문가입니다. 음운 규칙을 간결하고 정확하게 설명합니다."},
                {"role": "user",   "content": prompt},
            ],
            max_tokens=120,
        )
        if status == 200:
            explanation = data.get("result", {}).get("message", {}).get("content", "").strip()
            if explanation:
                return explanation
    except Exception as e:
        print(f"[발음 규칙] CLOVA 설명 실패: {e}")

    return "표기와 실제 발음이 다름"  # 최종 폴백


# ── 표준국어대사전 발음 조회 (search → view 2단계, 동음이의어 전체 수집) ──
def lookup_pronunciation(word):
    """
    1단계: search.do 로 해당 단어의 모든 항목(동음이의어 포함) target_code 수집
    2단계: 각 target_code 마다 view.do 로 pronunciation_info + 뜻 조회
    반환값: 후보 리스트 [{"pronunciation": "...", "definition": "..."}, ...]
            발음 후보가 없으면 빈 리스트 반환
    """
    try:
        # 1단계: 해당 단어의 모든 검색 결과 수집
        search_resp = requests.get(
            STDICT_SEARCH_URL,
            params={
                "key":      STDICT_API_KEY,
                "q":        word,
                "req_type": "json",
                "num":      10,   # 동음이의어가 많아도 포함되도록
            },
            timeout=5,
        )
        if search_resp.status_code != 200:
            return []

        items = search_resp.json().get("channel", {}).get("item", [])
        if not items:
            return []

        # 단어 표기가 정확히 일치하는 항목만 필터 (예: "사회" 검색 시 "사회적" 제외)
        # stdict word 필드는 "사-회" 처럼 하이픈이 포함될 수 있으므로 제거 후 비교
        exact_items = [
            it for it in items
            if it.get("word", "").replace("-", "").replace(" ", "") == word
        ]
        if not exact_items:
            exact_items = items  # 정확 일치 없으면 전체 사용

        # 2단계: 각 항목의 발음 + 첫 번째 뜻 조회
        candidates = []
        seen_pronunciations = set()

        for it in exact_items:
            target_code = it.get("target_code")
            if not target_code:
                continue

            view_resp = requests.get(
                STDICT_VIEW_URL,
                params={
                    "certkey_no":  STDICT_CERTKEY,
                    "key":         STDICT_API_KEY,
                    "type_search": "view",
                    "req_type":    "json",
                    "method":      "TARGET_CODE",
                    "q":           target_code,
                },
                timeout=5,
            )
            if view_resp.status_code != 200:
                continue

            item_data  = view_resp.json().get("channel", {}).get("item", {})
            word_info  = item_data.get("word_info", {})
            pron_list  = word_info.get("pronunciation_info", [])
            sense_info = word_info.get("sense_info", {})

            # 뜻풀이: sense_info.sense 가 dict 또는 list
            senses = sense_info.get("sense", []) if sense_info else []
            if isinstance(senses, dict):
                senses = [senses]
            definition = senses[0].get("definition", "") if senses else ""

            if not pron_list:
                continue

            pronunciation = pron_list[0].get("pronunciation", "")
            if not pronunciation:
                continue

            # 동일 발음 중복 제거
            if pronunciation in seen_pronunciations:
                continue
            seen_pronunciations.add(pronunciation)

            candidates.append({
                "pronunciation": pronunciation,
                "definition":    definition,
            })

        return candidates

    except Exception as e:
        print(f"[사전 API] '{word}' 조회 실패: {e}")
        return []


def _resolve_pronunciation_with_clova(word, candidates, context_sentence):
    """
    동음이의어 발음 후보가 여러 개일 때 CLOVA에게 문맥을 전달해
    가장 적합한 발음 하나를 선택하게 함.
    단일 후보이면 CLOVA 호출 없이 바로 반환.
    """
    if not candidates:
        return None

    # 발음이 모두 같으면 (뜻만 다른 동음이의어) 바로 반환
    unique_prons = list(dict.fromkeys(c["pronunciation"] for c in candidates))
    if len(unique_prons) == 1:
        return unique_prons[0]

    # 발음이 다른 경우 → CLOVA에게 문맥 기반 선택 요청
    options_text = "\n".join(
        f"{i+1}. 발음: [{c['pronunciation']}]  뜻: {c['definition'][:40]}"
        for i, c in enumerate(candidates)
    )
    prompt = f"""아래 문장에서 단어 '{word}'의 올바른 발음을 선택해줘.

[문장]
{context_sentence}

[발음 후보]
{options_text}

[지시]
- 문장의 문맥에서 '{word}'가 어떤 의미로 쓰였는지 판단해
- 가장 적합한 발음을 번호로만 답해 (예: 1)
- 번호 외에 다른 말은 절대 쓰지 마"""

    data, status = call_clova_once(
        [
            {"role": "system", "content": "당신은 한국어 발음 전문가입니다. 문맥에 맞는 발음 번호만 답하세요."},
            {"role": "user",   "content": prompt},
        ],
        max_tokens=8,
    )
    if status != 200:
        return candidates[0]["pronunciation"]  # 실패 시 첫 번째 발음으로 폴백

    answer = data.get("result", {}).get("message", {}).get("content", "").strip()
    # 숫자만 추출
    match = re.search(r"\d+", answer)
    if match:
        idx = int(match.group()) - 1
        if 0 <= idx < len(candidates):
            return candidates[idx]["pronunciation"]

    return candidates[0]["pronunciation"]  # 파싱 실패 시 첫 번째 발음으로 폴백


# ── 발음 분석 API ──────────────────────────
@app.route("/api/analyze-pronunciation", methods=["POST"])
def analyze_pronunciation():
    import re as _re
    try:
        data   = request.get_json()
        script = data.get("script", "").strip()
        if not script:
            return jsonify({"error": "대본 텍스트가 없습니다."}), 400

        # ── 1단계: 대본에서 한국어 단어 전체 추출 (중복 제거) ──
        # 2글자 이상 한글 단어만 추출 (조사/어미 등 1글자 제외)
        raw_words = _re.findall(r'[가-힣]{2,}', script)
        unique_words = list(dict.fromkeys(raw_words))  # 등장 순서 유지하며 중복 제거

        print(f"[발음 분석] 추출 단어 수: {len(unique_words)}")

        # ── 단어가 포함된 문장 추출 헬퍼 ──────────────────────
        # CLOVA 문맥 판단용: 단어가 처음 등장하는 문장(앞뒤 포함 최대 100자)
        sentences = _re.split(r'[.!?\n]', script)

        def get_context_sentence(word):
            for s in sentences:
                if word in s:
                    return s.strip()
            return script[:100]  # 못 찾으면 대본 앞부분으로 대체

        # ── 2단계: 표준국어대사전 전수조회 (동음이의어 전체 후보 수집) ──
        def lookup_with_word(word):
            """(word, candidates_list) 튜플 반환"""
            return word, lookup_pronunciation(word)

        # 사전 조회는 병렬로 (stdict API 부하 고려해 워커 3개)
        word_candidates = {}   # word → candidates
        with ThreadPoolExecutor(max_workers=3) as executor:
            futures = {executor.submit(lookup_with_word, w): w for w in unique_words}
            for future in as_completed(futures):
                try:
                    word, candidates = future.result()
                    if candidates:
                        word_candidates[word] = candidates
                except Exception as e:
                    print(f"[발음 분석] 조회 오류: {e}")

        print(f"[발음 분석] 사전 후보 수집 완료: {len(word_candidates)}개 단어")

        # ── 3단계: 동음이의어 발음이 여러 개인 단어만 CLOVA로 문맥 판단 ──
        # 단일 발음 → 바로 확정 / 복수 발음 → CLOVA 호출
        highlights  = []
        seen_words  = set()
        clova_calls = 0

        for word, candidates in word_candidates.items():
            if word in seen_words:
                continue
            seen_words.add(word)

            unique_prons = list(dict.fromkeys(c["pronunciation"] for c in candidates))

            if len(unique_prons) == 1:
                # 발음 후보가 하나 → CLOVA 불필요
                official = unique_prons[0]
            else:
                # 발음 후보가 여러 개 → CLOVA로 문맥 판단
                context = get_context_sentence(word)
                print(f"[발음 분석] 동음이의어 '{word}' 후보 {unique_prons} → CLOVA 문맥 판단")
                official = _resolve_pronunciation_with_clova(word, candidates, context)
                clova_calls += 1

            # 표기 == 발음이면 스킵 (발음 주의 불필요)
            if not official or official == word:
                continue

            # 대본 내 등장 위치 수집
            positions, start = [], 0
            while True:
                idx = script.find(word, start)
                if idx == -1:
                    break
                positions.append({"start": idx, "end": idx + len(word)})
                start = idx + len(word)

            if not positions:
                continue

            reason = _get_pronunciation_reason(word, official)
            pronunciation_type = _get_pronunciation_type(reason)
            highlights.append({
                "word":          word,
                "pronunciation": f"[{official}]",
                "type":          pronunciation_type,
                "reason":        reason,
                "source":        "표준국어대사전",
                "positions":     positions,
            })

        # 대본 등장 순서로 정렬
        highlights.sort(key=lambda h: h["positions"][0]["start"])

        print(f"[발음 분석] 완료 - 주의 단어: {len(highlights)}개 / CLOVA 호출: {clova_calls}회")
        return jsonify({"highlights": highlights, "word_count": len(highlights)}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500



# ── 사용자 관리 API ───────────────────────────────────────────────────────

@app.route("/api/users", methods=["POST"])
def create_user():
    """회원가입: 이름 + 이메일 + 비밀번호 저장 (비밀번호는 bcrypt 해싱)"""
    try:
        data     = request.get_json()
        name     = (data.get("name")     or "").strip()
        email    = (data.get("email")    or "").strip().lower()
        password = (data.get("password") or "").strip()

        if not name or not email or not password:
            return jsonify({"error": "name, email, password는 필수입니다."}), 400
        if len(password) < 6:
            return jsonify({"error": "비밀번호는 6자 이상이어야 합니다."}), 400

        # 이메일 중복 확인
        existing = db.collection("users").where(filter=firestore.FieldFilter("email", "==", email)).limit(1).get()
        if existing:
            return jsonify({"error": "이미 사용 중인 이메일입니다."}), 400

        # 비밀번호 해싱
        hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        # Firestore 저장
        user_ref = db.collection("users").document()
        user_data = {
            "name":       name,
            "email":      email,
            "password":   hashed_pw,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        user_ref.set(user_data)

        print(f"[사용자] 가입 완료: {email} (id={user_ref.id})")
        return jsonify({"message": "회원가입 성공", "id": user_ref.id}), 201

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/users", methods=["GET"])
def list_users():
    """전체 사용자 목록 조회 (비밀번호 제외)"""
    try:
        docs  = db.collection("users").order_by("created_at", direction=firestore.Query.DESCENDING).get()
        users = []
        for doc in docs:
            d = doc.to_dict()
            users.append({
                "id":         doc.id,
                "name":       d.get("name"),
                "email":      d.get("email"),
                "created_at": d.get("created_at"),
            })
        return jsonify({"users": users, "total": len(users)}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/<user_id>", methods=["GET"])
def get_user(user_id):
    """사용자 단건 조회 (비밀번호 제외)"""
    try:
        doc = db.collection("users").document(user_id).get()
        if not doc.exists:
            return jsonify({"error": "사용자를 찾을 수 없습니다."}), 404

        d = doc.to_dict()
        return jsonify({
            "id":         doc.id,
            "name":       d.get("name"),
            "email":      d.get("email"),
            "created_at": d.get("created_at"),
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    """사용자 삭제"""
    try:
        doc_ref = db.collection("users").document(user_id)
        doc     = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "사용자를 찾을 수 없습니다."}), 404

        doc_ref.delete()
        print(f"[사용자] 삭제 완료: id={user_id}")
        return jsonify({"message": "삭제 성공"}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ── 인증 API (/api/auth) ──────────────────────────────────────────────────

@app.route("/api/auth/login", methods=["POST"])
def login():
    """로그인: 이메일 + 비밀번호 확인 후 JWT accessToken + refreshToken 발급"""
    try:
        data     = request.get_json()
        email    = (data.get("email")    or "").strip().lower()
        password = (data.get("password") or "").strip()

        if not email or not password:
            return jsonify({
                "status":     False,
                "statusCode": 400,
                "message":    "email과 password는 필수입니다.",
                "data":       None,
            }), 400

        # Firestore에서 이메일로 사용자 조회
        docs = db.collection("users").where(
            filter=firestore.FieldFilter("email", "==", email)
        ).limit(1).get()

        if not docs:
            return jsonify({
                "status":     False,
                "statusCode": 401,
                "message":    "이메일 또는 비밀번호가 올바르지 않습니다.",
                "data":       None,
            }), 401

        doc  = docs[0]
        user = doc.to_dict()

        # 비밀번호 검증
        if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
            return jsonify({
                "status":     False,
                "statusCode": 401,
                "message":    "이메일 또는 비밀번호가 올바르지 않습니다.",
                "data":       None,
            }), 401

        now = datetime.now(timezone.utc)

        # accessToken 발급 (24시간)
        access_payload = {
            "user_id": doc.id,
            "email":   user["email"],
            "exp":     now + timedelta(hours=JWT_EXPIRE_HOURS),
        }
        access_token = pyjwt.encode(access_payload, JWT_SECRET, algorithm="HS256")

        # refreshToken 발급 (7일)
        refresh_payload = {
            "user_id": doc.id,
            "exp":     now + timedelta(days=7),
        }
        refresh_token = pyjwt.encode(refresh_payload, JWT_SECRET, algorithm="HS256")

        print(f"[인증] 로그인 성공: {email}")
        return jsonify({
            "status":     True,
            "statusCode": 201,
            "message":    "요청이 성공했습니다.",
            "data": {
                "id":           doc.id,
                "name":         user.get("name"),
                "email":        user.get("email"),
                "password":     user.get("password"),
                "accessToken":  access_token,
                "refreshToken": refresh_token,
            }
        }), 201

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "status":     False,
            "statusCode": 500,
            "message":    str(e),
            "data":       None,
        }), 500


@app.route("/api/auth/logout", methods=["POST"])
def logout():
    """로그아웃: 클라이언트 측 토큰 삭제 안내 (서버는 Stateless JWT 방식)"""
    # JWT는 Stateless라 서버에서 토큰을 저장하지 않음
    # 클라이언트가 토큰을 삭제하는 것으로 로그아웃 처리
    # 추후 토큰 블랙리스트가 필요하면 Firestore에 저장하는 방식으로 확장 가능
    print("[인증] 로그아웃 요청")
    return jsonify({"message": "로그아웃 성공. 클라이언트에서 토큰을 삭제해주세요."}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
