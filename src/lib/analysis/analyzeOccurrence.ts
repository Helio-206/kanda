import type { OccurrenceAnalysisResult, OccurrenceLocation, RiskLevel } from '@/types/occurrence';
import { buildScores, riskLevelFromScore } from '@/lib/scoring/kandaScore';

interface CategoryProfile {
  categoryKey: string;
  category: string;
  description: string;
  riskScore: number;
  impactScore: number;
  confidenceScore: number;
  responsibleEntity: string;
  suggestedAction: string;
}

const PROFILES: Record<string, CategoryProfile> = {
  lixo: {
    categoryKey: 'lixo',
    category: 'Lixo acumulado',
    description:
      'A imagem indica acumulação de resíduos sólidos em espaço público, com potencial impacto sanitário e visual na comunidade.',
    riskScore: 55,
    impactScore: 70,
    confidenceScore: 85,
    responsibleEntity: 'Empresa de Limpeza Urbana',
    suggestedAction: 'Encaminhar para recolha e limpeza do local.',
  },
  buraco: {
    categoryKey: 'buraco',
    category: 'Buraco na via pública',
    description:
      'A imagem indica uma degradação visível na via pública, com risco para veículos e peões.',
    riskScore: 92,
    impactScore: 87,
    confidenceScore: 95,
    responsibleEntity: 'Administração Municipal',
    suggestedAction: 'Encaminhar para equipa de manutenção rodoviária.',
  },
  poste: {
    categoryKey: 'poste',
    category: 'Iluminação pública avariada',
    description:
      'A imagem sugere avaria ou falha na iluminação pública, reduzindo a segurança no período nocturno.',
    riskScore: 80,
    impactScore: 75,
    confidenceScore: 88,
    responsibleEntity: 'Empresa Nacional de Electricidade (ENE)',
    suggestedAction: 'Encaminhar para inspecção e reparação da iluminação.',
  },
  default: {
    categoryKey: 'default',
    category: 'Ocorrência urbana',
    description:
      'A imagem reporta uma situação que requer atenção das autoridades competentes no espaço público.',
    riskScore: 48,
    impactScore: 58,
    confidenceScore: 72,
    responsibleEntity: 'Administração Municipal',
    suggestedAction: 'Validar a ocorrência e encaminhar para a entidade adequada.',
  },
};

export function detectCategoryKey(fileName: string): string {
  const name = fileName.toLowerCase();
  if (name.includes('lixo')) return 'lixo';
  if (name.includes('buraco')) return 'buraco';
  if (name.includes('poste')) return 'poste';
  return 'default';
}

function adjustForLocation(profile: CategoryProfile, location: OccurrenceLocation): CategoryProfile {
  const lower = location.address.toLowerCase();
  let impactScore = profile.impactScore;
  let riskScore = profile.riskScore;

  if (lower.includes('via') || lower.includes('avenida') || lower.includes('estrada')) {
    impactScore = Math.min(100, impactScore + 10);
    riskScore = Math.min(100, riskScore + 5);
  }
  if (lower.includes('escola') || lower.includes('hospital')) {
    impactScore = Math.min(100, impactScore + 12);
    riskScore = Math.min(100, riskScore + 8);
  }

  return { ...profile, impactScore, riskScore };
}

function adjustForNote(profile: CategoryProfile, note: string): CategoryProfile {
  if (!note.trim()) return profile;

  const lower = note.toLowerCase();
  let riskScore = profile.riskScore;
  if (lower.includes('urgente') || lower.includes('perigo') || lower.includes('criança')) {
    riskScore = Math.min(100, riskScore + 12);
  }

  return {
    ...profile,
    riskScore,
    description: `${profile.description} Observação do cidadão: ${note.trim()}`,
  };
}

export async function analyzeOccurrence(
  image: File,
  location: OccurrenceLocation,
  note: string,
): Promise<OccurrenceAnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const key = detectCategoryKey(image.name);
  const base = PROFILES[key] ?? PROFILES.default;
  const withLocation = adjustForLocation(base, location);
  const result = adjustForNote(withLocation, note);
  const scores = buildScores(result.riskScore, result.impactScore, result.confidenceScore);
  const risk: RiskLevel = riskLevelFromScore(scores.riskScore);

  return {
    category: result.category,
    categoryKey: result.categoryKey,
    description: result.description,
    risk,
    scores,
    responsibleEntity: result.responsibleEntity,
    suggestedAction: result.suggestedAction,
  };
}
