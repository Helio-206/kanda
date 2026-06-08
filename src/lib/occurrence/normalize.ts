import type { Occurrence } from '@/types/occurrence';
import { buildScores, priorityFromKandaScore } from '@/lib/scoring/kandaScore';

const CONFIRMATIONS_KEY = 'kanda-confirmed-codes';

export function getConfirmedCodes(): Set<string> {
  try {
    const raw = localStorage.getItem(CONFIRMATIONS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveConfirmedCode(code: string): void {
  const set = getConfirmedCodes();
  set.add(code.toUpperCase());
  localStorage.setItem(CONFIRMATIONS_KEY, JSON.stringify([...set]));
}

export function hasUserConfirmed(code: string): boolean {
  return getConfirmedCodes().has(code.toUpperCase());
}

export function normalizeOccurrence(raw: Partial<Occurrence> & { priority?: number }): Occurrence {
  const legacyPriority = raw.priority ?? 65;
  const scores = raw.scores ?? buildScores(
    raw.risk === 'Crítico' ? 90 : raw.risk === 'Alto' ? 75 : raw.risk === 'Médio' ? 55 : 35,
    Math.min(100, legacyPriority),
    75,
  );

  return {
    id: raw.id!,
    code: raw.code!,
    imageUrl: raw.imageUrl!,
    citizenNote: raw.citizenNote ?? '',
    category: raw.category!,
    categoryKey: raw.categoryKey ?? 'default',
    description: raw.description!,
    risk: raw.risk!,
    priority: priorityFromKandaScore(scores.kandaScore),
    scores,
    confirmations: raw.confirmations ?? 0,
    responsibleEntity: raw.responsibleEntity!,
    suggestedAction: raw.suggestedAction!,
    location: raw.location!,
    status: raw.status!,
    history: raw.history ?? [],
    createdAt: raw.createdAt!,
  };
}

export function recalculateOccurrenceScores(occurrence: Occurrence): Occurrence {
  const scores = buildScores(
    occurrence.scores.riskScore,
    occurrence.scores.impactScore,
    occurrence.scores.confidenceScore,
  );

  return {
    ...occurrence,
    scores,
    priority: priorityFromKandaScore(scores.kandaScore),
  };
}

export function confirmOccurrenceRecord(occurrence: Occurrence, note?: string): Occurrence {
  if (hasUserConfirmed(occurrence.code)) {
    return occurrence;
  }

  saveConfirmedCode(occurrence.code);

  const boostedConfidence = Math.min(100, occurrence.scores.confidenceScore + 3);
  const scores = buildScores(
    occurrence.scores.riskScore,
    occurrence.scores.impactScore,
    boostedConfidence,
  );

  return recalculateOccurrenceScores({
    ...occurrence,
    confirmations: occurrence.confirmations + 1,
    scores,
    history: [
      ...occurrence.history,
      {
        status: occurrence.status,
        note: note ?? 'Ocorrência confirmada por um cidadão — validação comunitária.',
        createdAt: new Date().toISOString(),
      },
    ],
  });
}
