import { normalizeName } from "@/lib/nutrition-data";

export type DrinkGroup = "soda" | "diet" | "nondiet" | "other";

export type DrinkRecord = {
  name: string;
  group: DrinkGroup;
  aliases: string[];
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  sugarG: number;
  sodiumMg: number;
  ml: number;
  source: string;
  sourceUrl: string;
};

export const DRINK_GROUPS: { id: DrinkGroup; label: string; blurb: string }[] = [
  { id: "soda", label: "Soda", blurb: "Regular sugary sodas" },
  { id: "diet", label: "Diet", blurb: "Diet and zero-sugar drinks" },
  { id: "nondiet", label: "Non-diet", blurb: "Juice, sports, energy, sweet tea" },
  { id: "other", label: "Other", blurb: "Coffee, tea, water, milk, alcohol" },
];

const USDA = "https://fdc.nal.usda.gov/";
const COKE = "https://www.coca-colacompany.com/policies-and-practices/product-nutrition";
const PEPSI = "https://www.pepsicobeveragefacts.com/";

export const DRINKS: DrinkRecord[] = [
  d("Coca-Cola", "soda", ["coke", "coca cola"], 140, 0, 39, 0, 39, 45, 355, "Coca-Cola 12 oz", COKE),
  d("Pepsi", "soda", ["pepsi cola"], 150, 0, 41, 0, 41, 30, 355, "Pepsi 12 oz", PEPSI),
  d("Sprite", "soda", ["sprite"], 140, 0, 38, 0, 38, 65, 355, "Sprite 12 oz", COKE),
  d("Dr Pepper", "soda", ["dr pepper"], 150, 0, 40, 0, 39, 55, 355, "Dr Pepper 12 oz", "https://www.drpepper.com/"),
  d("Mountain Dew", "soda", ["mtn dew", "dew"], 170, 0, 46, 0, 46, 60, 355, "Mountain Dew 12 oz", PEPSI),
  d("Fanta Orange", "soda", ["fanta"], 160, 0, 44, 0, 44, 50, 355, "Fanta 12 oz", COKE),
  d("7UP", "soda", ["7 up", "seven up"], 140, 0, 38, 0, 38, 40, 355, "7UP 12 oz", "https://www.7up.com/"),
  d("Root beer", "soda", ["barqs", "a&w"], 170, 0, 45, 0, 45, 50, 355, "USDA root beer 12 oz", USDA),
  d("Ginger ale", "soda", ["canada dry"], 140, 0, 36, 0, 36, 35, 355, "USDA ginger ale 12 oz", USDA),
  d("Orange soda", "soda", ["sunkist", "crush"], 170, 0, 44, 0, 44, 45, 355, "USDA orange soda", USDA),

  d("Diet Coke", "diet", ["diet coke", "diet coca cola"], 0, 0, 0, 0, 0, 40, 355, "Diet Coke 12 oz", COKE),
  d("Coke Zero Sugar", "diet", ["coke zero", "zero coke"], 0, 0, 0, 0, 0, 40, 355, "Coke Zero 12 oz", COKE),
  d("Diet Pepsi", "diet", ["diet pepsi"], 0, 0, 0, 0, 0, 35, 355, "Diet Pepsi 12 oz", PEPSI),
  d("Pepsi Zero Sugar", "diet", ["pepsi zero"], 0, 0, 0, 0, 0, 40, 355, "Pepsi Zero 12 oz", PEPSI),
  d("Sprite Zero", "diet", ["sprite zero"], 0, 0, 0, 0, 0, 35, 355, "Sprite Zero 12 oz", COKE),
  d("Diet Dr Pepper", "diet", ["diet dr pepper"], 0, 0, 0, 0, 0, 55, 355, "Diet Dr Pepper 12 oz", "https://www.drpepper.com/"),
  d("Diet Mountain Dew", "diet", ["diet dew"], 0, 0, 0, 0, 0, 50, 355, "Diet Mountain Dew 12 oz", PEPSI),
  d("Zevia Cola", "diet", ["zevia"], 0, 0, 0, 0, 0, 35, 355, "Zevia 12 oz", "https://zevia.com/"),
  d("LaCroix", "diet", ["lacroix", "sparkling water"], 0, 0, 0, 0, 0, 0, 355, "LaCroix 12 oz", "https://www.lacroixwater.com/"),
  d("Diet ginger ale", "diet", ["diet canada dry"], 0, 0, 0, 0, 0, 40, 355, "Diet ginger ale 12 oz", USDA),
  d("Powerade Zero", "diet", ["powerade zero"], 0, 0, 0, 0, 0, 100, 591, "Powerade Zero 20 oz", COKE),
  d("Gatorade Zero", "diet", ["gatorade zero"], 5, 0, 1, 0, 0, 160, 591, "Gatorade Zero 20 oz", PEPSI),

  d("Orange juice, 8 oz", "nondiet", ["oj", "orange juice"], 110, 2, 26, 0, 21, 2, 240, "USDA orange juice", USDA),
  d("Apple juice, 8 oz", "nondiet", ["apple juice"], 110, 0, 28, 0, 24, 10, 240, "USDA apple juice", USDA),
  d("Lemonade, 12 oz", "nondiet", ["lemonade"], 150, 0, 39, 0, 37, 10, 355, "USDA lemonade", USDA),
  d("Sweet tea, 16 oz", "nondiet", ["sweet tea", "iced tea"], 180, 0, 45, 0, 44, 15, 473, "Typical sweet tea", USDA),
  d("Gatorade Thirst Quencher, 20 oz", "nondiet", ["gatorade"], 140, 0, 36, 0, 34, 270, 591, "Gatorade 20 oz", PEPSI),
  d("Powerade, 20 oz", "nondiet", ["powerade"], 130, 0, 35, 0, 34, 200, 591, "Powerade 20 oz", COKE),
  d("Red Bull, 8.4 oz", "nondiet", ["red bull"], 110, 1, 28, 0, 27, 105, 250, "Red Bull 8.4 oz", "https://www.redbull.com/"),
  d("Monster Energy, 16 oz", "nondiet", ["monster"], 210, 0, 54, 0, 54, 370, 473, "Monster 16 oz", "https://www.monsterenergy.com/"),
  d("Vitaminwater, 20 oz", "nondiet", ["vitamin water"], 120, 0, 32, 0, 31, 0, 591, "vitaminwater 20 oz", COKE),
  d("Snapple Lemon Tea, 16 oz", "nondiet", ["snapple"], 150, 0, 39, 0, 38, 10, 473, "Snapple 16 oz", "https://www.snapple.com/"),
  d("Arizona Green Tea, 23 oz", "nondiet", ["arizona"], 210, 0, 51, 0, 50, 20, 680, "Arizona 23 oz can", "https://www.drinkarizona.com/"),
  d("Chocolate milk, 8 oz", "nondiet", ["chocolate milk"], 190, 8, 26, 5, 24, 150, 244, "USDA chocolate milk", USDA),
  d("Horchatta / sweet rice drink, 12 oz", "nondiet", ["horchata"], 180, 2, 34, 4, 28, 80, 355, "Typical horchata", USDA),

  d("Coffee, black, 12 oz", "other", ["coffee", "black coffee"], 5, 0, 0, 0, 0, 5, 355, "USDA black coffee", USDA),
  d("Americano, 16 oz", "other", ["americano"], 15, 1, 2, 0, 0, 10, 473, "Typical americano", USDA),
  d("Latte, 16 oz 2%", "other", ["latte"], 190, 12, 18, 7, 18, 150, 473, "Typical 16 oz latte", USDA),
  d("Cappuccino, 12 oz", "other", ["cappuccino"], 80, 5, 8, 3, 8, 70, 355, "Typical cappuccino", USDA),
  d("Tea, unsweetened, 16 oz", "other", ["tea", "unsweet tea"], 2, 0, 0, 0, 0, 7, 473, "USDA unsweetened tea", USDA),
  d("Water, 16 oz", "other", ["water"], 0, 0, 0, 0, 0, 0, 473, "Water", USDA),
  d("Sparkling water", "other", ["topo chico", "perrier"], 0, 0, 0, 0, 0, 0, 355, "Plain sparkling water", USDA),
  d("Whole milk, 8 oz", "other", ["milk"], 150, 8, 12, 8, 12, 105, 244, "USDA whole milk", USDA),
  d("Almond milk, unsweetened, 8 oz", "other", ["almond milk"], 30, 1, 1, 2.5, 0, 150, 240, "Typical unsweetened almond milk", USDA),
  d("Protein shake, ready-to-drink", "other", ["protein shake", "premier protein"], 160, 30, 5, 3, 1, 230, 325, "Typical RTD protein", USDA),
  d("Beer, 12 oz", "other", ["beer", "lager"], 150, 1, 13, 0, 0, 14, 355, "USDA regular beer", USDA),
  d("Light beer, 12 oz", "other", ["light beer", "miller lite"], 100, 1, 5, 0, 0, 14, 355, "USDA light beer", USDA),
  d("Red wine, 5 oz", "other", ["wine", "red wine"], 125, 0, 4, 0, 1, 5, 148, "USDA red wine", USDA),
  d("White wine, 5 oz", "other", ["white wine"], 120, 0, 4, 0, 1, 5, 148, "USDA white wine", USDA),
];

