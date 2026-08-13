import type { HistoryEntry } from "@/lib/history";

export type TrendRange = "days" | "weeks" | "months" | "years";

export type TrendPoint = {
  key: string;
  label: string;
  calories: number;
  count: number;
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function dayKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  const day = next.getDay();
  next.setDate(next.getDate() - day);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}

export function caloriesForEntry(entry: HistoryEntry) {
  return Math.round(entry.totalCalories * (entry.servings || 1));
}

export function dailyTotals(entries: HistoryEntry[]) {
  const map = new Map<string, { calories: number; count: number }>();
  for (const entry of entries) {
    const key = dayKey(new Date(entry.createdAt));
    const current = map.get(key) ?? { calories: 0, count: 0 };
    current.calories += caloriesForEntry(entry);
    current.count += 1;
    map.set(key, current);
  }
  return map;
}

export function trendSeries(
  entries: HistoryEntry[],
  range: TrendRange,
): TrendPoint[] {
  const days = dailyTotals(entries);
  const now = startOfDay(new Date());

  if (range === "days") {
    return Array.from({ length: 14 }, (_, index) => {
      const date = addDays(now, index - 13);
      const key = dayKey(date);
      const row = days.get(key);
      return {
        key,
        label: date.toLocaleDateString(undefined, { weekday: "short", day: "numeric" }),
        calories: row?.calories ?? 0,
        count: row?.count ?? 0,
      };
    });
  }

  if (range === "weeks") {
    const start = startOfWeek(addDays(now, -7 * 11));
    return Array.from({ length: 12 }, (_, index) => {
      const weekStart = addDays(start, index * 7);
      let calories = 0;
      let count = 0;
      let loggedDays = 0;
      for (let i = 0; i < 7; i += 1) {
        const row = days.get(dayKey(addDays(weekStart, i)));
        if (row) {
          calories += row.calories;
          count += row.count;
          loggedDays += 1;
        }
      }
      return {
        key: dayKey(weekStart),
        label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        calories: loggedDays ? Math.round(calories / loggedDays) : 0,
        count,
      };
    }).map((point, index, all) => {
      if (index !== all.length - 1) return point;
      const weekStart = startOfWeek(now);
      const weekEnd = addDays(weekStart, 6);
      return {
        ...point,
        label: `${weekStart.getMonth() + 1}/${weekStart.getDate()}–${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`,
      };
    });
  }

  if (range === "months") {
    const start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 11, 1));
    return Array.from({ length: 12 }, (_, index) => {
      const month = new Date(start.getFullYear(), start.getMonth() + index, 1);
      const next = new Date(month.getFullYear(), month.getMonth() + 1, 1);
      let calories = 0;
      let count = 0;
      let loggedDays = 0;
      for (let cursor = new Date(month); cursor < next; cursor = addDays(cursor, 1)) {
        const row = days.get(dayKey(cursor));
        if (row) {
          calories += row.calories;
          count += row.count;
          loggedDays += 1;
        }
      }
      return {
        key: `${month.getFullYear()}-${pad(month.getMonth() + 1)}`,
        label: month.toLocaleDateString(undefined, { month: "short" }),
        calories: loggedDays ? Math.round(calories / loggedDays) : 0,
        count,
      };
    });
  }

  const firstYear = entries.reduce((min, entry) => {
    const year = new Date(entry.createdAt).getFullYear();
    return Math.min(min, year);
  }, now.getFullYear());
  const years = Math.max(1, now.getFullYear() - firstYear + 1);
  const startYear = now.getFullYear() - (years - 1);
  return Array.from({ length: years }, (_, index) => {
    const year = startYear + index;
    const begin = startOfYear(new Date(year, 0, 1));
    const end = startOfYear(new Date(year + 1, 0, 1));
    let calories = 0;
    let count = 0;
    let loggedDays = 0;
    for (let cursor = new Date(begin); cursor < end && cursor <= now; cursor = addDays(cursor, 1)) {
      const row = days.get(dayKey(cursor));
      if (row) {
        calories += row.calories;
        count += row.count;
        loggedDays += 1;
      }
    }
    return {
      key: String(year),
      label: String(year),
      calories: loggedDays ? Math.round(calories / loggedDays) : 0,
      count,
    };
  });
}

export function trendSummary(points: TrendPoint[], planCalories: number) {
  const logged = points.filter((point) => point.count > 0);
  const avg = logged.length
    ? Math.round(logged.reduce((sum, point) => sum + point.calories, 0) / logged.length)
    : 0;
  const high = logged.reduce(
    (best, point) => (point.calories > best.calories ? point : best),
    logged[0] ?? { key: "", label: "—", calories: 0, count: 0 },
  );
  return {
    loggedDays: logged.length,
    average: avg,
    high,
    vsPlan: avg - planCalories,
  };
}
