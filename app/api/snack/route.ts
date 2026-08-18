import { resolveVisionAuth, type VisionAuth } from "@/lib/keys";
import { snackFromFood, searchLocalSnacks, type SnackRecord } from "@/lib/snacks-data";

export const runtime = "nodejs";
export const maxDuration = 45;

type UsdaFood = {
  fdcId?: number;
  description?: string;
  brandName?: string;
  brandOwner?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients?: Array<{
    nutrientName?: string;
    nutrientNumber?: string;
    value?: number;
    unitName?: string;
  }>;
  labelNutrients?: Record<string, { value?: number } | undefined>;
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const typed = readString(body, "query", 80);
  const groqKey = readString(body, "groqKey", 200);
  const geminiKey = readString(body, "geminiKey", 200);
  const imageBase64 = readString(body, "imageBase64", 12_000_000);
  const auth = resolveVisionAuth({ groqKey, geminiKey });

  let query = typed;
  let identified = "";
  if (imageBase64) {
    if (!auth) {
      return Response.json(
        {
          error: "missing_vision_key",
          message:
            "Vision is not configured. Add GEMINI_API_KEY on the server, or paste a free Gemini/Groq key.",
        },
        { status: 401 },
      );
    }
    try {
      const seen = await identifySnackPhoto(imageBase64, auth);
      identified = seen.query;
      query = [seen.query, typed].filter(Boolean).join(" ").trim() || seen.query;
    } catch (error) {
      return Response.json(
        {
          error: error instanceof Error ? error.message : "Could not read that snack photo.",
        },
        { status: 502 },
      );
    }
  }

  if (query.length < 2) {
    return Response.json({ error: "Type a snack name or upload a bag photo." }, { status: 400 });
  }

  const variants = queryVariants(query);
  const [usdaA, usdaB, offA, offB] = await Promise.all([
    searchUsda(variants[0]).catch(() => [] as SnackRecord[]),
    searchUsda(variants[1] ?? variants[0]).catch(() => [] as SnackRecord[]),
    searchOpenFoodFacts(variants[0]).catch(() => [] as SnackRecord[]),
    searchOpenFoodFacts(variants[1] ?? variants[0], true).catch(() => [] as SnackRecord[]),
  ]);

  const local = variants.flatMap((variant) => searchLocalSnacks(variant)).slice(0, 10);
  const merged = dedupe([...local, ...usdaA, ...usdaB, ...offA, ...offB]).slice(0, 16);
  if (merged.length === 0) {
    return Response.json({
      snacks: [],
      query,
      identified,
      message: `No published snack label matched “${query}”. Try the brand plus flavor, like “Takis Fuego”.`,
    });
  }

  let picked = 0;
  let reason = identified
    ? `Photo looks like ${identified}. Matched published labels.`
    : "Matched published USDA / Open Food Facts labels.";
  if (auth && merged.length > 1) {
    try {
      const choice = await pickWithAi(query, merged, auth.key);
      picked = choice.index;
      reason = identified ? `${reason} ${choice.reason}` : choice.reason;
    } catch {
      /* keep first result */
    }
  }

  return Response.json({
    snacks: merged,
    picked,
    reason,
    query,
    identified,
    engine: auth ? "label+ai" : "label",
  });
}

function queryVariants(query: string) {
  const clean = query.replace(/['’]/g, "").replace(/\s+/g, " ").trim();
  const words = clean.split(" ").filter(Boolean);
  const short = words.slice(0, 3).join(" ");
  const unique = [...new Set([clean, short, words.slice(0, 2).join(" ")])].filter(
    (item) => item.length >= 2,
  );
  return unique;
}

const SNACK_VISION_PROMPT =
  'Identify the packaged snack in the photo. Read the bag or wrapper. Do not invent calories. Reply with JSON only: {"isSnack":true,"query":"brand flavor","notes":"bag size if visible"}';

async function identifySnackPhoto(imageBase64: string, auth: VisionAuth) {
  const text =
    auth.provider === "gemini"
      ? await identifySnackGemini(imageBase64, auth.key)
      : await identifySnackGroq(imageBase64, auth.key);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Could not read a snack name from that photo.");
  const parsed = JSON.parse(text.slice(start, end + 1)) as {
    isSnack?: boolean;
    query?: string;
    notes?: string;
  };
  if (parsed.isSnack === false) throw new Error("That photo does not look like a packaged snack.");
  const query = String(parsed.query ?? "").trim();
  if (query.length < 2) throw new Error("Could not read the bag name. Try a closer photo of the label.");
  return { query, notes: String(parsed.notes ?? "") };
}

async function identifySnackGroq(imageBase64: string, apiKey: string) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen/qwen3.6-27b",
      temperature: 0.1,
      max_completion_tokens: 400,
      reasoning_effort: "none",
      messages: [
        { role: "system", content: SNACK_VISION_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What snack is this? Use the brand and flavor as the search query, e.g. Doritos Cool Ranch or Cheetos Flamin Hot.",
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
    }),
  });
  const data = (await response.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };
  if (!response.ok) {
    throw new Error(data.error?.message || "Snack photo identification failed.");
  }
  return data.choices?.[0]?.message?.content ?? "";
}

