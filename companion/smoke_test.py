#!/usr/bin/env python3
"""Runnable smoke check for companion API (no browser)."""
from __future__ import annotations

import io
import sys
import wave

import httpx

BASE = "http://127.0.0.1:8765"


def main() -> int:
    try:
        with httpx.Client(base_url=BASE, timeout=120.0) as client:
            health = client.get("/api/health").json()
            assert health["backends"]["echo"] is True

            chat = client.post("/api/chat", json={"prompt": "smoke test", "backend": "echo"}).json()
            assert "smoke test" in chat["text"]

            if not health["piper_model"]:
                print("SKIP tts: piper model missing")
            else:
                wav = client.post("/api/tts", json={"text": "companion online"}).content
                assert len(wav) > 1000
                with wave.open(io.BytesIO(wav), "rb") as w:
                    assert w.getnframes() > 0

            backends = client.get("/api/backends").json()
            assert any(b["id"] == "echo" and b["available"] for b in backends)

        print("smoke ok")
        return 0
    except httpx.ConnectError:
        print("BLOCKED: server not running — start with scripts/run-companion.sh", file=sys.stderr)
        return 2
    except Exception as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
