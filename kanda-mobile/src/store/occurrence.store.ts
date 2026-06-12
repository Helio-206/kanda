import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { distanceBetweenCoordinates } from "@/services/location.service";
import { useOccurrenceTimelineStore } from "@/store/occurrence-timeline.store";
import type {
  CreateOccurrenceInput,
  Occurrence,
  OccurrenceStatus,
  UpdateOccurrenceInput,
} from "@/types/occurrence";
import { occurrenceStatusLabels } from "@/types/occurrence";
import type { Coordinates } from "@/types/geo";

type OccurrenceStore = {
  occurrences: Occurrence[];
  createOccurrence: (input: CreateOccurrenceInput) => Occurrence;
  updateOccurrence: (id: string, patch: UpdateOccurrenceInput) => void;
  updateStatus: (id: string, status: OccurrenceStatus) => void;
  removeOccurrence: (id: string) => void;
  getOccurrenceById: (id: string) => Occurrence | undefined;
  getOccurrenceByCode: (code: string) => Occurrence | undefined;
  getNearbyOccurrences: (center: Coordinates, radiusMeters?: number) => Occurrence[];
  clearAll: () => void;
};

const now = () => new Date().toISOString();

function generateOccurrenceCode(existingCodes = new Set<string>()) {
  const chars = "0123456789ABCDEF";
  let code = "";

  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  const candidate = `KANDA-${code}`;

  if (existingCodes.has(candidate)) {
    return generateOccurrenceCode(existingCodes);
  }

  existingCodes.add(candidate);
  return candidate;
}

function addTimelineEvent(
  occurrenceId: string,
  type: "enviada" | "recebida_localmente" | "status_alterado" | "resolvida" | "apagada",
  title: string,
  description?: string | null
) {
  useOccurrenceTimelineStore.getState().addEvent({
    occurrenceId,
    type,
    title,
    description,
  });
}

const buildOccurrence = (input: CreateOccurrenceInput, code: string): Occurrence => {
  const timestamp = now();

  return {
    id: `occ-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    code,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    priority: input.priority,
    status: "enviada",
    latitude: input.latitude,
    longitude: input.longitude,
    accuracy: input.accuracy ?? null,
    addressLabel: input.addressLabel?.trim() || null,
    imageUri: input.imageUri ?? null,
    aiImageUsed: input.aiImageUsed ?? null,
    aiTextUsed: input.aiTextUsed ?? null,
    aiDetectedObjects: input.aiDetectedObjects ?? [],
    aiSceneDescription: input.aiSceneDescription ?? null,
    aiRiskHints: input.aiRiskHints ?? [],
    aiDamageLevel: input.aiDamageLevel ?? null,
    aiAuthoritySummary: input.aiAuthoritySummary ?? null,
    aiGeneratedDescription: input.aiGeneratedDescription ?? null,
    aiCategory: input.aiCategory ?? null,
    aiPriority: input.aiPriority ?? null,
    aiResponsibleEntity: input.aiResponsibleEntity ?? null,
    aiSummary: input.aiSummary ?? null,
    aiRiskLevel: input.aiRiskLevel ?? null,
    aiConfidence: input.aiConfidence ?? null,
    aiFlags: input.aiFlags ?? [],
    aiPossibleDuplicate: input.aiPossibleDuplicate ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

export const useOccurrenceStore = create<OccurrenceStore>()(
  persist(
    (set, get) => ({
      occurrences: [],
      createOccurrence: (input) => {
        const existingCodes = new Set(get().occurrences.map((item) => item.code));
        const occurrence = buildOccurrence(input, generateOccurrenceCode(existingCodes));

        set((state) => ({
          occurrences: [occurrence, ...state.occurrences],
        }));

        addTimelineEvent(occurrence.id, "enviada", "Ocorrência enviada");
        addTimelineEvent(
          occurrence.id,
          "recebida_localmente",
          "Ocorrência recebida localmente",
          "Guardada no telemóvel e pronta para acompanhamento."
        );

        return occurrence;
      },
      updateOccurrence: (id, patch) => {
        const current = get().occurrences.find((occurrence) => occurrence.id === id);

        set((state) => ({
          occurrences: state.occurrences.map((occurrence) =>
            occurrence.id === id
              ? {
                  ...occurrence,
                  ...patch,
                  updatedAt: now(),
                }
              : occurrence
          ),
        }));

        if (current && patch.status && patch.status !== current.status) {
          const description = `Estado alterado para ${occurrenceStatusLabels[patch.status]}.`;

          if (patch.status === "resolvida") {
            addTimelineEvent(id, "resolvida", "Ocorrência resolvida", description);
          } else {
            addTimelineEvent(id, "status_alterado", "Estado alterado", description);
          }
        }
      },
      updateStatus: (id, status) => {
        const current = get().occurrences.find((occurrence) => occurrence.id === id);

        if (!current || current.status === status) {
          return;
        }

        set((state) => ({
          occurrences: state.occurrences.map((occurrence) =>
            occurrence.id === id
              ? {
                  ...occurrence,
                  status,
                  updatedAt: now(),
                }
              : occurrence
          ),
        }));

        const description = `Estado alterado para ${occurrenceStatusLabels[status]}.`;

        if (status === "resolvida") {
          addTimelineEvent(id, "resolvida", "Ocorrência resolvida", description);
          return;
        }

        addTimelineEvent(id, "status_alterado", "Estado alterado", description);
      },
      removeOccurrence: (id) => {
        const occurrence = get().occurrences.find((item) => item.id === id);

        if (occurrence) {
          addTimelineEvent(
            id,
            "apagada",
            "Ocorrência apagada",
            "Removida localmente do telemóvel."
          );
        }

        set((state) => ({
          occurrences: state.occurrences.filter((occurrence) => occurrence.id !== id),
        }));
      },
      getOccurrenceById: (id) => get().occurrences.find((occurrence) => occurrence.id === id),
      getOccurrenceByCode: (code) =>
        get().occurrences.find((occurrence) => occurrence.code === code),
      getNearbyOccurrences: (center, radiusMeters = 1000) =>
        get()
          .occurrences
          .filter((occurrence) => {
            const distance = distanceBetweenCoordinates(center, {
              latitude: occurrence.latitude,
              longitude: occurrence.longitude,
            });

            return distance <= radiusMeters;
          })
          .sort((left, right) => {
            const leftDistance = distanceBetweenCoordinates(center, {
              latitude: left.latitude,
              longitude: left.longitude,
            });
            const rightDistance = distanceBetweenCoordinates(center, {
              latitude: right.latitude,
              longitude: right.longitude,
            });

            return leftDistance - rightDistance;
          }),
      clearAll: () => {
        set({ occurrences: [] });
        useOccurrenceTimelineStore.getState().clearAll();
      },
    }),
    {
      name: "kanda-occurrence-store",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persistedState, version) => {
        if (!persistedState || version >= 2) {
          return persistedState as OccurrenceStore;
        }

        const state = persistedState as Partial<OccurrenceStore> & {
          occurrences?: Partial<Occurrence>[];
        };

        const existingCodes = new Set<string>();
        const occurrences = (state.occurrences ?? []).map((occurrence) => {
          const code = occurrence.code ?? generateOccurrenceCode(existingCodes);
          existingCodes.add(code);

          return {
            ...occurrence,
            code,
          } as Occurrence;
        });

        return {
          ...state,
          occurrences,
        } as OccurrenceStore;
      },
    }
  )
);
