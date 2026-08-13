"use client";

import dynamic from "next/dynamic";

const HomemadeApp = dynamic(
  () => import("@/components/HomemadeApp").then((mod) => mod.HomemadeApp),
  {
    ssr: false,
    loading: () => (
      <div className="page-shell">
        <p className="lede">Loading homemade…</p>
      </div>
    ),
  },
);

export default function HomemadePage() {
  return <HomemadeApp />;
}
