const express = require("express");
const router = express.Router();
const recipeService = require("../services/recipeService");

router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const recipes = await recipeService.searchAndCache(q.trim());
    res.json({ data: { recipes } });
  } catch (error) {
    console.error("Search error:", error.message);
    const status = error.statusCode || 500;
    res.status(status).json({ message: error.message || "Failed to search recipes" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const recipe = await recipeService.getById(req.params.id);
    res.json({ data: { recipe } });
  } catch (error) {
    console.error("Recipe fetch error:", error.message);
    res.status(404).json({ message: "Recipe not found" });
  }
});

module.exports = router;
