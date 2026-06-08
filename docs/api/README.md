# API Contract

KANDA will use FastAPI for the shared backend consumed by the web app and future mobile app.

FastAPI must expose:

- `/api/docs` for Swagger UI;
- `/api/openapi.json` for the generated OpenAPI schema;
- `/api/redoc` as optional readable API reference.

The versioned contract lives in [openapi.yaml](openapi.yaml). When the FastAPI backend is created, its generated schema should match this file or intentionally update it in the same pull request.

## Endpoint Groups

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | Service health check |
| `POST` | `/reports/analyze` | Analyze an image, note, and location before creating a report |
| `POST` | `/reports` | Create an occurrence |
| `GET` | `/reports` | List occurrences for dashboards and operations |
| `GET` | `/reports/{code}` | Fetch public occurrence detail by code |
| `PATCH` | `/reports/{code}/status` | Update occurrence status and history |
| `POST` | `/reports/{code}/confirm` | Add community confirmation |
| `GET` | `/reports/nearby` | Find nearby or similar occurrences |
| `GET` | `/entities` | List responsible entities and service areas |

When implementing FastAPI, define `/reports/nearby` before `/reports/{code}` to avoid path matching ambiguity.

## Rules

- The web app and mobile app must consume the same response shape.
- Location data must include readable address fields and coordinates.
- Occurrence history must be append-only.
- Status changes must always include a history note.
- Public endpoints must not expose private citizen data.
