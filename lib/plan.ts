export type DailyPlan = {
  id: string;
  label: string;
  calories: number;
  blurb: string;
};

export const DAILY_PLANS: DailyPlan[] = [
  { id: "cut", label: "Cut", calories: 1500, blurb: "Smaller deficit" },
  { id: "lean", label: "Lean", calories: 1800, blurb: "Slow fat loss" },
  { id: "maintain", label: "Maintain", calories: 2000, blurb: "Hold weight" },
  { id: "active", label: "Active", calories: 2500, blurb: "Training days" },
  { id: "bulk", label: "Bulk", calories: 3000, blurb: "Build weight" },
  { id: "custom", label: "Custom", calories: 2200, blurb: "Your number" },
];

const KEY = "nuggetcals-daily-plan-v1";

export function defaultPlan() {
  return DAILY_PLANS.find((plan) => plan.id === "maintain") ?? DAILY_PLANS[2];
}

export function loadPlan(): { id: string; calories: number } {
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return { id: "maintain", calories: 2000 };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { id: "maintain", calories: 2000 };
    const parsed = JSON.parse(raw) as { id?: string; calories?: number };
    const calories = Number(parsed.calories);
    return {
      id: typeof parsed.id === "string" ? parsed.id : "custom",
      calories:
        Number.isFinite(calories) && calories >= 800 && calories <= 6000
          ? Math.round(calories)
          : 2000,
    };
  } catch {
    return { id: "maintain", calories: 2000 };
  }
}

export function savePlan(id: string, calories: number) {
  if (typeof window === "undefined" || !("localStorage" in window)) return;
  localStorage.setItem(
    KEY,
    JSON.stringify({
      id,
      calories: Math.min(6000, Math.max(800, Math.round(calories))),
    }),
  );
}
