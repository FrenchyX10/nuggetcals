import type { FoodItem, MealAnalysis } from "@/lib/schema";
import { FOODS, findRestaurant, normalizeName } from "@/lib/nutrition-data";
import { SIZE_LABEL, SIZE_SCALE, type PortionSize } from "@/lib/portion-size";
import {
  inferFillings,
  inferKind,
  looksLikeSushi,
  matchSushiPiece,
  parsePieceCount,
  resolveSushiPieceCount,
} from "@/lib/sushi";
import {
  detectFoodFamily,
  familyUnitHits,
  parseFamilyCount,
  shouldMultiplyByCount,
} from "@/lib/food-families";

export type CalorieHit = {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  grams: number;
  source: string;
  url: string;
};

type Concluded = {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  grams: number;
  low: number;
  high: number;
  reason: string;
  source: string;
  url: string;
};

const NUTRITION_DOMAINS = [
  "fdc.nal.usda.gov",
  "world.openfoodfacts.org",
  "www.fatsecret.com",
  "fatsecret.com",
  "www.nutritionix.com",
  "nutritionix.com",
  "www.calorieking.com",
  "calorieking.com",
  "www.myfooddata.com",
  "tools.myfooddata.com",
  "nutritionvalue.org",
  "www.nutritionvalue.org",
  "fastfoodnutrition.org",
  "www.fastfoodnutrition.org",
  "www.eatthismuch.com",
];

const CHAIN_DOMAINS: Record<string, string[]> = {
  "burger king": ["www.bk.com", "bk.com"],
  mcdonalds: ["www.mcdonalds.com", "mcdonalds.com"],
  wendys: ["www.wendys.com", "wendys.com"],
  "chick-fil-a": ["www.chick-fil-a.com"],
  "taco bell": ["www.tacobell.com"],
  chipotle: ["www.chipotle.com"],
  starbucks: ["www.starbucks.com"],
  kfc: ["www.kfc.com"],
  subway: ["www.subway.com"],
  "pizza hut": ["www.pizzahut.com"],
  dominos: ["www.dominos.com"],
  "papa johns": ["www.papajohns.com"],
  "panera bread": ["www.panerabread.com"],
  "popeyes": ["www.popeyes.com"],
  "raising canes": ["www.raisingcanes.com"],
  "sonic": ["www.sonicdrivein.com"],
  "dairy queen": ["www.dairyqueen.com"],
  "five guys": ["www.fiveguys.com"],
  "in-n-out": ["www.in-n-out.com"],
  "whataburger": ["whataburger.com"],
  "arbys": ["www.arbys.com"],
  "jack in the box": ["www.jackinthebox.com"],
  "culvers": ["www.culvers.com"],
};

