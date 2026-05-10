/* =====================================================
   CRAFTING SYSTEM
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("recipesContainer");
  if (!container) return;

  Inventory.load();
  renderRecipes();

  function canCraft(recipe) {
    return recipe.ingredients.every(i =>
      Inventory.has(i.id, i.amount)
    );
  }

  function craft(recipe) {
    if (!canCraft(recipe)) return;

    recipe.ingredients.forEach(i =>
      Inventory.remove(i.id, i.amount)
    );

    Inventory.add(recipe.output.id, recipe.output.amount);
    renderRecipes();
  }

  function renderRecipes() {
    container.innerHTML = "";

    RECIPES.forEach(recipe => {
      if (!canCraft(recipe)) return;

      const item = ITEMS_BY_ID[recipe.output.id];
      if (!item) return;

      const card = document.createElement("div");
      card.className = "recipe-card";
      card.style.borderColor = item.color;

      const ingredientsText = recipe.ingredients
        .map(i => {
          const it = ITEMS_BY_ID[i.id];
          return `${i.amount}x ${it?.name || i.id}`;
        })
        .join(", ");

      card.innerHTML = `
        <div class="recipe-header">
          <img src="${item.icon}">
          <strong>${item.name}</strong>
        </div>
        <div class="recipe-ingredients">
          Requires: ${ingredientsText}
        </div>
        <button class="btn craft-btn">Craft</button>
      `;

      card.querySelector(".craft-btn")
        .addEventListener("click", () => craft(recipe));

      container.appendChild(card);
    });

    if (!container.children.length) {
      container.innerHTML = `<p class="subtitle">Nothing craftable yet.</p>`;
    }
  }
});