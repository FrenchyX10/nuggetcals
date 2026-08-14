export const LOG_MODES = [
  { id: "photo", label: "Photo", blurb: "Snap a plate" },
  { id: "snack", label: "Snack", blurb: "Bags and chips" },
  { id: "homemade", label: "Homemade", blurb: "1 egg, 1 bread" },
  { id: "drink", label: "Drink", blurb: "Soda, coffee, water" },
] as const;

export type LogMode = (typeof LOG_MODES)[number]["id"];

export const LOG_COPY: Record<LogMode, string> = {
  photo:
    "Snap a plate. Confirm the dish and size, then calories come from published nutrition.",
  snack: "Type a bag or snap the label. Calories come from the published serving.",
  homemade: "Type what you cooked, like 1 egg, 1 bread — or just the calories.",
  drink: "Tap a drink or type one. Regular, diet, coffee, juice, and water.",
};

const KEY = "nuggetcals-log-mode";

export function parseLogMode(value: string | null | undefined): LogMode | null {
  if (value === "photo" || value === "snack" || value === "homemade" || value === "drink") {
    return value;
  }
  if (value === "snacks") return "snack";
  if (value === "drinks") return "drink";
  if (value === "meals" || value === "meal") return "photo";
  return null;
}

export function loadLogMode(): LogMode {
  if (typeof window === "undefined") return "photo";
  const fromUrl = parseLogMode(new URLSearchParams(window.location.search).get("log"));
  if (fromUrl) return fromUrl;
  try {
    return parseLogMode(window.localStorage.getItem(KEY)) ?? "photo";
  } catch {
    return "photo";
  }
}

export function saveLogMode(mode: LogMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, mode);
  const url = mode === "photo" ? "/" : `/?log=${mode}`;
  window.history.replaceState(null, "", url);
}
