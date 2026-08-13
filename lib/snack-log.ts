import type { HistoryEntry } from "@/lib/history";
import type { MealAnalysis } from "@/lib/schema";
import type { SnackRecord } from "@/lib/snacks-data";

const SNACK_THUMB =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="16" fill="#2a2018"/><ellipse cx="40" cy="42" rx="22" ry="14" fill="#f0b45a"/><ellipse cx="40" cy="40" rx="18" ry="11" fill="#e08a2e"/><circle cx="34" cy="38" r="2" fill="#2a2018" opacity=".35"/><circle cx="46" cy="43" r="1.6" fill="#2a2018" opacity=".35"/></svg>`,
  );

export function mealFromSnack(snack: SnackRecord, servings = 1): MealAnalysis {
  const scale = Math.max(0.25, servings);
  const calories = Math.round(snack.calories * scale);
  return {
    mealName: snack.name,
    restaurant: snack.restaurant,
    matchedMenuItem: snack.name,
    isFood: true,
    notFoodReason: null,
    totalCalories: calories,
    calorieRangeLow: Math.round(calories * 0.95),
    calorieRangeHigh: Math.round(calories * 1.05),
    proteinG: round1(snack.proteinG * scale),
    carbsG: round1(snack.carbsG * scale),
    fatG: round1(snack.fatG * scale),
    fiberG: round1(snack.fiberG * scale),
    sugarG: round1(snack.sugarG * scale),
    sodiumMg: Math.round(snack.sodiumMg * scale),
    overallConfidence: 0.9,
    method: snack.source.toLowerCase().includes("usda") ? "usda" : "hybrid",
    portionSize: servings >= 3 ? "large" : servings <= 1 ? "small" : "medium",
    items: [
      {
        name: snack.name,
        brandOrRestaurantItem: snack.restaurant,
        portionDescription: `${scale === 1 ? "1 serving" : `${scale} servings`} · ${Math.round(snack.grams * scale)}g`,
        portionSize: servings >= 3 ? "large" : servings <= 1 ? "small" : "medium",
        estimatedGrams: Math.round(snack.grams * scale),
        calories,
        proteinG: round1(snack.proteinG * scale),
        carbsG: round1(snack.carbsG * scale),
        fatG: round1(snack.fatG * scale),
        fiberG: round1(snack.fiberG * scale),
        sugarG: round1(snack.sugarG * scale),
        sodiumMg: Math.round(snack.sodiumMg * scale),
        confidence: 0.9,
        dataSource: snack.source.toLowerCase().includes("usda")
          ? "usda"
          : "nutrition_database",
        notes: `Published ${snack.source} for a labeled serving.`,
      },
    ],
    assumptions: [
      "Logged from the Chips & Snacks list.",
      `Used published nutrition (${snack.source}).`,
      scale === 1
        ? `1 labeled serving is ${snack.grams}g.`
        : `${scale} labeled servings were added.`,
    ],
    precisionNotes: "Calories come from the branded label or USDA FoodData Central, not a photo guess.",
    sources: [{ title: snack.source, url: snack.sourceUrl }],
  };
}

export function historyFromSnack(
  snack: SnackRecord,
  servings = 1,
  thumbnail = SNACK_THUMB,
): HistoryEntry {
  const meal = mealFromSnack(snack, servings);
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    thumbnail,
    mealName: meal.mealName,
    restaurant: meal.restaurant ?? "Snack",
    totalCalories: meal.totalCalories,
    proteinG: meal.proteinG,
    carbsG: meal.carbsG,
    fatG: meal.fatG,
    overallConfidence: meal.overallConfidence,
    servings: 1,
    result: meal,
  };
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}
