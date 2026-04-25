"use client";

import { useMemo } from "react";
import NavBar from "@/components/nav-bar";
import { countries, accounts, people } from "@/lib/data";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, ArrowRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import type { Country, Account } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  won: "#E8681A",
  active: "#F59E0B",
  targeted: "#D97706",
  competitor: "#6B7280",
  untouched: "#3F3F46",
};

export default function ExecPage() {
  const cutoff = "2026-03-11";
  const today = "2026-04-25";

  const atRiskAccounts = useMemo(() =>
    accounts
      .filter(
        (a) =>
          (a.status === "active" || a.status === "targeted") &&
          (!a.lastTouchDate || a.lastTouchDate < cutoff)
      )
      .sort((a, b) => b.acvPotential - a.acvPotential)
      .slice(0, 10),
    [cutoff]
  );

  const coverageData = useMemo(() =>
    countries.map((c) => {
      const countryAccounts = accounts.filter((a) => a.countryCode === c.code);
      const pipeline = countryAccounts
        .filter((a) => a.status === "active" || a.status === "targeted")
        .reduce((sum, a) => sum + a.acvPotential, 0);
      const coverage = c.quotaUSD > 0 ? pipeline / c.quotaUSD : 0;
      return {
        code: c.code,
        name: c.name.slice(0, 10),
        coverage: Math.round(coverage * 10) / 10,
        quota: Math.round(c.quotaUSD / 1e6 * 10) / 10,
        pipeline: Math.round(pipeline / 1e6 * 10) / 10,
        status: c.status,
        reps: c.repCapacity,
      };
    }),
    []
  );

  // Territory design: TAM / rep
  const territoryData = useMemo(() =>
    countries.map((c) => ({
      code: c.code,
      tamPerRep: Math.round(c.tamUSD / 1e6 / Math.max(c.repCapacity, 1)),
      repCapacity: c.repCapacity,
      captureGap: Math.round((1 - c.captureRate) * c.lighthouseCount),
      aiReadiness: c.aiReadinessIndex,
    })),
    []
  );

  // Sparkline country data
  const captureData = useMemo(() =>
    countries
      .map((c) => ({
        ...c,
        delta: Math.round((c.captureRate - c.captureRatePrev) * 100 * 10) / 10,
        pct: Math.round(c.captureRate * 100),
        prevPct: Math.round(c.captureRatePrev * 100),
      }))
      .sort((a, b) => b.captureRate - a.captureRate),
    []
  );

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: "#09090B", overflow: "hidden" }}>
      <NavBar activeTab="exec" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Disclaimer */}
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            APJ Leadership View — {today}
          </h1>
          <span
            style={{
              fontSize: "0.5625rem",
              color: "var(--color-text-tertiary)",
              border: "1px solid var(--color-border)",
              padding: "2px 8px",
              borderRadius: 4,
            }}
          >
            Illustrative data — architecture is what&apos;s real
          </span>
        </div>

        {/* Capture rate by country */}
        <Panel title="Lighthouse Capture by Country" subtitle="WoW delta — 8-week trend">
          <div className="space-y-1">
            {captureData.map((c) => (
              <CaptureRow key={c.code} country={c} />
            ))}
          </div>
        </Panel>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coverage vs quota */}
          <Panel title="Pipeline Coverage vs Quota" subtitle="Stage 2+ qualified ACV ÷ quota">
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coverageData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <XAxis
                    dataKey="code"
                    tick={{ fontSize: 9, fill: "#71717A", fontFamily: "var(--font-geist-mono)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#71717A", fontFamily: "var(--font-geist-mono)" }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 5]}
                    tickFormatter={(v) => `${v}×`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null;
                      const d = payload[0].payload as typeof coverageData[0];
                      return (
                        <div
                          style={{
                            backgroundColor: "#18181B",
                            border: "1px solid #3F3F46",
                            borderRadius: 4,
                            padding: "6px 10px",
                            fontSize: 11,
                          }}
                        >
                          <p style={{ color: "#E4E4E7", fontWeight: 600 }}>{d.name}</p>
                          <p style={{ color: "#A1A1AA" }}>Coverage: <span style={{ color: "#F59E0B", fontFamily: "var(--font-geist-mono)" }}>{d.coverage}×</span></p>
                          <p style={{ color: "#A1A1AA" }}>Pipeline: <span style={{ color: "#E4E4E7", fontFamily: "var(--font-geist-mono)" }}>${d.pipeline}M</span></p>
                          <p style={{ color: "#A1A1AA" }}>Quota: <span style={{ color: "#E4E4E7", fontFamily: "var(--font-geist-mono)" }}>${d.quota}M</span></p>
                          <p style={{ color: "#A1A1AA" }}>Reps: <span style={{ color: "#E4E4E7", fontFamily: "var(--font-geist-mono)" }}>{d.reps}</span></p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="coverage" radius={[2, 2, 0, 0]}>
                    {coverageData.map((d) => (
                      <Cell
                        key={d.code}
                        fill={d.coverage >= 3 ? "#22C55E" : d.coverage >= 2 ? "#F59E0B" : "#EF4444"}
                      />
                    ))}
                  </Bar>
                  {/* 3× target line via reference — just annotate */}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)", marginTop: 4 }}>
              Target: 3× · Green ≥3× · Amber 2–3× · Red &lt;2×
            </p>
          </Panel>

          {/* Territory design */}
          <Panel title="Territory Design" subtitle="TAM/rep ratio · rep capacity · capture gap">
            <div className="space-y-1">
              {territoryData
                .sort((a, b) => b.tamPerRep - a.tamPerRep)
                .map((t) => (
                  <TerritoryRow key={t.code} data={t} />
                ))}
            </div>
            <p style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)", marginTop: 8 }}>
              Note: IN, JP and ID are underweight given TAM/rep ratios — recommend rep plan review.
            </p>
          </Panel>
        </div>

        {/* At-risk accounts */}
        <Panel
          title="Top At-Risk Accounts"
          subtitle="Active/targeted · no touch in >45 days"
        >
          <div className="data-table w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                  {["Account", "Country", "Status", "AE", "Last Touch", "ACV", "Risk Signal"].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: "0.5625rem",
                        color: "var(--color-text-tertiary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        padding: "4px 8px",
                        textAlign: "left",
                        fontWeight: 500,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {atRiskAccounts.map((a) => (
                  <AtRiskRow key={a.id} account={a} />
                ))}
                {atRiskAccounts.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-text-tertiary)",
                        padding: "12px 8px",
                        textAlign: "center",
                      }}
                    >
                      No at-risk accounts — all active/targeted accounts touched in last 45 days
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Forecast widget */}
        <Panel title="Quarterly Forecast" subtitle="Commit / Best Case / Pipeline Model">
          <ForecastWidget />
        </Panel>

        {/* Claude narratives — pre-baked */}
        <Panel title="Claude AI Narratives" subtitle="Auto-generated territory intelligence">
          <div className="space-y-3">
            {CLAUDE_NARRATIVES.map((n) => (
              <NarrativeCard key={n.code} {...n} />
            ))}
          </div>
          <p
            style={{
              fontSize: "0.5625rem",
              color: "var(--color-text-tertiary)",
              marginTop: 12,
              borderTop: "1px solid var(--color-border-subtle)",
              paddingTop: 8,
            }}
          >
            Narratives generated by Claude claude-sonnet-4-6 · Illustrative data · With live CRM this regenerates nightly
          </p>
        </Panel>

      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-5"
      style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function CaptureRow({ country }: { country: Country & { delta: number; pct: number; prevPct: number } }) {
  const color = STATUS_COLORS[country.status] ?? "#3F3F46";
  const positive = country.delta > 0;
  const flat = country.delta === 0;

  return (
    <div className="flex items-center gap-4 py-1.5" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
      <span
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: "0.75rem",
          color: "var(--color-text-primary)",
          minWidth: 28,
        }}
      >
        {country.code}
      </span>
      <span style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", minWidth: 100 }}>
        {country.name}
      </span>
      {/* Progress bar */}
      <div className="flex-1 progress-track" style={{ height: 4 }}>
        <div
          className="progress-fill"
          style={{ width: `${country.pct}%`, backgroundColor: color, transition: "width 0.5s ease" }}
        />
      </div>
      <span
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: "0.75rem",
          color: "var(--color-text-primary)",
          minWidth: 36,
          textAlign: "right",
        }}
      >
        {country.pct}%
      </span>
      <span
        className="flex items-center gap-0.5"
        style={{
          fontFamily: "var(--font-geist-mono)",
          fontSize: "0.625rem",
          color: flat ? "#71717A" : positive ? "#22C55E" : "#EF4444",
          minWidth: 48,
        }}
      >
        {flat ? <Minus size={10} /> : positive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {flat ? "–" : `${positive ? "+" : ""}${country.delta}%`}
      </span>
      {/* Mini sparkline */}
      <div style={{ width: 80, height: 24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={country.weeklyCapture.map((v, i) => ({ w: i, v: Math.round(v * 100) }))}>
            <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <span style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)", minWidth: 100 }}>
        {country.notes.slice(0, 50)}…
      </span>
    </div>
  );
}

