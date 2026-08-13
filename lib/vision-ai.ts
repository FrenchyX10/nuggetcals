import { mealAnalysisSchema, type MealAnalysis } from "@/lib/schema";
import { displayRestaurant } from "@/lib/nutrition-data";
import { refineMealWithPublishedNutrition } from "@/lib/refine-meal";

const SYSTEM = `You are a careful nutrition analyst looking at a real photo of food.

Rules:
- Identify every edible item that is actually visible. Be specific: blueberry pancakes vs fried chicken vs hamburger.
- Never confuse pancakes/waffles with fried chicken. Never call chicken a burger.
- If a US quarter coin is visible, it is exactly 24.26 mm (0.955 in) across. Use it as a ruler for homemade food grams.
- Dinner plates are usually 10–11 inches if no coin is present.
- If a restaurant name is given (Burger King, McDonald's, etc.), match the closest official menu item and use the official ONE serving calories. Do not scale a Whopper up because the photo is a close-up. Do not add fries or a drink unless they are clearly in the photo.
- If the photo is a generic hamburger at Burger King, pick Hamburger or Cheeseburger, not a Whopper, unless it clearly is a Whopper.
- Hidden calories for homemade food: oil, butter, mayo, sauce, cheese, fried coating.
- If it is not food, set isFood false.
- Reply with a single JSON object only. No markdown fences. No extra text.`;

export async function analyzeWithFreeVision(options: {
  imageBase64: string;
  restaurant: string;
  dishHint: string;
  quarterFound?: boolean;
  provider: "groq" | "gemini";
  apiKey: string;
}): Promise<MealAnalysis> {
  const raw =
    options.provider === "groq"
      ? await callGroq(options)
      : await callGemini(options);

  const parsed = extractJson(raw);
  const checked = mealAnalysisSchema.safeParse(normalizeMeal(parsed, options.restaurant));
  if (!checked.success) {
    throw new Error("The vision model returned an unusable result. Try another photo.");
  }

  const refined = refineMealWithPublishedNutrition(
    checked.data,
    options.restaurant,
    options.dishHint,
  );
  refined.restaurant = displayRestaurant(options.restaurant) ?? refined.restaurant;
  return refined;
}

async function callGroq(options: {
  imageBase64: string;
  restaurant: string;
  dishHint: string;
  apiKey: string;
}) {
  const models = ["qwen/qwen3.6-27b"];
  let lastError = "Groq vision failed.";

  for (const model of models) {
    const response = await groqRequest(options, model);
    const data = (await response.json()) as {
      error?: { message?: string; failed_generation?: string };
      choices?: Array<{ message?: { content?: string } }>;
    };
    if (!response.ok) {
      if (data.error?.failed_generation) {
        try {
          extractJson(data.error.failed_generation);
          return data.error.failed_generation;
        } catch {
          /* keep trying */
        }
      }
      lastError = data.error?.message || `Groq failed (${response.status}).`;
      continue;
    }
    const text = data.choices?.[0]?.message?.content;
    if (text) return text;
    lastError = "Groq returned an empty analysis.";
  }

  throw new Error(lastError);
}

function groqRequest(
  options: {
    imageBase64: string;
    restaurant: string;
    dishHint: string;
    quarterFound?: boolean;
    apiKey: string;
  },
  model: string,
) {
  return fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      max_completion_tokens: 3500,
      reasoning_effort: "none",
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt(options.restaurant, options.dishHint, options.quarterFound) },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${options.imageBase64}`,
              },
            },
          ],
        },
      ],
    }),
  });
}

async function callGemini(options: {
  imageBase64: string;
  restaurant: string;
  dishHint: string;
  quarterFound?: boolean;
  apiKey: string;
}) {
  const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-3.6-flash"];
  let lastError = "Gemini vision failed.";

  for (const model of models) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(options.apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [
            {
              role: "user",
              parts: [
                { text: userPrompt(options.restaurant, options.dishHint, options.quarterFound) },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: options.imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.15,
            responseMimeType: "application/json",
          },
        }),
      },
    );
    const data = (await response.json()) as {
      error?: { message?: string };
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    if (!response.ok) {
      lastError = data.error?.message || `Gemini failed (${response.status}).`;
      continue;
    }
    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
    if (text) return text;
  }

  throw new Error(lastError);
}

function userPrompt(restaurant: string, dishHint: string, quarterFound = false) {
  return `Analyze this real-life food photo carefully.

