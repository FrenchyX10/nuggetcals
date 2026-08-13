import type { FoodItem, MealAnalysis } from "@/lib/schema";
import {
  FOODS,
  displayRestaurant,
  findRestaurant,
  menuFor,
  normalizeName,
  type FoodRecord,
} from "@/lib/nutrition-data";
import {
  parsePortionSize,
  pickSizedRecord,
  recordNamedSize,
  SIZE_LABEL,
  SIZE_SCALE,
  sizeScaleFor,
  type PortionSize,
} from "@/lib/portion-size";

export type FoodLabel = {
  label: string;
  score: number;
};

const NOT_FOOD = new Set(["not food", "empty plate", "packaging only"]);

const SIDES = [
  ["fries", "french fries", "waffle fries", "cajun fries"],
  ["chips", "chips and guacamole", "chips and queso"],
  ["breadstick", "salad and breadsticks"],
  ["drink", "soda", "coke", "lemonade", "latte"],
];

export function analyzeFree(
  labels: FoodLabel[],
  restaurantInput: string,
  dishHint = "",
  options: { caption?: string; portionGrams?: number; quarterFound?: boolean } = {},
): MealAnalysis {
  if (options.caption) {
    labels = [{ label: options.caption, score: 0.94 }, ...labels];
    dishHint = [dishHint, options.caption].filter(Boolean).join(" ");
  }
  const matchedChain = findRestaurant(restaurantInput);
  const restaurant = displayRestaurant(restaurantInput);
  const ranked = rankFoods(labels, matchedChain, dishHint);
  const notFoodScore = labels
    .filter((item) => NOT_FOOD.has(normalizeName(item.label)))
    .reduce((max, item) => Math.max(max, item.score), 0);

  if (
    (ranked[0]?.score ?? 0) < 0.12 &&
    notFoodScore > 0.28 &&
    !restaurant
  ) {
    return emptyMeal("This photo does not look like a meal.");
  }

  const picked = pickMeal(ranked, matchedChain, labels);
  if (picked.length === 0 && matchedChain) {
    const signature = FOODS.filter((item) => item.restaurant === matchedChain).slice(
      0,
      1,
    );
    if (signature[0]) picked.push({ record: signature[0], score: 0.25 });
  }

  if (picked.length === 0) {
    return emptyMeal(
      "Could not tell what food this is. Try a closer photo, or type the restaurant.",
    );
  }

  const size = parsePortionSize(
    `${options.caption ?? ""} ${dishHint} ${labels.map((item) => item.label).join(" ")}`,
  );
  const items = picked.map(({ record, score }, index) =>
    toItem(
      pickSizedRecord(record, size, matchedChain),
      score,
      matchedChain,
      index === 0 ? options.portionGrams : undefined,
      options.quarterFound,
      size,
    ),
  );
  const totals = sumItems(items);
  const bestScore = picked[0]?.score ?? 0.3;
  const method = matchedChain
    ? items.some((item) => item.dataSource === "restaurant_official")
      ? "restaurant_menu"
      : "hybrid"
    : items.some((item) => item.dataSource === "usda")
      ? "usda"
      : "visual_estimate";

  const assumptions = [
    restaurant
      ? matchedChain
        ? `Used the name you typed (${restaurant}) and matched published ${matchedChain} menu items.`
        : `Kept the restaurant you typed (${restaurant}). It is not in the built-in chain list, so generic published portions were used.`
      : "No restaurant was given, so generic published portions were used.",
    `Identified size: ${SIZE_LABEL[size]}.`,
    options.caption
      ? `AI identified the plate as: “${options.caption}”.`
      : "AI identified the food, then serving size was looked up from published numbers.",
    matchedChain
      ? `Used the official ${matchedChain} ${SIZE_LABEL[size]} size when a menu row exists.`
      : options.quarterFound
        ? `Found a US quarter in the photo and used it as a ruler (~${options.portionGrams}g).`
        : options.portionGrams
          ? `Homemade portion was estimated from the photo (~${options.portionGrams}g).`
          : "A typical published serving was used for size.",
    "Use the portion slider if you did not eat the whole plate.",
  ];

  if (bestScore < 0.35) {
    assumptions.push(
      "The photo match was uncertain. Confirm the dish name if the calories look off.",
    );
  }

  return {
    mealName: mealTitle(picked, restaurant),
    restaurant,
    matchedMenuItem: picked[0].record.name,
    isFood: true,
    notFoodReason: null,
    totalCalories: totals.calories,
    calorieRangeLow: Math.round(totals.calories * (bestScore > 0.45 ? 0.9 : 0.75)),
    calorieRangeHigh: Math.round(totals.calories * (bestScore > 0.45 ? 1.12 : 1.28)),
    proteinG: round1(totals.proteinG),
    carbsG: round1(totals.carbsG),
    fatG: round1(totals.fatG),
    fiberG: round1(totals.fiberG),
    sugarG: round1(totals.sugarG),
    sodiumMg: Math.round(totals.sodiumMg),
    overallConfidence: clamp(bestScore, 0.28, 0.9),
    method,
    portionSize: size,
    items,
    assumptions,
    precisionNotes: matchedChain
      ? `Calories are the official ${matchedChain} serving, not a photo size-guess. Tap the exact menu item below if this is the wrong sandwich.`
      : "Calories are a published homemade serving, only slightly adjusted for how full the plate looks.",
    sources: uniqueSources(picked.map((item) => item.record)),
  };
}

