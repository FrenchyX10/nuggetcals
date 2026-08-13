"use client";

import dynamic from "next/dynamic";

const DrinksApp = dynamic(
  () => import("@/components/DrinksApp").then((mod) => mod.DrinksApp),
  {
    ssr: false,
    loading: () => (
      <div className="page-shell">
        <p className="lede">Loading drinks…</p>
      </div>
    ),
  },
);

export default function DrinksPage() {
  return <DrinksApp />;
}