async function identifySnackGemini(imageBase64: string, apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SNACK_VISION_PROMPT }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "What snack is this? Use the brand and flavor as the search query, e.g. Doritos Cool Ranch or Cheetos Flamin Hot.",
              },
              { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
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
    throw new Error(data.error?.message || "Snack photo identification failed.");
  }
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
}

async function searchUsda(query: string): Promise<SnackRecord[]> {
  const key = process.env.USDA_API_KEY?.trim() || "DEMO_KEY";
  const response = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        query,
        dataType: ["Branded"],
        pageSize: 20,
        pageNumber: 1,
      }),
    },
  );
  if (!response.ok) throw new Error("USDA search failed.");
  const data = (await response.json()) as { foods?: UsdaFood[] };
  return (data.foods ?? [])
    .map((food) => usdaToSnack(food))
    .filter((snack): snack is SnackRecord => Boolean(snack));
}

function usdaToSnack(food: UsdaFood): SnackRecord | null {
  const label = food.labelNutrients;
  const calories =
    label?.calories?.value ??
    nutrient(food, ["energy"], "kcal") ??
    nutrient(food, ["calories"], "kcal");
  if (!calories) return null;
  const name = [food.brandName, food.description].filter(Boolean).join(" ").trim();
  if (!name) return null;
  const servingGrams =
    food.servingSize && /g/i.test(food.servingSizeUnit ?? "")
      ? food.servingSize
      : 28;
  const perHundred = !label?.calories?.value && calories > 280;
  const scale = perHundred ? servingGrams / 100 : 1;
  const id = food.fdcId ? String(food.fdcId) : "";
  return snackFromFood(
    {
      name: name.slice(0, 90),
      restaurant: food.brandOwner ?? food.brandName ?? null,
      aliases: [],
      calories: Math.round(calories * scale),
      proteinG: round1((label?.protein?.value ?? nutrient(food, ["protein"]) ?? 0) * scale),
      carbsG: round1(
        (label?.carbohydrates?.value ?? nutrient(food, ["carbohydrate"]) ?? 0) * scale,
      ),
      fatG: round1(
        (label?.fat?.value ?? nutrient(food, ["total lipid", "total fat", "fat"]) ?? 0) * scale,
      ),
      fiberG: round1((label?.fiber?.value ?? nutrient(food, ["fiber"]) ?? 0) * scale),
      sugarG: round1((label?.sugars?.value ?? nutrient(food, ["sugars"]) ?? 0) * scale),
      sodiumMg: Math.round(
        (label?.sodium?.value ?? nutrient(food, ["sodium"]) ?? 0) * (label?.sodium?.value ? 1 : scale),
      ),
      grams: Math.round(servingGrams),
      source: "USDA FoodData Central branded",
      sourceUrl: id
        ? `https://fdc.nal.usda.gov/food-details/${id}/nutrients`
        : "https://fdc.nal.usda.gov/",
    },
    guessCategory(name),
  );
}

function nutrient(food: UsdaFood, names: string[], unit?: string) {
  const rows = food.foodNutrients ?? [];
  for (const name of names) {
    const row = rows.find((item) => {
      const label = (item.nutrientName ?? "").toLowerCase();
      const number = item.nutrientNumber ?? "";
      if (name === "energy" && (number === "208" || label.includes("energy"))) {
        if (unit && (item.unitName ?? "").toLowerCase() === "kj") return false;
        return true;
      }
      return label.includes(name);
    });
    if (row && typeof row.value === "number") {
      if ((row.unitName ?? "").toLowerCase() === "kj") return row.value / 4.184;
      return row.value;
    }
  }
  return null;
}

