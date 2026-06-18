"""Unit checks for TTS lip-sync face mapping (no browser)."""
from __future__ import annotations

import re
import shutil
import subprocess
from pathlib import Path

APP_JS = Path(__file__).resolve().parent / "static" / "app.js"
MARK_START = "// lipsync-start"
MARK_END = "// lipsync-end"


def _extract_lipsync_js() -> str:
    text = APP_JS.read_text(encoding="utf-8")
    start = text.index(MARK_START)
    end = text.index(MARK_END, start)
    block = text[start + len(MARK_START) : end].strip()
    return block


def _run_node_cases(cases: list[tuple[dict, str]]) -> None:
    if not shutil.which("node"):
        import pytest

        pytest.skip("node not available")
    js = _extract_lipsync_js()
    payload = ",\n".join(f"{{metrics:{m!r}, want:{w!r}}}" for m, w in cases)
    script = f"""
{js}
const cases = [
{payload}
];
for (const {{ metrics, want }} of cases) {{
  const got = pickSpeakingFace(metrics);
  if (got !== want) {{
    console.error(`pickSpeakingFace(${{JSON.stringify(metrics)}}) => ${{got}}, want ${{want}}`);
    process.exit(1);
  }}
}}
console.log("lipsync ok");
"""
    proc = subprocess.run(
        ["node", "-e", script],
        capture_output=True,
        text=True,
        check=False,
    )
    assert proc.returncode == 0, proc.stderr or proc.stdout


def test_pick_speaking_face_thresholds() -> None:
    _run_node_cases(
        [
            ({"rms": 0}, "f_r0c0"),
            ({"rms": 0.04}, "f_r0c0"),
            ({"rms": 0.12}, "f_r2c0"),
            ({"rms": 0.2}, "f_r2c0"),
            ({"rms": 0.35}, "f_r2c1"),
            ({"rms": 0.8}, "f_r2c1"),
            ({"rms": 0.25, "rmsDelta": 0.08}, "f_r3c0"),
            ({"rms": 0.05, "rmsDelta": 0.2}, "f_r0c0"),
        ]
    )


def test_sample_speaking_metrics_silence() -> None:
    if not shutil.which("node"):
        import pytest

        pytest.skip("node not available")
    js = _extract_lipsync_js()
    script = f"""
{js}
const td = new Uint8Array(128).fill(128);
const fd = new Uint8Array(64).fill(0);
const m = sampleSpeakingMetrics(td, fd);
if (m.rms > 0.001) {{ console.error("expected near-silent rms"); process.exit(1); }}
console.log("metrics ok");
"""
    proc = subprocess.run(["node", "-e", script], capture_output=True, text=True, check=False)
    assert proc.returncode == 0, proc.stderr or proc.stdout


def test_app_wires_analyser_lipsync() -> None:
    text = APP_JS.read_text(encoding="utf-8")
    assert "updateSpeakingLipSync" in text
    assert "getByteFrequencyData" in text
    assert re.search(r"if \(face\.speaking\) return speakingFaceId", text)
