import { useEffect, useMemo, useState } from 'react';
import { getAllOccurrences } from '@/services/occurrenceService';
import type { Occurrence, OccurrenceStatus } from '@/types/occurrence';

export interface OperationalCategoryMetric {
  label: string;
  count: number;
  share: number;
}

export interface OperationalEntityMetric {
  label: string;
  count: number;
  confirmations: number;
  resolved: number;
}

export interface OperationalAreaMetric {
  label: string;
  count: number;
  critical: number;
  confirmations: number;
}

export interface OperationalTrendMetric {
  label: string;
  count: number;
}

export interface OperationalSnapshot {
  total: number;
  open: number;
  resolved: number;
  critical: number;
  averageScore: number;
  averageConfidence: number;
  totalConfirmations: number;
  statusDistribution: Array<{ label: OccurrenceStatus; count: number; share: number }>;
  categoryDistribution: OperationalCategoryMetric[];
  entityDistribution: OperationalEntityMetric[];
  areaDistribution: OperationalAreaMetric[];
  recent: Occurrence[];
  worklist: Occurrence[];
  trend: OperationalTrendMetric[];
  topCategory: OperationalCategoryMetric | null;
  topEntity: OperationalEntityMetric | null;
  topArea: OperationalAreaMetric | null;
}

const statusOrder: OccurrenceStatus[] = [
  'Reportado',
  'Validado',
  'Encaminhado',
  'Em análise',
  'Em resolução',
  'Resolvido',
];

function safePercent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function scoreAverage(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, item) => sum + item, 0) / values.length);
}

function normalizeAreaLabel(address: string) {
  const firstSegment = address
    .split(',')
    .map((part) => part.trim())
    .find(Boolean);

  if (!firstSegment) {
    return 'Local não especificado';
  }

  return firstSegment.length > 36 ? `${firstSegment.slice(0, 33)}…` : firstSegment;
}

function worklistWeight(item: Occurrence) {
  const statusWeight = statusOrder.indexOf(item.status);
  const scoreWeight = 100 - Math.round(item.scores.kandaScore);
  const priorityWeight = 100 - item.priority;

  return statusWeight * 1000 + scoreWeight * 10 + priorityWeight;
}

export function buildOperationalSnapshot(occurrences: Occurrence[]): OperationalSnapshot {
  const total = occurrences.length;
  const resolved = occurrences.filter((item) => item.status === 'Resolvido').length;
  const open = total - resolved;
  const critical = occurrences.filter((item) => item.risk === 'Crítico' || item.priority >= 85).length;
  const averageScore = scoreAverage(occurrences.map((item) => item.scores.kandaScore));
  const averageConfidence = scoreAverage(occurrences.map((item) => item.scores.confidenceScore));
  const totalConfirmations = occurrences.reduce((sum, item) => sum + item.confirmations, 0);

  const statusDistribution = statusOrder.map((status) => {
    const count = occurrences.filter((item) => item.status === status).length;

    return {
      label: status,
      count,
      share: safePercent(count, total),
    };
  });

  const categoryMap = new Map<string, OperationalCategoryMetric>();
  const entityMap = new Map<string, OperationalEntityMetric>();
  const areaMap = new Map<string, OperationalAreaMetric>();
  const trendMap = new Map<string, OperationalTrendMetric>();

  occurrences.forEach((item) => {
    const categoryEntry = categoryMap.get(item.category) ?? {
      label: item.category,
      count: 0,
      share: 0,
    };
    categoryEntry.count += 1;
    categoryMap.set(item.category, categoryEntry);

    const entityKey = item.responsibleEntity.trim() || 'Entidade não identificada';
    const entityEntry = entityMap.get(entityKey) ?? {
      label: entityKey,
      count: 0,
      confirmations: 0,
      resolved: 0,
    };
    entityEntry.count += 1;
    entityEntry.confirmations += item.confirmations;
    entityEntry.resolved += item.status === 'Resolvido' ? 1 : 0;
    entityMap.set(entityKey, entityEntry);

    const areaKey = normalizeAreaLabel(item.location.address);
    const areaEntry = areaMap.get(areaKey) ?? {
      label: areaKey,
      count: 0,
      critical: 0,
      confirmations: 0,
    };
    areaEntry.count += 1;
    areaEntry.critical += item.risk === 'Crítico' || item.priority >= 85 ? 1 : 0;
    areaEntry.confirmations += item.confirmations;
    areaMap.set(areaKey, areaEntry);

    const createdAt = new Date(item.createdAt);
    const trendKey = createdAt.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' });
    const trendEntry = trendMap.get(trendKey) ?? { label: trendKey, count: 0 };
    trendEntry.count += 1;
    trendMap.set(trendKey, trendEntry);
  });

  const categoryDistribution = [...categoryMap.values()]
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      ...item,
      share: safePercent(item.count, total),
    }));

  const entityDistribution = [...entityMap.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.confirmations - a.confirmations;
  });

  const areaDistribution = [...areaMap.values()].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.critical - a.critical;
  });

  const trend = [...trendMap.values()].slice(0, 6);

  return {
    total,
    open,
    resolved,
    critical,
    averageScore,
    averageConfidence,
    totalConfirmations,
    statusDistribution,
    categoryDistribution,
    entityDistribution,
    areaDistribution,
    recent: occurrences.slice(0, 6),
    worklist: [...occurrences].sort((a, b) => worklistWeight(a) - worklistWeight(b)).slice(0, 8),
    trend,
    topCategory: categoryDistribution[0] ?? null,
    topEntity: entityDistribution[0] ?? null,
    topArea: areaDistribution[0] ?? null,
  };
}

export function useOperationalOccurrences() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>(() => getAllOccurrences());

  useEffect(() => {
    const sync = () => setOccurrences(getAllOccurrences());
    sync();

    window.addEventListener('storage', sync);

    return () => window.removeEventListener('storage', sync);
  }, []);

  return occurrences;
}

export function useOperationalSnapshot() {
  const occurrences = useOperationalOccurrences();
  return useMemo(() => buildOperationalSnapshot(occurrences), [occurrences]);
}
