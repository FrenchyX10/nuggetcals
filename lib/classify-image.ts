"use client";

import { candidateLabels } from "@/lib/nutrition-data";
import type { FoodLabel } from "@/lib/free-analyze";

const FOOD101_MODEL = "onnx-community/swin-finetuned-food101-ONNX";

const FOOD101_ALIAS: Record<string, string> = {
  pancakes: "blueberry pancakes",
  waffles: "waffles",
  french_toast: "french toast",
  breakfast_burrito: "breakfast burrito",
  hamburger: "hamburger",
  hot_dog: "hot dog",
  pizza: "cheese pizza",
  french_fries: "french fries",
  fried_rice: "fried rice",
  fried_calamari: "fried calamari",
  chicken_wings: "chicken wings",
  chicken_curry: "chicken curry",
  chicken_quesadilla: "chicken quesadilla",
  grilled_salmon: "grilled salmon",
  grilled_cheese_sandwich: "grilled cheese",
  club_sandwich: "club sandwich",
  steak: "steak",
  sushi: "sushi platter",
  sashimi: "sashimi",
  tacos: "taco",
  nachos: "nachos",
  ramen: "ramen",
  pho: "pho",
  pad_thai: "pad thai",
  spaghetti_bolognese: "spaghetti with meat sauce",
  spaghetti_carbonara: "spaghetti carbonara",
  lasagna: "lasagna",
  ravioli: "ravioli",
  macaroni_and_cheese: "macaroni and cheese",
  omelette: "omelette",
  donuts: "donuts",
  ice_cream: "ice cream scoop",
  cheesecake: "cheesecake",
  chocolate_cake: "chocolate cake",
  carrot_cake: "chocolate cake",
  apple_pie: "chocolate cake",
  caesar_salad: "caesar salad",
  greek_salad: "greek salad",
  beet_salad: "garden salad",
  spring_rolls: "dumplings",
  gyoza: "dumplings",
  dumplings: "dumplings",
  guacamole: "guacamole",
  hummus: "hummus with pita",
  onion_rings: "onion rings",
  bread_pudding: "pancakes with syrup",
  beignets: "donuts",
  churros: "donuts",
  frozen_yogurt: "ice cream scoop",
  poutine: "french fries",
  prime_rib: "steak",
  filet_mignon: "steak",
  pork_chop: "steak",
  baby_back_ribs: "fried chicken",
  peking_duck: "rotisserie chicken",
  fish_and_chips: "fish and chips",
  lobster_roll_sandwich: "sandwich",
  pulled_pork_sandwich: "sandwich",
  shrimp_and_grits: "omelette",
  eggs_benedict: "omelette",
  huevos_rancheros: "omelette",
  bibimbap: "bibimbap",
  paella: "fried rice",
  risotto: "rice",
  gnocchi: "pasta plate",
  miso_soup: "soup",
  clam_chowder: "clam chowder",
  french_onion_soup: "soup",
  hot_and_sour_soup: "soup",
  lobster_bisque: "soup",
  garlic_bread: "garlic bread",
  falafel: "falafel wrap",
  samosa: "dumplings",
  takoyaki: "dumplings",
  cannoli: "donuts",
  macarons: "donuts",
  panna_cotta: "cheesecake",
  tiramisu: "cheesecake",
  strawberry_shortcake: "chocolate cake",
  red_velvet_cake: "chocolate cake",
  chocolate_mousse: "chocolate cake",
  creme_brulee: "cheesecake",
  baklava: "donuts",
  cup_cakes: "chocolate cake",
  crab_cakes: "fish and chips",
  scallops: "grilled salmon",
  mussels: "soup",
  oysters: "soup",
  seaweed_salad: "garden salad",
  caprese_salad: "garden salad",
  tuna_tartare: "sushi",
  beef_tartare: "steak",
  beef_carpaccio: "steak",
  foie_gras: "steak",
  escargots: "soup",
  cheese_plate: "grilled cheese",
  edamame: "garden salad",
  bruschetta: "garlic bread",
  croque_madame: "grilled cheese",
  deviled_eggs: "omelette",
};

let food101Promise: Promise<
  (image: string) => Promise<Array<{ label: string; score: number }>>
> | null = null;

async function loadFood101() {
  const { pipeline } = await import("@huggingface/transformers");
  const pipe = await pipeline("image-classification", FOOD101_MODEL, {
    dtype: "q8",
  });
  return async (image: string) => {
    const raw = await pipe(image, { top_k: 8 });
    const rows = Array.isArray(raw) ? raw : [raw];
    return rows.flatMap((row) => {
      if (!row || typeof row !== "object") return [];
      const label = "label" in row ? String(row.label ?? "") : "";
      const score = "score" in row ? Number(row.score ?? 0) : 0;
      return label ? [{ label, score }] : [];
    });
  };
}

export async function classifyMealPhoto(
  imageDataUrl: string,
  restaurant: string,
  dishHint = "",
): Promise<FoodLabel[]> {
  try {
    if (!food101Promise) food101Promise = loadFood101();
    const classify = await Promise.race([
      food101Promise,
      timeout(120000, "Food classifier took too long to download."),
    ]);
    const raw = await classify(imageDataUrl);
    const mapped = mapFood101(raw, dishHint, imageDataUrl);
    if (mapped.length > 0 && (mapped[0]?.score ?? 0) >= 0.12) {
      return mapped;
    }
  } catch (error) {
    console.warn("Food-101 classifier unavailable.", error);
    food101Promise = null;
  }

  const { labels } = candidateLabels(restaurant, dishHint);
  return labels.slice(0, 8).map((label, index) => ({
    label,
    score: Math.max(0.15, 0.4 - index * 0.04),
  }));
}

function mapFood101(
  rows: Array<{ label: string; score: number }>,
  dishHint: string,
  _imageDataUrl: string,
): FoodLabel[] {
  const hint = dishHint.toLowerCase();
  const berries = /\b(blueberr|berry|berries)\b/.test(hint);

  return rows
    .map((row) => {
      const key = normalizeFood101(row.label);
      let mapped = FOOD101_ALIAS[key] ?? key.replaceAll("_", " ");
      if (key === "pancakes" && berries) mapped = "blueberry pancakes";
      if (key === "waffles" && berries) mapped = "waffles with fruit";

      let score = row.score;
      if (hint && mapped.includes(hint)) score += 0.2;
      if (key === "pancakes" && /\bchicken|fried chicken|burrito|taco|wrap\b/.test(hint)) {
        score -= 0.6;
      }
      if (key === "pancakes") score -= 0.08;
      if (key === "breakfast_burrito" || mapped.includes("burrito")) score += 0.06;
      return { label: mapped, score, key };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ label, score }) => ({ label, score }));
}

function normalizeFood101(label: string) {
  return label.toLowerCase().replace(/['’]/g, "").replace(/\s+/g, "_").trim();
}

function timeout(ms: number, message: string) {
  return new Promise<never>((_, reject) => {
    window.setTimeout(() => reject(new Error(message)), ms);
  });
}

export async function looksLikeBerries(imageDataUrl: string) {
  try {
    const image = await loadImage(imageDataUrl);
    const size = 80;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return false;
    ctx.drawImage(image, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    let berry = 0;
    let counted = 0;
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      counted += 1;
      if (b > 70 && b > r + 15 && b > g + 10 && r < 120) berry += 1;
    }
    return berry / Math.max(counted, 1) > 0.015;
  } catch {
    return false;
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that photo."));
    image.src = src;
  });
}
