"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { addHistory, loadHistory, todayTotals, type HistoryEntry } from "@/lib/history";
import { grams, kcal } from "@/lib/format";
import { loadPlan } from "@/lib/plan";
import {
  SNACK_CATEGORIES,
  SNACKS,
  searchLocalSnacks,
  type SnackCategory,
  type SnackRecord,
} from "@/lib/snacks-data";
import { historyFromSnack } from "@/lib/snack-log";

const GROQ_KEY = "nuggetcals-groq-key";

export function SnacksApp() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [planCalories, setPlanCalories] = useState(2000);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SnackCategory | "all">("all");
  const [servings, setServings] = useState(1);
  const [groqKey, setGroqKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remote, setRemote] = useState<SnackRecord[]>([]);
  const [reason, setReason] = useState("");
  const [addedName, setAddedName] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
    setPlanCalories(loadPlan().calories);
    setGroqKey(window.localStorage.getItem(GROQ_KEY) ?? "");
  }, []);

  const today = useMemo(() => todayTotals(history), [history]);
  const remaining = planCalories - today.calories;
  const local = useMemo(
    () => searchLocalSnacks(query, category),
    [query, category],
  );
  const shown = remote.length > 0 && query.trim().length >= 2 ? remote : local;

  async function lookup() {
    const text = query.trim();
    if (text.length < 2) {
      setError("Type a chip or snack name, like Cool Ranch Doritos.");
      return;
    }
    setBusy(true);
    setError(null);
    setReason("");
    try {
      const response = await fetch("/api/snack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, groqKey }),
      });
      const data = (await response.json()) as {
        snacks?: SnackRecord[];
        picked?: number;
        reason?: string;
        error?: string;
        message?: string;
      };
      if (!response.ok) throw new Error(data.error || "Snack lookup failed.");
      const snacks = data.snacks ?? [];
      if (snacks.length === 0) {
        setRemote([]);
        setError(data.message || "No published snack label matched.");
        return;
      }
      const picked = typeof data.picked === "number" ? data.picked : 0;
      const ordered = [
        snacks[picked],
        ...snacks.filter((_, index) => index !== picked),
      ].filter(Boolean);
      setRemote(ordered);
      setReason(data.reason || "Matched a published snack label.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Snack lookup failed.");
    } finally {
      setBusy(false);
    }
  }

  function addSnack(snack: SnackRecord) {
    const entry = historyFromSnack(snack, servings);
    const next = addHistory(entry);
    setHistory(next);
    setAddedName(snack.name);
    window.setTimeout(() => setAddedName(null), 1800);
  }

  return (
    <div className="page-shell">
      <SiteHeader
        todayCalories={today.calories}
        planCalories={planCalories}
        active="snacks"
      />

      <main>
        <section className="hero" id="top">
          <div>
            <p className="eyebrow">Chips. Bags. Published labels.</p>
            <h1>
              Add
              <em> chips and snacks</em>
              to today
            </h1>
            <p className="lede">
              Tap a bag from the list, or type a name. AI matches it to USDA
              FoodData Central and brand labels, then adds those calories to
              your day.
            </p>
          </div>
          <aside className="hero-aside">
            <p>
              <strong>Published nutrition</strong>
              Calories come from branded labels and USDA FoodData Central, not
              a photo guess.
            </p>
            <p>
              <strong>Adds to the same day</strong>
              Snacks land in the same Today log as meal photos, with protein,
              carbs, and fat.
            </p>
            <p>
              <strong>{kcal(Math.max(0, remaining))} kcal left</strong>
              {today.count} item{today.count === 1 ? "" : "s"} logged today.
            </p>
          </aside>
        </section>

        <section className="workspace snack-workspace">
          <div className="composer">
            <label className="field">
              <span>
                Look up a snack{" "}
                <em>uses USDA + brand data online</em>
              </span>
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setRemote([]);
                  setReason("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void lookup();
                }}
                placeholder="Cool Ranch Doritos, Flamin' Hot Cheetos, Oreo…"
                maxLength={80}
              />
            </label>
            <div className="photo-actions">
              <button
                type="button"
                className="analyze snack-search"
                disabled={busy || query.trim().length < 2}
                onClick={() => void lookup()}
              >
                {busy ? "Looking up published labels…" : "Search USDA / brand labels"}
              </button>
            </div>
            {reason ? <p className="hint">{reason}</p> : null}
            {error ? <p className="error">{error}</p> : null}

            <div className="size-field">
              <p className="field-label">How much?</p>
              <div className="chips size-picks" aria-label="Snack servings">
                {[
                  { value: 1, label: "1 serving" },
                  { value: 2, label: "2 servings" },
                  { value: 3, label: "Share bag" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={servings === option.value ? "chip is-on" : "chip"}
                    onClick={() => setServings(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="side">
            <div className="stat-card" id="log">
              <p className="card-kicker">Today including snacks</p>
              <p className="stat-number">{kcal(today.calories)}</p>
              <p className="stat-unit">of {kcal(planCalories)} kcal</p>
              <p className={remaining < 0 ? "plan-left is-over" : "plan-left"}>
                {remaining >= 0
                  ? `${kcal(remaining)} kcal left today`
                  : `${kcal(Math.abs(remaining))} kcal over plan`}
              </p>
              <div className="mini-macros">
                <span>P {grams(today.protein)}g</span>
                <span>C {grams(today.carbs)}g</span>
                <span>F {grams(today.fat)}g</span>
              </div>
            </div>
          </aside>
        </section>

        <div className="chips snack-cats" aria-label="Snack type">
          {SNACK_CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={category === item.id ? "chip is-on" : "chip"}
              onClick={() => {
                setCategory(item.id);
                setRemote([]);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <ul className="snack-grid">
          {shown.map((snack) => (
            <li key={`${snack.sourceUrl}-${snack.name}`}>
              <article className="snack-card">
                <div>
                  <p className="card-kicker">{snack.category}</p>
                  <h2>{snack.name}</h2>
                  <p className="snack-meta">
                    {snack.grams}g serving · {snack.source}
                  </p>
                </div>
                <p className="snack-cals">
                  <strong>{kcal(snack.calories * servings)}</strong>
                  <small>kcal</small>
                </p>
                <p className="snack-macros">
                  P {grams(snack.proteinG * servings)}g · C{" "}
                  {grams(snack.carbsG * servings)}g · F{" "}
                  {grams(snack.fatG * servings)}g
                </p>
                <a className="snack-source" href={snack.sourceUrl} target="_blank" rel="noreferrer">
                  Published label
                </a>
                <button
                  type="button"
                  className="analyze snack-add"
                  onClick={() => addSnack(snack)}
                >
                  {addedName === snack.name
                    ? "Added to today"
                    : `Add ${servings === 1 ? "1 serving" : `${servings} servings`}`}
                </button>
              </article>
            </li>
          ))}
        </ul>
        {shown.length === 0 ? (
          <p className="empty">
            No snacks in that filter. Search USDA for a brand name.
          </p>
        ) : null}

        <p className="hint snack-foot">
          Showing {shown.length === SNACKS.length ? "the built-in chip and snack list" : `${shown.length} matches`}.
          Search uses USDA FoodData Central branded foods
          {groqKey ? " and Groq to pick the closest label" : ""}.
        </p>
      </main>

      <footer className="footer">
        <p>NuggetCals · estimates only, not medical advice.</p>
        <p>
          <a href="/">Back to meal photos</a>
        </p>
      </footer>
    </div>
  );
}
