import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { BadgeCheck, Brain, Camera, CheckCircle2, Loader2, MapPin } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import ImageUploader from '@/components/occurrence/ImageUploader';
import LocationInput from '@/components/occurrence/LocationInput';
import OccurrenceDetail from '@/components/occurrence/OccurrenceDetail';
import DuplicateAlert from '@/components/occurrence/DuplicateAlert';
import type { OccurrenceAnalysisResult, DuplicateMatch, Occurrence, OccurrenceLocation } from '@/types/occurrence';
import {
  analyzeImage,
  createOccurrence,
  findDuplicateOccurrences,
  joinExistingOccurrence,
} from '@/services/occurrenceService';
import { INSTITUTIONAL } from '@/lib/copy/productLanguage';

const emptyLocation: OccurrenceLocation = {
  latitude: null,
  longitude: null,
  address: '',
};

const FLOW_STEPS = [
  { label: 'Fotografia', icon: Camera },
  { label: 'Localização', icon: MapPin },
  { label: 'Análise', icon: Brain },
  { label: 'Código', icon: BadgeCheck },
] as const;

function FlowStepper({ activeIndex = 0 }: { activeIndex?: number }) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-2 md:grid-cols-4">
      {FLOW_STEPS.map((step, index) => {
        const Icon = step.icon;
        const active = index <= activeIndex;
        return (
          <div
            key={step.label}
            className={[
              'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm',
              active
                ? 'border-kanda-primary/30 bg-kanda-primary/5 text-kanda-text-primary'
                : 'border-kanda-border bg-white text-kanda-text-secondary',
            ].join(' ')}
          >
            <span
              className={[
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                active ? 'bg-kanda-primary text-white' : 'bg-kanda-map-land text-kanda-text-secondary',
              ].join(' ')}
            >
              <Icon size={15} />
            </span>
            {step.label}
          </div>
        );
      })}
    </div>
  );
}

export default function ReportarPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<OccurrenceLocation>(emptyLocation);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [occurrence, setOccurrence] = useState<Occurrence | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<OccurrenceAnalysisResult | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);

  const handleImageChange = (nextFile: File | null, nextPreview: string | null) => {
    setFile(nextFile);
    setPreviewUrl(nextPreview);
  };

  const finalizeCreate = async (analysis: OccurrenceAnalysisResult) => {
    if (!file) return;
    const created = await createOccurrence({
      image: file,
      location,
      citizenNote: note,
      analysis,
    });
    setOccurrence(created);
    setPendingAnalysis(null);
    setDuplicates([]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!file) {
      setError('Seleccione uma fotografia do problema.');
      return;
    }

    if (!location.address.trim()) {
      setError('Indique a localização ou autorize o GPS.');
      return;
    }

    setLoading(true);
    setAnalyzing(true);

    try {
      const analysis = await analyzeImage(file, location, note);
      setAnalyzing(false);

      const matches = findDuplicateOccurrences(location, analysis.categoryKey);
      if (matches.length > 0) {
        setPendingAnalysis(analysis);
        setDuplicates(matches);
        setLoading(false);
        return;
      }

      await finalizeCreate(analysis);
    } catch {
      setError('Não foi possível processar a ocorrência. Tente novamente.');
      setAnalyzing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if (!pendingAnalysis) return;
    setLoading(true);
    try {
      await finalizeCreate(pendingAnalysis);
    } catch {
      setError('Não foi possível criar a ocorrência.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (code: string) => {
    setLoading(true);
    const updated = joinExistingOccurrence(code, note || undefined);
    setLoading(false);
    if (updated) {
      navigate(`/legacy/ocorrencia/${updated.code}`);
    }
  };

  if (occurrence) {
    return (
      <AppLayout title="Ocorrência registada" subtitle={INSTITUTIONAL.successSubtitle}>
        <FlowStepper activeIndex={3} />
        <div className="card-standard mb-6 border-kanda-primary/20 bg-kanda-primary/5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-kanda-primary shrink-0 mt-1" size={20} />
            <div>
              <p className="font-medium text-kanda-text-primary">
                Análise concluída
              </p>
              <p className="text-sm text-kanda-text-secondary mt-1">
                KANDA Score {occurrence.scores.kandaScore} · Responsável sugerido:{' '}
                {occurrence.responsibleEntity}
              </p>
            </div>
          </div>
        </div>

        <OccurrenceDetail occurrence={occurrence} showTimeline={false} showMap />

        <div className="flex flex-wrap gap-4 mt-8">
          <Link to={`/legacy/ocorrencia/${occurrence.code}`} className="btn-primary no-underline">
            Acompanhar ocorrência
          </Link>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setFile(null);
              setPreviewUrl(null);
              setLocation(emptyLocation);
              setNote('');
              setOccurrence(null);
              setError(null);
              setPendingAnalysis(null);
              setDuplicates([]);
            }}
          >
            Registar nova ocorrência
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={INSTITUTIONAL.reportTitle} subtitle={INSTITUTIONAL.reportSubtitle}>
      <FlowStepper activeIndex={analyzing ? 2 : file && location.address ? 1 : file ? 0 : 0} />
      {duplicates.length > 0 && pendingAnalysis && (
        <div className="mb-8">
          <DuplicateAlert
            matches={duplicates}
            onCreateNew={handleCreateNew}
            onJoin={handleJoin}
            loading={loading}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card-standard space-y-6">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="overline-label text-kanda-primary mb-4">1. Fotografia</p>
              <ImageUploader file={file} previewUrl={previewUrl} onChange={handleImageChange} />
            </div>

            <div>
              <p className="overline-label text-kanda-primary mb-4">2. Localização</p>
              <LocationInput value={location} onChange={setLocation} />
            </div>
          </div>

          <div>
            <p className="overline-label text-kanda-primary mb-4">3. Observação (opcional)</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Detalhes adicionais para a análise automática..."
              className="w-full rounded-lg border border-kanda-border bg-white px-4 py-3 text-kanda-text-primary placeholder:text-kanda-text-secondary/60 focus:border-kanda-primary focus:outline-none resize-y"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">{error}</p>
        )}

        {analyzing && (
          <div className="card-standard flex items-center gap-3 text-kanda-text-secondary">
            <Loader2 className="animate-spin text-kanda-primary" size={20} />
            O motor de análise está a interpretar a imagem e calcular o KANDA Score...
          </div>
        )}

        {!duplicates.length && (
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? 'A processar...' : 'Enviar ocorrência'}
          </button>
        )}
      </form>
    </AppLayout>
  );
}
