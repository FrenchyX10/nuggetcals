import { SIZE_LABEL, type PortionSize } from "@/lib/portion-size";
import { looksLikeSushi } from "@/lib/sushi";

export type FoodFamily =
  | "pizza"
  | "burger"
  | "chicken"
  | "wings"
  | "pasta"
  | "salad"
  | "taco"
  | "burrito"
  | "bowl"
  | "sandwich"
  | "breakfast"
  | "fries"
  | "asian"
  | "steak"
  | "seafood"
  | "dessert"
  | "soup"
  | "nachos";

export type FamilyGroup = {
  name: string;
  family: FoodFamily;
  toppings: string[];
  extras: string[];
  count: number;
  unit: string;
  notes: string;
};

export type FamilyVariant = {
  name: string;
  family: FoodFamily;
  aliases: string[];
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  grams: number;
  unit: string;
  perUnit: boolean;
};

const FAMILY_MATCH: Array<[FoodFamily, RegExp]> = [
  ["wings", /\b(wings?|wingettes?|drumettes?|buffalo wings?)\b/],
  ["pizza", /\b(pizza|pepperoni|margherita|sicilian)\b/],
  ["taco", /\b(tacos?|taquitos?|birria)\b/],
  ["nachos", /\b(nachos?|quesadilla)\b/],
  ["burrito", /\b(burritos?)\b/],
  ["burger", /\b(burgers?|hamburgers?|cheeseburgers?|whopper|baconator)\b/],
  ["breakfast", /\b(pancakes?|waffles?|french toast|omelettes?|omelets?|hotcakes?|flapjacks?|scrambled eggs?)\b/],
  ["pasta", /\b(pasta|spaghetti|fettuccine|penne|linguine|lasagna|ravioli|alfredo|carbonara|bolognese|ziti|macaroni)\b/],
  ["salad", /\b(salads?|caesar|cobb salad)\b/],
  ["bowl", /\b(bowl|poke|bibimbap)\b/],
  ["sandwich", /\b(sandwich|sub|hoagie|cheesesteak|blt|panini|wrap)\b/],
  ["fries", /\b(fries|frites|poutine|onion rings|tater tots)\b/],
  ["steak", /\b(steak|ribeye|sirloin|filet mignon|ny strip|new york strip)\b/],
  ["seafood", /\b(salmon|fish and chips|grilled fish|fried fish|cod|tilapia|fish fillet)\b/],
  ["asian", /\b(ramen|pho|pad thai|fried rice|orange chicken|general tso|sesame chicken|lo mein|chow mein|butter chicken|curry)\b/],
  ["soup", /\b(soup|chowder|bisque)\b/],
  ["dessert", /\b(cake|pie|brownie|ice cream|cookie|donut|doughnut|cheesecake)\b/],
  ["chicken", /\b(chicken|tenders?|nuggets?|rotisserie)\b/],
];

