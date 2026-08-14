"use client";

import { useEffect, useState } from "react";
import { kcal } from "@/lib/format";
import { loadHistory, todayTotals } from "@/lib/history";
import { applyGoalStreak, clawBackNugsIfOver, loadNugget, saveNugget } from "@/lib/nugget";
import { loadPlan } from "@/lib/plan";

export type SitePage = "log" | "trends" | "nugget";

const LINKS: { id: SitePage; href: string; label: string; short: string }[] = [
  { id: "log", href: "/", label: "Log", short: "Log" },
  { id: "trends", href: "/trends", label: "Trends", short: "Trends" },
  { id: "nugget", href: "/nugget", label: "Your Nugget", short: "Nugget" },
];

export function SiteHeader({
  todayCalories,
  planCalories,
  active,
}: {
  todayCalories: number;
  planCalories: number;
  active: SitePage;
}) {
  const [today, setToday] = useState(todayCalories);
  const [plan, setPlan] = useState(planCalories);

  useEffect(() => {
    setToday(todayCalories);
    setPlan(planCalories);
  }, [todayCalories, planCalories]);

  useEffect(() => {
    function sync(nextToday = todayTotals(loadHistory()).calories, nextPlan = loadPlan().calories) {
      setToday(nextToday);
      setPlan(nextPlan);
      const clawed = clawBackNugsIfOver(loadNugget(), nextToday, nextPlan);
      saveNugget(applyGoalStreak(clawed, nextToday, nextPlan));
    }
    sync();
    function onHistory() {
      sync();
    }
    window.addEventListener("nuggetcals-history", onHistory);
    return () => window.removeEventListener("nuggetcals-history", onHistory);
  }, []);

  return (
    <>
      <header className="topbar">
        <a className="brand" href="/">
          <span className="mark" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/nugget.png" alt="" />
          </span>
          Nugget<b>Cals</b>
        </a>
        <nav className="nav-links">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={active === link.id ? "is-active" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          className="today-pill"
          href={active === "log" ? "/#log" : `${LINKS.find((link) => link.id === active)?.href ?? "/"}#log`}
        >
          <span>Today</span>
          <strong>
            {kcal(today)}
            <i> / {kcal(plan)}</i>
          </strong>
        </a>
      </header>
      <nav className="dock" aria-label="Main">
        {LINKS.map((link) => (
          <a
            key={link.id}
            href={link.href}
            className={active === link.id ? "is-active" : undefined}
          >
            {link.short}
          </a>
        ))}
      </nav>
    </>
  );
}
