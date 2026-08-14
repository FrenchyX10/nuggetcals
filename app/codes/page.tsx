"use client";

import dynamic from "next/dynamic";

const CodesApp = dynamic(
  () => import("@/components/CodesApp").then((mod) => mod.CodesApp),
  {
    ssr: false,
    loading: () => (
      <div className="page-shell">
        <p className="lede">Loading codes…</p>
      </div>
    ),
  },
);

export default function CodesPage() {
  return <CodesApp />;
}
