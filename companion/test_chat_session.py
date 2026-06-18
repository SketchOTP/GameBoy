"""LM Studio session reset."""
from __future__ import annotations

from companion.chat_session import append_user, messages, reset


def test_reset_clears_messages() -> None:
    append_user("hello")
    reset()
    assert messages() == []