Restaurant name typed by the user: ${restaurant || "(none)"}
What the user thinks it is: ${dishHint || "(not specified)"}
A US quarter detector ${quarterFound ? "THINKS a quarter is in the photo" : "did not find a quarter"}. Confirm by looking. If a quarter is visible, use 24.26 mm as the scale.

If a restaurant is named, use official 1-serving menu calories. If homemade and a quarter is visible, estimate grams from the coin.

Return a JSON object with exactly these keys:
mealName, restaurant, matchedMenuItem, isFood, notFoodReason, totalCalories, calorieRangeLow, calorieRangeHigh, proteinG, carbsG, fatG, fiberG, sugarG, sodiumMg, overallConfidence, method, items, assumptions, precisionNotes, sources.

items is an array of:
name, brandOrRestaurantItem, portionDescription, estimatedGrams, calories, proteinG, carbsG, fatG, fiberG, sugarG, sodiumMg, confidence, dataSource, notes.

method must be one of: restaurant_menu, usda, hybrid, visual_estimate.
dataSource must be one of: restaurant_official, usda, nutrition_database, visual_estimate.
restaurant should be the name the user typed if they typed one.
sources is an array of {title, url}.`;
}

function extractJson(text: string) {
  const withoutThink = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const fenced = withoutThink.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced?.[1] ?? withoutThink).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON in the vision response.");
  const slice = raw.slice(start, end + 1).replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(slice) as Record<string, unknown>;
}

function normalizeMeal(value: Record<string, unknown>, restaurantInput: string) {
  const items = Array.isArray(value.items) ? value.items : [];
  return {
    mealName: String(value.mealName ?? "Meal"),
    restaurant:
      (typeof value.restaurant === "string" && value.restaurant) ||
      restaurantInput ||
      null,
    matchedMenuItem:
      typeof value.matchedMenuItem === "string" ? value.matchedMenuItem : null,
    isFood: value.isFood !== false,
    notFoodReason: typeof value.notFoodReason === "string" ? value.notFoodReason : null,
    totalCalories: num(value.totalCalories),
    calorieRangeLow: num(value.calorieRangeLow, num(value.totalCalories) * 0.8),
    calorieRangeHigh: num(value.calorieRangeHigh, num(value.totalCalories) * 1.2),
    proteinG: num(value.proteinG),
    carbsG: num(value.carbsG),
    fatG: num(value.fatG),
    fiberG: num(value.fiberG),
    sugarG: num(value.sugarG),
    sodiumMg: num(value.sodiumMg),
    overallConfidence: clamp(num(value.overallConfidence, 0.55), 0, 1),
    method: oneOf(value.method, ["restaurant_menu", "usda", "hybrid", "visual_estimate"], "visual_estimate"),
    items: items.map((item) => normalizeItem(item)),
    assumptions: Array.isArray(value.assumptions)
      ? value.assumptions.map((line) => String(line))
      : [],
    precisionNotes: String(value.precisionNotes ?? ""),
    sources: Array.isArray(value.sources)
      ? value.sources.flatMap((source) => {
          if (!source || typeof source !== "object") return [];
          const row = source as { title?: unknown; url?: unknown };
          if (typeof row.url !== "string") return [];
          return [{ title: String(row.title ?? row.url), url: row.url }];
        })
      : [],
  };
}

function normalizeItem(item: unknown) {
  const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
  return {
    name: String(row.name ?? "Food"),
    brandOrRestaurantItem:
      typeof row.brandOrRestaurantItem === "string" ? row.brandOrRestaurantItem : null,
    portionDescription: String(row.portionDescription ?? "1 serving"),
    estimatedGrams: num(row.estimatedGrams, 150),
    calories: num(row.calories),
    proteinG: num(row.proteinG),
    carbsG: num(row.carbsG),
    fatG: num(row.fatG),
    fiberG: num(row.fiberG),
    sugarG: num(row.sugarG),
    sodiumMg: num(row.sodiumMg),
    confidence: clamp(num(row.confidence, 0.55), 0, 1),
    dataSource: oneOf(
      row.dataSource,
      ["restaurant_official", "usda", "nutrition_database", "visual_estimate"],
      "visual_estimate",
    ),
    notes: String(row.notes ?? ""),
  };
}

function num(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function oneOf<T extends string>(value: unknown, options: T[], fallback: T): T {
  return typeof value === "string" && options.includes(value as T)
    ? (value as T)
    : fallback;
}
