"use client";

import { useState } from "react";
import { getAccountsByCountry, getAccountById, getPeopleByAccount, getIntelByAccount, getCountryByCode } from "@/lib/data";
import { STATUS_COLORS } from "./map-canvas";
import type { Account, Person, Intel } from "@/lib/types";
import { X, ChevronRight, Clock, AlertTriangle, TrendingUp, Shield, Zap } from "lucide-react";
import { COURT_PRESS_PLAYBOOKS } from "@/lib/court-press";

const STATUS_LABELS: Record<string, string> = {
  won: "Won", active: "Active Deal", targeted: "Targeted",
  competitor: "Competitor", untouched: "Untouched",
};

const CRM_COLORS: Record<string, string> = {
  champion: "#22C55E",
  meeting_held: "#3B82F6",
  contacted: "#F59E0B",
  cold: "#6B7280",
  detractor: "#EF4444",
};

const CRM_LABELS: Record<string, string> = {
  champion: "Champion", meeting_held: "Meeting Held",
  contacted: "Contacted", cold: "Cold", detractor: "Detractor",
};

interface AccountPanelProps {
  countryCode: string | null;
  onClose: () => void;
}

export default function AccountPanel({ countryCode, onClose }: AccountPanelProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  if (!countryCode) return null;

  const country = getCountryByCode(countryCode);
  const countryAccounts = getAccountsByCountry(countryCode);
  const selectedAccount = selectedAccountId ? getAccountById(selectedAccountId) : null;

  return (
    <div
      className="drawer-enter flex h-full"
      style={{
        width: selectedAccount ? 800 : 360,
        backgroundColor: "var(--color-surface)",
        borderLeft: "1px solid var(--color-border)",
        transition: "width 0.25s ease",
        overflow: "hidden",
      }}
    >
      {/* Account list */}
      <div
        className="flex flex-col shrink-0 overflow-hidden"
        style={{ width: 360, borderRight: selectedAccount ? "1px solid var(--color-border)" : "none" }}
      >
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {country?.name ?? countryCode}
            </h2>
            <p style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
              {countryAccounts.length} accounts · Capture{" "}
              <span style={{ fontFamily: "var(--font-geist-mono)", color: "var(--color-ember)" }}>
                {country ? Math.round(country.captureRate * 100) : 0}%
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost p-1"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {countryAccounts.map((account) => (
            <AccountListItem
              key={account.id}
              account={account}
              isSelected={selectedAccountId === account.id}
              onClick={() => setSelectedAccountId(account.id === selectedAccountId ? null : account.id)}
            />
          ))}
        </div>
      </div>

      {/* War-room panel */}
      {selectedAccount && (
        <div className="flex-1 overflow-y-auto">
          <WarRoomPanel account={selectedAccount} />
        </div>
      )}
    </div>
  );
}

function AccountListItem({
  account,
  isSelected,
  onClick,
}: {
  account: Account;
  isSelected: boolean;
  onClick: () => void;
}) {
  const color = STATUS_COLORS[account.status];
  const daysSinceTouch = account.lastTouchDate
    ? Math.floor(
        (new Date("2026-04-25").getTime() - new Date(account.lastTouchDate).getTime()) /
          86400000
      )
    : 999;

  return (
    <button
      className="w-full text-left px-4 py-3 hover:bg-[#27272A] transition-colors"
      style={{
        borderBottom: "1px solid var(--color-border-subtle)",
        backgroundColor: isSelected ? "#27272A" : "transparent",
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {account.isLighthouse && (
              <span style={{ fontSize: "0.5rem", color: "var(--color-ember)" }}>★</span>
            )}
            <span
              className="text-sm font-medium truncate"
              style={{ color: "var(--color-text-primary)", fontSize: "0.8125rem" }}
            >
              {account.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="pill"
              style={{
                backgroundColor: `${color}18`,
                color,
                fontSize: "0.5625rem",
                padding: "1px 5px",
              }}
            >
              {STATUS_LABELS[account.status]}
            </span>
            <span style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}>
              {account.vertical}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0 gap-1">
          <span
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "0.75rem",
              color: "var(--color-text-primary)",
            }}
          >
            ${(account.acvPotential / 1e6).toFixed(1)}M
          </span>
          {daysSinceTouch > 45 && (
            <AlertTriangle size={10} style={{ color: "#EF4444" }} />
          )}
          <ChevronRight
            size={12}
            style={{
              color: isSelected ? "var(--color-ember)" : "var(--color-text-tertiary)",
            }}
          />
        </div>
      </div>
    </button>
  );
}

