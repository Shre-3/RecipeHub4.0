const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Bookmark = require("../models/Bookmark");
const recipeService = require("../services/recipeService");
const { toClientRecipe } = require("../utils/recipeMapper");

router.get("/", auth, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.userId }).sort({
      createdAt: -1,
    });

    const recipes = [];

    for (const bookmark of bookmarks) {
      try {
        const recipe = await recipeService.getOrFetch(bookmark.recipeId);
        recipes.push({
          ...toClientRecipe(recipe),
          isBookmarked: true,
        });
      } catch (error) {
        console.error(`Failed to load bookmark ${bookmark.recipeId}`);
      }
    }

    res.json(recipes);
  } catch (error) {
    console.error("Bookmark fetch error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/check/:recipeId", auth, async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({
      user: req.user.userId,
      recipeId: req.params.recipeId,
    });

    res.json({ isBookmarked: !!bookmark });
  } catch (error) {
    console.error("Bookmark check error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).json({ message: "Recipe ID is required" });
    }

    await recipeService.getOrFetch(recipeId);

    const existingBookmark = await Bookmark.findOne({
      user: req.user.userId,
      recipeId,
    });

    if (existingBookmark) {
      return res.status(400).json({ message: "Recipe already bookmarked" });
    }

    const bookmark = new Bookmark({
      user: req.user.userId,
      recipeId,
    });

    await bookmark.save();
    res.status(201).json({ message: "Bookmark added successfully" });
  } catch (error) {
    console.error("Bookmark add error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:recipeId", auth, async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      user: req.user.userId,
      recipeId: req.params.recipeId,
    });

    if (!bookmark) {
      return res.status(404).json({ message: "Bookmark not found" });
    }

    res.json({ message: "Bookmark removed successfully" });
  } catch (error) {
    console.error("Bookmark delete error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
