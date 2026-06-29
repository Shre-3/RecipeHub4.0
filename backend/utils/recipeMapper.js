function decodeHtml(text = "") {
  return String(text)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function mapForkifySummary(recipe) {
  return {
    forkifyId: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher || "",
    image_url: recipe.image_url || "",
    source_url: recipe.source_url || "",
    cooking_time: recipe.cooking_time || null,
    servings: recipe.servings || null,
    ingredients: recipe.ingredients || [],
    instructions: [],
    isFullyCached: false,
  };
}

function mapForkifyDetail(recipe) {
  return {
    forkifyId: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher || "",
    image_url: recipe.image_url || "",
    source_url: recipe.source_url || "",
    cooking_time: recipe.cooking_time || null,
    servings: recipe.servings || null,
    ingredients: (recipe.ingredients || []).map((ing) => ({
      quantity: ing.quantity ?? null,
      unit: ing.unit || "",
      description: ing.description || "",
    })),
    instructions: recipe.instructions || recipe.cooking_instructions || [],
    isFullyCached: true,
  };
}

function toClientRecipe(recipe) {
  const name = decodeHtml(recipe.title);
  return {
    id: recipe.forkifyId,
    name,
    description: name,
    image: recipe.image_url,
    sourceUrl: recipe.source_url || "",
    cookTime: recipe.cooking_time || 30,
    servings: recipe.servings || 4,
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    publisher: recipe.publisher || "",
    dietTags: recipe.dietTags || [],
    allergens: recipe.allergens || [],
    cuisineTags: recipe.cuisineTags || [],
  };
}

module.exports = {
  decodeHtml,
  mapForkifySummary,
  mapForkifyDetail,
  toClientRecipe,
};
