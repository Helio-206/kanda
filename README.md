# KANDA — Intelligent Occurrence Management

[![CI](https://github.com/Helio-206/kanda/actions/workflows/ci.yml/badge.svg)](https://github.com/Helio-206/kanda/actions/workflows/ci.yml)

KANDA is a commercial prototype for registering, locating, qualifying, prioritizing, and tracking urban occurrences.

The product flow is intentionally focused:

- capture a photo and location;
- resolve a readable place name from GPS coordinates;
- classify the occurrence with the local analysis engine;
- calculate the KANDA Score;
- show a real map with risk markers;
- track each record through a unique code.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Gates

```bash
npm run lint
npm run build
npm test
```

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Commercial landing page |
| `/reportar` | Create a new occurrence |
| `/acompanhar` | Search by occurrence code |
| `/ocorrencia/:codigo` | Occurrence detail, map, score, and history |

## Documentation

| Document | Purpose |
|----------|---------|
| [docs/handoff.md](docs/handoff.md) | Product handoff for teammates |
| [docs/architecture.md](docs/architecture.md) | Technical structure and data flow |
| [docs/development.md](docs/development.md) | Setup, scripts, and local workflow |
| [docs/phases.md](docs/phases.md) | Product phases and delivery stages |
| [docs/roadmap.md](docs/roadmap.md) | Milestones, epics, and execution order |
| [docs/procedures.md](docs/procedures.md) | Operating procedures for the team |
| [docs/rules.md](docs/rules.md) | Product, code, and presentation rules |
| [docs/technical-spec.md](docs/technical-spec.md) | Technical specification and production path |
| [docs/api/README.md](docs/api/README.md) | API contract and OpenAPI guidance |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution workflow and pull request rules |

## Stack

React 19 · TypeScript · Vite 7 · Tailwind CSS 3 · GSAP · Lenis · React Router · Leaflet/OpenStreetMap · shadcn/ui

## License

© 2026 KANDA. All rights reserved.
