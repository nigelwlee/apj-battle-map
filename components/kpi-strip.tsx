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
    const filtered = accounts.filter((a) => {
      if (filters.vertical !== "all" && a.vertical !== filters.vertical) return false;
      if (filters.size !== "all" && a.size !== filters.size) return false;
      return true;
    });

    const lighthouses = filtered.filter((a) => a.isLighthouse);
    const wonOrActive = lighthouses.filter((a) => a.status === "won" || a.status === "active");
    const captureRate = lighthouses.length > 0 ? wonOrActive.length / lighthouses.length : 0;
    const captureRatePrev = 0.24;

    const qualifiedPipeline = filtered
      .filter((a) => a.status === "active" || a.status === "targeted")
      .reduce((sum, a) => sum + a.acvPotential, 0);
    const totalQuota = countries.reduce((sum, c) => sum + c.quotaUSD, 0);
    const pipelineCoverage = qualifiedPipeline / totalQuota;

    const wonQTD = filtered.filter((a) => a.status === "won" && a.targetClose >= "2026-04-01").length;

    const atRiskAccounts = filtered.filter((a) => a.status === "active" || a.status === "targeted");
    const championsInAtRisk = people.filter(
      (p) => p.crmStatus === "champion" && atRiskAccounts.some((a) => a.id === p.accountId)
    ).length;
    const championDensity = atRiskAccounts.length > 0 ? championsInAtRisk / atRiskAccounts.length : 0;

    const cutoff = "2026-03-11";
    const atRiskCount = atRiskAccounts.filter((a) => !a.lastTouchDate || a.lastTouchDate < cutoff).length;

    return {
      captureRate: Math.round(captureRate * 100),
      captureRateDelta: Math.round((captureRate - captureRatePrev) * 100 * 10) / 10,
      captureLabel: `${wonOrActive.length} / ${lighthouses.length} lighthouses`,
      pipelineCoverage: Math.round(pipelineCoverage * 10) / 10,
      wonQTD,
      championDensity: Math.round(championDensity * 10) / 10,
      atRiskCount,
    };
  }, [filters]);

  return (
    <div
      className="flex items-stretch shrink-0"
      style={{
        height: "var(--kpi-height)",
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {/* KPI cells */}
      <div className="flex items-stretch overflow-x-auto flex-1 min-w-0">
        <KpiCell
          label="Lighthouse Capture"
          value={`${metrics.captureRate}%`}
          delta={metrics.captureRateDelta}
          deltaUnit="%"
          subtext={metrics.captureLabel}
          positive={metrics.captureRateDelta > 0}
        />
        <KpiCell
          label="Pipeline Coverage"
          value={`${metrics.pipelineCoverage}×`}
          delta={-0.3}
          subtext="vs 3× target"
          positive={false}
        />
        <KpiCell
          label="Net-New Logos QTD"
          value={`${metrics.wonQTD}`}
          delta={1}
          subtext="$820K avg ACV"
          positive
        />
        <KpiCell
          label="Champion Density"
          value={`${metrics.championDensity}`}
          delta={-0.2}
          subtext={`${metrics.atRiskCount} at risk`}
          positive={false}
        />
      </div>

      {/* Filters */}
      <div
        className="flex items-center gap-2 px-4 shrink-0"
        style={{ borderLeft: "1px solid var(--color-border)" }}
      >
        {[
          {
            value: filters.vertical,
            onChange: (v: string) => onFiltersChange({ ...filters, vertical: v }),
            options: [
              { value: "all", label: "Vertical" },
              { value: "FSI", label: "FSI" },
              { value: "TechSaaS", label: "Tech / SaaS" },
              { value: "Telco", label: "Telco" },
              { value: "Resources", label: "Resources" },
              { value: "Manufacturing", label: "Manufacturing" },
              { value: "PublicSector", label: "Public Sector" },
              { value: "Healthcare", label: "Healthcare" },
            ],
          },
          {
            value: filters.size,
            onChange: (v: string) => onFiltersChange({ ...filters, size: v }),
            options: [
              { value: "all", label: "Size" },
              { value: "GlobalEnterprise", label: "Global Ent." },
              { value: "Enterprise", label: "Enterprise" },
              { value: "UpperMidMarket", label: "Upper MM" },
            ],
          },
          {
            value: filters.status,
            onChange: (v: string) => onFiltersChange({ ...filters, status: v }),
            options: [
              { value: "all", label: "Status" },
              { value: "won", label: "Won" },
              { value: "active", label: "Active" },
              { value: "targeted", label: "Targeted" },
              { value: "competitor", label: "Competitor" },
              { value: "untouched", label: "Untouched" },
            ],
          },
        ].map((sel, i) => (
          <select
            key={i}
            value={sel.value}
            onChange={(e) => sel.onChange(e.target.value)}
            className="select-native"
            style={{
              color: sel.value === "all" ? "var(--color-text-tertiary)" : "var(--color-text-primary)",
            }}
          >
            {sel.options.map((o) => (
              <option key={o.value} value={o.value} style={{ backgroundColor: "#141418" }}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
}

function KpiCell({
  label,
  value,
  delta,
  deltaUnit = "",
  subtext,
  positive,
}: {
  label: string;
  value: string;
  delta: number;
  deltaUnit?: string;
  subtext?: string;
  positive: boolean;
}) {
  const flat = delta === 0;
  const deltaColor = flat ? "var(--color-text-tertiary)" : positive ? "#22C55E" : "#EF4444";
  const deltaStr = flat ? "—" : `${positive ? "+" : ""}${delta}${deltaUnit}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 20px",
        borderRight: "1px solid var(--color-border)",
        minWidth: 148,
        gap: 1,
      }}
    >
      <span
        style={{
          fontSize: "0.625rem",
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--color-text-tertiary)",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 1 }}>
        <span
          className="kpi-value"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "1.3125rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            fontWeight: 500,
            color: deltaColor,
          }}
        >
          {deltaStr}
        </span>
      </div>
      {subtext && (
        <span style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", marginTop: 1 }}>
          {subtext}
        </span>
      )}
    </div>
  );
}
