import React from "react";
import { Clock, Users } from "lucide-react";
import { formatCookTime } from "../utils/text";

export function RecipeCard({
  recipe,
  isSelected,
  onClick,
  showReason = false,
  showMatchPercent = false,
}) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "bg-[#1f5129] text-[#f4f1e7]"
          : "bg-[#f3e8cc] hover:bg-[#1f5129]/10"
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-shrink-0">
          {recipe.image && (
            <img
              src={recipe.image}
              alt={recipe.name}
              className="sm:w-24 h-24 rounded-md object-cover"
            />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-2">{recipe.name}</h3>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatCookTime(recipe.cookTime)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {recipe.servings} servings
            </span>
          </div>
          {showMatchPercent && recipe.matchPercent != null && (
            <p className="text-sm mt-2 font-medium">
              {recipe.matchPercent}% ingredient match
            </p>
          )}
          {showReason && recipe.reason && (
            <p className="text-sm mt-2 opacity-90">{recipe.reason}</p>
          )}
        </div>
      </div>
    </div>
  );
}
