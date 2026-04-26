"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { NodeObject, LinkObject } from "react-force-graph-2d";
import { people as allPeople, edges as allEdges, accounts, getIntelByAccount } from "@/lib/data";
import { findWarmPaths } from "@/lib/warm-paths";
import type { Person, Edge, WarmPath } from "@/lib/types";
import { X, Users, GitBranch, Clock, ExternalLink, Award, Briefcase } from "lucide-react";

// ── Dynamic import (no SSR) ───────────────────────────────────────────────
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <span style={{ fontSize: "0.75rem", color: "#5C5C72" }}>Initialising graph…</span>
    </div>
  ),
});

// ── CRM Status ────────────────────────────────────────────────────────────
const CRM_COLORS: Record<string, string> = {
  champion:    "#22C55E",
  meeting_held:"#3B82F6",
  contacted:   "#F59E0B",
  cold:        "#6B7280",
  detractor:   "#EF4444",
};

const CRM_LABELS: Record<string, string> = {
  champion:    "Champion",
  meeting_held:"Meeting Held",
  contacted:   "Contacted",
  cold:        "Cold",
  detractor:   "Detractor",
};

// ── Edge types ────────────────────────────────────────────────────────────
const EDGE_COLORS: Record<string, string> = {
  co_worked:               "#E8681A",
  co_worker:               "#E8681A",
  board:                   "#8B5CF6",
  board_overlap:           "#8B5CF6",
  alumni:                  "#3B82F6",
  co_author:               "#06B6D4",
  co_panelist:             "#52525B",
  conference_co_panelist:  "#52525B",
};

const EDGE_LABELS: Record<string, string> = {
  co_worked:              "Co-workers",
  co_worker:              "Co-workers",
  board:                  "Board",
  board_overlap:          "Board",
  alumni:                 "Alumni",
  co_author:              "Co-authors",
  co_panelist:            "Co-panelists",
  conference_co_panelist: "Co-panelists",
};

// ── Country cluster positions in graph-space ──────────────────────────────
// Loosely geographic APJ layout, optimised for readability (not accuracy).
const CLUSTER: Record<string, { x: number; y: number; label: string; w: number; h: number }> = {
  IN: { x: -340, y: -60,  label: "India",        w: 90, h: 70 },
  TH: { x: -140, y:  40,  label: "Thailand",     w: 70, h: 55 },
  MY: { x:  -80, y: 130,  label: "Malaysia",     w: 70, h: 55 },
  SG: { x:  -20, y: 180,  label: "Singapore",    w: 65, h: 50 },
  ID: { x:  100, y: 200,  label: "Indonesia",    w: 75, h: 60 },
  VN: { x:   20, y:  -10, label: "Vietnam",      w: 65, h: 50 },
  PH: { x:  230, y:   10, label: "Philippines",  w: 70, h: 55 },
  HK: { x:  160, y:  -60, label: "Hong Kong",    w: 60, h: 45 },
  TW: { x:  230, y: -100, label: "Taiwan",       w: 65, h: 50 },
  KR: { x:  290, y: -210, label: "South Korea",  w: 80, h: 65 },
  JP: { x:  390, y: -290, label: "Japan",        w: 90, h: 70 },
  AU: { x:  240, y:  310, label: "Australia",    w: 95, h: 75 },
  NZ: { x:  380, y:  340, label: "New Zealand",  w: 75, h: 60 },
};


// ── DiceBear avatar ───────────────────────────────────────────────────────
function avatarUrl(name: string): string {
  return `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(name)}&backgroundColor=1C1C22`;
}

// ── LinkedIn slug ─────────────────────────────────────────────────────────
function linkedInSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ── Deterministic jitter (FNV-like hash) ─────────────────────────────────
function jitter(id: string, axis: "x" | "y"): number {
  let h = axis === "x" ? 0x811c9dc5 : 0xcbf29ce4;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return ((h & 0xffff) / 0xffff - 0.5) * 30;
}

// ── Props ─────────────────────────────────────────────────────────────────
interface PeopleGraphProps {
  filterCountry?: string;
  filterCrm?: string;
}

