# KANDA Development Guide

## Requirements

- Node.js 20+
- npm
- Git

## Setup

```bash
npm install
npm run dev
```

The development server runs at [http://localhost:3000](http://localhost:3000) by default.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start local Vite server |
| `npm run lint` | Run ESLint |
| `npm run build` | Type-check and build production assets |
| `npm run preview` | Serve the `dist/` build locally |

## Editing Copy

Landing copy lives in:

```text
src/features/landing/content.ts
```

Keep product language operational and concise.

## Adding a Landing Section

1. Create a new file in `src/sections/`.
2. Import it in `src/features/landing/LandingPage.tsx`.
3. Add a navigation target in `src/features/landing/content.ts` only when the section needs a nav link.
4. Use `ScrollReveal` or existing GSAP patterns for animation.

## Maps

Use `src/components/maps/RealMap.tsx` for map rendering. Do not create static map drawings for product surfaces.

Map data comes from Leaflet/OpenStreetMap. Reverse geocoding is handled in:

```text
src/lib/geo/reverseGeocode.ts
```

## Styling

- Global tokens and shared component classes: `src/index.css`
- Tailwind theme: `tailwind.config.js`
- Prefer Tailwind utilities in components.
- Use inline styles only for dynamic map/animation values.

## Validation Before Push

Always run:

```bash
npm run lint
npm run build
```

If UI changed, also review:

- desktop landing;
- mobile landing;
- `/reportar`;
- `/acompanhar`;
- `/ocorrencia/:codigo` after creating a sample occurrence.
