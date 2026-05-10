/* rooms/sanity.js — Sanity engine + UI bar
   Exposes: SanitySystem.get(), .set(v), .change(delta)
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

    // update optional bar
    const barFill = document.getElementById("sanityBarFill");
    if (barFill) barFill.style.width = `${(v / MAX) * 100}%`;
  }

  // create a small sanity bar if not present
  function ensureBar() {
    if (document.getElementById("sanityBar")) return;
    const wrapper = document.createElement("div");
    wrapper.id = "sanityBar";
    wrapper.innerHTML = `
      <div id="sanityBarLabel">Sanity</div>
      <div id="sanityBarTrack"><div id="sanityBarFill"></div></div>
    `;
    // minimal inline CSS (you can move to styles.css)
    const style = document.createElement("style");
    style.textContent = `
      #sanityBar { position: fixed; left: 20px; bottom: 20px; z-index:2000; width:220px; font-family: 'Underdog', sans-serif; color: #ffd9d6; font-size:12px; }
      #sanityBarLabel { margin-bottom:6px; }
      #sanityBarTrack { background: rgba(255,255,255,0.06); border:2px solid #e33; height:12px; border-radius:8px; overflow:hidden; }
      #sanityBarFill { height:100%; width:100%; background: linear-gradient(90deg,#8af,#6bf); transition: width .35s ease; }
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
      const nv = clamp(v);
      save(nv);
      applyVisuals(nv);
      if (window.updateSanityUI) window.updateSanityUI(nv);
      if (nv <= 0) {
        // death from sanity
        if (window.playerDied) playerDied(reason || "sanity");
      }
      return nv;
    },

    change(delta, reason) {
      return this.set(load() + delta, reason);
    }
  };

  window.SanitySystem = SanitySystem;
  document.addEventListener("DOMContentLoaded", () => SanitySystem.init());
})();
