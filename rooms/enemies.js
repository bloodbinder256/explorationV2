/* rooms/enemies.js — enemy definitions + behaviors + dodge attacks */

(function () {

  /* ---------------- ENEMY DEFINITIONS ---------------- */

  window.ENEMIES = {
    shadow:  { id: "shadow",  name: "Shadow",  behavior: "standard",      attackSpeed: 900  },
    mimic:   { id: "mimic",   name: "Mimic",   behavior: "jumpscare",     attackSpeed: 600  },
    wraith:  { id: "wraith",  name: "Wraith",  behavior: "sanityHunter",  attackSpeed: 1200 },
    stalker: { id: "stalker", name: "Stalker", behavior: "behindPlayer",  attackSpeed: 700  },
    hollow:  { id: "hollow",  name: "Hollow",  behavior: "wandering",     attackSpeed: 1500 },
    lurker:  { id: "lurker",  name: "Lurker",  behavior: "backgroundCreep", attackSpeed: 1000 },
    echo:    { id: "echo",    name: "Echo",    behavior: "uiDistort",     attackSpeed: 800  }
  };


  /* ---------------- DODGE SYSTEM (GLOBAL) ---------------- */

  let dodgeWindow = false;
  let dodgeTimeout = null;

  function startDodgeWindow(time) {
    dodgeWindow = true;

    dodgeTimeout = setTimeout(() => {
      dodgeWindow = false;
      playerHit(); // didn't dodge in time
    }, time);
  }

  document.addEventListener("keydown", (e) => {
    if (!dodgeWindow) return;
    if (e.key.toLowerCase() === "d") {
      dodgeSuccess();
    }
  });

  function dodgeSuccess() {
    dodgeWindow = false;
    clearTimeout(dodgeTimeout);
    showDodgeFlash();
    if (window.showMessage) showMessage("You dodged!");
  }

  function playerHit() {
    if (window.showMessage) showMessage("You were hit!");
    if (window.SanitySystem) SanitySystem.change(-20, "enemyHit");
  }

  function showDodgeFlash() {
    const flash = document.getElementById("dodgeFlash");
    if (!flash) return;
    flash.classList.add("active");
    setTimeout(() => flash.classList.remove("active"), 150);
  }


  /* ---------------- ENEMY SYSTEM ---------------- */

  window.EnemySystem = {

    spawnRandom() {
      const base = ["shadow", "mimic"];
      const unlocked = (window.DeathUnlocks && DeathUnlocks.getUnlocked)
        ? DeathUnlocks.getUnlocked()
        : [];

      const pool = base.concat(unlocked);
      if (!pool.length) return null;

      const id = pool[Math.floor(Math.random() * pool.length)];
      const def = ENEMIES[id];

      if (def) this.runBehavior(def);

      return def;
    },


    /* ----------- Behavior + Dodge Integration ----------- */

    runBehavior(def) {
      if (!def) return;

      // Always show some flavor text
      if (window.showMessage) showMessage(`${def.name} appears...`);

      // Run special behavior
      this.runPassiveEffect(def);

      // Start an attack after a short windup
      this.startAttack(def);
    },


    runPassiveEffect(def) {
      switch (def.behavior) {
        case "standard":
          if (window.showMessage) showMessage("It watches you silently...");
          break;

        case "jumpscare":
          if (window.showMessage) showMessage("It prepares to lunge!");
          break;

        case "sanityHunter":
          if (window.showMessage) showMessage("Your mind feels weaker...");
          if (window.SanitySystem) SanitySystem.change(-10, "ambientDrain");
          break;

        case "behindPlayer":
          if (window.showMessage) showMessage("Breathing behind you...");
          break;

        case "wandering":
          if (window.showMessage) showMessage("It drifts without purpose.");
          break;

        case "backgroundCreep":
          document.body.classList.add("enemy-bg-flash");
          setTimeout(() => document.body.classList.remove("enemy-bg-flash"), 900);
          break;

        case "uiDistort":
          document.body.classList.add("ui-distort");
          setTimeout(() => document.body.classList.remove("ui-distort"), 1400);
          break;

        default:
          break;
      }
    },


    /* Attack → Dodge prompt */
    startAttack(def) {
      if (!def.attackSpeed) def.attackSpeed = 1000;

      setTimeout(() => {
        if (window.showMessage) showMessage(`${def.name} attacks — Press D to dodge!`);
        startDodgeWindow(def.attackSpeed);
      }, 900);
    }
  };

})();
