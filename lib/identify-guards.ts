import type { LocalSight } from "@/lib/local-vision";
import { refineMealWithPublishedNutrition } from "@/lib/refine-meal";
import type { MealAnalysis } from "@/lib/schema";

const BREAKFAST =
  /\b(pancake|pancakes|waffle|waffles|french toast|hotcake|flapjack|crepe)\b/;
const CHICKEN =
  /\b(chicken|nugget|tender|wing|drumstick|fried chicken)\b/;
const BURGER =
  /\b(burger|hamburger|cheeseburger|whopper)\b/;
const BERRY = /\b(blueberr|berr|syrup|stack)\b/;

export function sanitizeIdentifiedName(
  name: string,
  clues: string,
  userHint: string,
): string {
  const hint = userHint.toLowerCase();
  const blob = `${name} ${clues}`.toLowerCase();
  const userBreakfast = BREAKFAST.test(hint);
  const userChicken = CHICKEN.test(hint) && !BREAKFAST.test(hint);
  const userBurger = BURGER.test(hint);

  if (userBreakfast && CHICKEN.test(name) && !userChicken) {
    return BERRY.test(hint) || BERRY.test(blob)
      ? "Blueberry pancakes"
      : "Pancakes";
  }
  if (userChicken && BREAKFAST.test(name)) return name.replace(BREAKFAST, "chicken").trim();
  if (userBurger && CHICKEN.test(name) && !/chicken/.test(hint)) return "Hamburger";

  const looksBreakfast =
    BREAKFAST.test(blob) ||
    /round golden (disc|cake|patty)|layered stack|syrup|whipped cream|blueberr/.test(
      blob,
    );
  const looksChicken =
    /visible bone|drumstick|wingette|breaded strip|craggy breading/.test(blob);

  if (looksBreakfast && !userChicken && CHICKEN.test(name)) {
    return /blueberr|berr/.test(blob) ? "Blueberry pancakes" : "Pancakes";
  }
  if (looksBreakfast && !userChicken && BURGER.test(name)) {
    return "Pancakes";
  }
  if (looksChicken && !userBreakfast && BURGER.test(name) && !userBurger) {
    return "Fried chicken";
  }
  return name;
}

export function applyLocalIdentityGuard(
  meal: MealAnalysis,
  sight: LocalSight,
  restaurant: string,
  dishHint: string,
): MealAnalysis {
  if (!meal.isFood || meal.items.length === 0) return meal;

  const localText = [
    sight.caption,
    ...sight.labels.slice(0, 4).map((item) => item.label),
  ]
    .join(" ")
    .toLowerCase();
  const groqText = `${meal.mealName} ${meal.items.map((item) => item.name).join(" ")}`.toLowerCase();
  const hint = dishHint.toLowerCase();
  const localScore = sight.labels[0]?.score ?? 0;

  if (BREAKFAST.test(hint) || CHICKEN.test(hint) || BURGER.test(hint)) {
    return meal;
  }

  let rename: string | null = null;
  if (BREAKFAST.test(localText) && CHICKEN.test(groqText) && localScore >= 0.22) {
    rename = BERRY.test(localText) ? "Blueberry pancakes" : "Pancakes";
  } else if (
    BREAKFAST.test(localText) &&
    BURGER.test(groqText) &&
    localScore >= 0.22
  ) {
    rename = BERRY.test(localText) ? "Blueberry pancakes" : "Pancakes";
  } else if (
    CHICKEN.test(localText) &&
    BURGER.test(groqText) &&
    !CHICKEN.test(groqText) &&
    localScore >= 0.32
  ) {
    rename = sight.caption || "Fried chicken";
  }

  if (!rename) return meal;

  const nextItems = meal.items.map((item, index) =>
    index === 0
      ? {
          ...item,
          name: rename as string,
          notes: `On-device check preferred “${rename}” over “${item.name}”. ${item.notes}`,
        }
      : item,
  );
  const next = {
    ...meal,
    mealName: rename,
    matchedMenuItem: rename,
    items: nextItems,
    assumptions: [
      `On-device food model also looked at the photo and agreed it is ${rename}.`,
      ...meal.assumptions,
    ].slice(0, 6),
  };
  return refineMealWithPublishedNutrition(
    next,
    restaurant,
    `${dishHint} ${rename} ${sight.caption}`,
  );
}
