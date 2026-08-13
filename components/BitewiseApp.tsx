"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addHistory,
  loadHistory,
  removeHistory,
  saveHistory,
  todayTotals,
  updateHistory,
  type HistoryEntry,
} from "@/lib/history";
import { analyzeFree, mealFromRecord, suggestAlternatives } from "@/lib/free-analyze";
import { inspectMealPhoto } from "@/lib/local-vision";
import { detectQuarterScale } from "@/lib/quarter-scale";
import { prepareImage } from "@/lib/image";
import { confidenceLabel, grams, kcal, methodLabel } from "@/lib/format";
import { DAILY_PLANS, loadPlan, savePlan } from "@/lib/plan";
import { findRestaurant, type FoodRecord } from "@/lib/nutrition-data";
import type { MealAnalysis } from "@/lib/schema";
import { SiteHeader } from "@/components/SiteHeader";
import { RestaurantPicker } from "@/components/RestaurantPicker";
import {
  applyPortionSize,
  inferMealSize,
  parsePortionSize,
  PORTION_SIZES,
  SIZE_LABEL,
  type PortionSize,
} from "@/lib/portion-size";

const RESTAURANTS = [
  "Chipotle",
  "McDonald's",
  "Chick-fil-A",
  "Raising Cane's",
  "Popeyes",
  "KFC",
  "Starbucks",
  "Sweetgreen",
  "Taco Bell",
  "Panera",
  "Five Guys",
  "Shake Shack",
  "Olive Garden",
];

const DISH_HINTS = [
  "Pancakes",
  "Blueberry pancakes",
  "Waffles",
  "Chicken",
  "Burger",
  "Pizza",
  "Salad",
  "Tacos",
  "Bowl",
  "Pasta",
  "Sandwich",
  "Wings",
  "Fries",
];

const ANALYZE_STEPS = [
  "Identifying the food on the plate…",
  "Using visible ingredients as a scale…",
  "Picking small, medium, or large, then calories…",
];

const GROQ_KEY = "nuggetcals-groq-key";

