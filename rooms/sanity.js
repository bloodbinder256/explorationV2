/* rooms/sanity.js — Sanity engine + UI bar
   Exposes: SanitySystem.get(), .set(v), .change(delta), .restore(amount)
   Updates document.body.dataset.sanity to one of: high|mid|low|broken
*/

(function () {
  const KEY = "sanity_v1";
  const MAX = 100;

  function load() {
    const raw = localStorage.getItem(KEY);
    const n = parseInt(raw, 10);
    return Number.isInteger(n) ? n : MAX;
  }

  function save(v) {
    localStorage.setItem(KEY, String(v));
  }

  function clamp(v) {
    return Math.max(0, Math.min(MAX, Math.round(v)));
  }

  function applyVisuals(v) {
    const state = v >= 70 ? "high" : v >= 30 ? "mid" : v > 0 ? "low" : "broken";
    document.body.dataset.sanity = state;

    const barFill = document.getElementById("sanityBarFill");
    if (barFill) barFill.style.width = `${(v / MAX) * 100}%`;

    const number = document.getElementById("sanityBarNumber");
    if (number) number.textContent = `${v}/100`;
  }

  function ensureBar() {
    if (document.getElementById("sanityBar")) return;
    const wrapper = document.createElement("div");
    wrapper.id = "sanityBar";
    wrapper.innerHTML = `
      <div id="sanityBarTop"><span id="sanityBarLabel">Sanity</span><span id="sanityBarNumber">100/100</span></div>
      <div id="sanityBarTrack"><div id="sanityBarFill"></div></div>
    `;
    const style = document.createElement("style");
    style.textContent = `
      #sanityBar { position: fixed; left: 20px; bottom: 20px; z-index:2000; width:230px; font-family: 'Underdog', sans-serif; color: #ffd9d6; font-size:12px; }
      #sanityBarTop { display:flex; justify-content:space-between; margin-bottom:6px; text-shadow:0 0 8px #000; }
      #sanityBarTrack { background: rgba(255,255,255,0.06); border:2px solid #e33; height:12px; border-radius:8px; overflow:hidden; box-shadow:0 0 18px rgba(227,51,51,.25); }
      #sanityBarFill { height:100%; width:100%; background: linear-gradient(90deg,#8af,#ffd9d6); transition: width .35s ease; }
    `;
    document.head.appendChild(style);
    document.body.appendChild(wrapper);
  }

  const SanitySystem = {
    init() {
      ensureBar();
      const v = load();
      applyVisuals(v);
    },

    get() {
      return load();
    },

    set(v, reason) {
      const old = load();
      const nv = clamp(v);
      save(nv);
      applyVisuals(nv);
      if (window.updateSanityUI) window.updateSanityUI(nv);
      if (nv <= 0) {
        if (window.playerDied) playerDied(reason || "sanity");
      }
      return nv;
    },

    change(delta, reason) {
      const before = load();
      const after = this.set(before + delta, reason);
      return after;
    },

    restore(amount, reason = "restore") {
      return this.change(Math.abs(amount), reason);
    }
  };

  window.SanitySystem = SanitySystem;
  window.raiseSanity = function(amount, reason) {
    return SanitySystem.restore(amount, reason);
  };

  document.addEventListener("DOMContentLoaded", () => SanitySystem.init());
})();
