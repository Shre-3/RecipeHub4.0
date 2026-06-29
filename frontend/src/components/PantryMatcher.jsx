import React, { useState } from "react";
import { Loader2, ShoppingBasket } from "lucide-react";
import { getPantryMatches, getRecipeById } from "../api/recipeApi";
import { FilterPanel, getActivePreferences } from "./PreferencesPanel";
import { RecipeList } from "./RecipeList";
import { RecipeDetail } from "./RecipeDetail";
import { PageLayout } from "./layout/PageLayout";

export function PantryMatcher() {
  const [ingredients, setIngredients] = useState("");
  const [preferences, setPreferences] = useState({});
  const [matches, setMatches] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSelectRecipe = async (recipe) => {
    setDetailError(null);
    try {
      const fullRecipe = await getRecipeById(recipe.id);
      setSelectedRecipe({
        ...fullRecipe,
        matchPercent: recipe.matchPercent,
        matchedIngredients: recipe.matchedIngredients,
        missingIngredients: recipe.missingIngredients,
      });
    } catch (err) {
      setDetailError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDetailError(null);

    try {
      const pantryList = ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const results = await getPantryMatches(
        pantryList,
        getActivePreferences(preferences)
      );
      setMatches(results);
      setCurrentPage(1);
      if (results[0]) {
        await handleSelectRecipe(results[0]);
      } else {
        setSelectedRecipe(null);
      }
    } catch (err) {
      setError(err.message);
      setMatches([]);
      setSelectedRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout className="bg-gradient-to-br from-[#1f5129]/10 to-[#f0e4cc]/30">
      <h1 className="text-2xl font-bold text-[#1f5129] flex items-center justify-center gap-3 text-center">
          <ShoppingBasket className="w-8 h-8" />
          Cook With What You Have
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-5 bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1f5129] mb-1">
                  Pantry ingredients (comma-separated)
                </label>
                <textarea
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  rows={3}
                  placeholder="chicken, rice, tomato, onion"
                  className="w-full p-2 rounded-lg border border-[#1f5129]/30"
                />
              </div>
              <FilterPanel
                onChange={setPreferences}
                title="Optional filters for pantry matching"
              />
              <button
                type="submit"
                disabled={loading || !ingredients.trim()}
                className="w-full py-2 bg-[#1f5129] text-white rounded-md hover:bg-[#1f5129]/90 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Matching recipes...
                  </span>
                ) : (
                  "Find Matching Recipes"
                )}
              </button>
            </form>

            <RecipeList
              recipes={matches}
              selectedRecipe={selectedRecipe}
              onSelectRecipe={handleSelectRecipe}
              loading={loading}
              error={error}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              showMatchPercent
              emptyMessage="Enter pantry ingredients and click Find Matching Recipes"
            />
          </div>

          <div className="lg:col-span-7 bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg">
            {selectedRecipe?.matchPercent != null && (
              <div className="mb-4 text-sm text-[#1f5129] bg-[#1f5129]/10 px-3 py-2 rounded-lg">
                <p className="font-medium">
                  {selectedRecipe.matchPercent}% ingredient match
                </p>
                {selectedRecipe.missingIngredients?.length > 0 && (
                  <p className="mt-1">
                    Missing: {selectedRecipe.missingIngredients.join(", ")}
                  </p>
                )}
              </div>
            )}
            <RecipeDetail
              recipe={selectedRecipe}
              loading={loading}
              error={detailError}
            />
          </div>
        </div>
    </PageLayout>
  );
}
