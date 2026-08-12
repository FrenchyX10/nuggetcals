import { hasVisionKey, writeNamedKey } from "@/lib/keys";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ configured: hasVisionKey() });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const groqKey = readString(body, "groqKey") || readString(body, "apiKey");
  const geminiKey = readString(body, "geminiKey");

  if (groqKey) {
    if (groqKey.length < 20) {
      return Response.json({ error: "That Groq key looks too short." }, { status: 400 });
    }
    writeNamedKey("GROQ_API_KEY", groqKey);
  }
  if (geminiKey) {
    if (geminiKey.length < 20) {
      return Response.json({ error: "That Gemini key looks too short." }, { status: 400 });
    }
    writeNamedKey("GEMINI_API_KEY", geminiKey);
  }

  if (!groqKey && !geminiKey) {
    return Response.json({ error: "Paste a free Groq or Gemini API key." }, { status: 400 });
  }

  return Response.json({ configured: true });
}

function readString(body: unknown, key: string) {
  if (
    typeof body !== "object" ||
    body === null ||
    !(key in body) ||
    typeof (body as Record<string, unknown>)[key] !== "string"
  ) {
    return "";
  }
  return ((body as Record<string, unknown>)[key] as string).trim();
}
