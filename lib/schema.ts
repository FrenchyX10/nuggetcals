import { z } from "zod";

export const foodItemSchema = z.object({
  name: z
    .string()
    .describe("Specific food name, e.g. grilled chicken breast, not 'meat'"),
  brandOrRestaurantItem: z
    .string()
    .nullable()
    .describe("Official menu item name if matched, otherwise null"),
  portionDescription: z
    .string()
    .describe("Human portion, e.g. '1 regular burrito', '180g cooked pasta'"),
  estimatedGrams: z.number().describe("Estimated edible weight in grams"),
  calories: z.number().describe("Kilocalories for this item as plated"),
  proteinG: z.number(),
  carbsG: z.number(),
  fatG: z.number(),
  fiberG: z.number(),
  sugarG: z.number(),
  sodiumMg: z.number(),
  confidence: z
    .number()
    .describe("0-1 confidence this item and its calories are correct"),
  dataSource: z.enum([
    "restaurant_official",
    "usda",
    "nutrition_database",
    "visual_estimate",
  ]),
  notes: z
    .string()
    .describe("Short note about oils, sauces, or portion assumptions"),
});

export const mealAnalysisSchema = z.object({
  mealName: z.string().describe("Short dish title for the whole plate"),
  restaurant: z.string().nullable(),
  matchedMenuItem: z
    .string()
    .nullable()
    .describe("Closest official menu item if a restaurant was given"),
  isFood: z.boolean().describe("False if the photo is not a meal or drink"),
  notFoodReason: z.string().nullable(),
  totalCalories: z.number(),
  calorieRangeLow: z.number().describe("Conservative low estimate"),
  calorieRangeHigh: z.number().describe("Conservative high estimate"),
  proteinG: z.number(),
  carbsG: z.number(),
  fatG: z.number(),
  fiberG: z.number(),
  sugarG: z.number(),
  sodiumMg: z.number(),
  overallConfidence: z.number().describe("0-1 confidence for the whole meal"),
  method: z.enum([
    "restaurant_menu",
    "usda",
    "hybrid",
    "visual_estimate",
  ]),
  items: z.array(foodItemSchema).describe("Every visible edible item"),
  assumptions: z
    .array(z.string())
    .describe("The guesses that most affect the calorie number"),
  precisionNotes: z
    .string()
    .describe("How the number was produced and how to make it more precise"),
  sources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
    }),
  ),
});

export type MealAnalysis = z.infer<typeof mealAnalysisSchema>;
export type FoodItem = z.infer<typeof foodItemSchema>;
