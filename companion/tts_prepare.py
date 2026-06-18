"""Split TTS into chunks with pauses and emphasis markers."""
from __future__ import annotations

import io
import re
import wave

TtsChunk = tuple[str, str]  # (text, mode) mode: normal | emphasis

_PAUSE_MS = 220
_ELLIPSIS_PAUSE_MS = 400


def split_tts_chunks(text: str) -> list[TtsChunk]:
    s = text.strip()
    if not s:
        return []
    parts = re.split(r"(?<=[.!?])\s+", s)
    chunks: list[TtsChunk] = []
    for part in parts:
        p = part.strip()
        if not p:
            continue
        mode = "emphasis" if p[-1] in "!?" else "normal"
        chunks.append((p, mode))
    return chunks or [(s, "normal")]


def pause_ms_after_chunk(chunk_text: str) -> int:
    if chunk_text.rstrip().endswith("..."):
        return _ELLIPSIS_PAUSE_MS
    return _PAUSE_MS


def concat_wav_bytes(parts: list[bytes], pauses_ms: list[int] | None = None) -> bytes:
    if not parts:
        return b""
    if len(parts) == 1:
        return parts[0]

    out = io.BytesIO()
    nchannels = sampwidth = framerate = None
    frame_parts: list[bytes] = []

    for i, blob in enumerate(parts):
        with wave.open(io.BytesIO(blob), "rb") as src:
            if nchannels is None:
                nchannels = src.getnchannels()
                sampwidth = src.getsampwidth()
                framerate = src.getframerate()
            frame_parts.append(src.readframes(src.getnframes()))
        if i < len(parts) - 1:
            pause = pauses_ms[i] if pauses_ms and i < len(pauses_ms) else _PAUSE_MS
            nframes = int(framerate * pause / 1000)  # type: ignore[operator]
            frame_parts.append(b"\x00" * nframes * nchannels * sampwidth)  # type: ignore[operator]

    with wave.open(out, "wb") as dst:
        dst.setnchannels(nchannels)  # type: ignore[arg-type]
        dst.setsampwidth(sampwidth)  # type: ignore[arg-type]
        dst.setframerate(framerate)  # type: ignore[arg-type]
        for frames in frame_parts:
            dst.writeframes(frames)
    return out.getvalue()
