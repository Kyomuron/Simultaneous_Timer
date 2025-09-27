(() => {
  const params = new URLSearchParams(window.location.search);
  const root = document.documentElement;
  const body = document.body;

  const titleEl = document.getElementById("overlayTitle");
  const subtitleEl = document.getElementById("overlaySubtitle");
  const timeEl = document.getElementById("overlayTime");
  const timeShell = timeEl?.parentElement?.classList.contains("time-shell") ? timeEl.parentElement : null;
  const statusEl = document.getElementById("overlayStatus");
  const toggleBtn = document.getElementById("toggle");
  const resetBtn = document.getElementById("reset");
  const markerBtn = document.getElementById("mark");

  const TIME_TEMPLATE = "00:00:00.00";
  const timeSlots = initTimeSlots(timeEl, TIME_TEMPLATE);

  function initTimeSlots(container, template) {
    if (!container) return [];
    container.textContent = "";
    container.setAttribute("role", "text");
    return Array.from(template, (symbol) => {
      const slot = document.createElement("span");
      slot.className = "time-slot";
      if (symbol === ":" || symbol === ".") {
        slot.classList.add("separator");
      }
      slot.textContent = symbol;
      slot.setAttribute("aria-hidden", "true");
      container.appendChild(slot);
      return slot;
    });
  }

  function renderTimeSlots(value) {
    if (!timeSlots.length) return;
    const text = typeof value === "string" ? value : formatDuration(value);
    timeEl?.setAttribute("aria-label", text);
    timeShell?.setAttribute("aria-label", text);
    if (text.length > timeSlots.length && timeEl) {
      for (let i = timeSlots.length; i < text.length; i += 1) {
        const slot = document.createElement("span");
        slot.className = "time-slot";
        const char = text[i];
        if (char === ":" || char === ".") {
          slot.classList.add("separator");
        }
        slot.setAttribute("aria-hidden", "true");
        timeEl.appendChild(slot);
        timeSlots.push(slot);
      }
    }
    for (let index = 0; index < timeSlots.length; index += 1) {
      timeSlots[index].textContent = text[index] ?? "";
    }
  }

  const config = {
    title: params.get("title") ?? "Simulcast Timer",
    accent: params.get("accent") ?? "#38bdf8",
    background: params.get("bg") ?? "transparent",
    glow: params.get("glow") ?? "rgba(56, 189, 248, 0.65)",
    font: params.get("font") ?? "Poppins",
    subtitle: params.get("subtitle") ?? "",
    autoStart: params.get("autostart") === "1",
    showControls: params.get("controls") !== "0",
    frame: params.get("frame") !== "0",
    markerFlashMs: clampNumber(parseInt(params.get("markerFlash") ?? "1400", 10), 400, 8000)
  };

  renderTimeSlots(0);

  class OverlayTimer {
    constructor(onTick) {
      this.running = false;
      this.startStamp = null;
      this.elapsed = 0;
      this.rafId = null;
      this.onTick = typeof onTick === "function" ? onTick : null;
      this.flashTimeout = null;
    }

    start() {
      if (this.running) return;
      this.startStamp = performance.now() - this.elapsed;
      this.running = true;
      this._loop();
      this._setState("running");
    }

    pause() {
      if (!this.running) return;
      cancelAnimationFrame(this.rafId);
      this.elapsed = performance.now() - this.startStamp;
      this.running = false;
      this._setState(this.elapsed > 0 ? "paused" : "idle");
      this._notify();
    }

    toggle() {
      this.running ? this.pause() : this.start();
    }

    reset() {
      cancelAnimationFrame(this.rafId);
      this.running = false;
      this.startStamp = null;
      this.elapsed = 0;
      this._setState("idle");
      this._notify();
    }

    mark() {
      const stamp = this.elapsedTime();
      if (this.flashTimeout) clearTimeout(this.flashTimeout);
      const previousState = this.running ? "running" : this.elapsed > 0 ? "paused" : "idle";
      statusEl.dataset.prevState = previousState;
      body.classList.add("marker-active");
      statusEl.textContent = `Marker @ ${formatDuration(stamp)}`;
      statusEl.dataset.state = "marker";
      this.flashTimeout = setTimeout(() => {
        body.classList.remove("marker-active");
        const nextState = statusEl.dataset.prevState || previousState;
        statusEl.dataset.prevState = "";
        this._setState(nextState);
      }, config.markerFlashMs);
      return stamp;
    }

    elapsedTime() {
      return this.running ? performance.now() - this.startStamp : this.elapsed;
    }

    _loop() {
      this.elapsed = performance.now() - this.startStamp;
      this._notify();
      if (!this.running) return;
      this.rafId = requestAnimationFrame(() => this._loop());
    }

    _notify() {
      this.onTick?.(this.elapsedTime(), this.running);
    }

    _setState(state) {
      timeEl.dataset.state = state;
      if (timeShell) {
        timeShell.dataset.state = state;
      }
      statusEl.dataset.state = state;
      this._updateStatusLabel(state);
    }

    _updateStatusLabel(state = statusEl.dataset.state) {
      const labels = {
        idle: "Ready",
        running: "Live",
        paused: "Paused",
        marker: statusEl.textContent
      };
      statusEl.textContent = labels[state] ?? statusEl.textContent ?? "Ready";
    }
  }

  function applyConfig() {
    root.style.setProperty("--accent", config.accent);
    root.style.setProperty("--bg", config.background);
    root.style.setProperty("--glow", config.glow);

    if (config.title) {
      titleEl.textContent = config.title;
      titleEl.style.display = "block";
    } else {
      titleEl.style.display = "none";
    }

    if (subtitleEl) {
      if (config.subtitle) {
        subtitleEl.textContent = config.subtitle;
        subtitleEl.style.display = "block";
      } else {
        subtitleEl.style.display = "none";
      }
    }

    if (!config.showControls) {
      body.classList.add("controls-hidden");
    } else {
      body.classList.remove("controls-hidden");
    }

    if (!config.frame) {
      body.classList.add("frameless");
    } else {
      body.classList.remove("frameless");
    }

    if (config.font) {
      const urlSafeFont = encodeURIComponent(config.font).replace(/%20/g, "+");
      const googleFont = document.createElement("link");
      googleFont.rel = "stylesheet";
      googleFont.href = `https://fonts.googleapis.com/css2?family=${urlSafeFont}:wght@400;500;600;700&display=swap`;
      document.head.appendChild(googleFont);
      const sanitizedFont = config.font.replace(/["']/g, "").trim();
      if (sanitizedFont) {
        const stack = `'${sanitizedFont}', "Noto Sans JP", "Segoe UI", sans-serif`;
        root.style.setProperty("--font-primary", stack);
        root.style.setProperty("--font-secondary", stack);
      }
    }
  }

  function formatDuration(milliseconds) {
    const totalMs = Math.max(0, milliseconds);
    const totalSeconds = totalMs / 1000;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const centiseconds = Math.floor((totalMs % 1000) / 10);
    const pad = (value, digits = 2) => String(value).padStart(digits, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
  }

  function clampNumber(value, min, max) {
    if (Number.isNaN(value)) return min;
    return Math.min(Math.max(value, min), max);
  }

  const timer = new OverlayTimer((elapsed, running) => {
    renderTimeSlots(elapsed);
    const buttonState = running ? "running" : elapsed > 0 ? "paused" : "idle";
    toggleBtn.dataset.state = buttonState;
    toggleBtn.textContent = running ? "Pause" : elapsed > 0 ? "Resume" : "Start";
  });

  function toggleControls() {
    body.classList.toggle("controls-hidden");
  }

  toggleBtn.addEventListener("click", () => timer.toggle());
  resetBtn.addEventListener("click", () => timer.reset());
  markerBtn.addEventListener("click", () => timer.mark());

  window.addEventListener("keydown", (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === " " || key === "spacebar") {
      event.preventDefault();
      timer.toggle();
    }
    if (key === "enter") {
      event.preventDefault();
      timer.toggle();
    }
    if (key === "r") {
      timer.reset();
    }
    if (key === "m") {
      timer.mark();
    }
    if (key === "c") {
      toggleControls();
    }
  });

  applyConfig();

  if (config.autoStart) {
    timer.start();
  }
})();
