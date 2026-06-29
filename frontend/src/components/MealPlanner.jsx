import React, { useCallback, useEffect, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import {
  generateMealPlan,
  getLatestMealPlan,
  getRecipeById,
} from "../api/recipeApi";
import { FilterPanel, getActivePreferences } from "./PreferencesPanel";
import { RecipeDetail } from "./RecipeDetail";
import { ErrorMessage } from "./ErrorMessage";
import { PageLayout } from "./layout/PageLayout";
import { formatCookTime } from "../utils/text";

export function MealPlanner() {
  const [preferences, setPreferences] = useState({});
  const [mealPlan, setMealPlan] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [warning, setWarning] = useState(null);
  const [numDays, setNumDays] = useState(7);

  const handlePreferencesChange = useCallback((prefs) => {
    setPreferences(prefs);
  }, []);

  useEffect(() => {
    const loadExisting = async () => {
      try {
        const existing = await getLatestMealPlan();
        if (existing) setMealPlan(existing);
      } catch (err) {
        console.error(err);
      }
    };

    loadExisting();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setDetailError(null);
    setWarning(null);

    try {
      const { mealPlan, warning: planWarning } = await generateMealPlan(
        numDays,
        getActivePreferences(preferences)
      );
      setMealPlan(mealPlan);
      setWarning(planWarning);
      setSelectedRecipe(null);
    } catch (err) {
      setError(err.message);
      setMealPlan(null);
      setSelectedRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDay = async (day) => {
    setDetailLoading(true);
    setDetailError(null);

    try {
      const recipe = await getRecipeById(day.forkifyId);
      setSelectedRecipe(recipe);
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <PageLayout className="bg-gradient-to-br from-[#1f5129]/10 to-[#f0e4cc]/30">
      <h1 className="text-2xl font-bold text-[#1f5129] flex items-center justify-center gap-3 text-center">
          <CalendarDays className="w-8 h-8" />
          Weekly Meal Planner
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          <div className="lg:col-span-5 bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg space-y-4">
            <FilterPanel
              onChange={handlePreferencesChange}
              title="Meal plan filters (optional — tighter filters = fewer results)"
            />

            <div>
              <label className="block text-sm font-medium text-[#1f5129] mb-1">
                Number of days
              </label>
              <input
                type="number"
                min="3"
                max="7"
                value={numDays}
                onChange={(e) => setNumDays(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-[#1f5129]/30"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2 bg-[#1f5129] text-white rounded-md hover:bg-[#1f5129]/90 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating plan...
                </span>
              ) : (
                "Generate Meal Plan"
              )}
            </button>

            {warning && (
              <p className="text-amber-700 text-sm bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                {warning}
              </p>
            )}

            {error && !mealPlan && (
              <div className="flex justify-center pt-2">
                <ErrorMessage message={error} />
              </div>
            )}

            {mealPlan?.days?.length > 0 && (
              <div className="space-y-3">
                {mealPlan.days.map((day) => (
                  <button
                    key={`${day.day}-${day.forkifyId}`}
                    onClick={() => handleSelectDay(day)}
                    className="w-full text-left p-3 rounded-lg border border-[#1f5129]/20 hover:bg-[#1f5129]/5 transition-colors"
                  >
                    <p className="text-xs uppercase tracking-wide text-[#1f5129]/70">
                      Day {day.day}
                    </p>
                    <p className="font-semibold text-[#1f5129]">
                      {day.title}
                    </p>
                    {day.cooking_time && (
                      <p className="text-sm text-gray-600">
                        {formatCookTime(day.cooking_time)}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-7 bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg">
            <RecipeDetail
              recipe={selectedRecipe}
              loading={detailLoading}
              error={detailError}
            />
          </div>
        </div>
    </PageLayout>
  );
}
