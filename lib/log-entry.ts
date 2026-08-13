import type { HistoryEntry } from "@/lib/history";
import type { FoodItem, MealAnalysis } from "@/lib/schema";

export function mealFromTotals(options: {
  mealName: string;
  restaurant?: string | null;
  calories: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
  items?: FoodItem[];
  assumptions?: string[];
  precisionNotes?: string;
  sources?: MealAnalysis["sources"];
  method?: MealAnalysis["method"];
}): MealAnalysis {
  const calories = Math.max(0, Math.round(options.calories));
  return {
    mealName: options.mealName.trim() || "Logged item",
    restaurant: options.restaurant ?? null,
    matchedMenuItem: options.mealName,
    isFood: true,
    notFoodReason: null,
    totalCalories: calories,
    calorieRangeLow: Math.round(calories * 0.95),
    calorieRangeHigh: Math.round(calories * 1.05),
    proteinG: round1(options.proteinG ?? 0),
    carbsG: round1(options.carbsG ?? 0),
    fatG: round1(options.fatG ?? 0),
    fiberG: round1(options.fiberG ?? 0),
    sugarG: round1(options.sugarG ?? 0),
    sodiumMg: Math.round(options.sodiumMg ?? 0),
    overallConfidence: 0.88,
    method: options.method ?? "usda",
    portionSize: "medium",
    items:
      options.items && options.items.length > 0
        ? options.items
        : [
            {
              name: options.mealName.trim() || "Logged item",
              brandOrRestaurantItem: options.restaurant ?? null,
              portionDescription: "logged serving",
              portionSize: "medium",
              estimatedGrams: 0,
              calories,
              proteinG: round1(options.proteinG ?? 0),
              carbsG: round1(options.carbsG ?? 0),
              fatG: round1(options.fatG ?? 0),
              fiberG: round1(options.fiberG ?? 0),
              sugarG: round1(options.sugarG ?? 0),
              sodiumMg: Math.round(options.sodiumMg ?? 0),
              confidence: 0.88,
              dataSource: "nutrition_database",
              notes: options.precisionNotes ?? "",
            },
          ],
    assumptions: options.assumptions ?? ["Logged manually."],
    precisionNotes: options.precisionNotes ?? "",
    sources: options.sources ?? [],
  };
}

export function historyFromMeal(
  meal: MealAnalysis,
  thumbnail: string,
  restaurant = meal.restaurant,
): HistoryEntry {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    thumbnail,
    mealName: meal.mealName,
    restaurant,
    totalCalories: meal.totalCalories,
    proteinG: meal.proteinG,
    carbsG: meal.carbsG,
    fatG: meal.fatG,
    overallConfidence: meal.overallConfidence,
    servings: 1,
    result: meal,
  };
}

export function svgThumb(fill: string, mark: string) {
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" rx="16" fill="#2a2018"/><circle cx="40" cy="40" r="18" fill="${fill}"/><text x="40" y="46" text-anchor="middle" font-size="16" fill="#1a1208" font-family="sans-serif">${mark}</text></svg>`,
    )
  );
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}
