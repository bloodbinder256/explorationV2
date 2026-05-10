/* rooms/rooms_system.js — room danger, resting, safe rooms, rituals, game progress */

(function () {
  const safeRooms = ["lore.html", "bedroom.html", "crafting.html"];
  const restOnceRooms = ["lore.html", "bedroom.html"];
  const enemyUnlockRooms = ["corridor1.html", "attic.html", "bedroom.html", "playroom.html", "window.html", "lockedin.html"];
  const PROGRESS_KEY = "gameProgress_v1";

  function roomName() {
    return window.location.pathname.split("/").pop() || "unknown.html";
  }

  function readProgress() {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    } catch (_) {
      return {};
    }
  }

  function writeProgress(progress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress || {}));
  }

  window.GameProgress = window.GameProgress || {
    getFlags() { return readProgress(); },
    hasFlag(flag) { return !!readProgress()[flag]; },
    setFlag(flag, value = true) {
      const progress = readProgress();
      progress[flag] = value;
      writeProgress(progress);
    },
    enemySpawnsUnlocked() {
      return !!readProgress().enemySpawnsUnlocked;
    },
    unlockEnemySpawns(reason = "story") {
      const progress = readProgress();
      if (progress.enemySpawnsUnlocked) return false;
      progress.enemySpawnsUnlocked = true;
      progress.enemyUnlockReason = reason;
      progress.enemyUnlockRoom = roomName();
      progress.enemyUnlockTime = Date.now();
      writeProgress(progress);
      return true;
    }
  };

  function isSafeRoom() {
    return safeRooms.includes(roomName());
  }

  function msg(text) {
    window.showMessage ? showMessage(text) : alert(text);
  }

  function restore(amount, reason) {
    if (window.SanitySystem) SanitySystem.restore(amount, reason);
  }

  function addRestButton() {
    const center = document.querySelector(".center-box");
    if (!center || document.getElementById("restBtn")) return;

    const btn = document.createElement("button");
    btn.id = "restBtn";
    btn.className = "btn rest-btn";
    btn.textContent = isSafeRoom() ? "Rest Here (+15 sanity once)" : "Risky Rest (+5 sanity)";
    btn.addEventListener("click", rest);
    center.appendChild(btn);
  }

  function addRitualButton() {
    const center = document.querySelector(".center-box");
    if (!center || document.getElementById("ritualBtn")) return;

    const current = roomName();
    let config = null;

    if (current === "bedroom.html") {
      config = {
        id: "bedroom_music_box_ritual_v1",
        label: "Play the Music Box Ritual (+25 sanity)",
        item: "music_box",
        amount: 25,
        success: "The music box plays one clean note. Your breathing slows."
      };
    }

    if (current === "lore.html") {
      config = {
        id: "lore_flowers_ritual_v1",
        label: "Leave Flowers at the Old Pages (+15 sanity)",
        item: "flowers",
        amount: 15,
        success: "The room feels less angry after the offering."
      };
    }

    if (!config) return;

    const btn = document.createElement("button");
    btn.id = "ritualBtn";
    btn.className = "btn ritual-btn";
    btn.textContent = localStorage.getItem(config.id) ? "Ritual already completed" : config.label;
    btn.disabled = !!localStorage.getItem(config.id);
    btn.addEventListener("click", () => {
      if (localStorage.getItem(config.id)) return;
      if (!window.Inventory?.has(config.item)) {
        const name = window.ITEMS_BY_ID?.[config.item]?.name || config.item;
        msg(`You need ${name}.`);
        return;
      }
      Inventory.remove(config.item, 1);
      localStorage.setItem(config.id, "1");
      restore(config.amount, `ritual_${current}`);
      msg(config.success);
      btn.textContent = "Ritual already completed";
      btn.disabled = true;
    });
    center.appendChild(btn);
  }

  function rest() {
    const current = roomName();
    if (safeRooms.includes(current)) {
      const key = `rested_${current}_v1`;
      if (restOnceRooms.includes(current) && localStorage.getItem(key)) {
        msg("You already rested here. The comfort has gone thin.");
        return;
      }
      if (restOnceRooms.includes(current)) localStorage.setItem(key, "1");
      restore(15, `safe_rest_${current}`);
      msg("You rest for a while. Your mind clears. +15 sanity");
      const btn = document.getElementById("restBtn");
      if (btn && restOnceRooms.includes(current)) btn.textContent = "Already rested here";
      return;
    }

    restore(5, `risky_rest_${current}`);
    msg("You force yourself to breathe. +5 sanity");

    if (!GameProgress.enemySpawnsUnlocked()) {
      msg("For now, nothing answers the sound of your breathing.");
      return;
    }

    if (window.EnemySystem && Math.random() < 0.25) {
      setTimeout(() => EnemySystem.spawnRandom(), 600);
    }
  }

  window.RoomsSystem = {
    safeRooms,
    enemyUnlockRooms,
    rest,

    onRoomLoad() {
      addRestButton();
      addRitualButton();

      const current = roomName();
      let justUnlockedEnemies = false;

      if (enemyUnlockRooms.includes(current) && !GameProgress.enemySpawnsUnlocked()) {
        justUnlockedEnemies = GameProgress.unlockEnemySpawns(`entered_${current}`);
        if (justUnlockedEnemies && window.showMessage) {
          showMessage("Somewhere deeper in the house, something wakes up...");
        }
      }

      if (window.SanitySystem) SanitySystem.change(-1, "ambient");

      const canSpawnEnemy = GameProgress.enemySpawnsUnlocked() && !justUnlockedEnemies;

      if (canSpawnEnemy && !isSafeRoom() && window.EnemySystem && Math.random() < 0.25) {
        EnemySystem.spawnRandom();
      }

      if (GameProgress.enemySpawnsUnlocked() && Math.random() < 0.12 && window.showMessage) {
        showMessage("You hear distant scratching in the walls...");
      }
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    if (window.RoomsSystem && typeof RoomsSystem.onRoomLoad === "function") {
      setTimeout(() => RoomsSystem.onRoomLoad(), 200);
    }
  });
})();
