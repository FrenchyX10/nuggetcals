import { getVisionAuth } from "@/lib/keys";
import { mealAnalysisSchema } from "@/lib/schema";
import { enrichCaloriesFromSources } from "@/lib/calorie-lookup";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const restaurant = readString(body, "restaurant", 80);
  const groqKey = readString(body, "groqKey", 200);
  const mealRaw =
    typeof body === "object" && body !== null && "meal" in body
      ? (body as { meal: unknown }).meal
      : null;

  const parsed = mealAnalysisSchema.safeParse(mealRaw);
  if (!parsed.success) {
    return Response.json({ error: "Send the confirmed meal to look up calories." }, { status: 400 });
  }

  const auth = groqKey
    ? { provider: "groq" as const, key: groqKey }
    : getVisionAuth();

  try {
    const meal = await enrichCaloriesFromSources(parsed.data, {
      restaurant,
      apiKey: auth?.key,
    });
    return Response.json({ meal });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Calorie lookup failed.";
    console.error("Calorie lookup failed:", error);
    return Response.json({ error: message }, { status: 502 });
  }
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