export async function enrichCaloriesFromSources(
  meal: MealAnalysis,
  options: { restaurant: string; apiKey?: string },
): Promise<MealAnalysis> {
  if (!meal.isFood || meal.items.length === 0) return meal;

  const needsLookup = meal.items.some(
    (item) => !(item.dataSource === "restaurant_official" && item.calories > 0),
  );

  const webHits = needsLookup
    ? await Promise.all([
        options.apiKey
          ? searchNutritionSites(meal, options.restaurant, options.apiKey).catch(
              () => [] as CalorieHit[],
            )
          : Promise.resolve([] as CalorieHit[]),
        searchDuckDuckGo(mealQuery(meal, options.restaurant)).catch(
          () => [] as CalorieHit[],
        ),
      ]).then(([a, b]) => dedupe([...a, ...b]))
    : [];

  const items = await Promise.all(
    meal.items.map((item) =>
      enrichItem(item, options.restaurant, options.apiKey, webHits),
    ),
  );

  const totals = items.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.proteinG += item.proteinG;
      acc.carbsG += item.carbsG;
      acc.fatG += item.fatG;
      acc.fiberG += item.fiberG;
      acc.sugarG += item.sugarG;
      acc.sodiumMg += item.sodiumMg;
      return acc;
    },
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, sugarG: 0, sodiumMg: 0 },
  );

  const lows = items.reduce(
    (sum, item) => sum + Math.round(item.calories * 0.88),
    0,
  );
  const highs = items.reduce(
    (sum, item) => sum + Math.round(item.calories * 1.12),
    0,
  );

  const sources = [
    ...meal.sources,
    ...items.flatMap((item) => {
      const extra = item.notes.match(/https?:\/\/\S+/g) ?? [];
      return extra.map((url) => ({
        title: sourceTitleFromUrl(url),
        url,
      }));
    }),
    ...webHits.slice(0, 8).map((hit) => ({ title: hit.source, url: hit.url })),
  ].filter(
    (source, index, all) =>
      source.url && all.findIndex((row) => row.url === source.url) === index,
  );

  const usedOfficial = items.some((item) => item.dataSource === "restaurant_official");
  const usedWeb = items.some((item) =>
    /usda|fatsecret|open food|nutrition|web/i.test(item.notes),
  );

  return {
    ...meal,
    items,
    totalCalories: Math.round(totals.calories),
    calorieRangeLow: Math.min(lows, Math.round(totals.calories)),
    calorieRangeHigh: Math.max(highs, Math.round(totals.calories)),
    proteinG: round1(totals.proteinG),
    carbsG: round1(totals.carbsG),
    fatG: round1(totals.fatG),
    fiberG: round1(totals.fiberG),
    sugarG: round1(totals.sugarG),
    sodiumMg: Math.round(totals.sodiumMg),
    method: usedOfficial ? "hybrid" : usedWeb ? "usda" : meal.method,
    overallConfidence: clamp(
      items.reduce((sum, item) => sum + item.confidence, 0) /
        Math.max(items.length, 1),
      0.4,
      0.94,
    ),
    assumptions: [
      ...meal.assumptions.filter((line) => !line.startsWith("Step 3:")),
      usedOfficial && !usedWeb
        ? "Step 3: Used the official chain menu serving — not a web average."
        : "Step 3: Searched USDA, FatSecret, Open Food Facts, and other nutrition sites, then concluded one serving from the numbers that agreed.",
    ].slice(0, 7),
    precisionNotes: usedOfficial
      ? "Official chain calories stay official. Homemade items are a consensus from multiple published sites, scaled to small / medium / large."
      : "Calories are a consensus from multiple published sites (not one lookup), then scaled to small / medium / large.",
    sources: sources.slice(0, 10),
  };
}

