import { distanceBetweenCoordinates, isValidCoordinates } from "@/services/location.service";
import { analyzeReportImage } from "@/services/ai/ai-vision.service";
import {
  buildAuthoritySummary,
  buildImprovedDescription,
  buildMissingInfo,
  buildCitizenWarnings,
  collectTechnicalFlags,
  getFallbackCategory,
  getResponsibleEntity,
  getRuleMatch,
  getSuggestedTitle,
  inferPriority,
  inferRiskLevel,
  scoreConfidence,
} from "@/services/ai/ai-rules";
import type { Coordinates } from "@/types/geo";
import type {
  AIImageAnalysis,
  AIReportAnalysis,
  AIReportPossibleDuplicate,
  Occurrence,
  OccurrenceCategory,
  OccurrencePriority,
} from "@/types/occurrence";

export type AnalyzeFullReportInput = {
  description?: string;
  imageUri?: string | null;
  latitude: number | null;
  longitude: number | null;
  nearbyOccurrences?: Occurrence[];
};

const DUPLICATE_DISTANCE_METERS = 150;
const DUPLICATE_WINDOW_MS = 72 * 60 * 60 * 1000;

function buildCoordinates(latitude: number | null, longitude: number | null): Coordinates | null {
  if (latitude === null || longitude === null) {
    return null;
  }

  const candidate = { latitude, longitude };
  return isValidCoordinates(candidate) ? candidate : null;
}

function isRecent(createdAt: string) {
  return Date.now() - Date.parse(createdAt) <= DUPLICATE_WINDOW_MS;
}

function findNearbyDuplicate(
  category: OccurrenceCategory,
  coordinates: Coordinates | null,
  occurrences: Occurrence[] | undefined
): AIReportPossibleDuplicate {
  if (!coordinates || !occurrences?.length) {
    return null;
  }

  const duplicate = occurrences.find((occurrence) => {
    if (occurrence.category !== category) {
      return false;
    }

    if (!isRecent(occurrence.createdAt)) {
      return false;
    }

    const distance = distanceBetweenCoordinates(coordinates, {
      latitude: occurrence.latitude,
      longitude: occurrence.longitude,
    });

    return distance <= DUPLICATE_DISTANCE_METERS;
  });

  if (!duplicate) {
    return null;
  }

  return {
    occurrenceId: duplicate.id,
    distanceMeters: Math.round(
      distanceBetweenCoordinates(coordinates, {
        latitude: duplicate.latitude,
        longitude: duplicate.longitude,
      })
    ),
    createdAt: duplicate.createdAt,
  };
}

function buildTextAnalysis(description: string, imageAnalysis?: AIImageAnalysis) {
  const text = description.trim();
  const matchedRule = getRuleMatch(text);
  const textCategory = matchedRule?.category ?? getFallbackCategory(text);
  const textPriority: OccurrencePriority = inferPriority(text, textCategory);
  const textRisk: AIReportAnalysis["final"]["riskLevel"] = inferRiskLevel(
    text,
    textCategory,
    textPriority
  );
  const textConfidence = scoreConfidence(text, textCategory);
  const humanWarnings = buildCitizenWarnings(text, Boolean(imageAnalysis));
  const missingInfo = buildMissingInfo(text, Boolean(imageAnalysis));

  return {
    matchedRule,
    textCategory,
    textPriority,
    textRisk,
    textConfidence,
    title: getSuggestedTitle(textCategory, text),
    description: buildImprovedDescription(text, textCategory),
    authoritySummary: buildAuthoritySummary(text, textCategory, textRisk),
    responsibleEntity: matchedRule?.responsibleEntity ?? getResponsibleEntity(textCategory),
    warnings: [
      ...humanWarnings,
      ...missingInfo.map((item) => `Falta: ${item.toLowerCase()}.`),
      ...(imageAnalysis?.needsHumanConfirmation
        ? ["A imagem precisa de confirmação humana antes de enviar."]
        : []),
    ],
  };
}

function pickFinalCategory(
  imageAnalysis: AIImageAnalysis | undefined,
  textCategory: OccurrenceCategory
): OccurrenceCategory {
  if (!imageAnalysis) {
    return textCategory;
  }

  if (imageAnalysis.detectedCategory !== "outro" && imageAnalysis.confidence >= 0.5) {
    return imageAnalysis.detectedCategory;
  }

  return textCategory;
}

function pickFinalPriority(
  imageAnalysis: AIImageAnalysis | undefined,
  textPriority: OccurrencePriority,
  finalCategory: OccurrenceCategory
) {
  if (!imageAnalysis) {
    return textPriority;
  }

  const imagePriorityByDamage: Record<AIImageAnalysis["damageLevel"], OccurrencePriority> = {
    baixo: "baixa",
    medio: "media",
    alto: "alta",
    critico: "critica",
  };

  const imagePriority = imagePriorityByDamage[imageAnalysis.damageLevel];

  if (imageAnalysis.confidence >= 0.5) {
    return imagePriority;
  }

  if (finalCategory === "seguranca" && imageAnalysis.damageLevel === "critico") {
    return "critica";
  }

  return textPriority;
}

