"use client";

import { useState } from "react";
import {
  getAccountsByCountry,
  getAccountById,
  getPeopleByAccount,
  getIntelByAccount,
  getCountryByCode,
} from "@/lib/data";
import { STATUS_COLORS } from "./map-canvas";
import type { Account, Person, Intel } from "@/lib/types";
import { X, ChevronRight, Clock, Shield, TrendingUp, Zap, AlertTriangle } from "lucide-react";
import { COURT_PRESS_PLAYBOOKS } from "@/lib/court-press";

const STATUS_LABELS: Record<string, string> = {
  won: "Won",
  active: "Active Deal",
  targeted: "Targeted",
  competitor: "Competitor",
  untouched: "Untouched",
};

const CRM_COLORS: Record<string, string> = {
  champion:    "#22C55E",
  meeting_held:"#3B82F6",
  contacted:   "#F59E0B",
  cold:        "#6B7280",
  detractor:   "#EF4444",
};

const CRM_LABELS: Record<string, string> = {
  champion: "Champion",
  meeting_held: "Meeting Held",
  contacted: "Contacted",
  cold: "Cold",
  detractor: "Detractor",
};

const MEDDPICC_KEYS: { key: string; label: string }[] = [
  { key: "metrics",        label: "Metrics" },
  { key: "economicBuyer",  label: "Econ. Buyer" },
  { key: "decisionCriteria", label: "Dec. Criteria" },
  { key: "decisionProcess",  label: "Dec. Process" },
  { key: "identifiedPain",   label: "Pain" },
  { key: "champion",         label: "Champion" },
  { key: "competition",      label: "Competition" },
];

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
        transition: "width 250ms cubic-bezier(0.16,1,0.3,1)",
        overflow: "hidden",
      }}
    >
      {/* Account list */}
      <div
        className="flex flex-col shrink-0 overflow-hidden"
        style={{ width: 360, borderRight: selectedAccount ? "1px solid var(--color-border)" : "none" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)" }}
        >
          <div>
            <h2
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--color-text-primary)",
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              {country?.name ?? countryCode}
            </h2>
            <p style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", marginTop: 2 }}>
              {countryAccounts.length} accounts ·{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-ember)" }}>
                {country ? Math.round(country.captureRate * 100) : 0}%
              </span>{" "}
              capture rate
            </p>
          </div>
          <button onClick={onClose} className="btn-icon" aria-label="Close">
            <X size={15} />
          </button>
        </div>

        {/* Account list */}
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
    ? Math.floor((new Date("2026-04-25").getTime() - new Date(account.lastTouchDate).getTime()) / 86400000)
    : 999;

  return (
    <button
      className="w-full text-left"
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: isSelected ? "var(--color-elevated)" : "transparent",
        transition: "background-color 100ms",
        cursor: "pointer",
        border: "none",
        display: "block",
        width: "100%",
        textAlign: "left",
      }}
      onClick={onClick}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            {account.isLighthouse && (
              <span style={{ color: "var(--color-ember)", fontSize: "0.625rem", lineHeight: 1 }}>★</span>
            )}
            <span
              style={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--color-text-primary)",
                letterSpacing: "-0.01em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {account.name}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              className="pill"
              style={{ backgroundColor: `${color}15`, color, fontSize: "0.5625rem" }}
            >
              {STATUS_LABELS[account.status]}
            </span>
            <span style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}>
              {account.vertical}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--color-text-primary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            ${(account.acvPotential / 1e6).toFixed(1)}M
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {daysSinceTouch > 45 && <AlertTriangle size={10} style={{ color: "#EF4444" }} />}
            <ChevronRight
              size={13}
              style={{ color: isSelected ? "var(--color-ember)" : "var(--color-text-tertiary)" }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}

