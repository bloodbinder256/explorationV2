/* =====================================================
   GLOBAL ITEM DEFINITIONS (TEMPLATES ONLY)
   -----------------------------------------------------
   These define what items ARE, not what the player owns.
   Inventory stores ONLY item IDs + quantities.
   ===================================================== */

/*
RARITY COLORS:
Common     #A3A3A3
Uncommon   #35D413
Rare       #13469C
Mythical   #C713D4
Legendary  #FDFF30
*/

window.ITEMS = {
  /* ---------- KEYS ---------- */
  "Silver Key": {
    id: "silver_key",
    name: "Silver Key",
    icon: "../images/items/silver_key.png",
    color: "#13469C",
    description: "A small metallic key. It looks old.",
    stack: 16
  },

  "Master Key": {
    id: "master_key",
    name: "Master Key",
    icon: "../images/items/master_key.svg",
    color: "#35D413",
    description: "A key that could be duplicated...",
    stack: 1
  },

  /* ---------- MOLDS ---------- */
  "Key Mold": {
    id: "key_mold",
    name: "Key Mold",
    icon: "../images/items/key_mold.png",
    color: "#13469C",
    description: "A small mold. You could probably make a key with this.",
    stack: 1
  },

  /* ---------- MATERIALS ---------- */
  "Metal Scrap": {
    id: "metal_scrap",
    name: "Metal Scrap",
    icon: "../images/items/metal_scrap.png",
    color: "#A3A3A3",
    description: "A small piece of metal scrap.",
    stack: 128
  },

  "Melted Metal Scrap": {
    id: "melted_metal_scrap",
    name: "Melted Metal Scrap",
    icon: "../images/items/melted_metal_scrap.png",
    color: "#A3A3A3",
    description: "Metal scrap that has been melted down.",
    stack: 5
  },

  "Rubber Ball": {
    id: "rubber_ball",
    name: "Rubber Ball",
    icon: "../images/items/rubber_ball.svg",
    color: "#35D413",
    description: "A small piece of rubber. It could be turned into a mold.",
    stack: 128
  },

  /* ---------- TOOLS ---------- */
  "Lighter": {
    id: "lighter",
    name: "Lighter",
    icon: "../images/items/lighter.png",
    color: "#35D413",
    description: "A standard lighter with a print of fire under blue skies.",
    stack: 1
  },

  "Music Box": {
    id: "music_box",
    name: "Music Box",
    icon: "../images/items/music_box.png",
    color: "#13469C",
    description: "A small music box playing a tune. Something feels wrong.",
    stack: 1
  },

  /* ---------- CONSUMABLES ---------- */
  "Cold Tea": {
    id: "cold_tea",
    name: "Cold Tea",
    icon: "../images/items/cold_tea.svg",
    color: "#ffd9d6",
    description: "A sip steadies you.",
    stack: 4,
    type: "consumable",
    sanity: 8,
    heal: 0
  },

  "Cracker": {
    id: "cracker",
    name: "Cracker",
    icon: "../images/items/cracker.svg",
    color: "#A3A3A3",
    description: "A small snack. Tiny comfort.",
    stack: 10,
    type: "consumable",
    sanity: 3,
    heal: 0
  }
};

/* =====================================================
   LOOKUP TABLE (THIS IS WHAT YOUR GAME USES)
   -----------------------------------------------------
   Access items ONLY via ITEMS_BY_ID[id]
   ===================================================== */

window.ITEMS_BY_ID = {};

for (const key in ITEMS) {
  if (!ITEMS.hasOwnProperty(key)) continue;

  const item = ITEMS[key];

  if (!item.id) {
    console.warn("Item missing ID:", item);
    continue;
  }

  ITEMS_BY_ID[item.id] = item;
}