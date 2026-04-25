"use client";

import { useState } from "react";
import NavBar from "@/components/nav-bar";
import PeopleGraph from "@/components/people-graph";
import { people } from "@/lib/data";
import type { Person } from "@/lib/types";

const COUNTRY_OPTIONS = [
  { value: "all", label: "All countries" },
  { value: "AU", label: "Australia" },
  { value: "SG", label: "Singapore" },
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" },
  { value: "IN", label: "India" },
  { value: "ID", label: "Indonesia" },
  { value: "NZ", label: "New Zealand" },
  { value: "MY", label: "Malaysia" },
  { value: "PH", label: "Philippines" },
  { value: "TH", label: "Thailand" },
];

const CRM_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "champion", label: "Champion" },
  { value: "meeting_held", label: "Meeting Held" },
  { value: "contacted", label: "Contacted" },
  { value: "cold", label: "Cold" },
  { value: "detractor", label: "Detractor" },
];

const CRM_COLORS: Record<string, string> = {
  champion: "#22C55E",
  meeting_held: "#3B82F6",
  contacted: "#F59E0B",
  cold: "#6B7280",
  detractor: "#EF4444",
};

export default function GraphPage() {
  const [country, setCountry] = useState("all");
  const [crm, setCrm] = useState("all");

  // Stats for status card
  const crmCounts = people.reduce<Record<string, number>>((acc, p) => {
    acc[p.crmStatus] = (acc[p.crmStatus] ?? 0) + 1;
    return acc;
  }, {});

  const recentEngagements = people
    .filter((p) => p.lastEngagement)
    .sort((a, b) => (b.lastEngagement ?? "").localeCompare(a.lastEngagement ?? ""))
    .slice(0, 5);

  const atRiskChampions = people.filter(
    (p) =>
      (p.crmStatus === "champion" || p.crmStatus === "meeting_held") &&
      (!p.lastEngagement || p.lastEngagement < "2026-03-11")
  );

  return (
    <div
      className="flex flex-col"
      style={{ height: "100dvh", backgroundColor: "#09090B", overflow: "hidden" }}
    >
      <NavBar activeTab="graph" />

      {/* Filter strip */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{
          height: 40,
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "rgba(24,24,27,0.95)",
          backdropFilter: "blur(4px)",
        }}
      >
        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            color: "var(--color-text-tertiary)",
            letterSpacing: "0.04em",
          }}
        >
          INTELLIGENCE BOARD
        </span>
        <div style={{ width: 1, height: 14, backgroundColor: "var(--color-border)" }} />

        {[
          { value: country, onChange: setCountry, options: COUNTRY_OPTIONS },
          { value: crm, onChange: setCrm, options: CRM_OPTIONS },
        ].map((sel, i) => (
          <select
            key={i}
            value={sel.value}
            onChange={(e) => sel.onChange(e.target.value)}
            style={{
              fontSize: "0.75rem",
              padding: "3px 24px 3px 8px",
              color:
                sel.value === "all"
                  ? "var(--color-text-secondary)"
                  : "var(--color-text-primary)",
              cursor: "pointer",
              background: "transparent",
              border: "1px solid var(--color-border)",
              borderRadius: 4,
              appearance: "none",
              WebkitAppearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 3.5L5 6.5L8 3.5' stroke='%2371717A' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 6px center",
            }}
          >
            {sel.options.map((o) => (
              <option key={o.value} value={o.value} style={{ backgroundColor: "#18181B" }}>
                {o.label}
              </option>
            ))}
          </select>
        ))}

        {/* Stats summary — right side */}
        <div className="flex items-center gap-3 ml-auto">
          {Object.entries(CRM_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="rounded-full" style={{ width: 6, height: 6, backgroundColor: color }} />
              <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}>
                {crmCounts[status] ?? 0}
              </span>
              <span style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}>
                {status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main graph area */}
      <main className="flex-1 relative overflow-hidden flex">
        <div className="flex-1 relative">
          <PeopleGraph filterCountry={country} filterCrm={crm} />
        </div>

        {/* Intelligence status card — pinned right side */}
        <IntelligenceCard
          recentEngagements={recentEngagements}
          atRiskChampions={atRiskChampions}
          crmCounts={crmCounts}
        />
      </main>
    </div>
  );
}

