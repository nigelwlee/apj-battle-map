"use client";

import { useMemo } from "react";
import { countries, accounts, people } from "@/lib/data";

interface FilterState {
  vertical: string;
  size: string;
  status: string;
}

interface KpiStripProps {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
}

export default function KpiStrip({ filters, onFiltersChange }: KpiStripProps) {
  const metrics = useMemo(() => {
    const filteredAccounts = accounts.filter((a) => {
      if (filters.vertical !== "all" && a.vertical !== filters.vertical) return false;
      if (filters.size !== "all" && a.size !== filters.size) return false;
      return true;
    });

    const lighthouses = filteredAccounts.filter((a) => a.isLighthouse);
    const wonOrActive = lighthouses.filter((a) => a.status === "won" || a.status === "active");
    const captureRate = lighthouses.length > 0 ? wonOrActive.length / lighthouses.length : 0;
    const captureRatePrev = 0.24; // baseline (from seed data prev values)

    // Pipeline coverage: Stage 2+ (active/targeted) qualified ACV vs total quota
    const qualifiedPipeline = filteredAccounts
      .filter((a) => a.status === "active" || a.status === "targeted")
      .reduce((sum, a) => sum + a.acvPotential, 0);
    const totalQuota = countries.reduce((sum, c) => sum + c.quotaUSD, 0);
    const pipelineCoverage = qualifiedPipeline / totalQuota;

    // Net-new logos QTD (won this quarter = targetClose in Q2 2026)
    const wonQTD = filteredAccounts.filter(
      (a) => a.status === "won" && a.targetClose >= "2026-04-01"
    ).length;

    // Champion density: people with champion status per active/targeted account
    const atRiskAccounts = filteredAccounts.filter(
      (a) => a.status === "active" || a.status === "targeted"
    );
    const championsInAtRisk = people.filter(
      (p) =>
        p.crmStatus === "champion" &&
        atRiskAccounts.some((a) => a.id === p.accountId)
    ).length;
    const championDensity =
      atRiskAccounts.length > 0 ? championsInAtRisk / atRiskAccounts.length : 0;

    // At-risk: active/targeted with no touch in 45 days
    const cutoff = new Date("2026-03-11").toISOString().slice(0, 10);
    const atRiskCount = atRiskAccounts.filter(
      (a) => !a.lastTouchDate || a.lastTouchDate < cutoff
    ).length;

    return {
      captureRate: Math.round(captureRate * 100),
      captureRateDelta: Math.round((captureRate - captureRatePrev) * 100 * 10) / 10,
      captureLabel: `${wonOrActive.length} / ${lighthouses.length} lighthouses`,
      pipelineCoverage: Math.round(pipelineCoverage * 10) / 10,
      pipelineDelta: -0.3,
      wonQTD,
      wonQTDDelta: 1,
      championDensity: Math.round(championDensity * 10) / 10,
      championDelta: -0.2,
      atRiskCount,
    };
  }, [filters]);

  return (
    <div
      className="flex items-stretch border-b overflow-x-auto shrink-0"
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottomColor: "var(--color-border)",
        height: "var(--kpi-height)",
        minHeight: "var(--kpi-height)",
      }}
    >
      <KpiCell
        label="Lighthouse Capture"
        value={`${metrics.captureRate}`}
        unit="%"
        delta={metrics.captureRateDelta}
        deltaUnit="%"
        subtext={metrics.captureLabel}
      />
      <KpiCell
        label="Pipeline Coverage"
        value={`${metrics.pipelineCoverage}`}
        unit="×"
        delta={metrics.pipelineDelta}
        subtext="vs 3× quota target"
      />
      <KpiCell
        label="Net-New Logos QTD"
        value={`${metrics.wonQTD}`}
        delta={metrics.wonQTDDelta}
        subtext="$820K avg ACV"
      />
      <KpiCell
        label="Champion Density"
        value={`${metrics.championDensity}`}
        unit=" / deal"
        delta={metrics.championDelta}
        subtext={`${metrics.atRiskCount} active deals at risk`}
      />

      {/* Filter bar inline */}
      <div className="flex items-center gap-2 px-4 ml-auto shrink-0">
        <FilterSelect
          value={filters.vertical}
          onChange={(v) => onFiltersChange({ ...filters, vertical: v })}
          options={[
            { value: "all", label: "All verticals" },
            { value: "FSI", label: "FSI" },
            { value: "TechSaaS", label: "Tech / SaaS" },
            { value: "Telco", label: "Telco" },
            { value: "Resources", label: "Resources" },
            { value: "Manufacturing", label: "Manufacturing" },
            { value: "PublicSector", label: "Public Sector" },
            { value: "Healthcare", label: "Healthcare" },
          ]}
        />
        <FilterSelect
          value={filters.size}
          onChange={(v) => onFiltersChange({ ...filters, size: v })}
          options={[
            { value: "all", label: "All sizes" },
            { value: "GlobalEnterprise", label: "Global Enterprise" },
            { value: "Enterprise", label: "Enterprise" },
            { value: "UpperMidMarket", label: "Upper Mid-Market" },
          ]}
        />
        <FilterSelect
          value={filters.status}
          onChange={(v) => onFiltersChange({ ...filters, status: v })}
          options={[
            { value: "all", label: "All statuses" },
            { value: "won", label: "Won" },
            { value: "active", label: "Active Deal" },
            { value: "targeted", label: "Targeted" },
            { value: "competitor", label: "Competitor" },
            { value: "untouched", label: "Untouched" },
          ]}
        />
      </div>
    </div>
  );
}

function KpiCell({
  label,
  value,
  unit,
  delta,
  deltaUnit,
  subtext,
}: {
  label: string;
  value: string;
  unit?: string;
  delta: number;
  deltaUnit?: string;
  subtext?: string;
}) {
  const positive = delta > 0;
  const flat = delta === 0;

  return (
    <div
      className="flex flex-col justify-center px-5 shrink-0"
      style={{
        borderRight: "1px solid rgba(63,63,70,0.4)",
        minWidth: 160,
      }}
    >
      <span className="text-subheading" style={{ fontSize: "0.6875rem" }}>
        {label}
      </span>
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span
          className="kpi-value"
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "1.375rem",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {value}
          {unit && (
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              {unit}
            </span>
          )}
        </span>
        <span
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "0.6875rem",
            color: flat
              ? "var(--color-text-tertiary)"
              : positive
              ? "#22C55E"
              : "#EF4444",
          }}
        >
          {flat ? "–" : positive ? `+${delta}` : delta}
          {deltaUnit ?? ""}
        </span>
      </div>
      {subtext && (
        <span
          className="mt-0.5"
          style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}
        >
          {subtext}
        </span>
      )}
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="btn btn-ghost"
      style={{
        fontSize: "0.75rem",
        padding: "0.25rem 0.625rem",
        color: value === "all" ? "var(--color-text-secondary)" : "var(--color-text-primary)",
        cursor: "pointer",
        background: "transparent",
        border: "1px solid var(--color-border)",
        borderRadius: "4px",
        appearance: "none",
        WebkitAppearance: "none",
        paddingRight: "1.5rem",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 3.5L5 6.5L8 3.5' stroke='%2371717A' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 6px center",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} style={{ backgroundColor: "#18181B" }}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
