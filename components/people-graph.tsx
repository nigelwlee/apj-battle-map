"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import type { NodeObject, LinkObject } from "react-force-graph-2d";
import { people, edges, accounts, getIntelByAccount } from "@/lib/data";
import { findWarmPaths } from "@/lib/warm-paths";
import type { Person, Edge, WarmPath } from "@/lib/types";
import { X, GitBranch, Clock, Briefcase, ExternalLink, Award } from "lucide-react";

const GEO_URL = "/geo/world-110m.json";

// react-simple-maps default internal SVG dimensions
const SVG_W = 800;
const SVG_H = 600;

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => null,
});

export const CRM_COLORS: Record<string, string> = {
  champion: "#22C55E",
  meeting_held: "#3B82F6",
  contacted: "#F59E0B",
  cold: "#6B7280",
  detractor: "#EF4444",
};

const CRM_LABELS: Record<string, string> = {
  champion: "Champion",
  meeting_held: "Meeting Held",
  contacted: "Contacted",
  cold: "Cold",
  detractor: "Detractor",
};

const EDGE_COLORS: Record<string, string> = {
  co_worked: "#E8681A",
  board: "#8B5CF6",
  alumni: "#3B82F6",
  co_author: "#06B6D4",
  co_panelist: "#52525B",
};

const COMPANY_SHORT: Record<string, string> = {
  "acc-macquarie": "Macquarie",
  "acc-atlassian": "Atlassian",
  "acc-commonwealth-bank": "CommBank",
  "acc-woodside": "Woodside",
  "acc-telstra": "Telstra",
  "acc-dbs": "DBS",
  "acc-singtel": "Singtel",
  "acc-grab": "Grab",
  "acc-softbank": "SoftBank",
  "acc-toyota": "Toyota",
  "acc-samsung-sdi": "Samsung SDI",
  "acc-kakao": "Kakao",
  "acc-infosys": "Infosys",
  "acc-hdfc": "HDFC",
  "acc-bca": "BCA",
  "acc-telkom-id": "Telkom",
  "acc-petronas": "Petronas",
  "acc-bdo": "BDO",
  "acc-scb": "SCB X",
  "acc-anz-nz": "ANZ NZ",
};

// APJ ISO numeric codes for world map background
const APJ_ISO = new Set(["036","554","392","410","360","356","458","608","764","704"]);
const SINGAPORE_MARKER: [number, number] = [103.8198, 1.3521];

// ── Geographic projection ────────────────────────────────────────────────────
// Mercator matching react-simple-maps projectionConfig={{ scale:520, center:[128,-8] }}
// Outputs coordinates in the 800×600 SVG internal space.
function projectMercator(lng: number, lat: number): [number, number] {
  const scale = 520;
  const lam = lng * Math.PI / 180;
  const phi = lat * Math.PI / 180;
  const lam0 = 128 * Math.PI / 180;
  const phi0 = -8 * Math.PI / 180;
  const rawY = Math.log(Math.tan(Math.PI / 4 + phi / 2));
  const rawY0 = Math.log(Math.tan(Math.PI / 4 + phi0 / 2));
  const x = scale * lam + (SVG_W / 2 - scale * lam0);
  const y = -scale * rawY + (SVG_H / 2 + scale * rawY0);
  return [x, y];
}

// Country centroid coordinates [lng, lat]
const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  AU: [133.77, -25.27],
  NZ: [172.50, -41.50],
  JP: [138.25,  36.20],
  KR: [127.77,  35.91],
  SG: [103.82,   1.35],
  ID: [113.92,  -2.00],
  IN: [ 78.96,  20.59],
  MY: [109.70,   4.21],
  PH: [121.77,  12.88],
  TH: [100.99,  15.87],
  VN: [108.28,  14.06],
};

// Deterministic jitter so people from same country don't stack (pure hash, no Math.random)
function nodeJitter(id: string, axis: "x" | "y", range: number): number {
  let h = axis === "x" ? 0x811c9dc5 : 0xcbf29ce4;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return ((h & 0xffff) / 0xffff - 0.5) * range;
}