async function enrichItem(
  item: FoodItem,
  restaurant: string,
  apiKey: string | undefined,
  webHits: CalorieHit[],
): Promise<FoodItem> {
  if (item.dataSource === "restaurant_official" && item.calories > 0) return item;

  const pieces = looksLikeSushi(item.name, item.notes, item.portionDescription)
    ? resolveSushiPieceCount({
        name: item.name,
        notes: `${item.portionDescription} ${item.notes}`,
        reported:
          parsePieceCount(`${item.name} ${item.portionDescription} ${item.notes}`, 0) ||
          parseFamilyCount(`${item.name} ${item.portionDescription} ${item.notes}`, 0),
      })
    : parsePieceCount(`${item.name} ${item.portionDescription} ${item.notes}`, 0) ||
      parseFamilyCount(`${item.name} ${item.portionDescription} ${item.notes}`, 0);
  const family = detectFoodFamily(item.name, item.notes, item.portionDescription);
  const query = [
    restaurant,
    pieces > 0
      ? `${item.name} ${pieces} ${family === "pizza" ? "slices" : family === "taco" ? "tacos" : "pieces"} calories each`
      : item.name,
  ]
    .filter(Boolean)
    .join(" ");
  const size = (item.portionSize ?? "medium") as PortionSize;
  const [usda, off, local, fatsecret] = await Promise.all([
    searchUsda(query).catch(() => [] as CalorieHit[]),
    searchOpenFoodFacts(query).catch(() => [] as CalorieHit[]),
    Promise.resolve(searchLocal(query)),
    searchFatSecret(query).catch(() => [] as CalorieHit[]),
  ]);

  const relatedWeb = webHits.filter((hit) => namesOverlap(query, hit.name) || namesOverlap(query, hit.source));
  const current =
    item.calories > 0
      ? [
          {
            name: item.name,
            calories: item.calories,
            proteinG: item.proteinG,
            carbsG: item.carbsG,
            fatG: item.fatG,
            fiberG: item.fiberG,
            sugarG: item.sugarG,
            sodiumMg: item.sodiumMg,
            grams: item.estimatedGrams || 150,
            source: "Built-in published row",
            url: item.notes.match(/https?:\/\/\S+/)?.[0] ?? "https://fdc.nal.usda.gov/",
          } satisfies CalorieHit,
        ]
      : [];

  const hits = dedupe([
    ...sushiPieceHits(item),
    ...(family ? familyUnitHits(item.name, `${item.notes} ${item.portionDescription}`, family) : []),
    ...local,
    ...usda,
    ...off,
    ...fatsecret,
    ...relatedWeb,
    ...current,
  ]).slice(0, 14);

  if (hits.length === 0) return item;

  const picked = apiKey
    ? await concludeEstimate(query, size, hits, apiKey).catch(() =>
        medianConsensus(hits),
      )
    : medianConsensus(hits);

  const scale = unitCalorieScale(item, picked, pieces, size);
  const sourceCount = hits.length;
  const spread =
    picked.calories > 0 ? (picked.high - picked.low) / picked.calories : 0.2;

  return {
    ...item,
    calories: Math.round(picked.calories * scale),
    proteinG: round1(picked.proteinG * scale),
    carbsG: round1(picked.carbsG * scale),
    fatG: round1(picked.fatG * scale),
    fiberG: round1(picked.fiberG * scale),
    sugarG: round1(picked.sugarG * scale),
    sodiumMg: Math.round(picked.sodiumMg * scale),
    estimatedGrams: Math.round((picked.grams || item.estimatedGrams || 150) * scale),
    dataSource: /usda/i.test(picked.source) ? "usda" : "nutrition_database",
    portionDescription: (
      pieces > 0
        ? `${pieces} pieces · ${picked.source}`
        : `${SIZE_LABEL[size]} · ${picked.source}`
    ).slice(0, 80),
    notes: (
      pieces > 0
        ? `${picked.reason} (${Math.round(picked.calories)} kcal × ${pieces} pieces). ${picked.url}`
        : `${picked.reason} (${Math.round(picked.calories)} kcal serving × ${SIZE_LABEL[size]}). ${picked.url}`
    ).slice(0, 280),
    confidence: clamp(0.66 + sourceCount * 0.02 - spread * 0.25, 0.55, 0.93),
  };
}

async function searchNutritionSites(
  meal: MealAnalysis,
  restaurant: string,
  apiKey: string,
): Promise<CalorieHit[]> {
  const foods = meal.items
    .filter((item) => item.dataSource !== "restaurant_official" || item.calories <= 0)
    .map((item) => `- ${item.portionSize ?? "medium"} ${item.name}`)
    .join("\n");
  if (!foods) return [];

  const chain = findRestaurant(restaurant);
  const include = [
    ...NUTRITION_DOMAINS,
    ...(chain ? CHAIN_DOMAINS[normalizeName(chain)] ?? [] : []),
  ];

  const response = await fetchJson(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "groq/compound",
        temperature: 0,
        max_completion_tokens: 900,
        search_settings: {
          include_domains: include,
          country: "united states",
        },
        messages: [
          {
            role: "system",
            content:
              "You look up published nutrition. Search USDA FoodData Central, FatSecret, Nutritionix, CalorieKing, MyFoodData, Open Food Facts, and the official restaurant page if a chain is named. Visit at least three different sites. Prefer a typical 1-serving plated portion, not a 100g lab row or a whole recipe. Reply JSON only.",
          },
          {
            role: "user",
            content: `Restaurant: ${restaurant || "none (homemade / generic)"}
Identified foods:
${foods}

For each food find calorie numbers from multiple sites, then conclude one typical medium serving.

Return JSON:
{"items":[{"name":"","calories":0,"proteinG":0,"carbsG":0,"fatG":0,"fiberG":0,"sugarG":0,"sodiumMg":0,"grams":0,"low":0,"high":0,"sources":[{"title":"","url":"","calories":0}]}]}`,
          },
        ],
      }),
    },
    22000,
  );

  const message = response?.choices?.[0]?.message as
    | {
        content?: string;
        executed_tools?: Array<{
          search_results?: {
            results?: Array<{ title?: string; url?: string; content?: string }>;
          };
        }>;
      }
    | undefined;

  const fromJson = parseWebItems(message?.content ?? "");
  const fromSnippets = (message?.executed_tools ?? []).flatMap((tool) =>
    (tool.search_results?.results ?? []).flatMap((row) =>
      hitsFromSnippet(row.title ?? "", row.content ?? "", row.url ?? ""),
    ),
  );
  return dedupe([...fromJson, ...fromSnippets]);
}

