import { mealAnalysisSchema, type MealAnalysis } from "@/lib/schema";
import { displayRestaurant } from "@/lib/nutrition-data";
import {
  inferMealSize,
  parsePortionSize,
  SIZE_LABEL,
  type PortionSize,
} from "@/lib/portion-size";
import { refineMealWithPublishedNutrition } from "@/lib/refine-meal";
import { sanitizeIdentifiedName } from "@/lib/identify-guards";

const SYSTEM = `You identify food in a photo. Do not invent calorie numbers.

Look first, then name. Fill lookClues before you pick a name.

Look-clues (required):
- shape: stack of flat rounds, bone-in pieces, bun sandwich, bowl, pizza slice, noodles
- surface: matte cake crumb, craggy breading, bun sesame, melted cheese, syrup shine
- extras: berries, syrup, butter, bones, bun, lettuce, fries only if visible

Hard disambiguation:
- Pancakes / waffles / French toast = stacked or gridded cakes, often syrup or berries. NEVER fried chicken.
- Fried chicken = irregular breaded pieces, often bone or craggy crust. NEVER pancakes. NEVER a burger unless there is a bun.
- Burger = bun + patty. No bun = not a burger. Chicken in a bun = chicken sandwich, not a hamburger.
- Pizza = triangular slice or round pie with toppings, not a quesadilla unless folded.
- Do not add fries, drinks, or sides unless they are clearly in the photo.

Size from what you see (small / medium / large):
- piece count, stack height, how full the plate/bowl/box is
- a US quarter is 24.26 mm if visible

If a restaurant is named, use the closest real menu item (Hamburger, not Whopper, unless it clearly is a Whopper).
If it is not food, set isFood false.
Reply with one JSON object only.`;

export async function analyzeWithFreeVision(options: {
  imageBase64: string;
  restaurant: string;
  dishHint: string;
  sizeHint?: string;
  localGuess?: string;
  quarterFound?: boolean;
  provider: "groq" | "gemini";
  apiKey: string;
}): Promise<MealAnalysis> {
  const raw =
    options.provider === "groq"
      ? await callGroq(options)
      : await callGemini(options);

  const identified = parseIdentity(
    raw,
    options.dishHint || options.restaurant,
    options.sizeHint,
  );
  if (!identified.isFood) {
    return {
      mealName: "Not a meal",
      restaurant: displayRestaurant(options.restaurant),
      matchedMenuItem: null,
      isFood: false,
      notFoodReason: identified.notFoodReason ?? "That photo does not look like food.",
      totalCalories: 0,
      calorieRangeLow: 0,
      calorieRangeHigh: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
      sugarG: 0,
      sodiumMg: 0,
      overallConfidence: 0.2,
      method: "visual_estimate",
      portionSize: "medium",
      items: [],
      assumptions: [],
      precisionNotes: identified.notFoodReason ?? "",
      sources: [],
    };
  }

  const identifiedItems =
    identified.items.length > 0
      ? identified.items
      : [
          {
            name: identified.mealName || "Meal",
            notes: "",
            estimatedGrams: 0,
            size: identified.size,
          },
        ];
  const hint = [
    options.dishHint,
    ...identifiedItems.map((item) => `${item.size} ${item.name}`),
  ]
    .filter(Boolean)
    .join(" ");
  const mealSize = inferMealSize({
    mealName: identified.mealName,
    items: identifiedItems.map((item) => ({
      name: item.name,
      portionSize: item.size,
      portionDescription: item.notes,
    })),
  });
  const skeleton = mealAnalysisSchema.parse({
    mealName: identified.mealName,
    restaurant: displayRestaurant(options.restaurant),
    matchedMenuItem: identifiedItems[0]?.name ?? identified.mealName,
    isFood: true,
    notFoodReason: null,
    totalCalories: 0,
    calorieRangeLow: 0,
    calorieRangeHigh: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    fiberG: 0,
    sugarG: 0,
    sodiumMg: 0,
    overallConfidence: 0.72,
    method: options.restaurant ? "restaurant_menu" : "usda",
    portionSize: mealSize,
    items: identifiedItems.map((item) => ({
      name: item.name,
      brandOrRestaurantItem: options.restaurant || null,
      portionDescription: `${SIZE_LABEL[item.size]} · ${item.notes || "identified in photo"}`,
      portionSize: item.size,
      estimatedGrams: item.estimatedGrams || 0,
      calories: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
      sugarG: 0,
      sodiumMg: 0,
      confidence: 0.72,
      dataSource: "visual_estimate",
      notes: `${SIZE_LABEL[item.size]} from the photo. ${item.notes}`.trim(),
    })),
    assumptions: [
      "Step 1: AI identified the food on the plate.",
      identified.sizeReason
        ? `Step 2: Used visible ingredients as a scale and judged ${SIZE_LABEL[mealSize]} — ${identified.sizeReason}`
        : `Step 2: Used visible ingredients as a scale and judged ${SIZE_LABEL[mealSize]}.`,
      "Step 3: Estimated calories from published nutrition for that size.",
      identified.quarterVisible || options.quarterFound
        ? "A US quarter was used as a 24.26 mm ruler next to the ingredients."
        : "No quarter was used.",
    ],
    precisionNotes:
      "Identify → size (small / medium / large) → calorie estimate. Chain meals use official size rows when they exist.",
    sources: [],
  });

  const refined = refineMealWithPublishedNutrition(skeleton, options.restaurant, hint);
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
    sizeHint?: string;
    localGuess?: string;
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
      temperature: 0,
      max_completion_tokens: 3500,
      reasoning_effort: "none",
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt(options.restaurant, options.dishHint, options.quarterFound, options.sizeHint, options.localGuess) },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${options.imageBase64}`,
                detail: "high",
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
  sizeHint?: string;
  localGuess?: string;
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
                { text: userPrompt(options.restaurant, options.dishHint, options.quarterFound, options.sizeHint, options.localGuess) },
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

function userPrompt(
  restaurant: string,
  dishHint: string,
  quarterFound = false,
  sizeHint = "",
  localGuess = "",
) {
  return `Identify the food. Look at shape and surface first. Do not calculate calories.

