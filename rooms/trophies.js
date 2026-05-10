/* rooms/trophies.js — simple trophy store + notifier */

(function () {
  const KEY = "trophies_v1";

  const API = {
    add(id, name) {
      const cur = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!cur.find(t => t.id === id)) {
        cur.push({ id, name, date: Date.now() });
        localStorage.setItem(KEY, JSON.stringify(cur));
        if (window.showMessage) showMessage(`Trophy unlocked: ${name}`);
      }
    },

    list() {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    },

    reset() {
      localStorage.removeItem(KEY);
    }
  };

  window.Trophies = API;
})();
