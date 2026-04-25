"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { NodeObject, LinkObject } from "react-force-graph-2d";
import { people, edges, accounts } from "@/lib/data";
import { findWarmPaths } from "@/lib/warm-paths";
import type { Person, Edge, WarmPath } from "@/lib/types";
import { X, Users, GitBranch } from "lucide-react";

// react-force-graph-2d must be loaded client-side only (uses canvas)
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="skeleton" style={{ width: 120, height: 16, borderRadius: 4 }} />
    </div>
  ),
});

const CRM_COLORS: Record<string, string> = {
  champion: "#22C55E",
  meeting_held: "#3B82F6",
  contacted: "#F59E0B",
  cold: "#6B7280",
  detractor: "#EF4444",
};

const EDGE_COLORS: Record<string, string> = {
  co_worked: "#E8681A",
  board: "#8B5CF6",
  alumni: "#3B82F6",
  co_author: "#06B6D4",
  co_panelist: "#6B7280",
};

interface PeopleGraphProps {
  filterCountry?: string;
  filterCrm?: string;
}

export default function PeopleGraph({ filterCountry, filterCrm }: PeopleGraphProps) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [warmPaths, setWarmPaths] = useState<WarmPath[]>([]);
  const [hopsFilter, setHopsFilter] = useState<boolean>(false);
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
      title: p.title,
      crmStatus: p.crmStatus,
      influenceScore: p.influenceScore,
      countryCode: p.countryCode,
      accountId: p.accountId,
      // size proportional to influence
      val: Math.max(2, p.influenceScore / 20),
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

  // Compute warm paths when a person is selected
  useEffect(() => {
    if (!selectedPerson) {
      setWarmPaths([]);
      return;
    }
    const paths = findWarmPaths(selectedPerson.id, people, edges, 3, 3);
    setWarmPaths(paths);
  }, [selectedPerson]);

  // Highlight warm-path nodes
  const warmPathNodeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const path of warmPaths) {
      for (const id of path.path) ids.add(id);
    }
    return ids;
  }, [warmPaths]);

  const nodeCanvasObject = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const r = Math.max(2.5, (node.influenceScore as number) / 20);
      const color = CRM_COLORS[node.crmStatus as string] ?? "#6B7280";
      const nodeId = String(node.id);
      const isSelected = selectedPerson?.id === nodeId;
      const isInPath = warmPathNodeIds.has(nodeId);

      // Glow for selected/path nodes
      if (isSelected || isInPath) {
        ctx.beginPath();
        ctx.arc(node.x as number, node.y as number, r + 4, 0, 2 * Math.PI);
        ctx.fillStyle = `${color}30`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x as number, node.y as number, r, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? color : `${color}CC`;
      ctx.strokeStyle = isSelected ? "#FFFFFF" : `${color}60`;
      ctx.lineWidth = isSelected ? 2 : 0.5;
      ctx.fill();
      ctx.stroke();

      // Label for larger nodes or selected
      if (r * globalScale > 8 || isSelected) {
        ctx.font = `${Math.max(8, 10 / globalScale)}px sans-serif`;
        ctx.fillStyle = "#E4E4E7";
        ctx.textAlign = "center";
        ctx.fillText(
          (node.name as string).split(" ")[0],
          node.x as number,
          (node.y as number) + r + 8 / globalScale
        );
      }
    },
    [selectedPerson, warmPathNodeIds]
  );

  const linkColor = useCallback(
    (link: LinkObject) => {
      const base = EDGE_COLORS[link.type as string] ?? "#6B7280";
      return `${base}80`;
    },
    []
  );

  const linkWidth = useCallback(
    (link: LinkObject) => (link.strength as number) ?? 1,
    []
  );

  const handleNodeClick = useCallback(
    (node: NodeObject) => {
      const nodeId = String(node.id);
      const person = people.find((p) => p.id === nodeId) ?? null;
      setSelectedPerson((prev) => (prev?.id === nodeId ? null : person));
    },
    []
  );

  return (
    <div className="flex h-full" style={{ backgroundColor: "#09090B" }}>
      {/* Graph canvas */}
      <div ref={containerRef} className="flex-1 relative">
        <ForceGraph2D
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#09090B"
          nodeCanvasObject={nodeCanvasObject}
          nodeCanvasObjectMode={() => "replace"}
          linkColor={linkColor}
          linkWidth={linkWidth}
          onNodeClick={handleNodeClick}
          onBackgroundClick={() => setSelectedPerson(null)}
          warmupTicks={80}
          cooldownTicks={80}
          numDimensions={2}
          enableNodeDrag={true}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />

        {/* Legend overlay */}
        <div
          className="absolute bottom-4 left-4 rounded p-3 space-y-2"
          style={{
            backgroundColor: "rgba(24,24,27,0.92)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p style={{ fontSize: "0.5625rem", fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            CRM Status
          </p>
          {Object.entries(CRM_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="rounded-full" style={{ width: 8, height: 8, backgroundColor: color }} />
              <span style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}>
                {status.replace("_", " ")}
              </span>
            </div>
          ))}
          <div style={{ marginTop: 8, borderTop: "1px solid var(--color-border-subtle)", paddingTop: 8 }}>
            <p style={{ fontSize: "0.5625rem", fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              Edge Type
            </p>
            {Object.entries(EDGE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div style={{ width: 12, height: 2, backgroundColor: color }} />
                <span style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}>
                  {type.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Node count */}
        <div
          className="absolute top-4 left-4 flex items-center gap-1.5 rounded px-2 py-1"
          style={{ backgroundColor: "rgba(24,24,27,0.85)", border: "1px solid var(--color-border)", fontSize: "0.5625rem", color: "var(--color-text-tertiary)" }}
        >
          <Users size={10} />
          {filteredPeople.length} people · {graphData.links.length} connections
        </div>

        {/* Disclaimer */}
        <div
          className="absolute bottom-4 right-4 rounded px-2 py-1"
          style={{
            backgroundColor: "rgba(24,24,27,0.85)",
            border: "1px solid var(--color-border-subtle)",
            fontSize: "0.5625rem",
            color: "var(--color-text-tertiary)",
          }}
        >
          Illustrative data — architecture is what&apos;s real
        </div>
      </div>

      {/* Person detail panel */}
      {selectedPerson && (
        <PersonPanel
          person={selectedPerson}
          warmPaths={warmPaths}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
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

  return (
    <div
      className="drawer-enter flex flex-col shrink-0 overflow-y-auto"
      style={{
        width: 320,
        backgroundColor: "var(--color-surface)",
        borderLeft: "1px solid var(--color-border)",
      }}
    >
      <div
        className="flex items-start justify-between p-4 shrink-0"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div
              className="rounded-full flex items-center justify-center"
              style={{ width: 32, height: 32, backgroundColor: `${color}18`, border: `1px solid ${color}40` }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color }}>{person.name.slice(0, 1)}</span>
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{person.name}</p>
              <p style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}>{person.title}</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="btn btn-ghost p-1"><X size={14} /></button>
      </div>

      <div className="p-4 space-y-4">
        {/* CRM + account */}
        <div className="grid grid-cols-2 gap-2">
          <Stat label="CRM Status" value={
            <span className="pill" style={{ backgroundColor: `${color}18`, color, fontSize: "0.5625rem", padding: "1px 5px" }}>
              {person.crmStatus.replace("_", " ")}
            </span>
          } />
          <Stat label="Influence" value={<span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.875rem", color: "var(--color-text-primary)" }}>{person.influenceScore}</span>} />
          <Stat label="Account" value={account?.name ?? person.accountId} />
          <Stat label="Country" value={person.countryCode} />
          <Stat label="Touches" value={<span style={{ fontFamily: "var(--font-geist-mono)" }}>{person.engagementCount}</span>} />
          <Stat label="Last Touch" value={<span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.625rem" }}>{person.lastEngagement ?? "None"}</span>} />
        </div>

        {/* Prior employers */}
        <div>
          <p style={{ fontSize: "0.5625rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary)", marginBottom: 6 }}>
            Background
          </p>
          <p style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>{person.education}</p>
          <p style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)", marginTop: 2 }}>
            Prior: {person.priorEmployers.join(" → ")}
          </p>
          {person.boardSeats.length > 0 && (
            <p style={{ fontSize: "0.625rem", color: "var(--color-ember)", marginTop: 2 }}>
              Board: {person.boardSeats.join(", ")}
            </p>
          )}
        </div>

        {/* Public stance */}
        <div>
          <p style={{ fontSize: "0.5625rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary)", marginBottom: 4 }}>
            Public Stance
          </p>
          <p className="pull-quote">{person.publicStance}</p>
        </div>

        {/* Warm paths */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <GitBranch size={12} style={{ color: "var(--color-text-tertiary)" }} />
            <p style={{ fontSize: "0.5625rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-text-tertiary)" }}>
              Warm-Intro Paths
            </p>
          </div>
          {warmPaths.length === 0 ? (
            <p style={{ fontSize: "0.6875rem", color: "var(--color-text-tertiary)" }}>
              No warm paths found — no mutual champions/meetings within 3 hops.
            </p>
          ) : (
            <div className="space-y-2">
              {warmPaths.map((path, i) => (
                <WarmPathCard key={i} path={path} rank={i + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded p-2" style={{ backgroundColor: "#1C1C1F", border: "1px solid var(--color-border-subtle)" }}>
      <p style={{ fontSize: "0.5rem", color: "var(--color-text-tertiary)", marginBottom: 2 }}>{label}</p>
      <div style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>{value}</div>
    </div>
  );
}

function WarmPathCard({ path, rank }: { path: WarmPath; rank: number }) {
  const personNames = path.path.map((id) => {
    const p = people.find((x) => x.id === id);
    return p?.name.split(" ")[0] ?? id;
  });

  return (
    <div
      className="rounded p-2.5"
      style={{ backgroundColor: "#1C1C1F", border: "1px solid var(--color-border-subtle)", borderLeft: "3px solid var(--color-ember)" }}
    >
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontSize: "0.5625rem", fontWeight: 700, color: "var(--color-ember)" }}>Path #{rank}</span>
        <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: "0.5rem", color: "var(--color-text-tertiary)" }}>
          {path.hops} hop{path.hops !== 1 ? "s" : ""} · score {path.score.toFixed(3)}
        </span>
      </div>
      <p style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>
        {personNames.join(" → ")}
      </p>
    </div>
  );
}
