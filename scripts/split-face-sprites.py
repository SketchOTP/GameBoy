#!/usr/bin/env python3
"""Split face-sprites.png into per-grid-cell PNGs under companion/static/assets/faces/."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "companion" / "static" / "assets"
META_PATH = ASSETS / "face-sprites.json"
SHEET_PATH = ASSETS / "face-sprites.png"
OUT_DIR = ASSETS / "faces"


def main() -> int:
    if not SHEET_PATH.is_file():
        print(f"missing sheet: {SHEET_PATH}", file=sys.stderr)
        return 1
    meta = json.loads(META_PATH.read_text(encoding="utf-8"))
    cols = int(meta["cols"])
    rows = int(meta["rows"])
    width = int(meta["width"])
    height = int(meta["height"])
    cw = width / cols
    ch = height / rows

    sheet = Image.open(SHEET_PATH).convert("RGBA")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    count = 0
    for face_id, spec in meta["faces"].items():
        col = int(spec["col"])
        row = int(spec["row"])
        box = (int(col * cw), int(row * ch), int((col + 1) * cw), int((row + 1) * ch))
        out = OUT_DIR / f"{face_id}.png"
        sheet.crop(box).save(out)
        count += 1
        print(out.relative_to(ROOT))

    print(f"split {count} faces -> {OUT_DIR.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
