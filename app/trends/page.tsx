"use client";

import dynamic from "next/dynamic";

const TrendsApp = dynamic(
  () => import("@/components/TrendsApp").then((mod) => mod.TrendsApp),
  {
    ssr: false,
    loading: () => (
      <div className="page-shell">
        <p className="lede">Loading trends…</p>
      </div>
    ),
  },
);

export default function TrendsPage() {
  return <TrendsApp />;
}