function d(
  name: string,
  group: DrinkGroup,
  aliases: string[],
  calories: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
  sugarG: number,
  sodiumMg: number,
  ml: number,
  source: string,
  sourceUrl: string,
): DrinkRecord {
  return {
    name,
    group,
    aliases,
    calories,
    proteinG,
    carbsG,
    fatG,
    sugarG,
    sodiumMg,
    ml,
    source,
    sourceUrl,
  };
}

export function drinksFor(group: DrinkGroup, query = "") {
  const needle = normalizeName(query);
  return DRINKS.filter((drink) => {
    if (drink.group !== group) return false;
    if (!needle) return true;
    return drinkMatches(drink, needle);
  });
}

export function searchAllDrinks(query: string) {
  const needle = normalizeName(query);
  if (!needle) return [];
  return DRINKS.map((drink) => {
    const blob = normalizeName(`${drink.name} ${drink.aliases.join(" ")}`);
    let score = 0;
    if (blob === needle || normalizeName(drink.name) === needle) score += 12;
    if (blob.includes(needle) || needle.includes(normalizeName(drink.name))) score += 6;
    for (const token of needle.split(" ").filter((part) => part.length > 1)) {
      if (blob.includes(token)) score += 2;
    }
    return { drink, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.drink);
}

function drinkMatches(drink: DrinkRecord, needle: string) {
  const blob = normalizeName(`${drink.name} ${drink.aliases.join(" ")}`);
  return (
    blob.includes(needle) ||
    needle.split(" ").every((token) => token.length < 2 || blob.includes(token))
  );
}
