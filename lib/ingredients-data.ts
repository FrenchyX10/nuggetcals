import { normalizeName } from "@/lib/nutrition-data";

export type IngredientUnit = {
  label: string;
  grams: number;
};

export type IngredientRecord = {
  name: string;
  aliases: string[];
  caloriesPer100: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  units: IngredientUnit[];
  source: string;
  sourceUrl: string;
};

const USDA = "https://fdc.nal.usda.gov/";

export const INGREDIENTS: IngredientRecord[] = [
  i("Chicken breast, cooked", ["chicken", "grilled chicken"], 165, 31, 0, 3.6, 0, 0, 74, [u("4 oz", 113), u("6 oz", 170), u("100 g", 100)], "USDA cooked chicken breast"),
  i("Ground beef, 85% lean, cooked", ["beef", "hamburger meat"], 250, 26, 0, 17, 0, 0, 75, [u("4 oz", 113), u("patty", 113), u("100 g", 100)], "USDA ground beef"),
  i("Eggs, large", ["egg", "eggs"], 143, 13, 0.7, 9.5, 0, 0.4, 142, [u("1 large", 50), u("2 large", 100), u("3 large", 150)], "USDA large egg"),
  i("White rice, cooked", ["rice"], 130, 2.7, 28, 0.3, 0.4, 0, 1, [u("1/2 cup", 79), u("1 cup", 158), u("100 g", 100)], "USDA white rice"),
  i("Brown rice, cooked", ["brown rice"], 123, 2.7, 26, 1, 1.6, 0.2, 4, [u("1/2 cup", 98), u("1 cup", 195), u("100 g", 100)], "USDA brown rice"),
  i("Pasta, cooked", ["spaghetti", "noodles"], 158, 5.8, 31, 0.9, 1.8, 0.6, 1, [u("1 cup", 140), u("2 cups", 280), u("100 g", 100)], "USDA pasta"),
  i("Olive oil", ["oil"], 884, 0, 0, 100, 0, 0, 2, [u("1 tsp", 4.5), u("1 tbsp", 14), u("2 tbsp", 28)], "USDA olive oil"),
  i("Butter", ["butter"], 717, 0.9, 0.1, 81, 0, 0.1, 11, [u("1 tsp", 5), u("1 tbsp", 14), u("pat", 5)], "USDA butter"),
  i("Cheddar cheese", ["cheese"], 403, 23, 1.3, 33, 0, 0.5, 621, [u("1 slice", 28), u("1/4 cup", 28), u("1 oz", 28)], "USDA cheddar"),
  i("Mozzarella", ["mozzarella"], 280, 22, 3, 17, 0, 1, 373, [u("1 oz", 28), u("1/2 cup", 56)], "USDA mozzarella"),
  i("Whole milk", ["milk"], 61, 3.2, 4.8, 3.3, 0, 5, 43, [u("1 cup", 244), u("1/2 cup", 122)], "USDA whole milk"),
  i("2% milk", ["2 percent milk"], 50, 3.3, 4.8, 2, 0, 5, 47, [u("1 cup", 244), u("1/2 cup", 122)], "USDA 2% milk"),
  i("Greek yogurt, plain", ["yogurt"], 59, 10, 3.6, 0.4, 0, 3.2, 36, [u("1/2 cup", 120), u("1 cup", 245)], "USDA Greek yogurt"),
  i("Black beans, cooked", ["beans"], 132, 8.9, 24, 0.5, 8.7, 0.3, 1, [u("1/2 cup", 86), u("1 cup", 172)], "USDA black beans"),
  i("Broccoli, cooked", ["broccoli"], 35, 2.4, 7, 0.4, 3.3, 1.4, 41, [u("1 cup", 156), u("1/2 cup", 78)], "USDA broccoli"),
  i("Spinach, raw", ["spinach"], 23, 2.9, 3.6, 0.4, 2.2, 0.4, 79, [u("1 cup", 30), u("2 cups", 60)], "USDA spinach"),
  i("Potato, baked", ["potato"], 93, 2.5, 21, 0.1, 2.2, 1.2, 10, [u("1 medium", 173), u("1 cup", 122)], "USDA baked potato"),
  i("Sweet potato, baked", ["sweet potato"], 90, 2, 21, 0.2, 3.3, 6.5, 36, [u("1 medium", 114), u("1 cup", 200)], "USDA sweet potato"),
  i("Avocado", ["avocado"], 160, 2, 8.5, 15, 6.7, 0.7, 7, [u("1/2 fruit", 68), u("1 fruit", 136), u("1/4 cup", 38)], "USDA avocado"),
  i("Banana", ["banana"], 89, 1.1, 23, 0.3, 2.6, 12, 1, [u("1 medium", 118), u("1/2", 59)], "USDA banana"),
  i("Apple", ["apple"], 52, 0.3, 14, 0.2, 2.4, 10, 1, [u("1 medium", 182), u("1 cup sliced", 110)], "USDA apple"),
  i("Blueberries", ["blueberry"], 57, 0.7, 14, 0.3, 2.4, 10, 1, [u("1/2 cup", 74), u("1 cup", 148)], "USDA blueberries"),
  i("Oats, dry", ["oatmeal", "oats"], 389, 17, 66, 7, 11, 1, 2, [u("1/2 cup", 40), u("1 cup", 80)], "USDA oats"),
  i("Bread, wheat", ["bread", "toast"], 267, 13, 49, 3.4, 6, 6, 491, [u("1 slice", 32), u("2 slices", 64)], "USDA wheat bread"),
  i("Tortilla, flour", ["tortilla"], 312, 8, 51, 8, 3, 2, 636, [u("1 medium", 49), u("1 large", 72)], "USDA flour tortilla"),
  i("Peanut butter", ["peanut butter"], 588, 25, 20, 50, 6, 9, 17, [u("1 tbsp", 16), u("2 tbsp", 32)], "USDA peanut butter"),
  i("Sugar, white", ["sugar"], 387, 0, 100, 0, 0, 100, 0, [u("1 tsp", 4), u("1 tbsp", 12), u("1/4 cup", 50)], "USDA sugar"),
  i("Honey", ["honey"], 304, 0.3, 82, 0, 0.2, 82, 4, [u("1 tsp", 7), u("1 tbsp", 21)], "USDA honey"),
  i("Maple syrup", ["syrup"], 260, 0, 67, 0.1, 0, 60, 12, [u("1 tbsp", 20), u("1/4 cup", 80)], "USDA maple syrup"),
  i("Flour, all-purpose", ["flour"], 364, 10, 76, 1, 2.7, 0.3, 2, [u("1/4 cup", 31), u("1 cup", 125)], "USDA flour"),
  i("Salmon, cooked", ["salmon"], 206, 22, 0, 12, 0, 0, 61, [u("4 oz", 113), u("6 oz", 170)], "USDA salmon"),
  i("Tuna, canned in water", ["tuna"], 116, 26, 0, 0.8, 0, 0, 247, [u("1 can", 142), u("3 oz", 85)], "USDA tuna"),
  i("Tofu, firm", ["tofu"], 144, 17, 3, 9, 2, 0.7, 14, [u("1/2 cup", 126), u("4 oz", 113)], "USDA tofu"),
  i("Tomato", ["tomato"], 18, 0.9, 3.9, 0.2, 1.2, 2.6, 5, [u("1 medium", 123), u("1/2 cup", 90)], "USDA tomato"),
  i("Onion", ["onion"], 40, 1.1, 9, 0.1, 1.7, 4.2, 4, [u("1/2 cup", 80), u("1 medium", 110)], "USDA onion"),
  i("Garlic", ["garlic"], 149, 6.4, 33, 0.5, 2.1, 1, 17, [u("1 clove", 3), u("1 tsp minced", 3)], "USDA garlic"),
  i("Carrot", ["carrot"], 41, 0.9, 10, 0.2, 2.8, 4.7, 69, [u("1 medium", 61), u("1 cup", 128)], "USDA carrot"),
  i("Corn, cooked", ["corn"], 96, 3.4, 21, 1.5, 2.4, 4.5, 1, [u("1/2 cup", 82), u("1 ear", 90)], "USDA corn"),
  i("Cheddar sauce / queso", ["queso", "cheese sauce"], 170, 6, 8, 13, 0, 4, 620, [u("2 tbsp", 30), u("1/4 cup", 60)], "Typical cheese sauce"),
  i("Salsa", ["salsa"], 36, 1.5, 7, 0.2, 2, 4, 430, [u("2 tbsp", 32), u("1/4 cup", 65)], "USDA salsa"),
  i("Sour cream", ["sour cream"], 198, 2.4, 4.6, 19, 0, 3.4, 31, [u("1 tbsp", 12), u("2 tbsp", 24)], "USDA sour cream"),
  i("Mayonnaise", ["mayo"], 680, 1, 0.6, 75, 0, 0.6, 635, [u("1 tbsp", 14), u("2 tbsp", 28)], "USDA mayonnaise"),
  i("Ketchup", ["ketchup"], 112, 1.3, 26, 0.2, 0.3, 21, 907, [u("1 tbsp", 17), u("2 tbsp", 34)], "USDA ketchup"),
  i("Soy sauce", ["soy sauce"], 53, 8, 4.9, 0.1, 0.8, 0.4, 5493, [u("1 tsp", 5), u("1 tbsp", 16)], "USDA soy sauce"),
  i("Bacon, cooked", ["bacon"], 541, 37, 1.4, 42, 0, 0, 1717, [u("1 slice", 8), u("3 slices", 24)], "USDA bacon"),
  i("Ham", ["ham"], 145, 21, 1.5, 5.5, 0, 1.4, 1203, [u("2 oz", 56), u("1 slice", 28)], "USDA ham"),
  i("Turkey breast", ["turkey"], 135, 30, 0, 1, 0, 0, 999, [u("3 oz", 85), u("4 oz", 113)], "USDA turkey"),
];

