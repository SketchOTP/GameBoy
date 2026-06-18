# Companion Button Map

Transparent hit targets sit over the retroboy shell (`companion/static/assets/retroboy-shell.png`). Positions are defined in `companion/static/assets/overlay-viewport.json` (864×1080 shell coordinates).

Run the companion at http://127.0.0.1:8765 — overlays are invisible by default. Tap **ON** to enter **calibration mode** (red boxes, drag/resize). Tap **OFF** to hide and auto-save.

## Calibrate overlays (drag & resize)

1. Tap **ON** on the power switch — all hit boxes turn red and show labels.
2. **Drag** a box to move it; drag the **white corner handle** to resize.
3. Changes auto-save on release to `localStorage` and `assets/overlay-overrides.json` (via API).
4. Tap **OFF** to exit calibration (saves again).
5. Toolbar below the Game Boy:
   - **Save** — confirm write to server
   - **Export JSON** — download overrides file
   - **Reset defaults** — clear saved overrides and restore `overlay-viewport.json` positions

```javascript
CompanionButtons.showHitDebug();       // enter calibrate
CompanionButtons.hideHitDebug();       // exit + save
CompanionButtons.getOverlayOverrides();
CompanionButtons.saveOverlayOverrides();
CompanionButtons.resetOverlayOverrides();
```

Saved format (`overlay-overrides.json`):

```json
{
  "buttons": {
    "a": { "x": 600, "y": 638, "w": 43, "h": 43 }
  }
}
```

Only overridden ids are stored; others use defaults from `overlay-viewport.json`.

## All buttons (11 hit zones)

| ID | Shell label | Overlay element | Default action |
|----|-------------|-----------------|----------------|
| `power_off` | OFF (top-left) | `#btn-power-off` | Hide red hit-box overlay |
| `power_on` | ON (top-left) | `#btn-power-on` | Show all hit boxes in red |
| `dpad_up` | D-pad ▲ | `.hit.dpad.up` | Prompt closed: open keyboard |
| `dpad_down` | D-pad ▼ | `.hit.dpad.down` | Prompt open: submit message |
| `dpad_left` | D-pad ◀ | `.hit.dpad.left` | Prompt open: backspace |
| `dpad_right` | D-pad ▶ | `.hit.dpad.right` | Prompt open: space |
| `select` | SELECT | `#btn-select` | Cycle LLM backend (silent) |
| `start` | START | `#btn-start` | Prompt closed: open keyboard · open: submit |
| `b` | B | `#btn-b` | Cancel mic, clear text, close prompt |
| `a` | A | `#btn-a` | Voice: start mic · tap again: stop & send |
| `phones` | PHONES (bottom center) | `#btn-phones` | Event only — assign later |
| `speaker` | Speaker grille (bottom-right) | `#btn-speaker` | Event only — assign later |

### D-pad summary

| Direction | ID | When prompt is closed | When prompt is open |
|-----------|-----|----------------------|---------------------|
| Up | `dpad_up` | Open keyboard (same as Start) | — |
| Down | `dpad_down` | — | Submit (same as Start) |
| Left | `dpad_left` | — | Delete last character |
| Right | `dpad_right` | — | Insert space |

### Face side-effects (automatic)

| Button | Face trigger (auto mode) |
|--------|--------------------------|
| A (listening) | `listening` → `f_r7c3` |
| Start / typing | `typing` → `f_r1c1` |
| LLM wait | `thinking` → `f_r5c1` |
| TTS | `speaking_low` / `speaking_high` |
| Chat error | `error` → `f_r7c2` (brief) |

See [`companion-faces.md`](companion-faces.md) for face IDs.

## Viewport coordinates

Shell space (pixels on 864×1080 art):

| ID | x | y | w | h |
|----|--:|--:|--:|--:|
| `power_off` | 175 | 106 | 48 | 28 |
| `power_on` | 228 | 106 | 56 | 28 |
| `dpad_up` | 222 | 512 | 72 | 58 |
| `dpad_down` | 222 | 670 | 72 | 58 |
| `dpad_left` | 163 | 602 | 58 | 62 |
| `dpad_right` | 285 | 618 | 58 | 62 |
| `select` | 320 | 796 | 76 | 44 |
| `start` | 412 | 796 | 76 | 44 |
| `b` | 515 | 679 | 43 | 42 |
| `a` | 600 | 638 | 43 | 43 |
| `phones` | 295 | 928 | 270 | 48 |
| `speaker` | 513 | 813 | 190 | 168 |

Adjust in `overlay-viewport.json` if the shell art changes.

## Embed API — `window.CompanionButtons`

```javascript
// List all button ids + default actions
CompanionButtons.list();

// All ids
CompanionButtons.ids();
// → ["power","dpad_up",…,"speaker"]

// Listen for any press (including reserved overlays)
window.addEventListener("companion:button", (e) => {
  console.log(e.detail.id);
});

// Override a button (replaces default action entirely)
CompanionButtons.on("power", () => {
  console.log("Power toggled");
});

// Remove override — defaults return
CompanionButtons.off("power");

// Programmatic press
CompanionButtons.press("a");
```

Request from parent / iframe:

```javascript
window.dispatchEvent(new CustomEvent("companion:button-request", {
  detail: { id: "speaker" },
}));
```

### Example: wire speaker later

```javascript
CompanionButtons.on("speaker", () => {
  CompanionFace.show("f_r4c1", { durationMs: 1200 });
  // or play a sound, open settings, etc.
});
```

### Example: power toggle hook

```javascript
let powered = true;
CompanionButtons.on("power", () => {
  powered = !powered;
  document.body.classList.toggle("gb-off", !powered);
});
```

## HTML / data attributes

Every hit target uses `data-btn="<id>"`:

```html
<button data-btn="a" id="btn-a" …>
<button data-btn="power" id="btn-power" …>
```

D-pad buttons also keep `data-dpad="up|down|left|right"` for legacy selectors.

## Layout stack (z-order)

1. `#face` canvas  
2. `#screen-prompt` (bottom ¼ of LCD when open)  
3. `#battery-led` (status, not clickable)  
4. Shell image (decorative, no pointer events)  
5. `.gb-hit-layer` — all transparent buttons  

## Related docs

- [`companion-faces.md`](companion-faces.md) — face registry and `CompanionFace` API
