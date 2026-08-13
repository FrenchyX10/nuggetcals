import { FOODS, normalizeName, type FoodRecord } from "@/lib/nutrition-data";
import type { MealAnalysis } from "@/lib/schema";

export type PortionSize = "small" | "medium" | "large";

export const PORTION_SIZES: PortionSize[] = ["small", "medium", "large"];

export const SIZE_SCALE: Record<PortionSize, number> = {
  small: 0.7,
  medium: 1,
  large: 1.4,
};

export const SIZE_LABEL: Record<PortionSize, string> = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

const SIZE_WORDS =
  /\b(small|sm|medium|med|regular|large|lg|xl|extra large|value|junior|jr|kids|little|tall|short|grande|venti)\b/g;

export function parsePortionSize(
  value: unknown,
  fallback: PortionSize = "medium",
): PortionSize {
  const raw = normalizeName(String(value ?? ""));
  if (!raw) return fallback;
  if (
    /\b(small|sm|value|junior|jr|kids|little|tall|short|4 piece|4 count|6 inch)\b/.test(
      raw,
    ) ||
    raw === "s"
  ) {
    return "small";
  }
  if (
    /\b(large|lg|xl|extra large|venti|footlong|12 piece|12 count|10 piece)\b/.test(
      raw,
    ) ||
    raw === "l"
  ) {
    return "large";
  }
  if (/\b(medium|med|regular|grande)\b/.test(raw) || raw === "m") {
    return "medium";
  }
  return fallback;
}

export function recordNamedSize(record: FoodRecord): PortionSize | null {
  const name = normalizeName(record.name);
  if (
    /\b(small|value|junior|jr|kids|little|tall|4 piece|4 count|6 inch)\b/.test(
      name,
    )
  ) {
    return "small";
  }
  if (
    /\b(large|xl|venti|footlong|12 piece|12 count|10 piece)\b/.test(name)
  ) {
    return "large";
  }
  if (/\b(medium|regular|grande|6 piece|6 count|8 count|8 piece)\b/.test(name)) {
    return "medium";
  }
  return null;
}

export function stripSizeWords(name: string) {
  return normalizeName(name)
    .replace(SIZE_WORDS, " ")
    .replace(/\b\d+\s*(piece|count|pc|pc s)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function pickSizedRecord(
  match: FoodRecord,
  size: PortionSize,
  chain: string | null,
): FoodRecord {
  const current = recordNamedSize(match);
  if (current === size) return match;

  const family = stripSizeWords(match.name);
  if (!family) return match;

  const pool = FOODS.filter((food) => {
    if (chain && food.restaurant !== chain) return false;
    if (!chain && food.restaurant !== match.restaurant) return false;
    const other = stripSizeWords(food.name);
    return other === family || other.includes(family) || family.includes(other);
  });

  const exact = pool.find((food) => recordNamedSize(food) === size);
  return exact ?? match;
}

export function sizeScaleFor(
  size: PortionSize,
  variant: FoodRecord,
): number {
  const named = recordNamedSize(variant);
  if (named === size) return 1;
  if (named) return SIZE_SCALE[size] / SIZE_SCALE[named];
  return SIZE_SCALE[size];
}

export function inferMealSize(meal: {
  mealName?: string;
  items: Array<{ name?: string; portionSize?: string; portionDescription?: string }>;
}): PortionSize {
  const votes = meal.items.map((item) =>
    parsePortionSize(
      `${item.portionSize ?? ""} ${item.name ?? ""} ${item.portionDescription ?? ""}`,
    ),
  );
  if (votes.includes("large") && !votes.includes("small")) return "large";
  if (votes.includes("small") && !votes.includes("large")) return "small";
  const fromName = parsePortionSize(meal.mealName, "medium");
  return votes[0] ?? fromName;
}

export function applyPortionSize(
  meal: MealAnalysis,
  nextSize: PortionSize,
): MealAnalysis {
  const current = parsePortionSize(meal.portionSize, inferMealSize(meal));
  if (current === nextSize && meal.portionSize === nextSize) return meal;
  const ratio = SIZE_SCALE[nextSize] / SIZE_SCALE[current];
  const items = meal.items.map((item) => ({
    ...item,
    portionSize: nextSize,
    portionDescription: `${SIZE_LABEL[nextSize]} · ${stripLeadingSizeLabel(item.portionDescription)}`,
    estimatedGrams: Math.round(item.estimatedGrams * ratio),
    calories: Math.round(item.calories * ratio),
    proteinG: round1(item.proteinG * ratio),
    carbsG: round1(item.carbsG * ratio),
    fatG: round1(item.fatG * ratio),
    fiberG: round1(item.fiberG * ratio),
    sugarG: round1(item.sugarG * ratio),
    sodiumMg: Math.round(item.sodiumMg * ratio),
    notes: `${SIZE_LABEL[nextSize]} portion. ${item.notes}`.trim(),
  }));
  const totals = items.reduce(
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
  return {
    ...meal,
    portionSize: nextSize,
    items,
    totalCalories: Math.round(totals.calories),
    calorieRangeLow: Math.round(totals.calories * 0.88),
    calorieRangeHigh: Math.round(totals.calories * 1.14),
    proteinG: round1(totals.proteinG),
    carbsG: round1(totals.carbsG),
    fatG: round1(totals.fatG),
    fiberG: round1(totals.fiberG),
    sugarG: round1(totals.sugarG),
    sodiumMg: Math.round(totals.sodiumMg),
    assumptions: [
      `Portion size set to ${SIZE_LABEL[nextSize]} (${Math.round(SIZE_SCALE[nextSize] * 100)}% of a regular serving).`,
      ...meal.assumptions.filter((line) => !line.startsWith("Portion size set to")),
    ].slice(0, 6),
  };
}

function stripLeadingSizeLabel(text: string) {
  return text.replace(/^(Small|Medium|Large)\s*·\s*/i, "").trim();
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}
