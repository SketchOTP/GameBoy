"""TTS symbol stripping (no audio)."""
from __future__ import annotations

from companion.tts_sanitize import sanitize_tts_text


def test_strips_markdown_and_symbols() -> None:
    assert sanitize_tts_text("*beep* hello") == "beep hello"
    assert sanitize_tts_text("**bold** and *italic*") == "bold and italic"
    assert sanitize_tts_text("use `code` here") == "use code here"
    assert sanitize_tts_text("5/10 done") == "5 10 done"
    assert sanitize_tts_text("## Title\n- item one") == "Title item one"


def test_empty_after_strip() -> None:
    assert sanitize_tts_text("***///") == ""
