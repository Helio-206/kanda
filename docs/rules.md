# Project Rules

## Product Rules

- The first screen must show the actual product value.
- Location is a core feature, not a secondary field.
- Show readable place names before raw coordinates.
- Keep coordinates available as technical detail.
- Use real maps for product surfaces.
- Do not use fake dashboard screenshots or mocked product images.

## Language Rules

- Use professional product language.
- Prefer "analysis engine", "automated analysis", and "intelligent layer".
- Avoid language that makes the codebase look generated or disposable.
- Keep public copy concise and operational.

## Code Rules

- Keep changes scoped.
- Follow existing folder boundaries.
- Prefer reusable components for maps, occurrence detail, and layout.
- Keep GSAP/Lenis animations intact unless the task explicitly changes motion.
- Use `rg` for searching.
- Run `npm run lint` and `npm run build` before publishing.

## Data Rules

- Do not store secrets in the repo.
- Do not expose API keys in client code.
- Treat photos and locations as sensitive production data.
- In the prototype, use local storage only for demonstration.

## Presentation Rules

- Demonstrate the live flow.
- Create an occurrence during the presentation.
- Show map, readable location, score, code, and tracking.
- Avoid claims that are not implemented yet.
