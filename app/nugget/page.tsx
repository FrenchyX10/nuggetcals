"use client";

import dynamic from "next/dynamic";

const NuggetApp = dynamic(
  () => import("@/components/NuggetApp").then((mod) => mod.NuggetApp),
  {
    ssr: false,
    loading: () => (
      <div className="page-shell">
        <p className="lede">Finding your nugget…</p>
      </div>
    ),
  },
);

export default function NuggetPage() {
  return <NuggetApp />;
}
