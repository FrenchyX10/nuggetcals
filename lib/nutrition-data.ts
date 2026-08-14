export type FoodRecord = {
  name: string;
  restaurant: string | null;
  aliases: string[];
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  grams: number;
  source: string;
  sourceUrl: string;
};

export const FOODS: FoodRecord[] = [
  // Generic / homemade
  f("Cheeseburger", null, ["cheeseburger", "cheese burger"], 540, 31, 40, 27, 2, 8, 1040, 220, "USDA-style standard"),
  f("Hamburger", null, ["hamburger", "plain burger", "beef burger"], 450, 25, 36, 21, 2, 6, 750, 200, "USDA-style standard"),
  f("Bacon cheeseburger", null, ["bacon cheeseburger", "bacon burger"], 650, 36, 40, 36, 2, 8, 1280, 250, "Typical diner burger"),
  f("Double cheeseburger", null, ["double cheeseburger", "double burger"], 740, 46, 40, 42, 2, 8, 1400, 300, "Two patties + cheese"),
  f("French fries", null, ["fries", "chips"], 365, 4, 48, 17, 4, 0, 250, 117, "USDA medium serving"),
  f("Pizza slice, cheese", null, ["cheese pizza", "plain pizza", "cheese slice"], 285, 12, 36, 10, 2, 4, 640, 107, "USDA 1/8 of 14-inch"),
  f("Pizza slice, pepperoni", null, ["pepperoni pizza", "pepperoni slice"], 313, 13, 35, 13, 2, 4, 760, 111, "USDA 1/8 of 14-inch"),
  f("Pizza slice, sausage", null, ["sausage pizza"], 330, 14, 35, 15, 2, 4, 800, 115, "1 slice"),
  f("Pizza slice, supreme", null, ["supreme pizza", "deluxe pizza"], 350, 15, 36, 16, 3, 5, 860, 125, "1 slice"),
  f("Pizza slice, Hawaiian", null, ["hawaiian pizza"], 300, 13, 37, 11, 2, 8, 740, 115, "1 slice"),
  f("Pizza slice, veggie", null, ["veggie pizza", "vegetable pizza"], 260, 11, 36, 8, 3, 5, 620, 115, "1 slice"),
  f("Pizza slice, margherita", null, ["margherita pizza"], 250, 10, 33, 8, 2, 4, 540, 105, "1 slice"),
  f("Chicken burrito", null, ["chicken burrito"], 700, 38, 76, 26, 8, 4, 1580, 380, "Typical restaurant burrito"),
  f("Steak burrito", null, ["steak burrito", "beef burrito"], 760, 42, 74, 30, 8, 4, 1680, 400, "Typical restaurant burrito"),
  f("Beef taco", null, ["beef taco", "hard shell taco", "ground beef taco"], 210, 9, 21, 10, 3, 1, 350, 100, "USDA hard taco"),
  f("Chicken taco", null, ["chicken taco", "chicken street taco"], 180, 12, 16, 8, 2, 1, 320, 95, "Typical street taco"),
  f("Steak taco", null, ["carne asada taco", "asada taco"], 220, 14, 16, 10, 2, 1, 340, 100, "1 taco"),
  f("Fish taco", null, ["fish taco"], 230, 12, 22, 10, 2, 2, 380, 120, "1 taco"),
  f("Chicken bowl", null, ["chicken bowl", "chicken burrito bowl"], 620, 42, 68, 18, 10, 4, 1400, 450, "Typical grain bowl"),
  f("Steak bowl", null, ["steak bowl", "steak burrito bowl"], 650, 42, 64, 22, 10, 4, 1400, 470, "Typical grain bowl"),
  f("Caesar salad", null, ["caesar salad no chicken"], 290, 8, 16, 22, 2, 2, 680, 220, "No chicken"),
  f("Caesar salad with chicken", null, ["chicken caesar", "caesar salad"], 470, 32, 18, 30, 3, 3, 980, 300, "Restaurant entree salad"),
  f("Garden salad", null, ["green salad", "house salad", "side salad"], 150, 4, 12, 10, 4, 5, 220, 200, "Side salad with dressing"),
  f("Cobb salad", null, ["cobb"], 580, 36, 16, 40, 4, 4, 1100, 360, "Restaurant cobb"),
  f("Greek salad", null, ["greek salad"], 320, 10, 14, 24, 4, 6, 780, 280, "Restaurant greek"),
  f("Spaghetti with meat sauce", null, ["spaghetti bolognese", "spaghetti meat sauce"], 580, 24, 78, 16, 6, 12, 920, 400, "Restaurant pasta plate"),
  f("Spaghetti marinara", null, ["marinara pasta", "spaghetti marinara"], 480, 16, 82, 10, 6, 10, 780, 380, "Red sauce pasta"),
  f("Fettuccine Alfredo", null, ["fettuccine alfredo", "alfredo"], 740, 22, 70, 40, 3, 4, 1100, 380, "White sauce pasta"),
  f("Chicken Alfredo", null, ["chicken alfredo"], 860, 42, 72, 44, 3, 4, 1400, 450, "Pasta with chicken"),
  f("Spaghetti carbonara", null, ["carbonara"], 740, 28, 70, 36, 3, 4, 1100, 380, "Restaurant carbonara"),
  f("Lasagna", null, ["lasagna"], 600, 32, 48, 30, 4, 10, 1200, 350, "USDA-style serving"),
  f("Fried chicken", null, ["fried chicken", "fried chicken pieces"], 490, 32, 18, 32, 1, 0, 980, 200, "2 pieces mixed"),
  f("Grilled chicken breast", null, ["chicken breast", "grilled chicken", "baked chicken"], 280, 53, 0, 6, 0, 0, 430, 170, "USDA 6 oz cooked"),
  f("Chicken tenders", null, ["chicken strips", "chicken fingers", "tenders"], 380, 28, 22, 18, 1, 1, 860, 170, "3–4 tenders"),
  f("Chicken sandwich", null, ["chicken burger", "crispy chicken sandwich", "fried chicken sandwich"], 520, 28, 44, 24, 2, 6, 1200, 220, "Breaded chicken sandwich"),
  f("Grilled chicken sandwich", null, ["grilled chicken sandwich"], 420, 32, 38, 14, 2, 6, 980, 210, "Grilled chicken sandwich"),
  f("Rotisserie chicken", null, ["roast chicken", "quarter chicken"], 320, 36, 0, 18, 0, 0, 520, 170, "1/4 chicken, skin on"),
  f("Orange chicken", null, ["orange chicken"], 490, 24, 52, 20, 2, 22, 980, 280, "Chinese-American plate without rice"),
  f("General Tso's chicken", null, ["general tso", "general tsos"], 520, 24, 54, 22, 2, 24, 1100, 290, "Chinese-American plate"),
  f("Sesame chicken", null, ["sesame chicken"], 500, 24, 50, 22, 2, 20, 980, 280, "Chinese-American plate"),
  f("Chicken wings", null, ["wings", "buffalo wings"], 430, 30, 8, 30, 0, 0, 980, 160, "6 pieces with skin"),
  f("Buffalo wing", null, ["buffalo wing"], 90, 7, 1, 6, 0, 0.2, 220, 32, "1 wing"),
  f("BBQ wing", null, ["bbq wing"], 95, 7, 3, 6, 0, 2, 210, 34, "1 wing"),
  f("Salmon nigiri", null, ["sake nigiri", "salmon sushi"], 57, 6.2, 8.2, 1.6, 0.1, 1.2, 130, 30, "1 piece"),
  f("Tuna nigiri", null, ["maguro nigiri", "ahi nigiri"], 52, 6.4, 8, 0.5, 0.1, 1.1, 140, 28, "1 piece"),
  f("Yellowtail nigiri", null, ["hamachi nigiri"], 60, 6, 8, 2, 0.1, 1.1, 135, 30, "1 piece"),
  f("Shrimp nigiri", null, ["ebi nigiri"], 40, 4.2, 8.2, 0.3, 0.1, 1.1, 160, 25, "1 piece"),
  f("Eel nigiri", null, ["unagi nigiri"], 82, 5.2, 10, 3.2, 0.1, 4, 220, 32, "1 piece"),
  f("Salmon sashimi", null, ["sake sashimi"], 40, 6.2, 0, 1.6, 0, 0, 20, 20, "1 slice"),
  f("Tuna sashimi", null, ["maguro sashimi"], 35, 7.2, 0, 0.4, 0, 0, 25, 18, "1 slice"),
  f("California roll piece", null, ["california roll", "california maki"], 33, 1.2, 4.8, 0.9, 0.3, 0.7, 80, 23, "1 piece"),
  f("Spicy tuna roll piece", null, ["spicy tuna roll"], 36, 2.1, 4.8, 1, 0.2, 0.6, 95, 23, "1 piece"),
  f("Philadelphia roll piece", null, ["philly roll", "salmon cream cheese roll"], 48, 2.2, 5, 2.2, 0.2, 0.8, 110, 26, "1 piece"),
  f("Shrimp tempura roll piece", null, ["shrimp tempura roll"], 58, 2.2, 6.2, 2.8, 0.2, 0.8, 140, 28, "1 piece"),
  f("Rainbow roll piece", null, ["rainbow roll"], 50, 2.6, 5.5, 1.8, 0.3, 0.8, 120, 26, "1 piece"),
  f("Dragon roll piece", null, ["dragon roll", "eel avocado roll"], 55, 2.2, 6, 2.4, 0.3, 1.4, 150, 28, "1 piece"),
  f("Mixed sushi piece", null, ["sushi platter", "assorted sushi"], 45, 3.2, 5.2, 1.3, 0.2, 0.7, 100, 24, "1 mixed piece"),
  f("California roll (8 pieces)", null, ["california roll 8"], 255, 9, 38, 7, 3, 5, 520, 180, "8 pieces"),
  f("Spicy tuna roll (8 pieces)", null, ["spicy tuna 8"], 290, 16, 38, 8, 2, 4, 640, 180, "8 pieces"),
  f("Ramen", null, ["ramen", "noodle soup"], 680, 28, 78, 26, 4, 6, 2100, 600, "Restaurant tonkotsu-style"),
  f("Pad Thai", null, ["pad thai"], 630, 22, 82, 22, 3, 16, 1400, 400, "Restaurant plate"),
  f("Fried rice", null, ["fried rice"], 520, 16, 78, 16, 3, 4, 980, 350, "Restaurant entree"),
  f("Pho", null, ["pho", "noodle soup"], 450, 30, 52, 12, 2, 6, 1500, 550, "Bowl with beef"),
  f("Steak, grilled", null, ["steak", "filet mignon", "ribeye"], 610, 52, 0, 44, 0, 0, 140, 220, "8 oz cooked ribeye"),
  f("Salmon, grilled", null, ["salmon", "grilled salmon"], 412, 40, 0, 27, 0, 0, 90, 170, "6 oz cooked"),
  f("Fish and chips", null, ["fish and chips", "fried fish"], 760, 32, 72, 38, 4, 4, 980, 400, "Restaurant plate"),
  f("Club sandwich", null, ["club sandwich", "club"], 620, 36, 48, 30, 3, 8, 1400, 280, "Triple-decker"),
  f("Grilled cheese", null, ["grilled cheese sandwich"], 400, 16, 32, 24, 2, 6, 860, 140, "2 slices bread"),
  f("Hot dog", null, ["hotdog", "frankfurter"], 310, 11, 24, 18, 1, 4, 810, 120, "Bun + frank + condiments"),
  f("Nachos with cheese", null, ["nachos"], 650, 18, 62, 36, 6, 4, 980, 250, "Appetizer portion"),
  f("Chicken quesadilla", null, ["quesadilla"], 580, 32, 42, 30, 3, 3, 1200, 220, "Restaurant quesadilla"),
  f("Pancakes with syrup", null, ["pancakes", "pancake", "hotcakes", "flapjacks"], 520, 10, 92, 12, 2, 38, 780, 220, "3 pancakes + syrup"),
  f("Blueberry pancakes", null, ["blueberry pancake", "pancakes", "pancake", "hotcakes", "berries"], 620, 14, 98, 18, 4, 42, 820, 280, "3 blueberry pancakes + syrup"),
  f("Chocolate chip pancakes", null, ["chocolate chip pancake", "pancakes"], 640, 13, 102, 20, 3, 48, 800, 280, "3 pancakes with chips + syrup"),
  f("French toast", null, ["french toast"], 430, 12, 52, 18, 2, 18, 480, 180, "2 slices"),
  f("Waffles", null, ["waffle", "waffles", "belgian waffle"], 410, 8, 58, 16, 2, 14, 520, 150, "2 waffles"),
  f("Waffles with fruit", null, ["waffle", "berry waffle"], 480, 9, 72, 16, 4, 28, 540, 200, "Waffle with berries"),
  f("Omelette", null, ["omelette", "omelet", "eggs"], 350, 22, 4, 26, 0, 2, 620, 180, "3-egg with cheese"),
  f("Bagel with cream cheese", null, ["bagel"], 430, 13, 58, 16, 2, 8, 620, 140, "Plain bagel"),
  f("Donuts", null, ["donut", "doughnut"], 270, 3, 31, 15, 1, 14, 250, 75, "1 glazed"),
  f("Ice cream scoop", null, ["ice cream"], 210, 4, 24, 11, 0, 21, 70, 90, "2/3 cup"),
  f("Chocolate cake", null, ["cake"], 350, 4, 50, 16, 2, 36, 260, 80, "1 slice"),
  f("Cheesecake", null, ["cheesecake"], 400, 7, 32, 28, 1, 26, 260, 125, "1 slice"),
  f("Apple", null, ["apple"], 95, 0, 25, 0, 4, 19, 2, 182, "USDA medium"),
  f("Banana", null, ["banana"], 105, 1, 27, 0, 3, 14, 1, 118, "USDA medium"),
  f("Coffee, black", null, ["coffee", "espresso"], 5, 0, 0, 0, 0, 0, 5, 240, "12 oz"),
  f("Latte", null, ["latte", "coffee drink"], 190, 12, 18, 7, 0, 18, 150, 350, "16 oz 2% milk"),
  f("Soda, 12 oz", null, ["soda", "coke", "cola"], 140, 0, 39, 0, 0, 39, 45, 355, "12 oz can"),
  f("Orange juice", null, ["juice", "orange juice"], 110, 2, 26, 0, 0, 21, 2, 248, "8 oz"),
  f("Beer, pint", null, ["beer"], 180, 2, 14, 0, 0, 0, 14, 473, "16 oz"),
  f("Macaroni and cheese", null, ["mac and cheese", "macaroni"], 470, 18, 48, 22, 2, 8, 980, 250, "Restaurant side/entree"),
  f("Ravioli", null, ["ravioli"], 520, 22, 56, 20, 4, 8, 980, 300, "Cheese ravioli marinara"),
  f("Dumplings", null, ["dumpling", "gyoza", "potsticker"], 320, 14, 38, 12, 2, 4, 720, 160, "6 pieces"),
  f("Gyoza piece", null, ["gyoza piece", "potsticker piece"], 50, 2.2, 6, 2, 0.3, 0.6, 120, 26, "1 piece"),
  f("Egg roll", null, ["egg roll"], 200, 6, 20, 10, 2, 2, 400, 80, "1 piece"),
  f("Spring roll", null, ["spring roll"], 80, 2, 12, 2, 1, 2, 180, 50, "1 piece"),
  f("Kung pao chicken", null, ["kung pao"], 480, 26, 36, 22, 4, 12, 1100, 300, "Chinese-American plate"),
  f("Sweet and sour chicken", null, ["sweet and sour"], 540, 22, 62, 22, 2, 28, 980, 320, "Chinese-American plate"),
  f("Pad see ew", null, ["pad see ew"], 610, 20, 80, 22, 4, 12, 1400, 400, "Thai noodles"),
  f("Chicken tikka masala", null, ["tikka masala"], 640, 36, 28, 38, 4, 10, 1200, 400, "With sauce"),
  f("Chicken curry", null, ["chicken curry"], 560, 32, 42, 28, 6, 8, 980, 400, "With rice"),
  f("Butter chicken", null, ["butter chicken", "murgh makhani"], 620, 34, 40, 34, 4, 10, 1100, 400, "With rice"),
  f("Chicken biryani", null, ["biryani", "chicken biryani"], 680, 32, 82, 22, 4, 6, 1400, 450, "Rice platter"),
  f("Tandoori chicken", null, ["tandoori"], 320, 42, 6, 14, 1, 3, 780, 220, "Dry grilled"),
  f("Palak paneer", null, ["saag paneer", "palak paneer"], 480, 18, 16, 36, 5, 6, 860, 320, "Restaurant plate"),
  f("Samosa", null, ["samosa"], 250, 5, 28, 14, 3, 2, 380, 80, "1 piece"),
  f("Naan", null, ["naan"], 260, 8, 45, 6, 2, 3, 480, 90, "1 piece"),
  f("Chicken enchilada", null, ["chicken enchilada"], 240, 14, 20, 12, 3, 2, 620, 140, "1 enchilada"),
  f("Beef enchilada", null, ["beef enchilada"], 260, 14, 20, 14, 3, 2, 680, 150, "1 enchilada"),
  f("Chicken fajitas", null, ["fajitas", "chicken fajitas"], 520, 38, 36, 22, 6, 6, 1400, 380, "Sizzling plate"),
  f("Steak fajitas", null, ["steak fajitas"], 580, 40, 34, 26, 6, 6, 1500, 400, "Sizzling plate"),
  f("Tamale", null, ["tamale"], 280, 10, 28, 14, 3, 2, 620, 140, "1 tamale"),
  f("Carne asada plate", null, ["carne asada"], 620, 42, 36, 30, 4, 4, 980, 380, "Restaurant plate"),
  f("Falafel wrap", null, ["falafel wrap", "falafel pita"], 540, 16, 62, 24, 8, 6, 880, 280, "Pita wrap"),
  f("Falafel ball", null, ["falafel ball"], 60, 2.4, 5, 3.2, 1.2, 0.4, 110, 18, "1 ball"),
  f("Hummus with pita", null, ["hummus"], 280, 10, 32, 12, 6, 2, 480, 150, "Snack plate"),
  f("Chicken gyro", null, ["gyro", "chicken gyro"], 620, 34, 52, 28, 4, 6, 1400, 320, "Pita sandwich"),
  f("Lamb gyro", null, ["lamb gyro"], 680, 32, 50, 34, 4, 6, 1500, 330, "Pita sandwich"),
  f("Chicken shawarma plate", null, ["shawarma"], 640, 38, 48, 28, 6, 6, 1400, 420, "Plate with sides"),
  f("Chicken kebab", null, ["chicken kebab", "chicken skewer"], 180, 22, 4, 8, 0.5, 1, 380, 90, "1 skewer"),
  f("Guacamole", null, ["guacamole", "guac"], 230, 3, 12, 20, 8, 1, 200, 150, "1/2 cup"),
  f("Shrimp scampi", null, ["shrimp scampi"], 520, 28, 36, 26, 2, 2, 1100, 320, "Restaurant plate"),
  f("Calamari", null, ["calamari", "fried calamari"], 380, 16, 32, 20, 1, 2, 720, 160, "Appetizer"),
  f("Crab cake", null, ["crab cake"], 180, 12, 10, 10, 0.5, 1, 380, 70, "1 cake"),
  f("Lobster roll", null, ["lobster roll"], 520, 28, 36, 26, 2, 4, 980, 220, "1 roll"),
  f("Tuna steak", null, ["tuna steak", "ahi tuna"], 350, 46, 0, 16, 0, 0, 80, 170, "Cooked steak"),
  f("Chili con carne", null, ["chili", "texas chili"], 380, 24, 22, 20, 6, 6, 980, 340, "Bowl"),
  f("Chile con queso", null, ["queso"], 280, 12, 12, 20, 1, 3, 720, 180, "Dip bowl"),
  f("Taco salad", null, ["taco salad"], 620, 28, 48, 34, 8, 6, 1200, 380, "Fried shell bowl"),
  f("Frito pie", null, ["frito pie"], 520, 18, 48, 28, 6, 4, 980, 280, "Fritos + chili"),
  f("Sliced brisket plate", null, ["brisket", "bbq brisket"], 620, 48, 12, 40, 1, 8, 980, 280, "BBQ plate"),
  f("Chicken fried steak", null, ["chicken fried steak"], 760, 38, 48, 44, 2, 4, 1600, 360, "With cream gravy"),
  f("Pork ribs", null, ["pork ribs", "spare ribs"], 680, 42, 16, 48, 0, 12, 980, 320, "BBQ ribs"),
  f("Pulled pork plate", null, ["pulled pork"], 580, 40, 20, 34, 1, 14, 1200, 300, "BBQ plate"),
  f("Kolache", null, ["kolache"], 280, 10, 32, 12, 1, 6, 520, 90, "1 pastry"),
  f("California burrito", null, ["california burrito", "cali burrito"], 880, 42, 82, 38, 8, 6, 1680, 480, "Fries inside"),
  f("Acai bowl", null, ["acai bowl", "açaí"], 420, 8, 72, 12, 10, 42, 120, 380, "Fruit bowl"),
  f("Cioppino", null, ["cioppino"], 380, 36, 18, 14, 3, 6, 980, 420, "SF seafood stew"),
  f("Turkey avocado sandwich", null, ["turkey avocado"], 480, 32, 40, 20, 6, 6, 1100, 240, "Deli sandwich"),
  f("Bibimbap", null, ["bibimbap"], 580, 24, 78, 18, 6, 10, 980, 500, "Stone bowl"),
  f("Poke bowl", null, ["poke", "poke bowl"], 520, 30, 62, 16, 5, 10, 980, 400, "Typical bowl"),
  f("Avocado toast", null, ["avocado toast"], 350, 8, 32, 22, 8, 2, 420, 160, "1 large slice"),
  f("Greek yogurt bowl", null, ["yogurt", "yogurt bowl"], 280, 18, 36, 6, 3, 28, 90, 250, "With fruit and granola"),
  f("Smoothie", null, ["smoothie"], 290, 6, 58, 4, 4, 46, 80, 400, "16 oz fruit"),
  f("Burrito bowl, steak", null, ["bowl", "steak bowl"], 650, 42, 64, 22, 10, 4, 1400, 470, "Typical bowl"),
  f("Sandwich, turkey", null, ["turkey sandwich"], 420, 28, 40, 14, 3, 6, 1100, 220, "Deli sandwich"),
  f("BLT sandwich", null, ["blt"], 430, 16, 34, 24, 2, 6, 980, 180, "Classic BLT"),
  f("Soup, tomato", null, ["tomato soup", "soup"], 180, 4, 28, 6, 3, 14, 780, 300, "Bowl"),
  f("Clam chowder", null, ["chowder", "clam chowder"], 280, 12, 24, 14, 1, 4, 980, 300, "Bowl"),
  f("Onion rings", null, ["onion rings"], 320, 4, 38, 16, 2, 5, 480, 120, "Side"),
  f("Mozzarella sticks", null, ["mozzarella sticks"], 400, 16, 32, 22, 2, 3, 820, 140, "6 pieces"),
  f("Garlic bread", null, ["garlic bread"], 200, 5, 24, 9, 1, 2, 360, 60, "2 slices"),
  f("Rice, white", null, ["rice", "white rice"], 205, 4, 45, 0, 1, 0, 2, 158, "1 cup cooked"),
  f("Brown rice", null, ["brown rice"], 215, 5, 45, 2, 4, 1, 10, 195, "1 cup cooked"),
  f("Black beans", null, ["beans", "black beans"], 227, 15, 41, 1, 15, 1, 2, 172, "1 cup cooked"),

  // McDonald's — published menu values
  f("Big Mac", "McDonald's", ["burger", "cheeseburger"], 590, 25, 46, 34, 3, 9, 1050, 215, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("Quarter Pounder with Cheese", "McDonald's", ["quarter pounder", "burger", "cheeseburger"], 520, 30, 42, 26, 3, 10, 1140, 199, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("McDouble", "McDonald's", ["burger", "cheeseburger"], 400, 22, 33, 20, 2, 7, 920, 160, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("Cheeseburger", "McDonald's", ["burger"], 300, 15, 32, 13, 2, 7, 720, 114, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("Hamburger", "McDonald's", ["burger"], 250, 12, 31, 9, 1, 6, 510, 98, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("4 Piece Chicken McNuggets", "McDonald's", ["nuggets", "chicken nuggets", "chicken"], 170, 9, 10, 10, 0, 0, 310, 64, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("6 Piece Chicken McNuggets", "McDonald's", ["nuggets", "chicken nuggets"], 250, 14, 16, 15, 1, 0, 470, 96, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("10 Piece Chicken McNuggets", "McDonald's", ["nuggets", "chicken nuggets", "chicken"], 410, 24, 26, 24, 1, 0, 850, 160, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("Small French Fries", "McDonald's", ["fries", "french fries"], 230, 3, 31, 11, 3, 0, 190, 71, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("Medium French Fries", "McDonald's", ["fries", "french fries"], 320, 5, 43, 15, 4, 0, 260, 111, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("Large French Fries", "McDonald's", ["fries"], 480, 7, 64, 23, 6, 0, 400, 166, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("Filet-O-Fish", "McDonald's", ["fish sandwich"], 390, 16, 39, 19, 2, 5, 580, 142, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("Egg McMuffin", "McDonald's", ["breakfast sandwich", "mcmuffin"], 310, 17, 30, 13, 2, 3, 770, 126, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("Sausage McMuffin with Egg", "McDonald's", ["breakfast sandwich"], 480, 21, 30, 31, 2, 3, 830, 153, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("McFlurry, Oreo", "McDonald's", ["mcflurry", "ice cream"], 510, 12, 80, 17, 1, 64, 280, 200, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("Small Coca-Cola", "McDonald's", ["coke", "soda"], 150, 0, 40, 0, 0, 40, 10, 360, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("Medium Coca-Cola", "McDonald's", ["coke", "soda"], 210, 0, 56, 0, 0, 56, 15, 590, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),
  f("Large Coca-Cola", "McDonald's", ["coke", "soda"], 290, 0, 77, 0, 0, 77, 20, 850, "McDonald's nutrition", "https://www.mcdonalds.com/us/en-us/about-our-food/nutrition-calculator.html"),

  // Chipotle — typical official calculator builds
  f("Chicken Burrito", "Chipotle", ["burrito", "chicken burrito"], 1070, 55, 98, 39.5, 13, 3, 2370, 500, "Chipotle nutrition calculator", "https://www.chipotle.com/nutrition-calculator"),
  f("Steak Burrito", "Chipotle", ["burrito"], 1060, 52, 97, 40, 13, 3, 2320, 500, "Chipotle nutrition calculator", "https://www.chipotle.com/nutrition-calculator"),
  f("Carnitas Burrito", "Chipotle", ["burrito"], 1110, 48, 97, 48, 13, 3, 2310, 500, "Chipotle nutrition calculator", "https://www.chipotle.com/nutrition-calculator"),
  f("Chicken Bowl", "Chipotle", ["bowl", "burrito bowl", "chicken bowl"], 760, 52, 71, 27, 12, 3, 1940, 520, "Chipotle nutrition calculator", "https://www.chipotle.com/nutrition-calculator"),
  f("Steak Bowl", "Chipotle", ["bowl", "steak bowl"], 750, 49, 70, 27.5, 12, 3, 1890, 520, "Chipotle nutrition calculator", "https://www.chipotle.com/nutrition-calculator"),
  f("Veggie Bowl", "Chipotle", ["bowl", "veggie bowl"], 560, 19, 80, 18, 16, 6, 1450, 520, "Chipotle nutrition calculator", "https://www.chipotle.com/nutrition-calculator"),
  f("Chicken Salad", "Chipotle", ["salad"], 500, 43, 21, 27, 8, 5, 1460, 400, "Chipotle nutrition calculator", "https://www.chipotle.com/nutrition-calculator"),
  f("Chips and Guacamole", "Chipotle", ["chips", "guacamole", "chips and guac"], 770, 10, 77, 48, 14, 2, 680, 230, "Chipotle nutrition calculator", "https://www.chipotle.com/nutrition-calculator"),
  f("Chips and Queso", "Chipotle", ["chips", "queso"], 890, 18, 87, 51, 10, 3, 1290, 250, "Chipotle nutrition calculator", "https://www.chipotle.com/nutrition-calculator"),
  f("Chicken Tacos (3)", "Chipotle", ["taco", "tacos"], 780, 48, 63, 32, 9, 3, 1680, 320, "Chipotle nutrition calculator", "https://www.chipotle.com/nutrition-calculator"),
  f("Sofritas Bowl", "Chipotle", ["bowl", "sofritas"], 700, 27, 82, 28, 16, 5, 1750, 520, "Chipotle nutrition calculator", "https://www.chipotle.com/nutrition-calculator"),

  // Chick-fil-A
  f("Chicken Sandwich", "Chick-fil-A", ["chicken sandwich", "sandwich"], 440, 28, 41, 18, 2, 6, 1460, 193, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),
  f("Deluxe Chicken Sandwich", "Chick-fil-A", ["chicken sandwich"], 500, 32, 43, 22, 2, 7, 1610, 228, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),
  f("Spicy Chicken Sandwich", "Chick-fil-A", ["spicy chicken", "sandwich"], 460, 28, 45, 19, 2, 6, 1730, 201, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),
  f("Nuggets, 4 count", "Chick-fil-A", ["nuggets", "chicken nuggets"], 130, 14, 6, 6, 0, 0, 610, 57, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),
  f("Nuggets, 8 count", "Chick-fil-A", ["nuggets", "chicken nuggets"], 250, 27, 11, 11, 1, 1, 1210, 113, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),
  f("Nuggets, 12 count", "Chick-fil-A", ["nuggets"], 380, 41, 16, 16, 1, 1, 1810, 170, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),
  f("Waffle Potato Fries, small", "Chick-fil-A", ["fries", "waffle fries"], 320, 4, 35, 18, 4, 1, 180, 102, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),
  f("Waffle Potato Fries, medium", "Chick-fil-A", ["fries", "waffle fries"], 420, 5, 45, 24, 5, 1, 240, 136, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),
  f("Waffle Potato Fries, large", "Chick-fil-A", ["fries", "waffle fries"], 520, 6, 57, 29, 6, 1, 300, 170, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),
  f("Chicken Biscuit", "Chick-fil-A", ["biscuit", "breakfast"], 460, 17, 48, 23, 2, 6, 1310, 145, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),
  f("Cobb Salad", "Chick-fil-A", ["salad", "cobb"], 510, 40, 28, 27, 5, 8, 1360, 351, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),
  f("Lemonade, small", "Chick-fil-A", ["lemonade", "drink"], 140, 0, 35, 0, 0, 32, 10, 312, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),
  f("Lemonade, medium", "Chick-fil-A", ["lemonade", "drink"], 220, 0, 55, 0, 0, 51, 15, 454, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),
  f("Lemonade, large", "Chick-fil-A", ["lemonade", "drink"], 330, 0, 83, 0, 0, 76, 20, 652, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),
  f("Mac & Cheese, small", "Chick-fil-A", ["mac and cheese"], 270, 12, 17, 17, 2, 1, 710, 112, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),
  f("Mac & Cheese, medium", "Chick-fil-A", ["mac and cheese"], 450, 20, 28, 29, 3, 2, 1190, 187, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),
  f("Mac & Cheese, large", "Chick-fil-A", ["mac and cheese"], 630, 28, 39, 41, 4, 3, 1670, 262, "Chick-fil-A nutrition", "https://www.chick-fil-a.com/nutrition-allergens"),

  // Starbucks
  f("Caffe Latte, Tall", "Starbucks", ["latte", "coffee"], 150, 10, 15, 6, 0, 14, 135, 354, "Starbucks nutrition", "https://www.starbucks.com/menu"),
  f("Caffe Latte, Grande", "Starbucks", ["latte", "coffee"], 190, 13, 19, 7, 0, 18, 170, 473, "Starbucks nutrition", "https://www.starbucks.com/menu"),
  f("Caffe Latte, Venti", "Starbucks", ["latte", "coffee"], 250, 16, 24, 9, 0, 23, 220, 591, "Starbucks nutrition", "https://www.starbucks.com/menu"),
  f("Caramel Macchiato, Grande", "Starbucks", ["macchiato", "coffee"], 250, 10, 35, 7, 0, 33, 150, 473, "Starbucks nutrition", "https://www.starbucks.com/menu"),
  f("Pumpkin Spice Latte, Grande", "Starbucks", ["pumpkin spice", "latte"], 390, 14, 52, 14, 0, 50, 230, 473, "Starbucks nutrition", "https://www.starbucks.com/menu"),
  f("Java Chip Frappuccino, Grande", "Starbucks", ["frappuccino"], 440, 5, 68, 16, 2, 60, 270, 473, "Starbucks nutrition", "https://www.starbucks.com/menu"),
  f("Bacon Gouda Sandwich", "Starbucks", ["breakfast sandwich", "sandwich"], 360, 19, 32, 18, 1, 3, 830, 146, "Starbucks nutrition", "https://www.starbucks.com/menu"),
  f("Impossible Breakfast Sandwich", "Starbucks", ["breakfast sandwich"], 430, 21, 36, 22, 3, 4, 790, 157, "Starbucks nutrition", "https://www.starbucks.com/menu"),
  f("Butter Croissant", "Starbucks", ["croissant"], 260, 6, 31, 12, 1, 6, 320, 74, "Starbucks nutrition", "https://www.starbucks.com/menu"),
  f("Banana Bread", "Starbucks", ["banana bread"], 380, 6, 52, 16, 2, 22, 370, 115, "Starbucks nutrition", "https://www.starbucks.com/menu"),
  f("Cake Pop", "Starbucks", ["cake pop"], 160, 2, 23, 7, 0, 16, 80, 38, "Starbucks nutrition", "https://www.starbucks.com/menu"),

  // Taco Bell
  f("Crunchwrap Supreme", "Taco Bell", ["crunchwrap"], 530, 16, 71, 21, 6, 6, 1200, 248, "Taco Bell nutrition", "https://www.tacobell.com/nutrition/info"),
  f("Beefy 5-Layer Burrito", "Taco Bell", ["burrito"], 490, 18, 65, 18, 7, 4, 1260, 198, "Taco Bell nutrition", "https://www.tacobell.com/nutrition/info"),
  f("Crunchy Taco", "Taco Bell", ["taco"], 170, 8, 13, 9, 3, 1, 310, 79, "Taco Bell nutrition", "https://www.tacobell.com/nutrition/info"),
  f("Soft Taco", "Taco Bell", ["taco", "soft taco"], 180, 9, 18, 8, 3, 2, 490, 99, "Taco Bell nutrition", "https://www.tacobell.com/nutrition/info"),
  f("Chalupa Supreme", "Taco Bell", ["chalupa"], 350, 14, 29, 20, 3, 3, 570, 153, "Taco Bell nutrition", "https://www.tacobell.com/nutrition/info"),
  f("Nachos BellGrande", "Taco Bell", ["nachos"], 740, 20, 77, 39, 12, 5, 1170, 308, "Taco Bell nutrition", "https://www.tacobell.com/nutrition/info"),
  f("Quesadilla, Chicken", "Taco Bell", ["quesadilla"], 510, 27, 38, 28, 4, 3, 1260, 184, "Taco Bell nutrition", "https://www.tacobell.com/nutrition/info"),
  f("Mexican Pizza", "Taco Bell", ["mexican pizza"], 470, 20, 46, 25, 6, 3, 890, 216, "Taco Bell nutrition", "https://www.tacobell.com/nutrition/info"),

  // Five Guys
  f("Hamburger", "Five Guys", ["burger", "hamburger"], 700, 39, 39, 43, 2, 8, 430, 240, "Five Guys nutrition", "https://www.fiveguys.com/menu"),
  f("Cheeseburger", "Five Guys", ["cheeseburger", "burger"], 840, 47, 40, 55, 2, 9, 1050, 270, "Five Guys nutrition", "https://www.fiveguys.com/menu"),
  f("Little Hamburger", "Five Guys", ["little burger"], 480, 23, 39, 26, 2, 8, 380, 170, "Five Guys nutrition", "https://www.fiveguys.com/menu"),
  f("Little Cheeseburger", "Five Guys", ["little cheeseburger"], 550, 27, 39, 32, 2, 8, 690, 185, "Five Guys nutrition", "https://www.fiveguys.com/menu"),
  f("Regular Fries", "Five Guys", ["fries", "french fries", "cajun fries"], 950, 15, 131, 41, 15, 2, 960, 365, "Five Guys nutrition", "https://www.fiveguys.com/menu"),
  f("Little Fries", "Five Guys", ["fries"], 530, 8, 72, 23, 8, 1, 530, 200, "Five Guys nutrition", "https://www.fiveguys.com/menu"),
  f("Hot Dog", "Five Guys", ["hot dog"], 540, 22, 41, 31, 2, 8, 1140, 180, "Five Guys nutrition", "https://www.fiveguys.com/menu"),

  // Shake Shack
  f("ShackBurger", "Shake Shack", ["burger", "cheeseburger", "shackburger"], 530, 29, 26, 33, 0, 6, 1260, 205, "Shake Shack nutrition", "https://shakeshack.com"),
  f("SmokeShack", "Shake Shack", ["burger"], 590, 33, 26, 38, 0, 6, 1710, 220, "Shake Shack nutrition", "https://shakeshack.com"),
  f("Shack Stack", "Shake Shack", ["burger"], 770, 31, 47, 48, 3, 7, 1680, 280, "Shake Shack nutrition", "https://shakeshack.com"),
  f("Chicken Shack", "Shake Shack", ["chicken sandwich"], 590, 29, 46, 32, 1, 6, 1490, 230, "Shake Shack nutrition", "https://shakeshack.com"),
  f("Crinkle-Cut Fries", "Shake Shack", ["fries"], 470, 6, 56, 24, 5, 0, 860, 150, "Shake Shack nutrition", "https://shakeshack.com"),
  f("ShackMeister Double", "Shake Shack", ["double burger"], 850, 48, 27, 58, 0, 7, 1890, 300, "Shake Shack nutrition", "https://shakeshack.com"),
  f("Frozen Custard, single", "Shake Shack", ["custard", "ice cream"], 340, 7, 36, 19, 0, 32, 105, 142, "Shake Shack nutrition", "https://shakeshack.com"),

  // Panera
  f("Broccoli Cheddar Soup, bowl", "Panera", ["soup", "broccoli cheddar"], 360, 14, 30, 21, 6, 7, 1390, 340, "Panera nutrition", "https://www.panerabread.com/en-us/food/nutrition.html"),
  f("Bacon Turkey Bravo", "Panera", ["sandwich", "turkey sandwich"], 920, 51, 81, 43, 4, 10, 2650, 400, "Panera nutrition", "https://www.panerabread.com/en-us/food/nutrition.html"),
  f("Frontega Chicken Panini", "Panera", ["panini", "sandwich"], 770, 44, 79, 30, 3, 5, 1850, 330, "Panera nutrition", "https://www.panerabread.com/en-us/food/nutrition.html"),
  f("Green Goddess Cobb Salad", "Panera", ["salad", "cobb"], 510, 42, 19, 30, 5, 6, 880, 400, "Panera nutrition", "https://www.panerabread.com/en-us/food/nutrition.html"),
  f("Mac & Cheese, bowl", "Panera", ["mac and cheese"], 950, 38, 75, 56, 2, 10, 2010, 396, "Panera nutrition", "https://www.panerabread.com/en-us/food/nutrition.html"),
  f("Cinnamon Crunch Bagel", "Panera", ["bagel"], 430, 10, 80, 8, 2, 30, 440, 113, "Panera nutrition", "https://www.panerabread.com/en-us/food/nutrition.html"),
  f("You Pick Two: soup + sandwich half", "Panera", ["you pick two", "combo"], 680, 28, 72, 28, 4, 10, 1980, 450, "Panera nutrition", "https://www.panerabread.com/en-us/food/nutrition.html"),

  // Olive Garden
  f("Chicken Alfredo", "Olive Garden", ["alfredo", "pasta", "fettuccine"], 1570, 81, 96, 93, 5, 8, 2260, 680, "Olive Garden nutrition", "https://www.olivegarden.com/nutrition"),
  f("Tour of Italy", "Olive Garden", ["tour of italy", "pasta"], 1550, 83, 107, 86, 8, 18, 3010, 700, "Olive Garden nutrition", "https://www.olivegarden.com/nutrition"),
  f("Spaghetti with Meat Sauce", "Olive Garden", ["spaghetti", "pasta"], 640, 30, 90, 17, 8, 18, 1220, 480, "Olive Garden nutrition", "https://www.olivegarden.com/nutrition"),
  f("Fettuccine Alfredo", "Olive Garden", ["alfredo", "pasta"], 1310, 31, 97, 87, 5, 6, 1220, 500, "Olive Garden nutrition", "https://www.olivegarden.com/nutrition"),
  f("Lasagna Classico", "Olive Garden", ["lasagna"], 940, 60, 61, 53, 8, 18, 2070, 500, "Olive Garden nutrition", "https://www.olivegarden.com/nutrition"),
  f("Chicken Parmigiana", "Olive Garden", ["chicken parm", "chicken parmesan"], 1060, 70, 79, 50, 7, 16, 2680, 550, "Olive Garden nutrition", "https://www.olivegarden.com/nutrition"),
  f("Salad and Breadsticks", "Olive Garden", ["salad", "breadsticks", "unlimited salad"], 380, 10, 48, 16, 4, 6, 980, 200, "Olive Garden nutrition", "https://www.olivegarden.com/nutrition"),
  f("Breadstick", "Olive Garden", ["breadstick", "garlic bread"], 140, 4, 25, 2.5, 1, 1, 460, 50, "Olive Garden nutrition", "https://www.olivegarden.com/nutrition"),
  f("Zuppa Toscana, bowl", "Olive Garden", ["soup", "zuppa toscana"], 220, 7, 15, 15, 2, 2, 790, 300, "Olive Garden nutrition", "https://www.olivegarden.com/nutrition"),

  // Sweetgreen
  f("Harvest Bowl", "Sweetgreen", ["bowl", "harvest bowl", "salad"], 705, 37, 56, 37, 9, 16, 1130, 430, "Sweetgreen nutrition", "https://www.sweetgreen.com"),
  f("Kale Caesar", "Sweetgreen", ["salad", "caesar"], 530, 35, 25, 34, 6, 4, 980, 360, "Sweetgreen nutrition", "https://www.sweetgreen.com"),
  f("Guacamole Greens", "Sweetgreen", ["salad", "guacamole greens"], 540, 32, 32, 32, 12, 6, 890, 380, "Sweetgreen nutrition", "https://www.sweetgreen.com"),
  f("Hot Honey Chicken Bowl", "Sweetgreen", ["bowl", "chicken bowl"], 650, 38, 62, 26, 8, 18, 1200, 420, "Sweetgreen nutrition", "https://www.sweetgreen.com"),
  f("Buffalo Chicken Bowl", "Sweetgreen", ["bowl"], 620, 40, 48, 28, 7, 8, 1400, 410, "Sweetgreen nutrition", "https://www.sweetgreen.com"),

  // Subway
  f("Turkey Breast, 6-inch", "Subway", ["turkey sandwich", "sub"], 280, 18, 46, 3.5, 5, 7, 760, 219, "Subway nutrition", "https://www.subway.com/en-us/menunutrition/nutrition"),
  f("Italian B.M.T., 6-inch", "Subway", ["bmt", "sub", "sandwich"], 410, 20, 46, 16, 5, 8, 1270, 241, "Subway nutrition", "https://www.subway.com/en-us/menunutrition/nutrition"),
  f("Meatball Marinara, 6-inch", "Subway", ["meatball", "sub"], 480, 21, 59, 18, 7, 12, 1170, 299, "Subway nutrition", "https://www.subway.com/en-us/menunutrition/nutrition"),
  f("Chicken Teriyaki, 6-inch", "Subway", ["teriyaki", "sub"], 370, 25, 59, 4.5, 5, 16, 850, 277, "Subway nutrition", "https://www.subway.com/en-us/menunutrition/nutrition"),
  f("Footlong Italian B.M.T.", "Subway", ["footlong", "bmt"], 820, 40, 92, 32, 10, 16, 2540, 482, "Subway nutrition", "https://www.subway.com/en-us/menunutrition/nutrition"),

  // Wendy's
  f("Dave's Single", "Wendy's", ["burger", "cheeseburger"], 590, 30, 39, 34, 2, 8, 1230, 211, "Wendy's nutrition", "https://www.wendys.com/nutrition-info"),
  f("Dave's Double", "Wendy's", ["double burger"], 810, 49, 40, 51, 2, 8, 1470, 280, "Wendy's nutrition", "https://www.wendys.com/nutrition-info"),
  f("Spicy Chicken Sandwich", "Wendy's", ["chicken sandwich"], 500, 30, 49, 20, 2, 6, 1130, 223, "Wendy's nutrition", "https://www.wendys.com/nutrition-info"),
  f("Baconator", "Wendy's", ["baconator", "burger"], 960, 60, 38, 62, 2, 8, 1770, 308, "Wendy's nutrition", "https://www.wendys.com/nutrition-info"),
  f("Small Fries", "Wendy's", ["fries"], 260, 4, 34, 13, 3, 0, 290, 100, "Wendy's nutrition", "https://www.wendys.com/nutrition-info"),
  f("Medium Fries", "Wendy's", ["fries"], 420, 6, 54, 20, 5, 0, 470, 155, "Wendy's nutrition", "https://www.wendys.com/nutrition-info"),
  f("Large Fries", "Wendy's", ["fries"], 530, 8, 68, 25, 6, 0, 590, 196, "Wendy's nutrition", "https://www.wendys.com/nutrition-info"),
  f("4-piece Nuggets", "Wendy's", ["nuggets"], 170, 10, 9, 11, 1, 0, 350, 62, "Wendy's nutrition", "https://www.wendys.com/nutrition-info"),

  // Burger King
  f("Hamburger", "Burger King", ["hamburger", "burger"], 250, 13, 29, 10, 1, 6, 490, 99, "Burger King nutrition", "https://www.bk.com/nutrition"),
  f("Cheeseburger", "Burger King", ["cheeseburger"], 280, 15, 29, 13, 1, 7, 660, 113, "Burger King nutrition", "https://www.bk.com/nutrition"),
  f("Double Cheeseburger", "Burger King", ["double cheeseburger"], 400, 24, 30, 21, 2, 7, 800, 155, "Burger King nutrition", "https://www.bk.com/nutrition"),
  f("Whopper Jr", "Burger King", ["whopper jr", "junior whopper"], 310, 13, 27, 18, 1, 6, 390, 155, "Burger King nutrition", "https://www.bk.com/nutrition"),
  f("Whopper", "Burger King", ["whopper"], 670, 31, 51, 40, 2, 11, 910, 270, "Burger King nutrition", "https://www.bk.com/nutrition"),
  f("Whopper with Cheese", "Burger King", ["whopper with cheese"], 740, 35, 52, 46, 2, 11, 1240, 292, "Burger King nutrition", "https://www.bk.com/nutrition"),
  f("Chicken Fries, 8 piece", "Burger King", ["chicken fries"], 280, 13, 20, 17, 1, 1, 770, 90, "Burger King nutrition", "https://www.bk.com/nutrition"),
  f("Small Fries", "Burger King", ["fries", "french fries"], 320, 4, 44, 15, 3, 0, 480, 105, "Burger King nutrition", "https://www.bk.com/nutrition"),
  f("Medium Fries", "Burger King", ["fries", "french fries"], 380, 5, 53, 17, 4, 0, 570, 128, "Burger King nutrition", "https://www.bk.com/nutrition"),
  f("Large Fries", "Burger King", ["fries", "french fries"], 500, 6, 70, 22, 5, 0, 750, 168, "Burger King nutrition", "https://www.bk.com/nutrition"),
  f("Original Chicken Sandwich", "Burger King", ["chicken sandwich"], 680, 28, 54, 40, 2, 5, 1290, 248, "Burger King nutrition", "https://www.bk.com/nutrition"),

  // In-N-Out
  f("Double-Double", "In-N-Out", ["double double", "burger", "cheeseburger"], 670, 37, 39, 41, 3, 10, 1440, 330, "In-N-Out nutrition", "https://www.in-n-out.com/nutrition"),
  f("Cheeseburger", "In-N-Out", ["cheeseburger"], 480, 22, 39, 27, 3, 10, 1000, 250, "In-N-Out nutrition", "https://www.in-n-out.com/nutrition"),
  f("Hamburger", "In-N-Out", ["hamburger", "burger"], 390, 16, 39, 19, 3, 10, 650, 243, "In-N-Out nutrition", "https://www.in-n-out.com/nutrition"),
  f("French Fries", "In-N-Out", ["fries"], 370, 6, 54, 15, 2, 0, 245, 125, "In-N-Out nutrition", "https://www.in-n-out.com/nutrition"),
  f("Animal Style Fries", "In-N-Out", ["animal fries", "fries"], 750, 18, 62, 46, 3, 8, 980, 220, "In-N-Out nutrition", "https://www.in-n-out.com/nutrition"),
  f("Protein Style Double-Double", "In-N-Out", ["protein style", "lettuce wrap"], 520, 33, 11, 39, 3, 7, 1440, 280, "In-N-Out nutrition", "https://www.in-n-out.com/nutrition"),

  // KFC
  f("Original Recipe Chicken Breast", "KFC", ["fried chicken", "chicken"], 390, 39, 11, 21, 1, 0, 1190, 162, "KFC nutrition", "https://www.kfc.com/nutrition"),
  f("3-Piece Chicken Combo", "KFC", ["fried chicken", "combo"], 830, 52, 62, 42, 4, 4, 2100, 420, "KFC nutrition", "https://www.kfc.com/nutrition"),
  f("Famous Bowl", "KFC", ["famous bowl", "bowl"], 720, 26, 79, 32, 5, 3, 2130, 400, "KFC nutrition", "https://www.kfc.com/nutrition"),
  f("Chicken Pot Pie", "KFC", ["pot pie"], 720, 29, 57, 42, 4, 5, 1970, 360, "KFC nutrition", "https://www.kfc.com/nutrition"),
  f("Mashed Potatoes with Gravy", "KFC", ["mashed potatoes"], 130, 2, 19, 5, 1, 0, 530, 136, "KFC nutrition", "https://www.kfc.com/nutrition"),
  f("Coleslaw", "KFC", ["coleslaw", "slaw"], 170, 1, 22, 9, 3, 17, 180, 130, "KFC nutrition", "https://www.kfc.com/nutrition"),

  // Popeyes
  f("Classic Chicken Sandwich", "Popeyes", ["chicken sandwich"], 700, 28, 50, 42, 2, 7, 1461, 245, "Popeyes nutrition", "https://www.popeyes.com/nutrition"),
  f("Spicy Chicken Sandwich", "Popeyes", ["spicy chicken sandwich"], 700, 28, 50, 42, 2, 7, 1489, 245, "Popeyes nutrition", "https://www.popeyes.com/nutrition"),
  f("3-Piece Signature Chicken", "Popeyes", ["fried chicken"], 810, 52, 28, 54, 2, 0, 1960, 320, "Popeyes nutrition", "https://www.popeyes.com/nutrition"),
  f("Cajun Fries, small", "Popeyes", ["fries"], 210, 3, 27, 10, 2, 0, 430, 79, "Popeyes nutrition", "https://www.popeyes.com/nutrition"),
  f("Cajun Fries, regular", "Popeyes", ["fries"], 280, 4, 36, 14, 3, 0, 570, 105, "Popeyes nutrition", "https://www.popeyes.com/nutrition"),
  f("Cajun Fries, large", "Popeyes", ["fries"], 420, 6, 54, 21, 4, 0, 850, 158, "Popeyes nutrition", "https://www.popeyes.com/nutrition"),
  f("Red Beans and Rice", "Popeyes", ["rice", "beans"], 230, 8, 32, 8, 6, 1, 580, 170, "Popeyes nutrition", "https://www.popeyes.com/nutrition"),
  f("Biscuit", "Popeyes", ["biscuit"], 260, 4, 31, 14, 1, 3, 610, 60, "Popeyes nutrition", "https://www.popeyes.com/nutrition"),

  // Pizza Hut / Domino's common
  f("Pepperoni Pizza, 2 slices large", "Pizza Hut", ["pizza", "pepperoni pizza"], 600, 24, 64, 26, 4, 6, 1520, 222, "Pizza Hut nutrition", "https://www.pizzahut.com/nutrition"),
  f("Cheese Pizza, 2 slices large", "Pizza Hut", ["pizza", "cheese pizza"], 520, 22, 64, 20, 4, 6, 1180, 214, "Pizza Hut nutrition", "https://www.pizzahut.com/nutrition"),
  f("Pepperoni Pizza, 2 slices large", "Domino's", ["pizza", "pepperoni pizza"], 580, 22, 66, 24, 4, 6, 1400, 220, "Domino's nutrition", "https://www.dominos.com/en/pages/content/nutritional/nutrition"),
  f("Cheese Pizza, 2 slices large", "Domino's", ["pizza"], 500, 20, 66, 16, 3, 6, 1120, 216, "Domino's nutrition", "https://www.dominos.com/en/pages/content/nutritional/nutrition"),
  f("Chicken Alfredo Pasta", "Domino's", ["pasta", "alfredo"], 720, 32, 72, 32, 4, 6, 1680, 340, "Domino's nutrition", "https://www.dominos.com/en/pages/content/nutritional/nutrition"),

  // Dunkin
  f("Small Original Blend Coffee", "Dunkin", ["coffee"], 5, 1, 0, 0, 0, 0, 5, 296, "Dunkin nutrition", "https://www.dunkindonuts.com/en/menu/nutrition"),
  f("Medium Original Blend Coffee", "Dunkin", ["coffee"], 5, 1, 0, 0, 0, 0, 10, 414, "Dunkin nutrition", "https://www.dunkindonuts.com/en/menu/nutrition"),
  f("Large Original Blend Coffee", "Dunkin", ["coffee"], 5, 1, 0, 0, 0, 0, 15, 592, "Dunkin nutrition", "https://www.dunkindonuts.com/en/menu/nutrition"),
  f("Small Latte", "Dunkin", ["latte"], 100, 6, 10, 4, 0, 9, 80, 296, "Dunkin nutrition", "https://www.dunkindonuts.com/en/menu/nutrition"),
  f("Medium Latte", "Dunkin", ["latte"], 140, 8, 14, 6, 0, 13, 115, 414, "Dunkin nutrition", "https://www.dunkindonuts.com/en/menu/nutrition"),
  f("Large Latte", "Dunkin", ["latte"], 210, 12, 21, 9, 0, 19, 170, 592, "Dunkin nutrition", "https://www.dunkindonuts.com/en/menu/nutrition"),
  f("Small Coolatta", "Dunkin", ["coolatta"], 240, 1, 60, 0, 0, 58, 30, 473, "Dunkin nutrition", "https://www.dunkindonuts.com/en/menu/nutrition"),
  f("Medium Coolatta", "Dunkin", ["coolatta"], 350, 2, 86, 0, 0, 84, 45, 710, "Dunkin nutrition", "https://www.dunkindonuts.com/en/menu/nutrition"),
  f("Large Coolatta", "Dunkin", ["coolatta"], 490, 3, 120, 0, 0, 118, 65, 946, "Dunkin nutrition", "https://www.dunkindonuts.com/en/menu/nutrition"),
  f("Glazed Donut", "Dunkin", ["donut", "doughnut"], 260, 4, 31, 14, 1, 13, 330, 63, "Dunkin nutrition", "https://www.dunkindonuts.com/en/menu/nutrition"),
  f("Bacon Egg and Cheese Croissant", "Dunkin", ["breakfast sandwich", "croissant"], 500, 17, 38, 31, 1, 6, 930, 142, "Dunkin nutrition", "https://www.dunkindonuts.com/en/menu/nutrition"),
  f("Sausage Egg and Cheese Wake-Up Wrap", "Dunkin", ["wrap", "breakfast"], 240, 10, 14, 16, 1, 1, 580, 79, "Dunkin nutrition", "https://www.dunkindonuts.com/en/menu/nutrition"),

  // Chicken-focused chains
  f("Chicken Finger Combo", "Raising Cane's", ["chicken fingers", "tenders", "chicken", "combo"], 1020, 42, 96, 52, 4, 6, 1680, 430, "Raising Cane's nutrition", "https://www.raisingcanes.com"),
  f("3 Chicken Fingers", "Raising Cane's", ["chicken fingers", "tenders", "chicken"], 330, 26, 12, 20, 0, 0, 680, 140, "Raising Cane's nutrition", "https://www.raisingcanes.com"),
  f("Caniac Combo", "Raising Cane's", ["caniac", "chicken", "combo"], 1620, 68, 140, 84, 6, 8, 2680, 620, "Raising Cane's nutrition", "https://www.raisingcanes.com"),
  f("Chicken Finger Plate", "Zaxby's", ["chicken fingers", "tenders", "chicken"], 980, 48, 82, 48, 4, 6, 2100, 450, "Zaxby's nutrition", "https://www.zaxbys.com"),
  f("Zaxby's Chicken Sandwich", "Zaxby's", ["chicken sandwich", "chicken"], 660, 32, 52, 34, 2, 7, 1680, 250, "Zaxby's nutrition", "https://www.zaxbys.com"),
  f("Classic Wings, 6 piece", "Wingstop", ["wings", "chicken wings", "chicken"], 540, 36, 4, 42, 0, 0, 980, 180, "Wingstop nutrition", "https://www.wingstop.com"),
  f("Chicken Tenders, 3 piece", "Wingstop", ["tenders", "chicken"], 410, 28, 22, 22, 1, 0, 980, 160, "Wingstop nutrition", "https://www.wingstop.com"),
  f("Fire-Grilled Chicken Breast", "El Pollo Loco", ["grilled chicken", "chicken"], 240, 38, 1, 9, 0, 0, 690, 142, "El Pollo Loco nutrition", "https://www.elpolloloco.com"),
  f("2-Piece Mixed Chicken Meal", "El Pollo Loco", ["chicken", "grilled chicken"], 520, 46, 36, 20, 3, 2, 1280, 360, "El Pollo Loco nutrition", "https://www.elpolloloco.com"),
  f("1/4 White Rotisserie Chicken", "Boston Market", ["rotisserie chicken", "chicken"], 330, 38, 0, 19, 0, 0, 620, 170, "Boston Market nutrition", "https://www.bostonmarket.com"),
];

function f(
  name: string,
  restaurant: string | null,
  aliases: string[],
  calories: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
  fiberG: number,
  sugarG: number,
  sodiumMg: number,
  grams: number,
  source: string,
  sourceUrl = "https://fdc.nal.usda.gov/",
): FoodRecord {
  return {
    name,
    restaurant,
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
  };
}

export function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9&+ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const RESTAURANT_ALIASES: Record<string, string> = {
  mcdonalds: "McDonald's",
  mcdonald: "McDonald's",
  mcds: "McDonald's",
  "micky ds": "McDonald's",
  chickfila: "Chick-fil-A",
  "chick fil a": "Chick-fil-A",
  "chick fila": "Chick-fil-A",
  "chik fila": "Chick-fil-A",
  "chik fil a": "Chick-fil-A",
  cfa: "Chick-fil-A",
  chipotle: "Chipotle",
  chipolte: "Chipotle",
  starbucks: "Starbucks",
  sbux: "Starbucks",
  tacobell: "Taco Bell",
  "taco bell": "Taco Bell",
  fiveguys: "Five Guys",
  "five guys": "Five Guys",
  shakeshack: "Shake Shack",
  "shake shack": "Shake Shack",
  olivegarden: "Olive Garden",
  "olive garden": "Olive Garden",
  sweetgreen: "Sweetgreen",
  "sweet green": "Sweetgreen",
  panera: "Panera",
  "panera bread": "Panera",
  subway: "Subway",
  wendys: "Wendy's",
  wendy: "Wendy's",
  burgerking: "Burger King",
  "burger king": "Burger King",
  bk: "Burger King",
  innout: "In-N-Out",
  "in n out": "In-N-Out",
  "in and out": "In-N-Out",
  kfc: "KFC",
  "kentucky fried chicken": "KFC",
  popeyes: "Popeyes",
  popeye: "Popeyes",
  pizzahut: "Pizza Hut",
  "pizza hut": "Pizza Hut",
  dominos: "Domino's",
  domino: "Domino's",
  dunkin: "Dunkin",
  "dunkin donuts": "Dunkin",
  "raising canes": "Raising Cane's",
  canes: "Raising Cane's",
  cane: "Raising Cane's",
  zaxbys: "Zaxby's",
  zaxby: "Zaxby's",
  wingstop: "Wingstop",
  "el pollo loco": "El Pollo Loco",
  polloloco: "El Pollo Loco",
  "boston market": "Boston Market",
};

export function displayRestaurant(input: string) {
  return findRestaurant(input) ?? (input.trim() || null);
}

export function findRestaurant(input: string) {
  const needle = normalizeName(input);
  if (!needle) return null;
  const compact = needle.replace(/\s+/g, "");
  const aliased = RESTAURANT_ALIASES[needle] ?? RESTAURANT_ALIASES[compact];
  if (aliased) return aliased;
  const names = restaurantNames();
  return (
    names.find((name) => normalizeName(name) === needle) ??
    names.find((name) => {
      const normalized = normalizeName(name);
      return (
        normalized.includes(needle) ||
        needle.includes(normalized) ||
        normalized.replace(/\s+/g, "") === compact
      );
    }) ??
    null
  );
}

export function restaurantNames() {
  return [...new Set(FOODS.map((item) => item.restaurant).filter(Boolean))] as string[];
}

export function menuFor(restaurant: string | null) {
  if (!restaurant) return FOODS.filter((item) => !item.restaurant);
  return FOODS.filter((item) => item.restaurant === restaurant);
}

const CORE_VISION_LABELS = [
  "blueberry pancakes",
  "pancakes with syrup",
  "stack of pancakes",
  "waffles",
  "french toast",
  "grilled chicken breast",
  "fried chicken pieces",
  "chicken tenders",
  "chicken sandwich",
  "chicken wings",
  "rotisserie chicken",
  "cheeseburger",
  "hamburger",
  "french fries",
  "pepperoni pizza",
  "cheese pizza",
  "green salad",
  "burrito",
  "taco",
  "pasta plate",
  "steak",
  "sushi platter",
  "salmon nigiri",
  "sashimi",
  "pepperoni pizza",
  "cheese pizza",
  "cheeseburger",
  "bacon cheeseburger",
  "fried chicken pieces",
  "grilled chicken breast",
  "chicken caesar salad",
  "spaghetti marinara",
  "fettuccine alfredo",
  "beef taco",
  "buffalo wings",
  "chicken tikka masala",
  "butter chicken",
  "chicken biryani",
  "chicken gyro",
  "shawarma",
  "enchiladas",
  "fajitas",
  "grilled salmon",
  "shrimp scampi",
  "pad thai",
  "ramen",
  "brisket",
  "chicken fried steak",
  "california burrito",
  "acai bowl",
  "taco salad",
  "rice bowl",
  "soup",
  "sandwich",
  "donut",
  "omelette",
  "coffee drink",
];

export function candidateLabels(restaurantInput: string, dishHint = "") {
  const restaurant = findRestaurant(restaurantInput);
  const labels: string[] = [];
  const hint = dishHint.trim();
  if (hint) labels.push(hint, `${hint} on a plate`);
  if (restaurant) {
    for (const item of menuFor(restaurant)) {
      labels.push(`${restaurant} ${item.name}`);
    }
  }
  labels.push(...CORE_VISION_LABELS);
  labels.push("not food", "empty plate");
  return { restaurant, labels: [...new Set(labels)].slice(0, 40) };
}
