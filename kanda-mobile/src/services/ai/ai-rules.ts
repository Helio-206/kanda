import {
  occurrenceCategoryLabels,
  type OccurrenceCategory,
  type AIRiskLevel,
  type AITechnicalFlag,
  type OccurrencePriority,
} from "@/types/occurrence";

type RuleMatch = {
  keywords: string[];
  category: OccurrenceCategory;
  title: string;
  responsibleEntity: string;
  priority: OccurrencePriority;
};

const categoryRules: RuleMatch[] = [
  {
    keywords: ["lixo", "contentor", "entulho", "resíduos", "residuo", "sujidade"],
    category: "lixo",
    title: "Acumulação de lixo",
    responsibleEntity: "Administração Municipal / saneamento",
    priority: "media",
  },
  {
    keywords: ["buraco", "estrada", "cratera", "asfalto", "via", "pavimento"],
    category: "buraco",
    title: "Buraco na estrada",
    responsibleEntity: "INEA / obras públicas / administração local",
    priority: "alta",
  },
  {
    keywords: ["luz", "poste", "escuro", "iluminação", "iluminacao", "lampada", "lâmpada"],
    category: "iluminacao",
    title: "Falha de iluminação pública",
    responsibleEntity: "ENDE / administração local",
    priority: "media",
  },
  {
    keywords: ["água", "agua", "cano", "fuga", "esgoto", "saneamento", "torneira"],
    category: "agua",
    title: "Problema de água",
    responsibleEntity: "EPAL / águas locais",
    priority: "alta",
  },
  {
    keywords: ["energia", "cabo", "transformador", "corrente", "apagão", "apagao", "poste"],
    category: "energia",
    title: "Falha de energia",
    responsibleEntity: "ENDE",
    priority: "alta",
  },
  {
    keywords: ["assalto", "roubo", "perigo", "violência", "violencia", "ameaça", "ameaça"],
    category: "seguranca",
    title: "Ocorrência de segurança",
    responsibleEntity: "Polícia Nacional / protecção civil",
    priority: "critica",
  },
  {
    keywords: ["hospital", "doente", "lixo hospitalar", "saúde", "saude", "ambulância", "ambulancia"],
    category: "saude",
    title: "Ocorrência de saúde",
    responsibleEntity: "Direção Municipal de Saúde",
    priority: "alta",
  },
  {
    keywords: ["chuva", "vala", "drenagem", "inundação", "inundacao", "alagamento", "cheia"],
    category: "drenagem",
    title: "Problema de drenagem",
    responsibleEntity: "Obras públicas / saneamento",
    priority: "alta",
  },
];

const vagueWords = ["coisa", "problema", "situação", "situacao", "aqui", "ali", "isso", "isto"];

const immediateRiskKeywords = [
  "perigo imediato",
  "criança",
  "crianca",
  "acidente",
  "fogo",
  "cabo elétrico",
  "cabo eletrico",
  "violência",
  "violencia",
  "arma",
  "sangue",
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function hasAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(normalizeText(keyword)));
}

export function getRuleMatch(description: string) {
  const text = normalizeText(description);

  for (const rule of categoryRules) {
    if (hasAny(text, rule.keywords)) {
      return rule;
    }
  }

  return null;
}

export function getFallbackCategory(title?: string): OccurrenceCategory {
  const text = normalizeText(title ?? "");

  if (text.includes("lixo")) return "lixo";
  if (text.includes("buraco")) return "buraco";
  if (text.includes("luz") || text.includes("ilumin")) return "iluminacao";
  if (text.includes("agua")) return "agua";
  if (text.includes("energia") || text.includes("cabo")) return "energia";
  if (text.includes("segur")) return "seguranca";
  if (text.includes("saude") || text.includes("hospital")) return "saude";
  if (text.includes("dren")) return "drenagem";

  return "outro";
}

export function getCategoryLabel(category: OccurrenceCategory) {
  return occurrenceCategoryLabels[category];
}

export function inferPriority(description: string, matchedCategory: OccurrenceCategory) {
  const text = normalizeText(description);

  if (hasAny(text, immediateRiskKeywords)) {
    return "critica";
  }

  if (matchedCategory === "seguranca") {
    return "critica";
  }

  if (matchedCategory === "buraco" || matchedCategory === "agua" || matchedCategory === "energia") {
    return "alta";
  }

  if (matchedCategory === "iluminacao" || matchedCategory === "drenagem" || matchedCategory === "saude") {
    return "media";
  }

  return "baixa";
}

