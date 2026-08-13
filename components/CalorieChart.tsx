import { kcal } from "@/lib/format";
import type { TrendPoint } from "@/lib/trends";

export function CalorieChart({
  points,
  planCalories,
  mode,
}: {
  points: TrendPoint[];
  planCalories: number;
  mode: "days" | "weeks" | "months" | "years";
}) {
  const width = 640;
  const height = 240;
  const pad = { top: 18, right: 12, bottom: 28, left: 40 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxY = Math.max(planCalories, ...points.map((point) => point.calories), 100);
  const step = points.length > 1 ? innerW / (points.length - 1) : innerW;

  function x(index: number) {
    return pad.left + index * step;
  }
  function y(value: number) {
    return pad.top + innerH - (value / maxY) * innerH;
  }

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(point.calories)}`)
    .join(" ");
  const area = `${line} L ${x(points.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`;
  const planY = y(planCalories);
  const labelEvery = points.length > 10 ? 2 : 1;

  return (
    <div className="chart-wrap">
      <svg
        className="calorie-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Calorie ${mode} chart`}
      >
        <line
          x1={pad.left}
          x2={width - pad.right}
          y1={planY}
          y2={planY}
          className="chart-plan"
        />
        <path d={area} className="chart-area" />
        <path d={line} className="chart-line" />
        {points.map((point, index) => (
          <g key={point.key}>
            {mode === "days" ? (
              <rect
                x={x(index) - Math.min(14, step * 0.32)}
                y={y(point.calories)}
                width={Math.min(28, step * 0.64)}
                height={Math.max(0, y(0) - y(point.calories))}
                className="chart-bar"
              />
            ) : (
              <circle cx={x(index)} cy={y(point.calories)} r={4} className="chart-dot" />
            )}
            {index % labelEvery === 0 ? (
              <text x={x(index)} y={height - 8} className="chart-xlabel">
                {point.label}
              </text>
            ) : null}
          </g>
        ))}
        <text x={4} y={planY - 6} className="chart-ylabel">
          plan {kcal(planCalories)}
        </text>
        <text x={4} y={pad.top + 4} className="chart-ylabel">
          {kcal(maxY)}
        </text>
      </svg>
    </div>
  );
}