function WarRoomPanel({ account }: { account: Account }) {
  const people = getPeopleByAccount(account.id);
  const intelItems = getIntelByAccount(account.id);
  const [intelInput, setIntelInput] = useState("");
  const [localIntel, setLocalIntel] = useState<Intel[]>([]);
  const color = STATUS_COLORS[account.status];

  const allIntel = [...localIntel, ...intelItems].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const handleAddIntel = () => {
    if (!intelInput.trim()) return;
    setLocalIntel((prev) => [
      {
        id: `intel-local-${Date.now()}`,
        accountId: account.id,
        date: new Date().toISOString().slice(0, 10),
        author: "You",
        body: intelInput.trim(),
        signal: "neutral",
      },
      ...prev,
    ]);
    setIntelInput("");
  };

  return (
    <div className="p-5 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h3 className="text-base font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
              {account.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="pill"
                style={{ backgroundColor: `${color}18`, color, fontSize: "0.5625rem", padding: "2px 6px" }}
              >
                {STATUS_LABELS[account.status]}
              </span>
              <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
                {account.vertical} · {account.size.replace(/([A-Z])/g, " $1").trim()}
              </span>
              {account.incumbent && (
                <span style={{ fontSize: "0.6875rem", color: "#6B7280" }}>
                  Incumbent: {account.incumbent}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
              }}
            >
              ${(account.acvPotential / 1e6).toFixed(1)}M
            </p>
            <p style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}>
              ACV potential
            </p>
            <p
              style={{
                fontSize: "0.625rem",
                color: "var(--color-text-tertiary)",
                fontFamily: "var(--font-geist-mono)",
              }}
            >
              Close {account.targetClose}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { label: "Revenue", value: account.revenue },
            { label: "Employees", value: account.employees.toLocaleString() },
            { label: "AI Maturity", value: `${account.aiMaturity} / 5` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded p-2"
              style={{ backgroundColor: "#1C1C1F", border: "1px solid var(--color-border-subtle)" }}
            >
              <p style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}>{label}</p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  fontFamily: "var(--font-geist-mono)",
                  color: "var(--color-text-primary)",
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Lighthouse rationale */}
      <Section icon={<TrendingUp size={12} />} title="Why This Account">
        <p className="pull-quote">{account.lighthouseRationale}</p>
      </Section>

      {/* Competitive posture */}
      <Section icon={<Shield size={12} />} title="Competitive Posture">
        <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
          {account.competitivePosture}
        </p>
      </Section>

      {/* MEDDPICC */}
      <Section title="MEDDPICC">
        <div className="space-y-2">
          {Object.entries(account.meddpicc).map(([key, val]) => (
            <div key={key} className="flex gap-3">
              <span
                className="shrink-0 font-mono text-ember"
                style={{
                  fontSize: "0.5625rem",
                  fontFamily: "var(--font-geist-mono)",
                  color: "var(--color-ember)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  paddingTop: "2px",
                  minWidth: 90,
                }}
              >
                {key === "economicBuyer" ? "Econ. Buyer" :
                 key === "decisionCriteria" ? "Decision Crit." :
                 key === "decisionProcess" ? "Decision Proc." :
                 key === "paperProcess" ? "Paper Proc." :
                 key === "identifiedPain" ? "Pain" :
                 key}
              </span>
              <p style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                {val}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Stakeholders */}
      <Section title="Stakeholder Roster">
        <div className="space-y-2">
          {people.map((person) => (
            <PersonRow key={person.id} person={person} />
          ))}
          {people.length === 0 && (
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>No stakeholders mapped</p>
          )}
        </div>
      </Section>

      {/* Intel feed */}
      <Section icon={<Clock size={12} />} title="Field Intelligence">
        <div className="space-y-2 mb-3">
          {allIntel.map((item) => (
            <IntelItem key={item.id} item={item} />
          ))}
          {allIntel.length === 0 && (
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>No intel notes yet</p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={intelInput}
            onChange={(e) => setIntelInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddIntel()}
            placeholder="Add field intel..."
            className="flex-1 rounded px-3 py-1.5"
            style={{
              fontSize: "0.75rem",
              backgroundColor: "#1C1C1F",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              outline: "none",
            }}
          />
          <button
            onClick={handleAddIntel}
            className="btn btn-primary px-3 py-1.5"
            style={{ fontSize: "0.75rem" }}
          >
            Add
          </button>
        </div>
      </Section>

      {/* Full-Court Press Playbook */}
      {COURT_PRESS_PLAYBOOKS[account.id] ? (
        <CourtPressSection playbook={COURT_PRESS_PLAYBOOKS[account.id]} />
      ) : (
        <Section icon={<Zap size={12} />} title="Full-Court Press Playbook">
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>
            Pre-baked playbook available for Telstra, DBS, and Toyota. Select one of those accounts to see the full plan.
          </p>
        </Section>
      )}

      <div style={{ height: 24 }} />
      <p
        className="text-center"
        style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}
      >
        Illustrative data — architecture is what&apos;s real
      </p>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="flex items-center gap-1.5 mb-2 pb-1.5"
        style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
      >
        {icon && <span style={{ color: "var(--color-text-tertiary)" }}>{icon}</span>}
        <h4
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--color-text-tertiary)",
          }}
        >
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}

