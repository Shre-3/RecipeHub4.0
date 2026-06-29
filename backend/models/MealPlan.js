const mongoose = require("mongoose");

const mealPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  days: [
    {
      day: Number,
      forkifyId: String,
      title: String,
      image_url: String,
      cooking_time: Number,
    },
  ],
  preferences: {
    diets: [String],
    allergies: [String],
    cuisines: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MealPlan", mealPlanSchema);