/** Per-unit or typical-plate published numbers. */
export const FAMILY_VARIANTS: FamilyVariant[] = [
  v("Pizza slice, cheese", "pizza", ["cheese pizza", "plain pizza", "cheese slice"], 285, 12, 36, 10, 2, 4, 640, 107, "slice", true),
  v("Pizza slice, pepperoni", "pizza", ["pepperoni pizza", "pepperoni slice"], 313, 13, 35, 13, 2, 4, 760, 111, "slice", true),
  v("Pizza slice, sausage", "pizza", ["sausage pizza"], 330, 14, 35, 15, 2, 4, 800, 115, "slice", true),
  v("Pizza slice, supreme", "pizza", ["supreme pizza", "deluxe pizza", "the works"], 350, 15, 36, 16, 3, 5, 860, 125, "slice", true),
  v("Pizza slice, meat lovers", "pizza", ["meat lovers pizza", "meat pizza"], 390, 18, 34, 20, 2, 4, 980, 130, "slice", true),
  v("Pizza slice, Hawaiian", "pizza", ["hawaiian pizza", "ham pineapple pizza"], 300, 13, 37, 11, 2, 8, 740, 115, "slice", true),
  v("Pizza slice, veggie", "pizza", ["veggie pizza", "vegetable pizza"], 260, 11, 36, 8, 3, 5, 620, 115, "slice", true),
  v("Pizza slice, margherita", "pizza", ["margherita pizza"], 250, 10, 33, 8, 2, 4, 540, 105, "slice", true),
  v("Pizza slice, BBQ chicken", "pizza", ["bbq chicken pizza"], 320, 16, 36, 11, 2, 8, 780, 120, "slice", true),
  v("Pizza slice, white", "pizza", ["white pizza", "alfredo pizza"], 310, 13, 32, 14, 2, 3, 700, 110, "slice", true),

  v("Hamburger", "burger", ["hamburger", "plain burger", "beef burger"], 450, 25, 36, 21, 2, 6, 750, 200, "burger", true),
  v("Cheeseburger", "burger", ["cheeseburger", "cheese burger"], 540, 31, 40, 27, 2, 8, 1040, 220, "burger", true),
  v("Bacon cheeseburger", "burger", ["bacon cheeseburger", "bacon burger"], 650, 36, 40, 36, 2, 8, 1280, 250, "burger", true),
  v("Double cheeseburger", "burger", ["double cheeseburger", "double burger"], 740, 46, 40, 42, 2, 8, 1400, 300, "burger", true),
  v("Double bacon cheeseburger", "burger", ["double bacon", "bacon double"], 860, 52, 41, 52, 2, 9, 1680, 340, "burger", true),
  v("Turkey burger", "burger", ["turkey burger"], 420, 28, 34, 18, 2, 6, 780, 200, "burger", true),
  v("Veggie burger", "burger", ["veggie burger", "black bean burger", "impossible burger"], 390, 20, 40, 16, 6, 7, 860, 200, "burger", true),
  v("Mushroom swiss burger", "burger", ["mushroom swiss", "swiss burger"], 620, 34, 38, 34, 3, 7, 1180, 250, "burger", true),

  v("Fried chicken breast", "chicken", ["fried breast"], 360, 28, 14, 22, 0.5, 0, 780, 140, "piece", true),
  v("Fried chicken thigh", "chicken", ["fried thigh"], 280, 18, 10, 18, 0.4, 0, 620, 100, "piece", true),
  v("Fried chicken drumstick", "chicken", ["fried drumstick", "drumstick"], 160, 14, 6, 9, 0.2, 0, 380, 70, "piece", true),
  v("Fried chicken wing", "chicken", ["fried wing"], 140, 10, 5, 9, 0, 0, 320, 50, "piece", true),
  v("Mixed fried chicken", "chicken", ["fried chicken", "fried chicken pieces"], 245, 20, 9, 15, 0.3, 0, 490, 100, "piece", true),
  v("Grilled chicken breast", "chicken", ["grilled chicken", "baked chicken", "chicken breast"], 280, 53, 0, 6, 0, 0, 430, 170, "serving", false),
  v("Chicken tender", "chicken", ["chicken tender", "chicken strip", "chicken finger"], 95, 7, 5.5, 4.5, 0.2, 0.2, 215, 42, "piece", true),
  v("Chicken nugget", "chicken", ["nugget"], 45, 2.5, 2.5, 2.7, 0.1, 0.1, 90, 16, "piece", true),
  v("Rotisserie chicken quarter", "chicken", ["rotisserie chicken", "roast chicken"], 320, 36, 0, 18, 0, 0, 520, 170, "serving", false),
  v("Crispy chicken sandwich", "chicken", ["fried chicken sandwich", "crispy chicken sandwich"], 520, 28, 44, 24, 2, 6, 1200, 220, "sandwich", false),
  v("Grilled chicken sandwich", "chicken", ["grilled chicken sandwich"], 420, 32, 38, 14, 2, 6, 980, 210, "sandwich", false),

  v("Chicken wing", "wings", ["plain wing", "unsauced wing"], 80, 7, 0.5, 5.5, 0, 0, 160, 30, "piece", true),
  v("Buffalo wing", "wings", ["buffalo wings", "hot wings"], 90, 7, 1, 6, 0, 0.2, 220, 32, "piece", true),
  v("BBQ wing", "wings", ["bbq wings"], 95, 7, 3, 6, 0, 2, 210, 34, "piece", true),
  v("Garlic parmesan wing", "wings", ["garlic parmesan wings"], 110, 7, 1.5, 8, 0, 0.3, 240, 36, "piece", true),
  v("Lemon pepper wing", "wings", ["lemon pepper wings"], 85, 7, 1, 5.5, 0, 0.2, 200, 32, "piece", true),

  v("Spaghetti with meat sauce", "pasta", ["spaghetti bolognese", "spaghetti meat sauce", "bolognese"], 580, 24, 78, 16, 6, 12, 920, 400, "plate", false),
  v("Spaghetti marinara", "pasta", ["marinara pasta", "spaghetti marinara", "red sauce pasta"], 480, 16, 82, 10, 6, 10, 780, 380, "plate", false),
  v("Fettuccine Alfredo", "pasta", ["alfredo", "fettuccine alfredo", "white sauce pasta"], 740, 22, 70, 40, 3, 4, 1100, 380, "plate", false),
  v("Chicken Alfredo", "pasta", ["chicken alfredo"], 860, 42, 72, 44, 3, 4, 1400, 450, "plate", false),
  v("Spaghetti carbonara", "pasta", ["carbonara"], 740, 28, 70, 36, 3, 4, 1100, 380, "plate", false),
  v("Penne alla vodka", "pasta", ["vodka sauce", "penne vodka"], 680, 22, 74, 30, 4, 8, 980, 400, "plate", false),
  v("Pasta primavera", "pasta", ["primavera", "veggie pasta"], 520, 16, 72, 18, 6, 8, 720, 380, "plate", false),
  v("Lasagna", "pasta", ["lasagna"], 600, 32, 48, 30, 4, 10, 1200, 350, "plate", false),
  v("Ravioli", "pasta", ["ravioli", "cheese ravioli"], 520, 22, 56, 20, 4, 8, 980, 300, "plate", false),
  v("Macaroni and cheese", "pasta", ["mac and cheese", "macaroni"], 470, 18, 48, 22, 2, 8, 980, 250, "plate", false),
  v("Baked ziti", "pasta", ["ziti"], 620, 26, 68, 24, 5, 10, 1100, 380, "plate", false),

  v("Garden salad", "salad", ["green salad", "side salad", "house salad"], 150, 4, 12, 10, 4, 5, 220, 200, "bowl", false),
  v("Caesar salad", "salad", ["caesar no chicken"], 290, 8, 16, 22, 2, 2, 680, 220, "bowl", false),
  v("Caesar salad with chicken", "salad", ["chicken caesar"], 470, 32, 18, 30, 3, 3, 980, 300, "bowl", false),
  v("Cobb salad", "salad", ["cobb"], 580, 36, 16, 40, 4, 4, 1100, 360, "bowl", false),
  v("Greek salad", "salad", ["greek"], 320, 10, 14, 24, 4, 6, 780, 280, "bowl", false),
  v("Chef salad", "salad", ["chef salad"], 420, 28, 14, 28, 3, 4, 980, 320, "bowl", false),
  v("Southwest chicken salad", "salad", ["southwest salad", "taco salad"], 540, 34, 36, 28, 8, 6, 1200, 380, "bowl", false),

  v("Beef taco", "taco", ["ground beef taco", "hard shell taco"], 210, 9, 21, 10, 3, 1, 350, 100, "taco", true),
  v("Chicken taco", "taco", ["chicken street taco"], 180, 12, 16, 8, 2, 1, 320, 95, "taco", true),
  v("Steak taco", "taco", ["carne asada taco", "asada taco"], 220, 14, 16, 10, 2, 1, 340, 100, "taco", true),
  v("Carnitas taco", "taco", ["pork taco", "carnitas"], 210, 12, 16, 10, 2, 1, 360, 100, "taco", true),
  v("Al pastor taco", "taco", ["pastor taco"], 200, 11, 17, 9, 2, 2, 350, 98, "taco", true),
  v("Fish taco", "taco", ["fish taco", "baja fish taco"], 230, 12, 22, 10, 2, 2, 380, 120, "taco", true),
  v("Shrimp taco", "taco", ["shrimp taco"], 190, 12, 18, 8, 2, 1, 360, 100, "taco", true),

  v("Chicken burrito", "burrito", ["chicken burrito"], 700, 38, 76, 26, 8, 4, 1580, 380, "burrito", false),
  v("Steak burrito", "burrito", ["steak burrito", "beef burrito"], 760, 42, 74, 30, 8, 4, 1680, 400, "burrito", false),
  v("Bean burrito", "burrito", ["bean and cheese burrito"], 520, 18, 78, 16, 12, 4, 1280, 320, "burrito", false),
  v("Carnitas burrito", "burrito", ["pork burrito"], 740, 36, 74, 30, 8, 4, 1600, 400, "burrito", false),
  v("Breakfast burrito", "burrito", ["egg burrito"], 620, 26, 58, 30, 6, 4, 1400, 340, "burrito", false),

  v("Chicken bowl", "bowl", ["chicken burrito bowl", "chicken rice bowl"], 620, 42, 68, 18, 10, 4, 1400, 450, "bowl", false),
  v("Steak bowl", "bowl", ["steak burrito bowl", "steak rice bowl"], 650, 42, 64, 22, 10, 4, 1400, 470, "bowl", false),
  v("Veggie bowl", "bowl", ["veggie burrito bowl"], 520, 16, 72, 18, 14, 8, 980, 420, "bowl", false),
  v("Poke bowl", "bowl", ["poke", "ahi poke"], 520, 30, 62, 16, 5, 10, 980, 400, "bowl", false),
  v("Bibimbap", "bowl", ["bibimbap"], 580, 24, 78, 18, 6, 10, 980, 500, "bowl", false),
  v("Teriyaki chicken bowl", "bowl", ["teriyaki bowl"], 640, 36, 82, 16, 4, 18, 1400, 480, "bowl", false),

  v("Turkey sandwich", "sandwich", ["turkey sandwich", "turkey deli"], 420, 28, 40, 14, 3, 6, 1100, 220, "sandwich", false),
  v("Ham and cheese sandwich", "sandwich", ["ham sandwich"], 430, 24, 38, 18, 2, 6, 1200, 220, "sandwich", false),
  v("Italian sub", "sandwich", ["italian sandwich", "hoagie", "grinder"], 620, 28, 52, 30, 3, 8, 1680, 280, "sandwich", false),
  v("Club sandwich", "sandwich", ["club"], 620, 36, 48, 30, 3, 8, 1400, 280, "sandwich", false),
  v("BLT sandwich", "sandwich", ["blt"], 430, 16, 34, 24, 2, 6, 980, 180, "sandwich", false),
  v("Tuna sandwich", "sandwich", ["tuna salad sandwich"], 450, 26, 36, 20, 2, 5, 860, 210, "sandwich", false),
  v("Chicken salad sandwich", "sandwich", ["chicken salad sandwich"], 480, 24, 36, 24, 2, 6, 920, 220, "sandwich", false),
  v("Philly cheesesteak", "sandwich", ["cheesesteak", "philly"], 700, 36, 52, 36, 3, 8, 1600, 300, "sandwich", false),
  v("Grilled cheese", "sandwich", ["grilled cheese sandwich"], 400, 16, 32, 24, 2, 6, 860, 140, "sandwich", false),
  v("Breakfast sandwich", "sandwich", ["egg sandwich", "bacon egg cheese"], 480, 24, 34, 26, 2, 4, 1100, 180, "sandwich", false),

  v("Plain pancake", "breakfast", ["pancake", "hotcake"], 140, 3.5, 22, 4, 0.6, 5, 210, 60, "piece", true),
  v("Blueberry pancake", "breakfast", ["blueberry pancake"], 175, 4, 26, 5, 1, 8, 230, 75, "piece", true),
  v("Chocolate chip pancake", "breakfast", ["chocolate chip pancake"], 190, 4, 28, 6, 0.8, 11, 230, 75, "piece", true),
  v("Waffle", "breakfast", ["waffle", "belgian waffle"], 205, 4, 29, 8, 1, 7, 260, 75, "piece", true),
  v("French toast slice", "breakfast", ["french toast"], 180, 6, 22, 7, 1, 8, 220, 70, "piece", true),
  v("Cheese omelette", "breakfast", ["omelette", "omelet"], 350, 22, 4, 26, 0, 2, 620, 180, "serving", false),
  v("Scrambled eggs", "breakfast", ["scrambled egg"], 90, 6, 1, 7, 0, 0.5, 90, 50, "piece", true),
  v("Bacon strip", "breakfast", ["bacon"], 45, 3, 0, 3.5, 0, 0, 150, 12, "piece", true),

  v("French fries", "fries", ["fries", "medium fries"], 365, 4, 48, 17, 4, 0, 250, 117, "serving", false),
  v("Small fries", "fries", ["small fries"], 240, 3, 32, 11, 3, 0, 170, 80, "serving", false),
  v("Large fries", "fries", ["large fries"], 500, 6, 66, 24, 5, 0, 350, 160, "serving", false),
  v("Sweet potato fries", "fries", ["sweet potato fries"], 360, 3, 48, 16, 6, 10, 280, 130, "serving", false),
  v("Curly fries", "fries", ["curly fries"], 400, 5, 50, 20, 4, 1, 420, 130, "serving", false),
  v("Loaded fries", "fries", ["chili cheese fries", "loaded fries"], 620, 16, 58, 34, 5, 4, 980, 220, "serving", false),
  v("Onion rings", "fries", ["onion rings"], 320, 4, 38, 16, 2, 5, 480, 120, "serving", false),

  v("Orange chicken", "asian", ["orange chicken"], 490, 24, 52, 20, 2, 22, 980, 280, "plate", false),
  v("General Tso's chicken", "asian", ["general tso", "general tso chicken"], 520, 24, 54, 22, 2, 24, 1100, 290, "plate", false),
  v("Sesame chicken", "asian", ["sesame chicken"], 500, 24, 50, 22, 2, 20, 980, 280, "plate", false),
  v("Beef and broccoli", "asian", ["beef broccoli"], 420, 28, 28, 20, 4, 8, 1100, 320, "plate", false),
  v("Chicken fried rice", "asian", ["fried rice"], 520, 16, 78, 16, 3, 4, 980, 350, "plate", false),
  v("Lo mein", "asian", ["lo mein", "chicken lo mein"], 560, 20, 72, 20, 4, 8, 1400, 380, "plate", false),
  v("Chow mein", "asian", ["chow mein"], 500, 18, 62, 20, 5, 6, 1200, 340, "plate", false),
  v("Pad Thai", "asian", ["pad thai"], 630, 22, 82, 22, 3, 16, 1400, 400, "plate", false),
  v("Tonkotsu ramen", "asian", ["ramen", "tonkotsu"], 680, 28, 78, 26, 4, 6, 2100, 600, "bowl", false),
  v("Pho", "asian", ["pho", "beef pho"], 450, 30, 52, 12, 2, 6, 1500, 550, "bowl", false),
  v("Butter chicken", "asian", ["butter chicken"], 620, 34, 40, 34, 4, 10, 1100, 400, "plate", false),
  v("Chicken curry", "asian", ["curry"], 560, 32, 42, 28, 6, 8, 980, 400, "plate", false),
  v("Steamed white rice", "asian", ["white rice", "side rice"], 200, 4, 44, 0.4, 0.6, 0, 5, 160, "serving", false),

  v("Grilled ribeye", "steak", ["ribeye", "rib eye"], 680, 54, 0, 50, 0, 0, 160, 240, "serving", false),
  v("Grilled sirloin", "steak", ["sirloin"], 480, 52, 0, 28, 0, 0, 140, 200, "serving", false),
  v("Filet mignon", "steak", ["filet", "filet mignon"], 430, 48, 0, 24, 0, 0, 120, 180, "serving", false),
  v("NY strip steak", "steak", ["ny strip", "new york strip", "strip steak"], 560, 52, 0, 36, 0, 0, 150, 220, "serving", false),

  v("Grilled salmon", "seafood", ["salmon", "grilled salmon"], 412, 40, 0, 27, 0, 0, 90, 170, "serving", false),
  v("Fish and chips", "seafood", ["fried fish", "fish and chips"], 760, 32, 72, 38, 4, 4, 980, 400, "plate", false),
  v("Grilled white fish", "seafood", ["grilled fish", "tilapia", "cod"], 280, 36, 0, 12, 0, 0, 180, 170, "serving", false),
  v("Fried shrimp", "seafood", ["fried shrimp", "popcorn shrimp"], 360, 20, 28, 18, 1, 2, 860, 160, "serving", false),

  v("Chocolate cake slice", "dessert", ["chocolate cake", "cake"], 350, 4, 50, 16, 2, 36, 260, 80, "slice", true),
  v("Cheesecake slice", "dessert", ["cheesecake"], 400, 7, 32, 28, 1, 26, 260, 125, "slice", true),
  v("Apple pie slice", "dessert", ["apple pie", "pie"], 320, 3, 46, 14, 2, 24, 220, 125, "slice", true),
  v("Brownie", "dessert", ["brownie"], 240, 3, 32, 12, 1, 22, 140, 60, "piece", true),
  v("Ice cream scoop", "dessert", ["ice cream"], 140, 2.5, 16, 7, 0, 14, 45, 60, "piece", true),
  v("Glazed donut", "dessert", ["donut", "doughnut"], 270, 3, 31, 15, 1, 14, 250, 75, "piece", true),
  v("Chocolate chip cookie", "dessert", ["cookie"], 160, 2, 22, 8, 0.6, 12, 110, 40, "piece", true),

  v("Tomato soup", "soup", ["tomato soup"], 180, 4, 28, 6, 3, 14, 780, 300, "bowl", false),
  v("Clam chowder", "soup", ["chowder", "clam chowder"], 280, 12, 24, 14, 1, 4, 980, 300, "bowl", false),
  v("Chicken noodle soup", "soup", ["chicken noodle"], 160, 10, 18, 4, 1, 2, 860, 300, "bowl", false),

  v("Nachos with cheese", "nachos", ["nachos", "cheese nachos"], 650, 18, 62, 36, 6, 4, 980, 250, "plate", false),
  v("Loaded nachos", "nachos", ["supreme nachos", "beef nachos"], 820, 28, 68, 46, 8, 6, 1400, 320, "plate", false),
  v("Chicken quesadilla", "nachos", ["quesadilla"], 580, 32, 42, 30, 3, 3, 1200, 220, "serving", false),
  v("Steak quesadilla", "nachos", ["steak quesadilla"], 640, 36, 42, 34, 3, 3, 1320, 240, "serving", false),
];

