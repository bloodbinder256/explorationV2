/* =====================================================
   CRAFTING + COOKING SYSTEM — POLISHED
   Shows all recipes, highlights ready ones, supports station tabs,
   and supports reusable tool ingredients with consume: false.
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("recipesContainer");
  const filter = document.getElementById("craftingFilter");
  const search = document.getElementById("craftingSearch");
  const summary = document.getElementById("craftingSummary");
  const stationTabs = [...document.querySelectorAll(".station-tab")];
  let activeStation = "all";
  if (!container) return;

  Inventory.load();
  populateFilters();
  renderRecipes();

  filter?.addEventListener("change", renderRecipes);
  search?.addEventListener("input", renderRecipes);
  stationTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      activeStation = tab.dataset.station || "all";
      stationTabs.forEach(t => t.classList.toggle("active", t === tab));
      populateFilters();
      renderRecipes();
    });
  });

  function recipeStation(recipe) {
    return recipe.station || "crafting";
  }

  function canCraft(recipe) {
    return recipe.ingredients.every(i => Inventory.has(i.id, i.amount));
  }

  function craft(recipe) {
    if (!canCraft(recipe)) {
      window.showMessage?.("You are missing ingredients.");
      return;
    }

    recipe.ingredients.forEach(i => {
      if (i.consume !== false) Inventory.remove(i.id, i.amount);
    });
    Inventory.add(recipe.output.id, recipe.output.amount);

    const item = ITEMS_BY_ID[recipe.output.id];
    const verb = recipeStation(recipe) === "cooking" ? "Cooked" : "Crafted";
    window.showMessage?.(`${verb} ${recipe.output.amount}x ${item?.name || recipe.output.id}`);
    renderRecipes();
  }

  function populateFilters() {
    if (!filter) return;
    const cats = [...new Set(RECIPES
      .filter(r => activeStation === "all" || recipeStation(r) === activeStation)
      .map(r => r.category || "Other"))];
    filter.innerHTML = `<option value="all">All recipes</option>` + cats.map(c => `<option value="${c}">${c}</option>`).join("");
  }

  function renderRecipes() {
    container.innerHTML = "";

    const selected = filter?.value || "all";
    const q = (search?.value || "").trim().toLowerCase();

    const visible = RECIPES.filter(recipe => {
      const item = ITEMS_BY_ID[recipe.output.id];
      const stationMatch = activeStation === "all" || recipeStation(recipe) === activeStation;
      const categoryMatch = selected === "all" || (recipe.category || "Other") === selected;
      const searchMatch = !q ||
        item?.name?.toLowerCase().includes(q) ||
        item?.description?.toLowerCase().includes(q) ||
        recipe.ingredients.some(i => ITEMS_BY_ID[i.id]?.name?.toLowerCase().includes(q));
      return stationMatch && categoryMatch && searchMatch;
    });

    const stationRecipes = RECIPES.filter(r => activeStation === "all" || recipeStation(r) === activeStation);
    const readyCount = stationRecipes.filter(canCraft).length;
    const stationLabel = activeStation === "all" ? "known" : activeStation;
    if (summary) summary.textContent = `${readyCount} ready / ${stationRecipes.length} ${stationLabel} recipes`;

    visible.forEach(recipe => {
      const item = ITEMS_BY_ID[recipe.output.id];
      if (!item) return;

      const station = recipeStation(recipe);
      const ready = canCraft(recipe);
      const card = document.createElement("div");
      card.className = `recipe-card ${ready ? "craftable" : "locked-recipe"} ${station === "cooking" ? "cooking-card" : ""}`;
      card.style.setProperty("--recipe-color", item.color || "#e33");

      const ingredientsHTML = recipe.ingredients.map(i => {
        const it = ITEMS_BY_ID[i.id];
        const owned = Inventory.data[i.id] || 0;
        const ok = owned >= i.amount;
        const toolTag = i.consume === false ? " · tool" : "";
        return `
          <span class="ingredient-pill ${ok ? "has" : "missing"}">
            ${it?.name || i.id}: ${owned}/${i.amount}${toolTag}
          </span>
        `;
      }).join("");

      card.innerHTML = `
        <div class="recipe-topline">
          <span class="recipe-category">${station === "cooking" ? "Cooking" : "Crafting"} · ${recipe.category || "Other"}</span>
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
        <button class="btn craft-btn" ${ready ? "" : "disabled"}>${ready ? (station === "cooking" ? "Cook" : "Craft") : "Locked"}</button>
      `;

      card.querySelector(".craft-btn").addEventListener("click", () => craft(recipe));
      container.appendChild(card);
    });

    if (!container.children.length) {
      container.innerHTML = `<p class="subtitle">No recipes match that search.</p>`;
    }
  }
});
