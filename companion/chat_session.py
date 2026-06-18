"""LM Studio multi-turn message history."""
from __future__ import annotations

_messages: list[dict[str, str]] = []


def messages() -> list[dict[str, str]]:
    return list(_messages)


def append_user(content: str) -> None:
    _messages.append({"role": "user", "content": content})


def append_assistant(content: str) -> None:
    _messages.append({"role": "assistant", "content": content})


def reset() -> None:
    _messages.clear()
