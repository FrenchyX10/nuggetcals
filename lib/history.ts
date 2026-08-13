import type { MealAnalysis } from "./schema";

export type HistoryEntry = {
  id: string;
  createdAt: string;
  thumbnail: string;
  mealName: string;
  restaurant: string | null;
  totalCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  overallConfidence: number;
  servings: number;
  result: MealAnalysis;
};

const KEY = "bitewise-history-v1";
const MAX = 40;

function canUseStorage() {
  return typeof window !== "undefined" && "localStorage" in window;
}

export function loadHistory(): HistoryEntry[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)));
}

export function addHistory(entry: HistoryEntry) {
  const next = [entry, ...loadHistory().filter((item) => item.id !== entry.id)];
  saveHistory(next);
  return next;
}

export function updateHistory(
  id: string,
  patch: Partial<
    Pick<
      HistoryEntry,
      "servings" | "result" | "totalCalories" | "proteinG" | "carbsG" | "fatG"
    >
  >,
) {
  const next = loadHistory().map((item) =>
    item.id === id ? { ...item, ...patch } : item,
  );
  saveHistory(next);
  return next;
}

export function removeHistory(id: string) {
  const next = loadHistory().filter((item) => item.id !== id);
  saveHistory(next);
  return next;
}

export function todayTotals(entries: HistoryEntry[]) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const today = entries.filter((item) => new Date(item.createdAt) >= start);
  return today.reduce(
    (acc, item) => {
      acc.calories += Math.round(item.totalCalories * item.servings);
      acc.protein += item.proteinG * item.servings;
      acc.carbs += item.carbsG * item.servings;
      acc.fat += item.fatG * item.servings;
      acc.count += 1;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 },
  );
}
