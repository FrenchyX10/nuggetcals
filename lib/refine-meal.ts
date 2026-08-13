import type { MealAnalysis } from "@/lib/schema";
import {
  FOODS,
  displayRestaurant,
  findRestaurant,
  normalizeName,
  type FoodRecord,
} from "@/lib/nutrition-data";

export function refineMealWithPublishedNutrition(
  meal: MealAnalysis,
  restaurantInput: string,
  dishHint: string,
): MealAnalysis {
  if (!meal.isFood || meal.items.length === 0) {
    return {
      ...meal,
      restaurant: displayRestaurant(restaurantInput) ?? meal.restaurant,
    };
  }

  const chain = findRestaurant(restaurantInput);
  const refinedItems = meal.items.map((item) => {
    const match = matchRecord(
      `${item.name} ${item.brandOrRestaurantItem ?? ""} ${dishHint}`,
      chain,
    );
    if (!match) return item;
    const official = Boolean(chain && match.restaurant === chain);
    const grams = official
      ? match.grams
      : item.estimatedGrams > 20
        ? item.estimatedGrams
        : match.grams;
    const scale = official ? 1 : grams / Math.max(match.grams, 1);
    return {
      ...item,
      name: official ? match.name : item.name,
      brandOrRestaurantItem: match.restaurant ?? item.brandOrRestaurantItem,
      portionDescription: official
        ? `1 official ${match.restaurant} serving · ${match.grams}g`
        : `${Math.round(grams)}g · ${item.portionDescription}`,
      estimatedGrams: Math.round(grams),
      calories: round(match.calories * scale),
      proteinG: round1(match.proteinG * scale),
      carbsG: round1(match.carbsG * scale),
      fatG: round1(match.fatG * scale),
      fiberG: round1(match.fiberG * scale),
      sugarG: round1(match.sugarG * scale),
      sodiumMg: Math.round(match.sodiumMg * scale),
      dataSource: match.restaurant
        ? ("restaurant_official" as const)
        : match.source.startsWith("USDA")
          ? ("usda" as const)
          : ("nutrition_database" as const),
      notes: official
        ? `Official ${match.restaurant} 1-serving calories`
        : `Published ${match.source} scaled to ${Math.round(grams)}g. ${item.notes}`.trim(),
    };
  });

  const totals = refinedItems.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.proteinG += item.proteinG;
      acc.carbsG += item.carbsG;
      acc.fatG += item.fatG;
      acc.fiberG += item.fiberG;
      acc.sugarG += item.sugarG;
      acc.sodiumMg += item.sodiumMg;
      return acc;
    },
    {
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
      sugarG: 0,
      sodiumMg: 0,
    },
  );

  const usedPublished = refinedItems.some(
    (item) => item.dataSource !== "visual_estimate",
  );

  return {
    ...meal,
    restaurant: displayRestaurant(restaurantInput) ?? meal.restaurant,
    items: refinedItems,
    totalCalories: round(totals.calories),
    calorieRangeLow: round(totals.calories * 0.88),
    calorieRangeHigh: round(totals.calories * 1.14),
    proteinG: round1(totals.proteinG),
    carbsG: round1(totals.carbsG),
    fatG: round1(totals.fatG),
    fiberG: round1(totals.fiberG),
    sugarG: round1(totals.sugarG),
    sodiumMg: Math.round(totals.sodiumMg),
    method: chain && usedPublished ? "hybrid" : usedPublished ? "usda" : meal.method,
    assumptions: [
      "A free vision model looked at the photo and estimated each item's size.",
      chain && usedPublished
        ? "Chain items use official 1-serving menu calories, not a photo size guess."
        : usedPublished
          ? "Calories were scaled from published USDA-style numbers."
          : "Published nutrition was not a close match, so the model's own calorie estimate was kept.",
      ...meal.assumptions,
    ].slice(0, 6),
    precisionNotes:
      "The AI identified the food and estimated grams from the plate. Calories are published values scaled to that estimated size, not a random burger default.",
    sources: uniqueSources(meal.sources, refinedItems, chain),
  };
}

function matchRecord(query: string, chain: string | null) {
  const needle = normalizeName(query);
  if (!needle) return null;
  const pool = chain
    ? FOODS.filter((item) => item.restaurant === chain || !item.restaurant)
    : FOODS.filter((item) => !item.restaurant);

  const wantsChicken = /\b(chicken|nugget|tender|wing|rotisserie)\b/.test(needle);
  const wantsBurger = /\b(burger|hamburger|cheeseburger)\b/.test(needle);

  let best: { record: FoodRecord; score: number } | null = null;
  for (const record of pool) {
    const blob = normalizeName(`${record.restaurant ?? ""} ${record.name} ${record.aliases.join(" ")}`);
    const isChicken = /\b(chicken|nugget|tender|wing|rotisserie)\b/.test(blob);
    const isBurger = /\bburger\b/.test(blob) && !isChicken;
    if (wantsChicken && isBurger) continue;
    if (wantsBurger && isChicken) continue;

    let score = 0;
    if (normalizeName(record.name) === needle) score += 8;
    else if (blob.includes(needle) || needle.includes(normalizeName(record.name))) score += 4;
    const a = needle.split(" ").filter((token) => token.length > 2);
    const b = new Set(blob.split(" ").filter((token) => token.length > 2));
    const hits = a.filter((token) => b.has(token)).length;
    score += hits;
    if (a.length > 0 && hits === a.length) score += 2;
    if (chain && record.restaurant === chain) score += 1.5;
    if (!best || score > best.score) best = { record, score };
  }
  return best && best.score >= 3 ? best.record : null;
}

function uniqueSources(
  existing: MealAnalysis["sources"],
  items: MealAnalysis["items"],
  chain: string | null,
) {
  const extra = FOODS.filter((food) =>
    items.some((item) => item.name === food.name && food.restaurant === chain),
  ).map((food) => ({ title: food.source, url: food.sourceUrl }));
  const all = [...existing, ...extra];
  const seen = new Set<string>();
  return all.filter((source) => {
    if (seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}

function round(value: number) {
  return Math.round(value);
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}
