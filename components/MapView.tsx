"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { ShopWithRating } from "@/lib/types";

interface MapViewProps {
  shops: ShopWithRating[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  // When true, the map renders as a static, non-gesture preview and tapping
  // it opens a full-screen map with native app-style gesture handling. Used
  // on mobile so pinch-to-zoom never fights the page's own scroll/zoom.
  expandable?: boolean;
}

const NYC_CENTER = { lat: 40.72, lng: -73.96 };
const MARKER_SIZE = 46;

const tartIcon = (highlight: boolean) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${MARKER_SIZE}" height="${MARKER_SIZE}" viewBox="0 0 46 46">
      <ellipse cx="23" cy="42" rx="7" ry="2" fill="#3A2A1B" opacity="0.18"/>
      <circle cx="23" cy="21" r="19" fill="${highlight ? "#A64B35" : "#FEF9EF"}" stroke="#7A4A21" stroke-width="3"/>
      <ellipse cx="23" cy="23" rx="11.5" ry="7.5" fill="#E8C97E" stroke="#7A4A21" stroke-width="1.8"/>
      <ellipse cx="23" cy="21" rx="8" ry="4.5" fill="#F0B429"/>
    </svg>`
  );

const clusterIcon = (count: number, size: number) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 3}" fill="#A64B35" stroke="#FEF9EF" stroke-width="3"/>
      <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle" font-family="Georgia,serif" font-weight="700" font-size="${size * 0.34}" fill="#FEF9EF">${count}</text>
    </svg>`
  );

const warmMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f6efdf" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b573f" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#fef9ef" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#cfdbd5" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#fef9ef" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#f0e4c9" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

