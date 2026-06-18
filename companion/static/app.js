const canvas = document.getElementById("face");
const ctx = canvas.getContext("2d");
const promptEl = document.getElementById("prompt");
const vkeyboard = document.getElementById("vkeyboard");
const shell = document.getElementById("gb-shell");
const shellImg = document.querySelector(".gb-shell-img");
const screenPrompt = document.getElementById("screen-prompt");
const batteryLed = document.getElementById("battery-led");

const LCD_W = 160;
const LCD_H = 144;

function setupCanvasDpr() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = LCD_W * dpr;
  canvas.height = LCD_H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return dpr;
}

setupCanvasDpr();

let promptOpen = false;
let micCancel = false;
let backendId = "lmstudio";
let backendOptions = [];

const W = LCD_W;
const H = LCD_H;

const PALETTE = { bg: "#9bbc0f" };

const BG_LS_KEY = "companion-bg-color-index";
const BG_SAVE_DELAY_MS = 10000;
const BG_COLORS = [
  "radial-gradient(circle at 50% 20%, #5a9ec4 0%, #2a6a8a 55%, #1a4055 100%)",
  "#0f380f",
  "#306230",
  "#8bac0f",
  "#9bbc0f",
  "#1a1a2e",
  "#16213e",
  "#2d1b69",
  "#4a1942",
  "#7b2d26",
  "#c84c09",
  "#f4a261",
  "#e9c46a",
  "#2a9d8f",
  "#264653",
  "#8338ec",
  "#ff006e",
  "#3a86ff",
  "#8ac926",
  "#ffca3a",
  "#6a4c93",
  "#1982c4",
  "#d62828",
  "#fcbf49",
  "#2d6a4f",
  "#40916c",
  "#95d5b2",
  "#f72585",
  "#7209b7",
  "#3d348b",
  "#7678ed",
  "#f7b801",
  "#023047",
  "#219ebc",
  "#ffb703",
  "#fb8500",
  "#000000",
  "#ffffff",
  "#1c1c1c",
  "#e8e8e8",
  "#b5651d",
  "#bc6c25",
  "#dda15e",
  "#606c38",
  "#283618",
  "#780000",
  "#c1121f",
  "#669bbc",
  "#003049",
];

let bgColorIndex = 0;
let bgSaveTimer = null;

function applyBgColor() {
  document.body.style.background = BG_COLORS[bgColorIndex];
}

function scheduleBgColorSave() {
  if (bgSaveTimer) clearTimeout(bgSaveTimer);
  bgSaveTimer = setTimeout(() => {
    localStorage.setItem(BG_LS_KEY, String(bgColorIndex));
    bgSaveTimer = null;
  }, BG_SAVE_DELAY_MS);
}

function cycleBgColor(delta) {
  if (partyActive) return;
  bgColorIndex = (bgColorIndex + delta + BG_COLORS.length) % BG_COLORS.length;
  applyBgColor();
  scheduleBgColorSave();
}

const SECRET_COMBO = ["start", "a", "a", "b", "b", "dpad_up", "dpad_down"];
const COMBO_WINDOW_MS = 5000;
const PARTY_DURATION_MS = 10000;
const PARTY_CYCLE_MS = 110;
const PARTY_NEON_COLORS = [
  "#ff00ff",
  "#00ffff",
  "#39ff14",
  "#ff073a",
  "#ffff00",
  "#bf00ff",
  "#ff10f0",
  "#00ff9f",
  "#ff6600",
  "#7df9ff",
  "#ccff00",
  "#fe019a",
  "#0ff0fc",
  "#ff6ec7",
  "#ffff00",
];

let partyActive = false;
let partyNeonIndex = 0;
let prePartyBgIndex = 0;
let partyEndTimer = null;
let partyCycleTimer = null;
let partyFaceTimer = null;
let partyFaceId = null;
const PARTY_FACE_HALF_MS = PARTY_DURATION_MS / 2;
/** Lower vomiting on LCD so eyes/mouth line up with mouth_full trim. */
const PARTY_VOMIT_Y_OFFSET = 12;
let comboProgress = 0;
let comboStartedAt = 0;

function applyPartyColor() {
  document.body.style.background = PARTY_NEON_COLORS[partyNeonIndex];
}

function endPartyMode() {
  if (!partyActive) return;
  partyActive = false;
  if (partyCycleTimer) clearInterval(partyCycleTimer);
  if (partyEndTimer) clearTimeout(partyEndTimer);
  if (partyFaceTimer) clearTimeout(partyFaceTimer);
  partyCycleTimer = null;
  partyEndTimer = null;
  partyFaceTimer = null;
  partyFaceId = null;
  bgColorIndex = prePartyBgIndex;
  applyBgColor();
}

function startPartyMode() {
  if (partyActive) return;
  partyActive = true;
  prePartyBgIndex = bgColorIndex;
  if (bgSaveTimer) clearTimeout(bgSaveTimer);
  closePrompt();
  promptEl.value = "";
  cancelIdleThought();
  partyFaceId = resolveFaceId("mouth_full") || "f_r5c1";
  if (partyFaceTimer) clearTimeout(partyFaceTimer);
  partyFaceTimer = setTimeout(() => {
    if (partyActive) partyFaceId = resolveFaceId("vomiting") || "f_r5c0";
  }, PARTY_FACE_HALF_MS);
  partyNeonIndex = 0;
  applyPartyColor();
  partyCycleTimer = setInterval(() => {
    partyNeonIndex = (partyNeonIndex + 1) % PARTY_NEON_COLORS.length;
    applyPartyColor();
  }, PARTY_CYCLE_MS);
  partyEndTimer = setTimeout(endPartyMode, PARTY_DURATION_MS);
}

