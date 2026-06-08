import type { Occurrence } from '@/types/occurrence';

const STORAGE_KEY = 'kanda-occurrences';

export interface OccurrenceRepository {
  getAll(): Occurrence[];
  getByCode(code: string): Occurrence | null;
  save(occurrence: Occurrence): void;
  update(occurrence: Occurrence): void;
}

function readAll(): Occurrence[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Occurrence[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(occurrences: Occurrence[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(occurrences));
}

export const occurrenceStorage: OccurrenceRepository = {
  getAll() {
    return readAll().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  getByCode(code: string) {
    const normalized = code.trim().toUpperCase();
    return readAll().find((item) => item.code.toUpperCase() === normalized) ?? null;
  },

  save(occurrence: Occurrence) {
    const all = readAll();
    all.unshift(occurrence);
    writeAll(all);
  },

  update(occurrence: Occurrence) {
    const all = readAll();
    const index = all.findIndex((item) => item.id === occurrence.id);
    if (index === -1) return;
    all[index] = occurrence;
    writeAll(all);
  },
};
