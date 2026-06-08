import type { KandaScores, RiskLevel } from '@/types/occurrence';

export function calculateKandaScore(
  riskScore: number,
  impactScore: number,
  confidenceScore: number,
): number {
  const score = riskScore * 0.4 + impactScore * 0.35 + confidenceScore * 0.25;
  return Math.round(Math.min(100, Math.max(0, score)));
}

export function buildScores(
  riskScore: number,
  impactScore: number,
  confidenceScore: number,
): KandaScores {
  const clamped = (value: number) => Math.min(100, Math.max(0, Math.round(value)));
  const risk = clamped(riskScore);
  const impact = clamped(impactScore);
  const confidence = clamped(confidenceScore);

  return {
    riskScore: risk,
    impactScore: impact,
    confidenceScore: confidence,
    kandaScore: calculateKandaScore(risk, impact, confidence),
  };
}

export function riskLevelFromScore(riskScore: number): RiskLevel {
  if (riskScore >= 85) return 'Crítico';
  if (riskScore >= 70) return 'Alto';
  if (riskScore >= 45) return 'Médio';
  return 'Baixo';
}

export function priorityFromKandaScore(kandaScore: number): number {
  return kandaScore;
}

export function applyConfirmationBoost(scores: KandaScores, confirmations: number): KandaScores {
  const boostedConfidence = Math.min(100, scores.confidenceScore + confirmations * 2);
  return buildScores(scores.riskScore, scores.impactScore, boostedConfidence);
}
