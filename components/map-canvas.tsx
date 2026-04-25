"use client";

import { useState, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { countries as allCountries, accounts } from "@/lib/data";
import type { DealStatus } from "@/lib/types";

const GEO_URL = "/geo/world-110m.json";

// APJ ISO numeric → country code mapping
const ISO_TO_CODE: Record<string, string> = {
  "036": "AU",
  "554": "NZ",
  "392": "JP",
  "410": "KR",
  "360": "ID",
  "356": "IN",
  "458": "MY",
  "608": "PH",
  "764": "TH",
  "704": "VN",
};

// Singapore: too small for 110m TopoJSON — show as marker
const SINGAPORE_MARKER = { coordinates: [103.8198, 1.3521] as [number, number], code: "SG" };

export const STATUS_COLORS: Record<DealStatus, string> = {
  won: "#E8681A",
  active: "#F59E0B",
  targeted: "#D97706",
  competitor: "#6B7280",
  untouched: "#3F3F46",
};

const STATUS_LABELS: Record<DealStatus, string> = {
  won: "Won",
  active: "Active Deal",
  targeted: "Targeted",
  competitor: "Held by Competitor",
  untouched: "Untouched",
};

const APJ_CODES = new Set([...Object.values(ISO_TO_CODE), "SG"]);

interface MapCanvasProps {
  onCountrySelect: (code: string) => void;
  selectedCountry: string | null;
  filters: { vertical: string; size: string; status: string };
}

export default function MapCanvas({ onCountrySelect, selectedCountry, filters }: MapCanvasProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    code: string;
  } | null>(null);

  const getCountryData = useCallback(
    (code: string) => allCountries.find((c) => c.code === code),
    []
  );

  const getCountryColor = useCallback(
    (code: string) => {
      const c = getCountryData(code);
      if (!c) return "#3F3F46";
      if (filters.status !== "all" && c.status !== filters.status) return "#3F3F46";
      return STATUS_COLORS[c.status] ?? "#3F3F46";
    },
    [getCountryData, filters.status]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent, code: string) => {
    const rect = (e.currentTarget as Element).closest(".map-container")?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, code });
  }, []);

  const tooltipCountry = tooltip ? getCountryData(tooltip.code) : null;

  return (
    <div className="relative w-full h-full flex flex-col map-container" style={{ backgroundColor: "#09090B" }}>
      {/* Map */}
      <div className="flex-1 relative overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 380,
            center: [115, 5],
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoId = (geo as { id: string }).id;
                const rsmKey = (geo as { rsmKey: string }).rsmKey;
                const code = ISO_TO_CODE[geoId];
                if (!code || !APJ_CODES.has(code)) {
                  return (
                    <Geography
                      key={rsmKey}
                      geography={geo}
                      fill="#1C1C1F"
                      stroke="#3F3F46"
                      strokeWidth={0.5}
                      style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
                    />
                  );
                }

                const color = getCountryColor(code);
                const isSelected = selectedCountry === code;
                const accountCount = accounts.filter((a) => a.countryCode === code).length;

                return (
                  <Geography
                    key={rsmKey}
                    geography={geo}
                    fill={isSelected ? color : `${color}CC`}
                    stroke={isSelected ? color : "#27272A"}
                    strokeWidth={isSelected ? 2 : 0.8}
                    style={{
                      default: { outline: "none", cursor: "pointer" },
                      hover: { outline: "none", fill: color, cursor: "pointer" },
                      pressed: { outline: "none" },
                    }}
                    onClick={() => onCountrySelect(code)}
                    onMouseMove={(e) => handleMouseMove(e, code)}
                    onMouseLeave={() => setTooltip(null)}
                    tabIndex={0}
                    aria-label={`${code} — ${accountCount} accounts`}
                  />
                );
              })
            }
          </Geographies>

          {/* Singapore marker (city-state, too small for 110m) */}
          {(() => {
            const code = "SG";
            const color = getCountryColor(code);
            const isSelected = selectedCountry === code;
            return (
              <Marker
                coordinates={SINGAPORE_MARKER.coordinates}
                onClick={() => onCountrySelect(code)}
              >
                <circle
                  r={isSelected ? 9 : 7}
                  fill={isSelected ? color : `${color}CC`}
                  stroke={isSelected ? color : "#27272A"}
                  strokeWidth={isSelected ? 2 : 1}
                  style={{ cursor: "pointer" }}
                  onMouseMove={(e) =>
                    handleMouseMove(e as unknown as React.MouseEvent, code)
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
                <text
                  textAnchor="middle"
                  y={-12}
                  style={{
                    fontSize: "9px",
                    fill: "#A1A1AA",
                    pointerEvents: "none",
                    fontFamily: "var(--font-geist-sans)",
                  }}
                >
                  SG
                </text>
              </Marker>
            );
          })()}
        </ComposableMap>

        {/* Tooltip */}
        {tooltip && tooltipCountry && (
          <div
            className="absolute pointer-events-none z-20 rounded px-3 py-2"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 8,
              backgroundColor: "rgba(24,24,27,0.95)",
              border: "1px solid var(--color-border)",
              maxWidth: 220,
            }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
              {tooltipCountry.name}
              <span
                className="ml-2 pill"
                style={{
                  backgroundColor: `${STATUS_COLORS[tooltipCountry.status]}18`,
                  color: STATUS_COLORS[tooltipCountry.status],
                  fontSize: "0.5625rem",
                  padding: "1px 5px",
                }}
              >
                {STATUS_LABELS[tooltipCountry.status]}
              </span>
            </p>
            <div className="flex gap-3" style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}>
              <span>
                Capture{" "}
                <span style={{ color: STATUS_COLORS[tooltipCountry.status], fontFamily: "var(--font-geist-mono)" }}>
                  {Math.round(tooltipCountry.captureRate * 100)}%
                </span>
              </span>
              <span>
                TAM{" "}
                <span style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-geist-mono)" }}>
                  ${(tooltipCountry.tamUSD / 1e9).toFixed(1)}B
                </span>
              </span>
            </div>
            <p className="mt-1" style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)", lineHeight: 1.4 }}>
              {tooltipCountry.notes.slice(0, 80)}…
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 flex flex-wrap gap-3 p-3 rounded"
        style={{
          backgroundColor: "rgba(24,24,27,0.92)",
          border: "1px solid var(--color-border)",
        }}
      >
        {(Object.entries(STATUS_LABELS) as [DealStatus, string][]).map(([status, label]) => (
          <LegendItem key={status} color={STATUS_COLORS[status]} label={label} />
        ))}
      </div>

      {/* Illustrative data disclaimer */}
      <div
        className="absolute bottom-4 right-4 text-micro px-2 py-1 rounded"
        style={{
          color: "var(--color-text-tertiary)",
          border: "1px solid var(--color-border-subtle)",
          backgroundColor: "rgba(24,24,27,0.85)",
          fontSize: "0.625rem",
        }}
        title="All accounts, people, and relationships shown are illustrative. With a live CRM, LinkedIn Sales Navigator export, and earnings-call pipeline, this populates itself."
      >
        Illustrative data — architecture is what&apos;s real
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="rounded-sm shrink-0"
        style={{ width: 10, height: 10, backgroundColor: color }}
      />
      <span style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}>
        {label}
      </span>
    </div>
  );
}