export function BitewiseApp() {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLElement>(null);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [restaurant, setRestaurant] = useState("");
  const [dishHint, setDishHint] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [meal, setMeal] = useState<MealAnalysis | null>(null);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [servings, setServings] = useState(1);
  const [planId, setPlanId] = useState("maintain");
  const [planCalories, setPlanCalories] = useState(2000);
  const [groqKey, setGroqKey] = useState("");
  const [keyDraft, setKeyDraft] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [sizeHint, setSizeHint] = useState<PortionSize | "">("");

  useEffect(() => {
    setHistory(loadHistory());
    const plan = loadPlan();
    setPlanId(plan.id);
    setPlanCalories(plan.calories);
    const stored = window.localStorage.getItem(GROQ_KEY) ?? "";
    setGroqKey(stored);
  }, []);

  useEffect(() => {
    if (!busy) return;
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % ANALYZE_STEPS.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [busy]);

  const today = useMemo(() => todayTotals(history), [history]);
  const remaining = planCalories - today.calories;
  const usedShare = Math.min(1, today.calories / Math.max(planCalories, 1));
  const activeEntry = history.find((item) => item.id === entryId) ?? null;
  const scale = activeEntry?.servings ?? servings;

  async function saveGroqKey() {
    const value = keyDraft.trim();
    if (value.length < 20) {
      setError("Paste the full Groq key. It is free — no credit card.");
      return;
    }
    setSavingKey(true);
    setError(null);
    try {
      window.localStorage.setItem(GROQ_KEY, value);
      setGroqKey(value);
      setKeyDraft("");
      await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groqKey: value }),
      });
    } finally {
      setSavingKey(false);
    }
  }

  function choosePlan(id: string, calories: number) {
    setPlanId(id);
    setPlanCalories(calories);
    savePlan(id, calories);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setMeal(null);
    setEntryId(null);
    setServings(1);
    try {
      const prepared = await prepareImage(file);
      setPreviewUrl(prepared.previewUrl);
      setThumbnail(prepared.thumbnail);
      setImageBase64(prepared.base64);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that photo.");
    }
  }

  async function analyze() {
    if (!imageBase64 || !thumbnail || !previewUrl) {
      setError("Add a photo of the meal first.");
      return;
    }

    setBusy(true);
    setError(null);
    setStep(0);

    try {
      const quarter = await detectQuarterScale(previewUrl);
      let nextMeal: MealAnalysis | null = null;

      if (groqKey) {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64,
            restaurant: restaurant.trim(),
            dishHint: dishHint.trim(),
            sizeHint,
            groqKey,
            quarterFound: quarter.found,
          }),
        });
        const data = (await response.json()) as
          | { meal: MealAnalysis }
          | { error: string; message?: string };
        if (response.ok && "meal" in data) {
          nextMeal = data.meal;
        } else {
          throw new Error(
            "error" in data
              ? data.message || data.error
              : "Vision analysis failed.",
          );
        }
      } else {
        const sight = await inspectMealPhoto(
          previewUrl,
          restaurant.trim(),
          dishHint.trim(),
        );
        nextMeal = analyzeFree(
          sight.labels,
          restaurant.trim(),
          [dishHint.trim(), sizeHint].filter(Boolean).join(" "),
          {
            caption: sight.caption,
            portionGrams: sight.portionGrams,
            quarterFound: sight.quarterFound || quarter.found,
          },
        );
      }

      setMeal(nextMeal);
      if (nextMeal.isFood) {
        setSizeHint(parsePortionSize(nextMeal.portionSize, inferMealSize(nextMeal)));
        const id = crypto.randomUUID();
        const entry: HistoryEntry = {
          id,
          createdAt: new Date().toISOString(),
          thumbnail,
          mealName: nextMeal.mealName,
          restaurant: nextMeal.restaurant ?? restaurant.trim() ?? null,
          totalCalories: nextMeal.totalCalories,
          proteinG: nextMeal.proteinG,
          carbsG: nextMeal.carbsG,
          fatG: nextMeal.fatG,
          overallConfidence: nextMeal.overallConfidence,
          servings: 1,
          result: nextMeal,
        };
        setEntryId(id);
        setServings(1);
        setHistory(addHistory(entry));
      }
      window.requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analyze failed.");
    } finally {
      setBusy(false);
    }
  }

  function openEntry(entry: HistoryEntry) {
    setMeal(entry.result);
    setPreviewUrl(entry.thumbnail);
    setThumbnail(entry.thumbnail);
    setImageBase64(null);
    setRestaurant(entry.restaurant ?? "");
    setEntryId(entry.id);
    setServings(entry.servings);
    setError(null);
    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function changeServings(next: number) {
    const value = Math.min(3, Math.max(0.25, next));
    setServings(value);
    if (entryId) setHistory(updateHistory(entryId, { servings: value }));
  }

  function changeSize(next: PortionSize) {
    setSizeHint(next);
    if (!meal) return;
    const updated = applyPortionSize(meal, next);
    setMeal(updated);
    if (entryId) {
      setHistory(
        updateHistory(entryId, {
          result: updated,
          totalCalories: updated.totalCalories,
          proteinG: updated.proteinG,
          carbsG: updated.carbsG,
          fatG: updated.fatG,
        }),
      );
    }
  }

  function resetPlate() {
    setMeal(null);
    setPreviewUrl(null);
    setThumbnail(null);
    setImageBase64(null);
    setEntryId(null);
    setServings(1);
    setError(null);
    setRestaurant("");
    setDishHint("");
    setSizeHint("");
  }

  function pickMenuItem(record: FoodRecord) {
    const chain = findRestaurant(restaurant) ?? record.restaurant ?? restaurant.trim();
    setRestaurant(chain);
    setDishHint(record.name);
    const nextMeal = mealFromRecord(record, chain);
    setMeal(nextMeal);
    const id = entryId ?? crypto.randomUUID();
    const entry: HistoryEntry = {
      id,
      createdAt: new Date().toISOString(),
      thumbnail: thumbnail ?? "/nugget.jpg",
      mealName: nextMeal.mealName,
      restaurant: nextMeal.restaurant ?? chain,
      totalCalories: nextMeal.totalCalories,
      proteinG: nextMeal.proteinG,
      carbsG: nextMeal.carbsG,
      fatG: nextMeal.fatG,
      overallConfidence: nextMeal.overallConfidence,
      servings: 1,
      result: nextMeal,
    };
    setEntryId(id);
    setServings(1);
    setHistory(addHistory(entry));
    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function pickAlternative(record: FoodRecord) {
    const nextMeal = mealFromRecord(record, restaurant.trim());
    setMeal(nextMeal);
    setDishHint(record.name);
    if (entryId) {
      const next = history.map((item) => {
        if (item.id !== entryId) return item;
        return {
          ...item,
          mealName: nextMeal.mealName,
          restaurant: nextMeal.restaurant,
          totalCalories: nextMeal.totalCalories,
          proteinG: nextMeal.proteinG,
          carbsG: nextMeal.carbsG,
          fatG: nextMeal.fatG,
          overallConfidence: nextMeal.overallConfidence,
          result: nextMeal,
        };
      });
      saveHistory(next);
      setHistory(next);
    }
  }

  return (
    <div className="page-shell">
      <SiteHeader
        todayCalories={today.calories}
        planCalories={planCalories}
        active="meals"
      />

      <main>
        <section className="hero" id="top">
          <div>
            <p className="eyebrow">Identify. Size. Calories.</p>
            <h1>
              Count the
              <em> nuggets, stacks, and plates</em>
            </h1>
            <p className="lede">
              Drop a real food photo. AI identifies the plate, looks up the
              serving size, then estimates calories from published nutrition.
            </p>
          </div>
          <aside className="hero-aside hide-mobile">
            <p>
              <strong>Identify the plate</strong>
              Vision AI names what is actually on the plate — pancakes stay
              pancakes, chicken stays chicken — and whether it looks small,
              medium, or large.
            </p>
            <p>
              <strong>Look up the size</strong>
              AI measures the portion from what it can see — rice scoops,
              fries, piece count, how full the plate is — then picks small,
              medium, or large. A US quarter makes that scale tighter.
            </p>
            <p>
              <strong>Estimate the calories</strong>
              Published restaurant and USDA numbers are scaled to that size.
              Add a restaurant name for menu-style accuracy.
            </p>
          </aside>
        </section>

        {!groqKey ? (
          <section className="setup-card">
            <p className="card-kicker">One-time setup</p>
            <h2>Add your free Groq key to start identifying plates</h2>
            <p>
              NuggetCals uses Groq vision to name the food, then looks up size
              and calories. The key is free and does not need a credit card.
              Create one at{" "}
              <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">
                console.groq.com/keys
              </a>
              , then paste it here.
            </p>
            <label className="field">
              <span>Groq API key</span>
              <input
                type="password"
                autoComplete="off"
                value={keyDraft}
                onChange={(event) => setKeyDraft(event.target.value)}
                placeholder="gsk_..."
              />
            </label>
            <button
              type="button"
              className="analyze"
              disabled={savingKey || keyDraft.trim().length < 20}
              onClick={() => void saveGroqKey()}
            >
              {savingKey ? "Saving…" : "Save key"}
            </button>
          </section>
        ) : (
          <p className="hint hide-mobile">
            Vision AI is on. Identify the plate, look up the size, then estimate
            calories. Add a quarter next to homemade food for a closer scale.
          </p>
        )}

        <section className="workspace">
          <div className="composer">
            <button
              type="button"
              className={`dropzone ${dragOver ? "is-over" : ""} ${previewUrl ? "has-image" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                void onFile(event.dataTransfer.files[0]);
              }}
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Meal preview" />
              ) : (
                <div className="drop-copy">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="nugget-float" src="/nugget.jpg" alt="" />
                  <span className="drop-kicker">Drop a meal photo</span>
                  <strong>Tap to snap or upload</strong>
                  <small>JPG or PNG · add a US quarter next to homemade food for scale</small>
                </div>
              )}
            </button>

            <div className="photo-actions">
              <button type="button" className="ghost" onClick={() => fileRef.current?.click()}>
                Choose photo
              </button>
              <button type="button" className="ghost" onClick={() => cameraRef.current?.click()}>
                Use camera
              </button>
              {previewUrl ? (
                <button type="button" className="ghost" onClick={resetPlate}>
                  Clear
                </button>
              ) : null}
            </div>

            <RestaurantPicker
              restaurant={restaurant}
              onRestaurant={setRestaurant}
              onPickItem={pickMenuItem}
            />

            <div className="chips hide-mobile" aria-label="Restaurant shortcuts">
              {RESTAURANTS.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={restaurant === name ? "chip is-on" : "chip"}
                  onClick={() =>
                    setRestaurant((current) => (current === name ? "" : name))
                  }
                >
                  {name}
                </button>
              ))}
            </div>

            <label className="field">
              <span>
                What is it? <em>optional · type chicken if that is what you photographed</em>
              </span>
              <input
                value={dishHint}
                onChange={(event) => setDishHint(event.target.value)}
                placeholder="grilled chicken, chicken sandwich, bowl…"
                maxLength={80}
              />
            </label>

            <div className="chips hide-mobile" aria-label="Dish shortcuts">
              {DISH_HINTS.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={dishHint.toLowerCase() === name.toLowerCase() ? "chip is-on" : "chip"}
                  onClick={() =>
                    setDishHint((current) =>
                      current.toLowerCase() === name.toLowerCase() ? "" : name,
                    )
                  }
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="size-field">
              <p className="field-label">
                Size <em>optional · AI picks this if you leave it</em>
              </p>
              <div className="chips size-picks" aria-label="Portion size">
                {PORTION_SIZES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={sizeHint === value ? "chip is-on" : "chip"}
                    onClick={() =>
                      changeSize(value)
                    }
                  >
                    {SIZE_LABEL[value]}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="analyze"
              disabled={busy || !imageBase64}
              onClick={() => void analyze()}
            >
              {busy ? ANALYZE_STEPS[step] : "Count these cals"}
            </button>
            {!imageBase64 ? (
              <p className="hint">Upload a new photo to analyze. Opening a past scan only shows saved results.</p>
            ) : null}
            <p className="hint hide-mobile">
              Also log{" "}
              <a href="/snacks">snacks</a>,{" "}
              <a href="/homemade">homemade</a>, or{" "}
              <a href="/drinks">drinks</a>.
            </p>
            {error ? <p className="error">{error}</p> : null}

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              hidden
              onChange={(event) => {
                void onFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(event) => {
                void onFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </div>

          <aside className="side">
            <div className="stat-card" id="log">
              <p className="card-kicker">Daily plan</p>
              <p className="stat-number">{kcal(today.calories)}</p>
              <p className="stat-unit">
                of {kcal(planCalories)} kcal · {today.count} scan
                {today.count === 1 ? "" : "s"}
              </p>
              <div className="plan-bar" aria-hidden>
                <i
                  className={remaining < 0 ? "is-over" : ""}
                  style={{ width: `${Math.max(6, usedShare * 100)}%` }}
                />
              </div>
              <p className={remaining < 0 ? "plan-left is-over" : "plan-left"}>
                {remaining >= 0
                  ? `${kcal(remaining)} kcal left today`
                  : `${kcal(Math.abs(remaining))} kcal over plan`}
              </p>
              <div className="chips plan-chips" aria-label="Daily calorie plan">
                {DAILY_PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    className={planId === plan.id ? "chip is-on" : "chip"}
                    onClick={() =>
                      choosePlan(
                        plan.id,
                        plan.id === "custom" ? planCalories : plan.calories,
                      )
                    }
                  >
                    {plan.label}
                    <em> {plan.id === "custom" ? kcal(planCalories) : kcal(plan.calories)}</em>
                  </button>
                ))}
              </div>
              {planId === "custom" ? (
                <label className="field plan-custom">
                  <span>Custom daily calories</span>
                  <input
                    type="number"
                    min={800}
                    max={6000}
                    step={50}
                    value={planCalories}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      const next = Number.isFinite(value) ? value : 2000;
                      choosePlan("custom", next);
                    }}
                  />
                </label>
              ) : (
                <p className="empty">
                  {DAILY_PLANS.find((plan) => plan.id === planId)?.blurb}
                </p>
              )}
              <div className="mini-macros">
                <span>P {grams(today.protein)}g</span>
                <span>C {grams(today.carbs)}g</span>
                <span>F {grams(today.fat)}g</span>
              </div>
            </div>

            <div className="history">
              <div className="history-head">
                <p className="card-kicker">Recent plates</p>
              </div>
              {history.length === 0 ? (
                <p className="empty">No meals logged today. Snap a plate to start counting.</p>
              ) : (
                <ul>
                  {history.map((entry) => (
                    <li key={entry.id}>
                      <button type="button" className="history-item" onClick={() => openEntry(entry)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={entry.thumbnail} alt="" />
                        <div>
                          <strong>{entry.mealName}</strong>
                          <small>
                            {entry.restaurant ?? "No restaurant"} ·{" "}
                            {kcal(entry.totalCalories * entry.servings)} kcal
                          </small>
                        </div>
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={`Remove ${entry.mealName}`}
                        onClick={() => {
                          const next = removeHistory(entry.id);
                          setHistory(next);
                          if (entryId === entry.id) resetPlate();
                        }}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </section>

        <section className="results" ref={resultsRef} id="results">
          {busy ? (
            <div className="result-card scanning">
              <div className="scan-bar" />
              <p className="card-kicker">Reading the plate</p>
              <h2>{ANALYZE_STEPS[step]}</h2>
              <p>
                AI names the food, then uses visible ingredients as a scale to
                pick small, medium, or large. Calories come from that size.
              </p>
            </div>
          ) : meal && !meal.isFood ? (
            <div className="result-card">
              <p className="card-kicker">Not a meal</p>
              <h2>That photo does not look like food.</h2>
              <p>{meal.notFoodReason ?? "Try a closer shot of the plate or drink."}</p>
            </div>
          ) : meal ? (
            <Results
              meal={meal}
              servings={scale}
              onServings={changeServings}
              onSize={changeSize}
              alternatives={suggestAlternatives(
                restaurant,
                dishHint,
                meal.matchedMenuItem ?? meal.mealName,
              )}
              onPick={pickAlternative}
            />
          ) : (
            <div className="result-card muted" id="how">
              <p className="card-kicker">How NuggetCals works</p>
              <h2>Identify the plate. Judge the size. Estimate calories.</h2>
              <ol className="how-list">
                <li>
                  <strong>Identify.</strong> Vision AI names every item on the plate. It does not invent calorie numbers.
                </li>
                <li>
                  <strong>Size.</strong> AI uses visible ingredients as a scale — scoops, piece count, how full the plate is, or a US quarter — then picks small, medium, or large.
                </li>
                <li>
                  <strong>Calories.</strong> Official S/M/L menu rows when they exist, otherwise published numbers scaled to that size. Tap Small / Medium / Large if it guessed wrong.
                </li>
              </ol>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>NuggetCals · estimates only, not medical advice.</p>
        <p>Restaurant names make chain meals more accurate.</p>
      </footer>
    </div>
  );
}

function Results({
  meal,
  servings,
  onServings,
  onSize,
  alternatives,
  onPick,
}: {
  meal: MealAnalysis;
  servings: number;
  onServings: (value: number) => void;
  onSize: (value: PortionSize) => void;
  alternatives: FoodRecord[];
  onPick: (record: FoodRecord) => void;
}) {
  const calories = meal.totalCalories * servings;
  const protein = meal.proteinG * servings;
  const carbs = meal.carbsG * servings;
  const fat = meal.fatG * servings;
  const macroTotal = Math.max(protein + carbs + fat, 1);
  const size = parsePortionSize(meal.portionSize, inferMealSize(meal));

  return (
    <div className="result-card">
      <div className="result-top">
        <div>
          <p className="card-kicker">
            {methodLabel(meal.method)} · {confidenceLabel(meal.overallConfidence)}
          </p>
          <h2>{meal.mealName}</h2>
          {meal.restaurant || meal.matchedMenuItem ? (
            <p className="match">
              {meal.restaurant ? meal.restaurant : "Menu match"}
              {meal.matchedMenuItem ? ` · ${meal.matchedMenuItem}` : ""}
            </p>
          ) : null}
        </div>
        <div className="calorie-block">
          <span>{kcal(calories)}</span>
          <small>kcal</small>
        </div>
      </div>

      <p className="range">
        {SIZE_LABEL[size]} portion · likely range{" "}
        {kcal(meal.calorieRangeLow * servings)}–
        {kcal(meal.calorieRangeHigh * servings)} kcal
      </p>

      <div className="size-field">
        <p className="field-label">Size</p>
        <div className="chips size-picks" aria-label="Portion size">
          {PORTION_SIZES.map((value) => (
            <button
              key={value}
              type="button"
              className={size === value ? "chip is-on" : "chip"}
              onClick={() => onSize(value)}
            >
              {SIZE_LABEL[value]}
            </button>
          ))}
        </div>
      </div>

      <div className="macros">
        <Macro label="Protein" value={protein} color="var(--protein)" share={protein / macroTotal} />
        <Macro label="Carbs" value={carbs} color="var(--carbs)" share={carbs / macroTotal} />
        <Macro label="Fat" value={fat} color="var(--fat)" share={fat / macroTotal} />
      </div>

      <div className="meta-row">
        <span>Fiber {grams(meal.fiberG * servings)}g</span>
        <span>Sugar {grams(meal.sugarG * servings)}g</span>
        <span>Sodium {Math.round(meal.sodiumMg * servings).toLocaleString()}mg</span>
      </div>

      <label className="servings">
        <span>I ate</span>
        <input
          type="range"
          min={0.25}
          max={2}
          step={0.25}
          value={servings}
          onChange={(event) => onServings(Number(event.target.value))}
        />
        <strong>
          {servings === 1 ? "the whole plate" : `${servings.toFixed(2).replace(/\.00$/, "")}× this plate`}
        </strong>
      </label>

      {alternatives.length > 0 ? (
        <div className="alts">
          <p className="card-kicker">Wrong dish? Tap the right one</p>
          <div className="chips">
            {alternatives.map((item) => (
              <button
                key={`${item.restaurant ?? "g"}-${item.name}`}
                type="button"
                className="chip"
                onClick={() => onPick(item)}
              >
                {item.name}
                <em> {kcal(item.calories)}</em>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <ul className="items">
        {meal.items.map((item) => (
          <li key={`${item.name}-${item.portionDescription}`}>
            <div>
              <strong>{item.name}</strong>
              <small>
                {item.portionDescription}
                {item.brandOrRestaurantItem ? ` · ${item.brandOrRestaurantItem}` : ""}
              </small>
              <em>{item.notes}</em>
            </div>
            <div className="item-cals">
              <b>{kcal(item.calories * servings)}</b>
              <small>{item.dataSource.replaceAll("_", " ")}</small>
            </div>
          </li>
        ))}
      </ul>

      {meal.assumptions.length > 0 ? (
        <div className="notes">
          <p className="card-kicker">Assumptions that move the number</p>
          <ul>
            {meal.assumptions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="precision">{meal.precisionNotes}</p>

      {meal.sources.length > 0 ? (
        <div className="sources">
          <p className="card-kicker">Sources</p>
          <ul>
            {meal.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title || source.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Macro({
  label,
  value,
  color,
  share,
}: {
  label: string;
  value: number;
  color: string;
  share: number;
}) {
  return (
    <div className="macro">
      <div className="macro-head">
        <span>{label}</span>
        <strong>{grams(value)}g</strong>
      </div>
      <div className="bar">
        <i style={{ width: `${Math.max(6, share * 100)}%`, background: color }} />
      </div>
    </div>
  );
}