const ADDONS: FamilyVariant[] = [
  v("French fries", "fries", ["fries"], 365, 4, 48, 17, 4, 0, 250, 117, "side", false),
  v("Bacon", "burger", ["bacon strips"], 90, 6, 0, 7, 0, 0, 300, 24, "side", false),
  v("Fried egg", "breakfast", ["egg on top"], 90, 6, 0.4, 7, 0, 0.4, 90, 50, "side", false),
  v("Avocado", "salad", ["avocado slices"], 80, 1, 4, 7, 3, 0.3, 4, 50, "side", false),
  v("Extra cheese", "burger", ["slice of cheese"], 70, 4, 0.5, 6, 0, 0.4, 180, 20, "side", false),
  v("Sour cream", "taco", ["sour cream"], 60, 1, 1, 6, 0, 1, 15, 30, "side", false),
  v("Guacamole", "taco", ["guac"], 80, 1, 4, 7, 3, 0.4, 70, 50, "side", false),
  v("Ranch dressing", "salad", ["ranch"], 140, 1, 2, 14, 0, 1, 280, 30, "side", false),
  v("Maple syrup", "breakfast", ["syrup"], 110, 0, 28, 0, 0, 24, 4, 40, "side", false),
  v("Steamed white rice", "asian", ["rice"], 200, 4, 44, 0.4, 0.6, 0, 5, 160, "side", false),
];

