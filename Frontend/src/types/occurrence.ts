export type RiskLevel = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';

export type OccurrenceStatus =
  | 'Reportado'
  | 'Validado'
  | 'Encaminhado'
  | 'Em análise'
  | 'Em resolução'
  | 'Resolvido';

export const OCCURRENCE_STATUSES: OccurrenceStatus[] = [
  'Reportado',
  'Validado',
  'Encaminhado',
  'Em análise',
  'Em resolução',
  'Resolvido',
];

export interface OccurrenceLocation {
  latitude: number | null;
  longitude: number | null;
  address: string;
}

export interface OccurrenceHistoryEntry {
  status: OccurrenceStatus;
  note: string;
  createdAt: string;
}

export interface KandaScores {
  riskScore: number;
  impactScore: number;
  confidenceScore: number;
  kandaScore: number;
}

export interface Occurrence {
  id: string;
  code: string;
  imageUrl: string;
  citizenNote: string;
  category: string;
  categoryKey: string;
  description: string;
  risk: RiskLevel;
  priority: number;
  scores: KandaScores;
  confirmations: number;
  responsibleEntity: string;
  suggestedAction: string;
  location: OccurrenceLocation;
  status: OccurrenceStatus;
  history: OccurrenceHistoryEntry[];
  createdAt: string;
}

export interface OccurrenceAnalysisResult {
  category: string;
  categoryKey: string;
  description: string;
  risk: RiskLevel;
  scores: KandaScores;
  responsibleEntity: string;
  suggestedAction: string;
}

export interface DuplicateMatch {
  occurrence: Occurrence;
  distanceMeters: number;
}
