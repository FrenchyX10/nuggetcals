"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { loadHistory, todayTotals } from "@/lib/history";
import { loadPlan } from "@/lib/plan";
import { loadNugget, redeemCode } from "@/lib/nugget";

export function CodesApp() {
  const [todayCalories, setTodayCalories] = useState(0);
  const [planCalories, setPlanCalories] = useState(2000);
  const [nugs, setNugs] = useState(0);
  const [code, setCode] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setTodayCalories(todayTotals(loadHistory()).calories);
    setPlanCalories(loadPlan().calories);
    setNugs(loadNugget().nugs);
  }, []);

  function redeem() {
    const result = redeemCode(code);
    setNugs(result.total);
    setOk(result.ok);
    setNote(result.message);
    if (result.ok) setCode("");
  }

  return (
    <div className="page-shell">
      <SiteHeader
        todayCalories={todayCalories}
        planCalories={planCalories}
        active="nugget"
      />
      <main>
        <section className="hero" id="top">
          <div>
            <p className="eyebrow">Redeem.</p>
            <h1>
              Enter a
              <em> code</em>
            </h1>
            <p className="lede">
              Type a Nugget code. If it is good, Nugs land in your bank and you
              can spend them on Your Nugget.
            </p>
          </div>
        </section>

        <section className="workspace snack-workspace">
          <div className="composer">
            <div className="nug-bank" style={{ justifySelf: "start", marginBottom: 12 }}>
              <span>Nugs</span>
              <strong>{nugs}</strong>
            </div>
            <label className="field">
              <span>Code</span>
              <input
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  setNote(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") redeem();
                }}
                placeholder="Enter code"
                maxLength={40}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </label>
            <button
              type="button"
              className="analyze"
              disabled={code.trim().length < 2}
              onClick={redeem}
            >
              Redeem
            </button>
            {note ? <p className={ok ? "hint" : "error"}>{note}</p> : null}
            <p className="hint">
              <a href="/nugget">Back to Your Nugget</a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
