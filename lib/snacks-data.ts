import { normalizeName, type FoodRecord } from "@/lib/nutrition-data";

export type SnackCategory =
  | "chips"
  | "puffs"
  | "crackers"
  | "cookies"
  | "bars"
  | "candy"
  | "other";

export type SnackRecord = FoodRecord & {
  category: SnackCategory;
  bagServings: number;
};

export const SNACK_CATEGORIES: { id: SnackCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "chips", label: "Chips" },
  { id: "puffs", label: "Puffs" },
  { id: "crackers", label: "Crackers" },
  { id: "cookies", label: "Cookies" },
  { id: "bars", label: "Bars" },
  { id: "candy", label: "Candy" },
  { id: "other", label: "Other" },
];

const USDA = "https://fdc.nal.usda.gov/";
const FRITO = "https://www.fritolay.com/products";

export const SNACKS: SnackRecord[] = [
  s("Lay's Classic Potato Chips", "chips", ["lays", "potato chips"], 160, 2, 15, 10, 1, 0, 170, 28, 6, "Frito-Lay / USDA branded", FRITO),
  s("Lay's Barbecue Potato Chips", "chips", ["lays bbq"], 160, 2, 16, 10, 1, 2, 170, 28, 6, "Frito-Lay nutrition", FRITO),
  s("Lay's Sour Cream & Onion", "chips", ["lays sco"], 160, 2, 15, 10, 1, 1, 160, 28, 6, "Frito-Lay nutrition", FRITO),
  s("Lay's Salt & Vinegar", "chips", [], 160, 2, 15, 10, 1, 0, 230, 28, 6, "Frito-Lay nutrition", FRITO),
  s("Ruffles Original", "chips", ["ruffle"], 160, 2, 15, 10, 1, 0, 160, 28, 6, "Frito-Lay nutrition", FRITO),
  s("Ruffles Cheddar & Sour Cream", "chips", ["ruffles cheddar"], 160, 2, 15, 10, 1, 1, 180, 28, 6, "Frito-Lay nutrition", FRITO),
  s("Doritos Nacho Cheese", "chips", ["dorito", "nacho doritos"], 150, 2, 18, 8, 1, 0, 210, 28, 6, "Frito-Lay nutrition", FRITO),
  s("Doritos Cool Ranch", "chips", ["cool ranch"], 150, 2, 18, 8, 1, 1, 180, 28, 6, "Frito-Lay nutrition", FRITO),
  s("Doritos Spicy Sweet Chili", "chips", ["sweet chili"], 150, 2, 18, 8, 1, 1, 210, 28, 6, "Frito-Lay nutrition", FRITO),
  s("Tostitos Original Restaurant Style", "chips", ["tostito", "tortilla chips"], 150, 2, 18, 7, 1, 0, 115, 28, 8, "Frito-Lay nutrition", FRITO),
  s("Fritos Original Corn Chips", "chips", ["frito"], 160, 2, 16, 10, 1, 0, 170, 28, 6, "Frito-Lay nutrition", FRITO),
  s("Miss Vickie's Sea Salt", "chips", ["miss vickies"], 150, 2, 15, 9, 1, 0, 85, 28, 5, "Frito-Lay nutrition", FRITO),
  s("Cape Cod Original", "chips", ["cape cod chips"], 140, 2, 16, 8, 1, 0, 85, 28, 5, "USDA branded / Cape Cod", USDA),
  s("Kettle Brand Sea Salt", "chips", ["kettle chips"], 140, 2, 16, 8, 2, 0, 80, 28, 5, "USDA branded / Kettle", USDA),
  s("Pringles Original", "chips", ["pringles"], 150, 1, 16, 9, 1, 0, 150, 28, 5, "Kellogg / USDA branded", "https://www.pringles.com/us/products.html"),
  s("SunChips Original", "chips", ["sun chips"], 140, 2, 19, 6, 2, 2, 120, 28, 6, "Frito-Lay nutrition", FRITO),
  s("Popchips Sea Salt", "chips", ["pop chips"], 120, 1, 20, 4, 1, 0, 140, 28, 5, "USDA branded / Popchips", USDA),
  s("SkinnyPop Original", "other", ["skinny pop", "popcorn"], 150, 2, 16, 10, 3, 0, 75, 28, 4, "USDA branded / SkinnyPop", USDA),
  s("Takis Fuego", "chips", ["takis"], 140, 2, 16, 8, 1, 0, 390, 28, 5, "Barcel / USDA branded", USDA),
  s("Takis Nitro", "chips", ["takis nitro"], 140, 2, 16, 8, 1, 0, 310, 28, 5, "Barcel / USDA branded", USDA),
  s("Takis Blue Heat", "chips", ["blue heat"], 140, 2, 16, 8, 1, 0, 390, 28, 5, "Barcel / USDA branded", USDA),
  s("Funyuns Onion Flavored Rings", "chips", ["funyuns"], 140, 2, 16, 7, 1, 1, 270, 28, 4, "Frito-Lay nutrition", FRITO),
  s("Doritos Flamin' Hot Nacho", "chips", ["flamin hot doritos", "hot doritos"], 150, 2, 18, 8, 1, 0, 210, 28, 6, "Frito-Lay nutrition", FRITO),
  s("Fritos Flamin' Hot", "chips", ["hot fritos"], 160, 2, 16, 10, 1, 0, 250, 28, 6, "Frito-Lay nutrition", FRITO),
  s("SunChips Harvest Cheddar", "chips", ["harvest cheddar"], 140, 2, 19, 6, 2, 2, 200, 28, 6, "Frito-Lay nutrition", FRITO),
  s("Santitas White Corn Tortilla Chips", "chips", ["santitas"], 140, 2, 19, 6, 2, 0, 80, 28, 8, "Frito-Lay nutrition", FRITO),
  s("Late July Jalapeño Lime", "chips", ["late july"], 140, 2, 18, 7, 2, 1, 115, 28, 5, "Late July / USDA branded", USDA),
  s("Utz Regular Potato Chips", "chips", ["utz chips"], 150, 2, 15, 9, 1, 0, 180, 28, 6, "Utz / USDA branded", USDA),
  s("Zapp's Voodoo Chips", "chips", ["zapps", "voodoo"], 150, 2, 16, 9, 1, 1, 270, 28, 5, "Zapp's / USDA branded", USDA),
  s("Herr's Potato Chips", "chips", ["herrs"], 150, 2, 15, 10, 1, 0, 170, 28, 6, "Herr's / USDA branded", USDA),
  s("Popcorners Kettle Corn", "chips", ["popcorners"], 120, 2, 20, 3, 1, 3, 95, 28, 5, "Popcorners / USDA branded", USDA),
  s("Quest Protein Chips, Cheddar", "chips", ["quest chips"], 140, 18, 5, 5, 1, 1, 330, 32, 1, "Quest / USDA branded", USDA),
  s("Hippeas Organic Chickpea Puffs", "puffs", ["hippeas"], 130, 4, 18, 5, 3, 1, 170, 28, 4, "Hippeas / USDA branded", USDA),
  s("Bugles Original", "chips", ["bugles"], 160, 2, 16, 9, 1, 2, 270, 30, 4, "General Mills / USDA", USDA),
  s("Andy Capp's Hot Fries", "chips", ["andy capps", "hot fries"], 150, 2, 17, 8, 1, 1, 300, 28, 4, "Conagra / USDA branded", USDA),
  s("Chex Mix Traditional", "other", ["chex mix"], 120, 2, 20, 4, 1, 2, 200, 29, 5, "General Mills / USDA", USDA),
  s("Gardetto's Original", "other", ["gardettos"], 140, 3, 18, 6, 1, 1, 310, 30, 4, "General Mills / USDA", USDA),
  s("Combos Cheddar", "other", ["combos"], 140, 3, 19, 6, 1, 2, 240, 28, 4, "Mars / USDA branded", USDA),

  s("Cheetos Crunchy", "puffs", ["cheeto"], 160, 2, 15, 10, 1, 1, 250, 28, 6, "Frito-Lay nutrition", FRITO),
  s("Cheetos Flamin' Hot Crunchy", "puffs", ["flamin hot", "hot cheetos"], 160, 2, 15, 10, 1, 1, 250, 28, 6, "Frito-Lay nutrition", FRITO),
  s("Cheetos Puffs", "puffs", ["cheese puffs"], 160, 2, 15, 10, 0, 1, 250, 28, 5, "Frito-Lay nutrition", FRITO),
  s("Smartfood White Cheddar Popcorn", "puffs", ["smartfood"], 160, 3, 14, 10, 2, 2, 280, 28, 4, "Frito-Lay nutrition", FRITO),
  s("Pirate's Booty Aged White Cheddar", "puffs", ["pirates booty"], 130, 2, 18, 5, 1, 1, 180, 28, 4, "USDA branded", USDA),

  s("Cheez-It Original", "crackers", ["cheezits", "cheese crackers"], 150, 3, 17, 8, 1, 0, 230, 30, 4, "Kellogg / USDA branded", USDA),
  s("Goldfish Cheddar", "crackers", ["goldfish"], 140, 3, 20, 5, 1, 0, 250, 30, 4, "Pepperidge Farm / USDA", USDA),
  s("Ritz Crackers", "crackers", ["ritz"], 80, 1, 10, 4, 0, 1, 105, 16, 8, "Mondelez / USDA branded", USDA),
  s("Wheat Thins Original", "crackers", ["wheat thins"], 140, 2, 22, 5, 2, 4, 200, 31, 5, "Mondelez / USDA branded", USDA),
  s("Triscuits Original", "crackers", ["triscuit"], 120, 3, 20, 4, 3, 0, 160, 28, 5, "Mondelez / USDA branded", USDA),
  s("Snyder's of Hanover Pretzels", "crackers", ["pretzel", "snyders"], 110, 3, 23, 0, 1, 1, 450, 30, 6, "USDA branded / Snyder's", USDA),

  s("Oreo Sandwich Cookies", "cookies", ["oreos"], 160, 1, 25, 7, 1, 14, 135, 34, 5, "Mondelez / USDA branded", USDA),
  s("Chips Ahoy! Original", "cookies", ["chips ahoy"], 160, 2, 22, 8, 1, 11, 110, 32, 5, "Mondelez / USDA branded", USDA),
  s("Nutter Butter", "cookies", ["nutter butter"], 140, 2, 19, 7, 1, 8, 95, 28, 4, "Mondelez / USDA branded", USDA),
  s("Rice Krispies Treats", "cookies", ["rice krispie"], 90, 1, 17, 2, 0, 8, 105, 22, 1, "Kellogg / USDA branded", USDA),

  s("Nature Valley Oats 'n Honey", "bars", ["nature valley"], 190, 4, 29, 7, 2, 11, 180, 42, 1, "General Mills / USDA", USDA),
  s("KIND Dark Chocolate Nuts & Sea Salt", "bars", ["kind bar"], 200, 6, 16, 15, 7, 5, 125, 40, 1, "KIND / USDA branded", USDA),
  s("Clif Bar Chocolate Chip", "bars", ["clif bar"], 250, 9, 44, 5, 4, 21, 140, 68, 1, "Clif / USDA branded", USDA),
  s("Quaker Chewy Chocolate Chip", "bars", ["quaker chewy"], 100, 1, 17, 4, 1, 7, 75, 24, 1, "Quaker / USDA branded", USDA),
  s("Nutri-Grain Strawberry", "bars", ["nutrigrain"], 130, 2, 25, 3, 1, 13, 135, 37, 1, "Kellogg / USDA branded", USDA),

  s("M&M's Milk Chocolate", "candy", ["m&ms", "mms"], 140, 1, 20, 5, 1, 18, 20, 28, 4, "Mars / USDA branded", USDA),
  s("Skittles Original", "candy", ["skittle"], 160, 0, 37, 2, 0, 30, 15, 40, 3, "Mars / USDA branded", USDA),
  s("Reese's Peanut Butter Cups, 2 cups", "candy", ["reeses"], 210, 5, 24, 13, 1, 21, 150, 42, 1, "Hershey / USDA branded", USDA),
  s("Snickers Bar", "candy", ["snicker"], 250, 4, 33, 12, 1, 27, 140, 52, 1, "Mars / USDA branded", USDA),
  s("Kit Kat", "candy", ["kitkat"], 210, 3, 27, 11, 1, 21, 30, 42, 1, "Hershey / USDA branded", USDA),
  s("Twix", "candy", ["twix"], 250, 2, 33, 12, 1, 24, 100, 51, 1, "Mars / USDA branded", USDA),
  s("Sour Patch Kids", "candy", ["sour patch"], 150, 0, 36, 0, 0, 28, 20, 40, 3, "Mondelez / USDA branded", USDA),
  s("Gummy Bears", "candy", ["gummy"], 140, 0, 33, 0, 0, 22, 15, 40, 3, "USDA-style candy serving", USDA),

  s("Beef Jerky, original", "other", ["jerky"], 80, 13, 6, 1, 0, 6, 590, 28, 1, "USDA branded jerky", USDA),
  s("Trail mix, classic", "other", ["trail mix"], 170, 5, 14, 12, 2, 8, 70, 30, 3, "USDA trail mix", USDA),
  s("String cheese, mozzarella", "other", ["string cheese"], 80, 7, 1, 6, 0, 0, 200, 28, 1, "USDA mozzarella stick", USDA),
  s("Fruit snacks, pouch", "other", ["fruit snack"], 80, 0, 19, 0, 0, 11, 15, 23, 1, "USDA branded fruit snacks", USDA),
  s("Pop-Tarts Frosted Strawberry", "cookies", ["poptart", "pop tart"], 200, 2, 37, 5, 1, 16, 170, 50, 1, "Kellogg / USDA branded", USDA),
  s("Little Debbie Oatmeal Creme Pie", "cookies", ["little debbie", "oatmeal creme"], 170, 1, 27, 7, 1, 15, 140, 38, 1, "McKee / USDA branded", USDA),
  s("Hostess CupCake", "cookies", ["hostess cupcake"], 180, 1, 30, 6, 1, 23, 220, 45, 1, "Hostess / USDA branded", USDA),
  s("Slim Jim Original", "other", ["slim jim"], 140, 6, 3, 12, 0, 1, 490, 28, 1, "Conagra / USDA branded", USDA),
  s("MoonPie Double Decker", "cookies", ["moon pie"], 230, 3, 40, 7, 1, 20, 160, 57, 1, "Chattanooga / USDA", USDA),
  s("Grandma's Chocolate Chip Cookie", "cookies", ["grandmas cookie"], 180, 2, 24, 9, 1, 13, 125, 36, 1, "Frito-Lay nutrition", FRITO),
  s("Nilla Wafers", "cookies", ["nilla"], 130, 1, 21, 4, 0, 11, 95, 29, 4, "Mondelez / USDA branded", USDA),
  s("Fig Newtons", "cookies", ["fig newton"], 110, 1, 22, 2, 1, 12, 110, 31, 3, "Mondelez / USDA branded", USDA),
  s("Teddy Grahams Honey", "cookies", ["teddy grahams"], 130, 2, 22, 4, 1, 8, 95, 30, 4, "Mondelez / USDA branded", USDA),
];

