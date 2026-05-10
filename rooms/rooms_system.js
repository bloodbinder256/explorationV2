/* rooms/rooms_system.js — per-room hooks and random events */

(function () {
  window.RoomsSystem = {
    onRoomLoad() {
      // small ambient sanity drain per room visit
      if (window.SanitySystem) SanitySystem.change(-1, "ambient");

      // chance to spawn an enemy
      if (window.EnemySystem && Math.random() < 0.25) {
        EnemySystem.spawnRandom();
      }

      // flavor event
      if (Math.random() < 0.12 && window.showMessage) {
        showMessage("You hear distant scratching in the walls...");
      }
    }
  };

  // auto-run on DOMContentLoaded if rooms_system.js loaded after DOM
  document.addEventListener("DOMContentLoaded", () => {
    if (window.RoomsSystem && typeof RoomsSystem.onRoomLoad === "function") {
      // slight delay so UI exists
      setTimeout(() => RoomsSystem.onRoomLoad(), 200);
    }
  });
})();
