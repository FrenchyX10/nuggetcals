import { getVisionAuth } from "@/lib/keys";
import { analyzeWithFreeVision } from "@/lib/vision-ai";

export const maxDuration = 60;
export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const restaurant = readString(body, "restaurant", 80);
  const dishHint = readString(body, "dishHint", 80);
  const sizeHint = readString(body, "sizeHint", 16);
  const localGuess = readString(body, "localGuess", 120);
  const imageBase64 = readString(body, "imageBase64", 12_000_000);
  const groqKey = readString(body, "groqKey", 200);
  const quarterFound = readBoolean(body, "quarterFound");

  const auth = groqKey
    ? { provider: "groq" as const, key: groqKey }
    : getVisionAuth();

  if (!auth || !imageBase64) {
    return Response.json(
      {
        error: "missing_vision_key",
        message: "Add a free Groq API key to analyze with vision.",
      },
      { status: 401 },
    );
  }

  const approxBytes = Math.ceil((imageBase64.length * 3) / 4);
  if (approxBytes > MAX_BYTES) {
    return Response.json(
      { error: "That photo is too large. Try a closer, smaller shot." },
      { status: 413 },
    );
  }

  try {
    const meal = await analyzeWithFreeVision({
      imageBase64,
      restaurant,
      dishHint,
      sizeHint,
      localGuess,
      quarterFound,
      provider: auth.provider,
      apiKey: auth.key,
    });
    return Response.json({ meal, engine: auth.provider });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Vision analysis failed.";
    console.error("Vision analyze failed:", error);
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

function readBoolean(body: unknown, key: string) {
  return (
    typeof body === "object" &&
    body !== null &&
    key in body &&
    (body as Record<string, unknown>)[key] === true
  );
}
