/* =====================================================
   CRAFTING SYSTEM — POLISHED
   Shows all recipes, highlights craftable ones, and gives feedback.
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("recipesContainer");
  const filter = document.getElementById("craftingFilter");
  const search = document.getElementById("craftingSearch");
  const summary = document.getElementById("craftingSummary");
  if (!container) return;

  Inventory.load();
  populateFilters();
  renderRecipes();

  filter?.addEventListener("change", renderRecipes);
  search?.addEventListener("input", renderRecipes);

  function canCraft(recipe) {
    return recipe.ingredients.every(i => Inventory.has(i.id, i.amount));
  }

  function craft(recipe) {
    if (!canCraft(recipe)) {
      window.showMessage?.("You are missing ingredients.");
      return;
    }

    recipe.ingredients.forEach(i => Inventory.remove(i.id, i.amount));
    Inventory.add(recipe.output.id, recipe.output.amount);

    const item = ITEMS_BY_ID[recipe.output.id];
    window.showMessage?.(`Crafted ${recipe.output.amount}x ${item?.name || recipe.output.id}`);
    renderRecipes();
  }

  function populateFilters() {
    if (!filter) return;
    const cats = [...new Set(RECIPES.map(r => r.category || "Other"))];
    filter.innerHTML = `<option value="all">All recipes</option>` + cats.map(c => `<option value="${c}">${c}</option>`).join("");
  }

  function renderRecipes() {
    container.innerHTML = "";

    const selected = filter?.value || "all";
    const q = (search?.value || "").trim().toLowerCase();

    const visible = RECIPES.filter(recipe => {
      const item = ITEMS_BY_ID[recipe.output.id];
      const categoryMatch = selected === "all" || (recipe.category || "Other") === selected;
      const searchMatch = !q || item?.name?.toLowerCase().includes(q) || recipe.ingredients.some(i => ITEMS_BY_ID[i.id]?.name?.toLowerCase().includes(q));
      return categoryMatch && searchMatch;
    });

    const craftableCount = RECIPES.filter(canCraft).length;
    if (summary) summary.textContent = `${craftableCount} craftable / ${RECIPES.length} known recipes`;

    visible.forEach(recipe => {
      const item = ITEMS_BY_ID[recipe.output.id];
      if (!item) return;

      const ready = canCraft(recipe);
      const card = document.createElement("div");
      card.className = `recipe-card ${ready ? "craftable" : "locked-recipe"}`;
      card.style.setProperty("--recipe-color", item.color || "#e33");

      const ingredientsHTML = recipe.ingredients.map(i => {
        const it = ITEMS_BY_ID[i.id];
        const owned = Inventory.data[i.id] || 0;
        const ok = owned >= i.amount;
        return `
          <span class="ingredient-pill ${ok ? "has" : "missing"}">
            ${it?.name || i.id}: ${owned}/${i.amount}
          </span>
        `;
      }).join("");

      card.innerHTML = `
        <div class="recipe-topline">
          <span class="recipe-category">${recipe.category || "Other"}</span>
          <span class="recipe-status">${ready ? "Ready" : "Missing pieces"}</span>
        </div>
        <div class="recipe-header">
          <div class="recipe-icon-wrap"><img src="${item.icon}" alt=""></div>
          <div>
            <strong>${item.name}</strong>
            <p>${item.description || ""}</p>
          </div>
        </div>
        <div class="recipe-ingredients">${ingredientsHTML}</div>
        <button class="btn craft-btn" ${ready ? "" : "disabled"}>${ready ? "Craft" : "Locked"}</button>
      `;

      card.querySelector(".craft-btn").addEventListener("click", () => craft(recipe));
      container.appendChild(card);
    });

    if (!container.children.length) {
      container.innerHTML = `<p class="subtitle">No recipes match that search.</p>`;
    }
  }
});
