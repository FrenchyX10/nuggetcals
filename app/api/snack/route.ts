import { getVisionAuth } from "@/lib/keys";
import { snackFromFood, searchLocalSnacks, type SnackRecord } from "@/lib/snacks-data";

export const runtime = "nodejs";
export const maxDuration = 30;

type UsdaFood = {
  fdcId?: number;
  description?: string;
  brandName?: string;
  brandOwner?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients?: Array<{
    nutrientName?: string;
    value?: number;
    unitName?: string;
  }>;
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const query = readString(body, "query", 80);
  const groqKey = readString(body, "groqKey", 200);
  if (query.length < 2) {
    return Response.json({ error: "Type a snack name to look up." }, { status: 400 });
  }

  const local = searchLocalSnacks(query).slice(0, 6);
  let remote: SnackRecord[] = [];
  try {
    remote = await searchUsda(query);
  } catch {
    try {
      remote = await searchOpenFoodFacts(query);
    } catch {
      remote = [];
    }
  }

  const merged = dedupe([...local, ...remote]).slice(0, 10);
  if (merged.length === 0) {
    return Response.json({
      snacks: [],
      message: "No published snack label matched that name.",
    });
  }

  const auth = groqKey ? { key: groqKey } : getVisionAuth();
  let picked = 0;
  let reason = "Top published label match.";
  if (auth && merged.length > 1) {
    try {
      const choice = await pickWithAi(query, merged, auth.key);
      picked = choice.index;
      reason = choice.reason;
    } catch {
      /* keep first result */
    }
  }

  return Response.json({
    snacks: merged,
    picked,
    reason,
    engine: auth ? "usda+ai" : "usda",
  });
}

async function searchUsda(query: string): Promise<SnackRecord[]> {
  const key = process.env.USDA_API_KEY?.trim() || "DEMO_KEY";
  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.searchParams.set("api_key", key);
  url.searchParams.set("query", query);
  url.searchParams.set("dataType", "Branded");
  url.searchParams.set("pageSize", "8");
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("USDA search failed.");
  const data = (await response.json()) as { foods?: UsdaFood[] };
  return (data.foods ?? [])
    .map((food) => usdaToSnack(food))
    .filter((snack): snack is SnackRecord => Boolean(snack));
}

function usdaToSnack(food: UsdaFood): SnackRecord | null {
  const calories = nutrient(food, ["energy"]);
  if (!calories) return null;
  const name = [food.brandName, food.description].filter(Boolean).join(" ").trim();
  if (!name) return null;
  const grams =
    food.servingSize && /g/i.test(food.servingSizeUnit ?? "g")
      ? Math.round(food.servingSize)
      : 28;
  const id = food.fdcId ? String(food.fdcId) : "";
  return snackFromFood(
    {
      name: name.slice(0, 90),
      restaurant: food.brandOwner ?? food.brandName ?? null,
      aliases: [],
      calories: Math.round(calories),
      proteinG: round1(nutrient(food, ["protein"])),
      carbsG: round1(nutrient(food, ["carbohydrate"])),
      fatG: round1(nutrient(food, ["total lipid", "total fat", "fat"])),
      fiberG: round1(nutrient(food, ["fiber"])),
      sugarG: round1(nutrient(food, ["sugars"])),
      sodiumMg: Math.round(nutrient(food, ["sodium"])),
      grams,
      source: "USDA FoodData Central branded",
      sourceUrl: id
        ? `https://fdc.nal.usda.gov/food-details/${id}/nutrients`
        : "https://fdc.nal.usda.gov/",
    },
    guessCategory(name),
  );
}

function nutrient(food: UsdaFood, names: string[]) {
  const rows = food.foodNutrients ?? [];
  for (const name of names) {
    const row = rows.find((item) =>
      (item.nutrientName ?? "").toLowerCase().includes(name),
    );
    if (row && typeof row.value === "number") {
      if (name === "energy" && (row.unitName ?? "").toLowerCase() === "kj") {
        return row.value / 4.184;
      }
      return row.value;
    }
  }
  return 0;
}

async function searchOpenFoodFacts(query: string): Promise<SnackRecord[]> {
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "6");
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
      const calories = nuts["energy-kcal_serving"] ?? nuts["energy-kcal_100g"] ?? 0;
      if (!calories || !product.product_name) return null;
      const perServing = Boolean(nuts["energy-kcal_serving"]);
      const scale = perServing ? 1 : 0.28;
      return snackFromFood(
        {
          name: `${product.brands ? `${product.brands} ` : ""}${product.product_name}`.slice(0, 90),
          restaurant: product.brands || null,
          aliases: [],
          calories: Math.round(calories * scale),
          proteinG: round1((nuts.proteins_serving ?? (nuts.proteins_100g ?? 0) * scale)),
          carbsG: round1(
            (nuts.carbohydrates_serving ?? (nuts.carbohydrates_100g ?? 0) * scale),
          ),
          fatG: round1((nuts.fat_serving ?? (nuts.fat_100g ?? 0) * scale)),
          fiberG: round1((nuts.fiber_serving ?? (nuts.fiber_100g ?? 0) * scale)),
          sugarG: round1((nuts.sugars_serving ?? (nuts.sugars_100g ?? 0) * scale)),
          sodiumMg: Math.round(
            (nuts.sodium_serving ?? (nuts.sodium_100g ?? 0) * scale) * 1000,
          ),
          grams: perServing ? 28 : 28,
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
            "Pick the best matching packaged snack from published nutrition rows. Prefer a standard labeled serving of chips or snacks in the US. Reply with JSON only: {\"index\":0,\"reason\":\"short\"}",
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
  if (/cookie|oreo|ahoy|nutter/.test(blob)) return "cookies";
  if (/bar|clif|kind|chewy|nutri/.test(blob)) return "bars";
  if (/m&m|skittle|snicker|reeses|kit kat|twix|gummy|candy/.test(blob)) return "candy";
  if (/cheeto|puff|booty|smartfood/.test(blob)) return "puffs";
  if (/cracker|ritz|goldfish|cheez|triscuit|pretzel/.test(blob)) return "crackers";
  if (/chip|dorito|lays|ruffle|pringles|takis|frito|tostito/.test(blob)) return "chips";
  return "other";
}

function dedupe(snacks: SnackRecord[]) {
  const seen = new Set<string>();
  return snacks.filter((snack) => {
    const key = snack.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (seen.has(key)) return false;
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