function WarRoomPanel({ account }: { account: Account }) {
  const stakeholders = getPeopleByAccount(account.id);
  const intelItems = getIntelByAccount(account.id);
  const [intelInput, setIntelInput] = useState("");
  const [localIntel, setLocalIntel] = useState<Intel[]>([]);

  const color = STATUS_COLORS[account.status];
  const allIntel = [...localIntel, ...intelItems].sort((a, b) => b.date.localeCompare(a.date));

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
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Account header */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 12,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                letterSpacing: "-0.02em",
                margin: 0,
                marginBottom: 6,
              }}
            >
              {account.name}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="pill" style={{ backgroundColor: `${color}15`, color }}>
                {STATUS_LABELS[account.status]}
              </span>
              <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
                {account.vertical}
              </span>
              {account.incumbent && (
                <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
                  Incumbent: <span style={{ color: "#9CA3AF" }}>{account.incumbent}</span>
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              ${(account.acvPotential / 1e6).toFixed(1)}M
            </p>
            <p style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", marginTop: 3 }}>
              ACV potential
            </p>
            <p
              style={{
                fontSize: "0.625rem",
                color: "var(--color-text-tertiary)",
                fontFamily: "var(--font-mono)",
                marginTop: 1,
              }}
            >
              Close {account.targetClose}
            </p>
          </div>
        </div>

        {/* Stat pills */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "Revenue",    value: account.revenue },
            { label: "Employees",  value: account.employees.toLocaleString() },
            { label: "AI Maturity", value: `${account.aiMaturity} / 5` },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                backgroundColor: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "8px 10px",
              }}
            >
              <p style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                {label}
              </p>
              <p style={{ fontSize: "0.8125rem", fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", fontVariantNumeric: "tabular-nums" }}>
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
      {account.competitivePosture && (
        <Section icon={<Shield size={12} />} title="Competitive Posture">
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
            {account.competitivePosture}
          </p>
        </Section>
      )}

      {/* MEDDPICC */}
      <Section title="MEDDPICC">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {MEDDPICC_KEYS.map(({ key, label }) => {
            const raw = (account.meddpicc as Record<string, string | number>)[key];
            const isNumeric = typeof raw === "number" || (typeof raw === "string" && /^\d+$/.test(String(raw)));
            const score = isNumeric ? Number(raw) : null;

            return (
              <div key={key}>
                {score !== null ? (
                  // Numeric — show bar
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--color-text-tertiary)",
                        minWidth: 90,
                        flexShrink: 0,
                      }}
                    >
                      {label}
                    </span>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1 }}>
                        <div className="progress-track" style={{ height: 4 }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${(score / 5) * 100}%`,
                              backgroundColor:
                                score >= 4 ? "#22C55E" : score >= 3 ? "#F59E0B" : score >= 2 ? "#E8681A" : "#EF4444",
                            }}
                          />
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6875rem",
                          color: "var(--color-text-primary)",
                          width: 14,
                          textAlign: "right",
                        }}
                      >
                        {score}
                      </span>
                    </div>
                  </div>
                ) : (
                  // Text value
                  <div style={{ display: "flex", gap: 10 }}>
                    <span
                      style={{
                        fontSize: "0.5625rem",
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-ember)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        paddingTop: 2,
                        minWidth: 90,
                        flexShrink: 0,
                      }}
                    >
                      {label}
                    </span>
                    <p style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", lineHeight: 1.55 }}>
                      {String(raw)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Stakeholders */}
      <Section title="Stakeholder Roster">
        {stakeholders.length === 0 ? (
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>No stakeholders mapped</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {stakeholders.map((person) => (
              <PersonRow key={person.id} person={person} />
            ))}
          </div>
        )}
      </Section>

      {/* Intel feed */}
      <Section icon={<Clock size={12} />} title="Field Intelligence">
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
          {allIntel.map((item) => (
            <IntelItem key={item.id} item={item} />
          ))}
          {allIntel.length === 0 && (
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>No intel yet</p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={intelInput}
            onChange={(e) => setIntelInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddIntel()}
            placeholder="Add field intel…"
            style={{
              flex: 1,
              borderRadius: 8,
              padding: "7px 12px",
              fontSize: "0.75rem",
              backgroundColor: "var(--color-elevated)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              outline: "none",
              fontFamily: "var(--font-sans)",
            }}
          />
          <button
            onClick={handleAddIntel}
            className="btn btn-primary"
            style={{ padding: "6px 14px", fontSize: "0.75rem" }}
          >
            Add
          </button>
        </div>
      </Section>

      {/* Full-Court Press */}
      {COURT_PRESS_PLAYBOOKS[account.id] ? (
        <CourtPressSection playbook={COURT_PRESS_PLAYBOOKS[account.id]} />
      ) : (
        <Section icon={<Zap size={12} />} title="Full-Court Press Playbook">
          <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)", lineHeight: 1.6 }}>
            Pre-baked playbook available for Telstra, DBS, and Toyota. Select one of those accounts to see the full plan.
          </p>
        </Section>
      )}

      <p style={{ fontSize: "0.5625rem", color: "var(--color-text-muted)", textAlign: "center", paddingBottom: 8 }}>
        Illustrative data — architecture is what&apos;s real
      </p>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 10,
          paddingBottom: 8,
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {icon && <span style={{ color: "var(--color-text-tertiary)" }}>{icon}</span>}
        <span className="text-label">{title}</span>
      </div>
      {children}
    </div>
  );
}

function PersonRow({ person }: { person: Person }) {
  const color = CRM_COLORS[person.crmStatus] ?? "#6B7280";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "8px 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          backgroundColor: `${color}18`,
          border: `1px solid ${color}35`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: "0.6875rem", fontWeight: 700, color }}>{person.name.slice(0, 1)}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>
            {person.name}
          </span>
          <span className="pill" style={{ backgroundColor: `${color}15`, color, fontSize: "0.5rem" }}>
            {CRM_LABELS[person.crmStatus]}
          </span>
        </div>
        <p style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", lineHeight: 1.4 }}>
          {person.title}
        </p>
        {person.publicStance && (
          <p style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", marginTop: 3, lineHeight: 1.5 }}>
            {person.publicStance.slice(0, 80)}{person.publicStance.length > 80 ? "…" : ""}
          </p>
        )}
      </div>
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--color-text-primary)", fontWeight: 600 }}>
          {person.influenceScore}
        </p>
        <p style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}>score</p>
      </div>
    </div>
  );
}

function IntelItem({ item }: { item: Intel }) {
  const signal = (item as { signal?: string }).signal;
  const signalColor = signal === "positive" ? "#22C55E" : signal === "negative" ? "#EF4444" : "#3A3A4E";
  const body = item.body ?? (item as { text?: string }).text ?? "";

  return (
    <div
      style={{
        backgroundColor: "var(--color-elevated)",
        border: "1px solid var(--color-border)",
        borderLeft: `3px solid ${signalColor}`,
        borderRadius: "0 8px 8px 0",
        padding: "10px 12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: "0.625rem", fontWeight: 600, color: "var(--color-text-tertiary)" }}>
          {item.author}
        </span>
        <span style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>
          {item.date}
        </span>
      </div>
      <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
        {body}
      </p>
    </div>
  );
}

function CourtPressSection({ playbook }: { playbook: import("@/lib/court-press").CourtPressPlay }) {
  const [showEmail, setShowEmail] = useState(false);

  return (
    <Section icon={<Zap size={12} />} title="Full-Court Press Playbook">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <p style={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-ember)", marginBottom: 8 }}>
            5 Humans to Win
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {playbook.targetPeople.map((p, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "var(--color-elevated)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 4 }}>
                  {i + 1}. {p.name}
                </p>
                <p style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", marginBottom: 6, lineHeight: 1.55 }}>
                  {p.why}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <p style={{ fontSize: "0.625rem", color: "var(--color-ember)" }}>
                    Path: <span style={{ color: "var(--color-text-secondary)" }}>{p.warmPath}</span>
                  </p>
                  <p style={{ fontSize: "0.625rem", color: "#22C55E" }}>
                    Action: <span style={{ color: "var(--color-text-secondary)" }}>{p.nextAction}</span>
                  </p>
                  <p style={{ fontSize: "0.625rem", color: "#3B82F6" }}>
                    Objection: <span style={{ color: "var(--color-text-secondary)" }}>{p.objectionAngle}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-ember)", marginBottom: 8 }}>
            30–90 Day Campaign
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {playbook.timeline.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.625rem",
                    color: "var(--color-ember)",
                    minWidth: 60,
                    marginTop: 1,
                    flexShrink: 0,
                  }}
                >
                  {t.phase}
                </span>
                <div>
                  <p style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>{t.milestone}</p>
                  <p style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)", marginTop: 2 }}>✓ {t.metric}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <button
            className="btn btn-ghost w-full"
            style={{ fontSize: "0.75rem", justifyContent: "flex-start", gap: 8 }}
            onClick={() => setShowEmail((v) => !v)}
          >
            <span>{showEmail ? "▲" : "▶"}</span>
            Draft Exec-Sponsor Email
          </button>
          {showEmail && (
            <pre
              style={{
                fontSize: "0.6875rem",
                color: "var(--color-text-secondary)",
                backgroundColor: "var(--color-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                padding: "12px 14px",
                marginTop: 8,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                fontFamily: "var(--font-mono)",
                overflowX: "auto",
              }}
            >
              {playbook.draftExecEmail}
            </pre>
          )}
        </div>

        <p style={{ fontSize: "0.5625rem", color: "var(--color-text-muted)" }}>
          Generated by Claude claude-sonnet-4-6 · {playbook.generated} · Illustrative data
        </p>
      </div>
    </Section>
  );
}