function s(
  name: string,
  category: SnackCategory,
  aliases: string[],
  calories: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
  fiberG: number,
  sugarG: number,
  sodiumMg: number,
  grams: number,
  bagServings: number,
  source: string,
  sourceUrl: string,
): SnackRecord {
  return {
    name,
    restaurant: null,
    aliases,
    calories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    sugarG,
    sodiumMg,
    grams,
    source,
    sourceUrl,
    category,
    bagServings,
  };
}

export function searchLocalSnacks(query: string, category: SnackCategory | "all" = "all") {
  const needle = normalizeName(query);
  const tokens = needle.split(" ").filter((token) => token.length > 1);
  return SNACKS.map((snack) => {
    if (category !== "all" && snack.category !== category) {
      return { snack, score: 0 };
    }
    if (!needle) return { snack, score: 1 };
    const blob = normalizeName(`${snack.name} ${snack.aliases.join(" ")}`);
    let score = 0;
    if (blob.includes(needle) || needle.includes(blob)) score += 12;
    for (const token of tokens) {
      if (blob.includes(token)) score += 3;
    }
    return { snack, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((row) => row.snack);
}

export function snackFromFood(record: FoodRecord, category: SnackCategory = "other"): SnackRecord {
  return {
    ...record,
    category,
    bagServings: 1,
  };
}