function parseWebItems(text: string): CalorieHit[] {
  const parsed = parseJsonObject(text) as
    | {
        items?: Array<{
          name?: string;
          calories?: number;
          proteinG?: number;
          carbsG?: number;
          fatG?: number;
          fiberG?: number;
          sugarG?: number;
          sodiumMg?: number;
          grams?: number;
          sources?: Array<{ title?: string; url?: string; calories?: number }>;
        }>;
      }
    | null;
  if (!parsed?.items?.length) return [];

  const hits: CalorieHit[] = [];
  for (const item of parsed.items) {
    const sources = item.sources ?? [];
    if (item.calories && item.name) {
      hits.push({
        name: item.name,
        calories: item.calories,
        proteinG: item.proteinG ?? 0,
        carbsG: item.carbsG ?? 0,
        fatG: item.fatG ?? 0,
        fiberG: item.fiberG ?? 0,
        sugarG: item.sugarG ?? 0,
        sodiumMg: item.sodiumMg ?? 0,
        grams: item.grams || 150,
        source: sources[0]?.title || "Web nutrition consensus",
        url: sources[0]?.url || "https://fdc.nal.usda.gov/",
      });
    }
    for (const source of sources) {
      if (!source.calories || !item.name) continue;
      hits.push({
        name: `${item.name} · ${source.title || "site"}`,
        calories: source.calories,
        proteinG: item.proteinG ?? 0,
        carbsG: item.carbsG ?? 0,
        fatG: item.fatG ?? 0,
        fiberG: item.fiberG ?? 0,
        sugarG: item.sugarG ?? 0,
        sodiumMg: item.sodiumMg ?? 0,
        grams: item.grams || 150,
        source: source.title || "Nutrition site",
        url: source.url || "https://fdc.nal.usda.gov/",
      });
    }
  }
  return hits;
}

async function concludeEstimate(
  query: string,
  size: PortionSize,
  hits: CalorieHit[],
  apiKey: string,
): Promise<Concluded> {
  const list = hits
    .map(
      (hit, index) =>
        `${index}. ${hit.name} — ${hit.calories} kcal / ${hit.grams || "?"}g · P ${hit.proteinG} C ${hit.carbsG} F ${hit.fatG} (${hit.source}) ${hit.url}`,
    )
    .join("\n");

  const response = await fetchJson(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen/qwen3.6-27b",
        temperature: 0,
        max_completion_tokens: 350,
        reasoning_effort: "none",
        messages: [
          {
            role: "system",
            content:
              'You conclude one typical 1-serving calorie estimate from published numbers. Do not invent values that no source supports. Prefer numbers that several sites agree on. Prefer USDA / official menu / FatSecret over blogs. Prefer a plated meal serving, not a 100g lab row or a giant family pack. If the food is sushi, pizza, tacos, wings, or pancakes, pick a 1-piece / 1-slice row, not a whole platter or pie. Reply JSON only: {"calories":0,"proteinG":0,"carbsG":0,"fatG":0,"fiberG":0,"sugarG":0,"sodiumMg":0,"grams":0,"low":0,"high":0,"index":0,"reason":""}',
          },
          {
            role: "user",
            content: `Food: ${query}
Identified plate size (apply later, not now): ${size}

Published numbers from multiple sites:
${list}`,
          },
        ],
      }),
    },
    12000,
  );

  const text = response?.choices?.[0]?.message?.content ?? "";
  const parsed = parseJsonObject(text) as {
    calories?: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
    fiberG?: number;
    sugarG?: number;
    sodiumMg?: number;
    grams?: number;
    low?: number;
    high?: number;
    index?: number;
    reason?: string;
  } | null;

  const fallback = medianConsensus(hits);
  if (!parsed) return fallback;

  const indexed = Number.isInteger(parsed.index) ? hits[Number(parsed.index)] : null;
  const calories = Number(parsed.calories);
  if (!Number.isFinite(calories) || calories < 20 || calories > 1800) {
    return fallback;
  }

  const nearby = hits.filter(
    (hit) => Math.abs(hit.calories - calories) / Math.max(calories, 1) <= 0.35,
  );
  const base = nearby.length >= 2 ? averageMacros(nearby, calories) : indexed ?? fallback;

  return {
    calories: Math.round(calories),
    proteinG: num(parsed.proteinG, base.proteinG),
    carbsG: num(parsed.carbsG, base.carbsG),
    fatG: num(parsed.fatG, base.fatG),
    fiberG: num(parsed.fiberG, base.fiberG),
    sugarG: num(parsed.sugarG, base.sugarG),
    sodiumMg: num(parsed.sodiumMg, base.sodiumMg),
    grams: num(parsed.grams, base.grams || 150),
    low: num(parsed.low, Math.min(...hits.map((hit) => hit.calories))),
    high: num(parsed.high, Math.max(...hits.map((hit) => hit.calories))),
    reason:
      parsed.reason?.trim() ||
      `Consensus of ${hits.length} published numbers around ${Math.round(calories)} kcal`,
    source: indexed?.source || base.source || "Multi-site consensus",
    url: indexed?.url || base.url,
  };
}

