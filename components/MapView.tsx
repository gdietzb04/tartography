"use client";

import { useEffect, useRef } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import type { ShopWithRating } from "@/lib/types";

interface MapViewProps {
  shops: ShopWithRating[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const NYC_CENTER = { lat: 40.72, lng: -73.96 };

const tartIcon = (highlight: boolean) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="15" fill="${highlight ? "#A64B35" : "#FEF9EF"}" stroke="#7A4A21" stroke-width="2.5"/>
      <ellipse cx="18" cy="19" rx="9" ry="6" fill="#E8C97E" stroke="#7A4A21" stroke-width="1.5"/>
      <ellipse cx="18" cy="18" rx="6" ry="3.5" fill="#F0B429"/>
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

export default function MapView({ shops, selectedId, onSelect }: MapViewProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const infoRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    let cancelled = false;
    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      v: "weekly",
    });
    importLibrary("maps").then(() => {
      if (cancelled || !divRef.current || mapRef.current) return;
      mapRef.current = new google.maps.Map(divRef.current, {
        center: NYC_CENTER,
        zoom: 11,
        styles: warmMapStyle,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      infoRef.current = new google.maps.InfoWindow();
      renderMarkers();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function renderMarkers() {
    const map = mapRef.current;
    if (!map) return;
    clustererRef.current?.clearMarkers();
    markersRef.current.clear();
    const markers = shops.map((shop) => {
      const marker = new google.maps.Marker({
        position: { lat: shop.lat, lng: shop.lng },
        title: shop.name,
        icon: {
          url: tartIcon(shop.id === selectedId),
          scaledSize: new google.maps.Size(36, 36),
        },
      });
      marker.addListener("click", () => {
        onSelect(shop.id);
        const rating =
          shop.overall_rating === null
            ? "No ratings yet"
            : `${shop.overall_rating.toFixed(1)} / 5 (${shop.review_count})`;
        infoRef.current?.setContent(
          `<div style="font-family:Georgia,serif;color:#3A2A1B;max-width:220px">
            <strong style="font-size:15px">${shop.name}</strong>
            <div style="font-size:13px;margin-top:2px">${shop.neighborhood}, ${shop.borough}</div>
            <div style="font-size:13px;margin-top:2px">${rating}</div>
            <a href="/shops/${shop.id}" style="display:inline-block;margin-top:6px;font-size:13px;font-weight:bold;color:#B5651D">See the tarts</a>
          </div>`
        );
        infoRef.current?.open({ map, anchor: marker });
      });
      markersRef.current.set(shop.id, marker);
      return marker;
    });
    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({ map, markers });
    } else {
      clustererRef.current.addMarkers(markers);
    }
  }

  useEffect(() => {
    if (mapRef.current) renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shops]);

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      marker.setIcon({
        url: tartIcon(id === selectedId),
        scaledSize: new google.maps.Size(36, 36),
      });
    });
    if (selectedId) {
      const shop = shops.find((s) => s.id === selectedId);
      if (shop && mapRef.current) mapRef.current.panTo({ lat: shop.lat, lng: shop.lng });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return <div ref={divRef} className="h-full w-full rounded-card" aria-label="Map of egg tart shops" />;
}
