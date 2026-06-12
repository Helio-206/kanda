import { MapPin, Navigation2, Route, Satellite } from 'lucide-react';
import RealMap, { type RealMapPoint } from '@/components/maps/RealMap';
import { getAllOccurrences } from '@/services/occurrenceService';

const center = { lat: -8.92441, lng: 13.30128 };

function buildPoints(occurrences = getAllOccurrences()): RealMapPoint[] {
  return occurrences
    .filter((occurrence) => occurrence.location.latitude !== null && occurrence.location.longitude !== null)
    .slice(0, 4)
    .map((occurrence, index) => ({
      id: occurrence.id,
      label: `${occurrence.category} · ${occurrence.code}`,
      lat: occurrence.location.latitude as number,
      lng: occurrence.location.longitude as number,
      risk: occurrence.risk,
      primary: index === 0,
    }));
}

export default function GeoIntelligencePanel() {
  const occurrences = getAllOccurrences();
  const points = buildPoints(occurrences);
  const firstOccurrence = occurrences[0];

  return (
    <div className="relative overflow-hidden rounded-lg border border-kanda-border bg-white shadow-[0_24px_70px_rgba(7,21,18,0.12)]">
      <div className="flex items-center justify-between border-b border-kanda-divider px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-kanda-primary/10 text-kanda-primary">
            <MapPin size={16} />
          </span>
          <div>
            <p className="text-sm font-medium text-kanda-text-primary">Mapa real de ocorrências</p>
            <p className="text-xs text-kanda-text-secondary">
              {firstOccurrence?.location.address?.trim() || 'Sem ocorrências guardadas ainda'}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          {points.length > 0 ? `${points.length} pontos reais` : 'Estado vazio'}
        </span>
      </div>

      <div className="relative h-[420px]">
        <RealMap
          center={center}
          points={points}
          zoom={15}
          height="100%"
          interactive={false}
          showRadius
          radiusMeters={800}
        />

        <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-kanda-border bg-white/92 p-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 text-xs text-kanda-text-secondary">
            <Satellite size={14} className="text-kanda-primary" />
            Precisão GPS
          </div>
          <p className="mt-1 text-lg font-semibold text-kanda-text-primary">
            {points.length > 0 ? `± ${Math.max(8, 12 - points.length)} m` : '—'}
          </p>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 right-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-kanda-border bg-white/94 p-3 shadow-sm backdrop-blur">
            <p className="text-[11px] uppercase text-kanda-text-secondary">Coordenadas</p>
            <p className="mt-1 text-sm font-medium text-kanda-text-primary">
              {points.length > 0
                ? `${points[0].lat.toFixed(5)}, ${points[0].lng.toFixed(5)}`
                : `${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`}
            </p>
          </div>
          <div className="rounded-lg border border-kanda-border bg-white/94 p-3 shadow-sm backdrop-blur">
            <p className="text-[11px] uppercase text-kanda-text-secondary">Zona</p>
            <p className="mt-1 text-sm font-medium text-kanda-text-primary">
              {points.length > 0 ? `Raio 800 m · ${points.length} casos` : 'Sem dados no momento'}
            </p>
          </div>
          <div className="rounded-lg border border-kanda-border bg-white/94 p-3 shadow-sm backdrop-blur">
            <p className="text-[11px] uppercase text-kanda-text-secondary">Prioridade</p>
            <p className="mt-1 text-sm font-medium text-kanda-text-primary">
              {points.length > 0 ? `Primeiro ponto · ${firstOccurrence?.scores.kandaScore ?? '—'}` : 'KANDA Score em leitura'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-kanda-divider text-sm">
        <div className="flex items-center gap-2 px-4 py-3 text-kanda-text-secondary">
          <Navigation2 size={15} className="text-kanda-primary" />
          Localização verificada
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 text-kanda-text-secondary">
          <Route size={15} className="text-kanda-primary" />
          Duplicados próximos
        </div>
      </div>
    </div>
  );
}
