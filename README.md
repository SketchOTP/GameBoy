# Game Boy Companion

A browser-based **Game Boy shell UI** that talks to a local LLM, speaks replies with Piper TTS, listens with Whisper STT, and animates a 32-face sprite companion on the LCD.

Long-term this repo also targets a DMG Game Boy **emulator** (`project_goals.md`). Today the runnable app is the **companion** under `companion/`.

**Live URL (local):** http://127.0.0.1:8765

---

## Table of contents

1. [Quick start](#quick-start)
2. [How it works](#how-it-works)
3. [Project layout](#project-layout)
4. [Server configuration (environment variables)](#server-configuration-environment-variables)
5. [LLM backends — LM Studio and beyond](#llm-backends--lm-studio-and-beyond)
6. [Faces — registry, builtins, and customization](#faces--registry-builtins-and-customization)
7. [Buttons — default map and changing behavior](#buttons--default-map-and-changing-behavior)
8. [Overlay placement — buttons, LCD, and battery LED](#overlay-placement--buttons-lcd-and-battery-led)
9. [Battery status LED](#battery-status-led)
10. [Browser APIs (`CompanionButtons`, `CompanionFace`)](#browser-apis-companionbuttons-companionface)
11. [HTTP API](#http-api)
12. [Background colors and easter eggs](#background-colors-and-easter-eggs)
13. [Assets and models](#assets-and-models)
14. [Tests](#tests)
15. [Further reading](#further-reading)

---

## Quick start

### Requirements

- Python 3.11+ (3.14 tested)
- ~130 MB disk for Piper voice models (downloaded on first run)
- Optional: [LM Studio](https://lmstudio.ai/) or any **OpenAI-compatible** chat API on your network

### Run

```bash
./scripts/run-companion.sh
```

This script:

1. Creates `.venv` and installs `companion/requirements.txt` if needed
2. Fetches shell/face assets (`scripts/fetch-companion-assets.sh`) if missing
3. Fetches Piper models (`scripts/fetch-companion-models.sh`) if missing
4. Starts **uvicorn** on **http://127.0.0.1:8765** with auto-reload

Open that URL in a browser. No separate frontend build step — static files are served by FastAPI.

### First-time LLM setup

1. Start LM Studio (or your OpenAI-compatible server) and load a chat model.
2. Note the base URL (default in code: `http://127.0.0.1:1234/v1`).
3. Set `LMSTUDIO_BASE` if yours differs (see [Server configuration](#server-configuration-environment-variables)).
4. The **battery LED** on the shell turns **green** when Piper, Whisper, and at least one chat backend are healthy. **Red** means something is wrong — hover the LED for a tooltip.

### Verify

```bash
python3 -m pytest companion/ -q
curl -s http://127.0.0.1:8765/api/health | python3 -m json.tool
```

---

## How it works

```
Browser (companion/static/)
  index.html   — shell layout, canvas LCD, hit targets
  app.js       — faces, buttons, chat UI, lip-sync, overlays
  style.css    — Game Boy styling
       │
       │  fetch /api/chat, /api/tts, /api/stt, /api/health, …
       ▼
FastAPI (companion/server.py)
  LM Studio / echo  — chat completions
  Piper             — text → WAV
  faster-whisper    — WAV → text
       │
       ▼
Local models in companion/models/
```

### Typical chat flow

1. Press **Start** (prompt closed) → new LM Studio session + keyboard opens.
2. Type or use **A** for voice (mic → Whisper → text).
3. **D-pad Down** or **Start** submits → `POST /api/chat` with selected backend.
4. Reply is shown and spoken via `POST /api/tts` with lip-sync on the LCD.
5. Multi-turn history is kept server-side (`companion/chat_session.py`) until you press **Start** again (new session) or call `POST /api/chat/session/reset`.

### LCD face pipeline

- 32 PNG sprites in `companion/static/assets/faces/`.
- Registry: `companion/static/assets/face-sprites.json`.
- **Auto mode** picks faces for idle, blink, typing, listening, thinking, speaking (RMS lip-sync), errors, idle “thoughts”, and party mode.
- **Manual mode** via `CompanionFace.show()` overrides auto until released or timed out.

### Shell overlays

- Decorative shell image: `companion/static/assets/retroboy-shell.png` (864×1080).
- Transparent **hit boxes** sit above the shell for buttons.
- **LCD canvas**, **prompt bar**, and **battery LED** are positioned from `overlay-viewport.json` (shell pixel coordinates).
- Positions can be adjusted in the UI (see [Overlay placement](#overlay-placement--buttons-lcd-and-battery-led)).

---

## Project layout

```
GameBoy/
├── README.md                          ← this file
├── companion/
│   ├── server.py                      ← FastAPI app, LLM/TTS/STT, static mount
│   ├── chat_session.py                ← in-memory LM Studio message history
│   ├── tts_sanitize.py                ← strip markdown/symbols before TTS
│   ├── tts_prepare.py                 ← sentence splits, pauses, emphasis
│   ├── requirements.txt
│   ├── models/                        ← Piper .onnx voices (gitignored / fetched)
│   ├── static/
│   │   ├── index.html                 ← main UI
│   │   ├── app.js                     ← client logic
│   │   ├── style.css
│   │   ├── overlay-calibrate.js       ← drag/resize in calibrate mode
│   │   ├── face-gallery.html          ← label/review faces in browser
│   │   └── assets/
│   │       ├── face-sprites.json      ← face registry (edit this)
│   │       ├── faces/*.png            ← 32 individual sprites
│   │       ├── overlay-viewport.json  ← default LCD/button/LED coords
│   │       └── overlay-overrides.json ← saved user calibrations
│   └── test_*.py
├── scripts/
│   ├── run-companion.sh               ← start server
│   ├── fetch-companion-assets.sh
│   ├── fetch-companion-models.sh
│   └── split-face-sprites.py          ← regenerate faces/ from sheet
└── docs/
    ├── companion-buttons.md           ← supplementary button reference
    └── companion-faces.md             ← supplementary face reference
```

---

## Server configuration (environment variables)

Set these **before** starting the server (e.g. in your shell or a `.env` you source manually — there is no built-in `.env` loader).

| Variable | Default | Purpose |
|----------|---------|---------|
| `LMSTUDIO_BASE` | `http://100.80.17.40:1234/v1` | OpenAI-compatible API root (must include `/v1`) |
| `LMSTUDIO_MODEL` | *(auto)* | Force a model id; if unset, first non-embedding model from `/models` is used |
| `PIPER_MODEL` | `companion/models/en_US-lessac-low.onnx` if present, else `medium` | Path to Piper ONNX voice |
| `PIPER_LENGTH_SCALE` | `0.68` | Speech rate (&lt; 1 = faster). Cartoon voice tuning. |
| `PIPER_NOISE_SCALE` | `0.78` | Piper synthesis noise |
| `PIPER_NOISE_W_SCALE` | `0.88` | Piper duration noise |
| `PIPER_EMPHASIS_SCALE` | `0.85` | Extra slowdown on `!` and `?` sentences |
| `WHISPER_MODEL` | `tiny` | faster-whisper model size (`tiny`, `base`, `small`, …) |
| `WHISPER_CPU_THREADS` | `min(4, cpu_count)` | Whisper CPU threads |

### Example: local LM Studio on default port

```bash
export LMSTUDIO_BASE="http://127.0.0.1:1234/v1"
export LMSTUDIO_MODEL="your-model-id-here"   # optional
./scripts/run-companion.sh
```

### Example: faster speech

```bash
export PIPER_LENGTH_SCALE=0.55
./scripts/run-companion.sh
```

---

## LLM backends — LM Studio and beyond

Backends are defined in `companion/server.py`. The UI loads available backends from `GET /api/backends` and sends the chosen id in `POST /api/chat`.

### Built-in backends

| ID | Description |
|----|-------------|
| `lmstudio` | OpenAI-compatible `POST {LMSTUDIO_BASE}/chat/completions` with multi-turn history |
| `echo` | Offline demo — echoes `*beep* {your text}` |

Press **Select** in the UI to cycle backends (silent, no on-screen indicator).

### Point at another OpenAI-compatible server

LM Studio, **Ollama** (`http://127.0.0.1:11434/v1`), **llama.cpp server**, **vLLM**, **LocalAI**, etc. often expose the same endpoints:

- `GET /v1/models`
- `POST /v1/chat/completions`

Set `LMSTUDIO_BASE` to that server’s `/v1` URL. No code change required if the API is compatible.

```bash
export LMSTUDIO_BASE="http://127.0.0.1:11434/v1"
./scripts/run-companion.sh
```

### Add a wholly new backend (code change)

1. **`ChatRequest.backend`** — extend the `Literal` in `server.py`:

   ```python
   backend: Literal["echo", "lmstudio", "myapi"] = "lmstudio"
   ```

2. **Implement** `async def chat_myapi(prompt: str) -> str:`.

3. **`backends()`** — return `{"id": "myapi", "label": "My API", "available": ...}`.

4. **`chat()`** — branch on `req.backend == "myapi"`.

5. Restart the server. The new backend appears in `GET /api/backends` and can be selected with **Select**.

### Chat session / system prompt

- History is a simple list of `{role, content}` messages in `chat_session.py`.
- **No system prompt is injected** by the companion — LM Studio uses whatever preset you configured there.
- **Start** (prompt closed) calls `POST /api/chat/session/reset` and opens a fresh keyboard session.

---

## Faces — registry, builtins, and customization

**Source of truth:** `companion/static/assets/face-sprites.json`

### File formats

| Piece | Location |
|-------|----------|
| Sprite sheet (optional source) | `assets/face-sprites.png` |
| Individual sprites | `assets/faces/f_r{row}c{col}.png` (32 files) |
| Registry | `assets/face-sprites.json` |

Grid ids: `f_r0c0` … `f_r7c3` (row 0 = top, col 0 = left).

### Change which face is used for each app state

Edit the `"builtin"` section in `face-sprites.json`:

```json
"builtin": {
  "idle": "f_r0c0",
  "blink": "f_r0c2",
  "typing": "f_r3c1",
  "listening": "f_r2c2",
  "speaking_closed": "f_r0c0",
  "speaking_low": "f_r2c0",
  "speaking_high": "f_r2c1",
  "speaking_inflection": "f_r3c0",
  "thinking": "f_r4c2",
  "error": "f_r6c1"
}
```

Reload the page after editing. No JavaScript rebuild required.

### Aliases

Each face entry can have `"aliases": ["speaking_low", "cool"]`. Use aliases in `CompanionFace.show("cool")` or in builtins if you prefer readable names.

### Idle “thought” faces

The `"idleThoughts"` array lists face ids shown at random during long idle periods (5–50 s gaps, 2–5 s display). Remove or add ids there.

### Replace artwork

1. Replace PNGs in `assets/faces/` (keep names `f_r*r*c*.png` or update `"file"` paths in JSON).
2. Or replace the sheet and run `python3 scripts/split-face-sprites.py` to regenerate `faces/`.
3. Use http://127.0.0.1:8765/face-gallery.html to preview and tune labels/aliases.

### Layout on the LCD

In `face-sprites.json`:

```json
"layout": { "faceZoneRatio": 0.78, "pad": 8 }
```

- `faceZoneRatio` — fraction of LCD height used for the face zone (top portion).
- `pad` — pixel padding inside the LCD when scaling sprites.

### Party mode faces

Secret combo: **Start → A → A → B → B → Up → Down** (within 5 s). Uses aliases `mouth_full` and `vomiting` (`f_r5c1`, `f_r5c0`). Edit aliases or party logic in `app.js` (`PARTY_*` constants) if you want different sprites.

---

## Buttons — default map and changing behavior

Hit targets are invisible buttons in `index.html` with `data-btn="<id>"`. Default actions are in `defaultButtonAction()` in `app.js`.

### Default button map

| ID | Shell control | Prompt **closed** | Prompt **open** |
|----|---------------|-------------------|-----------------|
| `power_on` | ON switch | Enter **calibrate mode** (red overlays) | Same |
| `power_off` | OFF switch | Exit calibrate mode + save | Same |
| `start` | START | New chat session + open keyboard | Submit message |
| `select` | SELECT | Cycle LLM backend (silent) | Same |
| `a` | A | Start mic / stop + send | Same |
| `b` | B | Cancel mic, clear text, close prompt | Same |
| `dpad_up` | D-pad ▲ | Open keyboard | — |
| `dpad_down` | D-pad ▼ | — | Submit |
| `dpad_left` | D-pad ◀ | Previous background color | Backspace |
| `dpad_right` | D-pad ▶ | Next background color | Space |
| `phones` | PHONES jack | Event only (no default action) | Same |
| `speaker` | Speaker grille | Event only (no default action) | Same |

During **calibrate mode**, only `power_on` / `power_off` fire their normal actions; other buttons are draggable overlays (clicks ignored).

### Method 1 — Override in the browser (no fork)

Use `window.CompanionButtons` from DevTools or an injected script:

```javascript
// Replace A button entirely
CompanionButtons.on("a", () => {
  console.log("custom A");
});

// Restore default
CompanionButtons.off("a");

// List defaults
CompanionButtons.list();

// Listen without overriding (fires for every press)
window.addEventListener("companion:button", (e) => {
  console.log("pressed", e.detail.id);
});

// Wire reserved buttons
CompanionButtons.on("speaker", () => {
  CompanionFace.show("big_laugh", { durationMs: 1500 });
});
```

Overrides **replace** the built-in action for that id until `off()` is called.

### Method 2 — Change defaults in source

Edit `defaultButtonAction()` in `companion/static/app.js`. Update `buttonActionDocs` nearby if you want `CompanionButtons.list()` to stay accurate.

### Method 3 — Parent page / iframe

```javascript
window.dispatchEvent(new CustomEvent("companion:button-request", {
  detail: { id: "start" },
}));
```

### Automatic face side-effects

These are **not** button overrides — they run in auto face mode:

| State | Builtin key | Typical trigger |
|-------|-------------|-----------------|
| Typing | `typing` | Prompt open |
| Listening | `listening` | A button mic on |
| Thinking | `thinking` | Waiting for LLM/STT |
| Speaking | `speaking_*` | TTS lip-sync |
| Error | `error` | Chat failure (~1.5 s) |
| Idle thought | *(idleThoughts list)* | Random idle timer |

---

## Overlay placement — buttons, LCD, and battery LED

All positions use **shell image coordinates** (864×1080 px on `retroboy-shell.png`).

### Default geometry

**File:** `companion/static/assets/overlay-viewport.json`

```json
{
  "width": 864,
  "height": 1080,
  "lcd": { "x": 298, "y": 226, "w": 269, "h": 247 },
  "battery_led": { "x": 242, "y": 305, "w": 12, "h": 12 },
  "buttons": {
    "power_on": { "x": 228, "y": 106, "w": 56, "h": 28 },
    "a": { "x": 600, "y": 638, "w": 43, "h": 43 }
  }
}
```

Each entry is `{ "x", "y", "w", "h" }` — top-left corner and size in shell pixels.

### Calibrate in the UI (recommended)

1. Tap **Power ON** on the shell → red hit boxes + labels appear; toolbar shows below the Game Boy.
2. **Drag** a box to move it.
3. Drag the **white corner handle** to resize.
4. Works for all **12 buttons** and the **battery LED**.
5. Release pointer → auto-saves to `localStorage` and `PUT /api/overlay-overrides`.
6. Tap **Power OFF** → exit calibrate mode (saves again).

Toolbar:

| Control | Action |
|---------|--------|
| **Save** | Confirm write to server file |
| **Export JSON** | Download overrides |
| **Reset defaults** | Clear saves; restore `overlay-viewport.json` positions |

### Saved overrides format

**File:** `companion/static/assets/overlay-overrides.json` (also cached in browser `localStorage` key `companion-overlay-overrides`)

```json
{
  "buttons": {
    "a": { "x": 600, "y": 645, "w": 43, "h": 43 },
    "battery_led": { "x": 244, "y": 307, "w": 10, "h": 10 }
  }
}
```

Only ids you changed are stored; others fall back to `overlay-viewport.json`.

> **Note:** The JSON key is `"buttons"` for historical reasons, but it also stores `battery_led` (and any future overlay ids).

### Calibrate from JavaScript

```javascript
CompanionButtons.showHitDebug();        // enter calibrate (same as Power ON)
CompanionButtons.hideHitDebug();        // exit + save
CompanionButtons.getOverlayOverrides();
CompanionButtons.saveOverlayOverrides();
CompanionButtons.resetOverlayOverrides();
```

Low-level access:

```javascript
window.__companionOverlay.getBox("battery_led");
window.__companionOverlay.setBox("battery_led", { x: 240, y: 300, w: 10, h: 10 });
window.__companionOverlay.saveOverrides();
```

Minimum resize: **20 px** for buttons, **6 px** for `battery_led`.

### Change shell artwork

If you swap `retroboy-shell.png`, update `width`/`height` and all coordinates in `overlay-viewport.json`, then recalibrate in the UI.

### Z-order (bottom → top)

| Layer | Element |
|-------|---------|
| 1 | `#face` LCD canvas |
| 2 | `#screen-prompt` (text input, bottom quarter of LCD) |
| 6 | `#battery-led` (status glow — above shell art) |
| 4 | `.gb-shell-img` (decorative shell) |
| 5 | `.gb-hit-layer` (transparent buttons) |

---

## Battery status LED

The LED is a small overlay (`#battery-led`) aligned to the shell’s power LED hole.

| Color | Meaning |
|-------|---------|
| **Green** | Piper model on disk, Whisper configured, ≥1 chat backend available |
| **Red** | Something failed — hover for tooltip (`Piper model missing`, `No chat backend`, etc.) |
| Hidden | Brief moment before first health poll |

Health is polled on load and every 30 s via `GET /api/health` and `GET /api/backends`.

**Size/position:** calibrate with **Power ON** like any other overlay (see above). Default is 12×12 shell px.

---

## Browser APIs (`CompanionButtons`, `CompanionFace`)

### `CompanionFace`

```javascript
CompanionFace.show("f_r3c1");                      // manual until release
CompanionFace.show("thinking", { durationMs: 2000 });
CompanionFace.release();                           // back to auto mode
CompanionFace.resolve("blink");                    // → "f_r0c2"
CompanionFace.list();                              // all faces + aliases
CompanionFace.getActive();
CompanionFace.builtin();                           // copy of builtin map
```

Events:

```javascript
window.addEventListener("companion:face", (e) => console.log(e.detail));
window.dispatchEvent(new CustomEvent("companion:face-request", {
  detail: { id: "f_r4c1", durationMs: 1500 },
}));
```

### `CompanionButtons`

Documented in [Buttons](#buttons--default-map-and-changing-behavior).

---

## HTTP API

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/health` | Piper/Whisper/LM Studio status |
| `GET` | `/api/backends` | Chat backends + availability |
| `POST` | `/api/chat` | `{ "prompt": "...", "backend": "lmstudio" }` |
| `POST` | `/api/chat/session/reset` | Clear LM Studio message history |
| `POST` | `/api/tts` | `{ "text": "..." }` → `audio/wav` |
| `POST` | `/api/stt` | `multipart` audio file → `{ "text": "..." }` |
| `GET` | `/api/overlay-overrides` | Saved overlay positions |
| `PUT` | `/api/overlay-overrides` | `{ "buttons": { "id": {x,y,w,h} } }` |
| `GET` | `/` | Main UI |
| `GET` | `/face-gallery.html` | Face labeling gallery |

Static assets under `/assets/…`.

---

## Background colors and easter eggs

- **D-pad Left / Right** (prompt closed) cycles 49 page background colors (`BG_COLORS` in `app.js`).
- Choice persists to `localStorage` (`companion-bg-color-index`) after 10 s idle.
- **Party mode** (secret combo above): 10 s neon background cycle + `mouth_full` / `vomiting` faces.

Edit `BG_COLORS`, `PARTY_NEON_COLORS`, or `SECRET_COMBO` in `app.js` to customize.

---

## Assets and models

| Script | Purpose |
|--------|---------|
| `scripts/fetch-companion-assets.sh` | Shell PNG, sprite sheet, split faces |
| `scripts/fetch-companion-models.sh` | Piper `en_US-lessac-low` + `medium` |
| `scripts/split-face-sprites.py` | Re-split `face-sprites.png` → `faces/` |

Credits: `companion/static/assets/CREDITS.txt`

---

## Tests

```bash
python3 -m pytest companion/test_lipsync.py \
  companion/test_tts_sanitize.py \
  companion/test_chat_session.py \
  companion/test_tts_prepare.py -q
```

---

## Further reading

| Doc | Contents |
|-----|----------|
| [`docs/companion-buttons.md`](docs/companion-buttons.md) | Extended button / overlay reference |
| [`docs/companion-faces.md`](docs/companion-faces.md) | Extended face grid reference |
| [`project_goals.md`](project_goals.md) | Emulator north star (future) |
| [`AGENTS.md`](AGENTS.md) | AI agent contract for contributors |

---

## Agent / MCP stack (contributors)

This repo includes universal agent governance (`AGENTS.md`): Aion, Architect, Mimir, Serena MCPs. See the previous README table if you are automating changes with coding agents.

```bash
./scripts/sync-agent-rules.sh
./scripts/audit-agent-rules.sh
```