function buildFinalWarnings(params: {
  imageAnalysis?: AIImageAnalysis;
  textWarnings: string[];
  duplicate: AIReportPossibleDuplicate;
  textCategory: OccurrenceCategory;
  finalCategory: OccurrenceCategory;
}) {
  const warnings = [...params.textWarnings];

  if (params.duplicate) {
    warnings.push("Pode já existir uma ocorrência parecida perto deste local.");
  }

  if (
    params.imageAnalysis &&
    params.imageAnalysis.detectedCategory !== "outro" &&
    params.imageAnalysis.detectedCategory !== params.finalCategory &&
    params.imageAnalysis.confidence >= 0.5
  ) {
    warnings.push(
      "A imagem e a descrição parecem indicar coisas diferentes. Confirme antes de enviar."
    );
  }

  if (
    params.imageAnalysis &&
    params.imageAnalysis.needsHumanConfirmation &&
    params.imageAnalysis.confidence < 0.5
  ) {
    warnings.push("A imagem ainda não está suficientemente clara. Confirma manualmente.");
  }

  if (params.textCategory === "outro") {
    warnings.push("A categoria continua incerta. Vale a pena confirmar antes de enviar.");
  }

  return Array.from(new Set(warnings));
}

export async function analyzeFullReport(input: AnalyzeFullReportInput): Promise<AIReportAnalysis> {
  const description = input.description?.trim() ?? "";
  const coordinates = buildCoordinates(input.latitude, input.longitude);
  const imageUsed = Boolean(input.imageUri);
  const textUsed = description.length > 0;

  const imageAnalysis = input.imageUri ? await analyzeReportImage(input.imageUri) : undefined;
  const textAnalysis = buildTextAnalysis(description, imageAnalysis);
  const duplicate = findNearbyDuplicate(
    pickFinalCategory(imageAnalysis, textAnalysis.textCategory),
    coordinates,
    input.nearbyOccurrences
  );

  const finalCategory = pickFinalCategory(imageAnalysis, textAnalysis.textCategory);
  const finalPriority: OccurrencePriority = pickFinalPriority(
    imageAnalysis,
    textAnalysis.textPriority,
    finalCategory
  );
  const finalRiskLevel: AIReportAnalysis["final"]["riskLevel"] = imageAnalysis
    ? imageAnalysis.confidence >= 0.5
      ? imageAnalysis.damageLevel
      : inferRiskLevel(description, finalCategory, finalPriority)
    : inferRiskLevel(description, finalCategory, finalPriority);

  const finalConfidence = Math.max(
    0.18,
    Math.min(
      imageAnalysis
        ? Math.max(imageAnalysis.confidence, textAnalysis.textConfidence * 0.7)
        : textAnalysis.textConfidence,
      0.98
    ) - (duplicate ? 0.08 : 0)
  );

  const technicalFlags = collectTechnicalFlags({
    description,
    category: finalCategory,
    hasImage: imageUsed,
    possibleDuplicate: Boolean(duplicate),
    coordinatesKnown: Boolean(coordinates),
  });

  const tags = Array.from(
    new Set([
      finalCategory,
      finalPriority,
      finalRiskLevel,
      ...technicalFlags,
      ...(imageAnalysis?.detectedObjects ?? []),
      ...(imageAnalysis?.visualRiskHints ?? []),
      ...(imageUsed ? ["imagem"] : []),
      ...(textUsed ? ["texto"] : []),
    ])
  );

  const warnings = buildFinalWarnings({
    imageAnalysis,
    textWarnings: textAnalysis.warnings,
    duplicate,
    textCategory: textAnalysis.textCategory,
    finalCategory,
  });

  return {
    source: {
      textUsed,
      imageUsed,
    },
    imageAnalysis,
    final: {
      category: finalCategory,
      title: imageAnalysis?.confidence && imageAnalysis.confidence >= 0.5
        ? getSuggestedTitle(finalCategory, description)
        : textAnalysis.title,
      description: imageAnalysis?.confidence && imageAnalysis.confidence >= 0.5
        ? imageAnalysis.sceneDescription || textAnalysis.description
        : textAnalysis.description,
      priority: finalPriority,
      riskLevel: finalRiskLevel,
      responsibleEntity: imageAnalysis?.confidence && imageAnalysis.confidence >= 0.5
        ? textAnalysis.responsibleEntity
        : textAnalysis.responsibleEntity,
      authoritySummary: imageAnalysis?.confidence && imageAnalysis.confidence >= 0.5
        ? `${imageAnalysis.sceneDescription} | ${textAnalysis.authoritySummary}`
        : textAnalysis.authoritySummary,
      confidence: finalConfidence,
      tags,
      warnings,
    },
  };
}

export async function analyzeReportDraft(input: AnalyzeFullReportInput): Promise<AIReportAnalysis> {
  return analyzeFullReport(input);
}