/** @returns {"match" | "party" | "miss"} */
function trackSecretCombo(id) {
  if (overlayEditMode || partyActive) return "miss";
  const now = performance.now();
  if (comboProgress > 0 && now - comboStartedAt > COMBO_WINDOW_MS) comboProgress = 0;
  if (id === SECRET_COMBO[comboProgress]) {
    if (comboProgress === 0) comboStartedAt = now;
    comboProgress += 1;
    if (comboProgress >= SECRET_COMBO.length) {
      comboProgress = 0;
      startPartyMode();
      return "party";
    }
    return "match";
  }
  comboProgress = id === SECRET_COMBO[0] ? 1 : 0;
  if (comboProgress === 1) comboStartedAt = now;
  return "miss";
}

function loadBgColorIndex() {
  try {
    const saved = localStorage.getItem(BG_LS_KEY);
    if (saved !== null) {
      const idx = Number(saved);
      if (Number.isInteger(idx) && idx >= 0 && idx < BG_COLORS.length) bgColorIndex = idx;
    }
  } catch {
    /* ponytail: localStorage may be blocked in some embed contexts */
  }
  applyBgColor();
}

loadBgColorIndex();

const faceImages = new Map();
let spriteMeta = null;
let facesReady = false;
const frameTrims = new Map();
const faceById = new Map();
const aliasToId = new Map();
let faceLayout = null;
let activeFaceId = "f_r0c0";
let lastFaceSource = "auto";

const faceDriver = {
  mode: "auto",
  manualId: null,
  manualUntil: 0,
};

const face = {
  blinkTimer: 1.5,
  blinkClose: 0,
  speaking: false,
  listening: false,
  thinking: false,
  errorFlash: 0,
  idleThoughtId: null,
  idleThoughtUntil: 0,
  idleThoughtTimer: 60,
};

let blinkDelayPool = [];
let idleThoughtPool = [];

function nextIdleThoughtDelay() {
  const buckets = [
    () => 30 + Math.random() * 45,
    () => 55 + Math.random() * 80,
    () => 90 + Math.random() * 150,
    () => 150 + Math.random() * 210,
    () => 240 + Math.random() * 360,
  ];
  return buckets[Math.floor(Math.random() * buckets.length)]();
}

function randomThoughtDurationSec() {
  return 2 + Math.random() * 3;
}

function scheduleIdleThought() {
  face.idleThoughtTimer = nextIdleThoughtDelay();
}

function cancelIdleThought() {
  face.idleThoughtId = null;
  face.idleThoughtUntil = 0;
  scheduleIdleThought();
}

function canIdleThought() {
  return (
    !face.speaking &&
    !face.listening &&
    !face.thinking &&
    !promptOpen &&
    face.errorFlash <= 0 &&
    faceDriver.mode === "auto"
  );
}

scheduleIdleThought();

function shuffleBlinkDelays() {
  const base = [5, 3, 4, 5, 3, 4, 4.5, 5.5, 3.5];
  blinkDelayPool = base
    .concat(base.map((n) => n + 0.4 * (Math.random() - 0.5)))
    .sort(() => Math.random() - 0.5);
}

function nextBlinkInterval() {
  if (!blinkDelayPool.length) shuffleBlinkDelays();
  const pick = blinkDelayPool.pop();
  return Math.max(2.5, pick + (Math.random() - 0.5) * 0.5);
}

shuffleBlinkDelays();
face.blinkTimer = nextBlinkInterval();

let audioCtx = null;
let analyser = null;
let speakingFaceId = "f_r0c0";
let speakingLevel = 0;
let speakingPrevLevel = 0;
let speakTimeBuf = null;
let speakFreqBuf = null;

// lipsync-start
const SPEAK_FACE = {
  closed: "f_r0c0",
  low: "f_r2c0",
  high: "f_r2c1",
  inflection: "f_r3c0",
};

function pickSpeakingFace({ rms = 0, rmsDelta = 0 } = {}) {
  if (rmsDelta > 0.06 && rms > 0.1) return SPEAK_FACE.inflection;
  if (rms < 0.06) return SPEAK_FACE.closed;
  if (rms < 0.22) return SPEAK_FACE.low;
  return SPEAK_FACE.high;
}

function sampleSpeakingMetrics(timeDomain, frequency) {
  let sumSq = 0;
  const n = timeDomain.length;
  for (let i = 0; i < n; i += 1) {
    const v = (timeDomain[i] - 128) / 128;
    sumSq += v * v;
  }
  const rms = Math.sqrt(sumSq / n);
  const bins = frequency.length;
  let low = 0;
  let mid = 0;
  let high = 0;
  const lowEnd = Math.max(2, Math.floor(bins * 0.12));
  const midEnd = Math.floor(bins * 0.45);
  for (let i = 1; i < bins; i += 1) {
    const v = frequency[i];
    if (i < lowEnd) low += v;
    else if (i < midEnd) mid += v;
    else high += v;
  }
  const total = low + mid + high || 1;
  return {
    rms,
    lowShare: low / total,
    midShare: mid / total,
    highShare: high / total,
  };
}
// lipsync-end

