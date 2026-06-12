import { useEffect, useMemo, useRef } from 'react';
import L, { type LatLngBoundsExpression, type Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RiskLevel } from '@/types/occurrence';

export interface RealMapPoint {
  id: string;
  code?: string;
  label: string;
  lat: number;
  lng: number;
  risk?: RiskLevel;
  primary?: boolean;
}

interface RealMapProps {
  center: { lat: number; lng: number };
  points?: RealMapPoint[];
  zoom?: number;
  height?: number | string;
  interactive?: boolean;
  showRadius?: boolean;
  radiusMeters?: number;
  className?: string;
  tileUrl?: string;
  tileAttribution?: string;
  tileSubdomains?: string[];
  onPointClick?: (point: RealMapPoint) => void;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  Baixo: '#059669',
  Médio: '#D97706',
  Alto: '#EA580C',
  Crítico: '#DC2626',
};

function createMarkerIcon(point: RealMapPoint) {
  const color = point.risk ? RISK_COLORS[point.risk] : '#008A4B';
  const size = point.primary ? 34 : 26;
  const dot = point.primary ? 10 : 7;

  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `
      <span style="
        width:${size}px;
        height:${size}px;
        border-radius:999px;
        background:${color};
        border:3px solid #fff;
        box-shadow:0 10px 24px rgba(7,21,18,.28);
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <span style="
          width:${dot}px;
          height:${dot}px;
          border-radius:999px;
          background:#fff;
          display:block;
        "></span>
      </span>
    `,
  });
}

export default function RealMap({
  center,
  points = [],
  zoom = 15,
  height = 360,
  interactive = true,
  showRadius = false,
  radiusMeters = 800,
  className = '',
  tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution = '&copy; OpenStreetMap',
  tileSubdomains,
  onPointClick,
}: RealMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  const mapPoints = useMemo(() => {
    if (points.length > 0) return points;
    return [
      {
        id: 'center',
        label: 'Localização central',
        lat: center.lat,
        lng: center.lng,
        primary: true,
      },
    ];
  }, [center.lat, center.lng, points]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: interactive,
      attributionControl: true,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
    }).setView([center.lat, center.lng], zoom);

    const tileOptions = {
      maxZoom: 19,
      attribution: tileAttribution,
      ...(tileSubdomains?.length ? { subdomains: tileSubdomains } : {}),
    };

    L.tileLayer(tileUrl, tileOptions).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapRef.current = map;
    layersRef.current = layerGroup;

    return () => {
      map.remove();
      mapRef.current = null;
      layersRef.current = null;
    };
  }, [center.lat, center.lng, interactive, tileAttribution, tileSubdomains, tileUrl, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layersRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    if (showRadius) {
      L.circle([center.lat, center.lng], {
        radius: radiusMeters,
        color: '#008A4B',
        weight: 1,
        opacity: 0.85,
        fillColor: '#008A4B',
        fillOpacity: 0.08,
      }).addTo(layerGroup);
    }

    mapPoints.forEach((point) => {
      L.marker([point.lat, point.lng], { icon: createMarkerIcon(point) })
        .on('click', () => onPointClick?.(point))
        .bindPopup(point.label)
        .addTo(layerGroup);
    });

    if (mapPoints.length > 1) {
      const bounds = mapPoints.map((point) => [point.lat, point.lng]) as LatLngBoundsExpression;
      map.fitBounds(bounds, { padding: [38, 38], maxZoom: zoom });
    } else {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center.lat, center.lng, mapPoints, onPointClick, radiusMeters, showRadius, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const timer = window.setTimeout(() => map.invalidateSize(), 120);
    return () => window.clearTimeout(timer);
  }, [height]);

  return (
    <div
      ref={containerRef}
      className={`real-map h-full w-full ${className}`}
      style={{ height }}
    />
  );
}
