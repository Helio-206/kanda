import type { KandaScores } from '@/types/occurrence';
import { priorityFromKandaScore } from '@/lib/scoring/kandaScore';

interface KandaScoreDisplayProps {
  scores: KandaScores;
  compact?: boolean;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-kanda-text-secondary">{label}</span>
        <span className="font-medium text-kanda-text-primary">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-kanda-divider">
        <div className="h-full rounded-full bg-kanda-primary/80" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function priorityLabel(kandaScore: number): string {
  if (kandaScore >= 85) return 'Prioridade Crítica';
  if (kandaScore >= 70) return 'Prioridade Alta';
  if (kandaScore >= 50) return 'Prioridade Média';
  return 'Prioridade Normal';
}

export default function KandaScoreDisplay({ scores, compact = false }: KandaScoreDisplayProps) {
  const priority = priorityFromKandaScore(scores.kandaScore);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg bg-kanda-dark px-3 py-1 text-sm text-kanda-background">
        <span className="overline-label text-kanda-background/60">KANDA Score</span>
        <span className="font-display text-xl">{scores.kandaScore}</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-kanda-divider bg-kanda-background/70 p-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <p className="overline-label text-kanda-primary mb-2">KANDA Score</p>
          <p className="font-display text-[48px] leading-none text-kanda-text-primary">
            {scores.kandaScore}
          </p>
          <p className="text-sm text-kanda-text-secondary mt-2">
            {priorityLabel(scores.kandaScore)} · Prioridade {priority}/100
          </p>
        </div>
        <p className="text-xs text-kanda-text-secondary max-w-xs leading-relaxed">
          Score gerado com base em risco, impacto comunitário e confiança da análise.
        </p>
      </div>

      <div className="space-y-4">
        <ScoreBar label="Risco" value={scores.riskScore} />
        <ScoreBar label="Impacto" value={scores.impactScore} />
        <ScoreBar label="Confiança" value={scores.confidenceScore} />
      </div>
    </div>
  );
}