const KEY_ROWS = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  ["⇧", ..."ZXCVBNM".split(""), "⌫"],
  ["🎤", "space", "↵"],
];

function setStatus(_msg) {
  /* ponytail: system health is battery LED only; no status line */
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function loadFaceSprites() {
  const res = await fetch("/assets/face-sprites.json");
  spriteMeta = await res.json();
  const loads = Object.entries(spriteMeta.faces).map(async ([id, spec]) => {
    const file = spec.file || `faces/${id}.png`;
    const img = await loadImage(`/assets/${file}`);
    faceImages.set(id, img);
  });
  await Promise.all(loads);
  facesReady = true;
  buildFaceIndex();
  cacheFrameTrims();
  faceLayout = computeFaceLayout();
}

function buildFaceIndex() {
  faceById.clear();
  aliasToId.clear();
  for (const [id, spec] of Object.entries(spriteMeta.faces)) {
    faceById.set(id, spec);
    aliasToId.set(id, id);
    for (const alias of spec.aliases || []) aliasToId.set(alias, id);
  }
  for (const [trigger, id] of Object.entries(spriteMeta.builtin)) {
    aliasToId.set(trigger, id);
  }
  idleThoughtPool = (spriteMeta.idleThoughts || []).filter((id) => faceById.has(id));
}

function resolveFaceId(name) {
  if (name == null) return null;
  if (typeof name === "number" && Number.isInteger(name) && name >= 0 && name < 32) {
    const row = Math.floor(name / 4);
    const col = name % 4;
    return `f_r${row}c${col}`;
  }
  const key = String(name).trim();
  if (/^\d+$/.test(key)) {
    const idx = Number(key);
    if (idx >= 0 && idx < 32) {
      const row = Math.floor(idx / 4);
      const col = idx % 4;
      return `f_r${row}c${col}`;
    }
  }
  if (aliasToId.has(key)) return aliasToId.get(key);
  const m = /^(\d+)\s*,\s*(\d+)$/.exec(key);
  if (m) return aliasToId.get(`f_r${m[2]}c${m[1]}`) || `f_r${m[2]}c${m[1]}`;
  const grid = /^f_r(\d+)c(\d+)$/i.exec(key);
  if (grid && faceById.has(`f_r${grid[1]}c${grid[2]}`)) return `f_r${grid[1]}c${grid[2]}`;
  return faceById.has(key) ? key : null;
}

function faceCoords(id) {
  const spec = faceById.get(id);
  return spec ? [spec.col, spec.row] : null;
}

function computeFaceLayout() {
  const ratio = spriteMeta.layout?.faceZoneRatio ?? 0.78;
  const pad = spriteMeta.layout?.pad ?? 8;
  const faceZoneH = H * ratio;
  let maxW = 1;
  let maxH = 1;
  for (const trim of frameTrims.values()) {
    maxW = Math.max(maxW, trim.sw);
    maxH = Math.max(maxH, trim.sh);
  }
  const scale = Math.min((W - pad * 2) / maxW, (faceZoneH - pad * 2) / maxH);
  return {
    dx: (W - maxW * scale) / 2,
    dy: (faceZoneH - maxH * scale) / 2,
    dw: maxW * scale,
    dh: maxH * scale,
    faceZoneH,
  };
}

function cacheFrameTrims() {
  frameTrims.clear();
  const probe = document.createElement("canvas");
  const pctx = probe.getContext("2d", { willReadFrequently: true });

  for (const [id, img] of faceImages) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    probe.width = iw;
    probe.height = ih;
    pctx.clearRect(0, 0, iw, ih);
    pctx.drawImage(img, 0, 0);
    const { data } = pctx.getImageData(0, 0, iw, ih);
    let minX = iw;
    let minY = ih;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < ih; y += 1) {
      for (let x = 0; x < iw; x += 1) {
        if (data[(y * iw + x) * 4 + 3] > 24) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    frameTrims.set(
      id,
      maxX >= 0
        ? { sx: minX, sy: minY, sw: maxX - minX + 1, sh: maxY - minY + 1 }
        : { sx: 0, sy: 0, sw: iw, sh: ih },
    );
  }
  faceLayout = computeFaceLayout();
}

function trimForFaceId(id) {
  return frameTrims.get(id) || null;
}

function drawTrimmedFace(id, trim, yOffset = 0) {
  const img = faceImages.get(id);
  if (!img || !trim || !faceLayout) return;
  const { dx, dy, dw, dh } = faceLayout;
  const scale = Math.min(dw / trim.sw, dh / trim.sh);
  const rw = trim.sw * scale;
  const rh = trim.sh * scale;
  const ox = dx + (dw - rw) / 2;
  const oy = dy + (dh - rh) / 2 + yOffset;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, trim.sx, trim.sy, trim.sw, trim.sh, ox, oy, rw, rh);
}

