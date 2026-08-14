"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { NuggetAvatar } from "@/components/NuggetAvatar";
import { loadHistory, todayTotals } from "@/lib/history";
import { kcal } from "@/lib/format";
import { loadPlan } from "@/lib/plan";
import {
  SHOP,
  applyGoalStreak,
  buyItem,
  canCollect,
  collectDailyNugs,
  loadNugget,
  nuggetMood,
  nuggetScale,
  previewLook,
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
  const [trying, setTrying] = useState<ShopItem | null>(null);

  useEffect(() => {
    const plan = loadPlan();
    const today = todayTotals(loadHistory());
    setPlanCalories(plan.calories);
    setTodayCalories(today.calories);
    const next = applyGoalStreak(loadNugget(), today.calories, plan.calories);
    saveNugget(next);
    setSave(next);
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

  const items = useMemo(() => {
    const owned = new Set(save?.unlocked ?? []);
    return SHOP.filter((item) => {
      if (item.secret && !owned.has(item.id)) return false;
      return tab === "all" || item.kind === tab;
    });
  }, [tab, save]);

  if (!save) {
    return (
      <div className="page-shell">
        <p className="lede">Waking your nugget…</p>
      </div>
    );
  }

  const nug = save;
  const look = trying ? previewLook(nug, trying) : nug;

  function collect() {
    if (!collectible) return;
    commit(collectDailyNugs(nug), "+10 Nugs. Your nugget is proud.");
  }

  function tryItem(item: ShopItem) {
    const owned = nug.unlocked.includes(item.id) || item.cost === 0;
    if (owned) {
      const next = buyItem(nug, item);
      if ("error" in next) return;
      setTrying(null);
      commit(next, `Wearing ${item.name}`);
      return;
    }
    setTrying(item);
    setToast(`Trying ${item.name}`);
    window.setTimeout(() => setToast(null), 1400);
  }

  function buyTried() {
    if (!trying) return;
    const next = buyItem(nug, trying);
    if ("error" in next) {
      setToast(next.error);
      window.setTimeout(() => setToast(null), 1800);
      return;
    }
    setTrying(null);
    commit(next, `Bought ${trying.name}`);
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
          <div className="nug-topstats">
            <div className="nug-bank">
              <span>Nugs</span>
              <strong>{nug.nugs}</strong>
            </div>
            <div className={`nug-bank ${todayCalories > planCalories ? "is-broke" : ""}`}>
              <span>Streak</span>
              <strong>{nug.streak}</strong>
            </div>
          </div>
          <NuggetAvatar
            color={look.color}
            face={look.face}
            accessory={look.accessory}
            scale={scale}
            exploded={exploded}
          />
          <p className="nug-mood hide-mobile">{moodLine}</p>
          <p className="nug-kcal">
            {kcal(todayCalories)} / {kcal(planCalories)}
          </p>
          <p className="hint hide-mobile">
            <a href="/codes">Have a code? Redeem it</a>
          </p>
          {exploded ? (
            <p className="nug-warn">No Nugs today. Tomorrow is a fresh fryer.</p>
          ) : collectible ? (
            <button type="button" className="analyze nug-collect" onClick={collect}>
              Collect 10 Nugs
            </button>
          ) : todayCalories > planCalories ? (
            <p className="nug-warn">Over goal. Streak reset to 0.</p>
          ) : nug.lastAwardDay ? (
            <p className="hint">
              Streak {nug.streak} day{nug.streak === 1 ? "" : "s"}. Stay at or under {kcal(planCalories)} or it drops to zero.
            </p>
          ) : (
            <p className="hint">
              Stay at or under {kcal(planCalories)} to grow your streak and collect 10 Nugs.
              Go over and the streak is gone. Pop at +100.
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
                !trying &&
                (nug.color === item.id ||
                  nug.face === item.id ||
                  nug.accessory === item.id);
              const previewing = trying?.id === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`nug-sku ${wearing || previewing ? "is-on" : ""}`}
                    onClick={() => tryItem(item)}
                  >
                    <strong>{item.name}</strong>
                    <small>{item.blurb}</small>
                    <em>
                      {wearing
                        ? "Wearing"
                        : previewing
                          ? "Trying on"
                          : owned
                            ? "Owned · tap to wear"
                            : `Try · ${item.cost} Nugs`}
                    </em>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
        {trying && !(nug.unlocked.includes(trying.id) || trying.cost === 0) ? (
          <div className="nug-trybar">
            <div>
              <strong>Trying {trying.name}</strong>
              <small>{trying.cost} Nugs to keep it</small>
            </div>
            <button type="button" className="ghost" onClick={() => setTrying(null)}>
              Reset
            </button>
            <button type="button" className="analyze nug-buy" onClick={buyTried}>
              Buy
            </button>
          </div>
        ) : null}
        {toast ? <p className="nug-toast">{toast}</p> : null}
      </main>
    </div>
  );
}
