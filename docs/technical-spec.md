# Technical Specification

## Product Summary

KANDA is a commercial prototype for intelligent occurrence management. It captures a field report with photo and location, enriches it with automated analysis, assigns priority, and keeps the record traceable through a unique code.

The current web frontend lives in `Frontend/`. Repository-level documentation, API contracts, and GitHub automation stay at the root.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Commercial landing page |
| `/reportar` | Create occurrence |
| `/acompanhar` | Track by code |
| `/ocorrencia/:codigo` | Occurrence detail |

## Core Flow

1. Capture photo, location, and note.
2. Resolve coordinates and readable area name.
3. Analyze the occurrence.
4. Calculate risk, impact, confidence, and KANDA Score.
5. Suggest responsible area and next action.
6. Store the occurrence locally.
7. Allow lookup by code.

## Dependencies

| Package | Purpose |
|---------|---------|
| React + TypeScript | UI and type safety |
| Vite | Build and development server |
| React Router | Client-side routes |
| Tailwind CSS | Styling |
| GSAP + Lenis | Landing animation and smooth scroll |
| Leaflet + OpenStreetMap | Real map tiles, markers, and analysis radius |
| Radix/shadcn UI | Reusable interface primitives |
| lucide-react | Icons |

## Current Prototype

- local storage persistence;
- local automated analysis engine;
- deterministic scoring model;
- real Leaflet/OpenStreetMap map layer;
- reverse geocoding from GPS coordinates to readable area names;
- duplicate detection by proximity and category.

## Production Path

- API backend;
- PostgreSQL/PostGIS;
- authentication and permissions;
- audit history;
- notification channels;
- real computer vision integration;
- operational integrations with municipal or private service teams.

## Visual Rule

The product must be sold through the live experience. Do not use fake dashboard screenshots or mocked product images.
