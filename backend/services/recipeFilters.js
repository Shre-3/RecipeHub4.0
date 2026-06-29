const CUISINE_SEARCH_QUERIES = {
  indian: [
    "indian",
    "curry",
    "dal",
    "dahl",
    "masala",
    "tikka",
    "biryani",
    "paneer",
    "dosa",
    "chana",
  ],
  italian: ["italian", "pasta", "pizza", "risotto", "lasagna"],
  mexican: ["mexican", "taco", "burrito", "salsa", "enchilada"],
  chinese: ["chinese", "stir fry", "noodles", "dumpling"],
  japanese: ["japanese", "ramen", "teriyaki", "sushi", "udon"],
  thai: ["thai", "pad thai", "green curry", "papaya salad"],
  mediterranean: ["mediterranean", "falafel", "hummus", "tzatziki", "gyro"],
  american: ["american", "burger", "bbq", "waffle", "pancake", "hot dog"],
};

const CUISINE_MATCH_KEYWORDS = {
  indian: [
    "masala",
    "tikka",
    "biryani",
    "paneer",
    "dosa",
    "naan",
    "dal",
    "chana",
  ],
  italian: ["pasta", "pizza", "risotto"],
  mexican: ["taco", "burrito", "salsa"],
  chinese: ["stir fry", "dumpling", "noodles"],
  japanese: ["ramen", "teriyaki", "sushi"],
  thai: ["pad thai", "green curry"],
  mediterranean: ["falafel", "hummus", "tzatziki"],
  american: ["burger", "bbq"],
};

const ALL_CUISINES = Object.keys(CUISINE_SEARCH_QUERIES);

const MEAT_KEYWORDS = [
  "chicken",
  "beef",
  "pork",
  "lamb",
  "goat",
  "mutton",
  "bacon",
  "ham",
  "sausage",
  "turkey",
  "duck",
  "goose",
  "venison",
  "veal",
  "rabbit",
  "bison",
  "oxtail",
  "brisket",
  "prosciutto",
  "salami",
  "chorizo",
  "pancetta",
  "anchovy",
  "sardine",
  "fish",
  "salmon",
  "tuna",
  "cod",
  "trout",
  "mackerel",
  "shrimp",
  "prawn",
  "crab",
  "lobster",
  "scallop",
  "squid",
  "calamari",
  "meat",
  "steak",
  "liver",
  "kidney",
  "mince",
];

const MEAT_TEXT_EXCEPTIONS = [
  "goat cheese",
  "goat's cheese",
  "goats cheese",
  "champagne",
];

const DAIRY_KEYWORDS = [
  "milk",
  "cheese",
  "butter",
  "cream",
  "yogurt",
  "yoghurt",
  "parmesan",
  "mozzarella",
  "cheddar",
];

const ALLERGEN_RULES = {
  dairy: DAIRY_KEYWORDS,
  gluten: [
    "flour",
    "bread",
    "pasta",
    "wheat",
    "breadcrumbs",
    "noodle",
    "spaghetti",
    "tortilla",
  ],
  nuts: [
    "peanut",
    "almond",
    "walnut",
    "cashew",
    "pecan",
    "hazelnut",
    "pistachio",
  ],
  shellfish: ["shrimp", "prawn", "crab", "lobster", "mussel", "clam", "oyster"],
  soy: ["soy", "tofu", "edamame", "miso"],
};

const CUISINE_RULES = {
  italian: [
    "pasta",
    "pizza",
    "basil",
    "parmesan",
    "risotto",
    "mozzarella",
    "italian",
  ],
  indian: [
    "masala",
    "tikka",
    "biryani",
    "paneer",
    "dosa",
    "naan",
    "dal",
    "chana",
    "indian",
  ],
  mexican: ["taco", "burrito", "salsa", "jalapeno", "guacamole", "mexican"],
  chinese: ["stir fry", "dumpling", "chinese"],
  japanese: ["sushi", "ramen", "teriyaki", "wasabi", "udon", "japanese"],
  thai: ["pad thai", "lemongrass", "thai basil", "thai"],
  mediterranean: ["feta", "hummus", "tzatziki", "mediterranean", "greek"],
  american: ["burger", "bbq", "pancake", "waffle", "american"],
};

