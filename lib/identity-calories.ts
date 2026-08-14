import type { FoodItem } from "@/lib/schema";
import { FOODS, normalizeName } from "@/lib/nutrition-data";
import { FAMILY_VARIANTS } from "@/lib/food-families";

const PROTEIN = [
  "chicken",
  "steak",
  "beef",
  "pork",
  "bacon",
  "shrimp",
  "salmon",
  "tuna",
  "lamb",
  "tofu",
  "fish",
  "turkey",
];

const HEAVY = [
  "bowl",
  "burrito",
  "burger",
  "pizza",
  "pasta",
  "fried",
  "cobb",
  "caesar",
  "taco",
  "quesadilla",
  "nacho",
];

export type CalorieBand = { low: number; high: number };

export function identityTokens(text: string) {
  return normalizeName(text)
    .split(" ")
    .filter((token) => token.length > 2 && !STOP.has(token));
}

export function expectedCalorieRange(
  name: string,
  notes = "",
  anchorCalories?: number,
): CalorieBand {
  const blob = `${name} ${notes}`.toLowerCase();
  const rule = RULES.find((row) => row.test.test(blob));
  if (rule && anchorCalories) {
    return {
      low: Math.min(rule.low, Math.round(anchorCalories * 0.55)),
      high: Math.max(rule.high, Math.round(anchorCalories * 1.7)),
    };
  }
  if (rule) return { low: rule.low, high: rule.high };
  if (anchorCalories) {
    return {
      low: Math.max(40, Math.round(anchorCalories * 0.55)),
      high: Math.round(anchorCalories * 1.7),
    };
  }
  return { low: 40, high: 1400 };
}

export function hitFitsIdentity(
  hitName: string,
  itemName: string,
  notes = "",
): boolean {
  const item = identityTokens(`${itemName} ${notes}`);
  const hit = identityTokens(hitName);
  if (item.length === 0) return true;
  const overlap = item.filter((token) => hit.includes(token)).length;
  if (
    overlap === 0 ||
    (item.length >= 2 &&
      overlap < 2 &&
      !normalizeName(hitName).includes(normalizeName(itemName)))
  ) {
    return false;
  }
  for (const token of PROTEIN) {
    if (hit.includes(token) && !item.includes(token)) return false;
  }
  for (const token of HEAVY) {
    if (hit.includes(token) && !item.includes(token)) return false;
  }
  return true;
}

export function inCalorieBand(calories: number, band: CalorieBand) {
  return calories >= band.low && calories <= band.high;
}

export function identityAnchor(item: Pick<FoodItem, "name" | "notes" | "calories">) {
  const needle = normalizeName(item.name);
  const fromFoods = FOODS.filter((food) => !food.restaurant).find((food) => {
    const name = normalizeName(food.name);
    const aliases = food.aliases.map(normalizeName);
    return name === needle || aliases.includes(needle);
  });
  const fromFamily = FAMILY_VARIANTS.find((row) => {
    const name = normalizeName(row.name);
    return (
      name === needle ||
      row.aliases.some((alias) => normalizeName(alias) === needle) ||
      name.includes(needle) && needle.split(" ").length >= 2
    );
  });
  const exact = fromFoods ?? (fromFamily
    ? {
        name: fromFamily.name,
        calories: fromFamily.calories,
        proteinG: fromFamily.proteinG,
        carbsG: fromFamily.carbsG,
        fatG: fromFamily.fatG,
        fiberG: fromFamily.fiberG,
        sugarG: fromFamily.sugarG,
        sodiumMg: fromFamily.sodiumMg,
        grams: fromFamily.grams,
        source: "Identified-dish table",
        sourceUrl: "https://fdc.nal.usda.gov/",
      }
    : null);
  if (exact) return exact;
  if (item.calories > 0 && item.calories < 1800) {
    return {
      name: item.name,
      calories: item.calories,
      source: "Identified estimate",
      sourceUrl: "https://fdc.nal.usda.gov/",
    };
  }
  return null;
}

export function researchQuery(
  name: string,
  size: string,
  extras = "",
) {
  const blob = `${name} ${extras}`.toLowerCase();
  const bans: string[] = [];
  if (/\bsalad\b/.test(blob) && !PROTEIN.some((token) => blob.includes(token))) {
    bans.push("no chicken", "not cobb", "not burrito bowl", "not Caesar unless named");
  }
  if (/\bgarden|side salad|house salad|green salad\b/.test(blob)) {
    bans.push("side salad greens + dressing only");
  }
  return [
    `typical calories for one ${size} ${name} serving`,
    "USDA OR FatSecret",
    bans.join(", "),
  ]
    .filter(Boolean)
    .join(" — ");
}

const STOP = new Set([
  "with",
  "and",
  "the",
  "for",
  "from",
  "style",
  "piece",
  "pieces",
  "slice",
  "serving",
]);

const RULES: Array<{ test: RegExp; low: number; high: number }> = [
  { test: /\b(garden|side|house|green)\s+salad\b/, low: 70, high: 260 },
  { test: /\bcaesar salad\b(?!.*chicken)/, low: 160, high: 400 },
  { test: /\bchicken caesar\b/, low: 320, high: 650 },
  { test: /\bcobb\b/, low: 380, high: 750 },
  { test: /\bgreek salad\b/, low: 180, high: 420 },
  { test: /\bchef salad\b/, low: 280, high: 560 },
  { test: /\bsalad\b/, low: 80, high: 450 },
  { test: /\b(garden|side)\b/, low: 70, high: 300 },
  { test: /\bapple\b/, low: 50, high: 140 },
  { test: /\bbanana\b/, low: 70, high: 150 },
  { test: /\bblack coffee|coffee, black\b/, low: 0, high: 15 },
  { test: /\bnaan\b/, low: 180, high: 380 },
  { test: /\bsamosa\b/, low: 150, high: 320 },
  { test: /\bgyro\b/, low: 450, high: 850 },
  { test: /\bhamburger\b/, low: 250, high: 650 },
  { test: /\bcheeseburger\b/, low: 300, high: 800 },
  { test: /\bacai|açaí\b/, low: 280, high: 650 },
  { test: /\bsmoothie bowl\b/, low: 250, high: 550 },
  { test: /\bpancake|waffle|french toast|hotcake\b/, low: 250, high: 900 },
  { test: /\bburrito\b/, low: 450, high: 1250 },
];
