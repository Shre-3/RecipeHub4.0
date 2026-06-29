import React, { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  Clock,
  Users,
  Plus,
  Minus,
  Bookmark,
} from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { RecipeContent } from "./RecipeContent";
import { useAuth } from "../context/AuthContext";
import { formatCookTime } from "../utils/text";
import {
  checkBookmark,
  addBookmark,
  removeBookmark,
} from "../api/recipeApi";

export function RecipeDetail({ recipe, loading, error }) {
  const { user } = useAuth();
  const [servings, setServings] = useState(1);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  useEffect(() => {
    const loadBookmarkStatus = async () => {
      if (!recipe?.id || !user) return;

      try {
        const bookmarked = await checkBookmark(recipe.id);
        setIsBookmarked(bookmarked);
      } catch {
        setIsBookmarked(false);
      }
    };

    loadBookmarkStatus();
    setServings(recipe?.servings || 1);
  }, [recipe, user]);

  const toggleBookmark = async () => {
    if (!recipe?.id) return;

    try {
      setIsBookmarkLoading(true);

      if (!isBookmarked) {
        await addBookmark(recipe.id);
        setIsBookmarked(true);
      } else {
        await removeBookmark(recipe.id);
        setIsBookmarked(false);
      }

      window.dispatchEvent(new CustomEvent("bookmarkUpdated"));
    } catch {
      alert("Unable to update bookmark. Please try again.");
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] h-full p-6">
        <ErrorMessage message={error} />
      </div>
    );
  }
  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] h-full text-gray-500 text-center">
        <UtensilsCrossed className="w-8 h-8 mb-2" />
        <p>Select a recipe to view details</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between">
        <h2 className="text-2xl font-bold text-[#1f5129]">{recipe.name}</h2>
        {user && (
          <button
            onClick={toggleBookmark}
            disabled={isBookmarkLoading}
            className={`p-2 rounded-full transition-colors ${
              isBookmarked
                ? "text-[#1f5129] bg-[#1f5129]/10"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Bookmark
              className={`w-6 h-6 ${isBookmarkLoading ? "animate-pulse" : ""}`}
              fill={isBookmarked ? "#1f5129" : "none"}
              stroke={isBookmarked ? "#1f5129" : "currentColor"}
            />
          </button>
        )}
      </div>

      <div className="mt-4">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-64 object-cover rounded-lg"
        />
      </div>

      <div className="mt-4 flex items-center gap-6 text-[#1f5129]">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span>{formatCookTime(recipe.cookTime)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setServings((current) => Math.max(1, current - 1))}
              disabled={servings <= 1}
              className="p-1 rounded-full hover:bg-[#1f5129]/10 disabled:opacity-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span>{servings} servings</span>
            <button
              onClick={() => setServings((current) => current + 1)}
              className="p-1 rounded-full hover:bg-[#1f5129]/10"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <RecipeContent recipe={recipe} servings={servings} />
    </div>
  );
}
