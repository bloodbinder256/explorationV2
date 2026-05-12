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
     LIMINAL DECOR
  =============================== */
  const centerBox = document.querySelector(".center-box");
  if (centerBox && !document.querySelector(".liminal-caption")) {
    const whisper = document.createElement("div");
    whisper.className = "liminal-caption";
    whisper.textContent = "Some places feel like memory before they feel like space.";
    whisper.style.marginTop = "2px";
    whisper.style.fontSize = ".8rem";
    whisper.style.letterSpacing = ".18em";
    whisper.style.textTransform = "uppercase";
    whisper.style.opacity = ".55";
    whisper.style.color = "var(--accent-2, #c6fff2)";
    centerBox.prepend(whisper);
  }

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

  window.showMessage = showMessage;

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
     AMBIENT EFFECTS SYSTEM
  =============================== */
  function initAmbientEffects() {
    if (!document.getElementById("ambientMotes")) {
      const motes = document.createElement("div");
      motes.id = "ambientMotes";
      document.body.appendChild(motes);

      const count = 16;
      for (let i = 0; i < count; i++) {
        const mote = document.createElement("span");
        mote.className = "ambient-mote";
        mote.style.left = `${Math.random() * 100}%`;
        mote.style.top = `${40 + Math.random() * 60}%`;
        mote.style.setProperty('--drift-x', `${-60 + Math.random() * 120}px`);
        mote.style.animationDuration = `${14 + Math.random() * 18}s`;
        mote.style.animationDelay = `${Math.random() * 12}s`;
        mote.style.width = `${2 + Math.random() * 4}px`;
        mote.style.height = mote.style.width;
        motes.appendChild(mote);
      }
    }

    if (!document.querySelector('.whisper-banner')) {
      const whisper = document.createElement('div');
      whisper.className = 'whisper-banner';
      whisper.id = 'whisperBanner';
      document.body.appendChild(whisper);
    }

    const whisperLines = {
      normal: [
        'The hall does not feel empty. It feels paused.',
        'You hear the shape of footsteps more than the sound of them.',
        'The house waits with you, not for you.',
        'It is too quiet for a place that remembers this much.'
      ],
      low: [
        'The walls almost sound like breathing.',
        'A voice behind you forgets the last word it spoke.',
        'Somewhere nearby, a room closes without moving.',
        'Something in the dark knows your outline.'
      ]
    };

    function showWhisper(text) {
      const el = document.getElementById('whisperBanner');
      if (!el) return;
      el.textContent = text;
      el.classList.add('visible');
      clearTimeout(showWhisper._hideTimer);
      showWhisper._hideTimer = setTimeout(() => {
        el.classList.remove('visible');
      }, 4400);
    }

    function maybeFlicker() {
      if (Math.random() < 0.26) {
        document.body.classList.add('soft-flicker');
        setTimeout(() => document.body.classList.remove('soft-flicker'), 200 + Math.random() * 240);
      }
    }

    setInterval(() => {
      maybeFlicker();
      const sanity = window.SanitySystem?.get?.() ?? Number(localStorage.getItem('sanity_v1') || 100);
      const pool = sanity <= 45 ? whisperLines.low : whisperLines.normal;
      if (Math.random() < (sanity <= 45 ? 0.7 : 0.42)) {
        showWhisper(pool[Math.floor(Math.random() * pool.length)]);
      }
    }, 17000);

    setTimeout(() => maybeFlicker(), 3500 + Math.random() * 2500);
  }

  /* ===============================
     ROOM DIALOGUE / UNIFIED CHOICE SYSTEM
  =============================== */
  function getRoomActionButtons(center) {
    return [...center.children].filter((el) => {
      if (!(el instanceof HTMLButtonElement)) return false;
      if (el.closest('.dialogue-panel')) return false;
      if (el.id === 'invToggle') return false;
      return true;
    });
  }

  function moveRoomActionButtonsIntoPanel(center, panel) {
    const choices = panel.querySelector('.dialogue-options');
    if (!choices) return;

    getRoomActionButtons(center).forEach((button) => {
      // Turn normal room buttons into the same style as dialogue choices.
      button.classList.remove('btn');
      button.classList.add('dialogue-option', 'room-action-option');
      button.dataset.unifiedChoice = 'true';
      choices.appendChild(button);
    });
  }

  function watchForNewRoomActionButtons(center, panel) {
    if (!center || !panel || panel.dataset.watchingActions === 'true') return;
    panel.dataset.watchingActions = 'true';

    const observer = new MutationObserver(() => {
      if (!document.body.contains(panel)) {
        observer.disconnect();
        return;
      }
      moveRoomActionButtonsIntoPanel(center, panel);
    });

    observer.observe(center, { childList: true });
  }

  function initDialogueSystem() {
    const room = window.location.pathname.split('/').pop() || 'unknown.html';
    const center = document.querySelector('.center-box');
    if (!center || document.querySelector('.room-dialogue-panel')) return false;

    const dialogues = window.ROOM_DIALOGUES || {};
    const config = dialogues[room];
    const roomActions = getRoomActionButtons(center);

    if (!config && roomActions.length === 0) return false;

    const availableOptions = (config?.options || []).map((opt, index) => {
      const stateKey = `dialogue_used_${room}_${index}_v1`;
      return !localStorage.getItem(stateKey) && canUseContentOption(opt);
    });

    // If no fresh dialogue remains, still build the panel if the room has
    // navigation/pickup/rest actions. This keeps the room using one menu.
    if (config && !availableOptions.some(Boolean) && roomActions.length === 0) return false;

    const panel = document.createElement('section');
    panel.className = 'dialogue-panel room-dialogue-panel unified-choice-panel';

    const optionsHtml = (config?.options || []).map((opt, index) => (
      `<button class="dialogue-option room-response-option" data-dialogue-index="${index}">${opt.label}</button>`
    )).join('');

    panel.innerHTML = `
      <div class="dialogue-kicker">${config?.kicker || 'Room Choices'}</div>
      <div class="dialogue-prompt">${config?.prompt || 'What do you do?'}</div>
      <div class="dialogue-options">${optionsHtml}</div>
      <div class="dialogue-response">Choose an action and feel how the room answers.</div>
    `;

    center.appendChild(panel);
    moveRoomActionButtonsIntoPanel(center, panel);
    watchForNewRoomActionButtons(center, panel);

    const responseBox = panel.querySelector('.dialogue-response');
    panel.querySelectorAll('.room-response-option').forEach((button) => {
      const idx = Number(button.dataset.dialogueIndex);
      const option = config.options[idx];
      const stateKey = `dialogue_used_${room}_${idx}_v1`;
      const usable = canUseContentOption(option);

      if (localStorage.getItem(stateKey) || !usable) {
        button.disabled = true;
        if (!usable && option.requiresItem) {
          button.title = `Needs ${window.ITEMS_BY_ID?.[option.requiresItem]?.name || option.requiresItem}`;
        }
      }

      button.addEventListener('click', () => {
        if (!canUseContentOption(option)) {
          responseBox.innerHTML = `<strong>Not yet:</strong> You do not have what this answer needs.`;
          return;
        }

        if (localStorage.getItem(stateKey)) {
          responseBox.innerHTML = `<strong>Already remembered:</strong> ${option.response}`;
          return;
        }

        localStorage.setItem(stateKey, '1');
        responseBox.innerHTML = `<strong>${option.label}:</strong> ${option.response}`;
        applyContentResult(option, `dialogue_${room}_${idx}`);
        button.disabled = true;

        // Keep the unified panel open so navigation/pickup options do not vanish.
        // Entity encounters can still appear in rooms after the room dialogue has
        // been used on a later visit, without creating two option menus at once.
      });
    });

    return true;
  }


  /* ===============================
     CONTENT FLAGS
  =============================== */
  const CONTENT_FLAGS_KEY = "content_flags_v1";

  function getContentFlags() {
    try {
      return JSON.parse(localStorage.getItem(CONTENT_FLAGS_KEY) || "{}");
    } catch (_) {
      return {};
    }
  }

  function setContentFlag(flag, value = true) {
    if (!flag) return;
    const flags = getContentFlags();
    flags[flag] = value;
    localStorage.setItem(CONTENT_FLAGS_KEY, JSON.stringify(flags));
    if (window.GameProgress?.setFlag) window.GameProgress.setFlag(flag, value);
  }

  function hasContentFlag(flag) {
    if (!flag) return true;
    const flags = getContentFlags();
    return !!flags[flag] || !!window.GameProgress?.hasFlag?.(flag);
  }

  function canUseContentOption(option = {}) {
    if (option.requiresFlag && !hasContentFlag(option.requiresFlag)) return false;
    if (option.requiresItem && !window.Inventory?.has?.(option.requiresItem, option.requiresAmount || 1)) return false;
    return true;
  }

  function applyContentResult(result = {}, reasonPrefix = "content") {
    if (result.setFlag) setContentFlag(result.setFlag, true);

    if (result.itemReward && window.Inventory?.add) {
      Inventory.add(result.itemReward, result.itemRewardAmount || 1);
      const itemName = window.ITEMS_BY_ID?.[result.itemReward]?.name || result.itemReward;
      window.showMessage?.(`Received ${itemName}.`);
    }

    if (result.requiresItem && result.consumesItem && window.Inventory?.remove) {
      Inventory.remove(result.requiresItem, result.requiresAmount || 1);
    }

    if (typeof result.sanity === "number" && result.sanity !== 0 && window.SanitySystem) {
      if (result.sanity > 0) {
        SanitySystem.restore(result.sanity, `${reasonPrefix}_${result.setFlag || "choice"}`);
        window.showMessage?.(`+${result.sanity} sanity`);
      } else {
        SanitySystem.change(result.sanity, `${reasonPrefix}_${result.setFlag || "choice"}`);
        window.showMessage?.(`${result.sanity} sanity`);
      }
    }

    if (result.message) {
      window.showMessage?.(result.message);
    }

    if (result.goToRoom) {
      setTimeout(() => {
        if (typeof window.goToRoom === "function") window.goToRoom(result.goToRoom);
        else window.location.href = result.goToRoom;
      }, result.goDelayMs || 650);
    }
  }

  /* ===============================
     ENTITY ENCOUNTERS
  =============================== */
  function initEntityEncounterSystem() {
    const encounters = window.ENTITY_ENCOUNTERS || {};
    const room = window.location.pathname.split('/').pop() || 'unknown.html';
    const encounter = encounters[room];
    const center = document.querySelector('.center-box');

    if (!encounter || !center || document.querySelector('.entity-panel') || document.querySelector('.room-dialogue-panel')) return;

    const encounterKey = `entity_seen_${encounter.id || room}_v1`;
    if (encounter.repeats === false && localStorage.getItem(encounterKey)) return;

    if (encounter.requiresEnemyUnlocked && !window.GameProgress?.enemySpawnsUnlocked?.()) return;
    if (encounter.requiresFlag && !hasContentFlag(encounter.requiresFlag)) return;
    if (encounter.forbiddenFlag && hasContentFlag(encounter.forbiddenFlag)) return;

    const chance = typeof encounter.chance === "number" ? encounter.chance : 1;
    if (Math.random() > chance) return;

    const panel = document.createElement('section');
    panel.className = 'dialogue-panel entity-panel';
    if ((encounter.imagePosition || 'left') === 'right') {
      panel.classList.add('image-right');
    }

    const optionsHtml = (encounter.options || []).map((opt, index) => {
      const disabled = canUseContentOption(opt) ? "" : "disabled";
      const need = opt.requiresItem ? ` title="Needs ${window.ITEMS_BY_ID?.[opt.requiresItem]?.name || opt.requiresItem}"` : "";
      return `<button class="dialogue-option entity-option" data-entity-index="${index}" ${disabled}${need}>${opt.label}</button>`;
    }).join('');

    const portraitHtml = encounter.image ? `
      <div class="entity-portrait-shell">
        <img
          class="entity-portrait"
          id="entityPortrait"
          src="${encounter.image}"
          alt="${encounter.imageAlt || encounter.name || 'Entity portrait'}"
          style="object-fit:${encounter.imageFit || 'cover'};"
        >
      </div>
    ` : '';

    const infoHtml = `
      <div class="entity-info">
        <div class="dialogue-kicker">Entity Encounter</div>
        <div class="entity-name">${encounter.name || "Something Unnamed"}</div>
        <div class="entity-subtitle">${encounter.subtitle || ""}</div>
        <div class="dialogue-prompt">${encounter.prompt || "It waits."}</div>
        <div class="dialogue-options">${optionsHtml}</div>
        <div class="dialogue-response">Choose carefully. Some answers become part of the house.</div>
      </div>
    `;

    panel.innerHTML = `
      <div class="entity-layout">
        ${(encounter.image && (encounter.imagePosition || 'left') !== 'right') ? portraitHtml : ''}
        ${infoHtml}
        ${(encounter.image && (encounter.imagePosition || 'left') === 'right') ? portraitHtml : ''}
      </div>
    `;

    setTimeout(() => {
      center.appendChild(panel);
      localStorage.setItem(encounterKey, "1");
    }, encounter.delayMs || 900);

    const responseBox = panel.querySelector('.dialogue-response');
    const portrait = panel.querySelector('#entityPortrait');
    panel.querySelectorAll('.entity-option').forEach((button) => {
      const option = encounter.options[Number(button.dataset.entityIndex)];
      button.addEventListener('click', () => {
        if (!canUseContentOption(option)) {
          responseBox.innerHTML = `<strong>Not yet:</strong> You do not have what this answer needs.`;
          return;
        }

        if (portrait && option.swapImage) {
          portrait.src = option.swapImage;
        }

        responseBox.innerHTML = `<strong>${option.label}:</strong> ${option.response || "The room remembers your answer."}`;
        applyContentResult(option, `entity_${encounter.id || room}`);
        panel.querySelectorAll('.entity-option').forEach(b => b.disabled = true);
      });
    });
  }


  initAmbientEffects();
  const roomDialogueShown = initDialogueSystem();
  if (!roomDialogueShown) initEntityEncounterSystem();

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