Restaurant typed by the user: ${restaurant || "(none)"}
User hint: ${dishHint || "(none)"}
User size: ${sizeHint || "(not chosen — judge from the photo)"}
On-device food model guess (may be wrong): ${localGuess || "(none)"}
Quarter detector: ${quarterFound ? "possible quarter in the photo" : "no quarter detected"}. Confirm visually.

If the photo shows a stack of round cakes or syrup/berries, name pancakes or waffles, even if the on-device guess says chicken.
If you see a bun and a patty, it is a burger or sandwich, not loose fried chicken.

Return only this JSON:
{"isFood":true,"notFoodReason":null,"mealName":"short specific name","lookClues":"shape, surface, extras","size":"medium","sizeReason":"visible scale clues","quarterVisible":false,"items":[{"name":"specific food name","size":"medium","notes":"what you see","estimatedGrams":180}]}`;
}

function parseIdentity(text: string, restaurantInput: string, sizeHint = "") {
  const value = extractJson(text);
  const items = Array.isArray(value.items) ? value.items : [];
  const mealSize = sizeHint
    ? parsePortionSize(sizeHint)
    : parsePortionSize(value.size ?? restaurantInput);
  return {
    isFood: value.isFood !== false,
    notFoodReason: typeof value.notFoodReason === "string" ? value.notFoodReason : null,
    mealName: sanitizeIdentifiedName(
      String(value.mealName ?? restaurantInput ?? "Meal"),
      `${value.lookClues ?? ""} ${value.sizeReason ?? ""}`,
      restaurantInput,
    ),
    size: mealSize,
    sizeReason:
      typeof value.sizeReason === "string" && value.sizeReason.trim()
        ? value.sizeReason.trim()
        : "",
    quarterVisible: value.quarterVisible === true,
    items: items
      .map((item) => {
        const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        return {
          name: sanitizeIdentifiedName(
            String(row.name ?? "Food"),
            `${row.notes ?? ""} ${value.lookClues ?? ""}`,
            restaurantInput,
          ),
          notes: String(row.notes ?? ""),
          estimatedGrams: num(row.estimatedGrams, 0),
          size: (sizeHint
            ? mealSize
            : parsePortionSize(
                row.size ?? row.portionSize ?? `${row.name ?? ""} ${row.notes ?? ""}`,
                mealSize,
              )) as PortionSize,
        };
      })
      .filter((item) => item.name.length > 0),
  };
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

function num(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