interface PeopleGraphProps {
  filterCountry?: string;
  filterCrm?: string;
}

export default function PeopleGraph({ filterCountry, filterCrm }: PeopleGraphProps) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const cameraSetRef = useRef(false);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        setDimensions({ width: w, height: h });
        cameraSetRef.current = false; // re-calibrate on resize
      }
    };
    update();
    const obs = new ResizeObserver(update);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      if (filterCountry && filterCountry !== "all" && p.countryCode !== filterCountry) return false;
      if (filterCrm && filterCrm !== "all" && p.crmStatus !== filterCrm) return false;
      return true;
    });
  }, [filterCountry, filterCrm]);

  const filteredIds = useMemo(() => new Set(filteredPeople.map((p) => p.id)), [filteredPeople]);

  // Compute SVG-space node positions; convert to force graph coords (origin at center)
  const graphData = useMemo(() => {
    const nodes = filteredPeople.map((p) => {
      const centroid = COUNTRY_CENTROIDS[p.countryCode] ?? [128, -8];
      const [svgX, svgY] = projectMercator(centroid[0], centroid[1]);
      // Jitter spread: 60px x, 40px y — enough to separate 3–5 people per country
      const fx = svgX - SVG_W / 2 + nodeJitter(p.id, "x", 60);
      const fy = svgY - SVG_H / 2 + nodeJitter(p.id, "y", 40);
      return {
        id: p.id,
        name: p.name,
        firstName: p.name.split(" ")[0],
        company: COMPANY_SHORT[p.accountId] ?? p.accountId,
        title: p.title,
        crmStatus: p.crmStatus,
        influenceScore: p.influenceScore,
        countryCode: p.countryCode,
        accountId: p.accountId,
        val: Math.max(5, p.influenceScore / 10),
        fx,
        fy,
      };
    });

    const links = (edges as Edge[])
      .filter((e) => filteredIds.has(e.sourceId) && filteredIds.has(e.targetId))
      .map((e) => ({
        source: e.sourceId,
        target: e.targetId,
        type: e.type,
        strength: e.strength,
        provenance: e.provenance,
        id: e.id,
      }));

    return { nodes, links };
  }, [filteredPeople, filteredIds]);

  // Calibrate camera once after engine stops: zoom to match SVG scale + center on SVG origin
  const handleEngineStop = useCallback(() => {
    if (cameraSetRef.current || !graphRef.current) return;
    cameraSetRef.current = true;
    const { width: W, height: H } = dimensions;
    // SVG scales to fill container (preserveAspectRatio="xMidYMid meet")
    const svgScale = Math.min(W / SVG_W, H / SVG_H);
    graphRef.current.zoom(svgScale, 0);
    graphRef.current.centerAt(0, 0, 0);
  }, [dimensions]);

  const warmPaths = useMemo(() => {
    if (!selectedPerson) return [];
    return findWarmPaths(selectedPerson.id, people, edges, 3, 3);
  }, [selectedPerson]);

  const warmPathNodeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const path of warmPaths) for (const id of path.path) ids.add(id);
    return ids;
  }, [warmPaths]);

  const nodeCanvasObject = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const r = Math.max(6, (node.influenceScore as number) / 9);
      const color = CRM_COLORS[node.crmStatus as string] ?? "#6B7280";
      const nodeId = String(node.id);
      const isSelected = selectedPerson?.id === nodeId;
      const isInPath = warmPathNodeIds.has(nodeId);
      const x = node.x as number;
      const y = node.y as number;

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, r + 8, 0, 2 * Math.PI);
        ctx.fillStyle = `${color}22`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, r + 4, 0, 2 * Math.PI);
        ctx.strokeStyle = `${color}80`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (isInPath) {
        ctx.beginPath();
        ctx.arc(x, y, r + 5, 0, 2 * Math.PI);
        ctx.fillStyle = `${color}18`;
        ctx.fill();
      }

      // Main circle
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? color : `${color}D0`;
      ctx.fill();
      ctx.strokeStyle = isSelected ? "#FAFAFA" : `${color}50`;
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      // Initials inside circle
      const initFontSize = Math.max(5, r * 0.65);
      ctx.font = `700 ${initFontSize}px -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = isSelected ? "#FAFAFA" : "#FAFAFA99";
      const initials = (node.name as string).split(" ").map((w: string) => w[0]).join("").slice(0, 2);
      ctx.fillText(initials, x, y);
      ctx.textBaseline = "alphabetic";

      // First name above
      const fontSize = Math.max(9, 10 / globalScale);
      ctx.font = `600 ${fontSize}px -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = isSelected ? "#FAFAFA" : "#D4D4D8";
      ctx.fillText(node.firstName as string, x, y - r - 4);

      // Company below (muted)
      const compFontSize = Math.max(7, 8 / globalScale);
      ctx.font = `${compFontSize}px -apple-system, sans-serif`;
      ctx.fillStyle = isSelected ? `${color}FF` : "#71717A";
      ctx.fillText(node.company as string, x, y + r + compFontSize + 3);
    },
    [selectedPerson, warmPathNodeIds]
  );

  const linkColor = useCallback(
    (link: LinkObject) => `${EDGE_COLORS[link.type as string] ?? "#52525B"}90`,
    []
  );

  const linkWidth = useCallback(
    (link: LinkObject) => ((link.strength as number) ?? 1) * 1.2,
    []
  );

  const handleNodeClick = useCallback((node: NodeObject) => {
    const nodeId = String(node.id);
    const person = people.find((p) => p.id === nodeId) ?? null;
    setSelectedPerson((prev) => (prev?.id === nodeId ? null : person));
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">

      {/* ── Layer 1: World map background ──────────────────────────────────── */}
      <div className="absolute inset-0">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 520, center: [128, -8] }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoId = (geo as { id: string }).id;
                const rsmKey = (geo as { rsmKey: string }).rsmKey;
                const isAPJ = APJ_ISO.has(geoId);
                return (
                  <Geography
                    key={rsmKey}
                    geography={geo}
                    fill={isAPJ ? "#1A1A1F" : "#0F0F11"}
                    stroke={isAPJ ? "#2A2A32" : "#151517"}
                    strokeWidth={isAPJ ? 0.7 : 0.3}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
          <Marker coordinates={SINGAPORE_MARKER}>
            <circle r={3} fill="#1A1A1F" stroke="#2A2A32" strokeWidth={0.7} />
          </Marker>
        </ComposableMap>
      </div>

      {/* ── Layer 2: Country labels ──────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { label: "AUSTRALIA", style: { bottom: "21%", right: "27%" } },
          { label: "SG",        style: { top: "46%", left: "46%" } },
          { label: "JAPAN",     style: { top: "10%", right: "17%" } },
          { label: "INDIA",     style: { top: "27%", left: "17%" } },
          { label: "INDONESIA", style: { top: "54%", left: "49%" } },
          { label: "KOREA",     style: { top: "14%", right: "23%" } },
          { label: "MALAYSIA",  style: { top: "49%", left: "43%" } },
          { label: "NZ",        style: { bottom: "13%", right: "16%" } },
        ].map((c) => (
          <span
            key={c.label}
            className="absolute"
            style={{
              ...c.style,
              fontSize: "0.375rem",
              letterSpacing: "0.18em",
              color: "rgba(113,113,122,0.25)",
              fontWeight: 700,
              textTransform: "uppercase",
              fontFamily: "var(--font-geist-mono)",
            }}
          >
            {c.label}
          </span>
        ))}
      </div>

      {/* ── Layer 3: Force graph ─────────────────────────────────────────── */}
      <div className="absolute inset-0">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="transparent"
          nodeCanvasObject={nodeCanvasObject}
          nodeCanvasObjectMode={() => "replace"}
          linkColor={linkColor}
          linkWidth={linkWidth}
          onNodeClick={handleNodeClick}
          onBackgroundClick={() => setSelectedPerson(null)}
          onEngineStop={handleEngineStop}
          warmupTicks={0}
          cooldownTicks={0}
          numDimensions={2}
          enableNodeDrag={false}
          d3AlphaDecay={1}
          d3VelocityDecay={1}
        />
      </div>

      {/* ── Layer 4: Legend ──────────────────────────────────────────────── */}
      <div
        className="absolute bottom-3 left-3 flex flex-col gap-3 p-3 rounded"
        style={{
          backgroundColor: "rgba(9,9,11,0.88)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div>
          <p style={{ fontSize: "0.4375rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-text-tertiary)", textTransform: "uppercase", marginBottom: 6 }}>
            CRM Status
          </p>
          {Object.entries(CRM_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5 mb-1">
              <div className="rounded-full" style={{ width: 7, height: 7, backgroundColor: color }} />
              <span style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}>
                {CRM_LABELS[status]}
              </span>
            </div>
          ))}
        </div>
        <div>
          <p style={{ fontSize: "0.4375rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-text-tertiary)", textTransform: "uppercase", marginBottom: 6 }}>
            Edge Type
          </p>
          {Object.entries(EDGE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5 mb-1">
              <div style={{ width: 14, height: 2, backgroundColor: color, borderRadius: 1 }} />
              <span style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}>
                {type.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Layer 5: Person detail panel ────────────────────────────────── */}
      {selectedPerson && (
        <div
          className="absolute top-0 right-0 bottom-0 drawer-enter overflow-y-auto"
          style={{
            width: 360,
            backgroundColor: "rgba(18,18,21,0.98)",
            borderLeft: "1px solid var(--color-border)",
          }}
        >
          <PersonPanel
            person={selectedPerson}
            warmPaths={warmPaths}
            onClose={() => setSelectedPerson(null)}
          />
        </div>
      )}

      {/* Node count badge */}
      <div
        className="absolute top-3 left-3 flex items-center gap-1.5 rounded px-2.5 py-1.5"
        style={{
          backgroundColor: "rgba(9,9,11,0.88)",
          border: "1px solid var(--color-border)",
          fontSize: "0.5625rem",
          color: "var(--color-text-tertiary)",
        }}
      >
        <span style={{ fontFamily: "var(--font-geist-mono)", color: "var(--color-text-primary)" }}>
          {filteredPeople.length}
        </span>{" "}
        people ·{" "}
        <span style={{ fontFamily: "var(--font-geist-mono)", color: "var(--color-text-primary)" }}>
          {graphData.links.length}
        </span>{" "}
        connections
      </div>
    </div>
  );
}

// ─── Person Detail Panel ──────────────────────────────────────────────────────

function avatarUrl(name: string): string {
  // DiceBear notionists-neutral — professional illustration portraits, deterministic from name
  return `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(name)}&backgroundColor=27272a`;
}

function linkedinSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function PersonPanel({
  person,
  warmPaths,
  onClose,
}: {
  person: Person;
  warmPaths: WarmPath[];
  onClose: () => void;
}) {
  const color = CRM_COLORS[person.crmStatus] ?? "#6B7280";
  const account = accounts.find((a) => a.id === person.accountId);
  const intel = getIntelByAccount(person.accountId).slice(0, 4);
  const companyName = account ? (COMPANY_SHORT[account.id] ?? account.name) : "";
  const linkedInUrl = `https://linkedin.com/in/${linkedinSlug(person.name)}`;

  const daysSinceTouch = person.lastEngagement
    ? Math.floor(
        (new Date("2026-04-26").getTime() - new Date(person.lastEngagement).getTime()) /
          86400000
      )
    : null;

  return (
    <div>
      {/* ── Hero header ─────────────────────────────────────────────── */}
      <div
        className="relative p-5"
        style={{
          background: `linear-gradient(160deg, ${color}14 0%, transparent 60%)`,
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="btn btn-ghost p-1 absolute top-4 right-4"
          style={{ border: "none" }}
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="shrink-0 rounded-lg overflow-hidden"
            style={{
              width: 72,
              height: 72,
              border: `2px solid ${color}40`,
              backgroundColor: "#27272A",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl(person.name)}
              alt={person.name}
              width={72}
              height={72}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                // Fallback: initials
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0 mt-0.5">
            <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.2 }}>
              {person.name}
            </h2>
            <p style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", marginTop: 2, lineHeight: 1.4 }}>
              {person.title}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className="pill"
                style={{ backgroundColor: `${color}18`, color, fontSize: "0.5rem", padding: "2px 6px" }}
              >
                {CRM_LABELS[person.crmStatus]}
              </span>
              {companyName && (
                <span style={{ fontSize: "0.5625rem", color: "var(--color-ember)", fontWeight: 600 }}>
                  {companyName}
                </span>
              )}
              <span
                style={{
                  fontSize: "0.5rem",
                  color: "var(--color-text-tertiary)",
                  letterSpacing: "0.06em",
                  border: "1px solid var(--color-border-subtle)",
                  padding: "1px 5px",
                  borderRadius: 2,
                }}
              >
                {person.countryCode}
              </span>
            </div>
          </div>
        </div>

        {/* LinkedIn stub */}
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 mt-3"
          style={{ fontSize: "0.5625rem", color: "#60A5FA", textDecoration: "none" }}
        >
          <ExternalLink size={10} />
          {linkedInUrl.replace("https://", "")}
          <span style={{ color: "var(--color-text-tertiary)", fontSize: "0.5rem" }}>(illustrative)</span>
        </a>
      </div>

      {/* ── Stats row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-0" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
        <StatBox
          label="Influence"
          value={
            <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              {person.influenceScore}
            </span>
          }
        />
        <StatBox
          label="Engagements"
          value={
            <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              {person.engagementCount}
            </span>
          }
          border
        />
        <StatBox
          label="Last touch"
          value={
            <span
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: daysSinceTouch !== null && daysSinceTouch > 45 ? "#EF4444" : "var(--color-text-primary)",
              }}
            >
              {daysSinceTouch !== null ? `${daysSinceTouch}d` : "—"}
            </span>
          }
          border
        />
      </div>

      <div className="p-4 space-y-5">

        {/* ── Career ──────────────────────────────────────────────── */}
        <Section icon={<Briefcase size={11} />} title="Career">
          {/* Education */}
          <div className="flex items-start gap-2 mb-3">
            <div
              className="shrink-0 rounded"
              style={{ width: 6, height: 6, backgroundColor: "#8B5CF6", marginTop: 4 }}
            />
            <div>
              <p style={{ fontSize: "0.625rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                {person.education}
              </p>
              <p style={{ fontSize: "0.5rem", color: "var(--color-text-tertiary)" }}>Education</p>
            </div>
          </div>

          {/* Career timeline: priorEmployers → current */}
          <div className="relative ml-3 pl-3" style={{ borderLeft: "1px solid var(--color-border-subtle)" }}>
            {person.priorEmployers.map((emp, i) => (
              <div key={i} className="mb-2 relative">
                <div
                  className="absolute rounded-full"
                  style={{ width: 5, height: 5, backgroundColor: "var(--color-border)", left: -5, top: 4 }}
                />
                <p style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}>{emp}</p>
              </div>
            ))}
            <div className="relative">
              <div
                className="absolute rounded-full"
                style={{ width: 6, height: 6, backgroundColor: "var(--color-ember)", left: -5.5, top: 3 }}
              />
              <p style={{ fontSize: "0.5625rem", fontWeight: 600, color: "var(--color-ember)" }}>
                {companyName} <span style={{ fontWeight: 400, color: "var(--color-text-tertiary)" }}>· {person.tenureYears}yr</span>
              </p>
            </div>
          </div>

          {/* Board seats */}
          {person.boardSeats.length > 0 && (
            <div className="flex items-start gap-2 mt-3">
              <Award size={10} style={{ color: "#F59E0B", marginTop: 2, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "0.5rem", color: "var(--color-text-tertiary)", marginBottom: 3 }}>Board / Advisory</p>
                <div className="flex flex-wrap gap-1">
                  {person.boardSeats.map((seat) => (
                    <span
                      key={seat}
                      style={{
                        fontSize: "0.5rem",
                        padding: "1px 5px",
                        backgroundColor: "rgba(245,158,11,0.1)",
                        color: "#F59E0B",
                        borderRadius: 2,
                        border: "1px solid rgba(245,158,11,0.2)",
                      }}
                    >
                      {seat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ── AI Stance ───────────────────────────────────────────── */}
        <Section title="AI Stance">
          <div
            className="rounded p-3"
            style={{
              backgroundColor: "#1A1A1D",
              border: "1px solid var(--color-border-subtle)",
              borderLeft: `3px solid ${color}`,
            }}
          >
            <p style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", lineHeight: 1.6, fontStyle: "italic" }}>
              &ldquo;{person.publicStance}&rdquo;
            </p>
          </div>
        </Section>

        {/* ── CRM Notes ───────────────────────────────────────────── */}
        {intel.length > 0 && (
          <Section icon={<Clock size={11} />} title="CRM Notes">
            <div className="space-y-2">
              {intel.map((item) => {
                const signalColor =
                  item.signal === "positive" ? "#22C55E" : item.signal === "negative" ? "#EF4444" : "#6B7280";
                return (
                  <div
                    key={item.id}
                    className="rounded p-2.5"
                    style={{
                      backgroundColor: "#15151A",
                      border: "1px solid var(--color-border-subtle)",
                      borderLeft: `2px solid ${signalColor}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontSize: "0.5rem", color: "var(--color-text-tertiary)", fontWeight: 600 }}>
                        {item.author}
                      </span>
                      <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.4375rem", color: "var(--color-text-tertiary)" }}>
                        {item.date}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.625rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                      {item.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Warm Paths ──────────────────────────────────────────── */}
        <Section icon={<GitBranch size={11} />} title="Warm-Intro Paths">
          {warmPaths.length === 0 ? (
            <p style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", lineHeight: 1.5 }}>
              No warm paths found — no mutual champions within 3 hops.
            </p>
          ) : (
            <div className="space-y-2">
              {warmPaths.map((path, i) => {
                const names = path.path.map((id) => {
                  const p = people.find((x) => x.id === id);
                  return p?.name.split(" ")[0] ?? id;
                });
                const scoreBar = Math.round((path.score / (warmPaths[0]?.score || 1)) * 100);
                return (
                  <div
                    key={i}
                    className="rounded p-2.5"
                    style={{
                      backgroundColor: "#15151A",
                      border: "1px solid var(--color-border-subtle)",
                      borderLeft: "3px solid var(--color-ember)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span style={{ fontSize: "0.5rem", fontWeight: 700, color: "var(--color-ember)" }}>
                        Path #{i + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <div style={{ width: 40, height: 3, backgroundColor: "#27272A", borderRadius: 2 }}>
                          <div style={{ height: "100%", width: `${scoreBar}%`, backgroundColor: "var(--color-ember)", borderRadius: 2 }} />
                        </div>
                        <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.4375rem", color: "var(--color-text-tertiary)" }}>
                          {path.hops}h
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.625rem", color: "var(--color-text-secondary)" }}>
                      {names.join(" → ")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        <p style={{ fontSize: "0.4375rem", color: "var(--color-text-tertiary)", textAlign: "center", paddingBottom: 4 }}>
          Illustrative data — architecture is what&apos;s real
        </p>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div
        className="flex items-center gap-1.5 mb-2.5 pb-1.5"
        style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
      >
        {icon && <span style={{ color: "var(--color-text-tertiary)" }}>{icon}</span>}
        <h4
          style={{
            fontSize: "0.5625rem",
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

function StatBox({ label, value, border }: { label: string; value: React.ReactNode; border?: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-3"
      style={{
        borderLeft: border ? "1px solid var(--color-border-subtle)" : undefined,
      }}
    >
      <div style={{ marginBottom: 2 }}>{value}</div>
      <p style={{ fontSize: "0.4375rem", color: "var(--color-text-tertiary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {label}
      </p>
    </div>
  );
}