function TerritoryRow({ data }: { data: { code: string; tamPerRep: number; repCapacity: number; captureGap: number; aiReadiness: number } }) {
  const repColor = data.repCapacity >= 3 ? "#22C55E" : data.repCapacity >= 2 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex items-center gap-4 py-1" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
      <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.75rem", color: "var(--color-text-primary)", minWidth: 28 }}>{data.code}</span>
      <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.6875rem", color: "var(--color-text-secondary)", minWidth: 70 }}>${data.tamPerRep}M/rep</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-sm"
            style={{
              width: 8,
              height: 8,
              backgroundColor: i < data.repCapacity ? repColor : "#27272A",
            }}
          />
        ))}
        <span style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)", marginLeft: 4 }}>{data.repCapacity} rep{data.repCapacity !== 1 ? "s" : ""}</span>
      </div>
      <span style={{ fontSize: "0.625rem", color: "#EF4444", marginLeft: "auto" }}>
        {data.captureGap} open
      </span>
      <span style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}>AI ready {data.aiReadiness}/5</span>
    </div>
  );
}

function AtRiskRow({ account }: { account: Account }) {
  const daysSince = account.lastTouchDate
    ? Math.floor((new Date("2026-04-25").getTime() - new Date(account.lastTouchDate).getTime()) / 86400000)
    : 999;
  const color = STATUS_COLORS[account.status];

  return (
    <tr style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
      <td style={{ padding: "6px 8px", fontSize: "0.75rem", color: "var(--color-text-primary)", fontWeight: 500 }}>
        {account.name}
      </td>
      <td style={{ padding: "6px 8px", fontSize: "0.6875rem", color: "var(--color-text-secondary)", fontFamily: "var(--font-geist-mono)" }}>
        {account.countryCode}
      </td>
      <td style={{ padding: "6px 8px" }}>
        <span className="pill" style={{ backgroundColor: `${color}18`, color, fontSize: "0.5rem", padding: "1px 4px" }}>
          {account.status}
        </span>
      </td>
      <td style={{ padding: "6px 8px", fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
        {account.aeOwner}
      </td>
      <td style={{ padding: "6px 8px", fontFamily: "var(--font-geist-mono)", fontSize: "0.6875rem", color: daysSince > 45 ? "#EF4444" : "var(--color-text-secondary)" }}>
        {account.lastTouchDate ?? "Never"} ({daysSince}d)
      </td>
      <td style={{ padding: "6px 8px", fontFamily: "var(--font-geist-mono)", fontSize: "0.75rem", color: "var(--color-text-primary)", textAlign: "right" }}>
        ${(account.acvPotential / 1e6).toFixed(1)}M
      </td>
      <td style={{ padding: "6px 8px" }}>
        <div className="flex items-center gap-1">
          <AlertTriangle size={10} style={{ color: "#EF4444", flexShrink: 0 }} />
          <span style={{ fontSize: "0.5625rem", color: "#EF4444" }}>
            {daysSince}d no touch
          </span>
        </div>
      </td>
    </tr>
  );
}

function ForecastWidget() {
  const totalQuota = countries.reduce((s, c) => s + c.quotaUSD, 0);
  const commit = accounts.filter((a) => a.status === "won").reduce((s, a) => s + a.acvPotential, 0);
  const bestCase = accounts.filter((a) => a.status === "won" || a.status === "active").reduce((s, a) => s + a.acvPotential, 0);
  const pipeline = accounts.filter((a) => a.status === "active" || a.status === "targeted").reduce((s, a) => s + a.acvPotential, 0);

  const pct = (v: number) => Math.round((v / totalQuota) * 100);

  return (
    <div className="space-y-3">
      {[
        { label: "Commit", value: commit, color: "#22C55E", note: "Won — closed revenue" },
        { label: "Best Case", value: bestCase, color: "#F59E0B", note: "Won + Active (weighted 70%)" },
        { label: "Pipeline Model", value: pipeline, color: "#3B82F6", note: "Active + Targeted (stage-weighted)" },
        { label: "Annual Quota", value: totalQuota, color: "#6B7280", note: "APJ aggregate target" },
      ].map(({ label, value, color, note }) => (
        <div key={label}>
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>{label}</span>
            <div className="flex items-center gap-3">
              <span style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}>{note}</span>
              <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.8125rem", color: "var(--color-text-primary)" }}>
                ${(value / 1e6).toFixed(1)}M
              </span>
              <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.625rem", color, minWidth: 36, textAlign: "right" }}>
                {pct(value)}%
              </span>
            </div>
          </div>
          <div className="progress-track" style={{ height: 4 }}>
            <div className="progress-fill" style={{ width: `${Math.min(pct(value), 100)}%`, backgroundColor: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const CLAUDE_NARRATIVES = [
  {
    code: "SG",
    signal: "positive" as const,
    headline: "Singapore — strongest win rate, upsell opportunity emerging",
    body: "DBS champion Raj Menon requested CEO-level briefing this week — Piyush Gupta wants institutional banking expansion. Grab champion Ming Chen defending against open-source Llama cost pressure. Recommend Dario-to-Piyush call before end of month and Grab outcomes review with Ming Chen.",
  },
  {
    code: "ID",
    signal: "negative" as const,
    headline: "Indonesia capture stalled at 13% — two lighthouse accounts moved to competitor",
    body: "BCA signed Google Vertex AI for digital banking analytics. Telkom Indonesia deepening Microsoft Azure OpenAI dependency via TelkomSigma. Recommend Jakarta exec visit pre-Q3 with specific use case for BCA Bahasa Indonesia quality gap and a BUMN-compliant positioning for Telkom.",
  },
  {
    code: "AU",
    signal: "positive" as const,
    headline: "Australia — Woodside AU$45M budget approved, no incumbent locked",
    body: "James O'Connor confirmed board-approved AI budget with no vendor committed. Proposal deadline end of May. CBA momentum building: Anna Liu confirmed CDAO Norton is now an internal champion. Microsoft escalating with dedicated Azure OpenAI team — accelerate CBA POC.",
  },
  {
    code: "JP",
    signal: "negative" as const,
    headline: "Japan — SoftBank exclusivity clause limits direct play; enter via portfolio companies",
    body: "OpenAI holds strategic exclusivity for SoftBank internal use cases. Toyota evaluation is 3-vendor competitive: Microsoft, Google, Anthropic. New CDO Keiko Sato (ex-McKinsey) prefers non-Microsoft AI vendors — get intro before she settles in. ARM and T-Mobile are the back-door SoftBank routes.",
  },
  {
    code: "IN",
    signal: "positive" as const,
    headline: "India — Infosys GSI decision this quarter; CEO-level call required",
    body: "Nandan Rao confirmed Infosys is choosing a flagship LLM partner between Anthropic and Azure OpenAI. Microsoft offered $15M revenue-share on Copilot Studio reselling — we need to counter with equivalent economics. HDFC engagement is early; RBI sandbox approval required first.",
  },
];

function NarrativeCard({
  code,
  signal,
  headline,
  body,
}: {
  code: string;
  signal: "positive" | "negative" | "neutral";
  headline: string;
  body: string;
}) {
  const signalColor = signal === "positive" ? "#22C55E" : signal === "negative" ? "#EF4444" : "#6B7280";
  return (
    <div
      className="rounded p-3"
      style={{
        backgroundColor: "#1C1C1F",
        border: "1px solid var(--color-border-subtle)",
        borderLeft: `3px solid ${signalColor}`,
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "0.625rem",
            fontWeight: 700,
            color: "var(--color-ember)",
          }}
        >
          {code}
        </span>
        <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
          {headline}
        </span>
      </div>
      <p style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
        {body}
      </p>
    </div>
  );
}
