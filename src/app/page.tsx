"use client";

import { useState } from "react";
import Link from "next/link";
import { PlatformMap } from "@/components/pulse/platform-map";
import { PropertyDetail } from "@/components/pulse/property-detail";
import { DataObservatory } from "@/components/pulse/data-observatory";
import { PROPERTIES, type PulseProperty } from "@/lib/pulse-data";
import { BarChart3 } from "lucide-react";

type View = "map" | "property" | "observatory";

export default function PulsePage() {
  const [view, setView] = useState<View>("map");
  const [selectedProperty, setSelectedProperty] = useState<PulseProperty | null>(null);

  const handlePropertyClick = (property: PulseProperty) => {
    setSelectedProperty(property);
    setView("property");
  };

  const handleBack = () => {
    setView("map");
    setSelectedProperty(null);
  };

  const handleObservatory = () => {
    setView("observatory");
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-pulse-bg relative">
      {view === "map" && (
        <PlatformMap
          properties={PROPERTIES}
          onPropertyClick={handlePropertyClick}
          onObservatoryClick={handleObservatory}
        />
      )}

      {view === "property" && selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          onBack={handleBack}
        />
      )}

      {view === "observatory" && (
        <DataObservatory onBack={handleBack} />
      )}

      {/* Analytics navigation pill — top-right, below Platform Pulse branding */}
      <Link
        href="/briefing"
        className="fixed top-16 right-8 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium hover:bg-white/20 transition-colors"
      >
        <BarChart3 size={14} />
        Open Analytics
      </Link>
    </div>
  );
}
