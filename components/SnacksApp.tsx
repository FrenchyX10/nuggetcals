"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { addHistory, loadHistory, todayTotals, type HistoryEntry } from "@/lib/history";
import { grams, kcal } from "@/lib/format";
import { loadPlan } from "@/lib/plan";
import { prepareImage } from "@/lib/image";
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
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

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
  const shown = remote.length > 0 ? remote : local;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    try {
      const prepared = await prepareImage(file);
      setPreviewUrl(prepared.previewUrl);
      setThumbnail(prepared.thumbnail);
      setImageBase64(prepared.base64);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that photo.");
    }
  }

  function clearPhoto() {
    setPreviewUrl(null);
    setThumbnail(null);
    setImageBase64(null);
  }

  async function lookup() {
    const text = query.trim();
    if (!imageBase64 && text.length < 2) {
      setError("Type a snack name or upload a bag photo.");
      return;
    }
    setBusy(true);
    setError(null);
    setReason("");
    try {
      const response = await fetch("/api/snack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          groqKey,
          imageBase64: imageBase64 ?? "",
        }),
      });
      const data = (await response.json()) as {
        snacks?: SnackRecord[];
        picked?: number;
        reason?: string;
        query?: string;
        identified?: string;
        error?: string;
        message?: string;
      };
      if (!response.ok) throw new Error(data.message || data.error || "Snack lookup failed.");
      if (data.identified && !text) setQuery(data.identified);
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
      setCategory("all");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Snack lookup failed.");
    } finally {
      setBusy(false);
    }
  }

  function addSnack(snack: SnackRecord) {
    const entry = historyFromSnack(snack, servings, thumbnail ?? undefined);
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
              Upload a bag photo or type a name. AI reads the label, then
              matches USDA and brand nutrition so the snack can be added to
              your day.
            </p>
          </div>
          <aside className="hero-aside">
            <p>
              <strong>Photo or search</strong>
              Snap the bag. Vision names the snack, then published labels
              supply the calories.
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
                <img src={previewUrl} alt="Snack bag preview" />
              ) : (
                <div className="drop-copy">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="nugget-float" src="/nugget.jpg" alt="" />
                  <span className="drop-kicker">Drop a snack photo</span>
                  <strong>Tap to snap the bag</strong>
                  <small>JPG or PNG · photo of the bag or wrapper works best</small>
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
                <button type="button" className="ghost" onClick={clearPhoto}>
                  Clear
                </button>
              ) : null}
            </div>

            <label className="field">
              <span>
                Or type the snack{" "}
                <em>brand + flavor finds more labels</em>
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
                placeholder="Takis Fuego, Cheez-It, Pop-Tarts…"
                maxLength={80}
              />
            </label>
            <button
              type="button"
              className="analyze snack-search"
              disabled={busy || (!imageBase64 && query.trim().length < 2)}
              onClick={() => void lookup()}
            >
              {busy
                ? imageBase64
                  ? "Reading the bag and searching labels…"
                  : "Searching USDA and brand labels…"
                : imageBase64
                  ? "Identify bag and find calories"
                  : "Search USDA / brand labels"}
            </button>
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
            Nothing matched. Upload the bag or search the brand plus flavor.
          </p>
        ) : null}

        <p className="hint snack-foot">
          Showing {remote.length > 0 ? `${shown.length} online matches` : shown.length === SNACKS.length ? "the built-in chip and snack list" : `${shown.length} list matches`}.
          Search now uses USDA FoodData Central and Open Food Facts together
          {groqKey ? ", plus Groq to read a bag photo" : ""}.
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