function emitFaceChange(id, source) {
  if (id === activeFaceId && source === lastFaceSource) return;
  activeFaceId = id;
  lastFaceSource = source;
  window.dispatchEvent(
    new CustomEvent("companion:face", {
      detail: { id, source, spec: faceById.get(id) || null },
    }),
  );
}

function pickAutoFaceId() {
  if (partyActive && partyFaceId) return partyFaceId;
  const b = spriteMeta.builtin;
  if (face.errorFlash > 0) return b.error;
  if (face.speaking) return speakingFaceId || b.speaking_low;
  if (face.listening) return b.listening;
  if (face.thinking) return b.thinking;
  if (promptOpen) return b.typing;
  if (face.blinkClose > 0.5) return b.blink;
  if (face.idleThoughtId) return face.idleThoughtId;
  return b.idle;
}

function pickFaceId() {
  if (faceDriver.mode === "manual") {
    if (faceDriver.manualUntil > 0 && performance.now() >= faceDriver.manualUntil) {
      releaseFace("timeout");
    } else if (faceDriver.manualId) {
      return faceDriver.manualId;
    }
  }
  return pickAutoFaceId();
}

function drawFace() {
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, W, H);
  if (!spriteMeta || !facesReady || !faceLayout) return;

  const id = pickFaceId();
  const trim = trimForFaceId(id);
  if (!trim) return;

  const vomitingId = resolveFaceId("vomiting") || "f_r5c0";
  const yOffset = partyActive && id === vomitingId ? PARTY_VOMIT_Y_OFFSET : 0;
  drawTrimmedFace(id, trim, yOffset);
  emitFaceChange(id, faceDriver.mode === "manual" ? "manual" : partyActive ? "party" : face.idleThoughtId ? "idle-thought" : "auto");
}

function showFace(name, opts = {}) {
  const id = resolveFaceId(name);
  if (!id) throw new Error(`Unknown face: ${name}`);
  faceDriver.mode = "manual";
  faceDriver.manualId = id;
  faceDriver.manualUntil = opts.durationMs ? performance.now() + opts.durationMs : 0;
  emitFaceChange(id, "manual");
  return id;
}

function releaseFace(_reason = "release") {
  faceDriver.mode = "auto";
  faceDriver.manualId = null;
  faceDriver.manualUntil = 0;
}

function listFaces() {
  return [...faceById.entries()].map(([id, spec]) => ({
    id,
    col: spec.col,
    row: spec.row,
    label: spec.label,
    aliases: spec.aliases || [],
  }));
}

function getActiveFace() {
  return {
    id: activeFaceId,
    source: lastFaceSource,
    spec: faceById.get(activeFaceId) || null,
    mode: faceDriver.mode,
  };
}

window.CompanionFace = {
  show: showFace,
  trigger: showFace,
  release: releaseFace,
  auto: releaseFace,
  resolve: resolveFaceId,
  list: listFaces,
  getActive: getActiveFace,
  builtin: () => ({ ...spriteMeta?.builtin }),
};

window.addEventListener("companion:face-request", (event) => {
  const detail = event.detail || {};
  if (detail.release || detail.auto) {
    releaseFace("event");
    return;
  }
  if (detail.id != null) {
    try {
      showFace(detail.id, { durationMs: detail.durationMs });
    } catch {
      /* ignore unknown ids from embedders */
    }
  }
});

function tickIdleThought(dt) {
  if (!canIdleThought()) {
    if (face.idleThoughtId) cancelIdleThought();
    return;
  }
  const now = performance.now();
  if (face.idleThoughtId) {
    if (now >= face.idleThoughtUntil) {
      face.idleThoughtId = null;
      face.idleThoughtUntil = 0;
      scheduleIdleThought();
    }
    return;
  }
  face.idleThoughtTimer -= dt;
  if (face.idleThoughtTimer > 0 || !idleThoughtPool.length) return;
  face.idleThoughtId = idleThoughtPool[Math.floor(Math.random() * idleThoughtPool.length)];
  face.idleThoughtUntil = now + randomThoughtDurationSec() * 1000;
}

function tickFace(dt) {
  face.blinkTimer -= dt;
  if (face.blinkTimer <= 0) {
    if (face.blinkClose > 0) {
      face.blinkClose = 0;
      face.blinkTimer = nextBlinkInterval();
    } else {
      face.blinkClose = 1;
      face.blinkTimer = 0.07 + Math.random() * 0.05;
    }
  }
  tickIdleThought(dt);
  if (face.speaking) updateSpeakingLipSync();
  if (face.errorFlash > 0) face.errorFlash = Math.max(0, face.errorFlash - dt);
}