export function getResponsibleEntity(category: OccurrenceCategory) {
  const rule = categoryRules.find((item) => item.category === category);
  return rule?.responsibleEntity ?? "Administração local";
}

export function getSuggestedTitle(category: OccurrenceCategory, description: string) {
  const rule = categoryRules.find((item) => item.category === category);

  if (rule) {
    return rule.title;
  }

  const text = normalizeText(description);
  if (text.length < 18) {
    return "Ocorrência reportada";
  }

  return "Problema reportado";
}

export function buildSummary(description: string, category: OccurrenceCategory) {
  const text = description.trim().replace(/\s+/g, " ");
  if (!text) {
    return `Sem descrição detalhada. Categoria sugerida: ${getCategoryLabel(category)}.`;
  }

  if (text.length <= 90) {
    return text;
  }

  return `${text.slice(0, 87).trim()}...`;
}

export function getWarnings(description: string) {
  const text = normalizeText(description);
  const warnings: string[] = [];

  if (text.length < 18) {
    warnings.push("A descrição está curta. Dá um pouco mais de contexto.");
  }

  if (vagueWords.some((word) => text.includes(word))) {
    warnings.push("A descrição está vaga. Tenta dizer o que aconteceu, onde e desde quando.");
  }

  return warnings;
}

export function scoreConfidence(description: string, category: OccurrenceCategory) {
  const text = normalizeText(description);
  let score = 0.4;

  if (text.length > 25) score += 0.1;
  if (text.length > 60) score += 0.1;
  if (category !== "outro") score += 0.15;
  if (categoryRules.some((rule) => rule.category === category && hasAny(text, rule.keywords))) {
    score += 0.2;
  }
  if (hasAny(text, immediateRiskKeywords)) score += 0.05;

  return Math.min(score, 0.97);
}

export function inferRiskLevel(
  description: string,
  category: OccurrenceCategory,
  priority: OccurrencePriority
): AIRiskLevel {
  const text = normalizeText(description);

  if (hasAny(text, immediateRiskKeywords) || priority === "critica") {
    return "critico";
  }

  if (category === "seguranca" || priority === "alta") {
    return "alto";
  }

  if (category === "buraco" || category === "agua" || category === "energia") {
    return "medio";
  }

  return "baixo";
}

export function buildAuthoritySummary(
  description: string,
  category: OccurrenceCategory,
  riskLevel: AIRiskLevel
) {
  const clean = description.trim().replace(/\s+/g, " ");
  const categoryLabel = occurrenceCategoryLabels[category];
  const base = clean || `Ocorrência sem descrição detalhada em ${categoryLabel}.`;

  return `${categoryLabel} | risco ${riskLevel}: ${base}`;
}

export function buildImprovedDescription(description: string, category: OccurrenceCategory) {
  const text = description.trim().replace(/\s+/g, " ");

  if (!text) {
    return `Descreve melhor o problema de ${occurrenceCategoryLabels[category].toLowerCase()}.`;
  }

  if (text.length <= 140) {
    return text;
  }

  return `${text.slice(0, 137).trim()}...`;
}

export function buildCitizenWarnings(description: string, hasImage: boolean) {
  const warnings = getWarnings(description);

  if (hasImage && description.trim().length < 24) {
    warnings.push("Há foto, mas a descrição ainda está curta. Talvez valha a pena explicar mais.");
  }

  return warnings;
}

export function buildMissingInfo(description: string, hasImage: boolean) {
  const missingInfo: string[] = [];
  const clean = description.trim();

  if (clean.length < 18) {
    missingInfo.push("Mais contexto sobre o problema");
  }

  if (clean.length < 40) {
    missingInfo.push("Local ou referência mais clara");
  }

  if (!hasImage) {
    missingInfo.push("Foto opcional para reforçar a denúncia");
  }

  return missingInfo;
}

export function collectTechnicalFlags(params: {
  description: string;
  category: OccurrenceCategory;
  hasImage: boolean;
  possibleDuplicate: boolean;
  coordinatesKnown: boolean;
}) {
  const text = normalizeText(params.description);
  const flags: AITechnicalFlag[] = [];

  if (params.hasImage) {
    flags.push("evidencia_visual");
  }

  if (text.length < 18) {
    flags.push("descricao_vaga");
  }

  if (params.coordinatesKnown) {
    flags.push("localizacao_confirmada");
  }

  if (params.category === "outro") {
    flags.push("categoria_incerta");
  }

  if (params.possibleDuplicate) {
    flags.push("possivel_duplicado");
  }

  if (hasAny(text, immediateRiskKeywords)) {
    flags.push("risco_imediato");
  }

  return Array.from(new Set(flags));
}
