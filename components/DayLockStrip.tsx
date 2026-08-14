"use client";

import { useEffect, useState } from "react";
import {
  loadNugget,
  mealsClosedToday,
  saveNugget,
  toggleMealsClosed,
} from "@/lib/nugget";

export function DayLockStrip() {
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    setClosed(mealsClosedToday(loadNugget()));
  }, []);

  function toggle() {
    const next = toggleMealsClosed(loadNugget());
    saveNugget(next);
    setClosed(mealsClosedToday(next));
  }

  return (
    <section className="day-lock" aria-label="Done eating today">
      <button type="button" className={closed ? "ghost" : "chip"} onClick={toggle}>
        {closed ? "Still eating" : "No more meals today"}
      </button>
      <p>
        {closed
          ? "Day locked. Collect Nugs on Your Nugget if you stayed under. Tap again if you eat more."
          : "Nugs only after you lock the day — so you cannot collect, then go over."}
      </p>
    </section>
  );
}