function updateSpeakingLipSync() {
  if (!analyser) {
    speakingFaceId = spriteMeta?.builtin?.speaking_closed || SPEAK_FACE.closed;
    return;
  }
  const n = analyser.fftSize;
  if (!speakTimeBuf || speakTimeBuf.length !== n) {
    speakTimeBuf = new Uint8Array(n);
    speakFreqBuf = new Uint8Array(analyser.frequencyBinCount);
  }
  analyser.getByteTimeDomainData(speakTimeBuf);
  analyser.getByteFrequencyData(speakFreqBuf);
  const metrics = sampleSpeakingMetrics(speakTimeBuf, speakFreqBuf);
  const rmsDelta = metrics.rms - speakingPrevLevel;
  speakingPrevLevel = metrics.rms;
  speakingLevel = speakingLevel * 0.6 + metrics.rms * 0.4;
  speakingFaceId = pickSpeakingFace({ rms: speakingLevel, rmsDelta: Math.max(0, rmsDelta) });
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  tickFace(dt);
  drawFace();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function setBatteryLed(ok) {
  if (!batteryLed) return;
  batteryLed.classList.remove("ok", "error");
  batteryLed.classList.add(ok ? "ok" : "error");
}

async function refreshSystemStatus() {
  if (!batteryLed) return false;
  try {
    const [hres, bres] = await Promise.all([
      fetch("/api/health"),
      fetch("/api/backends"),
    ]);
    const h = await hres.json();
    const rawBackends = await bres.json();
    const backends = Array.isArray(rawBackends) ? rawBackends : [];
    const hasBackend = backends.some((b) => b.available);
    const issues = [];
    if (!hres.ok) issues.push("health API error");
    if (!h.piper_model) issues.push("Piper model missing");
    if (!h.whisper) issues.push("Whisper not configured");
    if (!hasBackend) issues.push("No chat backend");
    const ok = issues.length === 0;
    setBatteryLed(ok);
    batteryLed.title = ok ? "All systems OK" : issues.join(" · ");
    return ok;
  } catch (err) {
    setBatteryLed(false);
    batteryLed.title = `Status check failed: ${err.message}`;
    return false;
  }
}

const OVERLAY_LS_KEY = "companion-overlay-overrides";
let viewportMeta = null;
let shellMetrics = null;
let overlayOverrides = {};
let overlayEditMode = false;
const overlayBoxes = new Map();

async function loadOverlayOverridesFromServer() {
  try {
    const res = await fetch("/api/overlay-overrides");
    if (res.ok) {
      const data = await res.json();
      if (data?.buttons && Object.keys(data.buttons).length) return data.buttons;
    }
  } catch {
    /* offline */
  }
  try {
    const local = JSON.parse(localStorage.getItem(OVERLAY_LS_KEY) || "{}");
    return local.buttons || local;
  } catch {
    return {};
  }
}

async function persistOverlayOverrides(showAlert = false) {
  const payload = { buttons: overlayOverrides };
  localStorage.setItem(OVERLAY_LS_KEY, JSON.stringify(payload));
  try {
    const res = await fetch("/api/overlay-overrides", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (showAlert && res.ok) window.alert("Button overlays saved.");
  } catch {
    if (showAlert) window.alert("Saved locally (server unreachable).");
  }
}

function mergeOverlayBox(base, id) {
  const o = overlayOverrides[id];
  if (!o) return { ...base };
  return {
    x: o.x ?? base.x,
    y: o.y ?? base.y,
    w: o.w ?? base.w,
    h: o.h ?? base.h,
  };
}

function setOverlayBox(id, box) {
  overlayOverrides[id] = {
    x: Math.round(box.x),
    y: Math.round(box.y),
    w: Math.round(box.w),
    h: Math.round(box.h),
  };
  const entry = overlayBoxes.get(id);
  if (entry) entry.box = { ...overlayOverrides[id] };
  if (shellMetrics && entry?.el) placeShellBox(entry.el, overlayOverrides[id], shellMetrics);
}

async function applyOverlayViewport() {
  try {
    const res = await fetch("/assets/overlay-viewport.json");
    viewportMeta = await res.json();
    overlayOverrides = await loadOverlayOverridesFromServer();
    if (!shellImg?.naturalWidth) {
      await new Promise((resolve) => {
        if (shellImg.complete) resolve();
        else shellImg.onload = resolve;
      });
    }

    shellMetrics = shellImageMetrics(viewportMeta);
    overlayBoxes.clear();

    const placeId = (id, el, base) => {
      if (!el || !base) return;
      const box = mergeOverlayBox(base, id);
      overlayBoxes.set(id, { el, base, box });
      placeShellBox(el, box, shellMetrics);
    };

    placeId("lcd", document.getElementById("face"), viewportMeta.lcd);
    placeId("battery_led", batteryLed, viewportMeta.battery_led);
    placeId("lcd_prompt", screenPrompt, {
      x: viewportMeta.lcd.x,
      y: viewportMeta.lcd.y + viewportMeta.lcd.h * 0.75,
      w: viewportMeta.lcd.w,
      h: viewportMeta.lcd.h * 0.25,
    });

    placeId("power_off", document.getElementById("btn-power-off"), viewportMeta.buttons.power_off);
    placeId("power_on", document.getElementById("btn-power-on"), viewportMeta.buttons.power_on);
    placeId("select", document.getElementById("btn-select"), viewportMeta.buttons.select);
    placeId("start", document.getElementById("btn-start"), viewportMeta.buttons.start);
    placeId("a", document.getElementById("btn-a"), viewportMeta.buttons.a);
    placeId("b", document.getElementById("btn-b"), viewportMeta.buttons.b);
    placeId("phones", document.getElementById("btn-phones"), viewportMeta.buttons.phones);
    placeId("speaker", document.getElementById("btn-speaker"), viewportMeta.buttons.speaker);
    placeId("dpad_up", document.querySelector(".hit.dpad.up"), viewportMeta.buttons.dpad.up);
    placeId("dpad_down", document.querySelector(".hit.dpad.down"), viewportMeta.buttons.dpad.down);
    placeId("dpad_left", document.querySelector(".hit.dpad.left"), viewportMeta.buttons.dpad.left);
    placeId("dpad_right", document.querySelector(".hit.dpad.right"), viewportMeta.buttons.dpad.right);

    if (overlayEditMode) window.CompanionOverlayCalibrate?.enable();
    shell.classList.add("overlay-ready");
  } catch (err) {
    console.warn("overlay viewport failed", err);
    shell.classList.add("overlay-ready");
  }
}

async function resetOverlayOverrides() {
  overlayOverrides = {};
  localStorage.removeItem(OVERLAY_LS_KEY);
  try {
    await fetch("/api/overlay-overrides", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buttons: {} }),
    });
  } catch {
    /* local reset still applies */
  }
  await applyOverlayViewport();
}

