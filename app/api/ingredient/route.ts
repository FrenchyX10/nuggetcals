import { searchIngredients, type IngredientRecord } from "@/lib/ingredients-data";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const query = readString(body, "query", 80);
  if (query.length < 2) {
    return Response.json({ error: "Type an ingredient." }, { status: 400 });
  }

  const local = searchIngredients(query).slice(0, 8);
  let remote: IngredientRecord[] = [];
  try {
    remote = await searchUsdaIngredient(query);
  } catch {
    remote = [];
  }

  return Response.json({
    ingredients: dedupe([...local, ...remote]).slice(0, 12),
  });
}

async function searchUsdaIngredient(query: string): Promise<IngredientRecord[]> {
  const key = process.env.USDA_API_KEY?.trim() || "DEMO_KEY";
  const response = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        query,
        dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)"],
        pageSize: 8,
      }),
    },
  );
  if (!response.ok) throw new Error("USDA ingredient search failed.");
  const data = (await response.json()) as {
    foods?: Array<{
      fdcId?: number;
      description?: string;
      foodNutrients?: Array<{
        nutrientName?: string;
        nutrientNumber?: string;
        value?: number;
        unitName?: string;
      }>;
    }>;
  };

  const found: IngredientRecord[] = [];
  for (const food of data.foods ?? []) {
      const calories = nutrient(food.foodNutrients, ["energy"], "208");
      if (!calories || !food.description) continue;
      const id = food.fdcId ? String(food.fdcId) : "";
      found.push({
        name: food.description.slice(0, 80),
        aliases: [] as string[],
        caloriesPer100: Math.round(calories),
        proteinG: nutrient(food.foodNutrients, ["protein"]) ?? 0,
        carbsG: nutrient(food.foodNutrients, ["carbohydrate"]) ?? 0,
        fatG: nutrient(food.foodNutrients, ["total lipid", "fat"]) ?? 0,
        fiberG: nutrient(food.foodNutrients, ["fiber"]) ?? 0,
        sugarG: nutrient(food.foodNutrients, ["sugars"]) ?? 0,
        sodiumMg: nutrient(food.foodNutrients, ["sodium"]) ?? 0,
        units: [
          { label: "100 g", grams: 100 },
          { label: "1 oz", grams: 28 },
          { label: "1/2 cup", grams: 80 },
          { label: "1 cup", grams: 160 },
        ],
        source: "USDA FoodData Central",
        sourceUrl: id
          ? `https://fdc.nal.usda.gov/food-details/${id}/nutrients`
          : "https://fdc.nal.usda.gov/",
      });
  }
  return found;
}

function nutrient(
  rows: Array<{
    nutrientName?: string;
    nutrientNumber?: string;
    value?: number;
    unitName?: string;
  }> = [],
  names: string[],
  number?: string,
) {
  const row = rows.find((item) => {
    if (number && item.nutrientNumber === number) return true;
    const label = (item.nutrientName ?? "").toLowerCase();
    return names.some((name) => label.includes(name));
  });
  if (!row || typeof row.value !== "number") return null;
  if ((row.unitName ?? "").toLowerCase() === "kj") return row.value / 4.184;
  return row.value;
}

function dedupe(items: IngredientRecord[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.name.toLowerCase();
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