function rankFoods(
  labels: FoodLabel[],
  restaurant: string | null,
  dishHint: string,
) {
  return FOODS.map((record) => ({
    record,
    score: scoreRecord(record, labels, restaurant, dishHint),
  }))
    .filter((item) => item.score > 0.08)
    .sort((a, b) => b.score - a.score);
}

function scoreRecord(
  record: FoodRecord,
  labels: FoodLabel[],
  restaurant: string | null,
  dishHint: string,
) {
  const names = [
    record.name,
    ...record.aliases,
    record.restaurant ? `${record.restaurant} ${record.name}` : "",
  ]
    .filter(Boolean)
    .map(normalizeName);

  let best = 0;
  for (const label of labels) {
    const needle = normalizeName(label.label);
    if (!needle || NOT_FOOD.has(needle)) continue;
    for (const name of names) {
      const overlap = tokenOverlap(needle, name);
      const contained =
        needle.includes(name) || name.includes(needle) ? 0.35 : 0;
      best = Math.max(best, label.score * 0.85 + overlap + contained);
    }
  }

  if (restaurant) {
    if (record.restaurant === restaurant) best += 0.16;
    else if (record.restaurant) best *= 0.12;
  } else if (record.restaurant) {
    best *= 0.55;
  }

  best += hintAdjustment(record, dishHint, labels);
  best += sizeBias(record, labels, dishHint);
  return best;
}

function sizeBias(
  record: FoodRecord,
  labels: FoodLabel[],
  dishHint: string,
) {
  const text = normalizeName(`${labels[0]?.label ?? ""} ${dishHint}`);
  const name = normalizeName(record.name);
  const genericBurger = /\b(hamburger|cheeseburger|burger)\b/.test(text);
  const saysWhopper = text.includes("whopper");
  const saysDouble = text.includes("double") || text.includes("baconator");
  const saysJr = text.includes("jr") || text.includes("junior") || text.includes("small");

  if (genericBurger && !saysWhopper && !saysDouble && !saysJr) {
    if (
      name.includes("whopper") ||
      name.includes("baconator") ||
      name.includes("double") ||
      name.includes("big mac") ||
      name.includes("quarter pounder") ||
      name.includes("dave")
    ) {
      return -0.45;
    }
    if (name === "hamburger" || name === "cheeseburger") return 0.25;
  }
  if (saysJr && name.includes("whopper") && !name.includes("jr")) return -0.4;
  return 0;
}