window.__companionOverlay = {
  getMeta: () => viewportMeta,
  getMetrics: () => (viewportMeta ? shellImageMetrics(viewportMeta) : shellMetrics),
  getOverrides: () => ({ buttons: { ...overlayOverrides } }),
  getBox: (id) => ({ ...(overlayBoxes.get(id)?.box || overlayOverrides[id]) }),
  setBox: setOverlayBox,
  saveOverrides: persistOverlayOverrides,
  resetOverrides: resetOverlayOverrides,
  ids: () => OVERLAY_CALIBRATE_IDS,
  element: (id) => overlayBoxes.get(id)?.el || document.querySelector(`[data-btn="${id}"]`),
};

function shellImageMetrics(meta) {
  const shellRect = shell.getBoundingClientRect();
  const imgRect = shellImg.getBoundingClientRect();
  const nw = meta.width;
  const nh = meta.height;
  const fit = getComputedStyle(shellImg).objectFit || "fill";
  let scaleX;
  let scaleY;
  let offsetX = 0;
  let offsetY = 0;

  if (fit === "contain") {
    const scale = Math.min(imgRect.width / nw, imgRect.height / nh);
    scaleX = scale;
    scaleY = scale;
    offsetX = (imgRect.width - nw * scale) / 2;
    offsetY = (imgRect.height - nh * scale) / 2;
  } else {
    scaleX = imgRect.width / nw;
    scaleY = imgRect.height / nh;
  }

  return {
    baseLeft: imgRect.left - shellRect.left,
    baseTop: imgRect.top - shellRect.top,
    offsetX,
    offsetY,
    scaleX,
    scaleY,
  };
}

function placeShellBox(el, box, metrics) {
  const { baseLeft, baseTop, offsetX, offsetY, scaleX, scaleY } = metrics;
  el.style.left = `${baseLeft + offsetX + box.x * scaleX}px`;
  el.style.top = `${baseTop + offsetY + box.y * scaleY}px`;
  el.style.width = `${box.w * scaleX}px`;
  el.style.height = `${box.h * scaleY}px`;
}

function openPrompt() {
  promptOpen = true;
  screenPrompt.classList.remove("hidden");
  screenPrompt.setAttribute("aria-hidden", "false");
  promptEl.focus();
  showKeyboard(true);
}

function closePrompt() {
  promptOpen = false;
  screenPrompt.classList.add("hidden");
  screenPrompt.setAttribute("aria-hidden", "true");
  promptEl.blur();
  showKeyboard(false);
}

function cancelAll() {
  micCancel = true;
  if (micActive) {
    micActive = false;
    finishMicCapture();
  }
  face.listening = false;
  promptEl.value = "";
  closePrompt();
  setStatus("");
}

async function newChatSession() {
  micCancel = true;
  if (micActive) {
    micActive = false;
    finishMicCapture();
  }
  face.listening = false;
  promptEl.value = "";
  closePrompt();
  cancelIdleThought();
  try {
    await fetch("/api/chat/session/reset", { method: "POST" });
  } catch {
    /* offline or echo backend */
  }
  setStatus("");
}

function onButtonA() {
  if (micActive) {
    micCancel = false;
    micActive = false;
    finishMicCapture();
    return;
  }
  micCancel = false;
  toggleMic();
}

function buildKeyboard() {
  vkeyboard.innerHTML = "";
  KEY_ROWS.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "row";
    row.forEach((key) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = key === "space" ? "space" : key;
      if (key === "space") btn.classList.add("wide");
      btn.addEventListener("click", () => handleKey(key));
      rowEl.appendChild(btn);
    });
    vkeyboard.appendChild(rowEl);
  });
}

let shift = false;
function handleKey(key) {
  if (key === "⌫") {
    promptEl.value = promptEl.value.slice(0, -1);
  } else if (key === "↵") {
    submitPrompt();
  } else if (key === "🎤") {
    toggleMic();
  } else if (key === "⇧") {
    shift = !shift;
  } else if (key === "space") {
    promptEl.value += " ";
  } else {
    promptEl.value += shift ? key : key.toLowerCase();
    shift = false;
  }
  promptEl.focus();
}

function showKeyboard(show) {
  vkeyboard.classList.toggle("hidden", !show);
  vkeyboard.setAttribute("aria-hidden", show ? "false" : "true");
  document.body.classList.toggle("keyboard-open", show);
}

