import { occurrenceStorage } from '@/lib/storage/occurrenceStorage';
import { normalizeOccurrence, recalculateOccurrenceScores } from '@/lib/occurrence/normalize';
import { analyzeOccurrence, detectCategoryKey } from '@/lib/analysis/analyzeOccurrence';
import { haversineMeters, resolveCoordinates } from '@/lib/geo/coordinates';
import { priorityFromKandaScore } from '@/lib/scoring/kandaScore';
import type {
  OccurrenceAnalysisResult,
  DuplicateMatch,
  Occurrence,
  OccurrenceLocation,
  OccurrenceStatus,
} from '@/types/occurrence';
import {
  confirmOccurrenceRecord,
  getConfirmedCodes,
  hasUserConfirmed,
} from '@/lib/occurrence/normalize';

export { hasUserConfirmed, getConfirmedCodes };

function generateId(): string {
  return crypto.randomUUID();
}

export function generateOccurrenceCode(): string {
  const chars = '0123456789ABCDEF';
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `KANDA-${suffix}`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function analyzeImage(
  image: File,
  location: OccurrenceLocation,
  note: string,
): Promise<OccurrenceAnalysisResult> {
  return analyzeOccurrence(image, location, note);
}

export function findDuplicateOccurrences(
  location: OccurrenceLocation,
  categoryKey: string,
  maxDistanceMeters = 800,
): DuplicateMatch[] {
  const origin = resolveCoordinates(location);
  const all = getAllOccurrences();

  return all
    .filter((item) => item.categoryKey === categoryKey)
    .map((occurrence) => {
      const target = resolveCoordinates(occurrence.location);
      const distanceMeters = haversineMeters(origin.lat, origin.lng, target.lat, target.lng);
      return { occurrence, distanceMeters };
    })
    .filter((match) => match.distanceMeters <= maxDistanceMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}

export async function createOccurrence(input: {
  image: File;
  location: OccurrenceLocation;
  citizenNote: string;
  analysis: OccurrenceAnalysisResult;
}): Promise<Occurrence> {
  const now = new Date().toISOString();
  const imageUrl = await fileToDataUrl(input.image);
  const coords = resolveCoordinates(input.location);

  let code = generateOccurrenceCode();
  while (occurrenceStorage.getByCode(code)) {
    code = generateOccurrenceCode();
  }

  const occurrence: Occurrence = normalizeOccurrence({
    id: generateId(),
    code,
    imageUrl,
    citizenNote: input.citizenNote,
    category: input.analysis.category,
    categoryKey: input.analysis.categoryKey,
    description: input.analysis.description,
    risk: input.analysis.risk,
    scores: input.analysis.scores,
    priority: priorityFromKandaScore(input.analysis.scores.kandaScore),
    confirmations: 0,
    responsibleEntity: input.analysis.responsibleEntity,
    suggestedAction: input.analysis.suggestedAction,
    location: {
      ...input.location,
      latitude: input.location.latitude ?? coords.lat,
      longitude: input.location.longitude ?? coords.lng,
    },
    status: 'Reportado',
    history: [
      {
        status: 'Reportado',
        note: 'Ocorrência registada na plataforma inteligente KANDA e qualificada pelo motor de análise.',
        createdAt: now,
      },
    ],
    createdAt: now,
  });

  occurrenceStorage.save(occurrence);
  return occurrence;
}

export function joinExistingOccurrence(code: string, note?: string): Occurrence | null {
  const occurrence = getOccurrenceByCode(code);
  if (!occurrence) return null;

  const updated = confirmOccurrenceRecord(occurrence, note);
  occurrenceStorage.update(updated);
  return updated;
}

export function getOccurrenceByCode(code: string): Occurrence | null {
  const raw = occurrenceStorage.getByCode(code);
  return raw ? normalizeOccurrence(raw) : null;
}

export function getAllOccurrences(): Occurrence[] {
  return occurrenceStorage.getAll().map(normalizeOccurrence);
}

export function getNearbyOccurrences(code: string, maxDistanceMeters = 1500): Occurrence[] {
  const current = getOccurrenceByCode(code);
  if (!current) return [];

  const origin = resolveCoordinates(current.location);

  return getAllOccurrences()
    .filter((item) => item.code !== current.code)
    .filter((item) => {
      const target = resolveCoordinates(item.location);
      return haversineMeters(origin.lat, origin.lng, target.lat, target.lng) <= maxDistanceMeters;
    });
}

export function confirmOccurrence(code: string): Occurrence | null {
  const occurrence = getOccurrenceByCode(code);
  if (!occurrence) return null;
  if (hasUserConfirmed(code)) return occurrence;

  const updated = confirmOccurrenceRecord(occurrence);
  occurrenceStorage.update(updated);
  return updated;
}

export function updateOccurrenceStatus(
  code: string,
  status: OccurrenceStatus,
  note: string,
): Occurrence | null {
  const occurrence = getOccurrenceByCode(code);
  if (!occurrence) return null;

  const updated: Occurrence = {
    ...occurrence,
    status,
    history: [
      ...occurrence.history,
      {
        status,
        note: note.trim() || `Estado actualizado para ${status} pela entidade responsável.`,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  occurrenceStorage.update(recalculateOccurrenceScores(updated));
  return getOccurrenceByCode(code);
}

export { detectCategoryKey };