const FAMILY_GUIDE: Record<FoodFamily, string> = {
  pizza:
    "Name the pizza from toppings: cheese only, pepperoni (red rounds), sausage, supreme/deluxe, meat lovers, Hawaiian (ham + pineapple), veggie, margherita (basil + tomato), BBQ chicken, white/alfredo. Count slices. Note thin/regular/stuffed crust if obvious. Never answer only “pizza”.",
  burger:
    "Say hamburger vs cheeseburger vs bacon cheeseburger vs double. Count patties (single/double) and how many burgers are on the plate. Cheese = yellow/white slice. Bacon = dark strips. Lettuce/tomato/onion/pickles are toppings. A chicken patty in a bun is a chicken sandwich, not a burger.",
  chicken:
    "Say fried vs grilled vs rotisserie vs tenders vs nuggets vs sandwich. Fried = craggy breading. Grilled = grill marks, no heavy breading. Count pieces or tenders. Breast / thigh / drumstick / wing if you can tell. Do not call pancakes chicken.",
  wings:
    "Count every wing. Sauce if visible: buffalo (orange-red wet), BBQ (dark brown shine), garlic parmesan (pale specks), lemon pepper (dry yellow). Bone-in vs boneless.",
  pasta:
    "Name sauce + protein: marinara/red, meat sauce/bolognese, alfredo/white, carbonara (egg/pepper/pancetta), vodka, pesto, primavera. Shape: spaghetti, fettuccine, penne, lasagna, ravioli, mac and cheese. Chicken or shrimp on top if visible.",
  salad:
    "Name the salad: garden/house, Caesar (romaine + croutons + white dressing), Cobb (rows of bacon/egg/avocado/blue cheese), Greek (feta/olive/cucumber), chef, southwest. Protein on top (chicken, shrimp, steak) if visible. Dressing if you can see it.",
  taco:
    "Count tacos. Protein: beef, chicken, steak/asada, carnitas, al pastor (reddish pork + pineapple), fish, shrimp. Hard shell vs soft corn/flour. Toppings: onion, cilantro, cheese, lettuce, salsa, sour cream, guacamole.",
  burrito:
    "Protein + style: chicken, steak, carnitas, bean and cheese, breakfast (egg). Size from how thick/long it is. Foil-wrapped still counts as a burrito.",
  bowl:
    "Name the bowl: chicken/steak/veggie burrito bowl, poke, bibimbap, teriyaki. Visible bases (rice, greens) and toppings (beans, corn, salsa, avocado, egg).",
  sandwich:
    "Name the sandwich: turkey, ham and cheese, Italian sub, club, BLT, tuna, chicken salad, grilled cheese, cheesesteak, breakfast. Bread type if obvious. Not a burger unless there is a ground patty.",
  breakfast:
    "Pancakes vs waffles (grid) vs French toast vs omelette vs scrambled eggs. Count pancakes, waffle rounds, toast slices, eggs, bacon strips. Toppings: blueberries, chocolate chips, syrup, butter, fruit.",
  fries:
    "Straight fries vs curly vs sweet potato vs loaded (cheese/chili) vs onion rings vs tots. Small / medium / large from the pile or carton.",
  asian:
    "Name the dish: orange chicken, General Tso, sesame chicken, beef and broccoli, fried rice, lo mein, chow mein, pad Thai, ramen, pho, curry, butter chicken. Rice on the side if visible (add it as its own group).",
  steak:
    "Cut if you can: ribeye (more fat), sirloin, NY strip, filet. Grill marks. Butter/herb on top. Sides only if visible.",
  seafood:
    "Grilled salmon (orange-pink) vs white fish vs fried fish + fries vs fried shrimp. Do not call sushi salmon a salmon dinner unless it is a cooked fillet.",
  dessert:
    "Cake vs cheesecake vs pie vs brownie vs cookie vs donut vs ice cream. Count slices, scoops, or cookies.",
  soup:
    "Tomato, chicken noodle, clam chowder, or other if the color/toppings give it away. Bowl vs cup.",
  nachos:
    "Plain cheese nachos vs loaded (meat, jalapeño, sour cream) vs quesadilla (folded tortilla, not chips).",
};

