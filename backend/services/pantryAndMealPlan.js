const MealPlan = require("../models/MealPlan");
const {
  fetchForPantry,
  fetchForMealPlan,
  toClientRecipe,
} = require("./recipeService");
const { decodeHtml } = require("../utils/recipeMapper");
const {
  matchesPantryPreferences,
  matchesMealPlanPreferences,
  normalizePreferences,
  normalizeIngredients,
  tokenize,
} = require("./recipeFilters");
const { noMatchError } = require("../utils/apiErrors");

const MIN_PLAN_DAYS = 3;

function ingredientOverlapScore(recipe, pantryIngredients) {
  const pantrySet = new Set(
    pantryIngredients.map((item) => item.toLowerCase().trim()).filter(Boolean),
  );
  if (pantrySet.size === 0) return { score: 0, matched: [], missing: [] };

  const recipeItems = (recipe.ingredients || [])
    .map((ing) => (ing.description || "").toLowerCase().trim())
    .filter(Boolean);

  const titleText =
    `${recipe.title || ""} ${recipe.ingredientText || ""}`.toLowerCase();
  const titleMatched = [...pantrySet].filter(
    (item) => titleText.includes(item) || item.includes(titleText.trim()),
  );

  if (recipeItems.length === 0) {
    return {
      score: titleMatched.length > 0 ? 0.5 : 0,
      matched: titleMatched,
      missing: [],
    };
  }

  const matched = [];
  const missing = [];
  for (const item of recipeItems) {
    if ([...pantrySet].some((p) => item.includes(p) || p.includes(item))) {
      matched.push(item);
    } else {
      missing.push(item);
    }
  }

  for (const item of titleMatched) {
    if (!matched.includes(item)) matched.push(item);
  }

  const score =
    recipeItems.length > 0
      ? Math.max(
          matched.length / recipeItems.length,
          titleMatched.length > 0 ? 0.25 : 0,
        )
      : titleMatched.length > 0
        ? 0.5
        : 0;

  return { score, matched, missing };
}

async function getPantryMatches(
  userId,
  pantryIngredients,
  preferences = {},
  limit = 10,
) {
  const active = normalizePreferences(preferences || {});
  const pool = await fetchForPantry(active, pantryIngredients);

  const scored = pool
    .filter((recipe) => matchesPantryPreferences(recipe, active))
    .map((recipe) => {
      const overlap = ingredientOverlapScore(recipe, pantryIngredients);
      return {
        ...toClientRecipe(recipe),
        matchPercent: Math.round(overlap.score * 100),
        matchedIngredients: overlap.matched,
        missingIngredients: overlap.missing,
        pantryTokens: tokenize(
          normalizeIngredients(
            pantryIngredients.map((i) => ({ description: i })),
          ),
        ),
      };
    })
    .filter((r) => r.matchPercent > 0)
    .sort((a, b) => b.matchPercent - a.matchPercent)
    .slice(0, limit);

  if (scored.length === 0) {
    throw noMatchError();
  }

  return scored;
}

function titleSimilarity(titleA, titleB) {
  const wordsA = new Set(
    titleA
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3),
  );
  const wordsB = titleB
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);
  return wordsB.filter((w) => wordsA.has(w)).length;
}

function diversityPenalty(recipe, selected) {
  let penalty = 0;
  for (const pick of selected) {
    const shared = (recipe.cuisineTags || []).filter(
      (t) => t !== "general" && (pick.cuisineTags || []).includes(t),
    );
    penalty += shared.length * 0.35;
    penalty += titleSimilarity(recipe.title, pick.title) * 0.25;
  }
  return penalty;
}

function preferenceScore(recipe, preferences) {
  let score = 1;
  if (preferences.cuisines?.length) {
    const title = (recipe.title || "").toLowerCase();
    const match =
      (recipe.cuisineTags || []).some((t) =>
        preferences.cuisines.includes(t),
      ) || preferences.cuisines.some((c) => title.includes(c));
    score += match ? 0.8 : 0.35;
  }
  return score;
}

async function generateMealPlan(userId, numDays = 7, preferences = {}) {
  const active = normalizePreferences(preferences || {});
  const pool = await fetchForMealPlan(active, numDays);
  const candidates = [
    ...new Map(
      pool
        .filter((r) => matchesMealPlanPreferences(r, active))
        .map((r) => [r.forkifyId, r]),
    ).values(),
  ];

  if (candidates.length === 0) {
    throw noMatchError();
  }

  const planDays = Math.min(numDays, candidates.length);
  if (planDays < MIN_PLAN_DAYS) {
    throw noMatchError();
  }

  const warning =
    planDays < numDays
      ? `Only ${candidates.length} recipes matched. Generated a ${planDays}-day plan instead of ${numDays}.`
      : null;

  const selected = [];
  const usedIds = new Set();

  for (let day = 1; day <= planDays; day++) {
    const ranked = candidates
      .filter((r) => !usedIds.has(r.forkifyId))
      .map((recipe) => ({
        recipe,
        score:
          preferenceScore(recipe, active) - diversityPenalty(recipe, selected),
      }))
      .sort((a, b) => b.score - a.score);

    const top = ranked.slice(0, Math.min(3, ranked.length));
    const pick = top[Math.floor(Math.random() * top.length)]?.recipe;
    if (!pick) throw noMatchError();

    usedIds.add(pick.forkifyId);
    selected.push(pick);
  }

  const mealPlan = await MealPlan.create({
    user: userId,
    days: selected.map((recipe, i) => ({
      day: i + 1,
      forkifyId: recipe.forkifyId,
      title: decodeHtml(recipe.title),
      image_url: recipe.image_url,
      cooking_time: recipe.cooking_time,
    })),
    preferences: active,
  });

  return { mealPlan, warning };
}

async function getLatestMealPlan(userId) {
  const mealPlan = await MealPlan.findOne({ user: userId }).sort({
    createdAt: -1,
  });
  if (!mealPlan) return null;

  const doc = mealPlan.toObject();
  doc.days = doc.days.map((day) => ({
    ...day,
    title: decodeHtml(day.title),
  }));
  return doc;
}

module.exports = {
  getPantryMatches,
  generateMealPlan,
  getLatestMealPlan,
  ingredientOverlapScore,
  diversityPenalty,
  titleSimilarity,
};
