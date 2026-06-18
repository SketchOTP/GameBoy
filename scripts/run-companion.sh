#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d .venv ]]; then
  python3 -m venv .venv
  .venv/bin/pip install -q -r companion/requirements.txt
fi

if [[ ! -f companion/static/assets/retroboy-shell.png ]] \
   || [[ ! -f companion/static/assets/face-sprites.png ]] \
   || [[ ! -f companion/static/assets/faces/f_r0c0.png ]]; then
  bash scripts/fetch-companion-assets.sh
fi

if [[ ! -f companion/models/en_US-lessac-medium.onnx ]]; then
  bash scripts/fetch-companion-models.sh
fi

exec .venv/bin/uvicorn companion.server:app --host 127.0.0.1 --port 8765 --reload