promptEl.addEventListener("focus", () => {
  if (promptOpen) showKeyboard(true);
});
promptEl.addEventListener("blur", () => {
  setTimeout(() => {
    if (!promptOpen) return;
    if (document.activeElement !== promptEl && !vkeyboard.contains(document.activeElement)) {
      showKeyboard(false);
    }
  }, 150);
});

async function loadBackends() {
  const res = await fetch("/api/backends");
  const items = await res.json();
  backendOptions = items.filter((b) => b.available);
  if (backendOptions.length) backendId = backendOptions[0].id;
  await refreshSystemStatus();
}

function cycleBackend() {
  if (backendOptions.length < 2) return;
  const idx = backendOptions.findIndex((b) => b.id === backendId);
  backendId = backendOptions[(idx + 1) % backendOptions.length].id;
}

async function speak(text) {
  face.speaking = true;
  speakingLevel = 0;
  speakingPrevLevel = 0;
  speakingFaceId = spriteMeta?.builtin?.speaking_closed || SPEAK_FACE.closed;
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(await res.text());
    const blob = await res.blob();
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === "suspended") await audioCtx.resume();
    const buf = await blob.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(buf.slice(0));
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = 1.12;
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    await new Promise((resolve) => {
      source.onended = resolve;
      source.start(0);
    });
  } catch (err) {
    setStatus(`TTS error: ${err.message}`);
  } finally {
    face.speaking = false;
    analyser = null;
    speakingLevel = 0;
    speakingPrevLevel = 0;
    speakingFaceId = spriteMeta?.builtin?.speaking_closed || SPEAK_FACE.closed;
  }
}

async function submitPrompt() {
  const prompt = promptEl.value.trim();
  if (!prompt) return;
  const backend = backendId;
  document.getElementById("btn-start").disabled = true;
  face.listening = false;
  face.thinking = true;
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, backend }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.detail || res.statusText);
    promptEl.value = "";
    closePrompt();
    setStatus(body.text.slice(0, 80) + (body.text.length > 80 ? "…" : ""));
    face.thinking = false;
    await speak(body.text);
  } catch (err) {
    face.errorFlash = 1.5;
    setStatus(`Chat error: ${err.message}`);
  } finally {
    face.thinking = false;
    document.getElementById("btn-start").disabled = false;
  }
}

promptEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitPrompt();
});

let micActive = false;
let micStream = null;
let micAudioCtx = null;
let micSource = null;
let micProcessor = null;
let micSampleRate = 16000;
let micBuffers = [];

function encodeMicWav(chunks, sampleRate) {
  let length = 0;
  for (const chunk of chunks) length += chunk.length;
  const pcm = new Int16Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.length; i += 1) {
      const s = Math.max(-1, Math.min(1, chunk[i]));
      pcm[offset] = s < 0 ? s * 0x8000 : s * 0x7fff;
      offset += 1;
    }
  }
  const buf = new ArrayBuffer(44 + pcm.length * 2);
  const view = new DataView(buf);
  const writeStr = (pos, str) => {
    for (let i = 0; i < str.length; i += 1) view.setUint8(pos + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + pcm.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, pcm.length * 2, true);
  for (let i = 0; i < pcm.length; i += 1) view.setInt16(44 + i * 2, pcm[i], true);
  return new Blob([buf], { type: "audio/wav" });
}

function stopMicHardware() {
  micProcessor?.disconnect();
  micSource?.disconnect();
  micStream?.getTracks().forEach((t) => t.stop());
  if (micAudioCtx && micAudioCtx.state !== "closed") {
    micAudioCtx.close().catch(() => {});
  }
  micProcessor = null;
  micSource = null;
  micStream = null;
  micAudioCtx = null;
}

async function toggleMic() {
  if (micActive) return;
  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    });
    micBuffers = [];
    micAudioCtx = new AudioContext();
    micSampleRate = micAudioCtx.sampleRate;
    micSource = micAudioCtx.createMediaStreamSource(micStream);
    micProcessor = micAudioCtx.createScriptProcessor(4096, 1, 1);
    micProcessor.onaudioprocess = (e) => {
      if (!micActive) return;
      micBuffers.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    };
    micSource.connect(micProcessor);
    micProcessor.connect(micAudioCtx.destination);
    micActive = true;
    face.listening = true;
    setStatus("Listening...");
  } catch (err) {
    stopMicHardware();
    micActive = false;
    setStatus(`Mic error: ${err.message}`);
  }
}

async function finishMicCapture() {
  const wav = encodeMicWav(micBuffers, micSampleRate);
  micBuffers = [];
  stopMicHardware();
  face.listening = false;
  if (micCancel) {
    micCancel = false;
    setStatus("");
    return;
  }
  face.thinking = true;
  setStatus("Transcribing...");
  const fd = new FormData();
  fd.append("file", wav, "clip.wav");
  try {
    const res = await fetch("/api/stt", { method: "POST", body: fd });
    const body = await res.json();
    if (!res.ok) throw new Error(body.detail || res.statusText);
    promptEl.value = body.text || "";
    if (body.text) await submitPrompt();
    else setStatus("No speech detected");
  } catch (err) {
    setStatus(`STT error: ${err.message}`);
  } finally {
    face.thinking = false;
  }
}

