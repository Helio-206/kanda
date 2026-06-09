import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import AppLayout from '@/components/layout/AppLayout';
import OccurrenceDetail from '@/components/occurrence/OccurrenceDetail';
import CommunityValidation from '@/components/occurrence/CommunityValidation';
import EmptyState from '@/components/occurrence/EmptyState';
import type { Occurrence } from '@/types/occurrence';
import { getNearbyOccurrences, getOccurrenceByCode } from '@/services/occurrenceService';
import { INSTITUTIONAL } from '@/lib/copy/productLanguage';

interface OccurrenceView {
  occurrence: Occurrence | null;
  nearby: Occurrence[];
}

function loadOccurrenceView(codigo?: string): OccurrenceView {
  if (!codigo) return { occurrence: null, nearby: [] };

  const occurrence = getOccurrenceByCode(codigo);
  return {
    occurrence,
    nearby: occurrence ? getNearbyOccurrences(occurrence.code) : [],
  };
}

export default function OcorrenciaPage() {
  const { codigo } = useParams<{ codigo: string }>();
  const [, setRefreshKey] = useState(0);
  const { occurrence, nearby } = loadOccurrenceView(codigo);

  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  if (!occurrence) {
    return (
      <AppLayout title="Ocorrência não encontrada">
        <EmptyState
          title="Código inválido"
          description="Não encontrámos nenhuma ocorrência com este código na plataforma KANDA."
          action={
            <Link to="/legacy/acompanhar" className="btn-primary no-underline">
              Tentar novamente
            </Link>
          }
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Acompanhamento de ocorrência"
      subtitle={`${INSTITUTIONAL.trackSubtitle} Código: ${occurrence.code}`}
    >
      <OccurrenceDetail occurrence={occurrence} nearby={nearby} />

      <div className="mt-6">
        <CommunityValidation
          occurrence={occurrence}
          onConfirmed={() => setRefreshKey((value) => value + 1)}
        />
      </div>

      <div className="mt-8">
        <Link to="/legacy/reportar" className="btn-secondary no-underline">
          Registar nova ocorrência
        </Link>
      </div>
    </AppLayout>
  );
}
