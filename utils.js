/* utils.js — global helper functions used across rooms */

(function () {
  window.showMessage = function (text, duration = 2000) {
    // simple popup system used across scripts
    const msg = document.createElement("div");
    msg.className = "popup-message";
    msg.textContent = text;
    document.body.appendChild(msg);

    // ensure CSS exists or use inline styles
    msg.style.position = "fixed";
    msg.style.left = "50%";
    msg.style.top = "22%";
    msg.style.transform = "translateX(-50%)";
    msg.style.background = "rgba(0,0,0,0.85)";
    msg.style.color = "red";
    msg.style.padding = "10px 16px";
    msg.style.border = "2px solid red";
    msg.style.zIndex = 3000;
    msg.style.opacity = "0";
    msg.style.transition = "opacity .25s ease";

    requestAnimationFrame(() => { msg.style.opacity = "1"; });

    setTimeout(() => {
      msg.style.opacity = "0";
      msg.addEventListener("transitionend", () => msg.remove());
    }, duration);
  };

  window.playerDied = function (reason = "unknown") {
    // record death to death-unlocks and trophies
    if (window.DeathUnlocks) {
      DeathUnlocks.addDeath(reason);
    }
    if (window.Trophies) {
      Trophies.add(`death_${reason}`, `Died by ${reason}`);
    }

    // clear run-only keys
    localStorage.removeItem("inventory");
    localStorage.removeItem("sanity_v1"); // key used by SanitySystem
    localStorage.removeItem("currentRoom");

    // show a short message, then go to death page
    if (window.showMessage) showMessage(`You died: ${reason}`, 800);
    setTimeout(() => {
      window.location.href = window.location.pathname.includes('/rooms/') ? 'death.html' : 'rooms/death.html';
    }, 700);
  };
})();