// Creates (and tears down) a Google Map bound to `containerRef` whenever
// `active` becomes true, and keeps its markers/clusters in sync with
// `shops`/`selectedId`. Used for both the inline preview and the full-screen
// map so the marker/cluster logic isn't duplicated.
function useMapMarkers({
  containerRef,
  shops,
  selectedId,
  onSelect,
  gestureHandling,
  zoomControl,
  interactive,
  active,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  shops: ShopWithRating[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  gestureHandling: "greedy" | "none";
  zoomControl: boolean;
  interactive: boolean;
  active: boolean;
}) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);
  const hasFitOnceRef = useRef(false);
  const shopsRef = useRef(shops);
  shopsRef.current = shops;
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;

  function renderMarkers() {
    const map = mapRef.current;
    if (!map) return;
    clustererRef.current?.clearMarkers();
    markersRef.current.clear();
    const markers = shopsRef.current.map((shop) => {
      const marker = new google.maps.Marker({
        position: { lat: shop.lat, lng: shop.lng },
        title: shop.name,
        icon: {
          url: tartIcon(shop.id === selectedRef.current),
          scaledSize: new google.maps.Size(MARKER_SIZE, MARKER_SIZE),
          anchor: new google.maps.Point(MARKER_SIZE / 2, MARKER_SIZE - 6),
        },
      });
      if (interactive) {
        marker.addListener("click", () => {
          onSelect(shop.id);
          const rating =
            shop.overall_rating === null
              ? "No ratings yet"
              : `${shop.overall_rating.toFixed(1)} / 5 (${shop.review_count})`;
          infoRef.current?.setContent(
            `<div style="color:#3A2A1B;max-width:230px;padding:2px 2px 4px">
              <strong style="font-family:var(--font-bitter),Georgia,serif;font-size:16px;font-weight:600;line-height:1.15;display:block">${shop.name}</strong>
              <div style="font-family:var(--font-schibsted),system-ui,sans-serif;font-size:13px;margin-top:3px;color:#6B573F">${shop.neighborhood}, ${shop.borough}</div>
              <div style="font-family:var(--font-schibsted),system-ui,sans-serif;font-size:13px;margin-top:2px;font-weight:700">${rating}</div>
              <a href="/shops/${shop.id}" style="font-family:var(--font-schibsted),system-ui,sans-serif;display:inline-block;margin-top:8px;font-size:13px;font-weight:700;color:#FEF9EF;background:#7A4A21;padding:6px 12px;border-radius:999px;text-decoration:none">See the tarts</a>
            </div>`
          );
          infoRef.current?.open({ map, anchor: marker });
        });
      }
      markersRef.current.set(shop.id, marker);
      return marker;
    });
    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({
        map,
        markers,
        renderer: {
          render: ({ count, position }) =>
            new google.maps.Marker({
              position,
              icon: {
                url: clusterIcon(count, count > 20 ? 60 : count > 8 ? 52 : 44),
                scaledSize: new google.maps.Size(
                  count > 20 ? 60 : count > 8 ? 52 : 44,
                  count > 20 ? 60 : count > 8 ? 52 : 44
                ),
              },
              zIndex: 1000 + count,
            }),
        },
      });
    } else {
      clustererRef.current.addMarkers(markers);
    }

    if (!hasFitOnceRef.current && shopsRef.current.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      shopsRef.current.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
      map.fitBounds(bounds, 48);
      hasFitOnceRef.current = true;
    }
  }

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      v: "weekly",
    });
    importLibrary("maps").then(() => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      mapRef.current = new google.maps.Map(containerRef.current, {
        center: NYC_CENTER,
        zoom: 11,
        styles: warmMapStyle,
        gestureHandling,
        zoomControl,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
      });
      infoRef.current = new google.maps.InfoWindow();
      renderMarkers();
    });
    return () => {
      cancelled = true;
      clustererRef.current?.clearMarkers();
      clustererRef.current = null;
      markersRef.current.clear();
      mapRef.current = null;
      hasFitOnceRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (mapRef.current) renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shops, active]);

  useEffect(() => {
    if (!mapRef.current) return;
    markersRef.current.forEach((marker, id) => {
      marker.setIcon({
        url: tartIcon(id === selectedId),
        scaledSize: new google.maps.Size(MARKER_SIZE, MARKER_SIZE),
        anchor: new google.maps.Point(MARKER_SIZE / 2, MARKER_SIZE - 6),
      });
      marker.setZIndex(id === selectedId ? 999 : undefined);
    });
    if (selectedId) {
      const shop = shopsRef.current.find((s) => s.id === selectedId);
      if (shop) mapRef.current.panTo({ lat: shop.lat, lng: shop.lng });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, active]);
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close full-screen map"
      className="absolute left-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-line bg-paper shadow-modal transition-colors hover:bg-cream"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3A2A1B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 6l-7 6 7 6" />
      </svg>
    </button>
  );
}

export default function MapView({ shops, selectedId, onSelect, expandable }: MapViewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const fullRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useMapMarkers({
    containerRef: previewRef,
    shops,
    selectedId,
    onSelect,
    gestureHandling: expandable ? "none" : "greedy",
    zoomControl: !expandable,
    interactive: !expandable,
    active: true,
  });

  useMapMarkers({
    containerRef: fullRef,
    shops,
    selectedId,
    onSelect,
    gestureHandling: "greedy",
    zoomControl: true,
    interactive: true,
    active: !!expandable && fullscreen,
  });

  useEffect(() => {
    if (!fullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen]);

  if (!expandable) {
    return <div ref={previewRef} className="h-full w-full" aria-label="Map of egg tart shops" />;
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Open full-screen map"
        onClick={() => setFullscreen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFullscreen(true);
          }
        }}
        className="h-full w-full cursor-pointer"
      >
        <div ref={previewRef} className="h-full w-full" aria-label="Map of egg tart shops" />
      </div>

      {fullscreen &&
        createPortal(
          <div className="fixed inset-0 z-[110] bg-paper">
            <div ref={fullRef} className="absolute inset-0" aria-label="Map of egg tart shops, expanded" />
            <BackButton onClick={() => setFullscreen(false)} />
          </div>,
          document.body
        )}
    </>
  );
}
