"""TTS chunk split and WAV concat."""
from __future__ import annotations

import io
import wave

from companion.tts_prepare import concat_wav_bytes, pause_ms_after_chunk, split_tts_chunks


def _tiny_wav(ms: int = 50, rate: int = 16000) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(b"\x00\x00" * int(rate * ms / 1000))
    return buf.getvalue()


def test_split_sentences_and_emphasis() -> None:
    chunks = split_tts_chunks("Hello there. Really? Yes!")
    assert len(chunks) == 3
    assert chunks[0] == ("Hello there.", "normal")
    assert chunks[1] == ("Really?", "emphasis")
    assert chunks[2] == ("Yes!", "emphasis")


def test_ellipsis_pause() -> None:
    assert pause_ms_after_chunk("wait...") > pause_ms_after_chunk("wait.")


def test_concat_wav_longer_than_single() -> None:
    one = _tiny_wav(40)
    two = concat_wav_bytes([one, one], [100])
    with wave.open(io.BytesIO(one), "rb") as a, wave.open(io.BytesIO(two), "rb") as b:
        assert b.getnframes() > a.getnframes()
