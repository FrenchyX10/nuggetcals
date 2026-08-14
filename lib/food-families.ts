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
  | "nachos"
  | "indian"
  | "mexican"
  | "mediterranean"
  | "texmex"
  | "texan"
  | "california";

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
  [
    "texmex",
    /\b(tex-?mex|tex mex|chili con carne|chile con queso|queso|frito pie|taco salad|puffy taco|combo plate|chili cheese)\b/,
  ],
  [
    "texan",
    /\b(brisket|burnt ends|chicken fried steak|chicken fried chicken|kolaches?|texas toast|pecan pie|hot links|smoked sausage|pulled pork|pork ribs|beef ribs|bbq plate|texan|texas bbq|barbecue plate)\b/,
  ],
  [
    "california",
    /\b(california burrito|acai|açaí|avocado toast|cioppino|sourdough|turkey avocado|kale salad|smoothie bowl|grain bowl|californian|california food|mission-style)\b/,
  ],
  [
    "mexican",
    /\b(enchiladas?|fajitas?|tamales?|tostadas?|chimichanga|chile relleno|mole|elote|flautas?|carne asada|pozole|horchata|mexican)\b/,
  ],
  [
    "indian",
    /\b(tikka|masala|biryani|samosas?|naan|dal|tandoori|vindaloo|palak|paneer|chana|dosa|korma|saag|roti|butter chicken|curry|indian)\b/,
  ],
  [
    "mediterranean",
    /\b(gyro|shawarma|falafel|hummus|kebabs?|souvlaki|moussaka|tabbouleh|baba ganoush|dolmas?|baklava|pita|mediterranean|greek plate)\b/,
  ],
  ["burger", /\b(burgers?|hamburgers?|cheeseburgers?|whopper|baconator)\b/],
  ["breakfast", /\b(pancakes?|waffles?|french toast|omelettes?|omelets?|hotcakes?|flapjacks?|scrambled eggs?)\b/],
  ["pasta", /\b(pasta|spaghetti|fettuccine|penne|linguine|lasagna|ravioli|alfredo|carbonara|bolognese|ziti|macaroni)\b/],
  ["salad", /\b(salads?|caesar|cobb salad)\b/],
  ["bowl", /\b(bowl|poke|bibimbap)\b/],
  ["sandwich", /\b(sandwich|sub|hoagie|cheesesteak|blt|panini|wrap)\b/],
  ["fries", /\b(fries|frites|poutine|onion rings|tater tots)\b/],
  ["steak", /\b(steak|ribeye|sirloin|filet mignon|ny strip|new york strip)\b/],
  [
    "seafood",
    /\b(salmon|fish and chips|grilled fish|fried fish|cod|tilapia|fish fillet|shrimp|lobster|crab|calamari|mussels?|clams?|ceviche|scampi|tuna steak|octopus|seafood)\b/,
  ],
  [
    "asian",
    /\b(ramen|pho|pad thai|fried rice|orange chicken|general tso|sesame chicken|lo mein|chow mein|kung pao|katsu|udon|bulgogi|gyoza|dumpling|spring roll|egg roll|mapo|teriyaki|pad see ew|thai|korean|chinese|vietnamese|japanese|asian)\b/,
  ],
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

  v("Chicken burrito", "burrito", ["chicken burrito"], 1050, 48, 96, 38, 11, 4, 2100, 480, "burrito", false),
  v("Steak burrito", "burrito", ["steak burrito"], 1100, 50, 94, 40, 11, 4, 2200, 500, "burrito", false),
  v("Beef burrito", "burrito", ["beef burrito"], 1100, 50, 94, 40, 11, 4, 2200, 500, "burrito", false),
  v("Bean burrito", "burrito", ["bean and cheese burrito"], 680, 22, 92, 22, 14, 4, 1600, 400, "burrito", false),
  v("Carnitas burrito", "burrito", ["pork burrito"], 1100, 46, 94, 44, 11, 4, 2200, 500, "burrito", false),
  v("Breakfast burrito", "burrito", ["egg burrito"], 780, 32, 72, 36, 8, 4, 1700, 400, "burrito", false),

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
  v("Kung pao chicken", "asian", ["kung pao"], 480, 26, 36, 22, 4, 12, 1100, 300, "plate", false),
  v("Sweet and sour chicken", "asian", ["sweet and sour"], 540, 22, 62, 22, 2, 28, 980, 320, "plate", false),
  v("Beef and broccoli", "asian", ["beef broccoli"], 420, 28, 28, 20, 4, 8, 1100, 320, "plate", false),
  v("Mongolian beef", "asian", ["mongolian beef"], 500, 28, 36, 24, 2, 16, 1400, 320, "plate", false),
  v("Mapo tofu", "asian", ["mapo tofu"], 380, 16, 18, 26, 4, 6, 980, 300, "plate", false),
  v("Chicken fried rice", "asian", ["fried rice", "chicken fried rice"], 520, 16, 78, 16, 3, 4, 980, 350, "plate", false),
  v("Shrimp fried rice", "asian", ["shrimp fried rice"], 500, 18, 74, 14, 3, 4, 1100, 340, "plate", false),
  v("Lo mein", "asian", ["lo mein", "chicken lo mein"], 560, 20, 72, 20, 4, 8, 1400, 380, "plate", false),
  v("Chow mein", "asian", ["chow mein"], 500, 18, 62, 20, 5, 6, 1200, 340, "plate", false),
  v("Pad Thai", "asian", ["pad thai"], 630, 22, 82, 22, 3, 16, 1400, 400, "plate", false),
  v("Pad see ew", "asian", ["pad see ew"], 610, 20, 80, 22, 4, 12, 1400, 400, "plate", false),
  v("Drunken noodles", "asian", ["pad kee mao", "drunken noodles"], 640, 22, 78, 24, 4, 14, 1500, 400, "plate", false),
  v("Green curry", "asian", ["thai green curry"], 540, 22, 36, 32, 4, 10, 1200, 380, "plate", false),
  v("Tonkotsu ramen", "asian", ["ramen", "tonkotsu"], 680, 28, 78, 26, 4, 6, 2100, 600, "bowl", false),
  v("Shoyu ramen", "asian", ["shoyu ramen"], 520, 22, 70, 16, 3, 4, 1800, 550, "bowl", false),
  v("Pho", "asian", ["pho", "beef pho"], 450, 30, 52, 12, 2, 6, 1500, 550, "bowl", false),
  v("Chicken pho", "asian", ["chicken pho"], 400, 26, 50, 10, 2, 6, 1400, 520, "bowl", false),
  v("Chicken katsu", "asian", ["katsu", "tonkatsu"], 620, 32, 58, 26, 2, 8, 1200, 360, "plate", false),
  v("Udon", "asian", ["udon"], 500, 16, 82, 12, 4, 6, 1600, 500, "bowl", false),
  v("Bulgogi", "asian", ["bulgogi", "korean bbq"], 520, 32, 28, 28, 2, 12, 1100, 320, "plate", false),
  v("Japchae", "asian", ["japchae"], 440, 10, 68, 14, 4, 12, 980, 300, "plate", false),
  v("Teriyaki chicken", "asian", ["teriyaki chicken"], 480, 36, 42, 16, 2, 18, 1200, 320, "plate", false),
  v("Gyoza piece", "asian", ["gyoza", "potsticker", "dumpling"], 50, 2.2, 6, 2, 0.3, 0.6, 120, 26, "piece", true),
  v("Spring roll", "asian", ["spring roll", "fresh spring roll"], 80, 2, 12, 2, 1, 2, 180, 50, "piece", true),
  v("Egg roll", "asian", ["egg roll"], 200, 6, 20, 10, 2, 2, 400, 80, "piece", true),
  v("Steamed white rice", "asian", ["white rice", "side rice"], 200, 4, 44, 0.4, 0.6, 0, 5, 160, "serving", false),

  v("Chicken tikka masala", "indian", ["tikka masala"], 640, 36, 28, 38, 4, 10, 1200, 400, "plate", false),
  v("Butter chicken", "indian", ["butter chicken", "murgh makhani"], 620, 34, 24, 38, 3, 10, 1100, 380, "plate", false),
  v("Chicken curry", "indian", ["chicken curry"], 560, 32, 22, 32, 4, 8, 980, 360, "plate", false),
  v("Lamb curry", "indian", ["lamb curry", "rogan josh"], 580, 32, 16, 38, 3, 6, 1100, 360, "plate", false),
  v("Chicken vindaloo", "indian", ["vindaloo"], 540, 34, 18, 30, 4, 6, 1200, 360, "plate", false),
  v("Chicken korma", "indian", ["korma"], 650, 30, 22, 44, 3, 8, 980, 380, "plate", false),
  v("Tandoori chicken", "indian", ["tandoori"], 320, 42, 6, 14, 1, 3, 780, 220, "plate", false),
  v("Chicken biryani", "indian", ["biryani", "chicken biryani"], 680, 32, 82, 22, 4, 6, 1400, 450, "plate", false),
  v("Lamb biryani", "indian", ["lamb biryani"], 740, 34, 80, 28, 4, 6, 1500, 470, "plate", false),
  v("Palak paneer", "indian", ["saag paneer", "palak paneer"], 480, 18, 16, 36, 5, 6, 860, 320, "plate", false),
  v("Chana masala", "indian", ["chana masala", "chickpea curry"], 420, 16, 52, 14, 12, 8, 980, 340, "plate", false),
  v("Dal", "indian", ["dal tadka", "lentil curry", "dal"], 280, 14, 36, 8, 10, 4, 720, 280, "bowl", false),
  v("Malai kofta", "indian", ["kofta"], 540, 14, 32, 38, 5, 10, 980, 340, "plate", false),
  v("Masala dosa", "indian", ["dosa"], 280, 8, 46, 8, 4, 2, 620, 220, "piece", false),
  v("Samosa", "indian", ["samosa"], 250, 5, 28, 14, 3, 2, 380, 80, "piece", true),
  v("Naan", "indian", ["naan", "plain naan"], 260, 8, 45, 6, 2, 3, 480, 90, "piece", true),
  v("Garlic naan", "indian", ["garlic naan"], 320, 8, 46, 12, 2, 3, 560, 100, "piece", true),
  v("Roti", "indian", ["roti", "chapati"], 120, 4, 20, 3, 2, 1, 180, 40, "piece", true),

  v("Chicken enchilada", "mexican", ["chicken enchilada"], 240, 14, 20, 12, 3, 2, 620, 140, "piece", true),
  v("Beef enchilada", "mexican", ["beef enchilada"], 260, 14, 20, 14, 3, 2, 680, 150, "piece", true),
  v("Cheese enchilada", "mexican", ["cheese enchilada"], 220, 10, 18, 12, 2, 2, 580, 130, "piece", true),
  v("Chicken fajitas", "mexican", ["chicken fajitas", "fajitas"], 520, 38, 36, 22, 6, 6, 1400, 380, "plate", false),
  v("Steak fajitas", "mexican", ["steak fajitas"], 580, 40, 34, 26, 6, 6, 1500, 400, "plate", false),
  v("Tamale", "mexican", ["tamale"], 280, 10, 28, 14, 3, 2, 620, 140, "piece", true),
  v("Chile relleno", "mexican", ["chile relleno"], 420, 18, 24, 28, 3, 4, 860, 220, "piece", false),
  v("Chimichanga", "mexican", ["chimichanga"], 780, 32, 62, 42, 6, 4, 1600, 360, "piece", false),
  v("Tostada", "mexican", ["tostada"], 350, 16, 32, 16, 6, 3, 720, 180, "piece", true),
  v("Carne asada plate", "mexican", ["carne asada"], 620, 42, 36, 30, 4, 4, 980, 380, "plate", false),
  v("Chicken mole", "mexican", ["mole"], 540, 32, 40, 24, 4, 12, 1100, 360, "plate", false),
  v("Street corn", "mexican", ["elote", "mexican street corn"], 220, 6, 22, 12, 3, 6, 380, 160, "piece", true),
  v("Huevos rancheros", "mexican", ["huevos rancheros"], 480, 22, 36, 26, 6, 4, 980, 320, "plate", false),
  v("Pozole", "mexican", ["pozole"], 380, 22, 36, 12, 6, 4, 1100, 420, "bowl", false),

  v("Chili con carne", "texmex", ["chili", "texas chili", "bowl of chili"], 380, 24, 22, 20, 6, 6, 980, 340, "bowl", false),
  v("Chile con queso", "texmex", ["queso", "cheese dip"], 280, 12, 12, 20, 1, 3, 720, 180, "bowl", false),
  v("Chili cheese nachos", "texmex", ["chili nachos", "chili cheese nachos"], 780, 26, 68, 42, 8, 6, 1400, 320, "plate", false),
  v("Taco salad", "texmex", ["taco salad"], 620, 28, 48, 34, 8, 6, 1200, 380, "bowl", false),
  v("Frito pie", "texmex", ["frito pie", "walking taco"], 520, 18, 48, 28, 6, 4, 980, 280, "bowl", false),
  v("Tex-Mex combo plate", "texmex", ["combo plate", "enchilada combo"], 860, 38, 78, 40, 10, 8, 1800, 520, "plate", false),
  v("Sour cream chicken enchilada", "texmex", ["sour cream enchilada"], 280, 16, 20, 16, 2, 3, 680, 160, "piece", true),
  v("Puffy taco", "texmex", ["puffy taco"], 240, 12, 18, 13, 2, 1, 420, 110, "taco", true),
  v("Beef fajitas", "texmex", ["tex mex fajitas"], 600, 40, 34, 28, 6, 6, 1500, 400, "plate", false),

  v("Sliced brisket plate", "texan", ["brisket", "beef brisket", "bbq brisket"], 620, 48, 12, 40, 1, 8, 980, 280, "plate", false),
  v("Brisket sandwich", "texan", ["brisket sandwich"], 680, 42, 48, 32, 2, 10, 1400, 320, "sandwich", false),
  v("Pork ribs", "texan", ["pork ribs", "spare ribs", "st louis ribs"], 680, 42, 16, 48, 0, 12, 980, 320, "plate", false),
  v("Beef ribs", "texan", ["beef ribs", "dino ribs"], 820, 52, 8, 62, 0, 6, 1100, 380, "plate", false),
  v("Pulled pork plate", "texan", ["pulled pork", "chopped pork"], 580, 40, 20, 34, 1, 14, 1200, 300, "plate", false),
  v("Smoked sausage", "texan", ["hot links", "bbq sausage"], 420, 18, 4, 36, 0, 2, 1100, 160, "piece", false),
  v("Burnt ends", "texan", ["burnt ends"], 540, 36, 12, 38, 0, 10, 980, 220, "plate", false),
  v("Chicken fried steak", "texan", ["chicken fried steak", "cfs"], 760, 38, 48, 44, 2, 4, 1600, 360, "plate", false),
  v("Chicken fried chicken", "texan", ["chicken fried chicken"], 680, 42, 42, 36, 2, 4, 1400, 340, "plate", false),
  v("BBQ plate", "texan", ["bbq plate", "barbecue plate", "two meat plate"], 920, 58, 28, 58, 2, 16, 1800, 480, "plate", false),
  v("Texas toast", "texan", ["texas toast"], 180, 4, 22, 8, 1, 2, 280, 50, "piece", true),
  v("Kolache", "texan", ["kolache", "klobasnek"], 280, 10, 32, 12, 1, 6, 520, 90, "piece", true),
  v("Pecan pie slice", "texan", ["pecan pie"], 500, 6, 64, 26, 2, 34, 260, 130, "slice", true),
  v("BBQ baked beans", "texan", ["baked beans"], 220, 8, 38, 4, 6, 16, 620, 180, "side", false),

  v("California burrito", "california", ["cali burrito", "california burrito"], 880, 42, 82, 38, 8, 6, 1680, 480, "burrito", false),
  v("Avocado toast", "california", ["avocado toast"], 350, 8, 32, 22, 8, 2, 420, 160, "piece", false),
  v("Acai bowl", "california", ["acai", "açaí bowl", "acai bowl"], 450, 8, 74, 14, 11, 38, 140, 400, "bowl", false),
  v("Acai bowl, peanut butter", "california", ["peanut butter acai"], 540, 14, 70, 22, 12, 36, 180, 420, "bowl", false),
  v("Berry smoothie bowl", "california", ["smoothie bowl", "berry smoothie bowl"], 380, 8, 68, 10, 8, 42, 90, 380, "bowl", false),
  v("Mango smoothie bowl", "california", ["mango bowl"], 400, 7, 72, 10, 7, 48, 80, 380, "bowl", false),
  v("Turkey avocado sandwich", "california", ["turkey avocado"], 480, 32, 40, 20, 6, 6, 1100, 240, "sandwich", false),
  v("Chicken avocado cobb", "california", ["california cobb"], 560, 38, 18, 36, 6, 6, 1100, 360, "bowl", false),
  v("Kale salad", "california", ["kale salad", "kale caesar"], 320, 12, 24, 20, 6, 6, 620, 260, "bowl", false),
  v("Grain bowl", "california", ["grain bowl", "farro bowl", "quinoa bowl"], 540, 22, 62, 20, 10, 8, 780, 420, "bowl", false),
  v("Cioppino", "california", ["cioppino"], 380, 36, 18, 14, 3, 6, 980, 420, "bowl", false),
  v("Sourdough grilled cheese", "california", ["sourdough grilled cheese"], 460, 18, 38, 26, 2, 6, 920, 160, "sandwich", false),
  v("Fish taco California", "california", ["baja fish taco", "california fish taco"], 230, 12, 22, 10, 2, 2, 380, 120, "taco", true),
  v("Chicken avocado wrap", "california", ["avocado wrap"], 480, 28, 44, 20, 8, 4, 980, 260, "sandwich", false),

  v("Chicken gyro", "mediterranean", ["gyro", "chicken gyro"], 620, 34, 52, 28, 4, 6, 1400, 320, "sandwich", false),
  v("Lamb gyro", "mediterranean", ["lamb gyro"], 680, 32, 50, 34, 4, 6, 1500, 330, "sandwich", false),
  v("Chicken shawarma plate", "mediterranean", ["shawarma", "chicken shawarma"], 640, 38, 48, 28, 6, 6, 1400, 420, "plate", false),
  v("Falafel wrap", "mediterranean", ["falafel wrap", "falafel pita"], 540, 16, 62, 24, 8, 6, 880, 280, "sandwich", false),
  v("Falafel ball", "mediterranean", ["falafel", "falafel ball"], 60, 2.4, 5, 3.2, 1.2, 0.4, 110, 18, "piece", true),
  v("Hummus with pita", "mediterranean", ["hummus"], 280, 10, 32, 12, 6, 2, 480, 150, "plate", false),
  v("Chicken kebab", "mediterranean", ["chicken kebab", "chicken skewer"], 180, 22, 4, 8, 0.5, 1, 380, 90, "piece", true),
  v("Lamb kebab", "mediterranean", ["lamb kebab", "lamb skewer"], 210, 20, 4, 12, 0.4, 1, 420, 95, "piece", true),
  v("Souvlaki", "mediterranean", ["souvlaki"], 480, 32, 36, 20, 3, 4, 980, 280, "plate", false),
  v("Moussaka", "mediterranean", ["moussaka"], 520, 24, 32, 30, 5, 8, 860, 340, "plate", false),
  v("Tabbouleh", "mediterranean", ["tabbouleh", "tabouli"], 180, 4, 22, 8, 5, 3, 280, 160, "bowl", false),
  v("Baba ganoush", "mediterranean", ["baba ganoush"], 160, 3, 12, 12, 5, 4, 280, 140, "bowl", false),
  v("Dolma", "mediterranean", ["dolma", "stuffed grape leaf"], 45, 1.2, 6, 2, 1, 1, 140, 30, "piece", true),
  v("Mediterranean bowl", "mediterranean", ["mediterranean bowl", "greek bowl"], 540, 28, 52, 22, 8, 6, 980, 420, "bowl", false),
  v("Pita", "mediterranean", ["pita bread"], 170, 6, 34, 1.5, 2, 1, 320, 60, "piece", true),
  v("Baklava", "mediterranean", ["baklava"], 190, 3, 22, 10, 1, 14, 110, 40, "piece", true),

  v("Grilled ribeye", "steak", ["ribeye", "rib eye"], 680, 54, 0, 50, 0, 0, 160, 240, "serving", false),
  v("Grilled sirloin", "steak", ["sirloin"], 480, 52, 0, 28, 0, 0, 140, 200, "serving", false),
  v("Filet mignon", "steak", ["filet", "filet mignon"], 430, 48, 0, 24, 0, 0, 120, 180, "serving", false),
  v("NY strip steak", "steak", ["ny strip", "new york strip", "strip steak"], 560, 52, 0, 36, 0, 0, 150, 220, "serving", false),

  v("Grilled salmon", "seafood", ["salmon", "grilled salmon"], 412, 40, 0, 27, 0, 0, 90, 170, "serving", false),
  v("Blackened salmon", "seafood", ["blackened salmon"], 430, 40, 2, 28, 0, 1, 220, 180, "serving", false),
  v("Teriyaki salmon", "seafood", ["teriyaki salmon"], 480, 38, 24, 24, 0, 16, 780, 200, "serving", false),
  v("Tuna steak", "seafood", ["tuna steak", "ahi tuna", "seared tuna"], 350, 46, 0, 16, 0, 0, 80, 170, "serving", false),
  v("Fish and chips", "seafood", ["fried fish", "fish and chips"], 760, 32, 72, 38, 4, 4, 980, 400, "plate", false),
  v("Grilled white fish", "seafood", ["grilled fish", "tilapia", "cod"], 280, 36, 0, 12, 0, 0, 180, 170, "serving", false),
  v("Fried shrimp", "seafood", ["fried shrimp", "popcorn shrimp"], 360, 20, 28, 18, 1, 2, 860, 160, "serving", false),
  v("Grilled shrimp", "seafood", ["grilled shrimp", "shrimp skewer"], 40, 8, 0.4, 0.6, 0, 0, 140, 20, "piece", true),
  v("Shrimp scampi", "seafood", ["shrimp scampi", "scampi"], 520, 28, 36, 26, 2, 2, 1100, 320, "plate", false),
  v("Shrimp cocktail", "seafood", ["shrimp cocktail"], 160, 24, 8, 2, 0, 4, 620, 180, "serving", false),
  v("Calamari", "seafood", ["calamari", "fried calamari"], 380, 16, 32, 20, 1, 2, 720, 160, "serving", false),
  v("Crab cake", "seafood", ["crab cake"], 180, 12, 10, 10, 0.5, 1, 380, 70, "piece", true),
  v("Crab legs", "seafood", ["crab legs", "snow crab"], 280, 36, 0, 14, 0, 0, 980, 220, "serving", false),
  v("Lobster tail", "seafood", ["lobster tail", "lobster"], 220, 28, 2, 10, 0, 0, 620, 150, "piece", false),
  v("Lobster roll", "seafood", ["lobster roll"], 520, 28, 36, 26, 2, 4, 980, 220, "sandwich", false),
  v("Mussels marinara", "seafood", ["mussels"], 340, 28, 18, 14, 2, 4, 980, 320, "bowl", false),
  v("Ceviche", "seafood", ["ceviche"], 220, 26, 12, 6, 2, 4, 620, 220, "bowl", false),
  v("Grilled octopus", "seafood", ["octopus"], 280, 32, 8, 12, 0, 0, 720, 200, "serving", false),

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
  v("Naan", "indian", ["naan"], 260, 8, 45, 6, 2, 3, 480, 90, "side", false),
  v("Pita", "mediterranean", ["pita"], 170, 6, 34, 1.5, 2, 1, 320, 60, "side", false),
  v("Black beans", "mexican", ["beans"], 120, 8, 22, 0.5, 8, 0.4, 280, 130, "side", false),
  v("Granola", "california", ["granola"], 150, 4, 22, 6, 3, 8, 70, 40, "side", false),
  v("Peanut butter", "california", ["peanut butter drizzle"], 190, 8, 6, 16, 2, 3, 140, 32, "side", false),
  v("Honey", "california", ["honey drizzle"], 60, 0, 17, 0, 0, 16, 1, 20, "side", false),
  v("Coconut flakes", "california", ["coconut"], 70, 0.6, 3, 6, 2, 1, 4, 12, "side", false),
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
    "First name the BASE, then toppings. Deep purple frozen base = acai bowl (not a smoothie, not a chicken bowl). Pink or blended fruit = smoothie bowl. White cream = yogurt bowl. Rice + salsa/beans/meat = burrito bowl. Raw fish + rice = poke. Never call an acai or smoothie bowl a chicken bowl. List toppings you actually see: banana coins, strawberry, blueberry, granola clusters, coconut shreds, peanut butter drizzle, honey, kiwi, mango, chia.",
  sandwich:
    "Name the sandwich: turkey, ham and cheese, Italian sub, club, BLT, tuna, chicken salad, grilled cheese, cheesesteak, breakfast. Bread type if obvious. Not a burger unless there is a ground patty.",
  breakfast:
    "Pancakes vs waffles (grid) vs French toast vs omelette vs scrambled eggs. Count pancakes, waffle rounds, toast slices, eggs, bacon strips. Toppings: blueberries, chocolate chips, syrup, butter, fruit.",
  fries:
    "Straight fries vs curly vs sweet potato vs loaded (cheese/chili) vs onion rings vs tots. Small / medium / large from the pile or carton.",
  asian:
    "Name the exact dish. Chinese: orange chicken, General Tso, sesame, kung pao, sweet and sour, beef and broccoli, Mongolian beef, mapo tofu, fried rice, lo mein, chow mein, egg roll, dumpling. Thai: pad Thai, pad see ew, drunken noodles, green curry. Japanese: ramen (tonkotsu vs shoyu), katsu, udon, teriyaki. Korean: bulgogi, japchae, bibimbap. Vietnamese: pho (beef vs chicken), spring rolls. Count dumplings, egg rolls, and spring rolls. Rice on the side is its own group. Never answer only “Asian food” or “Chinese food”.",
  indian:
    "Name the exact dish: chicken tikka masala (orange creamy), butter chicken (similar, slightly sweeter), chicken/lamb curry, vindaloo (darker, spicier), korma (pale creamy), tandoori (red dry grilled), biryani (rice mixed through), palak/saag paneer (green, cheese cubes), chana masala (chickpeas), dal (lentils), dosa (crispy crepe), samosa (fried triangle). Count samosas, naan, and roti. Naan or rice on the side is its own group. Never answer only “Indian food” or “curry”.",
  mexican:
    "Name the exact dish: tacos (already split by protein), burrito, enchiladas (count them), fajitas (sizzling peppers + meat), tamales (count), chile relleno, chimichanga (fried burrito), tostada, carne asada plate, mole, elote/street corn, huevos rancheros, pozole, quesadilla, nachos. Count enchiladas, tamales, tacos, and tostadas. Rice and beans if visible are extras. Never answer only “Mexican food”.",
  texmex:
    "Name the exact Tex-Mex dish: chili con carne, chile con queso, chili cheese nachos, taco salad (fried shell bowl), Frito pie, combo plate (enchilada + taco + rice/beans), sour cream chicken enchilada, puffy taco, Tex-Mex fajitas. Count tacos, enchiladas, and puffy tacos. Queso or rice/beans on the side is its own group. Never answer only “Tex-Mex” or “Mexican”.",
  texan:
    "Name the exact Texas dish: sliced brisket plate vs brisket sandwich, pork ribs vs beef ribs, pulled pork, smoked sausage/hot links, burnt ends, chicken fried steak (breaded beef + cream gravy — not fried chicken), chicken fried chicken, BBQ two-meat plate, Texas toast, kolache, pecan pie. Count toast slices, kolaches, and rib bones if you can. Beans or toast on the side is its own group. Never answer only “BBQ” or “Texas food”.",
  california:
    "Name the exact California dish. Acai bowl = frozen DARK PURPLE/violet base (not pink smoothie, not yogurt, never chicken or rice). Smoothie bowl = blended lighter fruit, often pink. List every topping you see: sliced banana, strawberry, blueberry, granola, coconut, peanut butter, honey, kiwi, mango. Other dishes: California burrito (fries inside), avocado toast, kale/grain bowl, cioppino, sourdough grilled cheese, Baja fish taco. Never answer only “smoothie bowl” if the base is purple acai. Never suggest a chicken bowl.",
  mediterranean:
    "Name the exact dish: chicken vs lamb gyro, shawarma plate, falafel wrap vs falafel balls (count balls), hummus with pita, chicken vs lamb kebab (count skewers), souvlaki, moussaka, tabbouleh, baba ganoush, dolma (count), Greek salad, pita. Never answer only “Mediterranean” or “Greek food”.",
  steak:
    "Cut if you can: ribeye (more fat), sirloin, NY strip, filet. Grill marks. Butter/herb on top. Sides only if visible.",
  seafood:
    "Name the exact fish and cook: grilled / blackened / teriyaki salmon (orange-pink cooked fillet), tuna steak (dark red seared), white fish, fish and chips (battered + fries), grilled vs fried shrimp (count shrimp or skewers), shrimp scampi (buttery noodles), calamari (fried rings), crab cake (count), crab legs, lobster tail vs lobster roll, mussels, ceviche, octopus. Do not call sushi or sashimi a salmon dinner. Never answer only “seafood” or “fish”.",
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
  const blob = `${name} ${variantName}`;
  if (looksLikeSushi(blob)) {
    const wholeRoll = calories > 120 || /\b(6|8)\s*pieces\b/i.test(variantName);
    if (wholeRoll) return false;
    return count >= 2 && (calories <= 120 || /\b1 piece\b/i.test(variantName));
  }
  if (count <= 1) return false;
  if (
    /\b(slice|taco|wing|pancake|waffle|tender|nugget|drumstick|piece|samosa|dumpling|gyoza|enchilada|tamale|kebab|skewer|falafel|naan|shrimp|roll)\b/i.test(
      blob,
    )
  ) {
    return calories <= 420;
  }
  return calories <= 160 && count <= 24;
}