function u(label: string, grams: number): IngredientUnit {
  return { label, grams };
}

function i(
  name: string,
  aliases: string[],
  caloriesPer100: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
  fiberG: number,
  sugarG: number,
  sodiumMg: number,
  units: IngredientUnit[],
  source: string,
): IngredientRecord {
  return {
    name,
    aliases,
    caloriesPer100,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    sugarG,
    sodiumMg,
    units,
    source,
    sourceUrl: USDA,
  };
}

export function searchIngredients(query: string) {
  const needle = normalizeName(query);
  if (!needle) return INGREDIENTS.slice(0, 12);
  const tokens = needle.split(" ").filter((token) => token.length > 1);
  return INGREDIENTS.map((item) => {
    const blob = normalizeName(`${item.name} ${item.aliases.join(" ")}`);
    let score = 0;
    if (blob.includes(needle) || needle.includes(normalizeName(item.name))) score += 10;
    for (const token of tokens) if (blob.includes(token)) score += 3;
    return { item, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.item);
}

export function scaleIngredient(item: IngredientRecord, grams: number) {
  const scale = grams / 100;
  return {
    calories: Math.round(item.caloriesPer100 * scale),
    proteinG: round1(item.proteinG * scale),
    carbsG: round1(item.carbsG * scale),
    fatG: round1(item.fatG * scale),
    fiberG: round1(item.fiberG * scale),
    sugarG: round1(item.sugarG * scale),
    sodiumMg: Math.round(item.sodiumMg * scale),
    grams: Math.round(grams),
  };
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}
