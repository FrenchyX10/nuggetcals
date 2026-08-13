"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { addHistory, loadHistory, todayTotals, type HistoryEntry } from "@/lib/history";
import { grams, kcal } from "@/lib/format";
import { loadPlan } from "@/lib/plan";
import {
  parseIngredientList,
  scaleIngredient,
  type IngredientRecord,
} from "@/lib/ingredients-data";
import { historyFromMeal, mealFromTotals, svgThumb } from "@/lib/log-entry";
import type { FoodItem } from "@/lib/schema";

const THUMB = svgThumb("#f0b45a", "H");

const QUICK = ["1 egg", "1 bread", "1 tbsp butter", "1 tbsp oil", "1 cup rice", "1 banana"];

type Line = {
  id: string;
  ingredient: IngredientRecord;
  unitIndex: number;
  amount: number;
  label: string;
};

export function HomemadeApp() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [planCalories, setPlanCalories] = useState(2000);
  const [mode, setMode] = useState<"ingredients" | "calories">("ingredients");
  const [mealName, setMealName] = useState("");
  const [listText, setListText] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
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

  function appendQuick(phrase: string) {
    setListText((current) => {
      const next = current.trim();
      return next ? `${next}, ${phrase}` : phrase;
    });
    setError(null);
  }

  function countIngredients() {
    const text = listText.trim();
    if (!text) {
      setError("Type ingredients like 1 egg, 1 bread.");
      return;
    }

    const parsed = parseIngredientList(text);
    if (parsed.lines.length === 0) {
      setError(
        parsed.unknown.length
          ? `Could not read: ${parsed.unknown.join(", ")}. Try “1 egg, 1 bread”.`
          : "Could not read those ingredients. Try “1 egg, 1 bread”.",
      );
      setLines([]);
      return;
    }

    const nextLines: Line[] = parsed.lines.map((row) => ({
      id: `${row.ingredient.name}-${row.label}-${Math.random().toString(36).slice(2, 7)}`,
      ingredient: row.ingredient,
      unitIndex: row.unitIndex,
      amount: row.amount,
      label: row.label,
    }));
    setLines(nextLines);

    const items: FoodItem[] = nextLines.map((line) => {
      const unit = line.ingredient.units[line.unitIndex] ?? line.ingredient.units[0];
      const scaled = scaleIngredient(line.ingredient, unit.grams * line.amount);
      return {
        name: line.ingredient.name,
        brandOrRestaurantItem: null,
        portionDescription: line.label,
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

    const mealTotals = items.reduce(
      (acc, item) => {
        acc.calories += item.calories;
        acc.proteinG += item.proteinG;
        acc.carbsG += item.carbsG;
        acc.fatG += item.fatG;
        acc.fiberG += item.fiberG;
        acc.sugarG += item.sugarG;
        acc.sodiumMg += item.sodiumMg;
        return acc;
      },
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, sugarG: 0, sodiumMg: 0 },
    );

    const meal = mealFromTotals({
      mealName:
        mealName.trim() ||
        items.map((item) => item.portionDescription).slice(0, 3).join(" + "),
      restaurant: "Homemade",
      calories: mealTotals.calories,
      proteinG: mealTotals.proteinG,
      carbsG: mealTotals.carbsG,
      fatG: mealTotals.fatG,
      fiberG: mealTotals.fiberG,
      sugarG: mealTotals.sugarG,
      sodiumMg: mealTotals.sodiumMg,
      items,
      method: "usda",
      assumptions: [
        `Counted from: ${text}`,
        "Calories are USDA-style numbers for each ingredient.",
      ],
      precisionNotes: "Homemade estimate from 1 egg, 1 bread-style amounts.",
      sources: [{ title: "USDA FoodData Central", url: "https://fdc.nal.usda.gov/" }],
    });

    setHistory(addHistory(historyFromMeal(meal, THUMB, "Homemade")));
    setAdded(true);
    setError(
      parsed.unknown.length
        ? `Logged. Skipped: ${parsed.unknown.join(", ")}`
        : null,
    );
    window.setTimeout(() => setAdded(false), 2200);
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
    window.setTimeout(() => setAdded(false), 2200);
  }

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
            <p className="eyebrow">1 egg. 1 bread. Done.</p>
            <h1>
              Log
              <em> homemade food</em>
            </h1>
            <p className="lede">
              Type what you ate, like <strong>1 egg, 1 bread</strong>. Tap
              Count calories to see the number and add it to today.
            </p>
          </div>
          <aside className="hero-aside">
            <p>
              <strong>Write it simply</strong>
              1 egg, 2 bread, 1 tbsp butter. No extra taps needed.
            </p>
            <p>
              <strong>Or just calories</strong>
              If you already know the number, type it instead.
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
                placeholder="Eggs on toast…"
                maxLength={80}
              />
            </label>

            {mode === "ingredients" ? (
              <>
                <label className="field">
                  <span>Ingredients</span>
                  <textarea
                    className="ingredient-box"
                    value={listText}
                    onChange={(event) => {
                      setListText(event.target.value);
                      setError(null);
                    }}
                    placeholder={"1 egg, 1 bread\n1 tbsp butter"}
                    rows={4}
                  />
                </label>
                <div className="chips" aria-label="Quick add">
                  {QUICK.map((phrase) => (
                    <button
                      key={phrase}
                      type="button"
                      className="chip"
                      onClick={() => appendQuick(phrase)}
                    >
                      + {phrase}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="analyze"
                  onClick={countIngredients}
                >
                  {added ? "Added to today" : "Count these calories"}
                </button>

                {lines.length > 0 ? (
                  <div className="homemade-result">
                    <div className="homemade-total">
                      <span>This plate</span>
                      <strong>{kcal(totals.calories)} kcal</strong>
                    </div>
                    <p className="snack-macros">
                      P {grams(totals.proteinG)}g · C {grams(totals.carbsG)}g · F{" "}
                      {grams(totals.fatG)}g
                    </p>
                    <ul className="ingredient-lines">
                      {lines.map((line) => {
                        const unit =
                          line.ingredient.units[line.unitIndex] ??
                          line.ingredient.units[0];
                        const scaled = scaleIngredient(
                          line.ingredient,
                          unit.grams * line.amount,
                        );
                        return (
                          <li key={line.id}>
                            <strong>
                              {line.label} {line.ingredient.name.toLowerCase()}
                            </strong>
                            <em>{kcal(scaled.calories)} kcal</em>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
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
