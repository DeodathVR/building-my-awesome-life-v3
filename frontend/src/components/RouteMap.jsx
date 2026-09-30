import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet';

/**
 * RouteMap — draws a GPS path on an OpenStreetMap tile background.
 *
 * Props:
 *   points   - [{lat, lng, ...}]  the path
 *   live     - if true, auto-pans to keep the latest point in view (during tracking)
 *   height   - CSS height (default 260px)
 *
 * When no points yet, renders a neutral gray placeholder with a "waiting for GPS..." hint.
 */
export const RouteMap = ({ points = [], live = false, height = 260 }) => {
  const cleaned = useMemo(
    () => points.filter((p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lng)),
    [points],
  );

  if (cleaned.length === 0) {
    return (
      <div
        data-testid="route-map-empty"
        className="rounded-2xl bg-muted flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        Waiting for GPS signal…
      </div>
    );
  }

  // Compute bounds for a static fit
  const lats = cleaned.map((p) => p.lat);
  const lngs = cleaned.map((p) => p.lng);
  const center = [(Math.min(...lats) + Math.max(...lats)) / 2,
                  (Math.min(...lngs) + Math.max(...lngs)) / 2];
  const positions = cleaned.map((p) => [p.lat, p.lng]);
  const start = positions[0];
  const end = positions[positions.length - 1];

  return (
    <div
      data-testid="route-map"
      className="rounded-2xl overflow-hidden border border-border"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={!live}
        zoomControl={!live}
        dragging={!live}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />
        {positions.length > 1 && (
          <Polyline positions={positions} pathOptions={{ color: '#0EA36F', weight: 4, opacity: 0.9 }} />
        )}
        <CircleMarker center={start} radius={6} pathOptions={{ color: '#fff', fillColor: '#0EA36F', fillOpacity: 1, weight: 2 }} />
        <CircleMarker center={end}   radius={6} pathOptions={{ color: '#fff', fillColor: '#E11D48', fillOpacity: 1, weight: 2 }} />
        {live && positions.length > 0 && <FollowLast position={end} />}
        {!live && <FitToBounds positions={positions} />}
      </MapContainer>
    </div>
  );
};

// Auto-pan the map to keep the latest GPS point visible during tracking.
const FollowLast = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom(), { animate: true, duration: 0.4 });
  }, [position, map]);
  return null;
};

// Fit the map to the full path when viewing a saved session.
const FitToBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(positions, { padding: [24, 24] });
    }
  }, [positions, map]);
  return null;
};

export default RouteMap;
