# KANDA Handoff

This document is the first stop for teammates joining the project.

## Product Positioning

KANDA is an intelligent occurrence management platform. It turns field reports into structured records with photo evidence, readable location, exact coordinates, risk scoring, suggested responsibility, and traceable history.

The product is not a generic report form. It is an operational intake layer between what happens on the ground and the team that needs to act.

## Current Product Surface

| Route | Purpose |
|-------|---------|
| `/` | Commercial landing page |
| `/reportar` | Create a new occurrence |
| `/acompanhar` | Search by occurrence code |
| `/ocorrencia/:codigo` | Occurrence detail, map, score, and timeline |

## Demo Flow

1. Open the landing page and explain the operational value.
2. Go to `/reportar`.
3. Upload a photo, capture or type location, and add an optional note.
4. Show the readable location name, coordinates, map, score, suggested responsibility, and generated code.
5. Open `/acompanhar` and search by code.
6. Open `/ocorrencia/:codigo` and show the full record with map, timeline, and community validation.

## Repository Map

```
app/
├── docs/
│   ├── architecture.md
│   ├── development.md
│   ├── handoff.md
│   ├── phases.md
│   ├── procedures.md
│   └── rules.md
├── src/
│   ├── features/landing/          # Landing composition and commercial copy
│   ├── pages/                     # Route-level product screens
│   ├── sections/                  # Landing sections
│   ├── components/
│   │   ├── layout/                # Navigation, app shell, footer
│   │   ├── maps/                  # Leaflet/OpenStreetMap map layer
│   │   ├── occurrence/            # Upload, location, detail, score, timeline
│   │   └── ui/                    # shadcn/ui primitives
│   ├── services/                  # Occurrence orchestration
│   ├── hooks/
│   ├── lib/                       # Analysis, scoring, storage, geo helpers
│   └── types/
└── README.md
```

## Core Modules

- `src/services/occurrenceService.ts` orchestrates create, search, duplicate detection, and status updates.
- `src/lib/analysis/analyzeOccurrence.ts` contains the local analysis engine.
- `src/lib/scoring/kandaScore.ts` contains the KANDA Score formula.
- `src/lib/geo/reverseGeocode.ts` converts coordinates into readable area names.
- `src/components/maps/RealMap.tsx` renders the real map layer.

## Presentation Notes

- Sell the live product, not static mockups.
- Emphasize geolocation, readable place names, traceability, and prioritization.
- Keep the pitch operational: less noise in intake, clearer response, better history.
