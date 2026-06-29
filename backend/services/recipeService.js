const CachedRecipe = require("../models/CachedRecipe");
const { searchForkify, fetchForkifyRecipe } = require("./forkifyApi");
const {
  enrichRecipe,
  expandQuery,
  normalizePreferences,
  buildMealPlanSearchQueries,
  buildPantrySearchQueries,
} = require("./recipeFilters");
const {
  mapForkifySummary,
  mapForkifyDetail,
  toClientRecipe,
} = require("../utils/recipeMapper");
const { isRateLimitError, noMatchError } = require("../utils/apiErrors");

const STALE_DAYS = 30;

function isStale(recipe) {
  if (!recipe?.lastFetchedAt) return true;
  return Date.now() - new Date(recipe.lastFetchedAt).getTime() > STALE_DAYS * 24 * 60 * 60 * 1000;
}

async function upsertRecipe(mappedRecipe) {
  const existing = await CachedRecipe.findOne({ forkifyId: mappedRecipe.forkifyId });
  const enriched = enrichRecipe(mappedRecipe);
  const now = new Date();
  return CachedRecipe.findOneAndUpdate(
    { forkifyId: enriched.forkifyId },
    { ...enriched, lastFetchedAt: now, cachedAt: existing?.cachedAt || now },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

function dedupeRecipes(recipes) {
  return [...new Map(recipes.map((r) => [r.forkifyId, r])).values()];
}

async function getOrFetch(forkifyId) {
  const cached = await CachedRecipe.findOne({ forkifyId });
  if (cached?.isFullyCached && !isStale(cached)) {
    return enrichRecipe(cached.toObject());
  }
  const forkifyRecipe = await fetchForkifyRecipe(forkifyId);
  return upsertRecipe(mapForkifyDetail(forkifyRecipe));
}

async function collectFromQueries(queries, idLimit, maxQueries) {
  const seenIds = new Set();
  const summaries = [];
  for (const query of queries.slice(0, maxQueries)) {
    if (seenIds.size >= idLimit) break;
    try {
      for (const result of await searchForkify(query)) {
        if (!seenIds.has(result.id)) {
          seenIds.add(result.id);
          summaries.push(result);
        }
        if (seenIds.size >= idLimit) break;
      }
    } catch (error) {
      if (isRateLimitError(error)) throw error;
      console.error(`Search failed for "${query}":`, error.message);
    }
  }
  return summaries;
}

async function fetchRecipePool(queries, detailLimit, maxQueries = 3) {
  const summaries = await collectFromQueries(queries, 20, maxQueries);
  if (summaries.length === 0) return [];

  const summaryRecipes = summaries.map((r) => enrichRecipe(mapForkifySummary(r)));
  Promise.all(summaries.map((r) => upsertRecipe(mapForkifySummary(r)))).catch(() => {});

  const ids = summaries.slice(0, detailLimit).map((r) => r.id);
  const detailed = await Promise.all(
    ids.map(async (id) => {
      try {
        return await getOrFetch(id);
      } catch {
        return null;
      }
    })
  );

  const detailMap = new Map(detailed.filter(Boolean).map((r) => [r.forkifyId, r]));
  return dedupeRecipes(summaryRecipes.map((r) => detailMap.get(r.forkifyId) || r));
}

async function searchAndCache(query) {
  const results = await searchForkify(expandQuery(query)[0] || query);
  if (results.length === 0) {
    throw Object.assign(new Error("No recipes found from Forkify for this search."), {
      statusCode: 503,
    });
  }
  const clientRecipes = results.map((r) =>
    toClientRecipe(enrichRecipe(mapForkifySummary(r)))
  );
  Promise.all(results.map((r) => upsertRecipe(mapForkifySummary(r)))).catch(() => {});
  return clientRecipes;
}

async function getById(forkifyId) {
  return toClientRecipe(await getOrFetch(forkifyId));
}

async function fetchForMealPlan(preferences, numDays = 7) {
  const normalized = normalizePreferences(preferences);
  const recipes = await fetchRecipePool(
    buildMealPlanSearchQueries(normalized),
    Math.min(numDays + 5, 12)
  );
  if (recipes.length === 0) {
    throw noMatchError();
  }
  return recipes;
}

async function fetchForPantry(preferences, pantryIngredients) {
  const normalized = normalizePreferences(preferences);
  const queries = buildPantrySearchQueries(normalized, pantryIngredients);
  if (queries.length === 0) {
    throw Object.assign(new Error("Add pantry ingredients to search Forkify."), {
      statusCode: 400,
    });
  }
  const recipes = await fetchRecipePool(queries, 12, 5);
  if (recipes.length === 0) {
    throw noMatchError();
  }
  return recipes;
}

module.exports = {
  searchAndCache,
  getOrFetch,
  getById,
  fetchForMealPlan,
  fetchForPantry,
  toClientRecipe,
};
