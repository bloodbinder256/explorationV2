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
    creatureVoices: true,
    creatureVoiceVolume: 70,
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



  function initSettingsPage() {
    const root = document.querySelector(".settings-card");
    if (!root) return;

    const ids = ["muted", "masterVolume", "ambientVolume", "creatureVoices", "creatureVoiceVolume", "reducedEffects", "showSanity", "uiSize", "textSpeed", "autoCloudSave"];
    const el = (id) => document.getElementById(id);

    function syncUI() {
      const s = load();
      if (!el("muted")) return;
      el("muted").checked = !!s.muted;
      el("masterVolume").value = s.masterVolume;
      el("ambientVolume").value = s.ambientVolume;
      el("creatureVoices").checked = s.creatureVoices !== false;
      el("creatureVoiceVolume").value = s.creatureVoiceVolume ?? 70;
      el("reducedEffects").checked = !!s.reducedEffects;
      el("showSanity").checked = !!s.showSanity;
      el("uiSize").value = s.uiSize;
      el("textSpeed").value = s.textSpeed;
      el("autoCloudSave").checked = !!s.autoCloudSave;
      el("masterVolumeValue").textContent = `${s.masterVolume}%`;
      el("ambientVolumeValue").textContent = `${s.ambientVolume}%`;
      el("creatureVoiceVolumeValue").textContent = `${s.creatureVoiceVolume ?? 70}%`;
    }

    function readUI() {
      save({
        ...load(),
        muted: el("muted").checked,
        masterVolume: Number(el("masterVolume").value),
        ambientVolume: Number(el("ambientVolume").value),
        creatureVoices: el("creatureVoices").checked,
        creatureVoiceVolume: Number(el("creatureVoiceVolume").value),
        reducedEffects: el("reducedEffects").checked,
        showSanity: el("showSanity").checked,
        uiSize: el("uiSize").value,
        textSpeed: el("textSpeed").value,
        autoCloudSave: el("autoCloudSave").checked
      });
      syncUI();
    }

    ids.forEach(id => el(id)?.addEventListener("input", readUI));
    ids.forEach(id => el(id)?.addEventListener("change", readUI));

    el("exportSaveBtn")?.addEventListener("click", async () => {
      const text = exportSave();
      el("saveBox").value = text;
      try { await navigator.clipboard.writeText(text); alert("Save copied to clipboard too."); }
      catch (_) { alert("Save exported into the box."); }
    });

    el("importSaveBtn")?.addEventListener("click", () => {
      const text = el("saveBox").value.trim();
      if (!text) return alert("Paste exported save data into the box first.");
      if (!confirm("Import this save over current local data?")) return;
      try {
        importSave(text);
        alert("Save imported. Return to the title screen or refresh.");
        syncUI();
      } catch (err) {
        alert(`Import failed: ${err.message}`);
      }
    });

    el("clearLocalBtn")?.addEventListener("click", () => {
      if (!confirm("Clear local save data on this browser? Settings will be kept.")) return;
      clearLocalSave();
      alert("Local save cleared. Settings kept.");
      syncUI();
    });

    syncUI();
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

  function init() {
    apply(load());
    initSettingsPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
