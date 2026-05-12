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
   REFRESH INVENTORY UI — UPGRADED
============================ */

window.InventoryUI = window.InventoryUI || {
  search: "",
  filter: "all",
  sort: "name"
};

function inventoryTypeFor(item = {}) {
  if (item.type === "consumable") return "consumable";
  if (item.type === "ritual") return "ritual";
  if ((item.stack || 1) === 1) return "key/tool";
  return "material";
}

function typeLabel(type) {
  return {
    all: "All",
    consumable: "Consumables",
    ritual: "Ritual",
    "key/tool": "Keys / Tools",
    material: "Materials"
  }[type] || type;
}

function inventoryEntries() {
  return Object.keys(Inventory.data)
    .map(id => ({ id, item: window.ITEMS_BY_ID?.[id], count: Inventory.data[id] }))
    .filter(entry => entry.item);
}

window.refreshInventoryUI = function () {
  const invPanel = document.getElementById("inventory");
  if (!invPanel) return;

  const allEntries = inventoryEntries();
  const totalItems = allEntries.reduce((sum, entry) => sum + entry.count, 0);
  const uniqueItems = allEntries.length;
  const q = (InventoryUI.search || "").trim().toLowerCase();
  const filterType = InventoryUI.filter || "all";

  let entries = allEntries.filter(({ id, item }) => {
    const itemType = inventoryTypeFor(item);
    const matchesFilter = filterType === "all" || itemType === filterType;
    const matchesSearch = !q ||
      item.name.toLowerCase().includes(q) ||
      id.toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q) ||
      itemType.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  entries.sort((a, b) => {
    if (InventoryUI.sort === "count") return b.count - a.count || a.item.name.localeCompare(b.item.name);
    if (InventoryUI.sort === "type") return inventoryTypeFor(a.item).localeCompare(inventoryTypeFor(b.item)) || a.item.name.localeCompare(b.item.name);
    return a.item.name.localeCompare(b.item.name);
  });

  invPanel.innerHTML = `
    <div class="inventory-header">
      <div>
        <strong>Inventory</strong>
        <small>${uniqueItems} unique · ${totalItems} total</small>
      </div>
      <button class="mini-btn inventory-close" type="button" aria-label="Close inventory">×</button>
    </div>

    <div class="inventory-controls">
      <input id="inventorySearch" type="search" placeholder="Search items..." value="${InventoryUI.search.replace(/"/g, '&quot;')}">
      <div class="inventory-filter-row">
        <select id="inventoryFilter" aria-label="Filter inventory">
          ${["all", "consumable", "material", "key/tool", "ritual"].map(type => `<option value="${type}" ${filterType === type ? "selected" : ""}>${typeLabel(type)}</option>`).join("")}
        </select>
        <select id="inventorySort" aria-label="Sort inventory">
          <option value="name" ${InventoryUI.sort === "name" ? "selected" : ""}>Name</option>
          <option value="type" ${InventoryUI.sort === "type" ? "selected" : ""}>Type</option>
          <option value="count" ${InventoryUI.sort === "count" ? "selected" : ""}>Count</option>
        </select>
      </div>
    </div>

    <div class="inventory-list"></div>

    <div class="inventory-footer">
      <button id="craftingBtn" class="btn" type="button">Craft / Cook</button>
      <button id="trophiesBtn" class="btn" type="button">Trophies</button>
      <button id="accountBtn" class="btn" type="button">Account</button>
    </div>
  `;

  const list = invPanel.querySelector(".inventory-list");

  if (allEntries.length === 0) {
    list.innerHTML = `<div class="inventory-empty">Your pockets are empty.</div>`;
  } else if (entries.length === 0) {
    list.innerHTML = `<div class="inventory-empty">No items match that search.</div>`;
  } else {
    entries.forEach(({ id, item, count }) => {
      const itemType = inventoryTypeFor(item);
      const row = document.createElement("div");
      row.className = `inv-item inv-type-${itemType.replace(/[^a-z0-9]+/g, '-')}`;
      if (item.color) row.style.setProperty("--item-color", item.color);

      const useButton = item.type === "consumable"
        ? `<button class="mini-btn inv-use-btn" type="button" data-use-inventory="${id}">Use</button>`
        : "";

      row.innerHTML = `
        <div class="inv-icon-wrap"><img class="inv-icon" src="${item.icon}" alt=""></div>
        <div class="inv-text">
          <div class="inv-title-line">
            <span class="inv-name" title="${item.description || ''}">${item.name}</span>
            <span class="inv-count">×${count}</span>
          </div>
          <div class="inv-meta">
            <span>${typeLabel(itemType)}</span>
            ${item.stack ? `<span>Stack ${item.stack}</span>` : ""}
            ${item.sanity ? `<span>+${item.sanity} sanity</span>` : ""}
          </div>
          ${item.description ? `<p class="inv-desc">${item.description}</p>` : ""}
        </div>
        <div class="inv-actions">${useButton}</div>
      `;

      row.querySelector("[data-use-inventory]")?.addEventListener("click", (e) => {
        e.stopPropagation();
        useInventoryItem(id);
      });

      list.appendChild(row);
    });
  }

  invPanel.querySelector(".inventory-close")?.addEventListener("click", () => {
    invPanel.classList.remove("visible");
  });

  invPanel.querySelector("#inventorySearch")?.addEventListener("input", (e) => {
    InventoryUI.search = e.target.value;
    refreshInventoryUI();
    const searchBox = document.getElementById("inventorySearch");
    if (searchBox) {
      searchBox.focus();
      searchBox.setSelectionRange(searchBox.value.length, searchBox.value.length);
    }
  });

  invPanel.querySelector("#inventoryFilter")?.addEventListener("change", (e) => {
    InventoryUI.filter = e.target.value;
    refreshInventoryUI();
  });

  invPanel.querySelector("#inventorySort")?.addEventListener("change", (e) => {
    InventoryUI.sort = e.target.value;
    refreshInventoryUI();
  });

  invPanel.querySelector("#craftingBtn")?.addEventListener("click", () => {
    const current = window.location.pathname.split("/").pop();
    if (current !== "crafting.html") localStorage.setItem("lastRoom", current);
    window.location.href = "crafting.html";
  });

  invPanel.querySelector("#trophiesBtn")?.addEventListener("click", () => {
    window.location.href = "trophies.html";
  });

  invPanel.querySelector("#accountBtn")?.addEventListener("click", () => {
    const isRoom = window.location.pathname.includes("/rooms/");
    window.location.href = isRoom ? "../account.html" : "account.html";
  });
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
  window.Trophies?.trackPickup?.(itemId, amount);
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
