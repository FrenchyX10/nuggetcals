import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const ENV_PATH = path.join(process.cwd(), ".env.local");

export function envFilePath() {
  return ENV_PATH;
}

export function readApiKey(): string | null {
  const fromProcess = process.env.XAI_API_KEY?.trim();
  if (fromProcess) return fromProcess;

  if (!existsSync(ENV_PATH)) return null;
  const text = readFileSync(ENV_PATH, "utf8");
  const match = text.match(/^\s*XAI_API_KEY\s*=\s*(.+)\s*$/m);
  const value = match?.[1]?.trim().replace(/^['"]|['"]$/g, "");
  return value || null;
}

export function hasApiKey() {
  return Boolean(readApiKey());
}

export function writeApiKey(key: string) {
  const next = `XAI_API_KEY=${key}\n`;
  writeFileSync(ENV_PATH, next, "utf8");
  process.env.XAI_API_KEY = key;
}
