import type { MealAnalysis } from "@/lib/schema";
import {
  FOODS,
  displayRestaurant,
  findRestaurant,
  normalizeName,
  type FoodRecord,
} from "@/lib/nutrition-data";
import {
  inferMealSize,
  parsePortionSize,
  pickSizedRecord,
  recordNamedSize,
  SIZE_LABEL,
  SIZE_SCALE,
  sizeScaleFor,
  stripSizeWords,
  type PortionSize,
} from "@/lib/portion-size";
import { looksLikeSushi, parsePieceCount, resolveSushiPieceCount } from "@/lib/sushi";
import { parseFamilyCount, shouldMultiplyByCount } from "@/lib/food-families";

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
  const mealSize = parsePortionSize(meal.portionSize, inferMealSize(meal));
  const refinedItems = meal.items.map((item) => {
    const size = parsePortionSize(
      item.portionSize ?? `${item.name} ${item.portionDescription} ${dishHint}`,
      mealSize,
    );
    const match = matchRecord(
      `${stripSizeWords(item.name)} ${item.brandOrRestaurantItem ?? ""} ${dishHint}`,
      chain,
      size,
    );
    const pieces = looksLikeSushi(item.name, item.notes, item.portionDescription)
      ? resolveSushiPieceCount({
          name: item.name,
          notes: `${item.portionDescription} ${item.notes}`,
          reported:
            parsePieceCount(`${item.name} ${item.portionDescription} ${item.notes}`, 0) ||
            parseFamilyCount(`${item.name} ${item.portionDescription} ${item.notes}`, 0),
        })
      : parsePieceCount(`${item.name} ${item.portionDescription} ${item.notes}`, 0) ||
        parseFamilyCount(`${item.name} ${item.portionDescription} ${item.notes}`, 0);
    if (!match) {
      return {
        ...item,
        portionSize: size,
        portionDescription: `${SIZE_LABEL[size]} · ${item.portionDescription}`,
      };
    }
    const variant = pickSizedRecord(match, size, chain);
    const official = Boolean(chain && variant.restaurant === chain);
    const namedSize = recordNamedSize(variant);
    const countedUnit = shouldMultiplyByCount(
      item.name,
      variant.name,
      variant.calories,
      pieces,
    );
    let grams: number;
    let scale: number;
    if (countedUnit) {
      const count = pieces || 1;
      scale = count;
      grams = variant.grams * count;
    } else if (official && namedSize === size) {
      grams = variant.grams;
      scale = 1;
    } else if (official) {
      scale = sizeScaleFor(size, variant);
      grams = variant.grams * scale;
    } else if (item.estimatedGrams > 20) {
      grams = item.estimatedGrams;
      scale = grams / Math.max(variant.grams, 1);
    } else {
      scale = SIZE_SCALE[size];
      grams = variant.grams * scale;
    }
    return {
      ...item,
      name: official ? variant.name : item.name,
      brandOrRestaurantItem: variant.restaurant ?? item.brandOrRestaurantItem,
      portionSize: size,
      portionDescription: countedUnit
        ? `${pieces || 1} counted · ${variant.name} · ${Math.round(grams)}g`
        : official
          ? namedSize === size
            ? `Official ${variant.restaurant} ${SIZE_LABEL[size]} · ${Math.round(grams)}g`
            : `${SIZE_LABEL[size]} · official ${variant.restaurant} scaled · ${Math.round(grams)}g`
          : `${SIZE_LABEL[size]} · ${Math.round(grams)}g`,
      estimatedGrams: Math.round(grams),
      calories: round(variant.calories * scale),
      proteinG: round1(variant.proteinG * scale),
      carbsG: round1(variant.carbsG * scale),
      fatG: round1(variant.fatG * scale),
      fiberG: round1(variant.fiberG * scale),
      sugarG: round1(variant.sugarG * scale),
      sodiumMg: Math.round(variant.sodiumMg * scale),
      dataSource: variant.restaurant
        ? ("restaurant_official" as const)
        : variant.source.startsWith("USDA")
          ? ("usda" as const)
          : ("nutrition_database" as const),
      notes: countedUnit
        ? `Published ${variant.source}: ${variant.calories} kcal × ${pieces || 1}. ${item.notes}`.trim()
        : official
          ? namedSize === size
            ? `Official ${variant.restaurant} ${SIZE_LABEL[size]} calories`
            : `Official ${variant.restaurant} ${SIZE_LABEL[size]} (${Math.round(SIZE_SCALE[size] * 100)}% of regular)`
          : `Published ${variant.source} scaled to ${SIZE_LABEL[size]} (${Math.round(grams)}g). ${item.notes}`.trim(),
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
    portionSize: parsePortionSize(
      refinedItems[0]?.portionSize,
      mealSize,
    ),
    assumptions: [
      ...meal.assumptions.filter(
        (line) =>
          !line.startsWith("Step 1:") &&
          !line.startsWith("Step 2:") &&
          !line.startsWith("Step 3:"),
      ),
      "Step 1: AI identified the food on the plate.",
      meal.assumptions.find((line) => line.startsWith("Step 2: Used visible ingredients")) ??
        `Step 2: Used visible ingredients as a scale and judged ${SIZE_LABEL[mealSize]}${
          chain && usedPublished
            ? ", then looked up the official menu row for that size."
            : ", then looked up a typical serving (or a quarter ruler)."
        }`,
      usedPublished
        ? "Step 3: Estimated calories from published nutrition for that size."
        : "Step 3: Published nutrition was not a close match, so the size guess was kept.",
    ].slice(0, 6),
    precisionNotes:
      "Identify → size (small / medium / large) → calorie estimate. Official S/M/L menu rows are used when they exist.",
    sources: uniqueSources(meal.sources, refinedItems, chain),
  };
}

function matchRecord(query: string, chain: string | null, size: PortionSize) {
  const needle = stripSizeWords(query) || normalizeName(query);
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
    const wantsSushi = /\b(sushi|sashimi|nigiri|maki|roll)\b/.test(needle);
    const isGenericSushi =
      wantsSushi && !/\b(nigiri|sashimi|california|spicy tuna|salmon|tuna|eel|shrimp|rainbow|dragon|philadelphia|avocado|cucumber)\b/.test(needle);
    if (isGenericSushi && /\b(california|spicy tuna|philadelphia|rainbow|dragon)\b/.test(blob)) {
      continue;
    }

    let score = 0;
    const recordBase = stripSizeWords(record.name);
    if (recordBase === needle || normalizeName(record.name) === needle) score += 8;
    else if (blob.includes(needle) || needle.includes(recordBase)) score += 4;
    const a = needle.split(" ").filter((token) => token.length > 2);
    const b = new Set(blob.split(" ").filter((token) => token.length > 2));
    const hits = a.filter((token) => b.has(token)).length;
    score += hits;
    if (a.length > 0 && hits === a.length) score += 2;
    if (chain && record.restaurant === chain) score += 1.5;
    const named = recordNamedSize(record);
    if (named === size) score += 2.5;
    else if (named && named !== size) score -= 1.2;
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