function normalizePreferences(preferences = {}) {
  const cuisines = preferences.cuisines || [];
  const allSelected =
    cuisines.length > 0 && ALL_CUISINES.every((c) => cuisines.includes(c));
  return allSelected ? { ...preferences, cuisines: [] } : preferences;
}

function expandQuery(query) {
  const normalized = query.toLowerCase().trim();
  const queries = [normalized];
  if (CUISINE_SEARCH_QUERIES[normalized]) {
    const extras = CUISINE_SEARCH_QUERIES[normalized].filter(
      (t) => t !== normalized,
    );
    queries.push(...extras.slice(0, 1));
  }
  return [...new Set(queries)].slice(0, 2);
}

function buildMealPlanSearchQueries(preferences = {}) {
  const { diets = [], cuisines = [] } = normalizePreferences(preferences);
  if (cuisines.length === 0) {
    const queries = [];
    for (const diet of diets) {
      queries.push(diet, `${diet} recipe`, `${diet} dinner`);
    }
    queries.push("quick dinner", "easy recipe", "healthy dinner");
    return [...new Set(queries)].slice(0, 5);
  }
  const queries = [];
  for (const cuisine of cuisines) {
    queries.push(
      cuisine,
      ...(CUISINE_SEARCH_QUERIES[cuisine] || []).slice(0, 2),
    );
    if (diets[0]) queries.push(`${cuisine} ${diets[0]}`);
  }
  return [...new Set(queries)];
}

function buildPantrySearchQueries(preferences = {}, pantryIngredients = []) {
  const { diets = [], cuisines = [] } = normalizePreferences(preferences);
  const ingredients = pantryIngredients
    .map((i) => i.trim())
    .filter(Boolean)
    .slice(0, 4);
  const queries = [...ingredients];

  if (cuisines.length === 0) {
    if (diets[0]) {
      queries.push(diets[0]);
      for (const ing of ingredients.slice(0, 2)) {
        queries.push(`${diets[0]} ${ing}`);
      }
    }
    return [...new Set(queries)].slice(0, 6);
  }

  for (const ing of ingredients) {
    for (const cuisine of cuisines) {
      queries.push(`${cuisine} ${ing}`);
    }
  }
  if (diets[0]) {
    for (const cuisine of cuisines) {
      queries.push(`${cuisine} ${diets[0]}`);
    }
  }
  for (const cuisine of cuisines) {
    queries.push(cuisine);
  }

  return [...new Set(queries)].slice(0, 8);
}

function getCuisineMatchKeywords(cuisines = []) {
  const keywords = new Set();
  for (const cuisine of cuisines) {
    keywords.add(cuisine);
    for (const term of CUISINE_MATCH_KEYWORDS[cuisine] || [])
      keywords.add(term);
  }
  return [...keywords];
}

function normalizeIngredients(ingredients = []) {
  return ingredients
    .map((ing) => (ing.description || "").toLowerCase().trim())
    .filter(Boolean)
    .join(" ");
}

function buildIngredientText(title, ingredients) {
  return `${(title || "").toLowerCase()} ${normalizeIngredients(ingredients)}`.trim();
}

function containsAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function containsMeat(text) {
  let normalized = text.toLowerCase();
  for (const phrase of MEAT_TEXT_EXCEPTIONS) {
    normalized = normalized.replaceAll(phrase, " ");
  }
  return MEAT_KEYWORDS.some((keyword) => {
    const pattern = new RegExp(
      `\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i",
    );
    return pattern.test(normalized);
  });
}

function inferDietTags(ingredientText) {
  const hasMeat = containsMeat(ingredientText);
  const hasAnimal =
    hasMeat ||
    containsAny(ingredientText, DAIRY_KEYWORDS) ||
    containsAny(ingredientText, ["egg", "eggs", "honey"]);
  const tags = [];
  if (!hasMeat) tags.push("vegetarian");
  if (!hasAnimal) tags.push("vegan");
  if (!containsAny(ingredientText, ALLERGEN_RULES.gluten))
    tags.push("gluten-free");
  if (!containsAny(ingredientText, DAIRY_KEYWORDS)) tags.push("dairy-free");
  return tags;
}

function inferAllergens(ingredientText) {
  return Object.entries(ALLERGEN_RULES)
    .filter(([, keywords]) => containsAny(ingredientText, keywords))
    .map(([allergen]) => allergen);
}

function inferCuisineTags(title, ingredients) {
  const text = buildIngredientText(title, ingredients);
  const titleText = (title || "").toLowerCase();
  const tags = Object.entries(CUISINE_RULES)
    .filter(
      ([, keywords]) =>
        containsAny(text, keywords) || containsAny(titleText, keywords),
    )
    .map(([cuisine]) => cuisine);
  return tags.length > 0 ? tags : ["general"];
}

function enrichRecipe(recipe) {
  const ingredientText = buildIngredientText(recipe.title, recipe.ingredients);
  return {
    ...recipe,
    ingredientText,
    dietTags: inferDietTags(ingredientText),
    allergens: inferAllergens(ingredientText),
    cuisineTags: inferCuisineTags(recipe.title, recipe.ingredients),
  };
}

function matchesDiet(recipe, diet, recipeText) {
  if (diet === "vegetarian") return !containsMeat(recipeText);
  if (diet === "vegan") {
    return (
      !containsMeat(recipeText) &&
      !containsAny(recipeText, DAIRY_KEYWORDS) &&
      !containsAny(recipeText, ["egg", "eggs", "honey"])
    );
  }
  if (diet === "gluten-free")
    return !containsAny(recipeText, ALLERGEN_RULES.gluten);
  if (diet === "dairy-free") return !containsAny(recipeText, DAIRY_KEYWORDS);
  return (recipe.dietTags || []).includes(diet);
}

function recipeMatchesCuisine(recipe, cuisines = []) {
  if (cuisines.length === 0) return true;
  const titleText = (recipe.title || "").toLowerCase();
  const recipeCuisines = recipe.cuisineTags || [];
  if (
    cuisines.some((c) => titleText.includes(c) || recipeCuisines.includes(c))
  ) {
    return true;
  }
  return getCuisineMatchKeywords(cuisines).some((kw) => titleText.includes(kw));
}

function matchesPreferences(recipe, preferences = {}, options = {}) {
  const { skipCuisine = false } = options;
  const { diets = [], allergies = [], cuisines = [] } = preferences;
  if (allergies.some((a) => (recipe.allergens || []).includes(a))) return false;
  if (diets.length > 0) {
    const text =
      recipe.ingredientText ||
      buildIngredientText(recipe.title, recipe.ingredients);
    if (!diets.every((d) => matchesDiet(recipe, d, text))) return false;
  }
  if (!skipCuisine && !recipeMatchesCuisine(recipe, cuisines)) return false;
  return true;
}

function matchesMealPlanPreferences(recipe, preferences = {}) {
  return matchesPreferences(recipe, preferences, { skipCuisine: true });
}

function matchesPantryPreferences(recipe, preferences = {}) {
  return matchesPreferences(recipe, preferences, { skipCuisine: true });
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

module.exports = {
  enrichRecipe,
  matchesPreferences,
  matchesMealPlanPreferences,
  matchesPantryPreferences,
  recipeMatchesCuisine,
  normalizePreferences,
  normalizeIngredients,
  tokenize,
  buildMealPlanSearchQueries,
  buildPantrySearchQueries,
  expandQuery,
  ALL_CUISINES,
};
