/* ============================
   INVENTORY SYSTEM – FIXED + PERSISTENT PICKUPS
============================ */

window.Inventory = {
  data: {},

  load() {
    const saved = localStorage.getItem("inventory");
    this.data = saved ? JSON.parse(saved) : {};
  },

  save() {
    localStorage.setItem("inventory", JSON.stringify(this.data));
  },

  add(id, amount = 1) {
    if (!this.data[id]) this.data[id] = 0;
    this.data[id] += amount;
    this.save();
    window.refreshInventoryUI?.();
  },

  remove(id, amount = 1) {
    if (!this.has(id, amount)) return false;
    this.data[id] -= amount;
    if (this.data[id] <= 0) delete this.data[id];
    this.save();
    window.refreshInventoryUI?.();
    return true;
  },

  has(id, amount = 1) {
    return (this.data[id] || 0) >= amount;
  }
};

/* ============================
   PICKED-UP WORLD STATE
   Keeps room items gone after changing rooms.
============================ */

const PICKED_UP_KEY = "pickedUpItems_v1";

window.getPickedUpItems = function () {
  try {
    return JSON.parse(localStorage.getItem(PICKED_UP_KEY) || "[]");
  } catch (_) {
    return [];
  }
};

window.hasPickedUpItem = function (pickupId) {
  return getPickedUpItems().includes(pickupId);
};

window.savePickedUpItem = function (pickupId) {
  if (!pickupId) return;
  const picked = getPickedUpItems();
  if (!picked.includes(pickupId)) {
    picked.push(pickupId);
    localStorage.setItem(PICKED_UP_KEY, JSON.stringify(picked));
  }
};

function currentRoomName() {
  return window.location.pathname.split("/").pop() || "unknown_room";
}

