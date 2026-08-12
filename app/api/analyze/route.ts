import { analyzeFree, type FoodLabel } from "@/lib/free-analyze";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const restaurant = readString(body, "restaurant", 80);
  const dishHint = readString(body, "dishHint", 80);
  const caption = readString(body, "caption", 240);
  const portionGrams = readNumber(body, "portionGrams");
  const labels = parseLabels(body);

  if (labels.length === 0 && !restaurant && !dishHint && !caption) {
    return Response.json(
      { error: "Upload a photo on the home page. Analysis runs on your computer — no API key." },
      { status: 400 },
    );
  }

  const meal = analyzeFree(labels, restaurant, dishHint, {
    caption,
    portionGrams: portionGrams || undefined,
  });
  return Response.json({ meal, engine: "local" });
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

function readNumber(body: unknown, key: string) {
  if (typeof body !== "object" || body === null || !(key in body)) return 0;
  const value = Number((body as Record<string, unknown>)[key]);
  return Number.isFinite(value) ? value : 0;
}

function parseLabels(body: unknown): FoodLabel[] {
  if (
    typeof body !== "object" ||
    body === null ||
    !("labels" in body) ||
    !Array.isArray(body.labels)
  ) {
    return [];
  }

  return body.labels.flatMap((entry) => {
    if (
      typeof entry !== "object" ||
      entry === null ||
      !("label" in entry) ||
      !("score" in entry) ||
      typeof entry.label !== "string" ||
      typeof entry.score !== "number"
    ) {
      return [];
    }
    return [{ label: entry.label, score: entry.score }];
  });
}
