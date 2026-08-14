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
import { enrichCaloriesFromSources } from "@/lib/calorie-lookup";
import {
  foodItemsFromSushiGroups,
  groupsFromIdentity,
  looksLikeSushi,
  parseSushiInspection,
  sizeFromPieces,
  SUSHI_INSPECT_PROMPT,
  type SushiGroup,
} from "@/lib/sushi";
import {
  detectFoodFamily,
  familyInspectPrompt,
  foodItemsFromFamilyGroups,
  groupsFromFamilyIdentity,
  parseFamilyInspection,
  type FamilyGroup,
  type FoodFamily,
} from "@/lib/food-families";

const SYSTEM = `You identify food in a photo. Do not invent calorie numbers.

Look first, then name. Fill lookClues before you pick a name.

Look-clues (required):
- shape: stack of flat rounds, bone-in pieces, bun sandwich, bowl, pizza slice, noodles, sushi pieces
- surface: matte cake crumb, craggy breading, bun sesame, melted cheese, syrup shine, nori, raw fish
- extras: berries, syrup, butter, bones, bun, lettuce, fries, ginger, wasabi only if visible

Hard disambiguation:
- Pancakes / waffles / French toast = stacked or gridded cakes, often syrup or berries. NEVER fried chicken.
- Fried chicken = irregular breaded pieces, often bone or craggy crust. NEVER pancakes. NEVER a burger unless there is a bun.
- Burger = bun + patty. No bun = not a burger. Chicken in a bun = chicken sandwich, not a hamburger.
- Pizza = triangular slice or round pie with toppings, not a quesadilla unless folded.
- Sushi is not one food. Split nigiri, sashimi, and each roll type. Count pieces. Name visible fish/fillings (salmon = orange, tuna = deep red, eel = brown glaze, avocado/cucumber = green, crab = white shreds). Never answer only "sushi".
- Never answer only pizza, burger, chicken, pasta, salad, taco, sandwich, bowl, Asian, Indian, Mexican, Mediterranean, or seafood. Name the exact dish (tikka masala vs biryani, enchilada vs fajita, gyro vs falafel, salmon vs shrimp scampi, pad Thai vs ramen) and count slices / tacos / samosas / dumplings / kebabs / shrimp.
- Do not add fries, drinks, or sides unless they are clearly in the photo.

Size from what you see (small / medium / large):
- piece count, stack height, how full the plate/bowl/box is
- sushi: 1–6 pieces small, 7–12 medium, 13+ large
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

  let identified = parseIdentity(
    raw,
    options.dishHint || options.restaurant,
    options.sizeHint,
  );
  const firstBlob = [
    identified.mealName,
    identified.lookClues,
    identified.items.map((item) => `${item.name} ${item.notes}`).join(" "),
    options.dishHint,
    options.localGuess ?? "",
  ];
  if (identified.isFood && looksLikeSushi(...firstBlob)) {
    identified = await inspectCloseupPlate(identified, options, SUSHI_INSPECT_PROMPT, "sushi").catch(
      () => identified,
    );
  } else if (identified.isFood) {
    const family = detectFoodFamily(...firstBlob);
    if (family) {
      identified = await inspectCloseupPlate(
        identified,
        options,
        familyInspectPrompt(family),
        family,
      ).catch(() => identified);
    }
  }
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

  const sushiGroups = groupsFromIdentity({
    mealName: identified.mealName,
    lookClues: identified.lookClues,
    items: identified.items,
  });
  const sushiRows =
    sushiGroups.length > 0
      ? foodItemsFromSushiGroups(sushiGroups, identified.size)
      : [];
  const family = detectFoodFamily(
    identified.mealName,
    identified.lookClues,
    identified.items.map((item) => `${item.name} ${item.notes}`).join(" "),
    options.dishHint,
  );
  const familyGroups =
    sushiRows.length === 0 && family
      ? groupsFromFamilyIdentity({
          family,
          mealName: identified.mealName,
          lookClues: identified.lookClues,
          items: identified.items,
        })
      : [];
  const familyRows =
    familyGroups.length > 0
      ? foodItemsFromFamilyGroups(familyGroups, identified.size)
      : [];
  const detailRows =
    sushiRows.length > 0
      ? sushiRows.map((row) => ({
          name: row.name,
          notes: row.notes,
          estimatedGrams: row.estimatedGrams,
          size: row.size,
          calories: row.calories,
          proteinG: row.proteinG,
          carbsG: row.carbsG,
          fatG: row.fatG,
          fiberG: row.fiberG,
          sugarG: row.sugarG,
          sodiumMg: row.sodiumMg,
          count: row.pieces,
          detail: row.fillings.join(" "),
        }))
      : familyRows.map((row) => ({
          name: row.name,
          notes: row.notes,
          estimatedGrams: row.estimatedGrams,
          size: row.size,
          calories: row.calories,
          proteinG: row.proteinG,
          carbsG: row.carbsG,
          fatG: row.fatG,
          fiberG: row.fiberG,
          sugarG: row.sugarG,
          sodiumMg: row.sodiumMg,
          count: row.count,
          detail: `${row.toppings.join(" ")} ${row.unit}`,
        }));
  const identifiedItems =
    detailRows.length > 0
      ? detailRows
      : identified.items.length > 0
        ? identified.items
        : [
            {
              name: identified.mealName || "Meal",
              notes: "",
              estimatedGrams: 0,
              size: identified.size,
            },
          ];
  const countedUnits = detailRows.reduce((sum, row) => sum + (row.count || 0), 0);
  const hint = [
    options.dishHint,
    ...identifiedItems.map((item) => `${item.size} ${item.name}`),
    detailRows.length > 0
      ? detailRows.map((row) => `${row.count} ${row.name} ${row.detail}`).join(" ")
      : "",
  ]
    .filter(Boolean)
    .join(" ");
  const mealSize =
    sushiRows.length > 0 && countedUnits > 0
      ? sizeFromPieces(countedUnits)
      : inferMealSize({
          mealName: identified.mealName,
          items: identifiedItems.map((item) => ({
            name: item.name,
            portionSize: item.size,
            portionDescription: item.notes,
          })),
        });
  const detailCalories = detailRows.reduce((sum, row) => sum + row.calories, 0);
  const skeleton = mealAnalysisSchema.parse({
    mealName:
      sushiRows.length > 1
        ? `Sushi platter (${countedUnits} pieces)`
        : identified.mealName,
    restaurant: displayRestaurant(options.restaurant),
    matchedMenuItem: identifiedItems[0]?.name ?? identified.mealName,
    isFood: true,
    notFoodReason: null,
    totalCalories: detailCalories,
    calorieRangeLow: Math.round(detailCalories * 0.85),
    calorieRangeHigh: Math.round(detailCalories * 1.15),
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
      portionDescription: detailRows.length > 0
        ? item.notes || `${SIZE_LABEL[item.size]} · identified type`
        : `${SIZE_LABEL[item.size]} · ${item.notes || "identified in photo"}`,
      portionSize: item.size,
      estimatedGrams: item.estimatedGrams || 0,
      calories: "calories" in item ? Number(item.calories) || 0 : 0,
      proteinG: "proteinG" in item ? Number(item.proteinG) || 0 : 0,
      carbsG: "carbsG" in item ? Number(item.carbsG) || 0 : 0,
      fatG: "fatG" in item ? Number(item.fatG) || 0 : 0,
      fiberG: "fiberG" in item ? Number(item.fiberG) || 0 : 0,
      sugarG: "sugarG" in item ? Number(item.sugarG) || 0 : 0,
      sodiumMg: "sodiumMg" in item ? Number(item.sodiumMg) || 0 : 0,
      confidence: 0.72,
      dataSource: detailRows.length > 0 ? "nutrition_database" : "visual_estimate",
      notes: `${SIZE_LABEL[item.size]} from the photo. ${item.notes}`.trim(),
    })),
    assumptions: [
      detailRows.length > 0
        ? `Step 1: Looked closer and named the type${countedUnits ? ` (${countedUnits} counted)` : ""} — not a generic dish name.`
        : "Step 1: AI identified the food on the plate.",
      identified.sizeReason
        ? `Step 2: Used visible ingredients as a scale and judged ${SIZE_LABEL[mealSize]} — ${identified.sizeReason}`
        : `Step 2: Used visible ingredients as a scale and judged ${SIZE_LABEL[mealSize]}.`,
      "Step 3: Search several nutrition sites and conclude calories for that size.",
      identified.quarterVisible || options.quarterFound
        ? "A US quarter was used as a 24.26 mm ruler next to the ingredients."
        : "No quarter was used.",
    ],
    precisionNotes: detailRows.length > 0
      ? "Calories use the specific type (pepperoni vs cheese, Caesar vs cobb, fried vs grilled) and counted slices / pieces / tacos when they are visible."
      : "Identify → size (small / medium / large) → calorie estimate. Chain meals use official size rows when they exist.",
    sources: [],
  });

  const refined = refineMealWithPublishedNutrition(skeleton, options.restaurant, hint);
  refined.restaurant = displayRestaurant(options.restaurant) ?? refined.restaurant;
  try {
    return await enrichCaloriesFromSources(refined, {
      restaurant: options.restaurant,
      apiKey: options.apiKey,
    });
  } catch {
    return refined;
  }
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
If this is sushi, do not return one item named sushi. One items[] row per type (salmon nigiri, tuna nigiri, dragon roll, …). For a cut roll, pieces = bite-size slices (usually 6–8), not 1.
If this is pizza, burger, chicken, pasta, salad, tacos, sandwich, wings, pancakes, Indian, Mexican, Mediterranean, Asian, or seafood, name the exact dish and count units. Never return only “curry”, “Mexican food”, or “seafood”.

Return only this JSON:
{"isFood":true,"notFoodReason":null,"mealName":"short specific name","lookClues":"shape, surface, extras","size":"medium","sizeReason":"visible scale clues","quarterVisible":false,"items":[{"name":"specific food name","size":"medium","pieces":0,"fillings":[],"notes":"what you see","estimatedGrams":180}]}`;
}

