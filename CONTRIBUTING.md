# Contributing

This project is moving from prototype to team execution. Keep contributions small, reviewed, and easy to verify.

## Branches

- `main` must stay deployable.
- Create feature branches from `main`.
- Use clear branch names such as `feature/occurrence-model`, `fix/location-label`, or `docs/openapi-contract`.

## Before Opening A Pull Request

Run the full local quality gate:

```bash
cd Frontend
npm run lint
npm run build
npm test
```

Review the affected screens on desktop and mobile when the change touches UI.

## Pull Request Checklist

- Explain what changed and why.
- Link the related issue.
- Include screenshots only when the change is visual and the screenshot shows the real product surface.
- Confirm lint, build, and tests pass.
- Update documentation when behavior, setup, routes, or data contracts change.

## Commit Style

Use concise imperative messages:

```text
Add occurrence scoring tests
Document FastAPI endpoint contract
Improve public tracking empty state
```

## Product Rules

- Keep location readable for citizens and coordinates available for technical use.
- Use real map surfaces for product views.
- Keep the live flow as the primary demo.
- Do not add fake dashboard screenshots or mocked product images.
