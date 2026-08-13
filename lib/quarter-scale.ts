"use client";

/** US quarter diameter, face-on. */
export const QUARTER_DIAMETER_MM = 24.26;

export type QuarterScale = {
  found: boolean;
  radiusPx: number;
  mmPerPixel: number;
  confidence: number;
  foodAreaMm2: number;
};

type Pixel = { x: number; y: number };

export async function detectQuarterScale(imageDataUrl: string): Promise<QuarterScale> {
  const empty: QuarterScale = {
    found: false,
    radiusPx: 0,
    mmPerPixel: 0,
    confidence: 0,
    foodAreaMm2: 0,
  };

  const image = await loadImage(imageDataUrl);
  const size = 220;
  const scale = Math.min(size / image.width, size / image.height, 1);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return empty;
  ctx.drawImage(image, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);

  const metallic = new Uint8Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const a = data[i + 3] ?? 0;
    if (a < 40) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const light = (r + g + b) / (3 * 255);
    const gray = Math.abs(r - g) < 28 && Math.abs(g - b) < 28 && Math.abs(r - b) < 32;
    const silver = gray && sat < 0.22 && light > 0.38 && light < 0.88;
    const copperEdge = r > 110 && r > g + 12 && g > b && sat < 0.45 && light > 0.28 && light < 0.75;
    if (silver || copperEdge) metallic[p] = 1;
  }

  const blobs = connectedBlobs(metallic, width, height);
  const minDim = Math.min(width, height);
  let best: { radius: number; circular: number; count: number } | null = null;

  for (const blob of blobs) {
    if (blob.length < 28 || blob.length > width * height * 0.08) continue;
    const cx = blob.reduce((sum, p) => sum + p.x, 0) / blob.length;
    const cy = blob.reduce((sum, p) => sum + p.y, 0) / blob.length;
    const radii = blob.map((p) => Math.hypot(p.x - cx, p.y - cy));
    const radius = radii.reduce((sum, r) => sum + r, 0) / radii.length;
    if (radius < minDim * 0.025 || radius > minDim * 0.18) continue;
    const variance =
      radii.reduce((sum, r) => sum + (r - radius) ** 2, 0) / Math.max(radii.length, 1);
    const circular = 1 - Math.min(1, Math.sqrt(variance) / Math.max(radius, 1));
    const areaRatio = blob.length / Math.max(Math.PI * radius * radius, 1);
    if (circular < 0.72 || areaRatio < 0.45 || areaRatio > 1.35) continue;
    const score = circular * areaRatio * blob.length;
    if (!best || score > best.count) {
      best = { radius, circular, count: score };
    }
  }

  if (!best) return empty;

  const mmPerPixel = QUARTER_DIAMETER_MM / (2 * best.radius);
  const foodPixels = countFoodPixels(data, width, height, metallic);
  const foodAreaMm2 = foodPixels * mmPerPixel * mmPerPixel;

  return {
    found: true,
    radiusPx: best.radius,
    mmPerPixel,
    confidence: clamp(best.circular, 0.55, 0.95),
    foodAreaMm2,
  };
}

export function gramsFromQuarter(
  foodName: string,
  foodAreaMm2: number,
) {
  const { thicknessMm, density } = foodProfile(foodName);
  const volumeCm3 = (foodAreaMm2 * thicknessMm) / 1000;
  const grams = volumeCm3 * density;
  return Math.round(clamp(grams, 40, 900));
}

function foodProfile(foodName: string) {
  const name = foodName.toLowerCase();
  if (/\bpancake|waffle|french toast\b/.test(name)) return { thicknessMm: 22, density: 0.72 };
  if (/\bchicken breast|grilled chicken|rotisserie\b/.test(name)) {
    return { thicknessMm: 20, density: 1.05 };
  }
  if (/\bfried chicken|tender|nugget\b/.test(name)) return { thicknessMm: 22, density: 0.85 };
  if (/\bburger|sandwich\b/.test(name)) return { thicknessMm: 38, density: 0.62 };
  if (/\bfries|fry\b/.test(name)) return { thicknessMm: 28, density: 0.32 };
  if (/\bsalad|greens\b/.test(name)) return { thicknessMm: 40, density: 0.22 };
  if (/\bpizza\b/.test(name)) return { thicknessMm: 12, density: 0.72 };
  if (/\bpasta|rice|bowl\b/.test(name)) return { thicknessMm: 28, density: 0.7 };
  return { thicknessMm: 20, density: 0.8 };
}

function countFoodPixels(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  metallic: Uint8Array,
) {
  let food = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const p = y * width + x;
      if (metallic[p]) continue;
      const i = p * 4;
      const r = data[i] ?? 0;
      const g = data[i + 1] ?? 0;
      const b = data[i + 2] ?? 0;
      const a = data[i + 3] ?? 0;
      if (a < 40) continue;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      const light = (r + g + b) / (3 * 255);
      const looksPlate = light > 0.78 && sat < 0.12;
      const looksTable = light < 0.14 || (sat < 0.08 && light > 0.82);
      if (!looksPlate && !looksTable && sat > 0.14 && light > 0.12 && light < 0.8) {
        food += 1;
      }
    }
  }
  return food;
}

function connectedBlobs(mask: Uint8Array, width: number, height: number) {
  const seen = new Uint8Array(mask.length);
  const blobs: Pixel[][] = [];
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const start = y * width + x;
      if (!mask[start] || seen[start]) continue;
      const blob: Pixel[] = [];
      const stack = [start];
      seen[start] = 1;
      while (stack.length) {
        const idx = stack.pop() ?? 0;
        const px = idx % width;
        const py = Math.floor(idx / width);
        blob.push({ x: px, y: py });
        for (const [dx, dy] of dirs) {
          const nx = px + dx;
          const ny = py + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const nidx = ny * width + nx;
          if (!mask[nidx] || seen[nidx]) continue;
          seen[nidx] = 1;
          stack.push(nidx);
        }
      }
      blobs.push(blob);
    }
  }
  return blobs;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that photo."));
    image.src = src;
  });
}
