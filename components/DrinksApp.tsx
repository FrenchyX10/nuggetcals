"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { addHistory, loadHistory, todayTotals, type HistoryEntry } from "@/lib/history";
import { grams, kcal } from "@/lib/format";
import { loadPlan } from "@/lib/plan";
import {
  DRINK_GROUPS,
  DRINKS,
  drinksFor,
  type DrinkGroup,
  type DrinkRecord,
} from "@/lib/drinks-data";
import { historyFromMeal, mealFromTotals, svgThumb } from "@/lib/log-entry";

const THUMB = svgThumb("#7dcea0", "D");

export function DrinksApp() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [planCalories, setPlanCalories] = useState(2000);
  const [group, setGroup] = useState<DrinkGroup>("soda");
  const [query, setQuery] = useState("");
  const [servings, setServings] = useState(1);
  const [addedName, setAddedName] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customCals, setCustomCals] = useState("");

  useEffect(() => {
    setHistory(loadHistory());
    setPlanCalories(loadPlan().calories);
  }, []);

  const today = useMemo(() => todayTotals(history), [history]);
  const remaining = planCalories - today.calories;
  const shown = useMemo(() => drinksFor(group, query), [group, query]);
  const activeGroup = DRINK_GROUPS.find((item) => item.id === group);

  function addDrink(drink: DrinkRecord) {
    const scale = servings;
    const meal = mealFromTotals({
      mealName: drink.name,
      restaurant: "Drink",
      calories: drink.calories * scale,
      proteinG: drink.proteinG * scale,
      carbsG: drink.carbsG * scale,
      fatG: drink.fatG * scale,
      sugarG: drink.sugarG * scale,
      sodiumMg: drink.sodiumMg * scale,
      method: "usda",
      assumptions: [
        `Logged from Drinks · ${activeGroup?.label ?? drink.group}.`,
        `${scale} × ${drink.ml} ml published serving.`,
        drink.source,
      ],
      precisionNotes: "Published drink label or USDA-style serving.",
      sources: [{ title: drink.source, url: drink.sourceUrl }],
    });
    setHistory(addHistory(historyFromMeal(meal, THUMB, "Drink")));
    setAddedName(drink.name);
    window.setTimeout(() => setAddedName(null), 1800);
  }

  function addCustom() {
    const calories = Number(customCals);
    if (!Number.isFinite(calories) || calories < 0 || !customName.trim()) return;
    const meal = mealFromTotals({
      mealName: customName.trim(),
      restaurant: "Drink",
      calories,
      method: "visual_estimate",
      assumptions: ["Drink calories typed in by you."],
      precisionNotes: "Custom drink log.",
    });
    setHistory(addHistory(historyFromMeal(meal, THUMB, "Drink")));
    setAddedName(customName.trim());
    setCustomName("");
    setCustomCals("");
    window.setTimeout(() => setAddedName(null), 1800);
  }

  return (
    <div className="page-shell">
      <SiteHeader
        todayCalories={today.calories}
        planCalories={planCalories}
        active="drinks"
      />

      <main>
        <section className="hero" id="top">
          <div>
            <p className="eyebrow">Soda. Diet. Everything else.</p>
            <h1>
              Log
              <em> drinks</em>
            </h1>
            <p className="lede">
              Regular soda, diet, juice and sports drinks, or coffee and water.
              Tap one to add it to today.
            </p>
          </div>
          <aside className="hero-aside">
            <p>
              <strong>Soda</strong>
              Full-sugar Coke, Pepsi, Sprite, Dew, and the rest.
            </p>
            <p>
              <strong>Diet</strong>
              Zero-sugar sodas and diet sports drinks.
            </p>
            <p>
              <strong>Non-diet / Other</strong>
              Juice, energy, sweet tea — or coffee, milk, beer, and water.
            </p>
          </aside>
        </section>

        <section className="workspace snack-workspace">
          <div className="composer">
            <label className="field">
              <span>Find a drink</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Coke, Diet Pepsi, latte…"
                maxLength={80}
              />
            </label>
            <div className="size-field">
              <p className="field-label">How many?</p>
              <div className="chips size-picks" aria-label="Drink servings">
                {[1, 2, 3].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={servings === value ? "chip is-on" : "chip"}
                    onClick={() => setServings(value)}
                  >
                    {value === 1 ? "1 drink" : `${value} drinks`}
                  </button>
                ))}
              </div>
            </div>
            <div className="custom-drink">
              <p className="field-label">Not listed? Log it yourself</p>
              <div className="quick-macros">
                <label className="field">
                  <span>Name</span>
                  <input
                    value={customName}
                    onChange={(event) => setCustomName(event.target.value)}
                    placeholder="Fountain soda"
                  />
                </label>
                <label className="field">
                  <span>Calories</span>
                  <input
                    type="number"
                    min={0}
                    value={customCals}
                    onChange={(event) => setCustomCals(event.target.value)}
                    placeholder="200"
                  />
                </label>
              </div>
              <button
                type="button"
                className="ghost"
                disabled={!customName.trim() || customCals === ""}
                onClick={addCustom}
              >
                Add custom drink
              </button>
            </div>
          </div>
          <aside className="side">
            <div className="stat-card" id="log">
              <p className="card-kicker">Today including drinks</p>
              <p className="stat-number">{kcal(today.calories)}</p>
              <p className="stat-unit">of {kcal(planCalories)} kcal</p>
              <p className={remaining < 0 ? "plan-left is-over" : "plan-left"}>
                {remaining >= 0
                  ? `${kcal(remaining)} kcal left today`
                  : `${kcal(Math.abs(remaining))} kcal over plan`}
              </p>
              <p className="hint">
                {today.count} item{today.count === 1 ? "" : "s"} · {DRINKS.length} drinks in the list
              </p>
            </div>
          </aside>
        </section>

        <div className="chips snack-cats" aria-label="Drink type">
          {DRINK_GROUPS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={group === item.id ? "chip is-on" : "chip"}
              onClick={() => setGroup(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="hint">{activeGroup?.blurb}</p>

        <ul className="snack-grid">
          {shown.map((drink) => (
            <li key={drink.name}>
              <article className="snack-card">
                <div>
                  <p className="card-kicker">{drink.group === "nondiet" ? "non-diet" : drink.group}</p>
                  <h2>{drink.name}</h2>
                  <p className="snack-meta">
                    {drink.ml} ml · {drink.source}
                  </p>
                </div>
                <p className="snack-cals">
                  <strong>{kcal(drink.calories * servings)}</strong>
                  <small>kcal</small>
                </p>
                <p className="snack-macros">
                  P {grams(drink.proteinG * servings)}g · C{" "}
                  {grams(drink.carbsG * servings)}g · sugar{" "}
                  {grams(drink.sugarG * servings)}g
                </p>
                <a className="snack-source" href={drink.sourceUrl} target="_blank" rel="noreferrer">
                  Published label
                </a>
                <button
                  type="button"
                  className="analyze snack-add"
                  onClick={() => addDrink(drink)}
                >
                  {addedName === drink.name ? "Added to today" : "Add to today"}
                </button>
              </article>
            </li>
          ))}
        </ul>
        {shown.length === 0 ? (
          <p className="empty">No drinks in that filter. Try another tab or log a custom drink.</p>
        ) : null}
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
