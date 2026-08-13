"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { CalorieChart } from "@/components/CalorieChart";
import {
  exportHistory,
  importHistory,
  loadHistory,
  todayTotals,
  type HistoryEntry,
} from "@/lib/history";
import { grams, kcal } from "@/lib/format";
import { loadPlan } from "@/lib/plan";
import { trendSeries, trendSummary, type TrendRange } from "@/lib/trends";

const RANGES: { id: TrendRange; label: string; blurb: string }[] = [
  { id: "days", label: "Days", blurb: "Last 14 days · total kcal each day" },
  { id: "weeks", label: "Weeks", blurb: "Last 12 weeks · average kcal per logged day" },
  { id: "months", label: "Months", blurb: "Last 12 months · average kcal per logged day" },
  { id: "years", label: "Years", blurb: "Each year · average kcal per logged day" },
];

export function TrendsApp() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [planCalories, setPlanCalories] = useState(2000);
  const [range, setRange] = useState<TrendRange>("days");
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
    setPlanCalories(loadPlan().calories);
  }, []);

  const today = useMemo(() => todayTotals(history), [history]);
  const points = useMemo(() => trendSeries(history, range), [history, range]);
  const summary = useMemo(
    () => trendSummary(points, planCalories),
    [points, planCalories],
  );
  const active = RANGES.find((item) => item.id === range);

  function downloadBackup() {
    const blob = new Blob([JSON.stringify(exportHistory(history), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nuggetcals-history-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNote("Backup downloaded. Keep that file — it is your free long-term save.");
  }

  async function onRestore(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      const next = importHistory(JSON.parse(text));
      setHistory(next);
      setNote(`Restored ${next.length} saved items.`);
    } catch {
      setNote("That file was not a NuggetCals backup.");
    }
  }

  return (
    <div className="page-shell">
      <SiteHeader
        todayCalories={today.calories}
        planCalories={planCalories}
        active="trends"
      />

      <main>
        <section className="hero" id="top">
          <div>
            <p className="eyebrow">Days. Weeks. Months. Years.</p>
            <h1>
              Your
              <em> calorie trend</em>
            </h1>
            <p className="lede">
              History now stays on this phone for years. Download a backup to
              keep it if you switch devices. A free cloud is optional.
            </p>
          </div>
          <aside className="hero-aside hide-mobile">
            <p>
              <strong>This device</strong>
              Meals stay in the browser automatically. Today still resets at
              midnight; old days stay in the graph.
            </p>
            <p>
              <strong>Free backup</strong>
              Download a JSON file and restore it later. No paid server needed.
            </p>
            <p>
              <strong>Every device</strong>
              Use the same backup file, or a free Supabase project if you want
              live sync later.
            </p>
          </aside>
        </section>

        <section className="workspace snack-workspace">
          <div className="composer">
            <div className="chips size-picks" aria-label="Trend range">
              {RANGES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={range === item.id ? "chip is-on" : "chip"}
                  onClick={() => setRange(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="hint">{active?.blurb}</p>
            <CalorieChart
              points={points}
              planCalories={planCalories}
              mode={range}
            />
            <div className="trend-stats">
              <div>
                <span>Average</span>
                <strong>{kcal(summary.average)}</strong>
              </div>
              <div>
                <span>Highest</span>
                <strong>{kcal(summary.high.calories)}</strong>
              </div>
              <div>
                <span>Logged</span>
                <strong>{summary.loggedDays}</strong>
              </div>
            </div>
            <p className="hint">
              {summary.loggedDays === 0
                ? "Log a few days of food and this line will fill in."
                : summary.vsPlan === 0
                  ? "Average matches your daily plan."
                  : summary.vsPlan > 0
                    ? `Average is ${kcal(summary.vsPlan)} kcal over your ${kcal(planCalories)} plan.`
                    : `Average is ${kcal(Math.abs(summary.vsPlan))} kcal under your ${kcal(planCalories)} plan.`}
            </p>
          </div>

          <aside className="side">
            <div className="stat-card" id="log">
              <p className="card-kicker">Today</p>
              <p className="stat-number">{kcal(today.calories)}</p>
              <p className="stat-unit">
                of {kcal(planCalories)} · {history.length} saved over time
              </p>
              <p className="mini-macros">
                <span>P {grams(today.protein)}g</span>
                <span>C {grams(today.carbs)}g</span>
                <span>F {grams(today.fat)}g</span>
              </p>
              <div className="photo-actions">
                <button type="button" className="analyze snack-search" onClick={downloadBackup}>
                  Download backup
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => fileRef.current?.click()}
                >
                  Restore backup
                </button>
              </div>
              {note ? <p className="hint">{note}</p> : null}
              <p className="hint">
                Free cloud later: make a Supabase project, then restore this
                same backup on each phone. The file is your save game.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                hidden
                onChange={(event) => {
                  void onRestore(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
