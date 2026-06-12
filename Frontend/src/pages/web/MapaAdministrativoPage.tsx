import { MapPinned, Navigation2, Radar } from 'lucide-react';
import { useNavigate } from 'react-router';
import AppLayout from '@/components/layout/AppLayout';
import RealMap, { type RealMapPoint } from '@/components/maps/RealMap';
import { Badge } from '@/components/ui/badge';
import { useOperationalOccurrences } from './operationalData';

function areaLabel(address: string) {
  const [first] = address.split(',').map((part) => part.trim()).filter(Boolean);
  return first || 'Local sem nome';
}

export default function MapaAdministrativoPage() {
  const navigate = useNavigate();
  const occurrences = useOperationalOccurrences();

  const points: RealMapPoint[] = occurrences
    .filter((item) => item.location.latitude !== null && item.location.longitude !== null)
    .slice(0, 25)
    .map((item, index) => ({
      id: item.id,
      code: item.code,
      label: `${item.category} · ${item.code}`,
      lat: item.location.latitude as number,
      lng: item.location.longitude as number,
      risk: item.risk,
      primary: index === 0,
    }));

  const center = points[0]
    ? { lat: points[0].lat, lng: points[0].lng }
    : { lat: -8.839, lng: 13.2894 };

  const totalConfirmations = occurrences.reduce((sum, item) => sum + item.confirmations, 0);

  return (
    <AppLayout
      title="Mapa Administrativo"
      subtitle="Mapa real, com ruas, marcadores e leitura territorial."
      showVision={false}>
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="card-standard bg-kanda-dark text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <p className="overline-label text-kanda-primary">Território</p>
                <h2 className="font-display text-[34px] leading-tight">Mapa real, sem fantasia.</h2>
                <p className="max-w-2xl text-sm leading-relaxed text-white/76">
                  A leitura é feita sobre ruas e pontos reais para perceber pressão, concentração e resposta.
                </p>
              </div>
              <Badge variant="secondary" className="bg-white/10 text-white border-white/10">
                {points.length} pontos
              </Badge>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Pontos</p>
                <p className="mt-2 text-3xl font-display">{points.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Críticas</p>
                <p className="mt-2 text-3xl font-display">
                  {occurrences.filter((item) => item.risk === 'Crítico').length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Confirmações</p>
                <p className="mt-2 text-3xl font-display">{totalConfirmations}</p>
              </div>
            </div>
          </div>

          <aside className="card-standard space-y-4">
            <p className="overline-label text-kanda-primary">Sinais rápidos</p>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-kanda-border bg-kanda-background p-4">
                <div className="flex items-center gap-2">
                  <Navigation2 className="text-kanda-primary" size={16} />
                  <p className="font-medium text-kanda-text-primary">Zona principal</p>
                </div>
                <p className="mt-2 text-sm text-kanda-text-secondary">
                  {points[0] ? areaLabel(occurrences[0]?.location.address ?? '') : 'Sem zona ainda'}
                </p>
              </div>
              <div className="rounded-2xl border border-kanda-border bg-kanda-background p-4">
                <div className="flex items-center gap-2">
                  <Radar className="text-kanda-primary" size={16} />
                  <p className="font-medium text-kanda-text-primary">Leitura</p>
                </div>
                <p className="mt-2 text-sm text-kanda-text-secondary">
                  O mapa mostra distribuição, não só pin solto.
                </p>
              </div>
            </div>
          </aside>
        </section>

        <section className="card-standard space-y-4">
          <div className="flex items-center gap-2">
            <MapPinned className="text-kanda-primary" size={18} />
            <h3 className="font-display text-[24px] text-kanda-text-primary">Mapa</h3>
          </div>

          {points.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-kanda-border bg-kanda-background px-6 py-10 text-center">
              <p className="font-medium text-kanda-text-primary">Sem ocorrências com localização ainda.</p>
              <p className="mt-2 text-sm text-kanda-text-secondary">
                Assim que houver dados, o mapa passa a mostrar ruas e marcadores reais.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[28px] border border-kanda-border shadow-[0_24px_70px_rgba(7,21,18,0.12)]">
              <RealMap
                center={center}
                points={points}
                zoom={14}
                height={640}
                interactive
                showRadius
                radiusMeters={1000}
                tileUrl="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                tileAttribution='&copy; OpenStreetMap &copy; CARTO'
                tileSubdomains={['a', 'b', 'c', 'd']}
                onPointClick={(point) => {
                  if (!point.code) return;
                  navigate(`/legacy/ocorrencia/${point.code}`);
                }}
              />
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
