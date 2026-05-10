/* rooms/death_unlocks.js — persistent death → enemy unlocks */

(function () {
  const KEY = "deathUnlocks_v1";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '{"unlocked":[],"deaths":0}');
    } catch (e) {
      return { unlocked: [], deaths: 0 };
    }
  }

  function save(obj) {
    localStorage.setItem(KEY, JSON.stringify(obj));
  }

  // map simple cause keys to enemy IDs (customize as you like)
  const MAP = {
    sanity: "wraith",
    bleedout: "stalker",
    starvation: "hollow",
    ambush: "lurker",
    unknown: "echo"
  };

  const API = {
    addDeath(cause = "unknown") {
      const d = load();
      d.deaths = (d.deaths || 0) + 1;
      const enemy = MAP[cause] || MAP.unknown;
      if (!d.unlocked.includes(enemy)) d.unlocked.push(enemy);
      save(d);
      // show message if available
      if (window.showMessage) showMessage(`New enemy unlocked for future runs: ${enemy}`);
      return enemy;
    },

    getUnlocked() {
      return load().unlocked || [];
    },

    getAll() {
      return load();
    },

    reset() {
      localStorage.removeItem(KEY);
    }
  };

  window.DeathUnlocks = API;
})();
