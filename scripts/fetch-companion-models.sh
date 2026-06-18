#!/usr/bin/env bash
# Download Piper voice models for companion TTS (low = fast default, medium = optional).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/companion/models"

fetch_voice() {
  local tier="$1"
  local base="https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/${tier}"
  local stem="en_US-lessac-${tier}"
  mkdir -p "$DEST"
  for name in "${stem}.onnx" "${stem}.onnx.json"; do
    if [[ ! -f "$DEST/$name" ]]; then
      echo "fetch $name"
      curl -L -o "$DEST/$name" "$base/$name"
    else
      echo "have $name"
    fi
  done
}

fetch_voice low
fetch_voice medium
echo "models ready in $DEST (server prefers low when present)"
