"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { addHistory, loadHistory, todayTotals, type HistoryEntry } from "@/lib/history";
import { grams, kcal } from "@/lib/format";
import { loadPlan } from "@/lib/plan";
import {
  searchIngredients,
  scaleIngredient,
  type IngredientRecord,
} from "@/lib/ingredients-data";
import { historyFromMeal, mealFromTotals, svgThumb } from "@/lib/log-entry";
import type { FoodItem } from "@/lib/schema";

const THUMB = svgThumb("#f0b45a", "H");

type Line = {
  id: string;
  ingredient: IngredientRecord;
  unitIndex: number;
  amount: number;
};

export function HomemadeApp() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [planCalories, setPlanCalories] = useState(2000);
  const [mode, setMode] = useState<"ingredients" | "calories">("ingredients");
  const [mealName, setMealName] = useState("");
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<IngredientRecord[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [quickCals, setQuickCals] = useState("");
  const [quickProtein, setQuickProtein] = useState("");
  const [quickCarbs, setQuickCarbs] = useState("");
  const [quickFat, setQuickFat] = useState("");

  useEffect(() => {
    setHistory(loadHistory());
    setPlanCalories(loadPlan().calories);
  }, []);

  const today = useMemo(() => todayTotals(history), [history]);
  const remaining = planCalories - today.calories;
  const suggestions = useMemo(() => searchIngredients(query).slice(0, 8), [query]);

  const totals = useMemo(() => {
    return lines.reduce(
      (acc, line) => {
        const unit = line.ingredient.units[line.unitIndex] ?? line.ingredient.units[0];
        const scaled = scaleIngredient(line.ingredient, unit.grams * line.amount);
        acc.calories += scaled.calories;
        acc.proteinG += scaled.proteinG;
        acc.carbsG += scaled.carbsG;
        acc.fatG += scaled.fatG;
        acc.fiberG += scaled.fiberG;
        acc.sugarG += scaled.sugarG;
        acc.sodiumMg += scaled.sodiumMg;
        return acc;
      },
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, sugarG: 0, sodiumMg: 0 },
    );
  }, [lines]);

  function addIngredient(ingredient: IngredientRecord) {
    setLines((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        ingredient,
        unitIndex: 0,
        amount: 1,
      },
    ]);
    setQuery("");
    setHits([]);
  }

  async function lookupIngredient() {
    const text = query.trim();
    if (text.length < 2) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/ingredient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = (await response.json()) as {
        ingredients?: IngredientRecord[];
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || "Ingredient lookup failed.");
      setHits(data.ingredients ?? []);
      if (!data.ingredients?.length) setError("No USDA ingredient matched that name.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ingredient lookup failed.");
    } finally {
      setBusy(false);
    }
  }

  function logIngredients() {
    if (lines.length === 0) {
      setError("Add at least one ingredient, or switch to Just log calories.");
      return;
    }
    const items: FoodItem[] = lines.map((line) => {
      const unit = line.ingredient.units[line.unitIndex] ?? line.ingredient.units[0];
      const scaled = scaleIngredient(line.ingredient, unit.grams * line.amount);
      return {
        name: line.ingredient.name,
        brandOrRestaurantItem: null,
        portionDescription: `${line.amount} × ${unit.label} · ${scaled.grams}g`,
        portionSize: "medium" as const,
        estimatedGrams: scaled.grams,
        calories: scaled.calories,
        proteinG: scaled.proteinG,
        carbsG: scaled.carbsG,
        fatG: scaled.fatG,
        fiberG: scaled.fiberG,
        sugarG: scaled.sugarG,
        sodiumMg: scaled.sodiumMg,
        confidence: 0.86,
        dataSource: "usda" as const,
        notes: line.ingredient.source,
      };
    });
    const meal = mealFromTotals({
      mealName: mealName || items.map((item) => item.name).slice(0, 3).join(" + "),
      restaurant: "Homemade",
      calories: totals.calories,
      proteinG: totals.proteinG,
      carbsG: totals.carbsG,
      fatG: totals.fatG,
      fiberG: totals.fiberG,
      sugarG: totals.sugarG,
      sodiumMg: totals.sodiumMg,
      items,
      method: "usda",
      assumptions: [
        "Homemade meal built from ingredients.",
        "Calories are USDA-style numbers for the amounts you entered.",
      ],
      precisionNotes: "Homemade estimate from listed ingredients. Oils and sauces move the number most.",
      sources: [{ title: "USDA FoodData Central", url: "https://fdc.nal.usda.gov/" }],
    });
    setHistory(addHistory(historyFromMeal(meal, THUMB, "Homemade")));
    setAdded(true);
    setError(null);
    window.setTimeout(() => setAdded(false), 1800);
  }

  function logCalories() {
    const calories = Number(quickCals);
    if (!Number.isFinite(calories) || calories <= 0) {
      setError("Enter the calories for this homemade food.");
      return;
    }
    const meal = mealFromTotals({
      mealName: mealName.trim() || "Homemade",
      restaurant: "Homemade",
      calories,
      proteinG: Number(quickProtein) || 0,
      carbsG: Number(quickCarbs) || 0,
      fatG: Number(quickFat) || 0,
      method: "visual_estimate",
      assumptions: ["Calories were typed in by you."],
      precisionNotes: "You logged the calorie number directly.",
    });
    setHistory(addHistory(historyFromMeal(meal, THUMB, "Homemade")));
    setAdded(true);
    setError(null);
    window.setTimeout(() => setAdded(false), 1800);
  }

  const shownHits = hits.length > 0 ? hits : query.trim() ? suggestions : suggestions.slice(0, 6);

  return (
    <div className="page-shell">
      <SiteHeader
        todayCalories={today.calories}
        planCalories={planCalories}
        active="homemade"
      />

      <main>
        <section className="hero" id="top">
          <div>
            <p className="eyebrow">Cooked at home.</p>
            <h1>
              Log
              <em> homemade food</em>
            </h1>
            <p className="lede">
              Add the ingredients you used, or skip that and type the calories.
              Either way it counts toward today.
            </p>
          </div>
          <aside className="hero-aside">
            <p>
              <strong>By ingredients</strong>
              Chicken, rice, oil, cheese — USDA numbers scaled to the amount
              you used.
            </p>
            <p>
              <strong>Just calories</strong>
              If you already know the number, type it and add it to the day.
            </p>
            <p>
              <strong>{kcal(Math.max(0, remaining))} kcal left</strong>
              {today.count} item{today.count === 1 ? "" : "s"} logged today.
            </p>
          </aside>
        </section>

        <section className="workspace snack-workspace">
          <div className="composer">
            <div className="chips size-picks" aria-label="Homemade mode">
              <button
                type="button"
                className={mode === "ingredients" ? "chip is-on" : "chip"}
                onClick={() => setMode("ingredients")}
              >
                Ingredients
              </button>
              <button
                type="button"
                className={mode === "calories" ? "chip is-on" : "chip"}
                onClick={() => setMode("calories")}
              >
                Just log calories
              </button>
            </div>

            <label className="field">
              <span>What did you make? <em>optional</em></span>
              <input
                value={mealName}
                onChange={(event) => setMealName(event.target.value)}
                placeholder="Chicken and rice, leftover pasta…"
                maxLength={80}
              />
            </label>

            {mode === "ingredients" ? (
              <>
                <label className="field">
                  <span>Add an ingredient</span>
                  <input
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setHits([]);
                      setError(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        if (suggestions[0]) addIngredient(suggestions[0]);
                      }
                    }}
                    placeholder="chicken, rice, olive oil, egg…"
                    maxLength={80}
                  />
                </label>
                <button
                  type="button"
                  className="ghost"
                  disabled={busy || query.trim().length < 2}
                  onClick={() => void lookupIngredient()}
                >
                  {busy ? "Looking up USDA…" : "Search USDA if it is not in the list"}
                </button>
                <div className="chips" aria-label="Ingredient matches">
                  {shownHits.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      className="chip"
                      onClick={() => addIngredient(item)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>

                {lines.length > 0 ? (
                  <ul className="ingredient-lines">
                    {lines.map((line) => {
                      const unit =
                        line.ingredient.units[line.unitIndex] ?? line.ingredient.units[0];
                      const scaled = scaleIngredient(
                        line.ingredient,
                        unit.grams * line.amount,
                      );
                      return (
                        <li key={line.id}>
                          <strong>{line.ingredient.name}</strong>
                          <div className="ingredient-controls">
                            <input
                              type="number"
                              min={0.25}
                              step={0.25}
                              value={line.amount}
                              onChange={(event) => {
                                const value = Number(event.target.value);
                                setLines((current) =>
                                  current.map((row) =>
                                    row.id === line.id
                                      ? {
                                          ...row,
                                          amount: Number.isFinite(value)
                                            ? Math.max(0.25, value)
                                            : 1,
                                        }
                                      : row,
                                  ),
                                );
                              }}
                            />
                            <select
                              value={line.unitIndex}
                              onChange={(event) => {
                                const index = Number(event.target.value);
                                setLines((current) =>
                                  current.map((row) =>
                                    row.id === line.id
                                      ? { ...row, unitIndex: index }
                                      : row,
                                  ),
                                );
                              }}
                            >
                              {line.ingredient.units.map((option, index) => (
                                <option key={option.label} value={index}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <em>{kcal(scaled.calories)} kcal</em>
                            <button
                              type="button"
                              className="icon-btn"
                              aria-label={`Remove ${line.ingredient.name}`}
                              onClick={() =>
                                setLines((current) =>
                                  current.filter((row) => row.id !== line.id),
                                )
                              }
                            >
                              ×
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="hint">Tap ingredients to build the plate.</p>
                )}

                <div className="homemade-total">
                  <span>Total</span>
                  <strong>{kcal(totals.calories)} kcal</strong>
                </div>
                <p className="snack-macros">
                  P {grams(totals.proteinG)}g · C {grams(totals.carbsG)}g · F{" "}
                  {grams(totals.fatG)}g
                </p>
                <button
                  type="button"
                  className="analyze"
                  disabled={lines.length === 0}
                  onClick={logIngredients}
                >
                  {added ? "Added to today" : "Add homemade meal to today"}
                </button>
              </>
            ) : (
              <>
                <label className="field">
                  <span>Calories</span>
                  <input
                    type="number"
                    min={1}
                    max={4000}
                    value={quickCals}
                    onChange={(event) => setQuickCals(event.target.value)}
                    placeholder="450"
                  />
                </label>
                <div className="quick-macros">
                  <label className="field">
                    <span>Protein g <em>optional</em></span>
                    <input
                      type="number"
                      min={0}
                      value={quickProtein}
                      onChange={(event) => setQuickProtein(event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Carbs g <em>optional</em></span>
                    <input
                      type="number"
                      min={0}
                      value={quickCarbs}
                      onChange={(event) => setQuickCarbs(event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Fat g <em>optional</em></span>
                    <input
                      type="number"
                      min={0}
                      value={quickFat}
                      onChange={(event) => setQuickFat(event.target.value)}
                    />
                  </label>
                </div>
                <button type="button" className="analyze" onClick={logCalories}>
                  {added ? "Added to today" : "Log these calories"}
                </button>
              </>
            )}
            {error ? <p className="error">{error}</p> : null}
          </div>

          <aside className="side">
            <div className="stat-card" id="log">
              <p className="card-kicker">Today including homemade</p>
              <p className="stat-number">{kcal(today.calories)}</p>
              <p className="stat-unit">of {kcal(planCalories)} kcal</p>
              <p className={remaining < 0 ? "plan-left is-over" : "plan-left"}>
                {remaining >= 0
                  ? `${kcal(remaining)} kcal left today`
                  : `${kcal(Math.abs(remaining))} kcal over plan`}
              </p>
            </div>
          </aside>
        </section>
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
