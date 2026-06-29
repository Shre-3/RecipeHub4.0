import React from "react";
import { ExternalLink } from "lucide-react";

export function RecipeContent({ recipe, servings }) {
  return (
    <>
      {/* Ingredients Section */}
      <div className="mt-4 bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-[#1f5129]/10">
        <h3 className="text-lg font-semibold text-[#1f5129] mb-3">
          Ingredients
        </h3>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, index) => (
            <li key={index}>
              <div className="flex items-baseline gap-2">
                {ing.quantity && (
                  <span className="font-medium text-[#1f5129] whitespace-nowrap">
                    {((ing.quantity * servings) / recipe.servings).toFixed(
                      ((ing.quantity * servings) / recipe.servings) % 1 === 0
                        ? 0
                        : 2
                    )}{" "}
                    <span className="text-[#1f5129]/70">{ing.unit}</span>
                  </span>
                )}
                <span className="text-gray-700">{ing.description}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      {recipe.instructions && recipe.instructions.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-[#1f5129] mb-3">
            Instructions
          </h3>
          <ol className="list-none space-y-3 text-gray-800">
            {recipe.instructions.map((instruction, index) => {
              // Remove the duplicate "Step" if it exists in the instruction
              const cleanInstruction = instruction.replace(
                /^Step \d+:\s*/i,
                ""
              );
              return (
                <li key={index} className="flex gap-2">
                  <span className="font-medium text-[#1f5129] whitespace-nowrap">
                    Step {index + 1}:
                  </span>
                  <span>{cleanInstruction}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Source Link */}
      {recipe.sourceUrl && (
        <div className="mt-4">
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#1f5129] hover:underline"
          >
            View original recipe
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </>
  );
}