function medianConsensus(hits: CalorieHit[]): Concluded {
  const sorted = [...hits].sort((a, b) => a.calories - b.calories);
  const mid = sorted[Math.floor(sorted.length / 2)] ?? hits[0];
  const calories = sorted.map((hit) => hit.calories);
  return {
    calories: mid.calories,
    proteinG: mid.proteinG,
    carbsG: mid.carbsG,
    fatG: mid.fatG,
    fiberG: mid.fiberG,
    sugarG: mid.sugarG,
    sodiumMg: mid.sodiumMg,
    grams: mid.grams || 150,
    low: calories[0] ?? mid.calories,
    high: calories[calories.length - 1] ?? mid.calories,
    reason: `Median of ${hits.length} published numbers (${calories[0]}–${calories[calories.length - 1]} kcal)`,
    source: mid.source,
    url: mid.url,
  };
}

function averageMacros(hits: CalorieHit[], calories: number): CalorieHit {
  const n = hits.length;
  return {
    name: hits[0].name,
    calories,
    proteinG: hits.reduce((sum, hit) => sum + hit.proteinG, 0) / n,
    carbsG: hits.reduce((sum, hit) => sum + hit.carbsG, 0) / n,
    fatG: hits.reduce((sum, hit) => sum + hit.fatG, 0) / n,
    fiberG: hits.reduce((sum, hit) => sum + hit.fiberG, 0) / n,
    sugarG: hits.reduce((sum, hit) => sum + hit.sugarG, 0) / n,
    sodiumMg: hits.reduce((sum, hit) => sum + hit.sodiumMg, 0) / n,
    grams: hits.reduce((sum, hit) => sum + (hit.grams || 150), 0) / n,
    source: hits[0].source,
    url: hits[0].url,
  };
}

function sushiPieceHits(item: FoodItem): CalorieHit[] {
  if (!looksLikeSushi(item.name, item.notes, item.portionDescription)) return [];
  const blob = `${item.name} ${item.notes} ${item.portionDescription}`;
  const fillings = inferFillings(blob);
  const kind = inferKind(blob, fillings);
  const piece = matchSushiPiece(item.name, fillings, kind);
  return [
    {
      name: `${piece.name} (1 piece)`,
      calories: piece.calories,
      proteinG: piece.proteinG,
      carbsG: piece.carbsG,
      fatG: piece.fatG,
      fiberG: piece.fiberG,
      sugarG: piece.sugarG,
      sodiumMg: piece.sodiumMg,
      grams: piece.grams,
      source: "Sushi per-piece table",
      url: "https://fdc.nal.usda.gov/",
    },
  ];
}