async function searchOpenFoodFacts(query: string, us = false): Promise<SnackRecord[]> {
  const host = us ? "us.openfoodfacts.org" : "world.openfoodfacts.org";
  const url = new URL(`https://${host}/cgi/search.pl`);
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "12");
  const response = await fetch(url, {
    headers: { "User-Agent": "NuggetCals/1.0 (snack lookup)" },
  });
  if (!response.ok) throw new Error("Open Food Facts failed.");
  const data = (await response.json()) as {
    products?: Array<{
      product_name?: string;
      brands?: string;
      serving_size?: string;
      nutriments?: Record<string, number | undefined>;
      url?: string;
      code?: string;
    }>;
  };
  return (data.products ?? [])
    .map((product) => {
      const nuts = product.nutriments ?? {};
      const servingCal = nuts["energy-kcal_serving"];
      const hundredCal = nuts["energy-kcal_100g"] ?? nuts["energy-kcal"];
      const calories = servingCal ?? (hundredCal ? hundredCal * 0.28 : 0);
      if (!calories || !product.product_name) return null;
      const perServing = typeof servingCal === "number";
      const scale = perServing ? 1 : 0.28;
      return snackFromFood(
        {
          name: `${product.brands ? `${product.brands} ` : ""}${product.product_name}`.slice(0, 90),
          restaurant: product.brands || null,
          aliases: [],
          calories: Math.round(calories),
          proteinG: round1(nuts.proteins_serving ?? (nuts.proteins_100g ?? 0) * scale),
          carbsG: round1(
            nuts.carbohydrates_serving ?? (nuts.carbohydrates_100g ?? 0) * scale,
          ),
          fatG: round1(nuts.fat_serving ?? (nuts.fat_100g ?? 0) * scale),
          fiberG: round1(nuts.fiber_serving ?? (nuts.fiber_100g ?? 0) * scale),
          sugarG: round1(nuts.sugars_serving ?? (nuts.sugars_100g ?? 0) * scale),
          sodiumMg: Math.round(
            (nuts.sodium_serving ?? (nuts.sodium_100g ?? 0) * scale) *
              ((nuts.sodium_serving ?? nuts.sodium_100g ?? 0) < 2 ? 1000 : 1),
          ),
          grams: 28,
          source: "Open Food Facts",
          sourceUrl:
            product.url ||
            (product.code
              ? `https://world.openfoodfacts.org/product/${product.code}`
              : "https://world.openfoodfacts.org/"),
        },
        guessCategory(`${product.brands ?? ""} ${product.product_name}`),
      );
    })
    .filter((snack): snack is SnackRecord => Boolean(snack));
}

async function pickWithAi(query: string, snacks: SnackRecord[], apiKey: string) {
  const list = snacks
    .map((snack, index) => `${index}. ${snack.name} — ${snack.calories} kcal / ${snack.grams}g`)
    .join("\n");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen/qwen3.6-27b",
      temperature: 0.1,
      max_completion_tokens: 400,
      reasoning_effort: "none",
      messages: [
        {
          role: "system",
          content:
            "Pick the best matching packaged snack from published nutrition rows. Prefer a standard labeled US serving. Reply with JSON only: {\"index\":0,\"reason\":\"short\"}",
        },
        {
          role: "user",
          content: `User asked for: ${query}\n\n${list}`,
        },
      ],
    }),
  });
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  const parsed = JSON.parse(text.slice(start, end + 1)) as {
    index?: number;
    reason?: string;
  };
  const index = Number(parsed.index);
  return {
    index: Number.isInteger(index) && index >= 0 && index < snacks.length ? index : 0,
    reason: String(parsed.reason ?? "Closest published snack label."),
  };
}

function guessCategory(name: string): SnackRecord["category"] {
  const blob = name.toLowerCase();
  if (/cookie|oreo|ahoy|nutter|pop-tart|poptart|hostess|debbie|newton|nilla/.test(blob)) {
    return "cookies";
  }
  if (/bar|clif|kind|chewy|nutri/.test(blob)) return "bars";
  if (/m&m|skittle|snicker|reeses|kit kat|twix|gummy|candy/.test(blob)) return "candy";
  if (/cheeto|puff|booty|smartfood|hippeas/.test(blob)) return "puffs";
  if (/cracker|ritz|goldfish|cheez|triscuit|pretzel/.test(blob)) return "crackers";
  if (/chip|dorito|lays|ruffle|pringles|takis|frito|tostito|bugle|hot fries/.test(blob)) {
    return "chips";
  }
  return "other";
}

function dedupe(snacks: SnackRecord[]) {
  const seen = new Set<string>();
  return snacks.filter((snack) => {
    const key = snack.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (seen.has(key) || snack.calories < 20 || snack.calories > 900) return false;
    seen.add(key);
    return true;
  });
}

function readString(body: unknown, key: string, max: number) {
  if (
    typeof body !== "object" ||
    body === null ||
    !(key in body) ||
    typeof (body as Record<string, unknown>)[key] !== "string"
  ) {
    return "";
  }
  return ((body as Record<string, unknown>)[key] as string).trim().slice(0, max);
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}
