"use client";

import { useState } from "react";
import NavBar from "@/components/nav-bar";
import PeopleGraph from "@/components/people-graph";
import { people } from "@/lib/data";
import type { Person } from "@/lib/types";

const COUNTRY_OPTIONS = [
  { value: "all",  label: "All countries" },
  { value: "AU",   label: "Australia" },
  { value: "SG",   label: "Singapore" },
  { value: "JP",   label: "Japan" },
  { value: "KR",   label: "South Korea" },
  { value: "IN",   label: "India" },
  { value: "ID",   label: "Indonesia" },
  { value: "NZ",   label: "New Zealand" },
  { value: "MY",   label: "Malaysia" },
  { value: "PH",   label: "Philippines" },
  { value: "TH",   label: "Thailand" },
  { value: "VN",   label: "Vietnam" },
  { value: "TW",   label: "Taiwan" },
  { value: "HK",   label: "Hong Kong" },
];

const CRM_OPTIONS = [
  { value: "all",          label: "All statuses" },
  { value: "champion",     label: "Champion" },
  { value: "meeting_held", label: "Meeting Held" },
  { value: "contacted",    label: "Contacted" },
  { value: "cold",         label: "Cold" },
  { value: "detractor",    label: "Detractor" },
];

const CRM_COLORS: Record<string, string> = {
  champion:    "#22C55E",
  meeting_held:"#3B82F6",
  contacted:   "#F59E0B",
  cold:        "#6B7280",
  detractor:   "#EF4444",
};

export default function GraphPage() {
  const [country, setCountry] = useState("all");
  const [crm, setCrm] = useState("all");

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
      style={{ height: "100dvh", backgroundColor: "var(--color-void)", overflow: "hidden" }}
    >
      <NavBar activeTab="graph" />

      {/* Filter bar */}
      <div
        className="flex items-center gap-3 shrink-0"
        style={{
          height: 44,
          padding: "0 16px",
          backgroundColor: "rgba(14,14,18,0.92)",
          borderBottom: "1px solid var(--color-border)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span
          style={{
            fontSize: "0.625rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            color: "var(--color-text-tertiary)",
            textTransform: "uppercase",
          }}
        >
          People Graph
        </span>
        <div style={{ width: 1, height: 14, backgroundColor: "var(--color-border)" }} />

        {[
          { value: country, onChange: setCountry, options: COUNTRY_OPTIONS },
          { value: crm,     onChange: setCrm,     options: CRM_OPTIONS },
        ].map((sel, i) => (
          <select
            key={i}
            value={sel.value}
            onChange={(e) => sel.onChange(e.target.value)}
            className="select-native"
            style={{ color: sel.value === "all" ? "var(--color-text-tertiary)" : "var(--color-text-primary)" }}
          >
            {sel.options.map((o) => (
              <option key={o.value} value={o.value} style={{ backgroundColor: "#141418" }}>
                {o.label}
              </option>
            ))}
          </select>
        ))}

        {/* CRM count pills — right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
          {Object.entries(CRM_COLORS).map(([status, color]) => (
            <div key={status} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6875rem",
                  color: "var(--color-text-primary)",
                  fontWeight: 600,
                }}
              >
                {crmCounts[status] ?? 0}
              </span>
              <span style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}>
                {status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main area */}
      <main className="flex-1 relative overflow-hidden flex">
        <div className="flex-1 relative">
          <PeopleGraph filterCountry={country} filterCrm={crm} />
        </div>

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
  const total = Object.values(crmCounts).reduce((a, b) => a + b, 0);

  return (
    <div
      className="flex flex-col shrink-0 overflow-y-auto"
      style={{
        width: 252,
        backgroundColor: "rgba(14,14,18,0.95)",
        borderLeft: "1px solid var(--color-border)",
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)" }}>
        <p
          style={{
            fontSize: "0.625rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-ember)",
          }}
        >
          Network Status
        </p>
        <p style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", marginTop: 3 }}>
          {total} contacts mapped
        </p>
      </div>

      {/* CRM breakdown */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.entries(CRM_COLORS).map(([status, color]) => {
            const count = crmCounts[status] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={status}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
                    <span style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>
                      {status.replace("_", " ")}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {count}
                  </span>
                </div>
                <div className="progress-track" style={{ height: 3 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 12,
            paddingTop: 10,
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <div>
            <p style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)", marginBottom: 2 }}>Engaged</p>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#22C55E",
              }}
            >
              {totalEngaged}
            </span>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)", marginBottom: 2 }}>Cold / At-risk</p>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#EF4444",
              }}
            >
              {totalCold}
            </span>
          </div>
        </div>
      </div>

      {/* Recent touches */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
        <p className="text-label" style={{ marginBottom: 10 }}>Last Touched</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recentEngagements.map((p) => {
            const color = CRM_COLORS[p.crmStatus] ?? "#6B7280";
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: color,
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-primary)", fontWeight: 500, lineHeight: 1.3 }}>
                    {p.name.split(" ")[0]} {p.name.split(" ").slice(-1)[0]}
                  </p>
                  <p style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", lineHeight: 1.4, marginTop: 1 }}>
                    {p.title.split(",")[0].slice(0, 28)}
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.5625rem",
                    color: "var(--color-text-tertiary)",
                    whiteSpace: "nowrap",
                    marginTop: 2,
                    flexShrink: 0,
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
        <div style={{ padding: "12px 16px" }}>
          <p
            className="text-label"
            style={{ marginBottom: 10, color: "#EF4444" }}
          >
            At Risk — 45d+ No Touch
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {atRiskChampions.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#EF4444", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.6875rem", color: "var(--color-text-primary)", fontWeight: 500 }}>
                    {p.name.split(" ")[0]}
                  </p>
                  <p style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}>
                    {p.crmStatus.replace("_", " ")}
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.5625rem",
                    color: "#EF4444",
                    flexShrink: 0,
                  }}
                >
                  {p.lastEngagement ?? "Never"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: "auto", padding: "10px 16px", borderTop: "1px solid var(--color-border)" }}>
        <p style={{ fontSize: "0.5625rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
          Illustrative data — with live CRM this updates nightly
        </p>
      </div>
    </div>
  );
}
