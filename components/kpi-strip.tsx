"use client";

interface KpiMetric {
  label: string;
  value: string;
  delta: number | null; // positive = up, negative = down, null = no data
  unit?: string;
  subtext?: string;
}

const METRICS: KpiMetric[] = [
  {
    label: "Lighthouse Capture",
    value: "26",
    unit: "%",
    delta: 2.1,
    subtext: "31 / 120 accounts",
  },
  {
    label: "Pipeline Coverage",
    value: "2.4",
    unit: "×",
    delta: -0.3,
    subtext: "vs 3× target",
  },
  {
    label: "Net-New Logos QTD",
    value: "4",
    delta: 1,
    subtext: "$820K avg ACV",
  },
  {
    label: "Champion Density",
    value: "38",
    unit: "%",
    delta: -5,
    subtext: "3 active deals at risk",
  },
];

export default function KpiStrip() {
  return (
    <div
      className="flex items-stretch border-b overflow-x-auto"
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottomColor: "var(--color-border)",
        height: "var(--kpi-height)",
        minHeight: "var(--kpi-height)",
      }}
    >
      {METRICS.map((metric, i) => (
        <KpiCell key={metric.label} metric={metric} isLast={i === METRICS.length - 1} />
      ))}

      {/* Filter bar inline */}
      <div className="flex items-center gap-2 px-4 ml-auto shrink-0">
        <FilterChip label="All verticals" />
        <FilterChip label="All sizes" />
        <FilterChip label="All statuses" />
      </div>
    </div>
  );
}

function KpiCell({ metric, isLast }: { metric: KpiMetric; isLast: boolean }) {
  const deltaPositive = metric.delta !== null && metric.delta > 0;
  const deltaFlat = metric.delta === null || metric.delta === 0;

  return (
    <div
      className="flex flex-col justify-center px-5 shrink-0"
      style={{
        borderRight: isLast ? "none" : "1px solid rgba(63,63,70,0.4)",
        minWidth: "160px",
      }}
    >
      <span className="text-subheading" style={{ fontSize: "0.6875rem" }}>
        {metric.label}
      </span>
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span
          className="text-mono font-semibold leading-none kpi-value"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.375rem",
            color: "var(--color-text-primary)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {metric.value}
          {metric.unit && (
            <span
              style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}
            >
              {metric.unit}
            </span>
          )}
        </span>
        {metric.delta !== null && (
          <span
            className="text-mono"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              color: deltaFlat
                ? "var(--color-text-tertiary)"
                : deltaPositive
                ? "#22C55E"
                : "#EF4444",
            }}
          >
            {deltaFlat ? "–" : deltaPositive ? `+${metric.delta}` : metric.delta}
            {metric.unit && !deltaFlat ? metric.unit : ""}
          </span>
        )}
      </div>
      {metric.subtext && (
        <span
          className="mt-0.5"
          style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}
        >
          {metric.subtext}
        </span>
      )}
    </div>
  );
}

function FilterChip({ label }: { label: string }) {
  return (
    <button
      className="btn btn-ghost flex items-center gap-1"
      style={{
        fontSize: "0.75rem",
        padding: "0.25rem 0.625rem",
        color: "var(--color-text-secondary)",
      }}
    >
      {label}
      <svg
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        style={{ opacity: 0.5 }}
      >
        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}
