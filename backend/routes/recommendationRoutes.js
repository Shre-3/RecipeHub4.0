const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const pantryAndMealPlan = require("../services/pantryAndMealPlan");

router.post("/pantry", auth, async (req, res) => {
  try {
    const { ingredients, preferences = {}, limit = 10 } = req.body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one pantry ingredient is required" });
    }

    const matches = await pantryAndMealPlan.getPantryMatches(
      req.user.userId,
      ingredients,
      preferences,
      limit
    );

    res.json({ matches });
  } catch (error) {
    console.error("Pantry match error:", error.message);
    const status = error.statusCode || 500;
    res.status(status).json({
      message: error.message || "Failed to match pantry ingredients",
    });
  }
});

router.post("/meal-plan", auth, async (req, res) => {
  try {
    const { numDays = 7, preferences = {} } = req.body;
    const { mealPlan, warning } = await pantryAndMealPlan.generateMealPlan(
      req.user.userId,
      numDays,
      preferences
    );

    res.status(201).json({ mealPlan, warning });
  } catch (error) {
    console.error("Meal plan error:", error.message);
    const status = error.statusCode || 400;
    res.status(status).json({
      message: error.message || "Failed to generate meal plan",
    });
  }
});

router.get("/meal-plan", auth, async (req, res) => {
  try {
    const mealPlan = await pantryAndMealPlan.getLatestMealPlan(req.user.userId);

    if (!mealPlan) {
      return res.status(404).json({ message: "No meal plan found" });
    }

    res.json({ mealPlan });
  } catch (error) {
    console.error("Meal plan fetch error:", error.message);
    res.status(500).json({ message: "Failed to fetch meal plan" });
  }
});

module.exports = router;
