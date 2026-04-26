"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { FeatureCollection, Geometry } from "geojson";
import { feature as topoFeature } from "topojson-client";
import { countries as allCountries } from "@/lib/data";
import type { DealStatus } from "@/lib/types";
import "maplibre-gl/dist/maplibre-gl.css";

// Custom dark style — OpenFreeMap tiles, no token, served from /public
const MAP_STYLE = "/styles/dark.json";

// TopoJSON ISO numeric → country code
const ISO_TO_CODE: Record<string, string> = {
  "036": "AU", "36": "AU",
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

// City-states / territories too small for 110m TopoJSON
const POINT_COUNTRIES: Record<string, [number, number]> = {
  SG: [103.8198, 1.3521],
  HK: [114.177, 22.302],
  TW: [120.96, 23.70],
};

export const STATUS_COLORS: Record<DealStatus, string> = {
  won:        "#E8681A",
  active:     "#F59E0B",
  targeted:   "#D97706",
  competitor: "#6B7280",
  untouched:  "#3F3F46",
};

const STATUS_LABELS: Record<DealStatus, string> = {
  won:        "Won",
  active:     "Active Deal",
  targeted:   "Targeted",
  competitor: "Held by Competitor",
  untouched:  "Untouched",
};

interface MapCanvasProps {
  onCountrySelect: (code: string) => void;
  selectedCountry: string | null;
  filters: { vertical: string; size: string; status: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Expr = any;

export default function MapCanvas({ onCountrySelect, selectedCountry, filters }: MapCanvasProps) {
  const [polygonData, setPolygonData] = useState<FeatureCollection<Geometry> | null>(null);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; code: string } | null>(null);

  // Load & enrich TopoJSON → GeoJSON once
  useEffect(() => {
    fetch("/geo/apj.json")
      .then((r) => r.json())
      .then((topo: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const t = topo as any;
        const coll = topoFeature(t, t.objects.countries) as unknown as FeatureCollection<Geometry>;
        const enriched: FeatureCollection<Geometry> = {
          type: "FeatureCollection",
          features: coll.features.map((f) => {
            const rawId = String(f.id ?? "");
            const code = ISO_TO_CODE[rawId] ?? "";
            const country = code ? allCountries.find((c) => c.code === code) : null;
            return {
              ...f,
              properties: {
                code,
                status:      country?.status ?? "untouched",
                name:        country?.name ?? "",
                captureRate: country?.captureRate ?? 0,
                tamUSD:      country?.tamUSD ?? 0,
                notes:       country?.notes?.slice(0, 100) ?? "",
              },
            };
          }),
        };
        setPolygonData(enriched);
      });
  }, []);

  // Point GeoJSON for SG / HK / TW
  const pointData: FeatureCollection = useMemo(() => ({
    type: "FeatureCollection",
    features: Object.entries(POINT_COUNTRIES).map(([code, coords]) => {
      const country = allCountries.find((c) => c.code === code);
      return {
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: coords },
        properties: {
          code,
          status:      country?.status ?? "untouched",
          name:        country?.name ?? code,
          captureRate: country?.captureRate ?? 0,
          tamUSD:      country?.tamUSD ?? 0,
          notes:       country?.notes?.slice(0, 100) ?? "",
        },
      };
    }),
  }), []);

  // ── Layer paint expressions ─────────────────────────────────────────────

  // Build `match` expression: code → effective color (respects status filter)
  const fillColor: Expr = useMemo(() => {
    const args: Expr[] = ["match", ["get", "code"]];
    for (const c of allCountries) {
      const effective =
        filters.status !== "all" && c.status !== filters.status ? "untouched" : c.status;
      args.push(c.code, STATUS_COLORS[effective as DealStatus] ?? "#3F3F46");
    }
    args.push("#3F3F46");
    return args;
  }, [filters.status]);

  const sel = selectedCountry ?? "$$∅";
  const hov = hoveredCode ?? "$$∅";

  const fillOpacity: Expr = [
    "case",
    ["==", ["get", "code"], sel], 0.85,
    ["==", ["get", "code"], hov], 0.75,
    0.68,
  ];

  const lineColor: Expr = [
    "case",
    ["==", ["get", "code"], sel], "#FFFFFF",
    ["==", ["get", "code"], hov], "rgba(255,255,255,0.55)",
    "rgba(255,255,255,0.14)",
  ];

  const lineWidth: Expr = [
    "case",
    ["==", ["get", "code"], sel], 2.0,
    ["==", ["get", "code"], hov], 1.2,
    0.7,
  ];

  const circleRadius: Expr = [
    "case",
    ["==", ["get", "code"], sel], 10,
    ["==", ["get", "code"], hov], 9,
    7,
  ];

  const circleStroke: Expr = [
    "case",
    ["==", ["get", "code"], sel], "#FFFFFF",
    ["==", ["get", "code"], hov], "rgba(255,255,255,0.55)",
    "rgba(255,255,255,0.2)",
  ];

  // ── Event handlers ──────────────────────────────────────────────────────

  const handleMouseMove = useCallback((e: MapLayerMouseEvent) => {
    const f = e.features?.[0];
    if (!f) return;
    const code = f.properties?.code as string;
    if (!code) return;
    setHoveredCode(code);
    setTooltip({ x: e.point.x, y: e.point.y, code });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCode(null);
    setTooltip(null);
  }, []);

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const f = e.features?.[0];
      if (!f) return;
      const code = f.properties?.code as string;
      if (code) onCountrySelect(code);
    },
    [onCountrySelect]
  );

  const tooltipCountry = tooltip ? allCountries.find((c) => c.code === tooltip.code) : null;

  const interactiveIds = polygonData
    ? ["apj-fill", "point-circle"]
    : ["point-circle"];

  return (
    <div className="relative w-full h-full" style={{ backgroundColor: "#07070C" }}>
      <Map
        initialViewState={{ longitude: 118, latitude: 8, zoom: 3.2 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLE}
        interactiveLayerIds={interactiveIds}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* APJ country polygon fills */}
        {polygonData && (
          <Source id="apj" type="geojson" data={polygonData}>
            <Layer
              id="apj-fill"
              type="fill"
              paint={{ "fill-color": fillColor, "fill-opacity": fillOpacity }}
            />
            <Layer
              id="apj-line"
              type="line"
              paint={{ "line-color": lineColor, "line-width": lineWidth }}
            />
          </Source>
        )}

        {/* Point markers for SG, HK, TW */}
        <Source id="points" type="geojson" data={pointData}>
          <Layer
            id="point-circle"
            type="circle"
            paint={{
              "circle-radius":       circleRadius,
              "circle-color":        fillColor,
              "circle-stroke-color": circleStroke,
              "circle-stroke-width": 1.5,
            }}
          />
          <Layer
            id="point-label"
            type="symbol"
            layout={{
              "text-field":  ["get", "code"],
              "text-font":   ["Open Sans Semibold", "Arial Unicode MS Bold"],
              "text-size":   9,
              "text-offset": [0, -1.8],
              "text-anchor": "bottom",
            }}
            paint={{
              "text-color":       "rgba(200,200,215,0.9)",
              "text-halo-color":  "#07070C",
              "text-halo-width":  1.5,
            }}
          />
        </Source>
      </Map>

      {/* Hover tooltip */}
      {tooltip && tooltipCountry && (
        <div
          className="absolute pointer-events-none z-20 rounded px-3 py-2.5"
          style={{
            left: tooltip.x + 14,
            top:  tooltip.y - 10,
            backgroundColor: "rgba(10,10,14,0.96)",
            border: "1px solid var(--color-border)",
            maxWidth: 240,
            backdropFilter: "blur(10px)",
          }}
        >
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 5, display: "flex", alignItems: "center", gap: 7 }}>
            {tooltipCountry.name}
            <span
              className="pill"
              style={{
                backgroundColor: `${STATUS_COLORS[tooltipCountry.status]}18`,
                color: STATUS_COLORS[tooltipCountry.status],
                fontSize: "0.5625rem",
                padding: "1px 6px",
              }}
            >
              {STATUS_LABELS[tooltipCountry.status]}
            </span>
          </p>
          <div style={{ display: "flex", gap: 14, fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}>
            <span>
              Capture{" "}
              <span style={{ color: STATUS_COLORS[tooltipCountry.status], fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                {Math.round(tooltipCountry.captureRate * 100)}%
              </span>
            </span>
            <span>
              TAM{" "}
              <span style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
                ${(tooltipCountry.tamUSD / 1e9).toFixed(1)}B
              </span>
            </span>
          </div>
          <p style={{ fontSize: "0.5625rem", color: "var(--color-text-tertiary)", lineHeight: 1.45, marginTop: 5 }}>
            {tooltipCountry.notes.slice(0, 80)}…
          </p>
        </div>
      )}

      {/* Status legend */}
      <div
        className="absolute bottom-3 left-3 flex items-center gap-4 px-3 py-2 rounded"
        style={{
          backgroundColor: "rgba(9,9,11,0.88)",
          border: "1px solid var(--color-border)",
          backdropFilter: "blur(8px)",
        }}
      >
        {(Object.entries(STATUS_LABELS) as [DealStatus, string][]).map(([status, label]) => (
          <LegendItem key={status} color={STATUS_COLORS[status]} label={label} />
        ))}
      </div>

      {/* Disclaimer */}
      <div
        className="absolute bottom-4 right-4 px-2 py-1 rounded"
        style={{
          color: "var(--color-text-tertiary)",
          border: "1px solid var(--color-border-subtle)",
          backgroundColor: "rgba(14,14,18,0.85)",
          fontSize: "0.625rem",
        }}
      >
        Illustrative data — architecture is what&apos;s real
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="rounded-sm shrink-0" style={{ width: 10, height: 10, backgroundColor: color }} />
      <span style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}>{label}</span>
    </div>
  );
}
