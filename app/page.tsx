import NavBar from "@/components/nav-bar";
import KpiStrip from "@/components/kpi-strip";
import MapCanvas from "@/components/map-canvas";

export default function BattleMapPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-[#09090B]">
      <NavBar activeTab="map" />
      <KpiStrip />
      <main className="flex-1 relative overflow-hidden">
        <MapCanvas />
      </main>
    </div>
  );
}
