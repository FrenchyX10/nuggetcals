"use client";

import dynamic from "next/dynamic";

const SnacksApp = dynamic(
  () => import("@/components/SnacksApp").then((mod) => mod.SnacksApp),
  {
    ssr: false,
    loading: () => (
      <div className="page-shell">
        <p className="lede">Loading chips and snacks…</p>
      </div>
    ),
  },
);

export default function SnacksPage() {
  return <SnacksApp />;
}
