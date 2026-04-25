"use client";

import { useState } from "react";
import NavBar from "@/components/nav-bar";
import KpiStrip from "@/components/kpi-strip";
import MapCanvas from "@/components/map-canvas";
import AccountPanel from "@/components/account-panel";

interface FilterState {
  vertical: string;
  size: string;
  status: string;
}

export default function BattleMapPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    vertical: "all",
    size: "all",
    status: "all",
  });

  return (
    <div className="flex flex-col" style={{ height: "100dvh", backgroundColor: "#09090B", overflow: "hidden" }}>
      <NavBar activeTab="map" />
      <KpiStrip filters={filters} onFiltersChange={setFilters} />
      <main className="flex-1 relative overflow-hidden flex">
        <div className="flex-1 relative overflow-hidden">
          <MapCanvas
            onCountrySelect={(code) =>
              setSelectedCountry((prev) => (prev === code ? null : code))
            }
            selectedCountry={selectedCountry}
            filters={filters}
          />
        </div>
        {selectedCountry && (
          <AccountPanel
            countryCode={selectedCountry}
            onClose={() => setSelectedCountry(null)}
          />
        )}
      </main>
    </div>
  );
}
