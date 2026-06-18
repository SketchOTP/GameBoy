# Companion Face Registry

Individual sprites: `companion/static/assets/faces/f_r{row}c{col}.png` (32 files).

Source sheet (regenerate with `scripts/split-face-sprites.py`): `companion/static/assets/face-sprites.png`.

Registry source of truth: `companion/static/assets/face-sprites.json`.

**Label faces:** open http://127.0.0.1:8765/face-gallery.html — edit each face’s `label` and `aliases` in `face-sprites.json` to match what the PNG actually shows.

Run the companion at http://127.0.0.1:8765 and open DevTools to try triggers live.

## Quick API

```javascript
CompanionFace.show(id);                        // hold until release
CompanionFace.show(id, { durationMs: 2000 });    // timed, then auto mode
CompanionFace.release();                         // back to auto (idle, blink, …)
CompanionFace.list();                            // all faces
CompanionFace.resolve("blink");                  // alias → canonical id
CompanionFace.getActive();                       // current face + source
```

Event (listen):

```javascript
window.addEventListener("companion:face", (e) => console.log(e.detail));
```

Event (request from parent / iframe):

```javascript
window.dispatchEvent(new CustomEvent("companion:face-request", {
  detail: { id: "f_r4c1", durationMs: 1500 },
}));
```

## ID formats

| Format | Example | Resolves to |
|--------|---------|-------------|
| Grid id | `f_r3c2` | Row 3, column 2 |
| Index 0–31 | `14` | Row-major: row `floor(n/4)`, col `n % 4` |
| Col, row | `"2,3"` | Column 2, row 3 → `f_r3c2` |
| Alias | `"thinking"` | See table below |
| Builtin | `"idle"` | Same as alias (auto-mode names) |

## Grid map

Rows increase downward. Columns increase rightward.

```
         col0          col1          col2          col3
row0  f_r0c0        f_r0c1        f_r0c2        f_r0c3
row1  f_r1c0        f_r1c1        f_r1c2        f_r1c3
row2  f_r2c0        f_r2c1        f_r2c2        f_r2c3
row3  f_r3c0        f_r3c1        f_r3c2        f_r3c3
row4  f_r4c0        f_r4c1        f_r4c2        f_r4c3
row5  f_r5c0        f_r5c1        f_r5c2        f_r5c3
row6  f_r6c0        f_r6c1        f_r6c2        f_r6c3
row7  f_r7c0        f_r7c1        f_r7c2        f_r7c3
```

## All faces and trigger calls

