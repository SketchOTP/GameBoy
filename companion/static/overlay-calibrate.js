/** Drag/resize hit boxes when ON (debug) is active. */
(function initOverlayCalibrate() {
  const shell = document.getElementById("gb-shell");
  const MIN = 20;
  const MIN_BY_ID = { battery_led: 6 };

  function minSize(id) {
    return MIN_BY_ID[id] ?? MIN;
  }
  let enabled = false;
  let drag = null;
  let moved = false;

  function deps() {
    return window.__companionOverlay;
  }

  function labelFor(id) {
    return id.replace(/_/g, " ");
  }

  function decorate(el, id) {
    if (el.querySelector(".ovl-label")) return;
    const label = document.createElement("span");
    label.className = "ovl-label";
    label.textContent = labelFor(id);
    const handle = document.createElement("span");
    handle.className = "ovl-resize";
    handle.setAttribute("aria-hidden", "true");
    el.appendChild(label);
    el.appendChild(handle);
  }

  function undecorate(el) {
    el.querySelectorAll(".ovl-label, .ovl-resize").forEach((n) => n.remove());
  }

  function onPointerDown(e) {
    const d = deps();
    if (!enabled || !d) return;
    const el = e.currentTarget;
    const id = el.dataset.btn;
    if (!id) return;

    const resize = e.target.classList.contains("ovl-resize");
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const box = { ...d.getBox(id) };
    const metrics = d.getMetrics();
    drag = {
      id,
      el,
      resize,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origin: box,
      metrics,
    };
    moved = false;
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!drag) return;
    const d = deps();
    const { id, resize, startClientX, startClientY, origin, metrics } = drag;
    const dx = (e.clientX - startClientX) / metrics.scaleX;
    const dy = (e.clientY - startClientY) / metrics.scaleY;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) moved = true;

    let next;
    if (resize) {
      const min = minSize(id);
      next = {
        ...origin,
        w: Math.max(min, Math.round(origin.w + dx)),
        h: Math.max(min, Math.round(origin.h + dy)),
      };
    } else {
      next = {
        ...origin,
        x: Math.round(origin.x + dx),
        y: Math.round(origin.y + dy),
      };
    }
    d.setBox(id, next);
  }

  function onPointerUp(e) {
    if (!drag) return;
    const d = deps();
    drag.el.releasePointerCapture(e.pointerId);
    if (moved && d) d.saveOverrides();
    drag = null;
  }

  function bindEl(el) {
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener(
      "click",
      (e) => {
        if (enabled && moved) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      },
      true,
    );
  }

  function unbindEl(el) {
    el.removeEventListener("pointerdown", onPointerDown);
    el.removeEventListener("pointermove", onPointerMove);
    el.removeEventListener("pointerup", onPointerUp);
    el.removeEventListener("pointercancel", onPointerUp);
  }

  function enable() {
    const d = deps();
    if (!d || enabled) return;
    enabled = true;
    moved = false;
    shell.classList.add("overlay-calibrate");
    document.getElementById("overlay-calibrate-bar")?.classList.remove("hidden");
    d.ids().forEach((id) => {
      const el = d.element(id);
      if (!el) return;
      decorate(el, id);
      bindEl(el);
    });
  }

  function disable() {
    if (!enabled) return;
    enabled = false;
    drag = null;
    shell.classList.remove("overlay-calibrate");
    document.getElementById("overlay-calibrate-bar")?.classList.add("hidden");
    const d = deps();
    if (d) {
      d.ids().forEach((id) => {
        const el = d.element(id);
        if (!el) return;
        unbindEl(el);
        undecorate(el);
      });
    }
  }

  function wireToolbar() {
    document.getElementById("ovl-save")?.addEventListener("click", () => {
      deps()?.saveOverrides(true);
    });
    document.getElementById("ovl-reset")?.addEventListener("click", () => {
      if (window.confirm("Reset all button overlays to defaults?")) {
        deps()?.resetOverrides();
      }
    });
    document.getElementById("ovl-export")?.addEventListener("click", () => {
      const d = deps();
      if (!d) return;
      const blob = new Blob([JSON.stringify(d.getOverrides(), null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "overlay-overrides.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  window.CompanionOverlayCalibrate = { enable, disable, isEnabled: () => enabled };
  wireToolbar();
})();