export function detectFoodFamily(...parts: string[]): FoodFamily | null {
  const blob = parts.filter(Boolean).join(" ");
  if (looksLikeSushi(blob)) return null;
  for (const [family, pattern] of FAMILY_MATCH) {
    if (pattern.test(blob)) return family;
  }
  return null;
}

export function familyInspectPrompt(family: FoodFamily) {
  return `This photo is ${family.replaceAll("_", " ")}. Do a close look. Do not invent calories.

${FAMILY_GUIDE[family]}

Split every distinct food into its own group (main + visible sides).
Count units you can see (slices, tacos, wings, pancakes, tenders, burgers).
List only toppings / extras that are visible.
Never answer with only the generic family name.

Return JSON only:
{"family":"${family}","totalCount":0,"groups":[{"name":"specific name","toppings":[],"extras":[],"count":1,"unit":"slice","notes":"what you see"}]}`;
}

export function parseFamilyInspection(
  text: string,
  fallback: FoodFamily,
): { family: FoodFamily; groups: FamilyGroup[]; totalCount: number } {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return { family: fallback, groups: [], totalCount: 0 };
  try {
    const parsed = JSON.parse(text.slice(start, end + 1).replace(/,\s*([}\]])/g, "$1")) as {
      family?: string;
      totalCount?: number;
      groups?: unknown[];
      items?: unknown[];
    };
    const family = parseFamily(parsed.family) ?? fallback;
    const rows = Array.isArray(parsed.groups)
      ? parsed.groups
      : Array.isArray(parsed.items)
        ? parsed.items
        : [];
    const groups = rows
      .map((row) => groupFromUnknown(row, family))
      .filter((group): group is FamilyGroup => Boolean(group));
    const counted = groups.reduce((sum, group) => sum + Math.max(group.count, 0), 0);
    return { family, groups, totalCount: Number(parsed.totalCount) || counted };
  } catch {
    return { family: fallback, groups: [], totalCount: 0 };
  }
}

