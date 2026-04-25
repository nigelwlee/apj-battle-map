"use client";

import { useState } from "react";
import NavBar from "@/components/nav-bar";
import PeopleGraph from "@/components/people-graph";

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

export default function GraphPage() {
  const [country, setCountry] = useState("all");
  const [crm, setCrm] = useState("all");

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: "#09090B", overflow: "hidden" }}>
      <NavBar activeTab="graph" />
      {/* Filter bar */}
      <div
        className="flex items-center gap-3 px-4 shrink-0"
        style={{
          height: 44,
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
          People & Influence Graph
        </span>
        <div style={{ width: 1, height: 16, backgroundColor: "var(--color-border)" }} />
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
              color: sel.value === "all" ? "var(--color-text-secondary)" : "var(--color-text-primary)",
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
        <span
          style={{
            marginLeft: "auto",
            fontSize: "0.5625rem",
            color: "var(--color-text-tertiary)",
            border: "1px solid var(--color-border)",
            padding: "2px 8px",
            borderRadius: 4,
          }}
        >
          Click a node to see warm-intro paths
        </span>
      </div>
      <main className="flex-1 relative overflow-hidden">
        <PeopleGraph filterCountry={country} filterCrm={crm} />
      </main>
    </div>
  );
}
