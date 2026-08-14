"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { LogSwitcher } from "@/components/LogSwitcher";
import { BitewiseApp } from "@/components/BitewiseApp";
import { SnacksApp } from "@/components/SnacksApp";
import { HomemadeApp } from "@/components/HomemadeApp";
import { DrinksApp } from "@/components/DrinksApp";
import { loadHistory, todayTotals } from "@/lib/history";
import { loadLogMode, saveLogMode, type LogMode } from "@/lib/log-mode";
import { loadPlan } from "@/lib/plan";

export function LogApp() {
  const [mode, setMode] = useState<LogMode>("photo");
  const [todayCalories, setTodayCalories] = useState(0);
  const [planCalories, setPlanCalories] = useState(2000);

  useEffect(() => {
    setMode(loadLogMode());
    setTodayCalories(todayTotals(loadHistory()).calories);
    setPlanCalories(loadPlan().calories);
  }, []);

  function pick(next: LogMode) {
    setMode(next);
    saveLogMode(next);
  }

  const pane = useMemo(() => {
    if (mode === "snack") return <SnacksApp embedded />;
    if (mode === "homemade") return <HomemadeApp embedded />;
    if (mode === "drink") return <DrinksApp embedded />;
    return <BitewiseApp embedded />;
  }, [mode]);

  return (
    <div className="page-shell">
      <SiteHeader
        todayCalories={todayCalories}
        planCalories={planCalories}
        active="log"
      />
      <LogSwitcher mode={mode} onMode={pick} />
      {pane}
    </div>
  );
}
