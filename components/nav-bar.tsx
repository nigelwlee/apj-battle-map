"use client";

import Link from "next/link";

interface NavBarProps {
  activeTab: "map" | "graph" | "exec";
}

export default function NavBar({ activeTab }: NavBarProps) {
  return (
    <nav
      className="sticky top-0 z-30 flex items-center justify-between shrink-0"
      style={{
        height: "var(--nav-height)",
        backgroundColor: "rgba(14,14,18,0.92)",
        borderBottom: "1px solid var(--color-border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        paddingLeft: "1.25rem",
        paddingRight: "1.25rem",
      }}
    >
      {/* Left — wordmark + tabs */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5 select-none">
          <div
            className="flex items-center justify-center rounded-md shrink-0"
            style={{
              width: 26,
              height: 26,
              background: "linear-gradient(145deg, #F07830 0%, #C4541A 100%)",
              boxShadow: "0 1px 4px rgba(232,104,26,0.4)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1.5L10.5 10H1.5L6 1.5Z" fill="rgba(255,255,255,0.92)" />
            </svg>
          </div>
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--color-text-primary)" }}>
            APJ Battle Map
          </span>
        </div>

        <div
          className="hidden sm:flex items-center"
          style={{ borderLeft: "1px solid var(--color-border)", paddingLeft: "1.25rem", gap: "0.125rem" }}
        >
          <NavTab href="/"      label="Battle Map"   active={activeTab === "map"}   />
          <NavTab href="/graph" label="People Graph" active={activeTab === "graph"} />
          <NavTab href="/exec"  label="Exec View"    active={activeTab === "exec"}  />
        </div>
      </div>

      {/* Right */}
      <div className="hidden sm:flex items-center gap-1.5">
        <div className="rounded-full" style={{ width: 5, height: 5, backgroundColor: "#22C55E", boxShadow: "0 0 4px #22C55E80" }} />
        <span style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
          Illustrative data
        </span>
      </div>
    </nav>
  );
}

function NavTab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.3125rem 0.6875rem",
        borderRadius: "var(--radius-md)",
        fontSize: "0.8125rem",
        fontWeight: active ? 500 : 400,
        letterSpacing: "-0.01em",
        color: active ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
        backgroundColor: active ? "var(--color-elevated)" : "transparent",
        border: `1px solid ${active ? "var(--color-border-mid)" : "transparent"}`,
        transition: "color 120ms, background-color 120ms, border-color 120ms",
        textDecoration: "none",
      }}
    >
      {label}
    </Link>
  );
}
