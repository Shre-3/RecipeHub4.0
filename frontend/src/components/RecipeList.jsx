import React from "react";
import { RecipeCard } from "./RecipeCard";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ChefHat,
  Sparkles,
} from "lucide-react";

const RECIPES_PER_PAGE = 6;

export function RecipeList({
  recipes,
  selectedRecipe,
  onSelectRecipe,
  loading,
  error,
  currentPage,
  setCurrentPage,
  showReason = false,
  showMatchPercent = false,
  emptyMessage = "Start by searching for a recipe above",
}) {
  if (loading) return <LoadingSpinner />;

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="relative mb-6">
          <ChefHat className="w-16 h-16 text-[#1f5129]" />
          <Sparkles className="w-6 h-6 text-[#1f5129] absolute -top-1 -right-1" />
        </div>
        <h2 className="text-2xl font-bold text-[#1f5129] mb-3">
          Welcome to RecipeHub!
        </h2>
        <p className="text-gray-600 mb-6 max-w-sm">
          Discover recipes, match your pantry ingredients, and plan weekly meals
          with optional diet and cuisine filters.
        </p>
        {error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="flex items-center gap-2 text-[#1f5129]/70 bg-[#1f5129]/5 px-4 py-2 rounded-lg">
            <Search className="w-5 h-5" />
            <span>{emptyMessage}</span>
          </div>
        )}
      </div>
    );
  }

  const totalPages = Math.ceil(recipes.length / RECIPES_PER_PAGE);
  const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
  const currentRecipes = recipes.slice(
    startIndex,
    startIndex + RECIPES_PER_PAGE
  );

  return (
    <div>
      <div className="space-y-4 mb-6">
        {currentRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isSelected={selectedRecipe?.id === recipe.id}
            onClick={() => onSelectRecipe(recipe)}
            showReason={showReason}
            showMatchPercent={showMatchPercent}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-emerald-800/10">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
              currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-emerald-800 hover:bg-emerald-800/10"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-sm text-emerald-800">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
              currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-emerald-800 hover:bg-emerald-800/10"
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