export function groupsFromFamilyIdentity(options: {
  family: FoodFamily;
  mealName: string;
  lookClues?: string;
  items: Array<{
    name: string;
    notes: string;
    size: PortionSize;
    pieces?: number;
    fillings?: string[];
  }>;
}): FamilyGroup[] {
  const groups = options.items.map((item) => {
    const toppings = item.fillings?.length
      ? item.fillings
      : inferToppings(`${item.name} ${item.notes} ${options.lookClues ?? ""}`, options.family);
    return {
      name: specificName(item.name, options.family, toppings),
      family: detectFoodFamily(item.name, item.notes) ?? options.family,
      toppings,
      extras: inferExtras(`${item.name} ${item.notes}`),
      count: item.pieces && item.pieces > 0 ? item.pieces : parseFamilyCount(`${item.name} ${item.notes}`),
      unit: unitFor(options.family),
      notes: item.notes,
    } satisfies FamilyGroup;
  });
  if (groups.length > 0) return groups;
  const toppings = inferToppings(`${options.mealName} ${options.lookClues ?? ""}`, options.family);
  return [
    {
      name: specificName(options.mealName, options.family, toppings),
      family: options.family,
      toppings,
      extras: inferExtras(`${options.mealName} ${options.lookClues ?? ""}`),
      count: parseFamilyCount(`${options.mealName} ${options.lookClues ?? ""}`),
      unit: unitFor(options.family),
      notes: options.lookClues ?? "",
    },
  ];
}

