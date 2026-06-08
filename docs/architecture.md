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
| Landing | `Frontend/src/features/landing/`, `Frontend/src/sections/` | Commercial narrative and conversion |
| Pages | `Frontend/src/pages/` | Route-level occurrence workflow |
| Layout | `Frontend/src/components/layout/` | Navigation, app shell, footer |
| Occurrence UI | `Frontend/src/components/occurrence/` | Upload, location, detail, score, timeline, validation |
| Maps | `Frontend/src/components/maps/` | Reusable Leaflet/OpenStreetMap layer |
| Services | `Frontend/src/services/` | Create, search, duplicate detection, update operations |
| Core | `Frontend/src/lib/` | Analysis, scoring, storage, normalization, geolocation |
| Types | `Frontend/src/types/` | Domain contracts |

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
- Reverse geocoding uses OpenStreetMap/Nominatim in `Frontend/src/lib/geo/reverseGeocode.ts`.
- Leaflet renders real map tiles through `Frontend/src/components/maps/RealMap.tsx`.
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

`Frontend/vite.config.ts` separates heavier dependencies into manual chunks:

- `maps` for Leaflet;
- `animation` for GSAP and Lenis;
- `vendor` for React dependencies.
