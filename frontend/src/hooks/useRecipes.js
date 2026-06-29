import { useState, useCallback, useEffect } from "react";
import { searchRecipes, getRecipeById } from "../api/recipeApi";

export function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadRecipeFromHash = async () => {
      const hash = window.location.hash.slice(1);
      if (!hash) {
        setSelectedRecipe(null);
        return;
      }

      setDetailLoading(true);
      setError(null);

      try {
        const recipe = await getRecipeById(hash);
        setSelectedRecipe(recipe);
      } catch (err) {
        setError(err.message);
        setSelectedRecipe(null);
      } finally {
        setDetailLoading(false);
      }
    };

    loadRecipeFromHash();
    window.addEventListener("hashchange", loadRecipeFromHash);
    return () => window.removeEventListener("hashchange", loadRecipeFromHash);
  }, []);

  const searchForRecipes = useCallback(async (query) => {
    if (!query.trim()) {
      setRecipes([]);
      return;
    }

    setListLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const results = await searchRecipes(query);
      setRecipes(results);
    } catch (err) {
      setError(err.message);
      setRecipes([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  const selectRecipe = useCallback((recipe) => {
    window.location.hash = recipe.id;
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setRecipes([]);
    setSelectedRecipe(null);
    setError(null);
  }, []);

  return {
    recipes,
    selectedRecipe,
    listLoading,
    detailLoading,
    error,
    currentPage,
    setCurrentPage,
    searchForRecipes,
    selectRecipe,
    reset,
  };
}