export function foodItemsFromFamilyGroups(
  groups: FamilyGroup[],
  fallbackSize: PortionSize,
) {
  const rows: Array<{
    name: string;
    notes: string;
    estimatedGrams: number;
    size: PortionSize;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
    sugarG: number;
    sodiumMg: number;
    toppings: string[];
    count: number;
    unit: string;
  }> = [];

  for (const group of groups) {
    const variant = matchFamilyVariant(group.name, group.toppings, group.family);
    const count = resolvedCount(group, variant, fallbackSize);
    const counted = group.count > 0;
    const scale = variant.perUnit ? count : 1;
    rows.push({
      name: variant.name,
      notes: [
        counted
          ? `Counted ${count} ${plural(group.unit || variant.unit, count)}.`
          : `Assumed ${count} ${plural(variant.unit, count)} for a ${SIZE_LABEL[fallbackSize].toLowerCase()} ${group.family}.`,
        group.toppings.length ? `Seen: ${group.toppings.join(", ")}.` : `Named the ${group.family} type from the photo.`,
        group.notes,
      ]
        .filter(Boolean)
        .join(" "),
      estimatedGrams: Math.round(variant.grams * scale),
      size: fallbackSize,
      calories: Math.round(variant.calories * scale),
      proteinG: round1(variant.proteinG * scale),
      carbsG: round1(variant.carbsG * scale),
      fatG: round1(variant.fatG * scale),
      fiberG: round1(variant.fiberG * scale),
      sugarG: round1(variant.sugarG * scale),
      sodiumMg: Math.round(variant.sodiumMg * scale),
      toppings: group.toppings,
      count,
      unit: variant.unit,
    });

    for (const extra of group.extras) {
      const addon = matchAddon(extra);
      if (!addon) continue;
      if (rows.some((row) => normalize(row.name) === normalize(addon.name))) continue;
      rows.push({
        name: addon.name,
        notes: `Visible extra: ${extra}.`,
        estimatedGrams: addon.grams,
        size: fallbackSize,
        calories: addon.calories,
        proteinG: addon.proteinG,
        carbsG: addon.carbsG,
        fatG: addon.fatG,
        fiberG: addon.fiberG,
        sugarG: addon.sugarG,
        sodiumMg: addon.sodiumMg,
        toppings: [extra],
        count: 1,
        unit: "side",
      });
    }
  }
  return rows;
}

export function matchFamilyVariant(
  name: string,
  toppings: string[],
  family: FoodFamily,
): FamilyVariant {
  const blob = normalize(`${name} ${toppings.join(" ")}`);
  const pool = FAMILY_VARIANTS.filter((item) => item.family === family);
  let best: { variant: FamilyVariant; score: number } | null = null;
  for (const variant of pool) {
    const hay = normalize(`${variant.name} ${variant.aliases.join(" ")}`);
    let score = 0;
    if (hay === blob || normalize(variant.name) === normalize(name)) score += 8;
    for (const alias of [variant.name, ...variant.aliases]) {
      const needle = normalize(alias);
      if (needle && (blob.includes(needle) || needle.includes(normalize(name)))) score += 3;
    }
    for (const topping of toppings) {
      if (hay.includes(normalize(topping))) score += 2.4;
    }
    if (!best || score > best.score) best = { variant, score };
  }
  if (best && best.score >= 3) return best.variant;
  return pool[0] ?? FAMILY_VARIANTS[0];
}

export function shouldMultiplyByCount(
  name: string,
  variantName: string,
  calories: number,
  count: number,
) {
  if (count <= 1) return false;
  const blob = `${name} ${variantName}`;
  if (looksLikeSushi(blob)) return calories <= 120 || /piece|slice/i.test(variantName);
  if (/\b(slice|taco|wing|pancake|waffle|tender|nugget|drumstick|piece)\b/i.test(blob)) {
    return calories <= 420;
  }
  return calories <= 160 && count <= 24;
}

export function parseFamilyCount(text: string, fallback = 0) {
  const raw = text.toLowerCase();
  const patterns = [
    /(\d{1,2})\s*(?:slices?|tacos?|wings?|pancakes?|waffles?|tenders?|nuggets?|pieces?|pcs?|pc|eggs?|strips?|scoops?|cookies?|burgers?)/i,
    /counted\s+(\d{1,2})/i,
    /assumed\s+(\d{1,2})/i,
  ];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (!match) continue;
    const n = Number(match[1]);
    if (n >= 1 && n <= 48) return n;
  }
  return fallback;
}

export function familyUnitHits(name: string, notes: string, family: FoodFamily | null) {
  if (!family) return [];
  const toppings = inferToppings(`${name} ${notes}`, family);
  const variant = matchFamilyVariant(name, toppings, family);
  return [
    {
      name: `${variant.name} (1 ${variant.unit})`,
      calories: variant.calories,
      proteinG: variant.proteinG,
      carbsG: variant.carbsG,
      fatG: variant.fatG,
      fiberG: variant.fiberG,
      sugarG: variant.sugarG,
      sodiumMg: variant.sodiumMg,
      grams: variant.grams,
      source: `${title(family)} ${variant.perUnit ? "per-unit" : "typical plate"} table`,
      url: "https://fdc.nal.usda.gov/",
    },
  ];
}

function specificName(name: string, family: FoodFamily, toppings: string[]) {
  const cleaned = name.trim();
  if (cleaned && !isGenericFamilyName(cleaned, family)) return cleaned;
  const main = toppings.find((item) => !["cheese", "rice", "lettuce", "sauce"].includes(item));
  if (main) return `${title(main)} ${family === "pizza" ? "pizza" : family === "taco" ? "taco" : cleaned || family}`;
  return cleaned || title(family);
}

function isGenericFamilyName(name: string, family: FoodFamily) {
  return normalize(name) === family || normalize(name) === `${family}s` || normalize(name) === `the ${family}`;
}

