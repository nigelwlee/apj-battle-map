"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import type { NodeObject, LinkObject } from "react-force-graph-2d";
import { people, edges, accounts, getIntelByAccount } from "@/lib/data";
import { findWarmPaths } from "@/lib/warm-paths";
import type { Person, Edge, WarmPath } from "@/lib/types";
import { X, GitBranch, Clock, Briefcase } from "lucide-react";

const GEO_URL = "/geo/world-110m.json";

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

// Company short names for node labels
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

// APJ ISO numeric codes for the world map background
const APJ_ISO = new Set(["036","554","392","410","360","356","458","608","764","704"]);
const SINGAPORE_MARKER: [number, number] = [103.8198, 1.3521];

interface PeopleGraphProps {
  filterCountry?: string;
  filterCrm?: string;
}

export default function PeopleGraph({ filterCountry, filterCrm }: PeopleGraphProps) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [warmPaths, setWarmPaths] = useState<WarmPath[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
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

  const graphData = useMemo(() => {
    const nodes = filteredPeople.map((p) => ({
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
    }));

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

  useEffect(() => {
    if (!selectedPerson) { setWarmPaths([]); return; }
    setWarmPaths(findWarmPaths(selectedPerson.id, people, edges, 3, 3));
  }, [selectedPerson]);

  const warmPathNodeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const path of warmPaths) for (const id of path.path) ids.add(id);
    return ids;
  }, [warmPaths]);

  const nodeCanvasObject = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const r = Math.max(7, (node.influenceScore as number) / 9);
      const color = CRM_COLORS[node.crmStatus as string] ?? "#6B7280";
      const nodeId = String(node.id);
      const isSelected = selectedPerson?.id === nodeId;
      const isInPath = warmPathNodeIds.has(nodeId);
      const x = node.x as number;
      const y = node.y as number;

      // Outer glow ring for selected / warm path
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
      ctx.fillStyle = isSelected ? color : `${color}E0`;
      ctx.fill();
      ctx.strokeStyle = isSelected ? "#FAFAFA" : `${color}50`;
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      // First name — above node
      const fontSize = Math.max(10, 11 / globalScale);
      ctx.font = `600 ${fontSize}px -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = isSelected ? "#FAFAFA" : "#E4E4E7";
      ctx.fillText(node.firstName as string, x, y - r - 4);

      // Company — below node, smaller + muted
      const compFontSize = Math.max(8, 9 / globalScale);
      ctx.font = `${compFontSize}px -apple-system, sans-serif`;
      ctx.fillStyle = isSelected ? `${color}FF` : "#71717A";
      ctx.fillText(node.company as string, x, y + r + compFontSize + 2);
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

      {/* ── Layer 1: World map background ────────────────────────────────── */}
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
                    fill={isAPJ ? "#1E1E22" : "#111113"}
                    stroke={isAPJ ? "#2C2C32" : "#161618"}
                    strokeWidth={isAPJ ? 0.8 : 0.4}
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
          {/* SG marker */}
          <Marker coordinates={SINGAPORE_MARKER}>
            <circle r={3} fill="#1E1E22" stroke="#2C2C32" strokeWidth={0.8} />
          </Marker>
        </ComposableMap>
      </div>

      {/* ── Layer 2: Country labels (faint geographic anchors) ─────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { code: "AU", label: "AUSTRALIA", style: { bottom: "22%", right: "28%" } },
          { code: "SG", label: "SG", style: { top: "47%", left: "47%" } },
          { code: "JP", label: "JAPAN", style: { top: "12%", right: "18%" } },
          { code: "IN", label: "INDIA", style: { top: "28%", left: "18%" } },
          { code: "ID", label: "INDONESIA", style: { top: "55%", left: "50%" } },
          { code: "KR", label: "KOREA", style: { top: "15%", right: "24%" } },
          { code: "MY", label: "MALAYSIA", style: { top: "50%", left: "44%" } },
          { code: "NZ", label: "NZ", style: { bottom: "14%", right: "18%" } },
        ].map((c) => (
          <span
            key={c.code}
            className="absolute"
            style={{
              ...c.style,
              fontSize: "0.4375rem",
              letterSpacing: "0.15em",
              color: "rgba(113,113,122,0.3)",
              fontWeight: 700,
              textTransform: "uppercase",
              fontFamily: "var(--font-geist-mono)",
            }}
          >
            {c.label}
          </span>
        ))}
      </div>

      {/* ── Layer 3: Force graph (transparent canvas) ─────────────────── */}
      <div className="absolute inset-0">
        <ForceGraph2D
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
          warmupTicks={200}
          cooldownTicks={0}
          numDimensions={2}
          enableNodeDrag={true}
          d3AlphaDecay={0.015}
          d3VelocityDecay={0.5}
        />
      </div>

      {/* ── Layer 4: Legend ───────────────────────────────────────────── */}
      <div
        className="absolute bottom-3 left-3 flex flex-col gap-3 p-3 rounded"
        style={{
          backgroundColor: "rgba(9,9,11,0.85)",
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

      {/* ── Layer 5: Person detail panel ─────────────────────────────── */}
      {selectedPerson && (
        <div
          className="absolute top-0 right-0 bottom-0 drawer-enter overflow-y-auto"
          style={{
            width: 340,
            backgroundColor: "rgba(24,24,27,0.97)",
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
          backgroundColor: "rgba(9,9,11,0.85)",
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

  const daysSinceTouch = person.lastEngagement
    ? Math.floor(
        (new Date("2026-04-26").getTime() - new Date(person.lastEngagement).getTime()) /
          86400000
      )
    : null;

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className="rounded-full flex items-center justify-center shrink-0"
            style={{
              width: 40,
              height: 40,
              backgroundColor: `${color}18`,
              border: `2px solid ${color}50`,
            }}
          >
            <span style={{ fontSize: "1rem", fontWeight: 700, color }}>{person.name.slice(0, 1)}</span>
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--color-text-primary)", fontSize: "0.875rem" }}>
              {person.name}
            </p>
            <p style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", marginTop: 2 }}>
              {person.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="pill"
                style={{
                  backgroundColor: `${color}18`,
                  color,
                  fontSize: "0.5rem",
                  padding: "1px 5px",
                }}
              >
                {CRM_LABELS[person.crmStatus]}
              </span>
              {account && (
                <span style={{ fontSize: "0.5625rem", color: "var(--color-ember)" }}>
                  {COMPANY_SHORT[account.id] ?? account.name}
                </span>
              )}
              <span style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}>
                {person.countryCode}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="btn btn-ghost p-1"><X size={14} /></button>
      </div>

      {/* Last touch + influence */}
      <div className="grid grid-cols-3 gap-2">
        <StatBox
          label="Influence"
          value={
            <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "1rem", color: "var(--color-text-primary)" }}>
              {person.influenceScore}
            </span>
          }
        />
        <StatBox
          label="Touches"
          value={
            <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "1rem", color: "var(--color-text-primary)" }}>
              {person.engagementCount}
            </span>
          }
        />
        <StatBox
          label="Last touch"
          value={
            <span
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: "0.6875rem",
                color: daysSinceTouch !== null && daysSinceTouch > 45 ? "#EF4444" : "var(--color-text-primary)",
              }}
            >
              {daysSinceTouch !== null ? `${daysSinceTouch}d ago` : "Never"}
            </span>
          }
        />
      </div>

      {/* Background */}
      <Section icon={<Briefcase size={11} />} title="Background">
        <p style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
          {person.education}
        </p>
        <p style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)", marginTop: 4 }}>
          Prior: {person.priorEmployers.join(" → ")}
        </p>
        {person.boardSeats.length > 0 && (
          <p style={{ fontSize: "0.5625rem", color: "var(--color-ember)", marginTop: 4 }}>
            Board: {person.boardSeats.join(", ")}
          </p>
        )}
      </Section>

      {/* Public stance */}
      <Section title="Public Stance">
        <p className="pull-quote">{person.publicStance}</p>
      </Section>

      {/* CRM notes — intel from their account */}
      {intel.length > 0 && (
        <Section icon={<Clock size={11} />} title="CRM Intelligence">
          <div className="space-y-2">
            {intel.map((item) => {
              const signalColor =
                item.signal === "positive" ? "#22C55E" : item.signal === "negative" ? "#EF4444" : "#6B7280";
              return (
                <div
                  key={item.id}
                  className="rounded p-2"
                  style={{
                    backgroundColor: "#1C1C1F",
                    border: "1px solid var(--color-border-subtle)",
                    borderLeft: `2px solid ${signalColor}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: "0.5rem", color: "var(--color-text-tertiary)" }}>
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

      {/* Warm paths */}
      <Section icon={<GitBranch size={11} />} title="Warm-Intro Paths">
        {warmPaths.length === 0 ? (
          <p style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
            No warm paths — no mutual champions within 3 hops.
          </p>
        ) : (
          <div className="space-y-2">
            {warmPaths.map((path, i) => {
              const names = path.path.map((id) => {
                const p = people.find((x) => x.id === id);
                return p?.name.split(" ")[0] ?? id;
              });
              return (
                <div
                  key={i}
                  className="rounded p-2.5"
                  style={{
                    backgroundColor: "#1C1C1F",
                    border: "1px solid var(--color-border-subtle)",
                    borderLeft: "3px solid var(--color-ember)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: "0.5rem", fontWeight: 700, color: "var(--color-ember)" }}>
                      Path #{i + 1}
                    </span>
                    <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.4375rem", color: "var(--color-text-tertiary)" }}>
                      {path.hops} hop{path.hops !== 1 ? "s" : ""}
                    </span>
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

      <p style={{ fontSize: "0.4375rem", color: "var(--color-text-tertiary)", textAlign: "center", paddingBottom: 8 }}>
        Illustrative data — architecture is what&apos;s real
      </p>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div
        className="flex items-center gap-1.5 mb-2 pb-1.5"
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

function StatBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="rounded p-2.5 text-center"
      style={{ backgroundColor: "#1C1C1F", border: "1px solid var(--color-border-subtle)" }}
    >
      <div style={{ marginBottom: 2 }}>{value}</div>
      <p style={{ fontSize: "0.5rem", color: "var(--color-text-tertiary)" }}>{label}</p>
    </div>
  );
}