function hintAdjustment(
  record: FoodRecord,
  dishHint: string,
  labels: FoodLabel[],
) {
  const hint = normalizeName(dishHint);
  const blob = normalizeName(`${record.name} ${record.aliases.join(" ")}`);
  const topLabel = normalizeName(labels[0]?.label ?? "");
  const combined = `${hint} ${topLabel}`;
  const wantsChicken =
    /\b(chicken|nugget|tender|wing|rotisserie|canes|zaxby)\b/.test(combined) &&
    !/\b(pancake|waffle|french toast)\b/.test(combined);
  const wantsPancake = /\b(pancake|waffle|french toast|hotcake|flapjack|blueberry)\b/.test(
    combined,
  );
  const wantsBurger = /\b(burger|hamburger|cheeseburger|whopper|baconator)\b/.test(hint);
  const isChicken = /\b(chicken|nugget|tender|wing|rotisserie)\b/.test(blob);
  const isBurger = /\bburger\b/.test(blob) && !isChicken;
  const isPancake = /\b(pancake|waffle|french toast|hotcake|flapjack)\b/.test(blob);

  let extra = 0;
  if (hint) {
    if (blob.includes(hint) || hint.includes(normalizeName(record.name))) extra += 0.55;
    else extra += tokenOverlap(hint, blob);
  }
  if (wantsChicken && isChicken) extra += 0.5;
  if (wantsChicken && isBurger) extra -= 0.7;
  if (wantsBurger && isBurger) extra += 0.4;
  if (wantsBurger && isChicken) extra -= 0.2;
  if (wantsPancake && isPancake) extra += 0.7;
  if (wantsPancake && isChicken) extra -= 0.9;
  if (wantsPancake && isBurger) extra -= 0.6;
  return extra;
}

