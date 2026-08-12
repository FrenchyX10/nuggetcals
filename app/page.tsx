"use client";

import dynamic from "next/dynamic";

const BitewiseApp = dynamic(
  () => import("@/components/BitewiseApp").then((mod) => mod.BitewiseApp),
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
  return <BitewiseApp />;
}
