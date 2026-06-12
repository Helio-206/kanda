import type { AIImageAnalysis } from "@/types/occurrence";

export async function analyzeReportImage(imageUri: string): Promise<AIImageAnalysis> {
  void imageUri;

  // stub até ligar modelo de visão
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    detectedCategory: "outro",
    detectedObjects: [],
    sceneDescription: "Imagem recebida para análise. A visão automática ainda não está ligada.",
    visualRiskHints: [],
    damageLevel: "baixo",
    confidence: 0.12,
    needsHumanConfirmation: true,
    rawProvider: undefined,
  };
}
