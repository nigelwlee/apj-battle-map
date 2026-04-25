"use client";

/* Territory War Map placeholder.
   Full implementation in NIG-62..68.
   This shell establishes the layout contract: full-bleed dark canvas,
   country color legend, and the country-click drawer slot.
*/

const APJ_COUNTRIES = [
  { code: "AU", name: "Australia",    captureRate: 0.40, status: "active" as const },
  { code: "NZ", name: "New Zealand",  captureRate: 0.20, status: "targeted" as const },
  { code: "JP", name: "Japan",        captureRate: 0.13, status: "competitor" as const },
  { code: "KR", name: "South Korea",  captureRate: 0.27, status: "active" as const },
  { code: "SG", name: "Singapore",    captureRate: 0.53, status: "won" as const },
  { code: "ID", name: "Indonesia",    captureRate: 0.13, status: "competitor" as const },
  { code: "IN", name: "India",        captureRate: 0.20, status: "targeted" as const },
  { code: "MY", name: "Malaysia",     captureRate: 0.08, status: "untouched" as const },
  { code: "PH", name: "Philippines",  captureRate: 0.06, status: "untouched" as const },
  { code: "TH", name: "Thailand",     captureRate: 0.09, status: "untouched" as const },
];

const STATUS_COLORS = {
  won:        "#E8681A",
  active:     "#F59E0B",
  targeted:   "#D97706",
  competitor: "#6B7280",
  untouched:  "#3F3F46",
} as const;

const STATUS_LABELS = {
  won:        "Won",
  active:     "Active Deal",
  targeted:   "Targeted",
  competitor: "Held by Competitor",
  untouched:  "Untouched",
} as const;

export default function MapCanvas() {
  return (
    <div className="relative w-full h-full flex flex-col" style={{ backgroundColor: "#09090B" }}>

      {/* Map placeholder — replaced by react-simple-maps in NIG-62 */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-lg px-8">

          {/* Placeholder grid of country status cards */}
          <p className="text-subheading mb-6" style={{ color: "var(--color-text-tertiary)" }}>
            APJ Territory — 10 Markets
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {APJ_COUNTRIES.map((country, i) => (
              <CountryCard
                key={country.code}
                country={country}
                style={{ animationDelay: `${i * 40}ms` }}
              />
            ))}
          </div>

          <p
            className="text-label mt-6"
            style={{ color: "var(--color-text-tertiary)", fontSize: "0.75rem" }}
          >
            Interactive map renders in NIG-62. Click any country to see lighthouse accounts.
          </p>
        </div>
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 flex flex-wrap gap-3 p-3 rounded"
        style={{
          backgroundColor: "rgba(24,24,27,0.9)",
          border: "1px solid var(--color-border)",
          backdropFilter: "none",
        }}
      >
        {(Object.entries(STATUS_LABELS) as [keyof typeof STATUS_COLORS, string][]).map(
          ([status, label]) => (
            <LegendItem key={status} color={STATUS_COLORS[status]} label={label} />
          )
        )}
      </div>

      {/* Illustrative data disclaimer */}
      <div
        className="absolute bottom-4 right-4 text-micro px-2 py-1 rounded"
        style={{
          color: "var(--color-text-tertiary)",
          border: "1px solid var(--color-border-subtle)",
          backgroundColor: "rgba(24,24,27,0.8)",
          fontSize: "0.625rem",
        }}
        title="All accounts, people, and relationships shown are illustrative. With a live CRM, LinkedIn Sales Navigator export, and earnings-call pipeline, this populates itself."
      >
        Illustrative data — architecture is what&apos;s real
      </div>
    </div>
  );
}

function CountryCard({
  country,
  style,
}: {
  country: (typeof APJ_COUNTRIES)[0];
  style?: React.CSSProperties;
}) {
  const color = STATUS_COLORS[country.status];
  const pct = Math.round(country.captureRate * 100);

  return (
    <div
      className="stagger-item card p-3 cursor-pointer text-left group"
      style={style}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-micro font-semibold"
          style={{ color: "var(--color-text-tertiary)", fontSize: "0.625rem" }}
        >
          {country.code}
        </span>
        <span
          className="pill"
          style={{
            backgroundColor: `${color}18`,
            color: color,
            fontSize: "0.5625rem",
            padding: "1px 4px",
          }}
        >
          {pct}%
        </span>
      </div>
      <p
        className="text-xs font-medium leading-tight mb-2"
        style={{ color: "var(--color-text-primary)", fontSize: "0.75rem" }}
      >
        {country.name}
      </p>
      {/* Mini capture bar */}
      <div className="progress-track" style={{ height: "3px" }}>
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="rounded-sm shrink-0"
        style={{ width: "10px", height: "10px", backgroundColor: color }}
      />
      <span style={{ fontSize: "0.625rem", color: "var(--color-text-tertiary)" }}>
        {label}
      </span>
    </div>
  );
}
