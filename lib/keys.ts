import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const ENV_PATH = path.join(process.cwd(), ".env.local");

const KEY_NAMES = [
  "GROQ_API_KEY",
  "GEMINI_API_KEY",
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "XAI_API_KEY",
] as const;

export type VisionProvider = "groq" | "gemini";
export type VisionAuth = { provider: VisionProvider; key: string };

function readEnvFile() {
  if (!existsSync(ENV_PATH)) return "";
  return readFileSync(ENV_PATH, "utf8");
}

export function readNamedKey(name: string) {
  const fromProcess = process.env[name]?.trim();
  if (fromProcess) return fromProcess;
  const match = readEnvFile().match(new RegExp(`^\\s*${name}\\s*=\\s*(.+)\\s*$`, "m"));
  const value = match?.[1]?.trim().replace(/^['"]|['"]$/g, "");
  return value || null;
}

export function getVisionAuth(): VisionAuth | null {
  // Prefer Gemini as the site key — higher free/paid headroom for meal photos.
  const gemini =
    readNamedKey("GEMINI_API_KEY") ?? readNamedKey("GOOGLE_GENERATIVE_AI_API_KEY");
  if (gemini) return { provider: "gemini", key: gemini };
  const groq = readNamedKey("GROQ_API_KEY");
  if (groq) return { provider: "groq", key: groq };
  return null;
}

export function resolveVisionAuth(options?: {
  groqKey?: string;
  geminiKey?: string;
}): VisionAuth | null {
  const server = getVisionAuth();
  if (server) return server;
  const gemini = options?.geminiKey?.trim();
  if (gemini && gemini.length >= 20) return { provider: "gemini", key: gemini };
  const groq = options?.groqKey?.trim();
  if (groq && groq.length >= 20) return { provider: "groq", key: groq };
  return null;
}

export function hasVisionKey() {
  return Boolean(getVisionAuth());
}

export function writeNamedKey(name: (typeof KEY_NAMES)[number], value: string) {
  const lines = readEnvFile().split(/\r?\n/).filter((line) => line.trim().length > 0);
  const nextLine = `${name}=${value}`;
  const index = lines.findIndex((line) => line.startsWith(`${name}=`));
  if (index >= 0) lines[index] = nextLine;
  else lines.push(nextLine);
  writeFileSync(ENV_PATH, `${lines.join("\n")}\n`, "utf8");
  process.env[name] = value;
}