// ── Main component ────────────────────────────────────────────────────────
export default function PeopleGraph({ filterCountry, filterCrm }: PeopleGraphProps) {
  const [dimensions, setDimensions] = useState({ width: 900, height: 700 });
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const engineStoppedRef = useRef(false);

  // Resize observer
  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      setDimensions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
      engineStoppedRef.current = false;
    };
    update();
    const obs = new ResizeObserver(update);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Filtered people
  const filteredPeople = useMemo(() =>
    allPeople.filter((p) => {
      if (filterCountry && filterCountry !== "all" && p.countryCode !== filterCountry) return false;
      if (filterCrm && filterCrm !== "all" && p.crmStatus !== filterCrm) return false;
      return true;
    }),
    [filterCountry, filterCrm]
  );

  const filteredIds = useMemo(() => new Set(filteredPeople.map((p) => p.id)), [filteredPeople]);

  // Graph data: person nodes + pinned country-label nodes
  const graphData = useMemo(() => {
    const personNodes = filteredPeople.map((p) => {
      const c = CLUSTER[p.countryCode] ?? { x: 0, y: 0 };
      return {
        id: p.id,
        isLabel: false,
        name: p.name,
        firstName: p.name.split(" ")[0],
        shortTitle: p.title.split(",")[0].slice(0, 28),
        crmStatus: p.crmStatus,
        influenceScore: p.influenceScore,
        countryCode: p.countryCode,
        accountId: p.accountId,
        val: Math.max(3, (p.influenceScore / 10) * 3),
        // Start near cluster center
        x: c.x + jitter(p.id, "x"),
        y: c.y + jitter(p.id, "y"),
      };
    });

    // Pinned country label pseudo-nodes (fx/fy = fixed)
    const labelNodes = Object.entries(CLUSTER).map(([code, c]) => ({
      id: `__label_${code}`,
      isLabel: true,
      countryCode: code,
      labelText: c.label,
      name: c.label,
      firstName: c.label,
      shortTitle: "",
      crmStatus: "cold" as const,
      influenceScore: 0,
      accountId: "",
      val: 0,
      fx: c.x,
      fy: c.y,
      x: c.x,
      y: c.y,
    }));

    const links = (allEdges as Edge[])
      .filter((e) => filteredIds.has(e.sourceId) && filteredIds.has(e.targetId))
      .map((e) => ({
        source: e.sourceId,
        target: e.targetId,
        type: e.type,
        strength: e.strength,
        id: e.id,
      }));

    return { nodes: [...personNodes, ...labelNodes], links };
  }, [filteredPeople, filteredIds]);

  // Set up custom forces when graphData changes
  useEffect(() => {
    const g = graphRef.current;
    if (!g) return;

    g.d3Force("charge")?.strength(-220);
    g.d3Force("link")?.distance(90).strength(0.25);
    g.d3Force("center")?.strength(0.01);

    // Country cluster force — pulls each person toward their country center
    const clusterForce = (alpha: number) => {
      for (const node of graphData.nodes) {
        if ((node as { isLabel: boolean }).isLabel) continue;
        const c = CLUSTER[(node as { countryCode: string }).countryCode];
        if (!c) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const n = node as any;
        n.vx = (n.vx ?? 0) + (c.x - (n.x ?? 0)) * 0.10 * alpha;
        n.vy = (n.vy ?? 0) + (c.y - (n.y ?? 0)) * 0.10 * alpha;
      }
    };

    g.d3Force("cluster", clusterForce);
    engineStoppedRef.current = false;
    g.d3ReheatSimulation();
  }, [graphData]);

  // Auto-fit when simulation settles
  const handleEngineStop = useCallback(() => {
    if (engineStoppedRef.current || !graphRef.current) return;
    engineStoppedRef.current = true;
    graphRef.current.zoomToFit(500, 80);
  }, []);

  // Warm paths for selected person
  const warmPaths = useMemo(() => {
    if (!selectedPerson) return [];
    return findWarmPaths(selectedPerson.id, allPeople, allEdges, 3, 3);
  }, [selectedPerson]);

  const warmPathIds = useMemo(() => {
    const ids = new Set<string>();
    for (const path of warmPaths) for (const id of path.path) ids.add(id);
    return ids;
  }, [warmPaths]);

  // ── Background frame: country region ellipses ─────────────────────────
  const handleRenderFramePre = useCallback((ctx: CanvasRenderingContext2D) => {
    Object.entries(CLUSTER).forEach(([, c]) => {
      // Subtle ellipse background
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.w, c.h, 0, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(255,255,255,0.018)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });
  }, []);

  // ── Node canvas rendering ─────────────────────────────────────────────
  const nodeCanvasObject = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const nodeId = String(node.id);
      const x = node.x as number;
      const y = node.y as number;

      // Country label pseudo-nodes
      if ((node as { isLabel?: boolean }).isLabel) {
        const labelText = (node as { labelText?: string }).labelText ?? "";
        const fontSize = Math.max(9, 10 / Math.max(globalScale, 0.5));
        ctx.save();
        ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillStyle = "rgba(92,92,114,0.55)";
        ctx.textAlign = "center";
        ctx.letterSpacing = "1.5px";
        ctx.fillText(labelText.toUpperCase(), x, y - (CLUSTER[(node as unknown as { countryCode: string }).countryCode]?.h ?? 50) - 6);
        ctx.letterSpacing = "0px";
        ctx.restore();
        return;
      }

      const isSelected = selectedPerson?.id === nodeId;
      const isInPath = warmPathIds.has(nodeId);
      const isDimmed = !!(selectedPerson && !isSelected && !isInPath);

      const r = Math.max(7, (node.influenceScore as number) / 8);
      const color = CRM_COLORS[(node.crmStatus as string)] ?? "#6B7280";

      // Glow ring for selected
      if (isSelected) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r + 12, 0, 2 * Math.PI);
        const gradient = ctx.createRadialGradient(x, y, r, x, y, r + 12);
        gradient.addColorStop(0, `${color}50`);
        gradient.addColorStop(1, `${color}00`);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      } else if (isInPath) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r + 7, 0, 2 * Math.PI);
        ctx.fillStyle = `${color}22`;
        ctx.fill();
        ctx.restore();
      }

      // Node fill
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      if (isSelected) {
        ctx.fillStyle = color;
      } else if (isDimmed) {
        ctx.fillStyle = `${color}25`;
      } else {
        ctx.fillStyle = `${color}CC`;
      }
      ctx.fill();

      // Node stroke
      ctx.strokeStyle = isSelected ? "#FFFFFF" : isDimmed ? `${color}15` : `${color}55`;
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();
      ctx.restore();

      // Initials (skip when dimmed)
      if (!isDimmed) {
        const initFontSize = Math.max(5.5, r * 0.72);
        ctx.save();
        ctx.font = `700 ${initFontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isSelected ? "#FFFFFF" : "rgba(255,255,255,0.85)";
        const initials = (node.name as string).split(" ").map((w: string) => w[0]).join("").slice(0, 2);
        ctx.fillText(initials, x, y);
        ctx.restore();
      }

      // Name label above node
      const nameFontSize = Math.max(9, 10.5 / Math.max(globalScale, 0.45));
      ctx.save();
      ctx.font = `${isSelected ? "600" : "500"} ${nameFontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = isDimmed
        ? "rgba(46,46,58,0.6)"
        : isSelected
        ? "#F0F0F4"
        : "rgba(200,200,210,0.85)";
      ctx.fillText((node.firstName as string), x, y - r - 5 * Math.min(globalScale * 0.5 + 0.5, 1));

      // Short title below node — only when not too zoomed out
      if (globalScale > 0.55 && !isDimmed) {
        const titleFontSize = Math.max(7.5, 8.5 / Math.max(globalScale, 0.55));
        ctx.font = `${titleFontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillStyle = isSelected ? `${color}EE` : "rgba(92,92,114,0.7)";
        ctx.fillText((node.shortTitle as string), x, y + r + titleFontSize + 3);
      }
      ctx.restore();

      // Influence score badge on selected
      if (isSelected) {
        const badgeR = 8;
        const bx = x + r + 2;
        const by = y - r - 2;
        ctx.save();
        ctx.beginPath();
        ctx.arc(bx, by, badgeR, 0, 2 * Math.PI);
        ctx.fillStyle = "#0E0E12";
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.font = `700 7px -apple-system`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = color;
        ctx.fillText(String(Math.round(node.influenceScore as number)), bx, by);
        ctx.restore();
      }
    },
    [selectedPerson, warmPathIds]
  );

  // Pointer hit area (larger than visual)
  const nodePointerAreaPaint = useCallback(
    (node: NodeObject, color: string, ctx: CanvasRenderingContext2D) => {
      if ((node as { isLabel?: boolean }).isLabel) return;
      const r = Math.max(10, (node.influenceScore as number) / 8) + 6;
      ctx.beginPath();
      ctx.arc(node.x as number, node.y as number, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    },
    []
  );

  // Link rendering
  const linkColor = useCallback(
    (link: LinkObject) => {
      const base = EDGE_COLORS[(link.type as string)] ?? "#52525B";
      if (!selectedPerson) return `${base}55`;
      const srcId = String((link.source as NodeObject).id);
      const tgtId = String((link.target as NodeObject).id);
      const isOnPath = warmPathIds.has(srcId) && warmPathIds.has(tgtId);
      return isOnPath ? `${base}CC` : `${base}12`;
    },
    [selectedPerson, warmPathIds]
  );

  const linkWidth = useCallback(
    (link: LinkObject) => ((link.strength as number) ?? 1) * 1.2,
    []
  );

  // Click handlers
  const handleNodeClick = useCallback((node: NodeObject) => {
    if ((node as { isLabel?: boolean }).isLabel) return;
    const person = allPeople.find((p) => p.id === String(node.id)) ?? null;
    setSelectedPerson((prev) => (prev?.id === String(node.id) ? null : person));
  }, []);

  // Unique edge types for legend (excluding internal)
  const visibleEdgeTypes = useMemo(() => {
    const seen = new Set<string>();
    const result: { type: string; color: string; label: string }[] = [];
    for (const link of graphData.links) {
      const key = EDGE_LABELS[link.type as string] ?? link.type;
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ type: link.type as string, color: EDGE_COLORS[link.type as string] ?? "#52525B", label: key });
      }
    }
    return result.slice(0, 5);
  }, [graphData.links]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ backgroundColor: "#07070C" }}
    >
      {/* Force graph */}
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="transparent"
        nodeCanvasObject={nodeCanvasObject}
        nodeCanvasObjectMode={() => "replace"}
        nodePointerAreaPaint={nodePointerAreaPaint}
        linkColor={linkColor}
        linkWidth={linkWidth}
        onRenderFramePre={handleRenderFramePre}
        onNodeClick={handleNodeClick}
        onBackgroundClick={() => setSelectedPerson(null)}
        onEngineStop={handleEngineStop}
        warmupTicks={120}
        cooldownTicks={60}
        cooldownTime={3000}
        numDimensions={2}
        enableNodeDrag={false}
        d3AlphaDecay={0.025}
        d3VelocityDecay={0.35}
      />

      {/* Top-left: node count badge */}
      <div
        className="absolute top-4 left-4 flex items-center gap-2 rounded-lg px-3 py-1.5 glass"
        style={{ fontSize: "0.6875rem" }}
      >
        <Users size={12} style={{ color: "var(--color-text-tertiary)" }} />
        <span style={{ color: "var(--color-text-tertiary)" }}>
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", fontWeight: 600 }}>
            {filteredPeople.length}
          </span>
          {" "}people ·{" "}
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", fontWeight: 600 }}>
            {graphData.links.length}
          </span>
          {" "}connections
        </span>
      </div>

      {/* Bottom-left: legend */}
      <div
        className="absolute bottom-4 left-4 rounded-xl px-3 py-2.5 glass"
        style={{ minWidth: 140 }}
      >
        <p className="text-label" style={{ marginBottom: 8 }}>CRM Status</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {Object.entries(CRM_COLORS).map(([status, color]) => (
            <div key={status} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
              <span style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>
                {CRM_LABELS[status]}
              </span>
            </div>
          ))}
        </div>

        {visibleEdgeTypes.length > 0 && (
          <>
            <p className="text-label" style={{ marginTop: 12, marginBottom: 8 }}>Connections</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {visibleEdgeTypes.map(({ color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 14, height: 2, backgroundColor: color, borderRadius: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Person detail panel */}
      {selectedPerson && (
        <div
          className="absolute top-0 right-0 bottom-0 drawer-enter overflow-y-auto"
          style={{
            width: 380,
            backgroundColor: "rgba(10,10,15,0.97)",
            borderLeft: "1px solid var(--color-border)",
            boxShadow: "-12px 0 40px rgba(0,0,0,0.4)",
          }}
        >
          <PersonPanel
            person={selectedPerson}
            warmPaths={warmPaths}
            onClose={() => setSelectedPerson(null)}
          />
        </div>
      )}
    </div>
  );
}

// ── Person Detail Panel ───────────────────────────────────────────────────

function PersonPanel({ person, warmPaths, onClose }: { person: Person; warmPaths: WarmPath[]; onClose: () => void }) {
  const color = CRM_COLORS[person.crmStatus] ?? "#6B7280";
  const account = accounts.find((a) => a.id === person.accountId);
  const intel = getIntelByAccount(person.accountId).slice(0, 3);
  const companyName = account?.name ?? "";

  const daysSinceTouch = person.lastEngagement
    ? Math.floor((new Date("2026-04-26").getTime() - new Date(person.lastEngagement).getTime()) / 86400000)
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "20px 20px 16px",
          background: `linear-gradient(150deg, ${color}10 0%, transparent 55%)`,
          borderBottom: "1px solid var(--color-border)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          className="btn-icon"
          style={{ position: "absolute", top: 14, right: 14 }}
          aria-label="Close"
        >
          <X size={15} />
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          {/* Avatar */}
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 12,
              overflow: "hidden",
              border: `2px solid ${color}35`,
              backgroundColor: "var(--color-elevated)",
              flexShrink: 0,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl(person.name)}
              alt={person.name}
              width={68}
              height={68}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>

          {/* Identity */}
          <div style={{ flex: 1, minWidth: 0, paddingRight: 28, marginTop: 2 }}>
            <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.25, letterSpacing: "-0.02em", margin: 0 }}>
              {person.name}
            </h2>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: 4, lineHeight: 1.4 }}>
              {person.title}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <span
                className="pill"
                style={{ backgroundColor: `${color}18`, color, fontSize: "0.625rem" }}
              >
                {CRM_LABELS[person.crmStatus]}
              </span>
              {companyName && (
                <span style={{ fontSize: "0.6875rem", color: "var(--color-ember)", fontWeight: 500 }}>
                  {companyName.split(" ").slice(0, 2).join(" ")}
                </span>
              )}
              <span
                style={{
                  fontSize: "0.625rem",
                  color: "var(--color-text-tertiary)",
                  border: "1px solid var(--color-border)",
                  padding: "1px 6px",
                  borderRadius: 4,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {person.countryCode}
              </span>
            </div>
          </div>
        </div>

        {/* LinkedIn link */}
        <a
          href={`https://linkedin.com/in/${linkedInSlug(person.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            marginTop: 12,
            fontSize: "0.6875rem",
            color: "#60A5FA",
            textDecoration: "none",
            opacity: 0.8,
          }}
        >
          <ExternalLink size={11} />
          linkedin.com/in/{linkedInSlug(person.name)}
          <span style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}>(illustrative)</span>
        </a>
      </div>

      {/* ── Stats row ──────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <StatBox label="Influence" value={String(person.influenceScore)} />
        <StatBox
          label="Engagements"
          value={String(person.engagementCount)}
          divider
        />
        <StatBox
          label="Last touch"
          value={daysSinceTouch !== null ? `${daysSinceTouch}d` : "—"}
          valueColor={daysSinceTouch !== null && daysSinceTouch > 45 ? "#EF4444" : undefined}
          divider
        />
      </div>

      {/* ── Body sections ─────────────────────────────────────── */}
      <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Public stance */}
        {person.publicStance && (
          <PanelSection icon={<Award size={12} />} title="Public Stance">
            <p className="pull-quote">{person.publicStance}</p>
          </PanelSection>
        )}

        {/* Career */}
        {(person.priorEmployers?.length > 0 || person.education?.length > 0) && (
          <PanelSection icon={<Briefcase size={12} />} title="Background">
            {person.priorEmployers?.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <p style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", marginBottom: 5 }}>PRIOR EMPLOYERS</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {person.priorEmployers.map((e, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--color-text-secondary)",
                        backgroundColor: "var(--color-elevated)",
                        border: "1px solid var(--color-border)",
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(person.education) && person.education.length > 0 && (
              <div>
                <p style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", marginBottom: 5 }}>EDUCATION</p>
                <p style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>
                  {person.education.join(" · ")}
                </p>
              </div>
            )}
            {Array.isArray(person.boardSeats) && person.boardSeats.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", marginBottom: 5 }}>BOARD SEATS</p>
                <p style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>
                  {person.boardSeats.join(" · ")}
                </p>
              </div>
            )}
          </PanelSection>
        )}

        {/* Warm intro paths */}
        <PanelSection icon={<GitBranch size={12} />} title="Warm Intro Paths">
          {warmPaths.length === 0 ? (
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-tertiary)" }}>No warm paths — no mutual connections found within 3 hops.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {warmPaths.slice(0, 3).map((path, i) => {
                const scoreBar = Math.round((path.score / (warmPaths[0]?.score || 1)) * 100);
                const names = path.path.map((id) => {
                  const p = allPeople.find((x) => x.id === id);
                  return p ? p.name.split(" ")[0] : id;
                });
                return (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "var(--color-elevated)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: "0.625rem", fontWeight: 600, color: "var(--color-ember)" }}>
                        {path.hops} hop{path.hops !== 1 ? "s" : ""}
                      </span>
                      <span style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>
                        {Math.round(path.score * 10) / 10}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>
                      {names.join(" → ")}
                    </p>
                    <div style={{ marginTop: 6 }}>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${scoreBar}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PanelSection>

        {/* Recent intel from account */}
        {intel.length > 0 && (
          <PanelSection icon={<Clock size={12} />} title="Account Intel">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {intel.map((item) => (
                <div
                  key={item.id}
                  className="intel-note"
                  style={{ borderLeftColor: (item as { isNew?: boolean }).isNew ? "var(--color-ember)" : "var(--color-border-mid)" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.625rem", fontWeight: 600, color: "var(--color-text-tertiary)" }}>
                      {item.author}
                    </span>
                    <span style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>
                      {item.date}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", lineHeight: 1.55 }}>
                    {(item as { text?: string; body?: string }).text ?? (item as { body?: string }).body}
                  </p>
                </div>
              ))}
            </div>
          </PanelSection>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid var(--color-border)" }}>
        <p style={{ fontSize: "0.5625rem", color: "var(--color-text-muted)", textAlign: "center" }}>
          Illustrative data — with live CRM this populates from Salesforce
        </p>
      </div>
    </div>
  );
}

// ── Helper sub-components ─────────────────────────────────────────────────

function StatBox({
  label, value, valueColor, divider,
}: {
  label: string;
  value: string;
  valueColor?: string;
  divider?: boolean;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderLeft: divider ? "1px solid var(--color-border)" : undefined,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <span style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "1.125rem",
          fontWeight: 700,
          color: valueColor ?? "var(--color-text-primary)",
          lineHeight: 1.2,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function PanelSection({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
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
