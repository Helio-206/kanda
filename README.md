# KANDA — Intelligent Occurrence Management

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
| [docs/procedures.md](docs/procedures.md) | Operating procedures for the team |
| [docs/rules.md](docs/rules.md) | Product, code, and presentation rules |
| [docs/technical-spec.md](docs/technical-spec.md) | Technical specification and production path |

## Stack

React 19 · TypeScript · Vite 7 · Tailwind CSS 3 · GSAP · Lenis · React Router · Leaflet/OpenStreetMap · shadcn/ui

## License

© 2026 KANDA. All rights reserved.
