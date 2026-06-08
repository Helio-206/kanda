import { describe, expect, it } from 'vitest';

import {
  applyConfirmationBoost,
  buildScores,
  calculateKandaScore,
  priorityFromKandaScore,
  riskLevelFromScore,
} from './kandaScore';

describe('KANDA scoring', () => {
  it('calculates the weighted KANDA Score', () => {
    expect(calculateKandaScore(92, 87, 95)).toBe(91);
  });

  it('clamps score inputs before building the final score set', () => {
    expect(buildScores(140, -5, 49.4)).toEqual({
      riskScore: 100,
      impactScore: 0,
      confidenceScore: 49,
      kandaScore: 55,
    });
  });

  it('maps risk score ranges to risk levels', () => {
    expect(riskLevelFromScore(20)).toBe('Baixo');
    expect(riskLevelFromScore(45)).toBe('Médio');
    expect(riskLevelFromScore(70)).toBe('Alto');
    expect(riskLevelFromScore(85)).toBe('Crítico');
  });

  it('keeps priority aligned with the final score', () => {
    expect(priorityFromKandaScore(78)).toBe(78);
  });

  it('boosts confidence with community confirmations', () => {
    expect(applyConfirmationBoost(buildScores(50, 50, 50), 3)).toEqual({
      riskScore: 50,
      impactScore: 50,
      confidenceScore: 56,
      kandaScore: 51,
    });
  });
});
