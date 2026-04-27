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

// ── DiceBear avatar ───────────────────────────────────────────────────────
function avatarUrl(name: string): string {
  return `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(name)}&backgroundColor=1C1C22`;
}

// ── LinkedIn slug ─────────────────────────────────────────────────────────
function linkedInSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ── Country hub metadata ──────────────────────────────────────────────────
const COUNTRY_LABELS: Record<string, string> = {
  AU: "Australia", SG: "Singapore", JP: "Japan", KR: "South Korea",
  IN: "India", ID: "Indonesia", NZ: "New Zealand", MY: "Malaysia",
  PH: "Philippines", TH: "Thailand", VN: "Vietnam", TW: "Taiwan", HK: "Hong Kong",
};

const COUNTRY_HUB_R = 18;

// ── Node radius formula ───────────────────────────────────────────────────
function nodeRadius(degree: number, influenceScore: number): number {
  const r = 4 + Math.log2(degree + 1) * 2.2 + influenceScore * 0.06;
  return Math.max(4, Math.min(14, r));
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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

  // Graph data: country hub nodes + person nodes + country-person edges + relationship edges
  const graphData = useMemo(() => {
    // Collect which countries are present in filtered set
    const countriesPresent = new Set(filteredPeople.map((p) => p.countryCode));

    // Country hub nodes
    const hubNodes = [...countriesPresent].map((code) => ({
      id: `__hub_${code}`,
      isHub: true,
      countryCode: code,
      label: COUNTRY_LABELS[code] ?? code,
      name: COUNTRY_LABELS[code] ?? code,
      firstName: code,
      crmStatus: "cold" as const,
      influenceScore: 0,
      accountId: "",
    }));

    // Person nodes
    const personNodes = filteredPeople.map((p) => ({
      id: p.id,
      isHub: false,
      name: p.name,
      firstName: p.name.split(" ")[0],
      crmStatus: p.crmStatus,
      influenceScore: p.influenceScore,
      countryCode: p.countryCode,
      accountId: p.accountId,
    }));

    // Relationship edges (person ↔ person)
    const relLinks = (allEdges as Edge[])
      .filter((e) => filteredIds.has(e.sourceId) && filteredIds.has(e.targetId))
      .map((e) => ({
        source: e.sourceId,
        target: e.targetId,
        type: e.type,
        strength: e.strength,
        id: e.id,
        isHubLink: false,
      }));

    // Hub edges (person → country hub)
    const hubLinks = filteredPeople.map((p) => ({
      source: p.id,
      target: `__hub_${p.countryCode}`,
      type: "__hub",
      strength: 1,
      id: `__hub_link_${p.id}`,
      isHubLink: true,
    }));

    return { nodes: [...hubNodes, ...personNodes], links: [...relLinks, ...hubLinks] };
  }, [filteredPeople, filteredIds]);

  // Adjacency maps derived from graphData (relationship edges only — exclude hub links)
  const { degreeMap, neighborMap } = useMemo(() => {
    const deg = new Map<string, number>();
    const nbr = new Map<string, Set<string>>();
    for (const n of graphData.nodes) {
      deg.set(n.id as string, 0);
      nbr.set(n.id as string, new Set());
    }
    for (const l of graphData.links) {
      if (l.isHubLink) continue;
      const src = l.source as string;
      const tgt = l.target as string;
      deg.set(src, (deg.get(src) ?? 0) + 1);
      deg.set(tgt, (deg.get(tgt) ?? 0) + 1);
      nbr.get(src)?.add(tgt);
      nbr.get(tgt)?.add(src);
    }
    return { degreeMap: deg, neighborMap: nbr };
  }, [graphData]);

  // Set up forces when graphData changes
  useEffect(() => {
    const g = graphRef.current;
    if (!g) return;

    g.d3Force("charge")?.strength(-250).distanceMax(600);
    g.d3Force("link")?.distance((link: { isHubLink?: boolean }) =>
      link.isHubLink ? 80 : 40
    ).strength((link: { isHubLink?: boolean }) =>
      link.isHubLink ? 0.15 : 0.8
    );
    g.d3Force("center")?.strength(0.03);

    // Custom collision force — keeps nodes from overlapping
    const collideForce = () => {
      const nodes = graphData.nodes as Array<{ id: string; isHub?: boolean; x?: number; y?: number; vx?: number; vy?: number; influenceScore: number }>;
      const degMap = degreeMap;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = (b.x ?? 0) - (a.x ?? 0);
          const dy = (b.y ?? 0) - (a.y ?? 0);
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const ra = a.isHub ? COUNTRY_HUB_R + 8 : nodeRadius(degMap.get(a.id) ?? 0, a.influenceScore) + 3;
          const rb = b.isHub ? COUNTRY_HUB_R + 8 : nodeRadius(degMap.get(b.id) ?? 0, b.influenceScore) + 3;
          const minDist = ra + rb;
          if (dist < minDist) {
            const push = ((minDist - dist) / dist) * 0.45;
            const fx = dx * push;
            const fy = dy * push;
            a.vx = (a.vx ?? 0) - fx;
            a.vy = (a.vy ?? 0) - fy;
            b.vx = (b.vx ?? 0) + fx;
            b.vy = (b.vy ?? 0) + fy;
          }
        }
      }
    };

    g.d3Force("collide", collideForce);
    engineStoppedRef.current = false;
    g.d3ReheatSimulation();
  }, [graphData, degreeMap]);

  // Auto-fit when simulation settles
  const handleEngineStop = useCallback(() => {
    if (engineStoppedRef.current || !graphRef.current) return;
    engineStoppedRef.current = true;
    graphRef.current.zoomToFit(500, 60);
  }, []);

  // Warm paths for selected person
  const warmPaths = useMemo(() => {
    if (!selectedPerson) return [];
    return findWarmPaths(selectedPerson.id, allPeople, allEdges, 3, 3);
  }, [selectedPerson]);

  // Active focus: selected person (persistent) or hovered (transient)
  const focusId = selectedPerson?.id ?? hoveredId;

  // Focus set: focusId + its 1-hop neighbors
  const focusSet = useMemo((): Set<string> | null => {
    if (!focusId) return null;
    const set = new Set<string>([focusId]);
    for (const nb of neighborMap.get(focusId) ?? []) set.add(nb);
    return set;
  }, [focusId, neighborMap]);

  // ── Node canvas rendering ─────────────────────────────────────────────
  const nodeCanvasObject = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const nodeId = String(node.id);
      const x = node.x as number;
      const y = node.y as number;
      if (!isFinite(x) || !isFinite(y)) return;

      // Country hub rendering
      if ((node as { isHub?: boolean }).isHub) {
        const countryCode = (node as { countryCode?: string }).countryCode ?? "";
        const label = (node as { label?: string }).label ?? countryCode;
        ctx.save();

        // Outer glow halo
        const glowGrad = ctx.createRadialGradient(x, y, COUNTRY_HUB_R, x, y, COUNTRY_HUB_R + 14);
        glowGrad.addColorStop(0, "rgba(255,255,255,0.07)");
        glowGrad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.arc(x, y, COUNTRY_HUB_R + 14, 0, 2 * Math.PI);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // Hub circle fill
        ctx.beginPath();
        ctx.arc(x, y, COUNTRY_HUB_R, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255,255,255,0.07)";
        ctx.fill();

        // Hub ring
        ctx.strokeStyle = "rgba(255,255,255,0.45)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Country code — centered inside circle
        ctx.font = `700 9px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(230,230,240,0.9)";
        ctx.fillText(countryCode, x, y);

        // Country name — below the circle
        ctx.font = `500 8px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.fillStyle = "rgba(160,160,180,0.75)";
        ctx.fillText(label, x, y + COUNTRY_HUB_R + 10);

        ctx.restore();
        return;
      }

      const isSelected = selectedPerson?.id === nodeId;
      const inFocus = !focusSet || focusSet.has(nodeId);
      const isDimmed = !inFocus;

      const degree = degreeMap.get(nodeId) ?? 0;
      const r = nodeRadius(degree, node.influenceScore as number);
      const color = CRM_COLORS[(node.crmStatus as string)] ?? "#6B7280";

      // Selected glow ring
      if (isSelected) {
        const glowR = r + 10;
        const gradient = ctx.createRadialGradient(x, y, r, x, y, glowR);
        gradient.addColorStop(0, `${color}40`);
        gradient.addColorStop(1, `${color}00`);
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, glowR, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      }

      // Node fill
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      if (isDimmed) {
        ctx.fillStyle = `${color}1A`;
      } else if (isSelected) {
        ctx.fillStyle = color;
      } else {
        ctx.fillStyle = `${color}CC`;
      }
      ctx.fill();

      // Stroke only for selected
      if (isSelected) {
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();

      // Label — to the right of the node
      const showLabel = globalScale > 0.7 || inFocus;
      if (showLabel) {
        const fontSize = Math.max(9, Math.min(13, 11 / globalScale));
        ctx.save();
        ctx.font = `${isSelected ? "600" : "500"} ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isDimmed
          ? "rgba(46,46,58,0.5)"
          : isSelected
          ? "#F0F0F4"
          : "rgba(190,190,205,0.85)";
        ctx.fillText(node.firstName as string, x + r + 4, y + 0.5);
        ctx.restore();
      }
    },
    [selectedPerson, focusSet, degreeMap]
  );

  // Pointer hit area (slightly larger than visual; hubs are not interactive)
  const nodePointerAreaPaint = useCallback(
    (node: NodeObject, color: string, ctx: CanvasRenderingContext2D) => {
      if ((node as { isHub?: boolean }).isHub) return;
      const nx = node.x as number;
      const ny = node.y as number;
      if (!isFinite(nx) || !isFinite(ny)) return;
      const degree = degreeMap.get(String(node.id)) ?? 0;
      const r = nodeRadius(degree, node.influenceScore as number) + 5;
      ctx.beginPath();
      ctx.arc(nx, ny, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    },
    [degreeMap]
  );

  // Link rendering
  const linkColor = useCallback(
    (link: LinkObject) => {
      // Hub links are structural only — render invisible
      if ((link as { isHubLink?: boolean }).isHubLink) return "rgba(0,0,0,0)";
      const base = EDGE_COLORS[(link.type as string)] ?? "#52525B";
      if (!focusSet) return `${base}1F`;
      const srcId = String((link.source as NodeObject).id);
      const tgtId = String((link.target as NodeObject).id);
      const bright = focusSet.has(srcId) && focusSet.has(tgtId);
      return bright ? `${base}AA` : `${base}0A`;
    },
    [focusSet]
  );

  const linkWidth = useCallback(
    (link: LinkObject) => 0.6 + ((link.strength as number) ?? 1) * 0.4,
    []
  );

  // Click / hover handlers
  const handleNodeClick = useCallback((node: NodeObject) => {
    if ((node as { isHub?: boolean }).isHub) return;
    const person = allPeople.find((p) => p.id === String(node.id)) ?? null;
    setSelectedPerson((prev) => (prev?.id === String(node.id) ? null : person));
  }, []);

  const handleNodeHover = useCallback((node: NodeObject | null) => {
    if (node && (node as { isHub?: boolean }).isHub) return;
    setHoveredId(node ? String(node.id) : null);
  }, []);

  // Unique edge types for legend (exclude hub links)
  const visibleEdgeTypes = useMemo(() => {
    const seen = new Set<string>();
    const result: { type: string; color: string; label: string }[] = [];
    for (const link of graphData.links) {
      if (link.isHubLink) continue;
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
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onBackgroundClick={() => { setSelectedPerson(null); setHoveredId(null); }}
        onEngineStop={handleEngineStop}
        warmupTicks={300}
        cooldownTicks={120}
        cooldownTime={5000}
        numDimensions={2}
        enableNodeDrag={true}
        d3AlphaDecay={0.018}
        d3VelocityDecay={0.4}
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
