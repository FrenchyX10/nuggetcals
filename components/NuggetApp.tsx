"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { NuggetAvatar } from "@/components/NuggetAvatar";
import { loadHistory, todayTotals } from "@/lib/history";
import { kcal } from "@/lib/format";
import { loadPlan } from "@/lib/plan";
import {
  SHOP,
  buyItem,
  canCollect,
  collectDailyNugs,
  loadNugget,
  nuggetMood,
  nuggetScale,
  saveNugget,
  type NuggetSave,
  type ShopItem,
  type ShopKind,
} from "@/lib/nugget";

const TABS: { id: ShopKind | "all"; label: string }[] = [
  { id: "all", label: "Shop" },
  { id: "color", label: "Color" },
  { id: "face", label: "Face" },
  { id: "accessory", label: "Looks" },
];

export function NuggetApp() {
  const [save, setSave] = useState<NuggetSave | null>(null);
  const [todayCalories, setTodayCalories] = useState(0);
  const [planCalories, setPlanCalories] = useState(2000);
  const [tab, setTab] = useState<ShopKind | "all">("all");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const plan = loadPlan();
    const today = todayTotals(loadHistory());
    setPlanCalories(plan.calories);
    setTodayCalories(today.calories);
    setSave(loadNugget());
  }, []);

  function commit(next: NuggetSave, message?: string) {
    setSave(next);
    saveNugget(next);
    if (message) {
      setToast(message);
      window.setTimeout(() => setToast(null), 1800);
    }
  }

  const mood = nuggetMood(todayCalories, planCalories);
  const scale = nuggetScale(todayCalories, planCalories);
  const exploded = mood === "exploded";
  const remaining = planCalories - todayCalories;
  const room = 100 - Math.max(0, todayCalories - planCalories);
  const collectible = save ? canCollect(save, todayCalories, planCalories) : false;

  const items = useMemo(
    () => (tab === "all" ? SHOP : SHOP.filter((item) => item.kind === tab)),
    [tab],
  );

  if (!save) {
    return (
      <div className="page-shell">
        <p className="lede">Waking your nugget…</p>
      </div>
    );
  }

  const nug = save;

  function collect() {
    if (!collectible) return;
    commit(collectDailyNugs(nug), "+10 Nugs. Your nugget is proud.");
  }

  function shop(item: ShopItem) {
    const next = buyItem(nug, item);
    if ("error" in next) {
      setToast(next.error);
      window.setTimeout(() => setToast(null), 1800);
      return;
    }
    commit(
      next,
      nug.unlocked.includes(item.id) || item.cost === 0
        ? `Wearing ${item.name}`
        : `Unlocked ${item.name}`,
    );
  }

  const moodLine =
    mood === "exploded"
      ? "100+ over the goal. Your nugget popped."
      : mood === "nervous"
        ? "So close to the line. Easy does it."
        : mood === "proud"
          ? "Nice and full. Stay under to earn Nugs."
          : mood === "happy"
            ? "Growing with every meal. Keep it under the goal."
            : "Log food and watch it grow. Stay under to earn Nugs.";

  return (
    <div className="page-shell">
      <SiteHeader
        todayCalories={todayCalories}
        planCalories={planCalories}
        active="nugget"
      />

      <main className="nug-page">
        <section className="nug-hero">
          <div className="nug-bank">
            <span>Nugs</span>
            <strong>{nug.nugs}</strong>
          </div>
          <NuggetAvatar
            color={nug.color}
            face={nug.face}
            accessory={nug.accessory}
            scale={scale}
            exploded={exploded}
          />
          <p className="nug-mood">{moodLine}</p>
          <p className="nug-kcal">
            {kcal(todayCalories)} / {kcal(planCalories)} kcal
            {remaining >= 0
              ? ` · ${kcal(remaining)} left`
              : ` · ${kcal(Math.abs(remaining))} over`}
          </p>
          {exploded ? (
            <p className="nug-warn">No Nugs today. Tomorrow is a fresh fryer.</p>
          ) : collectible ? (
            <button type="button" className="analyze nug-collect" onClick={collect}>
              Collect 10 Nugs
            </button>
          ) : nug.lastAwardDay ? (
            <p className="hint">
              Streak {nug.streak} day{nug.streak === 1 ? "" : "s"}. Come back tomorrow if you stay under.
            </p>
          ) : (
            <p className="hint">
              Stay under {kcal(planCalories)} today, then collect 10 Nugs. Pop risk starts at +100.
              {room < 100 && remaining < 0 ? ` ${room} kcal until boom.` : ""}
            </p>
          )}
        </section>

        <section className="nug-shop">
          <div className="chips size-picks" aria-label="Customize">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={tab === item.id ? "chip is-on" : "chip"}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <ul className="nug-grid">
            {items.map((item) => {
              const owned = nug.unlocked.includes(item.id) || item.cost === 0;
              const wearing =
                nug.color === item.id ||
                nug.face === item.id ||
                nug.accessory === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`nug-sku ${wearing ? "is-on" : ""}`}
                    onClick={() => shop(item)}
                  >
                    <strong>{item.name}</strong>
                    <small>{item.blurb}</small>
                    <em>
                      {wearing
                        ? "Wearing"
                        : owned
                          ? "Owned · tap to wear"
                          : `${item.cost} Nugs`}
                    </em>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
        {toast ? <p className="nug-toast">{toast}</p> : null}
      </main>
    </div>
  );
}