export function parseFamilyCount(text: string, fallback = 0) {
  const raw = text.toLowerCase();
  const patterns = [
    /(\d{1,2})\s*(?:slices?|tacos?|wings?|pancakes?|waffles?|tenders?|nuggets?|pieces?|pcs?|pc|eggs?|strips?|scoops?|cookies?|burgers?|samosas?|dumplings?|gyoza|enchiladas?|tamales?|kebabs?|skewers?|falafel|naan|roti|shrimp|rolls?)/i,
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
  add("paneer", /\bpaneer\b/);
  add("chickpea", /\b(chana|chickpea)\b/);
  add("lentil", /\b(dal|lentil)\b/);
  add("lamb", /\blamb\b/);
  add("falafel", /\bfalafel\b/);
  add("hummus", /\bhummus\b/);
  add("mole", /\bmole\b/);
  add("curry", /\bcurry|masala|tikka|korma|vindaloo\b/);
  add("crab", /\bcrab\b/);
  add("lobster", /\blobster\b/);
  add("tuna", /\btuna|ahi\b/);
  add("octopus", /\boctopus\b/);
  add("brisket", /\bbrisket\b/);
  add("queso", /\bqueso\b/);
  add("chili", /\bchili\b/);
  add("avocado", /\bavocado\b/);
  add("acai", /\b(acai|açaí)\b/);
  add("granola", /\bgranola\b/);
  add("banana", /\bbanana\b/);
  add("strawberry", /\bstrawberr/);
  add("blueberry", /\bblueberr/);
  add("peanut butter", /\bpeanut butter\b/);
  add("coconut", /\bcoconut\b/);
  add("honey", /\bhoney\b/);
  add("mango", /\bmango\b/);
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
  add("naan", /\bnaan\b/);
  add("pita", /\bpita\b/);
  add("beans", /\b(black beans|refried beans|rice and beans)\b/);
  add("granola", /\bgranola\b/);
  add("peanut butter", /\bpeanut butter\b/);
  add("honey", /\bhoney\b/);
  add("coconut", /\bcoconut\b/);
  return extras;
}

function resolvedCount(group: FamilyGroup, variant: FamilyVariant, size: PortionSize) {
  if (group.count > 0) return group.count;
  if (!variant.perUnit) return 1;
  if (variant.family === "pizza") return size === "small" ? 1 : size === "large" ? 4 : 2;
  if (variant.family === "taco") return size === "small" ? 2 : size === "large" ? 5 : 3;
  if (variant.family === "wings") return size === "small" ? 6 : size === "large" ? 12 : 8;
  if (variant.family === "breakfast" && variant.unit === "piece") {
    if (group.count > 6 && group.count > 0) return Math.min(group.count, 6);
    return size === "small" ? 2 : size === "large" ? 4 : 3;
  }
  if (variant.family === "chicken" && variant.perUnit) {
    return size === "small" ? 2 : size === "large" ? 4 : 3;
  }
  if (variant.unit === "piece" && variant.family === "indian") {
    return size === "small" ? 1 : size === "large" ? 3 : 2;
  }
  if (
    variant.unit === "piece" &&
    (variant.family === "mexican" ||
      variant.family === "mediterranean" ||
      variant.family === "texmex" ||
      variant.family === "texan" ||
      variant.family === "california")
  ) {
    return size === "small" ? 2 : size === "large" ? 4 : 3;
  }
  if (variant.unit === "piece" && variant.family === "asian") {
    return size === "small" ? 4 : size === "large" ? 8 : 6;
  }
  if (variant.unit === "piece" && variant.family === "seafood") {
    return size === "small" ? 4 : size === "large" ? 10 : 6;
  }
  return 1;
}

function unitFor(family: FoodFamily) {
  if (family === "pizza" || family === "dessert") return "slice";
  if (family === "taco") return "taco";
  if (family === "wings") return "wing";
  if (family === "breakfast") return "piece";
  if (family === "burger") return "burger";
  if (family === "mexican") return "piece";
  if (family === "indian") return "piece";
  if (family === "mediterranean") return "piece";
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
