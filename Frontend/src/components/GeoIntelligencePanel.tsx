import { MapPin, Navigation2, Route, Satellite } from 'lucide-react';
import RealMap, { type RealMapPoint } from '@/components/maps/RealMap';

const center = { lat: -8.92441, lng: 13.30128 };

const points: RealMapPoint[] = [
  { id: 'principal', label: 'Ocorrência principal · KANDA Score 91', ...center, risk: 'Crítico', primary: true },
  { id: 'alto', label: 'Buraco na via pública · risco alto', lat: -8.9197, lng: 13.3072, risk: 'Alto' },
  { id: 'medio', label: 'Lixo acumulado · risco médio', lat: -8.9278, lng: 13.2949, risk: 'Médio' },
  { id: 'baixo', label: 'Iluminação reportada · risco baixo', lat: -8.9312, lng: 13.3142, risk: 'Baixo' },
];

export default function GeoIntelligencePanel() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-kanda-border bg-white shadow-[0_24px_70px_rgba(7,21,18,0.12)]">
      <div className="flex items-center justify-between border-b border-kanda-divider px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-kanda-primary/10 text-kanda-primary">
            <MapPin size={16} />
          </span>
          <div>
            <p className="text-sm font-medium text-kanda-text-primary">Mapa real de ocorrências</p>
            <p className="text-xs text-kanda-text-secondary">Talatona · Luanda</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          GPS ativo
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
          <p className="mt-1 text-lg font-semibold text-kanda-text-primary">± 12 m</p>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 right-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-kanda-border bg-white/94 p-3 shadow-sm backdrop-blur">
            <p className="text-[11px] uppercase text-kanda-text-secondary">Coordenadas</p>
            <p className="mt-1 text-sm font-medium text-kanda-text-primary">-8.92441, 13.30128</p>
          </div>
          <div className="rounded-lg border border-kanda-border bg-white/94 p-3 shadow-sm backdrop-blur">
            <p className="text-[11px] uppercase text-kanda-text-secondary">Zona</p>
            <p className="mt-1 text-sm font-medium text-kanda-text-primary">Raio 800 m</p>
          </div>
          <div className="rounded-lg border border-kanda-border bg-white/94 p-3 shadow-sm backdrop-blur">
            <p className="text-[11px] uppercase text-kanda-text-secondary">Prioridade</p>
            <p className="mt-1 text-sm font-medium text-kanda-text-primary">KANDA Score 91</p>
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
