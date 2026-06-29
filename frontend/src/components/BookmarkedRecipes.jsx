import React, { useEffect, useState } from "react";
import { BookmarkIcon, ChefHat } from "lucide-react";
import { RecipeList } from "./RecipeList";
import { RecipeDetail } from "./RecipeDetail";
import { LoadingSpinner } from "./LoadingSpinner";
import { PageLayout } from "./layout/PageLayout";
import { getBookmarks } from "../api/recipeApi";

export function BookmarkedRecipes() {
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBookmarkedRecipes = async () => {
    try {
      setLoading(true);
      const recipes = await getBookmarks();
      setBookmarkedRecipes(recipes);
      setError(null);
    } catch {
      setError("Unable to load bookmarked recipes");
      setBookmarkedRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarkedRecipes();
  }, []);

  useEffect(() => {
    const handleBookmarkUpdate = () => fetchBookmarkedRecipes();
    window.addEventListener("bookmarkUpdated", handleBookmarkUpdate);
    return () =>
      window.removeEventListener("bookmarkUpdated", handleBookmarkUpdate);
  }, []);

  return (
    <PageLayout className="bg-gradient-to-br from-[#1f5129]/10 to-[#f0e4cc]/30">
      <h1 className="text-2xl font-bold text-[#1f5129] flex items-center justify-center gap-3 text-center">
          <BookmarkIcon className="w-8 h-8" />
          Your Bookmarked Recipes
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-5 bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : bookmarkedRecipes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ChefHat className="w-16 h-16 text-[#1f5129]/30 mb-4" />
                <h3 className="text-lg font-semibold text-[#1f5129] mb-2">
                  No Bookmarked Recipes Yet
                </h3>
                <p className="text-gray-600 max-w-sm">
                  Start exploring recipes and bookmark your favorites to see
                  them here.
                </p>
              </div>
            ) : (
              <RecipeList
                recipes={bookmarkedRecipes}
                selectedRecipe={selectedRecipe}
                onSelectRecipe={setSelectedRecipe}
                loading={loading}
                error={error}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            )}
          </div>

          <div className="lg:col-span-7 bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg">
            <RecipeDetail
              recipe={selectedRecipe}
              loading={loading}
              error={error}
            />
          </div>
        </div>
    </PageLayout>
  );
}
