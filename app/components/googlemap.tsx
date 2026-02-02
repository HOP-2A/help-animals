"use client";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";

type Props = {
  onSelect: (lat: number, lng: number) => void;
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function FlyToLocation({ position }: { position: [number, number] | null }) {
  const map = useMap();

  if (position) {
    map.flyTo(position, 15);
  }

  return null;
}

export default function SelectLocationMap({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<[number, number] | null>(null);

  const searchLocation = async () => {
    if (!query) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query,
      )}`,
    );

    const data = await res.json();

    if (!data.length) return;

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);

    setPosition([lat, lng]);
    onSelect(lat, lng);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder="Байршил хайх (ж: Zorig San )"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={searchLocation}
          className="px-4 py-2 rounded bg-black text-white"
        >
          Хайх
        </button>
      </div>

      <MapContainer
        center={[47.8864, 106.9057]}
        zoom={13}
        style={{ height: "400px", width: "100%", borderRadius: 12 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}
