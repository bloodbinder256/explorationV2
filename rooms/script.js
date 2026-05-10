/* ================================
   Endless Requium – Full Script
================================ */

document.addEventListener("DOMContentLoaded", () => {

  const body = document.body;
  const bgContainer = document.getElementById("bgContainer");
  const audioName = body.dataset.audio;
  const isMuted = localStorage.getItem("gameMuted") === "1";

  /* ===============================
     BACKGROUND HANDLER
  =============================== */
  if (bgContainer) {
    const layers = [...bgContainer.querySelectorAll("img")];
    let current = 0;

    layers.forEach((img, i) => {
      img.style.position = "absolute";
      img.style.inset = "0";
      img.style.width = "100vw";
      img.style.height = "100vh";
      img.style.objectFit = "cover";
      img.style.opacity = i === 0 ? "1" : "0";
      img.style.transition = "opacity 1.5s ease-in-out";
      img.style.pointerEvents = "none";
    });

    if (layers.length > 1) {
      setInterval(() => {
        layers[current].style.opacity = "0";
        current = (current + 1) % layers.length;
        layers[current].style.opacity = "1";
      }, 5000);
    }
  }

  /* ===============================
     FADE IN BODY
  =============================== */
  requestAnimationFrame(() => body.classList.add("fade-in"));

  /* ===============================
     AUDIO SYSTEM
  =============================== */
  let ambient = null;

  if (audioName) {
    ambient = new Audio(`../sounds/${audioName}`);
    ambient.loop = true;
    ambient.volume = 0;
    ambient.muted = isMuted;

    ambient.play().then(fadeAudioIn).catch(() => {
      window.addEventListener("click", startAudio, { once: true });
      window.addEventListener("keydown", startAudio, { once: true });
    });
  }

  function startAudio() {
    if (!ambient) return;
    ambient.play();
    fadeAudioIn();
  }

  function fadeAudioIn() {
    let v = 0;
    const fade = setInterval(() => {
      v += 0.02;
      ambient.volume = Math.min(0.6, v);
      if (v >= 0.6) clearInterval(fade);
    }, 50);
  }

  function fadeAudioOut(cb) {
    let v = ambient?.volume ?? 0;
    const fade = setInterval(() => {
      v -= 0.03;
      if (ambient) ambient.volume = Math.max(0, v);
      if (v <= 0) {
        clearInterval(fade);
        ambient?.pause();
        cb?.();
      }
    }, 40);
  }

  /* ===============================
     FADE OVERLAY
  =============================== */
  function fadeScreen(cb, duration = 1200) {
    const overlay = document.getElementById("fadeOverlay");
    if (!overlay) return cb?.();

    overlay.classList.add("active");
    setTimeout(() => {
      overlay.classList.remove("active");
      cb?.();
    }, duration);
  }

  /* ===============================
     ROOM NAVIGATION
  =============================== */
  function go(room) {
    if (!room) return;
    localStorage.setItem("lastRoom", room);

    fadeScreen(() => {
      fadeAudioOut(() => {
        setTimeout(() => location.href = room, 200);
      });
    });
  }

  window.goToRoom = go;
  window.GoToRoom = go;

  /* ===============================
     INVENTORY INIT
  =============================== */
  if (window.Inventory?.load) {
    Inventory.load();
    window.refreshInventoryUI?.();
  }

  // Inventory panel toggling is handled in inventory.js to avoid double-toggle bugs.

  /* ===============================
     POPUP MESSAGE
  =============================== */
  function showMessage(text, duration = 2000) {
    if (document.querySelector(".popup-message")) return;

    const msg = document.createElement("div");
    msg.className = "popup-message";
    msg.textContent = text;
    document.body.appendChild(msg);

    requestAnimationFrame(() => msg.style.opacity = "1");

    setTimeout(() => {
      msg.style.opacity = "0";
      msg.addEventListener("transitionend", () => msg.remove(), { once: true });
    }, duration);
  }

  /* ===============================
     PICKUPS
  =============================== */
  document.querySelectorAll("[data-pickup]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.pickup;
      const item = window.ITEMS_BY_ID?.[id];
      if (!item || !window.Inventory) return;

      Inventory.add(id, 1);
      showMessage(`Picked up ${item.name}`);
      btn.remove();
    });
  });

  /* ===============================
     USE ITEMS
  =============================== */
  document.querySelectorAll("[data-use]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.use;
      const next = btn.dataset.jump;

      if (!Inventory.has(id)) {
        showMessage("You don't have that.");
        return;
      }

      Inventory.remove(id, 1);
      showMessage("Used item.");
      go(next);
    });
  });

  /* ===============================
     TITLE AUTO-FIT
  =============================== */
  function fitTitleText(selector, max = 80, min = 24) {
    const el = document.querySelector(selector);
    if (!el) return;

    let size = max;
    el.style.fontSize = size + "px";

    while (el.scrollWidth > el.clientWidth && size > min) {
      size--;
      el.style.fontSize = size + "px";
    }
  }

  fitTitleText(".title");
  window.addEventListener("resize", () => fitTitleText(".title"));

});
