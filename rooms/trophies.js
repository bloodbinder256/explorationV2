/* rooms/trophies.js — configurable achievement/trophy system */
(function () {
  const UNLOCKED_KEY = "trophies_v2";
  const STATS_KEY = "trophy_stats_v1";
  const CONTENT_FLAGS_KEY = "content_flags_v1";
  const PROGRESS_KEY = "gameProgress_v1";

  function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch (_) { return fallback; }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function achievements() {
    return window.ACHIEVEMENTS || [];
  }

  function unlocked() {
    return readJSON(UNLOCKED_KEY, []);
  }

  function saveUnlocked(list) {
    writeJSON(UNLOCKED_KEY, list);
  }

  function stats() {
    return readJSON(STATS_KEY, {
      pickups: 0,
      crafted: 0,
      cooked: 0,
      entityChoices: 0,
      dialogueChoices: 0,
      endingsSeen: 0,
      roomsVisitedTotal: 0,
      roomsVisited: [],
      endings: []
    });
  }

  function saveStats(data) {
    writeJSON(STATS_KEY, data);
  }

  function allFlags() {
    return {
      ...readJSON(PROGRESS_KEY, {}),
      ...readJSON(CONTENT_FLAGS_KEY, {})
    };
  }

  function hasItem(id) {
    try {
      if (window.Inventory?.load) Inventory.load();
      if (window.Inventory?.has?.(id)) return true;
      const inv = readJSON("inventory", {});
      return (inv[id] || 0) > 0;
    } catch (_) {
      return false;
    }
  }

  function sanity() {
    return window.SanitySystem?.get?.() ?? Number(localStorage.getItem("sanity_v1") || 100);
  }

  function conditionMet(condition = {}) {
    const s = stats();
    const flags = allFlags();

    switch (condition.type) {
      case "stat":
        return (s[condition.stat] || 0) >= (condition.min || 1);
      case "item":
        return hasItem(condition.id);
      case "flag":
        return !!flags[condition.id];
      case "room":
        return (s.roomsVisited || []).includes(condition.room);
      case "sanity": {
        const value = sanity();
        if (typeof condition.min === "number" && value < condition.min) return false;
        if (typeof condition.max === "number" && value > condition.max) return false;
        return true;
      }
      case "ending":
        return (s.endings || []).includes(condition.id);
      default:
        return false;
    }
  }

  function notify(achievement) {
    if (window.showMessage) {
      window.showMessage(`Trophy unlocked: ${achievement.icon || "🏆"} ${achievement.name}`);
      return;
    }

    const toast = document.createElement("div");
    toast.className = "trophy-toast";
    toast.textContent = `Trophy unlocked: ${achievement.icon || "🏆"} ${achievement.name}`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("visible"));
    setTimeout(() => toast.remove(), 3800);
  }

  const API = {
    unlock(id) {
      const achievement = achievements().find(a => a.id === id) || { id, name: id, icon: "🏆", description: "Custom trophy" };
      const list = unlocked();
      if (list.find(t => t.id === id)) return false;

      list.push({
        id,
        name: achievement.name,
        icon: achievement.icon || "🏆",
        description: achievement.description || "",
        date: Date.now()
      });
      saveUnlocked(list);
      notify(achievement);
      return true;
    },

    add(id, name) {
      return this.unlock(id || name);
    },

    list() {
      const list = unlocked();
      return achievements().map(a => ({
        ...a,
        unlocked: !!list.find(t => t.id === a.id),
        date: list.find(t => t.id === a.id)?.date || null
      }));
    },

    unlockedList() {
      return unlocked();
    },

    stats,

    increment(stat, amount = 1) {
      const s = stats();
      s[stat] = (s[stat] || 0) + amount;
      saveStats(s);
      this.checkAll();
    },

    visitRoom(room) {
      if (!room) return;
      const s = stats();
      s.roomsVisitedTotal = (s.roomsVisitedTotal || 0) + 1;
      s.roomsVisited = s.roomsVisited || [];
      if (!s.roomsVisited.includes(room)) s.roomsVisited.push(room);
      saveStats(s);
      this.checkAll();
    },

    trackPickup(itemId, amount = 1) {
      const s = stats();
      s.pickups = (s.pickups || 0) + amount;
      s.lastPickup = itemId;
      saveStats(s);
      this.checkAll();
    },

    trackCraft(recipe = {}) {
      const s = stats();
      if ((recipe.station || "crafting") === "cooking") s.cooked = (s.cooked || 0) + 1;
      else s.crafted = (s.crafted || 0) + 1;
      s.lastRecipe = recipe.output?.id || null;
      saveStats(s);
      this.checkAll();
    },

    trackContentChoice(kind = "dialogue") {
      const s = stats();
      if (kind === "entity") s.entityChoices = (s.entityChoices || 0) + 1;
      else s.dialogueChoices = (s.dialogueChoices || 0) + 1;
      saveStats(s);
      this.checkAll();
    },

    trackEnding(id) {
      const s = stats();
      s.endingsSeen = (s.endingsSeen || 0) + 1;
      s.endings = s.endings || [];
      if (id && !s.endings.includes(id)) s.endings.push(id);
      saveStats(s);
      this.checkAll();
    },

    checkAll() {
      achievements().forEach(a => {
        if (conditionMet(a.condition)) this.unlock(a.id);
      });
    },

    reset() {
      localStorage.removeItem(UNLOCKED_KEY);
      localStorage.removeItem(STATS_KEY);
    }
  };

  window.Trophies = API;

  document.addEventListener("DOMContentLoaded", () => {
    const room = window.location.pathname.split("/").pop();
    if (room && room !== "index.html" && !["account.html", "trophies.html"].includes(room)) {
      API.visitRoom(room);
    }
    setTimeout(() => API.checkAll(), 500);
  });
})();
