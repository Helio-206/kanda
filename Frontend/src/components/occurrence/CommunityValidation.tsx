import { useState } from 'react';
import { Users, CheckCircle2 } from 'lucide-react';
import type { Occurrence } from '@/types/occurrence';
import { confirmOccurrence, hasUserConfirmed } from '@/services/occurrenceService';

interface CommunityValidationProps {
  occurrence: Occurrence;
  onConfirmed: (updated: Occurrence) => void;
}

export default function CommunityValidation({ occurrence, onConfirmed }: CommunityValidationProps) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(hasUserConfirmed(occurrence.code));

  const handleConfirm = () => {
    setLoading(true);
    const updated = confirmOccurrence(occurrence.code);
    if (updated) {
      setConfirmed(true);
      onConfirmed(updated);
    }
    setLoading(false);
  };

  return (
    <div className="card-standard">
      <div className="flex items-start gap-3">
        <Users className="text-kanda-primary shrink-0 mt-1" size={22} />
        <div className="flex-1">
          <h3 className="font-display text-[24px] text-kanda-text-primary">Validação comunitária</h3>
          <p className="text-sm text-kanda-text-secondary mt-2 leading-relaxed">
            Confirme se reconhece este problema no local. Cada confirmação aumenta o Confidence Score
            e a relevância da ocorrência para as entidades.
          </p>

          <p className="mt-4 text-kanda-text-primary font-medium">
            Confirmado por {occurrence.confirmations} cidadão
            {occurrence.confirmations !== 1 ? 's' : ''}.
          </p>

          {confirmed ? (
            <div className="mt-4 flex items-center gap-2 text-emerald-700 text-sm">
              <CheckCircle2 size={18} />
              Obrigado — a sua confirmação foi registada.
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="btn-primary mt-4 disabled:opacity-60"
            >
              {loading ? 'A registar...' : 'Confirmar Ocorrência'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
