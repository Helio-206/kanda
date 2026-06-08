# KANDA Architecture

## Overview

KANDA is a React SPA with a commercial landing page and a focused occurrence flow.

```
main.tsx
  └── App.tsx
        └── BrowserRouter
              ├── /                         LandingPage
              ├── /reportar                 Create occurrence
              ├── /acompanhar               Search by code
              └── /ocorrencia/:codigo       Occurrence detail
```

## Layers

| Layer | Folder | Responsibility |
|-------|--------|----------------|
| Landing | `src/features/landing/`, `src/sections/` | Commercial narrative and conversion |
| Pages | `src/pages/` | Route-level occurrence workflow |
| Layout | `src/components/layout/` | Navigation, app shell, footer |
| Occurrence UI | `src/components/occurrence/` | Upload, location, detail, score, timeline, validation |
| Maps | `src/components/maps/` | Reusable Leaflet/OpenStreetMap layer |
| Services | `src/services/` | Create, search, duplicate detection, update operations |
| Core | `src/lib/` | Analysis, scoring, storage, normalization, geolocation |
| Types | `src/types/` | Domain contracts |

## Main Flow

1. The user creates an occurrence in `/reportar`.
2. `occurrenceService` calls `analyzeOccurrence`.
3. The analysis engine returns category, description, risk, scores, suggested responsibility, and next action.
4. `kandaScore.ts` calculates the operational priority.
5. The occurrence is saved in `localStorage`.
6. The generated code can be searched in `/acompanhar`.
7. `/ocorrencia/:codigo` shows detail, map, timeline, and community validation.

## Geolocation

KANDA stores coordinates and also resolves a readable location name.

- GPS capture uses `navigator.geolocation`.
- Reverse geocoding uses OpenStreetMap/Nominatim in `src/lib/geo/reverseGeocode.ts`.
- Leaflet renders real map tiles through `src/components/maps/RealMap.tsx`.
- Markers use risk colors and the occurrence detail can show a proximity radius.

Coordinates remain visible as technical detail, but users see a readable area name first.

## Local Data

The current prototype uses `localStorage` for portability. A production build should replace this with:

- API backend;
- PostgreSQL/PostGIS;
- authentication and permissions;
- audit logs;
- notification channels;
- operational integrations.

## Build Optimization

`vite.config.ts` separates heavier dependencies into manual chunks:

- `maps` for Leaflet;
- `animation` for GSAP and Lenis;
- `vendor` for React dependencies.
