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
import { prepareImage } from "@/lib/image";
import { confidenceLabel, grams, kcal, methodLabel } from "@/lib/format";
import type { FoodRecord } from "@/lib/nutrition-data";
import type { MealAnalysis } from "@/lib/schema";

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
  "Loading on-device food AI (first time only)…",
  "Reading the photo on this computer…",
  "Estimating how big the portion is…",
  "Scaling published calories to that size…",
];

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

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (!busy) return;
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % ANALYZE_STEPS.length);
    }, 2200);
    return () => window.clearInterval(timer);
  }, [busy]);

  const today = useMemo(() => todayTotals(history), [history]);
  const activeEntry = history.find((item) => item.id === entryId) ?? null;
  const scale = activeEntry?.servings ?? servings;

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
      const sight = await inspectMealPhoto(
        previewUrl,
        restaurant.trim(),
        dishHint.trim(),
      );
      const nextMeal = analyzeFree(
        sight.labels,
        restaurant.trim(),
        dishHint.trim(),
        { caption: sight.caption, portionGrams: sight.portionGrams },
      );

      setMeal(nextMeal);
      if (nextMeal.isFood) {
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
      <header className="topbar">
        <a className="brand" href="#top">
          <span className="mark" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/nugget.jpg" alt="" />
          </span>
          Nugget<b>Cals</b>
        </a>
        <nav className="nav-links">
          <a href="#how">How it works</a>
          <a href="#log">Today</a>
        </nav>
        <div className="today-pill">
          <span>Today</span>
          <strong>{kcal(today.calories)} kcal</strong>
        </div>
      </header>

      <main>
        <section className="hero" id="top">
          <div>
            <p className="eyebrow">Snap it. Weigh it with your eyes.</p>
            <h1>
              Count the
              <em> nuggets, stacks, and plates</em>
            </h1>
            <p className="lede">
              Drop a real food photo. NuggetCals names the dish, estimates how
              big it is, and gives you calories — on this device, no login.
            </p>
          </div>
          <aside className="hero-aside">
            <p>
              <strong>No API key</strong>
              The food model runs in your browser. First scan downloads it once.
            </p>
            <p>
              <strong>Restaurant optional</strong>
              Add Chipotle, Cane&apos;s, or a diner name for menu-style numbers.
            </p>
          </aside>
        </section>

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
                  <small>JPG or PNG · close, well-lit food works best</small>
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

            <label className="field">
              <span>
                Restaurant <em>optional · makes restaurant meals much more accurate</em>
              </span>
              <input
                value={restaurant}
                onChange={(event) => setRestaurant(event.target.value)}
                placeholder="Chipotle, Olive Garden, the diner down the street…"
                maxLength={80}
              />
            </label>

            <div className="chips" aria-label="Restaurant shortcuts">
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

            <div className="chips" aria-label="Dish shortcuts">
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
              <p className="card-kicker">Logged today</p>
              <p className="stat-number">{kcal(today.calories)}</p>
              <p className="stat-unit">kcal from {today.count} scan{today.count === 1 ? "" : "s"}</p>
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
                <p className="empty">Your scans stay on this device. Nothing is uploaded except the photo you analyze.</p>
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
                The first run downloads a free food model onto this computer. After that it works offline.
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
              <h2>See the food. Guess the size. Scale the calories.</h2>
              <ol className="how-list">
                <li>
                  <strong>See the food.</strong> On-device AI describes the photo. No API key.
                </li>
                <li>
                  <strong>Estimate the size.</strong> It measures how much of the plate is filled, guesses grams, then scales published calories.
                </li>
                <li>
                  <strong>Adjust it.</strong> Use <em>I ate</em> if you only finished part of the plate.
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
  alternatives,
  onPick,
}: {
  meal: MealAnalysis;
  servings: number;
  onServings: (value: number) => void;
  alternatives: FoodRecord[];
  onPick: (record: FoodRecord) => void;
}) {
  const calories = meal.totalCalories * servings;
  const protein = meal.proteinG * servings;
  const carbs = meal.carbsG * servings;
  const fat = meal.fatG * servings;
  const macroTotal = Math.max(protein + carbs + fat, 1);

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
        Likely range {kcal(meal.calorieRangeLow * servings)}–
        {kcal(meal.calorieRangeHigh * servings)} kcal
      </p>

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