function itemIdFromOnclick(button) {
  const onclick = button.getAttribute("onclick") || "";
  const match = onclick.match(/pickupItem\(['\"]([^'\"]+)['\"]/);
  return match ? match[1] : (button.dataset.pickup || "item");
}

function assignPickupIds() {
  const buttons = [...document.querySelectorAll("[data-pickup], button[onclick*='pickupItem']")];
  buttons.forEach((button, index) => {
    if (!button.dataset.pickupSaveId) {
      const id = button.dataset.pickup || itemIdFromOnclick(button);
      const label = (button.textContent || "pickup").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
      button.dataset.pickupSaveId = `${currentRoomName()}::${id}::${label || index}`;
    }

    if (hasPickedUpItem(button.dataset.pickupSaveId)) {
      button.remove();
    }
  });
}

/* ============================
   SANITY ITEM USE
============================ */

window.useInventoryItem = function (itemId) {
  const item = window.ITEMS_BY_ID?.[itemId];
  if (!item || !window.Inventory?.has(itemId)) return false;

  if (item.type === "consumable" && item.sanity) {
    Inventory.remove(itemId, 1);
    if (window.SanitySystem) SanitySystem.change(item.sanity, `used_${itemId}`);
    window.showMessage?.(`${item.name} steadies you. +${item.sanity} sanity`);
    refreshInventoryUI();
    return true;
  }

  if (item.type === "ritual") {
    window.showMessage?.(`${item.name} may work better in the right room.`);
    return false;
  }

  window.showMessage?.(`You cannot use ${item.name} here.`);
  return false;
};

/* ============================
   REFRESH INVENTORY UI
============================ */

window.refreshInventoryUI = function () {
  const invPanel = document.getElementById("inventory");
  if (!invPanel) return;

  invPanel.innerHTML = "";

  const ids = Object.keys(Inventory.data);
  if (ids.length === 0) {
    invPanel.innerHTML = `<div style="opacity:0.6">(empty)</div>`;
  }

  ids.forEach(id => {
    const item = window.ITEMS_BY_ID?.[id];
    if (!item) return;

    const row = document.createElement("div");
    row.className = "inv-item";
    if (item.color) row.style.borderColor = item.color;

    const useButton = item.type === "consumable"
      ? `<button class="mini-btn" data-use-inventory="${id}">Use</button>`
      : "";

    row.innerHTML = `
      <img class="inv-icon" src="${item.icon}" alt="">
      <span class="inv-name" title="${item.description || ''}">${item.name}</span>
      <span class="inv-count">x${Inventory.data[id]}</span>
      ${useButton}
    `;

    row.querySelector("[data-use-inventory]")?.addEventListener("click", (e) => {
      e.stopPropagation();
      useInventoryItem(id);
    });

    invPanel.appendChild(row);
  });

  // Crafting button
  if (!invPanel.querySelector("#craftingBtn")) {
    const craftBtn = document.createElement("button");
    craftBtn.id = "craftingBtn";
    craftBtn.textContent = "🛠️ Crafting Table";
    craftBtn.className = "btn";
    craftBtn.style.marginTop = "10px";

    craftBtn.addEventListener("click", () => {
      localStorage.setItem("lastRoom", window.location.pathname.split("/").pop());
      window.location.href = "crafting.html";
    });

    invPanel.appendChild(craftBtn);
  }
};

/* ============================
   INVENTORY TOGGLE + PICKUP STATE INIT
============================ */

document.addEventListener("DOMContentLoaded", () => {
  Inventory.load();
  assignPickupIds();
  refreshInventoryUI();

  document.querySelectorAll("[data-pickup]").forEach(btn => {
    btn.addEventListener("click", () => {
      pickupItem(btn.dataset.pickup, Number(btn.dataset.amount || 1));
    });
  });

  const toggleBtn = document.getElementById("invToggle");
  const invPanel = document.getElementById("inventory");

  if (!toggleBtn || !invPanel) return;

  toggleBtn.addEventListener("click", (e) => {
    invPanel.classList.toggle("visible");
    refreshInventoryUI();
    e.stopPropagation();
  });

  document.addEventListener("mousedown", (e) => {
    if (invPanel.classList.contains("visible") &&
        !e.target.closest("#inventory") &&
        !e.target.closest("#invToggle")) {
      invPanel.classList.remove("visible");
    }
  });
});

/* ============================
   HELPER: PICKUP ITEMS
============================ */

window.pickupItem = function(itemId, amount = 1) {
  const item = window.ITEMS_BY_ID?.[itemId];
  if (!item || !window.Inventory) return;

  const event = window.event;
  const button = event?.target?.closest?.('button');
  const pickupSaveId = button?.dataset?.pickupSaveId;

  if (pickupSaveId && hasPickedUpItem(pickupSaveId)) {
    button.remove();
    return;
  }

  Inventory.add(itemId, amount);
  if (pickupSaveId) savePickedUpItem(pickupSaveId);

  const label = amount > 1 ? `${amount}x ${item.name}` : item.name;
  window.showMessage ? window.showMessage(`Picked up ${label}`) : showMessage(`Picked up ${label}`);
  refreshInventoryUI();

  if (button && (button.getAttribute('onclick')?.includes('pickupItem') || button.dataset.pickup)) button.remove();
};

window.useItem = function(itemId, onUse, amount = 1) {
  if (!window.Inventory) return false;

  const item = window.ITEMS_BY_ID?.[itemId];
  if (!Inventory.has(itemId, amount)) {
    const name = item?.name || itemId;
    window.showMessage ? window.showMessage(`You need ${name}.`) : showMessage(`You need ${name}.`);
    return false;
  }

  Inventory.remove(itemId, amount);
  window.showMessage ? window.showMessage(`Used ${item?.name || itemId}.`) : showMessage(`Used ${item?.name || itemId}.`);
  refreshInventoryUI();

  if (typeof onUse === 'function') onUse();
  return true;
};

/* ============================
   HELPER: POPUP MESSAGE
============================ */

window.showMessage = window.showMessage || showMessage;

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