type IdentifiedItem = {
  name: string;
  notes: string;
  estimatedGrams: number;
  size: PortionSize;
  pieces?: number;
  fillings?: string[];
};

type IdentifiedMeal = {
  isFood: boolean;
  notFoodReason: string | null;
  mealName: string;
  lookClues: string;
  size: PortionSize;
  sizeReason: string;
  quarterVisible: boolean;
  items: IdentifiedItem[];
};

function parseIdentity(text: string, restaurantInput: string, sizeHint = ""): IdentifiedMeal {
  const value = extractJson(text);
  const items = Array.isArray(value.items) ? value.items : [];
  const mealSize = sizeHint
    ? parsePortionSize(sizeHint)
    : parsePortionSize(value.size ?? restaurantInput);
  const lookClues = String(value.lookClues ?? "");
  return {
    isFood: value.isFood !== false,
    notFoodReason: typeof value.notFoodReason === "string" ? value.notFoodReason : null,
    mealName: sanitizeIdentifiedName(
      String(value.mealName ?? restaurantInput ?? "Meal"),
      `${lookClues} ${value.sizeReason ?? ""}`,
      restaurantInput,
    ),
    lookClues,
    size: mealSize,
    sizeReason:
      typeof value.sizeReason === "string" && value.sizeReason.trim()
        ? value.sizeReason.trim()
        : "",
    quarterVisible: value.quarterVisible === true,
    items: items
      .map((item) => {
        const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        const fillings = Array.isArray(row.fillings)
          ? row.fillings.map((part) => String(part).trim()).filter(Boolean)
          : [];
        const pieces = num(row.pieces ?? row.pieceCount, 0);
        return {
          name: sanitizeIdentifiedName(
            String(row.name ?? "Food"),
            `${row.notes ?? ""} ${lookClues}`,
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
          pieces: pieces > 0 ? pieces : undefined,
          fillings: fillings.length > 0 ? fillings : undefined,
        };
      })
      .filter((item) => item.name.length > 0),
  };
}

async function inspectCloseupPlate(
  first: IdentifiedMeal,
  options: {
    imageBase64: string;
    restaurant: string;
    dishHint: string;
    apiKey: string;
    provider: "groq" | "gemini";
  },
  prompt: string,
  kind: "sushi" | FoodFamily,
): Promise<IdentifiedMeal> {
  const text =
    options.provider === "gemini"
      ? await inspectCloseupGemini(options, prompt)
      : await inspectCloseupGroq(options, prompt);
  if (kind === "sushi") {
    const parsed = parseSushiInspection(text);
    if (parsed.groups.length === 0) return first;
    return mergeSushiIdentity(first, parsed.groups, parsed.totalPieces);
  }
  const parsed = parseFamilyInspection(text, kind);
  if (parsed.groups.length === 0) return first;
  return mergeFamilyIdentity(first, parsed.groups, parsed.totalCount);
}

function mergeSushiIdentity(
  first: IdentifiedMeal,
  groups: SushiGroup[],
  totalPieces: number,
): IdentifiedMeal {
  const size = totalPieces > 0 ? sizeFromPieces(totalPieces) : first.size;
  return {
    ...first,
    mealName:
      groups.length === 1
        ? groups[0].name
        : `Sushi platter (${totalPieces || groups.length} pieces)`,
    lookClues: [
      first.lookClues,
      groups
        .map((group) => `${group.pieces || "?"} ${group.name} (${group.fillings.join("/") || "filling unclear"})`)
        .join("; "),
    ]
      .filter(Boolean)
      .join(" · "),
    size,
    sizeReason:
      totalPieces > 0
        ? `Counted ${totalPieces} sushi pieces and named visible fillings.`
        : first.sizeReason,
    items: groups.map((group) => ({
      name: group.name,
      notes: group.notes,
      estimatedGrams: 0,
      size,
      pieces: group.pieces || undefined,
      fillings: group.fillings,
    })),
  };
}

function mergeFamilyIdentity(
  first: IdentifiedMeal,
  groups: FamilyGroup[],
  totalCount: number,
): IdentifiedMeal {
  return {
    ...first,
    mealName:
      groups.length === 1
        ? groups[0].name
        : groups.map((group) => group.name).slice(0, 3).join(" + "),
    lookClues: [
      first.lookClues,
      groups
        .map(
          (group) =>
            `${group.count || "?"} ${group.unit} ${group.name} (${group.toppings.join("/") || "type from photo"})`,
        )
        .join("; "),
    ]
      .filter(Boolean)
      .join(" · "),
    sizeReason:
      totalCount > 0
        ? `Named the specific type and counted ${totalCount} units.`
        : first.sizeReason,
    items: groups.map((group) => ({
      name: group.name,
      notes: group.notes,
      estimatedGrams: 0,
      size: first.size,
      pieces: group.count || undefined,
      fillings: [...group.toppings, ...group.extras],
    })),
  };
}

async function inspectCloseupGroq(
  options: {
    imageBase64: string;
    restaurant: string;
    dishHint: string;
    apiKey: string;
  },
  prompt: string,
) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen/qwen3.6-27b",
      temperature: 0,
      max_completion_tokens: 2000,
      reasoning_effort: "none",
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Look again. Restaurant: ${options.restaurant || "(none)"}. Hint: ${options.dishHint || "(none)"}. Name the exact type, toppings, and count.`,
            },
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
  const data = (await response.json()) as {
    error?: { message?: string; failed_generation?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };
  if (data.error?.failed_generation) return data.error.failed_generation;
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error(data.error?.message || "Close-up look failed.");
  return text;
}

async function inspectCloseupGemini(
  options: {
    imageBase64: string;
    restaurant: string;
    dishHint: string;
    apiKey: string;
  },
  prompt: string,
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(options.apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: prompt }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Look again. Restaurant: ${options.restaurant || "(none)"}. Hint: ${options.dishHint || "(none)"}. Name the exact type, toppings, and count.`,
              },
              {
                inlineData: { mimeType: "image/jpeg", data: options.imageBase64 },
              },
            ],
          },
        ],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
      }),
    },
  );
  const data = (await response.json()) as {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("");
  if (!text) throw new Error(data.error?.message || "Close-up look failed.");
  return text;
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
