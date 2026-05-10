/* ============================
   INVENTORY SYSTEM – FIXED
============================ */

window.Inventory = {
  data: {},

  load() {
    const saved = localStorage.getItem("inventory");
    this.data = saved ? JSON.parse(saved) : {};
    console.log("Inventory loaded", this.data);
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

    row.innerHTML = `
      <img class="inv-icon" src="${item.icon}">
      <span>${item.name}</span>
      <span class="inv-count">x${Inventory.data[id]}</span>
    `;

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
   INVENTORY TOGGLE
============================ */

document.addEventListener("DOMContentLoaded", () => {
  Inventory.load();
  refreshInventoryUI();

  const toggleBtn = document.getElementById("invToggle");
  const invPanel = document.getElementById("inventory");

  if (!toggleBtn || !invPanel) return;

  // Toggle on button click
  toggleBtn.addEventListener("click", (e) => {
    invPanel.classList.toggle("visible");
    refreshInventoryUI();
    e.stopPropagation();
  });

  // Close if clicking outside
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

  Inventory.add(itemId, amount);
  const label = amount > 1 ? `${amount}x ${item.name}` : item.name;
  window.showMessage ? window.showMessage(`Picked up ${label}`) : showMessage(`Picked up ${label}`);
  refreshInventoryUI();

  // If called from an inline onclick button, remove that button so it cannot be farmed forever.
  const event = window.event;
  const button = event?.target?.closest?.('button');
  if (button && button.getAttribute('onclick')?.includes('pickupItem')) button.remove();
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
