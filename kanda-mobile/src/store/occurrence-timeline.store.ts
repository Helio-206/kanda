import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  OccurrenceTimelineEvent,
  OccurrenceTimelineEventType,
} from "@/types/occurrence";

type AddTimelineEventInput = {
  occurrenceId: string;
  type: OccurrenceTimelineEventType;
  title: string;
  description?: string | null;
};

type OccurrenceTimelineStore = {
  events: OccurrenceTimelineEvent[];
  addEvent: (input: AddTimelineEventInput) => OccurrenceTimelineEvent;
  getEventsByOccurrenceId: (occurrenceId: string) => OccurrenceTimelineEvent[];
  clearOccurrenceTimeline: (occurrenceId: string) => void;
  clearAll: () => void;
};

const now = () => new Date().toISOString();

const buildEvent = (input: AddTimelineEventInput): OccurrenceTimelineEvent => {
  const timestamp = now();

  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    occurrenceId: input.occurrenceId,
    type: input.type,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    createdAt: timestamp,
  };
};

export const useOccurrenceTimelineStore = create<OccurrenceTimelineStore>()(
  persist(
    (set, get) => ({
      events: [],
      addEvent: (input) => {
        const event = buildEvent(input);

        set((state) => ({
          events: [event, ...state.events],
        }));

        return event;
      },
      getEventsByOccurrenceId: (occurrenceId) =>
        get()
          .events
          .filter((event) => event.occurrenceId === occurrenceId)
          .sort((left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt)),
      clearOccurrenceTimeline: (occurrenceId) =>
        set((state) => ({
          events: state.events.filter((event) => event.occurrenceId !== occurrenceId),
        })),
      clearAll: () => set({ events: [] }),
    }),
    {
      name: "kanda-occurrence-timeline-store",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
