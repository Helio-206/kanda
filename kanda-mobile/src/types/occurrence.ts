import type { Coordinates } from "@/types/geo";

export const occurrenceCategories = [
  "lixo",
  "buraco",
  "agua",
  "energia",
  "iluminacao",
  "seguranca",
  "saude",
  "drenagem",
  "outro",
] as const;

export type OccurrenceCategory = (typeof occurrenceCategories)[number];

export const occurrencePriorities = ["baixa", "media", "alta", "critica"] as const;

export type OccurrencePriority = (typeof occurrencePriorities)[number];

export const occurrenceStatuses = [
  "enviada",
  "recebida",
  "em_analise",
  "em_execucao",
  "resolvida",
  "rejeitada",
] as const;

export type OccurrenceStatus = (typeof occurrenceStatuses)[number];

export const occurrenceCategoryLabels: Record<OccurrenceCategory, string> = {
  lixo: "Lixo",
  buraco: "Buraco na estrada",
  agua: "Água",
  energia: "Energia",
  iluminacao: "Iluminação",
  seguranca: "Segurança",
  saude: "Saúde",
  drenagem: "Drenagem",
  outro: "Outro",
};

export const occurrencePriorityLabels: Record<OccurrencePriority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

export const occurrenceStatusLabels: Record<OccurrenceStatus, string> = {
  enviada: "Enviada",
  recebida: "Recebida",
  em_analise: "Em análise",
  em_execucao: "Em execução",
  resolvida: "Resolvida",
  rejeitada: "Rejeitada",
};

export const aiRiskLevels = ["baixo", "medio", "alto", "critico"] as const;

export type AIRiskLevel = (typeof aiRiskLevels)[number];

export const aiRiskLevelLabels: Record<AIRiskLevel, string> = {
  baixo: "Baixo",
  medio: "Médio",
  alto: "Alto",
  critico: "Crítico",
};

export const aiTechnicalFlags = [
  "evidencia_visual",
  "descricao_vaga",
  "localizacao_confirmada",
  "categoria_incerta",
  "possivel_duplicado",
  "risco_imediato",
] as const;

export type AITechnicalFlag = (typeof aiTechnicalFlags)[number];

export const aiTechnicalFlagLabels: Record<AITechnicalFlag, string> = {
  evidencia_visual: "Evidência visual",
  descricao_vaga: "Descrição vaga",
  localizacao_confirmada: "Localização confirmada",
  categoria_incerta: "Categoria incerta",
  possivel_duplicado: "Possível duplicado",
  risco_imediato: "Risco imediato",
};

export const occurrenceTimelineEventTypes = [
  "enviada",
  "recebida_localmente",
  "status_alterado",
  "resolvida",
  "apagada",
] as const;

export type OccurrenceTimelineEventType = (typeof occurrenceTimelineEventTypes)[number];

export const occurrenceTimelineEventTypeLabels: Record<OccurrenceTimelineEventType, string> = {
  enviada: "Ocorrência enviada",
  recebida_localmente: "Recebida localmente",
  status_alterado: "Estado alterado",
  resolvida: "Ocorrência resolvida",
  apagada: "Ocorrência apagada",
};

export type Occurrence = {
  id: string;
  code: string;
  title: string;
  description: string;
  category: OccurrenceCategory;
  priority: OccurrencePriority;
  status: OccurrenceStatus;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  addressLabel?: string | null;
  imageUri?: string | null;
  aiImageUsed?: boolean | null;
  aiTextUsed?: boolean | null;
  aiDetectedObjects?: string[];
  aiSceneDescription?: string | null;
  aiRiskHints?: string[];
  aiDamageLevel?: AIRiskLevel | null;
  aiAuthoritySummary?: string | null;
  aiGeneratedDescription?: string | null;
  aiCategory?: OccurrenceCategory | null;
  aiPriority?: OccurrencePriority | null;
  aiResponsibleEntity?: string | null;
  aiSummary?: string | null;
  aiRiskLevel?: AIRiskLevel | null;
  aiConfidence?: number | null;
  aiFlags?: AITechnicalFlag[];
  aiPossibleDuplicate?: AIReportPossibleDuplicate;
  createdAt: string;
  updatedAt: string;
};

export type CreateOccurrenceInput = {
  title: string;
  description: string;
  category: OccurrenceCategory;
  priority: OccurrencePriority;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  addressLabel?: string | null;
  imageUri?: string | null;
  aiImageUsed?: boolean | null;
  aiTextUsed?: boolean | null;
  aiDetectedObjects?: string[];
  aiSceneDescription?: string | null;
  aiRiskHints?: string[];
  aiDamageLevel?: AIRiskLevel | null;
  aiAuthoritySummary?: string | null;
  aiGeneratedDescription?: string | null;
  aiCategory?: OccurrenceCategory | null;
  aiPriority?: OccurrencePriority | null;
  aiResponsibleEntity?: string | null;
  aiSummary?: string | null;
  aiRiskLevel?: AIRiskLevel | null;
  aiConfidence?: number | null;
  aiFlags?: AITechnicalFlag[];
  aiPossibleDuplicate?: AIReportPossibleDuplicate;
};

export type UpdateOccurrenceInput = Partial<
  Pick<
    Occurrence,
    | "title"
    | "description"
    | "category"
    | "priority"
    | "status"
    | "latitude"
    | "longitude"
    | "accuracy"
    | "addressLabel"
    | "imageUri"
    | "aiImageUsed"
    | "aiTextUsed"
    | "aiDetectedObjects"
    | "aiSceneDescription"
    | "aiRiskHints"
    | "aiDamageLevel"
    | "aiAuthoritySummary"
    | "aiGeneratedDescription"
    | "aiCategory"
    | "aiPriority"
    | "aiResponsibleEntity"
    | "aiSummary"
    | "aiRiskLevel"
    | "aiConfidence"
    | "aiFlags"
    | "aiPossibleDuplicate"
  >
>;

export type OccurrenceMapPoint = Coordinates & {
  id: string;
};

export type OccurrenceTimelineEvent = {
  id: string;
  occurrenceId: string;
  type: OccurrenceTimelineEventType;
  title: string;
  description?: string | null;
  createdAt: string;
};

export type AIReportPossibleDuplicate = {
  occurrenceId: string;
  distanceMeters: number;
  createdAt: string;
} | null;

export type AIImageAnalysis = {
  detectedCategory: OccurrenceCategory;
  detectedObjects: string[];
  sceneDescription: string;
  visualRiskHints: string[];
  damageLevel: AIRiskLevel;
  confidence: number;
  needsHumanConfirmation: boolean;
  rawProvider?: unknown;
};

export type AIReportAnalysis = {
  source: {
    textUsed: boolean;
    imageUsed: boolean;
  };
  imageAnalysis?: AIImageAnalysis;
  final: {
    category: OccurrenceCategory;
    title: string;
    description: string;
    priority: OccurrencePriority;
    riskLevel: AIRiskLevel;
    responsibleEntity: string;
    authoritySummary: string;
    confidence: number;
    tags: string[];
    warnings: string[];
  };
};
