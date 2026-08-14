"use client";

import dynamic from "next/dynamic";

const LogApp = dynamic(
  () => import("@/components/LogApp").then((mod) => mod.LogApp),
  {
    ssr: false,
    loading: () => (
      <div className="page-shell">
        <p className="lede">Loading NuggetCals…</p>
      </div>
    ),
  },
);

export default function Home() {
  return <LogApp />;
}
