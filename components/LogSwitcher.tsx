"use client";

import { LOG_COPY, LOG_MODES, type LogMode } from "@/lib/log-mode";

export function LogSwitcher({
  mode,
  onMode,
}: {
  mode: LogMode;
  onMode: (mode: LogMode) => void;
}) {
  return (
    <div className="log-switch-wrap">
      <div className="log-switch" role="tablist" aria-label="How to log">
        {LOG_MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={mode === item.id}
            className={mode === item.id ? "is-on" : undefined}
            onClick={() => onMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="log-lede">{LOG_COPY[mode]}</p>
    </div>
  );
}
