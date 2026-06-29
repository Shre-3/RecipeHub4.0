import React, { useEffect, useState } from "react";

const DIET_OPTIONS = ["vegetarian", "vegan", "gluten-free", "dairy-free"];
const ALLERGY_OPTIONS = ["nuts", "shellfish", "soy"];
export const CUISINE_OPTIONS = [
  "italian",
  "indian",
  "mexican",
  "chinese",
  "japanese",
  "thai",
  "mediterranean",
  "american",
];

const MAX_CUISINES = 2;

const EMPTY_PREFERENCES = {
  diets: [],
  allergies: [],
  cuisines: [],
};

export function getActivePreferences(preferences) {
  const cuisines = preferences?.cuisines || [];
  const allCuisinesSelected =
    cuisines.length > 0 &&
    CUISINE_OPTIONS.every((cuisine) => cuisines.includes(cuisine));

  return {
    diets: preferences?.diets || [],
    allergies: preferences?.allergies || [],
    cuisines: allCuisinesSelected ? [] : cuisines,
  };
}

export function FilterPanel({ onChange, title = "Filters (optional)" }) {
  const [preferences, setPreferences] = useState(EMPTY_PREFERENCES);

  useEffect(() => {
    if (!onChange) return;
    onChange(getActivePreferences(preferences));
  }, [preferences, onChange]);

  const toggleValue = (field, value, max) => {
    setPreferences((prev) => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((item) => item !== value) };
      }
      if (max != null && current.length >= max) {
        return prev;
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const renderChips = (field, options, max) => (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = preferences[field].includes(option);
        const isDisabled =
          max != null && preferences[field].length >= max && !isSelected;

        return (
          <button
            key={option}
            type="button"
            disabled={isDisabled}
            onClick={() => toggleValue(field, option, max)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              isSelected
                ? "bg-[#1f5129] text-white border-[#1f5129]"
                : isDisabled
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-[#1f5129] border-[#1f5129]/30 hover:bg-[#1f5129]/10"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">{title}</p>

      <div>
        <h3 className="text-sm font-semibold text-[#1f5129] mb-2">Diet</h3>
        {renderChips("diets", DIET_OPTIONS)}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#1f5129] mb-2">Allergies</h3>
        {renderChips("allergies", ALLERGY_OPTIONS)}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[#1f5129] mb-1">Cuisine</h3>
        <p className="text-xs text-gray-500 mb-2">Pick up to {MAX_CUISINES}</p>
        {renderChips("cuisines", CUISINE_OPTIONS, MAX_CUISINES)}
      </div>
    </div>
  );
}
