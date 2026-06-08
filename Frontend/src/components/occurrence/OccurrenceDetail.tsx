import type { Occurrence } from '@/types/occurrence';
import StatusBadge from '@/components/occurrence/StatusBadge';
import RiskBadge from '@/components/occurrence/RiskBadge';
import KandaScoreDisplay from '@/components/occurrence/KandaScoreDisplay';
import OccurrenceMap from '@/components/occurrence/OccurrenceMap';
import Timeline from '@/components/occurrence/Timeline';

interface OccurrenceDetailProps {
  occurrence: Occurrence;
  nearby?: Occurrence[];
  showTimeline?: boolean;
  showMap?: boolean;
}

export default function OccurrenceDetail({
  occurrence,
  nearby = [],
  showTimeline = true,
  showMap = true,
}: OccurrenceDetailProps) {
  return (
    <div className="space-y-6">
      <div className="card-standard p-0 overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[320px] bg-kanda-map-land">
            <img
              src={occurrence.imageUrl}
              alt={occurrence.category}
              className="h-full min-h-[320px] w-full object-cover"
            />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <StatusBadge status={occurrence.status} />
              <RiskBadge risk={occurrence.risk} />
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/40 bg-white/92 p-4 shadow-sm backdrop-blur">
              <p className="overline-label text-kanda-primary">{occurrence.code}</p>
              <p className="mt-1 text-sm text-kanda-text-secondary">
                Registo criado em {new Date(occurrence.createdAt).toLocaleDateString('pt-PT')}
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div>
              <h2 className="font-display text-[34px] text-kanda-text-primary leading-tight">
                {occurrence.category}
              </h2>
              <p className="text-kanda-text-secondary mt-3 leading-relaxed">{occurrence.description}</p>
              {occurrence.confirmations > 0 && (
                <p className="mt-3 text-sm text-kanda-text-secondary">
                  {occurrence.confirmations} confirmação{occurrence.confirmations !== 1 ? 'ões' : ''} da comunidade
                </p>
              )}
            </div>

            <KandaScoreDisplay scores={occurrence.scores} />

            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <div className="border-t border-kanda-divider pt-4">
                <p className="overline-label text-kanda-text-secondary mb-2">Responsável sugerido</p>
                <p className="text-sm font-medium text-kanda-text-primary">{occurrence.responsibleEntity}</p>
              </div>
              <div className="border-t border-kanda-divider pt-4">
                <p className="overline-label text-kanda-text-secondary mb-2">Próxima acção sugerida</p>
                <p className="text-sm font-medium text-kanda-text-primary">{occurrence.suggestedAction}</p>
              </div>
              <div className="border-t border-kanda-divider pt-4 md:col-span-2">
                <p className="overline-label text-kanda-text-secondary mb-2">Localização</p>
                <p className="text-sm font-medium text-kanda-text-primary">{occurrence.location.address || 'Não indicada'}</p>
                {occurrence.location.latitude !== null && occurrence.location.longitude !== null && (
                  <p className="text-sm text-kanda-text-secondary mt-1">
                    {occurrence.location.latitude.toFixed(5)}, {occurrence.location.longitude.toFixed(5)}
                  </p>
                )}
              </div>
              {occurrence.citizenNote && (
                <div className="border-t border-kanda-divider pt-4 md:col-span-2">
                  <p className="overline-label text-kanda-text-secondary mb-2">Observação</p>
                  <p className="text-sm text-kanda-text-primary">{occurrence.citizenNote}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showMap && <OccurrenceMap occurrence={occurrence} nearby={nearby} />}

      {showTimeline && (
        <div className="card-standard">
          <h3 className="font-display text-[24px] text-kanda-text-primary mb-6">Histórico de actualizações</h3>
          <Timeline history={occurrence.history} />
        </div>
      )}
    </div>
  );
}
