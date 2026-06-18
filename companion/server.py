#!/usr/bin/env python3
"""Game Boy companion API: selectable LLM backends, Piper TTS, Whisper Lite STT."""
from __future__ import annotations

import asyncio
import io
import json
import os
import tempfile
import wave
from functools import lru_cache
from pathlib import Path
from typing import Any, Literal

import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from piper import PiperVoice
from piper.config import SynthesisConfig
from pydantic import BaseModel, Field

from .chat_session import append_assistant, append_user, messages, reset as clear_chat_messages
from .tts_prepare import concat_wav_bytes, pause_ms_after_chunk, split_tts_chunks
from .tts_sanitize import sanitize_tts_text

ROOT = Path(__file__).resolve().parent
STATIC = ROOT / "static"
MODELS = ROOT / "models"
OVERLAY_OVERRIDES = STATIC / "assets" / "overlay-overrides.json"
LMSTUDIO_BASE = os.environ.get("LMSTUDIO_BASE", "http://100.80.17.40:1234/v1").rstrip("/")
WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "tiny")
WHISPER_CPU_THREADS = int(os.environ.get("WHISPER_CPU_THREADS", str(min(4, os.cpu_count() or 2))))
PIPER_LENGTH_SCALE = float(os.environ.get("PIPER_LENGTH_SCALE", "0.68"))
PIPER_NOISE_SCALE = float(os.environ.get("PIPER_NOISE_SCALE", "0.78"))
PIPER_NOISE_W_SCALE = float(os.environ.get("PIPER_NOISE_W_SCALE", "0.88"))
PIPER_EMPHASIS_SCALE = float(os.environ.get("PIPER_EMPHASIS_SCALE", "0.85"))


def _default_piper_model() -> Path:
    low = MODELS / "en_US-lessac-low.onnx"
    medium = MODELS / "en_US-lessac-medium.onnx"
    if low.exists():
        return low
    return medium


PIPER_MODEL = Path(os.environ["PIPER_MODEL"]) if os.environ.get("PIPER_MODEL") else _default_piper_model()

app = FastAPI(title="GameBoy Companion")

_whisper_model = None


def get_whisper():
    global _whisper_model
    if _whisper_model is None:
        from faster_whisper import WhisperModel

        _whisper_model = WhisperModel(
            WHISPER_MODEL,
            device="cpu",
            compute_type="int8",
            cpu_threads=WHISPER_CPU_THREADS,
        )
    return _whisper_model


@lru_cache(maxsize=1)
def get_piper() -> PiperVoice:
    if not PIPER_MODEL.exists():
        raise HTTPException(
            503,
            f"Piper model missing at {PIPER_MODEL}. Run scripts/fetch-companion-models.sh",
        )
    return PiperVoice.load(PIPER_MODEL)


def _transcribe_path(path: str) -> str:
    model = get_whisper()
    segments, _info = model.transcribe(
        path,
        language="en",
        task="transcribe",
        beam_size=1,
        best_of=1,
        patience=1,
        condition_on_previous_text=False,
        vad_filter=False,
        without_timestamps=True,
        temperature=0,
    )
    return " ".join(s.text.strip() for s in segments).strip()


def _synthesize_chunk(voice: PiperVoice, text: str, *, emphasis: bool) -> bytes:
    length_scale = PIPER_LENGTH_SCALE * (PIPER_EMPHASIS_SCALE if emphasis else 1.0)
    noise_w = min(1.0, PIPER_NOISE_W_SCALE + 0.06) if emphasis else PIPER_NOISE_W_SCALE
    syn_config = SynthesisConfig(
        length_scale=length_scale,
        noise_scale=PIPER_NOISE_SCALE,
        noise_w_scale=noise_w,
    )
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wav:
        voice.synthesize_wav(text, wav, syn_config=syn_config)
    return buf.getvalue()


def _synthesize_wav(text: str) -> bytes:
    spoken = sanitize_tts_text(text)
    if not spoken:
        raise HTTPException(400, "no speakable text after sanitizing symbols")
    chunks = split_tts_chunks(spoken)
    voice = get_piper()
    if len(chunks) == 1:
        chunk_text, mode = chunks[0]
        return _synthesize_chunk(voice, chunk_text, emphasis=mode == "emphasis")

    parts: list[bytes] = []
    pauses: list[int] = []
    for i, (chunk_text, mode) in enumerate(chunks):
        parts.append(_synthesize_chunk(voice, chunk_text, emphasis=mode == "emphasis"))
        if i < len(chunks) - 1:
            pauses.append(pause_ms_after_chunk(chunk_text))
    return concat_wav_bytes(parts, pauses)


@app.on_event("startup")
async def warmup_models() -> None:
    await asyncio.gather(
        asyncio.to_thread(get_piper),
        asyncio.to_thread(get_whisper),
    )


