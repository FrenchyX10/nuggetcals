"use client";

import { classifyMealPhoto, looksLikeBerries } from "@/lib/classify-image";
import type { FoodLabel } from "@/lib/free-analyze";

export type LocalSight = {
  caption: string;
  labels: FoodLabel[];
  portionGrams: number;
  coverage: number;
};

export async function inspectMealPhoto(
  imageDataUrl: string,
  restaurant: string,
  dishHint: string,
): Promise<LocalSight> {
  const [portion, berries, foodLabels] = await Promise.all([
    estimateCoverage(imageDataUrl),
    looksLikeBerries(imageDataUrl),
    classifyMealPhoto(imageDataUrl, restaurant, dishHint),
  ]);

  const labels = refineLabels(foodLabels, dishHint, berries);
  const main = labels[0]?.label ?? "meal";
  const portionGrams = gramsFromCoverage(main, portion.coverage);

  return {
    caption: main,
    labels,
    portionGrams,
    coverage: portion.coverage,
  };
}

function refineLabels(labels: FoodLabel[], dishHint: string, berries: boolean) {
  const hint = dishHint.toLowerCase();
  const next = labels.map((item) => {
    const text = item.label.toLowerCase();
    let score = item.score;
    if (berries && /\bpancake|waffle|french toast\b/.test(text)) {
      score += 0.35;
    }
    if (hint && text.includes(hint)) score += 0.25;
    return { ...item, score, text };
  });

  const top = next.sort((a, b) => b.score - a.score);
  const topText = `${top[0]?.text ?? ""} ${hint}`;
  const isBreakfast =
    /\bpancake|waffle|french toast|hotcake|flapjack\b/.test(topText) || berries;
  const userSaidChicken = /\bchicken|nugget|tender|wing\b/.test(hint);

  const cleaned = top
    .filter((item) => {
      if (isBreakfast && !userSaidChicken && /\bchicken|nugget|tender|wing\b/.test(item.text)) {
        return false;
      }
      if (userSaidChicken && /\bpancake|waffle\b/.test(item.text)) return false;
      return true;
    })
    .map(({ text: _text, ...item }) =>
      berries && /\bpancake\b/.test(item.label.toLowerCase())
        ? { ...item, label: "blueberry pancakes", score: item.score + 0.2 }
        : item,
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  if (berries && !cleaned.some((item) => item.label.toLowerCase().includes("pancake"))) {
    cleaned.unshift({ label: "blueberry pancakes", score: 0.82 });
  }

  return cleaned;
}

async function estimateCoverage(imageDataUrl: string) {
  const image = await loadImage(imageDataUrl);
  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { coverage: 0.35 };
  ctx.drawImage(image, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  let food = 0;
  let plate = 0;
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const a = data[i + 3] ?? 0;
    if (a < 40) continue;
    total += 1;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const light = (r + g + b) / (3 * 255);
    const cx = ((i / 4) % size) / size - 0.5;
    const cy = Math.floor(i / 4 / size) / size - 0.5;
    const dist = Math.hypot(cx, cy);
    const looksPlate = light > 0.62 && sat < 0.18 && dist < 0.42;
    const looksFood = sat > 0.16 && light > 0.12 && light < 0.78 && !looksPlate;
    if (looksPlate) plate += 1;
    else if (looksFood) food += 1;
    else if (dist < 0.38) food += 0.35;
  }

  const denom = plate > 80 ? plate + food : Math.max(total * 0.55, food);
  return {
    coverage: Math.min(0.92, Math.max(0.12, food / Math.max(denom, 1))),
  };
}

function gramsFromCoverage(foodName: string, coverage: number) {
  const name = foodName.toLowerCase();
  const area = coverage * 220;
  let thickness = 2.2;
  let density = 0.85;

  if (/\bpancake|waffle|french toast\b/.test(name)) {
    thickness = 2.8;
    density = 0.72;
  } else if (/\bchicken breast|grilled chicken|rotisserie\b/.test(name)) {
    thickness = 2.1;
    density = 1.05;
  } else if (/\bfried chicken|tender|nugget\b/.test(name)) {
    thickness = 2.4;
    density = 0.85;
  } else if (/\bburger|sandwich\b/.test(name)) {
    thickness = 4.0;
    density = 0.65;
  } else if (/\bfries|fry\b/.test(name)) {
    thickness = 3.2;
    density = 0.32;
  } else if (/\bsalad|greens\b/.test(name)) {
    thickness = 4.5;
    density = 0.22;
  } else if (/\bpizza\b/.test(name)) {
    thickness = 1.3;
    density = 0.72;
  } else if (/\bpasta|rice|bowl\b/.test(name)) {
    thickness = 3.0;
    density = 0.7;
  }

  return Math.round(Math.min(900, Math.max(60, area * thickness * density)));
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that photo."));
    image.src = src;
  });
}