export function suggestAlternatives(
  restaurantInput: string,
  dishHint: string,
  currentName: string,
) {
  const restaurant = findRestaurant(restaurantInput);
  const pool = restaurant ? menuFor(restaurant) : FOODS.filter((item) => !item.restaurant);
  const hint = normalizeName(dishHint || currentName);
  return pool
    .filter((item) => item.name !== currentName)
    .map((item) => ({
      item,
      score: hintAdjustment(item, hint, [{ label: hint, score: 1 }]),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((row) => row.item);
}

export function mealFromRecord(
  record: FoodRecord,
  restaurantInput: string,
): MealAnalysis {
  return analyzeFree(
    [{ label: record.name, score: 0.96 }],
    restaurantInput,
    record.name,
  );
}

function tokenOverlap(a: string, b: string) {
  const aTokens = new Set(a.split(" ").filter((token) => token.length > 2));
  const bTokens = b.split(" ").filter((token) => token.length > 2);
  if (aTokens.size === 0 || bTokens.length === 0) return 0;
  const hits = bTokens.filter((token) => aTokens.has(token)).length;
  return (hits / Math.max(bTokens.length, 1)) * 0.4;
}

function pickMeal(
  ranked: { record: FoodRecord; score: number }[],
  restaurant: string | null,
  labels: FoodLabel[],
) {
  const labelText = labels.map((item) => normalizeName(item.label)).join(" ");
  const mentionedSide = SIDES.some((group) =>
    group.some((word) => labelText.includes(word)),
  );
  const picked: { record: FoodRecord; score: number }[] = [];
  for (const candidate of ranked) {
    if (picked.length === 0) {
      picked.push(candidate);
      continue;
    }
    if (restaurant && !mentionedSide) break;
    if (picked.length >= 2) break;
    if (candidate.score < picked[0].score * 0.72) break;
    if (sameDish(picked[0].record, candidate.record)) continue;
    if (restaurant && candidate.record.restaurant !== restaurant) continue;
    if (mentionedSide && isLikelySide(candidate.record)) {
      picked.push(candidate);
    }
  }
  return picked;
}

function sameDish(a: FoodRecord, b: FoodRecord) {
  return (
    normalizeName(a.name) === normalizeName(b.name) ||
    a.aliases.some((alias) => normalizeName(b.name).includes(normalizeName(alias)))
  );
}

function isLikelySide(record: FoodRecord) {
  const name = normalizeName(`${record.name} ${record.aliases.join(" ")}`);
  return SIDES.some((group) => group.some((word) => name.includes(word)));
}

function isLikelyCombo(main: FoodRecord, extra: FoodRecord) {
  const a = normalizeName(main.name);
  const b = normalizeName(extra.name);
  const burger = a.includes("burger") || a.includes("sandwich") || a.includes("nugget") || a.includes("taco");
  const fries = b.includes("fries") || b.includes("chips");
  const pasta = a.includes("pasta") || a.includes("alfredo") || a.includes("lasagna");
  const bread = b.includes("bread") || b.includes("salad");
  return (burger && fries) || (pasta && bread);
}

function toItem(
  record: FoodRecord,
  score: number,
  restaurant: string | null,
  portionGrams?: number,
  quarterFound?: boolean,
  size: PortionSize = "medium",
): FoodItem {
  const official = Boolean(restaurant && record.restaurant === restaurant);
  const namedSize = recordNamedSize(record);
  let grams = record.grams;
  let scale = 1;
  if (official && namedSize === size) {
    grams = record.grams;
    scale = 1;
  } else if (official) {
    scale = sizeScaleFor(size, record);
    grams = Math.round(record.grams * scale);
  } else if (portionGrams && portionGrams > 40) {
    if (quarterFound) {
      grams = Math.round(portionGrams);
    } else {
      const rawScale = portionGrams / Math.max(record.grams, 1);
      scale = clamp(rawScale, 0.7, 1.4);
      grams = Math.round(record.grams * scale);
    }
    scale = grams / Math.max(record.grams, 1);
  } else {
    scale = SIZE_SCALE[size];
    grams = Math.round(record.grams * scale);
  }
  return {
    name: record.name,
    brandOrRestaurantItem: record.restaurant,
    portionDescription: official
      ? `Official ${record.restaurant} ${SIZE_LABEL[size]} · ${grams}g`
      : `${SIZE_LABEL[size]} · ${grams}g estimated from the photo`,
    portionSize: size,
    estimatedGrams: grams,
    calories: Math.round(record.calories * scale),
    proteinG: round1(record.proteinG * scale),
    carbsG: round1(record.carbsG * scale),
    fatG: round1(record.fatG * scale),
    fiberG: round1(record.fiberG * scale),
    sugarG: round1(record.sugarG * scale),
    sodiumMg: Math.round(record.sodiumMg * scale),
    confidence: clamp(score, 0.25, 0.92),
    dataSource: record.restaurant
      ? "restaurant_official"
      : record.source.startsWith("USDA")
        ? "usda"
        : "nutrition_database",
    notes: official
      ? namedSize === size
        ? `Official ${restaurant} ${SIZE_LABEL[size]} calories`
        : `Official ${restaurant} scaled to ${SIZE_LABEL[size]}`
      : `${record.source}, ${SIZE_LABEL[size]} portion`,
  };
}

function mealTitle(
  picked: { record: FoodRecord }[],
  restaurant: string | null,
) {
  const names = picked.map((item) => item.record.name);
  const joined = names.join(" + ");
  return restaurant ? `${restaurant} ${joined}` : joined;
}

function sumItems(items: FoodItem[]) {
  return items.reduce(
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
}

function uniqueSources(records: FoodRecord[]) {
  const seen = new Set<string>();
  return records
    .map((record) => ({ title: record.source, url: record.sourceUrl }))
    .filter((source) => {
      if (seen.has(source.url)) return false;
      seen.add(source.url);
      return true;
    });
}

function emptyMeal(reason: string): MealAnalysis {
  return {
    mealName: "Not a meal",
    restaurant: null,
    matchedMenuItem: null,
    isFood: false,
    notFoodReason: reason,
    totalCalories: 0,
    calorieRangeLow: 0,
    calorieRangeHigh: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    fiberG: 0,
    sugarG: 0,
    sodiumMg: 0,
    overallConfidence: 0.15,
    method: "visual_estimate",
    portionSize: "medium",
    items: [],
    assumptions: [],
    precisionNotes: reason,
    sources: [],
  };
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