async def lmstudio_up() -> bool:
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{LMSTUDIO_BASE}/models")
            return r.status_code == 200
    except httpx.HTTPError:
        return False


async def lmstudio_model() -> str:
    if model := os.environ.get("LMSTUDIO_MODEL"):
        return model
    async with httpx.AsyncClient(timeout=3.0) as client:
        r = await client.get(f"{LMSTUDIO_BASE}/models")
        r.raise_for_status()
        for item in r.json().get("data", []):
            model_id = str(item.get("id", ""))
            if model_id and "embed" not in model_id.lower():
                return model_id
    raise HTTPException(503, "No chat model reported by LM Studio")


class ChatRequest(BaseModel):
    prompt: str
    backend: Literal["echo", "lmstudio"] = "lmstudio"


class ChatResponse(BaseModel):
    text: str
    backend: str


class TtsRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)


class SttResponse(BaseModel):
    text: str


@app.get("/api/health")
async def health() -> dict:
    lmstudio_ok = await lmstudio_up()
    return {
        "piper_model": PIPER_MODEL.exists(),
        "piper_voice": PIPER_MODEL.name,
        "piper_length_scale": PIPER_LENGTH_SCALE,
        "whisper": WHISPER_MODEL,
        "lmstudio_base": LMSTUDIO_BASE,
        "backends": {
            "echo": True,
            "lmstudio": lmstudio_ok,
        },
    }


@app.get("/api/backends")
async def backends() -> list[dict]:
    lmstudio_ok = await lmstudio_up()
    return [
        {"id": "lmstudio", "label": "LM Studio (local)", "available": lmstudio_ok},
        {"id": "echo", "label": "Echo (offline demo)", "available": True},
    ]


async def chat_echo(prompt: str) -> str:
    return f"*beep* {prompt}"


def reset_lmstudio_session() -> None:
    clear_chat_messages()


async def chat_lmstudio(prompt: str) -> str:
    model = await lmstudio_model()
    append_user(prompt)
    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.post(
            f"{LMSTUDIO_BASE}/chat/completions",
            json={
                "model": model,
                "messages": messages(),
                "temperature": 0.7,
            },
        )
        r.raise_for_status()
        reply = str(r.json()["choices"][0]["message"]["content"]).strip()
    append_assistant(reply)
    return reply


@app.post("/api/chat/session/reset")
async def reset_chat_session() -> dict[str, bool | int]:
    reset_lmstudio_session()
    return {"ok": True, "messages": len(messages())}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    prompt = req.prompt.strip()
    if not prompt:
        raise HTTPException(400, "empty prompt")
    if req.backend == "echo":
        text = await chat_echo(prompt)
    elif req.backend == "lmstudio":
        if not await lmstudio_up():
            raise HTTPException(503, f"LM Studio not reachable at {LMSTUDIO_BASE}")
        try:
            text = await chat_lmstudio(prompt)
        except httpx.HTTPError as exc:
            raise HTTPException(502, f"LM Studio error: {exc}") from exc
    else:
        raise HTTPException(400, f"unknown backend: {req.backend}")
    return ChatResponse(text=text, backend=req.backend)


@app.post("/api/tts")
async def tts(req: TtsRequest) -> Response:
    try:
        audio = await asyncio.to_thread(_synthesize_wav, req.text.strip())
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(500, f"TTS failed: {exc}") from exc
    return Response(content=audio, media_type="audio/wav")


@app.post("/api/stt", response_model=SttResponse)
async def stt(file: UploadFile = File(...)) -> SttResponse:
    data = await file.read()
    if not data:
        raise HTTPException(400, "empty audio")
    suffix = Path(file.filename or "clip.wav").suffix or ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as tmp:
        tmp.write(data)
        tmp.flush()
        try:
            text = await asyncio.to_thread(_transcribe_path, tmp.name)
        except Exception as exc:
            raise HTTPException(500, f"STT failed: {exc}") from exc
    return SttResponse(text=text or "")


@app.get("/api/overlay-overrides")
def get_overlay_overrides() -> dict[str, Any]:
    if not OVERLAY_OVERRIDES.exists():
        return {"buttons": {}}
    try:
        return json.loads(OVERLAY_OVERRIDES.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise HTTPException(500, "overlay-overrides.json invalid") from exc


@app.put("/api/overlay-overrides")
def put_overlay_overrides(body: dict[str, Any]) -> dict[str, bool]:
    if "buttons" not in body or not isinstance(body["buttons"], dict):
        raise HTTPException(400, "expected { buttons: { id: {x,y,w,h} } }")
    OVERLAY_OVERRIDES.parent.mkdir(parents=True, exist_ok=True)
    OVERLAY_OVERRIDES.write_text(json.dumps(body, indent=2) + "\n", encoding="utf-8")
    return {"ok": True}


app.mount("/", StaticFiles(directory=STATIC, html=True), name="static")
