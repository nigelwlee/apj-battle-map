"use client";

import Link from "next/link";

interface NavBarProps {
  activeTab: "map" | "exec";
}

export default function NavBar({ activeTab }: NavBarProps) {
  return (
    <nav
      className="sticky top-0 z-30 flex items-center justify-between px-4 border-b"
      style={{
        height: "var(--nav-height)",
        backgroundColor: "var(--color-surface)",
        borderBottomColor: "var(--color-border)",
      }}
    >
      {/* Wordmark */}
      <div className="flex items-center gap-3">
        <span
          className="text-sm font-semibold tracking-tight select-none"
          style={{ color: "var(--color-text-primary)" }}
        >
          <span style={{ color: "var(--color-ember)" }}>APJ</span> Battle Map
        </span>

        {/* Nav tabs */}
        <div
          className="hidden sm:flex items-center ml-4"
          style={{ borderLeft: "1px solid var(--color-border)", paddingLeft: "1rem" }}
        >
          <NavTab href="/" label="Battle Map" active={activeTab === "map"} />
          <NavTab href="/exec" label="Exec View" active={activeTab === "exec"} />
        </div>
      </div>

      {/* Right side: disclaimer badge */}
      <div className="flex items-center gap-3">
        <span
          className="text-micro px-2 py-0.5 rounded hidden sm:inline-block"
          style={{
            color: "var(--color-text-tertiary)",
            border: "1px solid var(--color-border)",
            fontSize: "0.6875rem",
          }}
        >
          Illustrative data
        </span>
      </div>
    </nav>
  );
}

function NavTab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative px-3 py-2 text-sm font-medium transition-colors"
      style={{
        color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
        fontSize: "0.8125rem",
      }}
    >
      {label}
      {active && (
        <span
          className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
          style={{ backgroundColor: "var(--color-ember)" }}
        />
      )}
    </Link>
  );
}