const BUTTON_IDS = [
  "power_off",
  "power_on",
  "dpad_up",
  "dpad_down",
  "dpad_left",
  "dpad_right",
  "select",
  "start",
  "a",
  "b",
  "phones",
  "speaker",
];

const OVERLAY_CALIBRATE_IDS = [...BUTTON_IDS, "battery_led"];

const buttonActionDocs = {
  power_off: "Hide red hit-box debug overlay",
  power_on: "Show all button hit boxes in red",
  dpad_up: "Prompt closed: open keyboard. Prompt open: no-op",
  dpad_down: "Prompt open: submit. Prompt closed: no-op",
  dpad_left: "Prompt open: backspace. Prompt closed: previous background color",
  dpad_right: "Prompt open: space. Prompt closed: next background color",
  select: "Cycle LLM backend (silent)",
  start: "Prompt closed: new LM Studio chat + keyboard. Prompt open: submit",
  a: "Voice: start/stop mic and send",
  b: "Cancel mic, text, and prompt",
  phones: "Reserved — emits event only (PHONES overlay)",
  speaker: "Reserved — emits event only (speaker grille overlay)",
};

const customButtonHandlers = new Map();

function setHitDebug(on) {
  overlayEditMode = Boolean(on);
  shell.classList.toggle("show-hit-debug", overlayEditMode);
  if (overlayEditMode) {
    window.CompanionOverlayCalibrate?.enable();
  } else {
    window.CompanionOverlayCalibrate?.disable();
    persistOverlayOverrides();
  }
}

function emitButton(id) {
  window.dispatchEvent(new CustomEvent("companion:button", { detail: { id } }));
}

function defaultButtonAction(id, comboStep = "miss") {
  switch (id) {
    case "start":
      if (partyActive || comboStep === "party") break;
      if (promptOpen) submitPrompt();
      else newChatSession().then(() => openPrompt());
      break;
    case "select":
      cycleBackend();
      break;
    case "a":
      if (!partyActive) onButtonA();
      break;
    case "b":
      if (!partyActive) cancelAll();
      break;
    case "dpad_up":
      if (!promptOpen && !partyActive) openPrompt();
      break;
    case "dpad_down":
      if (promptOpen && !partyActive) submitPrompt();
      break;
    case "dpad_left":
      if (partyActive) break;
      if (promptOpen) {
        promptEl.value = promptEl.value.slice(0, -1);
        promptEl.focus();
      } else {
        cycleBgColor(-1);
      }
      break;
    case "dpad_right":
      if (partyActive) break;
      if (promptOpen) {
        promptEl.value += " ";
        promptEl.focus();
      } else {
        cycleBgColor(1);
      }
      break;
    case "power_on":
      setHitDebug(true);
      break;
    case "power_off":
      setHitDebug(false);
      break;
    case "phones":
    case "speaker":
      break;
    default:
      break;
  }
}

function handleButtonPress(id) {
  if (overlayEditMode && id !== "power_off" && id !== "power_on") return;
  const comboStep = trackSecretCombo(id);
  emitButton(id);
  if (customButtonHandlers.has(id)) {
    customButtonHandlers.get(id)();
    return;
  }
  defaultButtonAction(id, comboStep);
}

function wireShellButtons() {
  document.querySelectorAll(".gb-hit-layer [data-btn]").forEach((el) => {
    const id = el.dataset.btn;
    el.addEventListener("click", () => handleButtonPress(id));
  });
}

function onShellButton(id, handler) {
  customButtonHandlers.set(id, handler);
}

function offShellButton(id) {
  customButtonHandlers.delete(id);
}

function pressButton(id) {
  const el = document.querySelector(`.gb-hit-layer [data-btn="${id}"]`);
  if (el) el.click();
}

function listButtons() {
  return BUTTON_IDS.map((id) => ({ id, action: buttonActionDocs[id] || "" }));
}

window.CompanionButtons = {
  on: onShellButton,
  off: offShellButton,
  press: pressButton,
  list: listButtons,
  ids: () => [...BUTTON_IDS],
  showHitDebug: () => setHitDebug(true),
  hideHitDebug: () => setHitDebug(false),
  hitDebugVisible: () => shell.classList.contains("show-hit-debug"),
  getOverlayOverrides: () => ({ ...overlayOverrides }),
  saveOverlayOverrides: () => persistOverlayOverrides(true),
  resetOverlayOverrides: resetOverlayOverrides,
};

window.addEventListener("companion:button-request", (event) => {
  const id = event.detail?.id;
  if (id && BUTTON_IDS.includes(id)) pressButton(id);
});

wireShellButtons();

buildKeyboard();
applyOverlayViewport();
window.addEventListener("resize", applyOverlayViewport);
refreshSystemStatus();
setInterval(refreshSystemStatus, 30000);
loadFaceSprites()
  .then(() => {
    if (faceById.size !== 32) {
      console.warn(`CompanionFace: expected 32 faces, got ${faceById.size}`);
    }
    loadBackends().catch((err) => console.warn("Companion: backends load failed", err));
  })
  .catch((err) => console.error("Companion: face sprites load failed", err));
