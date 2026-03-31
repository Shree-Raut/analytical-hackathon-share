"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import {
  EVENT_COLORS,
  CUSTOMER_HQ,
  resolveHqCoordinate,
  resolvePropertyCoordinate,
  type PulseProperty,
  type EventType,
} from "@/lib/pulse-data";

interface Props {
  properties: PulseProperty[];
  onPropertyClick: (property: PulseProperty) => void;
  onObservatoryClick: () => void;
}

const HEALTH_COLORS: Record<string, string> = {
  healthy: "#38bdf8",
  warning: "#fb923c",
  critical: "#f43f5e",
};

const PHOTO_ZOOM_THRESHOLD = 6;

const PROPERTY_PHOTOS = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1515263487990-61b07816b324?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=120&h=120&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=120&h=120&fit=crop",
];

function getPhotoUrl(index: number): string {
  return PROPERTY_PHOTOS[index % PROPERTY_PHOTOS.length];
}

interface Particle {
  id: number;
  fromLng: number;
  fromLat: number;
  progress: number;
  speed: number;
  color: string;
  ctrlLng: number;
  ctrlLat: number;
}

export default function MapInner({ properties, onPropertyClick, onObservatoryClick }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const photoMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const pidRef = useRef(0);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const container = mapContainerRef.current;
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.position = "absolute";
    container.style.top = "0";
    container.style.left = "0";

    const map = new maplibregl.Map({
      container,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [-97.5, 38.2],
      zoom: 3.45,
      pitch: 0,
      bearing: 0,
      dragRotate: false,
      touchZoomRotate: false,
      renderWorldCopies: false,
      maxBounds: [[-140, 22], [-64, 52]],
      attributionControl: false,
      maxZoom: 14,
      minZoom: 3,
    });

    mapRef.current = map;

    map.on("load", () => {
      const resolvedProperties = properties.map((property) => ({
        property,
        coord: resolvePropertyCoordinate(property),
      }));
      const resolvedHq = resolveHqCoordinate(CUSTOMER_HQ);
      if (process.env.NODE_ENV !== "production") {
        console.table(
          resolvedProperties.map(({ property, coord }) => ({
            id: property.id,
            name: property.name,
            city: `${property.city}, ${property.state}`,
            lat: coord.lat,
            lng: coord.lng,
            source: coord.source,
          })),
        );
      }

      // Render properties as native GeoJSON circle layers for performance at 1000+ scale
      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: resolvedProperties.map(({ property, coord }) => ({
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: [coord.lng, coord.lat] },
          properties: {
            id: property.id,
            name: property.name,
            health: property.health,
            units: property.units,
            color: HEALTH_COLORS[property.health],
          },
        })),
      };

      map.addSource("properties", { type: "geojson", data: geojson });

      // Outer glow
      map.addLayer({
        id: "property-glow",
        type: "circle",
        source: "properties",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "units"], 60, 5, 200, 8, 500, 12],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.15,
          "circle-blur": 1,
        },
      });

      // Core dot
      map.addLayer({
        id: "property-dots",
        type: "circle",
        source: "properties",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "units"], 60, 3, 200, 5, 500, 7],
          "circle-color": ["get", "color"],
          "circle-opacity": 0.85,
          "circle-stroke-width": 1,
          "circle-stroke-color": "rgba(0,0,0,0.6)",
        },
      });

      // Click handler for property dots
      map.on("click", "property-dots", (e) => {
        if (e.features && e.features[0]) {
          const id = e.features[0].properties?.id;
          const property = properties.find((p) => p.id === id);
          if (property) onPropertyClick(property);
        }
      });

      // Hover cursor
      map.on("mouseenter", "property-dots", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "property-dots", () => { map.getCanvas().style.cursor = ""; });

      // Tooltip popup
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 });
      map.on("mouseenter", "property-dots", (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          const coords = (e.features[0].geometry as GeoJSON.Point).coordinates.slice() as [number, number];
          popup.setLngLat(coords)
            .setHTML(`<div style="font-family:Inter,system-ui,sans-serif;font-size:12px;font-weight:600;color:#e2e8f0;">${props?.name}</div><div style="font-size:10px;color:#94a3b8;">${props?.units} units</div>`)
            .addTo(map);
        }
      });
      map.on("mouseleave", "property-dots", () => { popup.remove(); });

      // Photo markers: appear when zoomed in, replacing dots
      const propertyLookup = new Map(resolvedProperties.map(({ property, coord }, i) => [
        property.id,
        { property, coord, index: i },
      ]));

      function updatePhotoMarkers() {
        const zoom = map.getZoom();
        const active = photoMarkersRef.current;

        if (zoom < PHOTO_ZOOM_THRESHOLD) {
          active.forEach((m) => m.remove());
          active.clear();
          map.setPaintProperty("property-dots", "circle-opacity", 0.85);
          map.setPaintProperty("property-glow", "circle-opacity", 0.15);
          return;
        }

        // Fade dots as photos appear
        const fadeProgress = Math.min(1, (zoom - PHOTO_ZOOM_THRESHOLD) / 1.5);
        map.setPaintProperty("property-dots", "circle-opacity", 0.85 * (1 - fadeProgress));
        map.setPaintProperty("property-glow", "circle-opacity", 0.15 * (1 - fadeProgress));

        const bounds = map.getBounds();
        const visibleIds = new Set<string>();

        resolvedProperties.forEach(({ property, coord, }, i) => {
          if (coord.lat >= bounds.getSouth() && coord.lat <= bounds.getNorth() &&
              coord.lng >= bounds.getWest() && coord.lng <= bounds.getEast()) {
            visibleIds.add(property.id);

            if (!active.has(property.id)) {
              const size = Math.max(40, Math.min(64, property.units / 6));
              const healthColor = HEALTH_COLORS[property.health];
              const photoUrl = getPhotoUrl(i);

              const el = document.createElement("div");
              el.style.cssText = `width:${size}px;height:${size}px;cursor:pointer;overflow:visible;opacity:0;transition:opacity 0.3s ease;`;

              const circle = document.createElement("div");
              circle.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;border:2px solid ${healthColor};box-shadow:0 0 12px ${healthColor}55;transition:transform 0.2s ease;`;

              const img = document.createElement("img");
              img.src = photoUrl;
              img.alt = property.name;
              img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
              img.loading = "lazy";
              circle.appendChild(img);

              const label = document.createElement("div");
              label.textContent = property.name;
              label.style.cssText = "position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:3px;white-space:nowrap;font-size:9px;font-weight:600;color:#e2e8f0;text-shadow:0 1px 3px rgba(0,0,0,0.9);font-family:Inter,system-ui,sans-serif;pointer-events:none;";

              el.appendChild(circle);
              el.appendChild(label);

              el.addEventListener("click", (ev) => { ev.stopPropagation(); onPropertyClick(property); });
              el.addEventListener("mouseenter", () => { circle.style.transform = "scale(1.15)"; });
              el.addEventListener("mouseleave", () => { circle.style.transform = "scale(1)"; });

              const marker = new maplibregl.Marker({ element: el, anchor: "center" })
                .setLngLat([coord.lng, coord.lat])
                .addTo(map);
              active.set(property.id, marker);

              requestAnimationFrame(() => { el.style.opacity = "1"; });
            }
          }
        });

        // Remove markers no longer in viewport
        active.forEach((marker, id) => {
          if (!visibleIds.has(id)) {
            marker.remove();
            active.delete(id);
          }
        });
      }

      map.on("zoomend", updatePhotoMarkers);
      map.on("moveend", updatePhotoMarkers);

      // HQ marker — simple, no external image dependency
      const hqEl = document.createElement("div");
      hqEl.style.cssText = "cursor:pointer;overflow:visible;display:flex;flex-direction:column;align-items:center;";

      const hqBadge = document.createElement("div");
      hqBadge.textContent = "DATA OBSERVATORY";
      hqBadge.style.cssText = "padding:3px 10px;border-radius:9999px;border:1px solid rgba(34,211,238,0.7);background:rgba(2,6,23,0.92);color:#67e8f9;font-size:9px;font-weight:700;letter-spacing:0.1em;font-family:Inter,system-ui,sans-serif;white-space:nowrap;margin-bottom:6px;box-shadow:0 0 14px rgba(34,211,238,0.3);pointer-events:none;";

      const hqCircle = document.createElement("div");
      hqCircle.style.cssText = "width:64px;height:64px;border-radius:50%;border:3px solid #38bdf8;background:#0f172a;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(56,189,248,0.45),0 0 40px rgba(56,189,248,0.15);overflow:hidden;position:relative;";

      const hqImg = document.createElement("img");
      hqImg.src = CUSTOMER_HQ.photoUrl;
      hqImg.alt = `${CUSTOMER_HQ.name} HQ`;
      hqImg.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
      hqImg.onerror = function() {
        (this as HTMLImageElement).onerror = null;
        (this as HTMLImageElement).style.display = "none";
        hqCircle.innerHTML += '<div style="color:#38bdf8;font-size:20px;font-weight:800;font-family:Inter,system-ui,sans-serif;">HQ</div>';
      };
      hqCircle.appendChild(hqImg);

      const hqLabel = document.createElement("div");
      hqLabel.style.cssText = "margin-top:4px;text-align:center;pointer-events:none;";
      hqLabel.innerHTML = `<div style="font-size:11px;font-weight:700;color:#e2e8f0;text-shadow:0 1px 4px rgba(0,0,0,0.9);font-family:Inter,system-ui,sans-serif;">Corporate HQ</div><div style="font-size:9px;color:#94a3b8;text-shadow:0 1px 3px rgba(0,0,0,0.9);font-family:Inter,system-ui,sans-serif;">${CUSTOMER_HQ.city}, ${CUSTOMER_HQ.state}</div>`;

      hqEl.appendChild(hqBadge);
      hqEl.appendChild(hqCircle);
      hqEl.appendChild(hqLabel);

      hqEl.addEventListener("click", (e) => {
        e.stopPropagation();
        onObservatoryClick();
      });

      const hqMarker = new maplibregl.Marker({ element: hqEl, anchor: "center" })
        .setLngLat([resolvedHq.lng, resolvedHq.lat])
        .addTo(map);
      markersRef.current.push(hqMarker);

      const bounds = new maplibregl.LngLatBounds();
      resolvedProperties.forEach(({ coord }) => bounds.extend([coord.lng, coord.lat]));
      bounds.extend([resolvedHq.lng, resolvedHq.lat]);

      setMapReady(true);

      // Frame using resolved coordinates while staying in US operating bounds.
      requestAnimationFrame(() => {
        map.resize();
        map.fitBounds(bounds, {
          padding: { top: 80, right: 100, bottom: 120, left: 460 },
          maxZoom: 5.6,
          duration: 0,
        });
      });
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      photoMarkersRef.current.forEach((m) => m.remove());
      photoMarkersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [properties, onPropertyClick, onObservatoryClick]);

  // Particle animation
  useEffect(() => {
    if (!mapReady || !canvasRef.current || !mapRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const map = mapRef.current;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const resolvedProperties = properties.map((property) => ({
      property,
      coord: resolvePropertyCoordinate(property),
    }));
    const resolvedHq = resolveHqCoordinate(CUSTOMER_HQ);
    const centerLng = resolvedHq.lng;
    const centerLat = resolvedHq.lat;
    const types: EventType[] = ["leasing", "financial", "maintenance", "ai", "resident"];
    const weights = [0.3, 0.25, 0.2, 0.15, 0.1];

    const spawnInterval = setInterval(() => {
      if (particlesRef.current.length < 60) {
        const random = resolvedProperties[Math.floor(Math.random() * resolvedProperties.length)];
        const coord = random.coord;
        let r = Math.random(), type: EventType = "leasing";
        for (let i = 0; i < types.length; i++) { r -= weights[i]; if (r <= 0) { type = types[i]; break; } }

        particlesRef.current.push({
          id: pidRef.current++,
          fromLng: coord.lng,
          fromLat: coord.lat,
          progress: 0,
          speed: 0.004 + Math.random() * 0.004,
          color: EVENT_COLORS[type],
          ctrlLng: (coord.lng + centerLng) / 2 + (Math.random() - 0.5) * 3,
          ctrlLat: (coord.lat + centerLat) / 2 + (Math.random() - 0.5) * 2,
        });
      }
    }, 250);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter((p) => p.progress <= 1);

      const cpt = map.project([centerLng, centerLat]);

      for (const p of particlesRef.current) {
        p.progress += p.speed;
        const t = p.progress;

        const fromPt = map.project([p.fromLng, p.fromLat]);
        const ctrlPt = map.project([p.ctrlLng, p.ctrlLat]);

        const x = (1 - t) ** 2 * fromPt.x + 2 * (1 - t) * t * ctrlPt.x + t ** 2 * cpt.x;
        const y = (1 - t) ** 2 * fromPt.y + 2 * (1 - t) * t * ctrlPt.y + t ** 2 * cpt.y;

        if (x < -20 || x > canvas.width + 20 || y < -20 || y > canvas.height + 20) continue;

        const alpha = t < 0.1 ? t / 0.1 : t > 0.85 ? (1 - t) / 0.15 : 0.65;

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(alpha * 35).toString(16).padStart(2, "0");
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(spawnInterval);
      cancelAnimationFrame(animRef.current);
    };
  }, [mapReady, properties]);

  return (
    <>
      <div ref={mapContainerRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
      <canvas ref={canvasRef} className="absolute inset-0 z-[5] pointer-events-none" />
    </>
  );
}
