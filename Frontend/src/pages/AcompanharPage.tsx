import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Search, ShieldCheck } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { getOccurrenceByCode } from '@/services/occurrenceService';

import { INSTITUTIONAL } from '@/lib/copy/productLanguage';

export default function AcompanharPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setError('Introduza o código da ocorrência.');
      return;
    }

    const occurrence = getOccurrenceByCode(normalized);
    if (!occurrence) {
      setError('Código não encontrado. Verifique e tente novamente.');
      return;
    }

    navigate(`/ocorrencia/${occurrence.code}`);
  };

  return (
    <AppLayout
      title="Acompanhar ocorrência"
      subtitle={`${INSTITUTIONAL.trackSubtitle} Introduza o código gerado no registo, por exemplo KANDA-A7F31C.`}
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <form onSubmit={handleSubmit} className="card-standard space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-kanda-primary/10 text-kanda-primary">
            <Search size={22} />
          </div>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-kanda-text-primary mb-2">
              Código da ocorrência
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="KANDA-XXXXXX"
              className="w-full rounded-lg border border-kanda-border bg-white px-4 py-3 uppercase text-kanda-text-primary placeholder:text-kanda-text-secondary/60 focus:border-kanda-primary focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <button type="submit" className="btn-primary">
            Consultar ocorrência
          </button>
        </form>

        <aside className="card-standard bg-kanda-dark text-kanda-background">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-kanda-primary">
            <ShieldCheck size={22} />
          </div>
          <h2 className="mt-6 font-display text-[28px] leading-tight">Rastreabilidade por código único</h2>
          <p className="mt-3 text-sm leading-relaxed text-kanda-background/70">
            Cada ocorrência mantém fotografia, localização, análise, score e histórico. O código permite
            recuperar o registo sem expor dados pessoais.
          </p>
          <div className="mt-6 border-t border-white/10 pt-4 text-sm text-kanda-background/70">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-kanda-primary" />
              Consulta com contexto geográfico preservado
            </div>
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}