function IntelligenceCard({
  recentEngagements,
  atRiskChampions,
  crmCounts,
}: {
  recentEngagements: Person[];
  atRiskChampions: Person[];
  crmCounts: Record<string, number>;
}) {
  const totalEngaged = (crmCounts.champion ?? 0) + (crmCounts.meeting_held ?? 0);
  const totalCold = (crmCounts.cold ?? 0) + (crmCounts.detractor ?? 0);

  return (
    <div
      className="flex flex-col shrink-0 overflow-y-auto"
      style={{
        width: 260,
        backgroundColor: "rgba(24,24,27,0.9)",
        borderLeft: "1px solid var(--color-border)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <p
          style={{
            fontSize: "0.5625rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-ember)",
          }}
        >
          Network Status
        </p>
        <p style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", marginTop: 2 }}>
          {Object.values(crmCounts).reduce((a, b) => a + b, 0)} contacts mapped
        </p>
      </div>

      {/* CRM breakdown */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="space-y-2">
          {Object.entries(CRM_COLORS).map(([status, color]) => {
            const count = crmCounts[status] ?? 0;
            const total = Object.values(crmCounts).reduce((a, b) => a + b, 0);
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="rounded-full" style={{ width: 6, height: 6, backgroundColor: color }} />
                    <span style={{ fontSize: "0.5625rem", color: "var(--color-text-secondary)" }}>
                      {status.replace("_", " ")}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-geist-mono)",
                      fontSize: "0.625rem",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {count}
                  </span>
                </div>
                <div style={{ height: 3, backgroundColor: "#27272A", borderRadius: 2 }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      backgroundColor: color,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="flex items-center justify-between mt-3 pt-2"
          style={{ borderTop: "1px solid var(--color-border-subtle)" }}
        >
          <span style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}>Engaged</span>
          <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.75rem", color: "#22C55E", fontWeight: 600 }}>
            {totalEngaged}
          </span>
          <span style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}>Cold / at-risk</span>
          <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.75rem", color: "#EF4444", fontWeight: 600 }}>
            {totalCold}
          </span>
        </div>
      </div>

      {/* Recent activity */}
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <p
          style={{
            fontSize: "0.5625rem",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-text-tertiary)",
            marginBottom: 8,
          }}
        >
          Last Touched
        </p>
        <div className="space-y-2">
          {recentEngagements.map((p) => {
            const color = CRM_COLORS[p.crmStatus] ?? "#6B7280";
            return (
              <div key={p.id} className="flex items-start gap-2">
                <div
                  className="rounded-full shrink-0 mt-0.5"
                  style={{ width: 6, height: 6, backgroundColor: color, marginTop: 4 }}
                />
                <div className="min-w-0">
                  <p style={{ fontSize: "0.6875rem", color: "var(--color-text-primary)", fontWeight: 500, lineHeight: 1.3 }}>
                    {p.name.split(" ")[0]} {p.name.split(" ").slice(-1)[0]}
                  </p>
                  <p style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)", lineHeight: 1.4 }}>
                    {p.title.split(",")[0].slice(0, 28)}
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "0.5rem",
                    color: "var(--color-text-tertiary)",
                    whiteSpace: "nowrap",
                    marginLeft: "auto",
                    marginTop: 2,
                  }}
                >
                  {p.lastEngagement?.slice(5) ?? "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* At-risk champions */}
      {atRiskChampions.length > 0 && (
        <div className="px-4 py-3">
          <p
            style={{
              fontSize: "0.5625rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#EF4444",
              marginBottom: 8,
            }}
          >
            At Risk — No Touch 45d+
          </p>
          <div className="space-y-2">
            {atRiskChampions.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <div className="rounded-full" style={{ width: 6, height: 6, backgroundColor: "#EF4444" }} />
                <div className="min-w-0 flex-1">
                  <p style={{ fontSize: "0.625rem", color: "var(--color-text-primary)", fontWeight: 500 }}>
                    {p.name.split(" ")[0]}
                  </p>
                  <p style={{ fontSize: "0.5rem", color: "var(--color-text-tertiary)" }}>{p.crmStatus.replace("_", " ")}</p>
                </div>
                <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.5rem", color: "#EF4444" }}>
                  {p.lastEngagement ?? "Never"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto px-4 py-3" style={{ borderTop: "1px solid var(--color-border)" }}>
        <p style={{ fontSize: "0.5rem", color: "var(--color-text-tertiary)", lineHeight: 1.5 }}>
          Illustrative data — with live CRM this updates nightly
        </p>
      </div>
    </div>
  );
}