function searchLocal(query: string): CalorieHit[] {
  const needle = normalizeName(query);
  if (!needle) return [];
  return FOODS.filter((food) => {
    const blob = normalizeName(`${food.restaurant ?? ""} ${food.name} ${food.aliases.join(" ")}`);
    return blob.includes(needle) || needle.includes(normalizeName(food.name));
  })
    .slice(0, 4)
    .map((food) => ({
      name: `${food.restaurant ? `${food.restaurant} ` : ""}${food.name}`,
      calories: food.calories,
      proteinG: food.proteinG,
      carbsG: food.carbsG,
      fatG: food.fatG,
      fiberG: food.fiberG,
      sugarG: food.sugarG,
      sodiumMg: food.sodiumMg,
      grams: food.grams,
      source: food.source,
      url: food.sourceUrl,
    }));
}

async function searchUsda(query: string): Promise<CalorieHit[]> {
  const key = process.env.USDA_API_KEY?.trim() || "DEMO_KEY";
  const data = await fetchJson(
    `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        query,
        dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)", "Branded"],
        pageSize: 6,
      }),
    },
    8000,
  );
  const foods = (data?.foods ?? []) as Array<{
    description?: string;
    brandName?: string;
    fdcId?: number;
    servingSize?: number;
    servingSizeUnit?: string;
    labelNutrients?: Record<string, { value?: number } | undefined>;
    foodNutrients?: Array<{
      nutrientName?: string;
      nutrientNumber?: string;
      value?: number;
      unitName?: string;
    }>;
  }>;

  return foods
    .map((food) => {
      const label = food.labelNutrients;
      const calories =
        label?.calories?.value ??
        nutrient(food.foodNutrients, ["energy"], "208") ??
        0;
      if (!calories || !food.description) return null;
      const grams =
        food.servingSize && /g/i.test(food.servingSizeUnit ?? "")
          ? food.servingSize
          : 100;
      const perHundred = !label?.calories?.value && calories > 280;
      const scale = perHundred ? Math.min(grams, 180) / 100 : 1;
      const id = food.fdcId ? String(food.fdcId) : "";
      return {
        name: `${food.brandName ? `${food.brandName} ` : ""}${food.description}`.slice(0, 80),
        calories: Math.round(calories * scale),
        proteinG: round1((label?.protein?.value ?? nutrient(food.foodNutrients, ["protein"]) ?? 0) * scale),
        carbsG: round1(
          (label?.carbohydrates?.value ?? nutrient(food.foodNutrients, ["carbohydrate"]) ?? 0) *
            scale,
        ),
        fatG: round1(
          (label?.fat?.value ?? nutrient(food.foodNutrients, ["total lipid", "fat"]) ?? 0) * scale,
        ),
        fiberG: round1((label?.fiber?.value ?? nutrient(food.foodNutrients, ["fiber"]) ?? 0) * scale),
        sugarG: round1((label?.sugars?.value ?? nutrient(food.foodNutrients, ["sugars"]) ?? 0) * scale),
        sodiumMg: Math.round((label?.sodium?.value ?? nutrient(food.foodNutrients, ["sodium"]) ?? 0) * scale),
        grams: Math.round(perHundred ? Math.min(grams, 180) : grams),
        source: "USDA FoodData Central",
        url: id
          ? `https://fdc.nal.usda.gov/food-details/${id}/nutrients`
          : "https://fdc.nal.usda.gov/",
      } satisfies CalorieHit;
    })
    .filter((hit): hit is CalorieHit => Boolean(hit));
}

