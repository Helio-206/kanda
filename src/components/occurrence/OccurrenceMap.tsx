import type { Occurrence, RiskLevel } from '@/types/occurrence';
import { resolveCoordinates } from '@/lib/geo/coordinates';
import RealMap, { type RealMapPoint } from '@/components/maps/RealMap';

interface OccurrenceMapProps {
  occurrence: Occurrence;
  nearby?: Occurrence[];
  height?: number;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  Baixo: '#059669',
  Médio: '#D97706',
  Alto: '#EA580C',
  Crítico: '#DC2626',
};

function buildMapPoints(occurrence: Occurrence, nearby: Occurrence[]): RealMapPoint[] {
  return [occurrence, ...nearby].map((item, index) => {
    const coords = resolveCoordinates(item.location);
    return {
      id: item.code,
      label: `${item.code} · ${item.category}`,
      lat: coords.lat,
      lng: coords.lng,
      risk: item.risk,
      primary: index === 0,
    };
  });
}

export default function OccurrenceMap({ occurrence, nearby = [], height = 380 }: OccurrenceMapProps) {
  const center = resolveCoordinates(occurrence.location);
  const points = buildMapPoints(occurrence, nearby);

  return (
    <div className="card-standard p-0 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-kanda-divider">
        <p className="overline-label text-kanda-primary mb-1">Mapa real da ocorrência</p>
        <p className="text-sm text-kanda-text-secondary">
          Localização central, raio de proximidade e registos próximos por nível de risco
        </p>
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-kanda-text-secondary">
          {(['Baixo', 'Médio', 'Alto', 'Crítico'] as RiskLevel[]).map((level) => (
            <span key={level} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: RISK_COLORS[level] }}
              />
              {level}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <RealMap
          center={center}
          points={points}
          zoom={nearby.length > 0 ? 14 : 16}
          height={height}
          showRadius
          radiusMeters={1500}
        />
        <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-kanda-border bg-white/90 px-3 py-1 text-xs text-kanda-text-secondary shadow-sm backdrop-blur">
          Raio de análise · 1,5 km
        </div>
      </div>

      <div className="px-4 py-3 text-xs text-kanda-text-secondary border-t border-kanda-divider flex flex-wrap justify-between gap-2">
        <span>
          Centro: {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
        </span>
        {nearby.length > 0 && (
          <span>{nearby.length} ocorrência{nearby.length !== 1 ? 's' : ''} próxima{nearby.length !== 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  );
}