function inferToppings(text: string, family: FoodFamily): string[] {
  const raw = text.toLowerCase();
  const found: string[] = [];
  const add = (label: string, pattern: RegExp) => {
    if (pattern.test(raw) && !found.includes(label)) found.push(label);
  };
  add("pepperoni", /\bpepperoni\b/);
  add("sausage", /\bsausage\b/);
  add("bacon", /\bbacon\b/);
  add("cheese", /\bcheese|cheddar|swiss|american|mozzarella\b/);
  add("mushroom", /\bmushroom/);
  add("pineapple", /\bpineapple|hawaiian\b/);
  add("ham", /\bham\b/);
  add("chicken", /\bchicken\b/);
  add("steak", /\b(steak|asada|sirloin|ribeye)\b/);
  add("beef", /\b(beef|ground beef)\b/);
  add("pork", /\b(pork|carnitas|pastor)\b/);
  add("shrimp", /\bshrimp\b/);
  add("fish", /\bfish\b/);
  add("avocado", /\bavocado|guac/);
  add("egg", /\begg|omelette|omelet\b/);
  add("blueberry", /\bblueberr/);
  add("chocolate chip", /\bchocolate chip\b/);
  add("buffalo", /\bbuffalo|hot sauce\b/);
  add("bbq", /\bbbq|barbecue\b/);
  add("alfredo", /\balfredo|white sauce\b/);
  add("marinara", /\bmarinara|red sauce\b/);
  add("meat sauce", /\b(meat sauce|bolognese)\b/);
  add("lettuce", /\blettuce\b/);
  add("tomato", /\btomato/);
  add("onion", /\bonion/);
  add("cilantro", /\bcilantro\b/);
  if (family === "pizza" && found.length === 0 && /\bcheese\b/.test(raw)) found.push("cheese");
  return found;
}

function inferExtras(text: string): string[] {
  const raw = text.toLowerCase();
  const extras: string[] = [];
  const add = (label: string, pattern: RegExp) => {
    if (pattern.test(raw) && !extras.includes(label)) extras.push(label);
  };
  add("fries", /\bfries\b/);
  add("ranch", /\branch\b/);
  add("syrup", /\bsyrup\b/);
  add("rice", /\b(white rice|side of rice|rice on the side)\b/);
  add("sour cream", /\bsour cream\b/);
  add("guacamole", /\bguac|\bguacamole\b/);
  add("avocado", /\bavocado\b/);
  add("fried egg", /\bfried egg|egg on top\b/);
  return extras;
}

function resolvedCount(group: FamilyGroup, variant: FamilyVariant, size: PortionSize) {
  if (group.count > 0) return group.count;
  if (!variant.perUnit) return 1;
  if (variant.family === "pizza") return size === "small" ? 1 : size === "large" ? 4 : 2;
  if (variant.family === "taco") return size === "small" ? 2 : size === "large" ? 5 : 3;
  if (variant.family === "wings") return size === "small" ? 6 : size === "large" ? 12 : 8;
  if (variant.family === "breakfast" && variant.unit === "piece") {
    return size === "small" ? 2 : size === "large" ? 4 : 3;
  }
  if (variant.family === "chicken" && variant.perUnit) {
    return size === "small" ? 2 : size === "large" ? 4 : 3;
  }
  return 1;
}

function unitFor(family: FoodFamily) {
  if (family === "pizza" || family === "dessert") return "slice";
  if (family === "taco") return "taco";
  if (family === "wings") return "wing";
  if (family === "breakfast") return "piece";
  if (family === "burger") return "burger";
  return "piece";
}

function matchAddon(extra: string) {
  const needle = normalize(extra);
  return (
    ADDONS.find(
      (item) =>
        normalize(item.name) === needle ||
        item.aliases.some((alias) => normalize(alias) === needle || needle.includes(normalize(alias))),
    ) ?? null
  );
}

function groupFromUnknown(row: unknown, family: FoodFamily): FamilyGroup | null {
  if (!row || typeof row !== "object") return null;
  const value = row as Record<string, unknown>;
  const name = String(value.name ?? "").trim();
  const notes = String(value.notes ?? "");
  const toppings = Array.isArray(value.toppings)
    ? value.toppings.map((item) => String(item).toLowerCase().trim()).filter(Boolean)
    : Array.isArray(value.fillings)
      ? value.fillings.map((item) => String(item).toLowerCase().trim()).filter(Boolean)
      : inferToppings(`${name} ${notes}`, family);
  const extras = Array.isArray(value.extras)
    ? value.extras.map((item) => String(item).toLowerCase().trim()).filter(Boolean)
    : inferExtras(`${name} ${notes}`);
  const count = Math.max(
    0,
    Math.min(48, Number(value.count ?? value.pieces ?? parseFamilyCount(`${name} ${notes}`, 0))),
  );
  if (!name && toppings.length === 0) return null;
  const itemFamily = parseFamily(value.family) ?? detectFoodFamily(name, notes) ?? family;
  return {
    name: specificName(name || title(itemFamily), itemFamily, toppings),
    family: itemFamily,
    toppings,
    extras,
    count,
    unit: String(value.unit ?? unitFor(itemFamily)),
    notes,
  };
}

function parseFamily(value: unknown): FoodFamily | null {
  const raw = String(value ?? "").toLowerCase();
  return FAMILY_MATCH.some(([family]) => family === raw) ? (raw as FoodFamily) : null;
}

function plural(unit: string, count: number) {
  if (count === 1) return unit;
  if (unit.endsWith("s")) return unit;
  return `${unit}s`;
}

function title(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function v(
  name: string,
  family: FoodFamily,
  aliases: string[],
  calories: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
  fiberG: number,
  sugarG: number,
  sodiumMg: number,
  grams: number,
  unit: string,
  perUnit: boolean,
): FamilyVariant {
  return {
    name,
    family,
    aliases,
    calories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    sugarG,
    sodiumMg,
    grams,
    unit,
    perUnit,
  };
}