function PersonRow({ person }: { person: Person }) {
  const color = CRM_COLORS[person.crmStatus] ?? "#6B7280";
  return (
    <div className="flex items-start gap-3 py-1">
      <div
        className="rounded-full shrink-0 mt-0.5 flex items-center justify-center"
        style={{ width: 24, height: 24, backgroundColor: `${color}18`, border: `1px solid ${color}40` }}
      >
        <span style={{ fontSize: "0.5625rem", fontWeight: 700, color }}>{person.name.slice(0, 1)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
            {person.name}
          </span>
          <span
            className="pill"
            style={{ backgroundColor: `${color}18`, color, fontSize: "0.5rem", padding: "1px 4px" }}
          >
            {CRM_LABELS[person.crmStatus]}
          </span>
        </div>
        <p style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}>{person.title}</p>
        <p style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)", marginTop: 2, lineHeight: 1.4 }}>
          {person.publicStance.slice(0, 90)}
          {person.publicStance.length > 90 ? "…" : ""}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "0.6875rem",
            color: "var(--color-text-primary)",
          }}
        >
          {person.influenceScore}
        </p>
        <p style={{ fontSize: "0.5rem", color: "var(--color-text-tertiary)" }}>influence</p>
      </div>
    </div>
  );
}

function IntelItem({ item }: { item: Intel }) {
  const signalColor = item.signal === "positive" ? "#22C55E" : item.signal === "negative" ? "#EF4444" : "#6B7280";
  return (
    <div
      className="rounded p-2.5"
      style={{
        backgroundColor: "#1C1C1F",
        border: "1px solid var(--color-border-subtle)",
        borderLeft: `3px solid ${signalColor}`,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontSize: "0.5625rem", fontWeight: 600, color: "var(--color-text-tertiary)" }}>
          {item.author}
        </span>
        <span
          style={{
            fontSize: "0.5rem",
            color: "var(--color-text-tertiary)",
            fontFamily: "var(--font-geist-mono)",
          }}
        >
          {item.date}
        </span>
      </div>
      <p style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
        {item.body}
      </p>
    </div>
  );
}

function CourtPressSection({ playbook }: { playbook: import("@/lib/court-press").CourtPressPlay }) {
  const [showEmail, setShowEmail] = useState(false);

  return (
    <Section icon={<Zap size={12} />} title="Full-Court Press Playbook">
      <div className="space-y-4">
        {/* Target people */}
        <div>
          <p style={{ fontSize: "0.5625rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-ember)", marginBottom: 8 }}>
            5 Humans to Win
          </p>
          <div className="space-y-3">
            {playbook.targetPeople.map((p, i) => (
              <div key={i} className="rounded p-3" style={{ backgroundColor: "#1C1C1F", border: "1px solid var(--color-border-subtle)" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>
                  {i + 1}. {p.name}
                </p>
                <p style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", marginBottom: 6, lineHeight: 1.5 }}>{p.why}</p>
                <div className="space-y-1">
                  <p style={{ fontSize: "0.5625rem", color: "var(--color-ember)" }}>Warm path: <span style={{ color: "var(--color-text-secondary)" }}>{p.warmPath}</span></p>
                  <p style={{ fontSize: "0.5625rem", color: "#22C55E" }}>Next action: <span style={{ color: "var(--color-text-secondary)" }}>{p.nextAction}</span></p>
                  <p style={{ fontSize: "0.5625rem", color: "#3B82F6" }}>Objection: <span style={{ color: "var(--color-text-secondary)" }}>{p.objectionAngle}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <p style={{ fontSize: "0.5625rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-ember)", marginBottom: 8 }}>
            30–90 Day Campaign
          </p>
          <div className="space-y-1.5">
            {playbook.timeline.map((t, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.5625rem", color: "var(--color-ember)", minWidth: 60, marginTop: 1 }}>{t.phase}</span>
                <div>
                  <p style={{ fontSize: "0.625rem", color: "var(--color-text-secondary)" }}>{t.milestone}</p>
                  <p style={{ fontSize: "0.5rem", color: "var(--color-text-tertiary)", marginTop: 1 }}>✓ {t.metric}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Draft exec email */}
        <div>
          <button
            className="btn btn-ghost w-full text-left"
            style={{ fontSize: "0.6875rem", padding: "6px 10px", border: "1px solid var(--color-border)" }}
            onClick={() => setShowEmail((v) => !v)}
          >
            {showEmail ? "▲" : "▶"} Draft Exec-Sponsor Email
          </button>
          {showEmail && (
            <pre
              className="rounded p-3 mt-2 overflow-x-auto"
              style={{
                fontSize: "0.5625rem",
                color: "var(--color-text-secondary)",
                backgroundColor: "#1C1C1F",
                border: "1px solid var(--color-border-subtle)",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                fontFamily: "var(--font-geist-mono)",
              }}
            >
              {playbook.draftExecEmail}
            </pre>
          )}
        </div>

        <p style={{ fontSize: "0.5rem", color: "var(--color-text-tertiary)" }}>
          Generated by Claude claude-sonnet-4-6 · {playbook.generated} · Illustrative data
        </p>
      </div>
    </Section>
  );
}
