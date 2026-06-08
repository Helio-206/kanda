import { Link } from 'react-router';
import { AlertTriangle } from 'lucide-react';
import type { DuplicateMatch } from '@/types/occurrence';
import KandaScoreDisplay from './KandaScoreDisplay';

interface DuplicateAlertProps {
  matches: DuplicateMatch[];
  onCreateNew: () => void;
  onJoin: (code: string) => void;
  loading?: boolean;
}

export default function DuplicateAlert({ matches, onCreateNew, onJoin, loading }: DuplicateAlertProps) {
  if (matches.length === 0) return null;

  return (
    <div className="card-standard border-amber-300 bg-amber-50/50 space-y-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-amber-700 shrink-0 mt-1" size={22} />
        <div>
          <h3 className="font-display text-[24px] text-kanda-text-primary">
            Possível ocorrência já existente
          </h3>
          <p className="text-sm text-kanda-text-secondary mt-2 leading-relaxed">
            O motor de análise detectou ocorrências semelhantes na mesma zona. Pode juntar-se
            à ocorrência existente para reforçar a validação comunitária ou criar um novo registo.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {matches.slice(0, 3).map(({ occurrence, distanceMeters }) => (
          <div
            key={occurrence.code}
            className="bg-white border border-kanda-divider p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <p className="overline-label text-kanda-primary">{occurrence.code}</p>
              <p className="font-medium text-kanda-text-primary">{occurrence.category}</p>
              <p className="text-xs text-kanda-text-secondary mt-1">
                {Math.round(distanceMeters)}m de distância · {occurrence.confirmations} confirmações
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <KandaScoreDisplay scores={occurrence.scores} compact />
              <button
                type="button"
                onClick={() => onJoin(occurrence.code)}
                disabled={loading}
                className="btn-primary text-sm py-3 px-5 disabled:opacity-60"
              >
                Juntar à existente
              </button>
              <Link
                to={`/ocorrencia/${occurrence.code}`}
                className="btn-secondary text-sm py-3 px-5 no-underline"
              >
                Ver detalhe
              </Link>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onCreateNew}
        disabled={loading}
        className="btn-secondary w-full sm:w-auto disabled:opacity-60"
      >
        Criar nova ocorrência
      </button>
    </div>
  );
}
