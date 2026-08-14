import type { FoodItem, MealAnalysis } from "@/lib/schema";

export type MealExtra = {
  id: string;
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  grams: number;
  tags: string[];
};

export const MEAL_EXTRAS: MealExtra[] = [
  e("ranch", "Ranch dressing", 140, 1, 2, 14, 0, 1, 280, 30, ["salad", "wings", "default"]),
  e("vinaigrette", "Vinaigrette", 80, 0, 3, 7, 0, 2, 180, 20, ["salad", "default"]),
  e("cheese", "Extra cheese", 70, 4, 0.5, 6, 0, 0.4, 180, 20, ["burger", "taco", "pizza", "default"]),
  e("bacon", "Bacon", 90, 6, 0, 7, 0, 0, 300, 24, ["burger", "breakfast"]),
  e("avocado", "Avocado", 80, 1, 4, 7, 3, 0.3, 4, 50, ["salad", "bowl", "california", "default"]),
  e("sourcream", "Sour cream", 60, 1, 1, 6, 0, 1, 15, 30, ["taco", "texmex", "mexican"]),
  e("guac", "Guacamole", 80, 1, 4, 7, 3, 0.4, 70, 50, ["taco", "texmex", "california"]),
  e("granola", "Granola", 150, 4, 22, 6, 3, 8, 70, 40, ["acai", "bowl"]),
  e("pb", "Peanut butter", 190, 8, 6, 16, 2, 3, 140, 32, ["acai", "bowl"]),
  e("honey", "Honey", 60, 0, 17, 0, 0, 16, 1, 20, ["acai", "breakfast"]),
  e("coconut", "Coconut flakes", 70, 0.6, 3, 6, 2, 1, 4, 12, ["acai"]),
  e("banana", "Banana", 105, 1, 27, 0, 3, 14, 1, 118, ["acai", "breakfast"]),
  e("syrup", "Maple syrup", 110, 0, 28, 0, 0, 24, 4, 40, ["breakfast"]),
  e("fries", "French fries", 365, 4, 48, 17, 4, 0, 250, 117, ["burger", "default"]),
  e("rice", "White rice", 200, 4, 44, 0.4, 0.6, 0, 5, 160, ["asian", "indian", "bowl"]),
  e("naan", "Naan", 260, 8, 45, 6, 2, 3, 480, 90, ["indian"]),
  e("oil", "Oil or butter", 100, 0, 0, 11, 0, 0, 80, 12, ["default", "salad"]),
];

export function extrasForMeal(meal: MealAnalysis): MealExtra[] {
  const blob = `${meal.mealName} ${meal.items.map((item) => item.name).join(" ")}`.toLowerCase();
  const tags = new Set<string>(["default"]);
  if (/\b(acai|açaí|smoothie bowl)\b/.test(blob)) tags.add("acai");
  if (/\b(salad|caesar|cobb)\b/.test(blob)) tags.add("salad");
  if (/\b(burger|hamburger)\b/.test(blob)) tags.add("burger");
  if (/\b(taco|burrito|quesadilla|nacho)\b/.test(blob)) tags.add("taco");
  if (/\b(bowl|poke|burrito bowl)\b/.test(blob)) tags.add("bowl");
  if (/\b(pancake|waffle|french toast|omelette)\b/.test(blob)) tags.add("breakfast");
  if (/\b(curry|tikka|biryani|naan)\b/.test(blob)) tags.add("indian");
  if (/\b(orange chicken|fried rice|ramen|pad thai|pho)\b/.test(blob)) tags.add("asian");
  if (/\b(pizza)\b/.test(blob)) tags.add("pizza");
  if (/\b(tex-?mex|chili|queso)\b/.test(blob)) tags.add("texmex");
  if (/\b(enchilada|fajita|tamale)\b/.test(blob)) tags.add("mexican");
  if (/\b(california|avocado toast)\b/.test(blob)) tags.add("california");
  if (/\bwings?\b/.test(blob)) tags.add("wings");

  return MEAL_EXTRAS.filter((extra) => extra.tags.some((tag) => tags.has(tag))).slice(0, 8);
}

export function applySeenToppings(meal: MealAnalysis): MealAnalysis {
  const blob = `${meal.mealName} ${meal.items.map((item) => `${item.name} ${item.notes}`).join(" ")}`.toLowerCase();
  let next = meal;
  for (const extra of extrasForMeal(meal)) {
    const needle = extra.name.toLowerCase();
    const hit = blob.includes(needle) || blob.includes(needle.split(" ")[0] ?? "");
    if (hit && needle.length > 4 && !extraIsOn(next, extra)) {
      next = toggleMealExtra(next, extra);
    }
  }
  return next;
}

export function extraIsOn(meal: MealAnalysis, extra: MealExtra) {
  return meal.items.some((item) => item.name.toLowerCase() === extra.name.toLowerCase());
}

export function toggleMealExtra(meal: MealAnalysis, extra: MealExtra): MealAnalysis {
  if (extraIsOn(meal, extra)) {
    return retotal({
      ...meal,
      items: meal.items.filter((item) => item.name.toLowerCase() !== extra.name.toLowerCase()),
    });
  }
  const item: FoodItem = {
    name: extra.name,
    brandOrRestaurantItem: null,
    portionDescription: "Added by you",
    portionSize: meal.portionSize ?? "medium",
    estimatedGrams: extra.grams,
    calories: extra.calories,
    proteinG: extra.proteinG,
    carbsG: extra.carbsG,
    fatG: extra.fatG,
    fiberG: extra.fiberG,
    sugarG: extra.sugarG,
    sodiumMg: extra.sodiumMg,
    confidence: 0.9,
    dataSource: "nutrition_database",
    notes: "Tapped on after the photo — extras like this often move the number most.",
  };
  return retotal({ ...meal, items: [...meal.items, item] });
}

function retotal(meal: MealAnalysis): MealAnalysis {
  const totals = meal.items.reduce(
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
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, sugarG: 0, sodiumMg: 0 },
  );
  return {
    ...meal,
    totalCalories: Math.round(totals.calories),
    calorieRangeLow: Math.round(totals.calories * 0.88),
    calorieRangeHigh: Math.round(totals.calories * 1.14),
    proteinG: Math.round(totals.proteinG * 10) / 10,
    carbsG: Math.round(totals.carbsG * 10) / 10,
    fatG: Math.round(totals.fatG * 10) / 10,
    fiberG: Math.round(totals.fiberG * 10) / 10,
    sugarG: Math.round(totals.sugarG * 10) / 10,
    sodiumMg: Math.round(totals.sodiumMg),
  };
}

function e(
  id: string,
  name: string,
  calories: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
  fiberG: number,
  sugarG: number,
  sodiumMg: number,
  grams: number,
  tags: string[],
): MealExtra {
  return { id, name, calories, proteinG, carbsG, fatG, fiberG, sugarG, sodiumMg, grams, tags };
}
