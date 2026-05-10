/* rooms/enemies.js — enemy definitions + dodge, attack, defeat */

(function () {

  window.ENEMIES = {
    shadow:  { id: "shadow",  name: "Shadow",  behavior: "standard",      attackSpeed: 900  },
    mimic:   { id: "mimic",   name: "Mimic",   behavior: "jumpscare",     attackSpeed: 600  },
    wraith:  { id: "wraith",  name: "Wraith",  behavior: "sanityHunter",  attackSpeed: 1200 },
    stalker: { id: "stalker", name: "Stalker", behavior: "behindPlayer",  attackSpeed: 700  },
    hollow:  { id: "hollow",  name: "Hollow",  behavior: "wandering",     attackSpeed: 1500 },
    lurker:  { id: "lurker",  name: "Lurker",  behavior: "backgroundCreep", attackSpeed: 1000 },
    echo:    { id: "echo",    name: "Echo",    behavior: "uiDistort",     attackSpeed: 800  }
  };

  let dodgeWindow = false;
  let dodgeTimeout = null;
  let currentEnemy = null;

  function msg(text) {
    window.showMessage ? showMessage(text) : alert(text);
  }

  function clearAttack() {
    dodgeWindow = false;
    clearTimeout(dodgeTimeout);
    hideCombatPanel();
  }

  function startDodgeWindow(time) {
    dodgeWindow = true;
    showCombatPanel();

    dodgeTimeout = setTimeout(() => {
      dodgeWindow = false;
      hideCombatPanel();
      playerHit();
    }, time);
  }

  document.addEventListener("keydown", (e) => {
    if (!dodgeWindow) return;
    const key = e.key.toLowerCase();
    if (key === "d") dodgeSuccess();
    if (key === "f") fightBack();
  });

  function dodgeSuccess() {
    clearAttack();
    showDodgeFlash();
    msg("You dodged!");
  }

  function fightBack() {
    if (!dodgeWindow || !currentEnemy) return;
    const success = Math.random() < 0.6;
    clearAttack();

    if (success) {
      msg(`You defeated the ${currentEnemy.name}. +5 sanity`);
      if (window.SanitySystem) SanitySystem.restore(5, "defeatedEnemy");
      currentEnemy = null;
    } else {
      msg(`You swung too late. The ${currentEnemy.name} hit you!`);
      playerHit();
    }
  }

  function playerHit() {
    msg("You were hit!");
    if (window.SanitySystem) SanitySystem.change(-20, "enemyHit");
    currentEnemy = null;
  }

  function showDodgeFlash() {
    const flash = document.getElementById("dodgeFlash");
    if (!flash) return;
    flash.classList.add("active");
    setTimeout(() => flash.classList.remove("active"), 150);
  }

  function showCombatPanel() {
    let panel = document.getElementById("combatPanel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "combatPanel";
      panel.innerHTML = `
        <div class="combat-title">An attack is coming.</div>
        <button class="btn mini-combat" id="dodgeBtn">Dodge [D]</button>
        <button class="btn mini-combat" id="fightBtn">Fight Back [F]</button>
      `;
      document.body.appendChild(panel);
      panel.querySelector("#dodgeBtn").addEventListener("click", dodgeSuccess);
      panel.querySelector("#fightBtn").addEventListener("click", fightBack);
    }
    panel.classList.add("visible");
  }

  function hideCombatPanel() {
    document.getElementById("combatPanel")?.classList.remove("visible");
  }

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

    runBehavior(def) {
      if (!def) return;
      currentEnemy = def;
      msg(`${def.name} appears...`);
      this.runPassiveEffect(def);
      this.startAttack(def);
    },

    runPassiveEffect(def) {
      switch (def.behavior) {
        case "standard": msg("It watches you silently..."); break;
        case "jumpscare": msg("It prepares to lunge!"); break;
        case "sanityHunter":
          msg("Your mind feels weaker...");
          if (window.SanitySystem) SanitySystem.change(-10, "ambientDrain");
          break;
        case "behindPlayer": msg("Breathing behind you..."); break;
        case "wandering": msg("It drifts without purpose."); break;
        case "backgroundCreep":
          document.body.classList.add("enemy-bg-flash");
          setTimeout(() => document.body.classList.remove("enemy-bg-flash"), 900);
          break;
        case "uiDistort":
          document.body.classList.add("ui-distort");
          setTimeout(() => document.body.classList.remove("ui-distort"), 1400);
          break;
        default: break;
      }
    },

    startAttack(def) {
      if (!def.attackSpeed) def.attackSpeed = 1000;
      setTimeout(() => {
        msg(`${def.name} attacks — Dodge [D] or fight back [F]!`);
        startDodgeWindow(def.attackSpeed);
      }, 900);
    },

    defeatCurrent() {
      fightBack();
    }
  };

})();
