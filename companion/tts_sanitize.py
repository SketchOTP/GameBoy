"""Strip markdown/symbols before TTS."""
from __future__ import annotations

import re


def sanitize_tts_text(text: str) -> str:
    s = text.strip()
    if not s:
        return s
    s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)
    s = re.sub(r"`([^`]+)`", r"\1", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"\1", s)
    s = re.sub(r"\*([^*]+)\*", r"\1", s)
    s = re.sub(r"__([^_]+)__", r"\1", s)
    s = re.sub(r"_([^_]+)_", r"\1", s)
    s = re.sub(r"^#+\s*", "", s, flags=re.MULTILINE)
    s = re.sub(r"^\s*[-*•]\s+", "", s, flags=re.MULTILINE)
    s = re.sub(r"[#*_`~|\\/<>{}[\]=+@$%^&]", " ", s)
    s = re.sub(r"[—–]", ", ", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()