async function searchOpenFoodFacts(query: string): Promise<CalorieHit[]> {
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "5");
  const data = await fetchJson(
    url.toString(),
    { headers: { "User-Agent": "NuggetCals/1.0 (calorie lookup)" } },
    8000,
  );
  const products = (data?.products ?? []) as Array<{
    product_name?: string;
    brands?: string;
    nutriments?: Record<string, number | undefined>;
    url?: string;
    code?: string;
  }>;
  return products
    .map((product) => {
      const nuts = product.nutriments ?? {};
      const serving = nuts["energy-kcal_serving"];
      const hundred = nuts["energy-kcal_100g"] ?? nuts["energy-kcal"];
      const calories = serving ?? (hundred ? hundred * 1.5 : 0);
      if (!calories || !product.product_name) return null;
      const scale = serving ? 1 : 1.5;
      return {
        name: `${product.brands ? `${product.brands} ` : ""}${product.product_name}`.slice(0, 80),
        calories: Math.round(calories),
        proteinG: round1(nuts.proteins_serving ?? (nuts.proteins_100g ?? 0) * scale),
        carbsG: round1(nuts.carbohydrates_serving ?? (nuts.carbohydrates_100g ?? 0) * scale),
        fatG: round1(nuts.fat_serving ?? (nuts.fat_100g ?? 0) * scale),
        fiberG: round1(nuts.fiber_serving ?? (nuts.fiber_100g ?? 0) * scale),
        sugarG: round1(nuts.sugars_serving ?? (nuts.sugars_100g ?? 0) * scale),
        sodiumMg: Math.round(
          (nuts.sodium_serving ?? (nuts.sodium_100g ?? 0) * scale) *
            ((nuts.sodium_serving ?? nuts.sodium_100g ?? 0) < 2 ? 1000 : 1),
        ),
        grams: 150,
        source: "Open Food Facts",
        url:
          product.url ||
          (product.code
            ? `https://world.openfoodfacts.org/product/${product.code}`
            : "https://world.openfoodfacts.org/"),
      } satisfies CalorieHit;
    })
    .filter((hit): hit is CalorieHit => Boolean(hit));
}

async function searchFatSecret(query: string): Promise<CalorieHit[]> {
  const url = `https://www.fatsecret.com/calories-nutrition/search?q=${encodeURIComponent(query)}`;
  const html = await fetchText(
    url,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NuggetCals/1.0; +https://nuggetcals-three.vercel.app)",
        Accept: "text/html",
      },
    },
    7000,
  );
  const hits: CalorieHit[] = [];
  const row =
    /<a[^>]+href="(https?:\/\/www\.fatsecret\.com[^"]+|\/calories-nutrition\/[^"]+)"[^>]*>([^<]{3,90})<\/a>[\s\S]{0,500}?Calories:\s*([\d.]+)\s*kcal[\s\S]{0,240}?Fat:\s*([\d.]+)\s*g[\s\S]{0,160}?Carbs:\s*([\d.]+)\s*g[\s\S]{0,160}?Prot:\s*([\d.]+)\s*g/gi;
  let match: RegExpExecArray | null;
  while ((match = row.exec(html)) && hits.length < 6) {
    const href = match[1].startsWith("http")
      ? match[1]
      : `https://www.fatsecret.com${match[1]}`;
    hits.push({
      name: decodeHtml(match[2]).slice(0, 80),
      calories: Math.round(Number(match[3])),
      proteinG: Number(match[6]) || 0,
      carbsG: Number(match[5]) || 0,
      fatG: Number(match[4]) || 0,
      fiberG: 0,
      sugarG: 0,
      sodiumMg: 0,
      grams: 150,
      source: "FatSecret",
      url: href.split("?")[0],
    });
  }
  return hits.filter((hit) => hit.calories >= 20 && hit.calories <= 1800);
}

async function searchDuckDuckGo(query: string): Promise<CalorieHit[]> {
  const html = await fetchText(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`${query} calories per serving USDA OR FatSecret OR Nutritionix`)}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NuggetCals/1.0; +https://nuggetcals-three.vercel.app)",
        Accept: "text/html",
      },
    },
    7000,
  );
  const hits: CalorieHit[] = [];
  const row =
    /class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]{0,200}?class="result__snippet"[^>]*>([\s\S]*?)<\/(?:a|td|div)>/gi;
  let match: RegExpExecArray | null;
  while ((match = row.exec(html)) && hits.length < 8) {
    const title = stripTags(match[2]);
    const snippet = stripTags(match[3]);
    hits.push(...hitsFromSnippet(title, snippet, unwrapDuckLink(match[1])));
  }
  return hits;
}