| Index | ID | Label | Aliases | Trigger |
|------:|----|-------|---------|---------|
| 0 | `f_r0c0` | Smile Small | `idle`, `happy`, `default` | `CompanionFace.show("f_r0c0")` |
| 1 | `f_r0c1` | Smile Neutral | — | `CompanionFace.show("f_r0c1")` |
| 2 | `f_r0c2` | Eyes Closed Happy | `blink` | `CompanionFace.show("f_r0c2")` |
| 3 | `f_r0c3` | Smile Soft | — | `CompanionFace.show("f_r0c3")` |
| 4 | `f_r1c0` | Mouth Flat | — | `CompanionFace.show("f_r1c0")` |
| 5 | `f_r1c1` | Mouth Neutral | `typing`, `neutral` | `CompanionFace.show("f_r1c1")` |
| 6 | `f_r1c2` | Mouth Slight Frown | — | `CompanionFace.show("f_r1c2")` |
| 7 | `f_r1c3` | Mouth Surprised Small | — | `CompanionFace.show("f_r1c3")` |
| 8 | `f_r2c0` | Talk Small | `speaking_low`, `talking` | `CompanionFace.show("f_r2c0")` |
| 9 | `f_r2c1` | Talk Medium | `speaking_high` | `CompanionFace.show("f_r2c1")` |
| 10 | `f_r2c2` | Smile Closed | — | `CompanionFace.show("f_r2c2")` |
| 11 | `f_r2c3` | Talk Round | — | `CompanionFace.show("f_r2c3")` |
| 12 | `f_r3c0` | Talk Open | — | `CompanionFace.show("f_r3c0")` |
| 13 | `f_r3c1` | Look Side Smile | — | `CompanionFace.show("f_r3c1")` |
| 14 | `f_r3c2` | Talk Wide | — | `CompanionFace.show("f_r3c2")` |
| 15 | `f_r3c3` | Grin Wide | — | `CompanionFace.show("f_r3c3")` |
| 16 | `f_r4c0` | Smile Teeth | — | `CompanionFace.show("f_r4c0")` |
| 17 | `f_r4c1` | Laugh Open | — | `CompanionFace.show("f_r4c1")` |
| 18 | `f_r4c2` | Eyes Squint | — | `CompanionFace.show("f_r4c2")` |
| 19 | `f_r4c3` | Mouth O Small | — | `CompanionFace.show("f_r4c3")` |
| 20 | `f_r5c0` | Face Tall | — | `CompanionFace.show("f_r5c0")` |
| 21 | `f_r5c1` | Thinking Wavy | `thinking` | `CompanionFace.show("f_r5c1")` |
| 22 | `f_r5c2` | Talk Tongue | — | `CompanionFace.show("f_r5c2")` |
| 23 | `f_r5c3` | Smile Crooked | — | `CompanionFace.show("f_r5c3")` |
| 24 | `f_r6c0` | Eyes Normal | — | `CompanionFace.show("f_r6c0")` |
| 25 | `f_r6c1` | Eyes Soft | — | `CompanionFace.show("f_r6c1")` |
| 26 | `f_r6c2` | Look Down | — | `CompanionFace.show("f_r6c2")` |
| 27 | `f_r6c3` | Eyes Narrow | — | `CompanionFace.show("f_r6c3")` |
| 28 | `f_r7c0` | Mouth Sad | — | `CompanionFace.show("f_r7c0")` |
| 29 | `f_r7c1` | Mouth Frown | — | `CompanionFace.show("f_r7c1")` |
| 30 | `f_r7c2` | Eyes X | `error`, `dead` | `CompanionFace.show("f_r7c2")` |
| 31 | `f_r7c3` | Surprised Wide | `listening`, `alert` | `CompanionFace.show("f_r7c3")` |

### Alias shortcuts (same faces, readable names)

```javascript
CompanionFace.show("idle");           // f_r0c0
CompanionFace.show("blink");          // f_r0c2  (also used automatically)
CompanionFace.show("typing");         // f_r1c1
CompanionFace.show("speaking_low");   // f_r2c0
CompanionFace.show("speaking_high");  // f_r2c1
CompanionFace.show("thinking");       // f_r5c1
CompanionFace.show("listening");      // f_r7c3
CompanionFace.show("error");          // f_r7c2
```

### Index shortcuts

```javascript
CompanionFace.show(0);    // f_r0c0
CompanionFace.show(31);   // f_r7c3
CompanionFace.show("14"); // f_r3c2
```

### Col, row shortcuts

```javascript
CompanionFace.show("0,0");  // f_r0c0
CompanionFace.show("2,5");  // f_r5c2
```

## Builtin auto-mode triggers

These names are used internally when `CompanionFace.release()` is active (no manual override):

| Builtin | Face ID | When |
|---------|---------|------|
| `idle` | `f_r0c0` | Default |
| `blink` | `f_r0c2` | Random ~3–5.5 s (shuffled 5/3/4 s pool) |
| `typing` | `f_r1c1` | Start / prompt open |
| `listening` | `f_r7c3` | Mic capture (A button) |
| `speaking_low` | `f_r2c0` | TTS (mouth closed-ish) |
| `speaking_high` | `f_r2c1` | TTS (mouth open-ish) |
| `thinking` | `f_r5c1` | Waiting on LLM |
| `error` | `f_r7c2` | Chat failure (~1.5 s flash) |

Inspect mapping: `CompanionFace.builtin()`.

## Demo: cycle every face

```javascript
let i = 0;
const t = setInterval(() => {
  CompanionFace.show(i);
  i += 1;
  if (i > 31) clearInterval(t);
}, 800);
```

## Adding aliases

Edit `companion/static/assets/face-sprites.json` — add strings to a face’s `aliases` array, reload the page. No JS change required.
