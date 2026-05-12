/* rooms/settings.js — persistent game settings */
(function () {
  const KEY = "game_settings_v1";
  const defaults = {
    masterVolume: 80,
    ambientVolume: 60,
    muted: false,
    reducedEffects: false,
    showSanity: true,
    uiSize: "normal",
    textSpeed: "normal",
    autoCloudSave: false
  };

  function load() {
    try {
      return { ...defaults, ...(JSON.parse(localStorage.getItem(KEY) || "{}")) };
    } catch (_) {
      return { ...defaults };
    }
  }

  function save(settings) {
    const merged = { ...defaults, ...(settings || {}) };
    localStorage.setItem(KEY, JSON.stringify(merged));
    localStorage.setItem("gameMuted", merged.muted ? "1" : "0");
    apply(merged);
    return merged;
  }

  function apply(settings = load()) {
    const body = document.body;
    const root = document.documentElement;
    if (!body || !root) return;

    body.classList.toggle("settings-reduced-effects", !!settings.reducedEffects);
    body.classList.toggle("settings-hide-sanity", !settings.showSanity);
    body.dataset.uiSize = settings.uiSize || "normal";
    body.dataset.textSpeed = settings.textSpeed || "normal";

    const scale = settings.uiSize === "large" ? 1.12 : settings.uiSize === "small" ? 0.92 : 1;
    root.style.setProperty("--game-ui-scale", String(scale));
  }

  function clearLocalSave() {
    const settings = load();
    localStorage.clear();
    save(settings);
  }

  function exportSave() {
    const payload = {};
    Object.keys(localStorage).forEach((key) => payload[key] = localStorage.getItem(key));
    return JSON.stringify({ exportedAt: new Date().toISOString(), localStorage: payload }, null, 2);
  }

  function importSave(text) {
    const parsed = JSON.parse(text);
    const data = parsed.localStorage || parsed;
    Object.entries(data).forEach(([key, value]) => localStorage.setItem(key, String(value)));
    apply(load());
  }

  window.GameSettings = {
    KEY,
    defaults,
    load,
    save,
    apply,
    clearLocalSave,
    exportSave,
    importSave,
    get(name) { return load()[name]; },
    set(name, value) {
      const settings = load();
      settings[name] = value;
      return save(settings);
    },
    audioVolume(kind = "ambient") {
      const settings = load();
      if (settings.muted) return 0;
      const master = Math.max(0, Math.min(100, Number(settings.masterVolume) || 0)) / 100;
      const channel = Math.max(0, Math.min(100, Number(settings[`${kind}Volume`]) || 0)) / 100;
      return master * channel;
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => apply(load()));
  } else {
    apply(load());
  }
})();
