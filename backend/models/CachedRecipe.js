const mongoose = require("mongoose");

const cachedRecipeSchema = new mongoose.Schema({
  forkifyId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  publisher: String,
  image_url: String,
  source_url: String,
  cooking_time: Number,
  servings: Number,
  ingredients: [
    {
      quantity: Number,
      unit: String,
      description: String,
    },
  ],
  instructions: [String],
  ingredientText: {
    type: String,
    index: "text",
  },
  dietTags: [String],
  allergens: [String],
  cuisineTags: [String],
  isFullyCached: {
    type: Boolean,
    default: false,
  },
  cachedAt: {
    type: Date,
    default: Date.now,
  },
  lastFetchedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CachedRecipe", cachedRecipeSchema);
