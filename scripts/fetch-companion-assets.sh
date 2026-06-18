#!/usr/bin/env bash
# Copy companion UI assets into static/.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS="$ROOT/companion/static/assets"
mkdir -p "$ASSETS"

copy() {
  local src="$1"
  local dest="$2"
  if [[ ! -f "$src" ]]; then
    echo "missing $src" >&2
    exit 1
  fi
  cp "$src" "$dest"
}

copy "$ROOT/retroboy (1).png" "$ASSETS/retroboy-shell.png"
copy "$ROOT/download (4)-Photoroom.png" "$ASSETS/face-sprites.png"
python3 "$ROOT/scripts/split-face-sprites.py"
echo "assets ready in $ASSETS"