function hitsFromSnippet(title: string, snippet: string, url: string): CalorieHit[] {
  const text = `${title} ${snippet}`;
  const calories = extractCalories(text);
  if (!calories || !title) return [];
  return [
    {
      name: stripTags(title).slice(0, 80),
      calories,
      proteinG: extractMacro(text, /protein[^0-9]{0,8}([\d.]+)/i),
      carbsG: extractMacro(text, /carb(?:ohydrate)?s?[^0-9]{0,8}([\d.]+)/i),
      fatG: extractMacro(text, /fat[^0-9]{0,8}([\d.]+)/i),
      fiberG: 0,
      sugarG: 0,
      sodiumMg: 0,
      grams: 150,
      source: sourceTitleFromUrl(url) || "Web nutrition result",
      url: url || "https://fdc.nal.usda.gov/",
    },
  ];
}

function extractCalories(text: string) {
  const match =
    text.match(
      /(\d{2,4}(?:\.\d+)?)\s*(?:to|-|–)\s*(\d{2,4}(?:\.\d+)?)\s*(?:kcal|calories|cals)\b/i,
    ) || text.match(/(\d{2,4}(?:\.\d+)?)\s*(?:kcal|calories|cals)\b/i);
  if (!match) return 0;
  if (match[2]) {
    return Math.round((Number(match[1]) + Number(match[2])) / 2);
  }
  return Math.round(Number(match[1]));
}

function extractMacro(text: string, pattern: RegExp) {
  const match = text.match(pattern);
  return match ? Number(match[1]) || 0 : 0;
}

function mealQuery(meal: MealAnalysis, restaurant: string) {
  return [restaurant, meal.mealName, ...meal.items.map((item) => item.name)]
    .filter(Boolean)
    .join(" ");
}

function unitCalorieScale(
  item: FoodItem,
  picked: { name?: string; source?: string; calories: number },
  pieces: number,
  size: PortionSize,
) {
  if (pieces <= 0) return SIZE_SCALE[size];
  if (shouldMultiplyByCount(item.name, picked.name ?? "", picked.calories, pieces)) {
    return pieces;
  }
  if (looksLikeSushi(item.name, picked.name ?? "", item.notes)) {
    if (picked.calories <= 95) return pieces;
    if (picked.calories >= 180 && picked.calories <= 450) return pieces / 8;
    return 1;
  }
  return SIZE_SCALE[size];
}

function namesOverlap(a: string, b: string) {
  const left = new Set(normalizeName(a).split(" ").filter((token) => token.length > 2));
  const right = normalizeName(b).split(" ").filter((token) => token.length > 2);
  if (left.size === 0 || right.length === 0) return false;
  return right.filter((token) => left.has(token)).length >= 1;
}

function sourceTitleFromUrl(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("usda") || host.includes("fdc.nal")) return "USDA FoodData Central";
    if (host.includes("fatsecret")) return "FatSecret";
    if (host.includes("openfoodfacts")) return "Open Food Facts";
    if (host.includes("nutritionix")) return "Nutritionix";
    if (host.includes("calorieking")) return "CalorieKing";
    if (host.includes("myfooddata")) return "MyFoodData";
    if (host.includes("nutritionvalue")) return "NutritionValue";
    if (host.includes("fastfoodnutrition")) return "FastFoodNutrition";
    return host;
  } catch {
    return "Published nutrition";
  }
}

function unwrapDuckLink(href: string) {
  try {
    const url = new URL(href, "https://html.duckduckgo.com");
    return url.searchParams.get("uddg") || url.searchParams.get("u") || href;
  } catch {
    return href;
  }
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseJsonObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as unknown;
  } catch {
    return null;
  }
}

async function fetchJson(url: string, init: RequestInit, ms: number) {
  const text = await fetchText(url, init, ms);
  try {
    return JSON.parse(text) as {
      choices?: Array<{ message?: { content?: string; executed_tools?: unknown[] } }>;
      foods?: unknown[];
      products?: unknown[];
    };
  } catch {
    return null;
  }
}

async function fetchText(url: string, init: RequestInit, ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) throw new Error(`Request failed ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
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

function dedupe(hits: CalorieHit[]) {
  const seen = new Set<string>();
  return hits.filter((hit) => {
    const key = `${normalizeName(hit.name)}-${Math.round(hit.calories)}`;
    if (seen.has(key) || hit.calories < 20 || hit.calories > 1800) return false;
    seen.add(key);
    return true;
  });
}

function num(value: unknown, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
