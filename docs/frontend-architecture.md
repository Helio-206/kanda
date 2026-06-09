# KANDA Frontend Architecture

## Objective

This doc lays out the frontend architecture for KANDA: web and mobile surfaces, shared domain models, UI states, service boundaries, and the backend contracts the frontend expects.

It stays strictly in frontend territory:

- no SQL;
- no PostGIS;
- no FastAPI internals;
- no backend implementation rules;
- no AI logic implementation.

## Product Direction

The product is moving toward:

- mobile-first for citizens;
- web-first for operational entities;
- community credibility as a core product system;
- community confirmation as a first-class action;
- occurrence clustering and deduplication as visible UX states;
- territorial intelligence as a central operational layer.

## 1. Current Frontend Baseline

The existing frontend already gives us a solid base:

- `Frontend/src/features/landing/` contains the commercial narrative;
- `Frontend/src/pages/` contains the current occurrence flow;
- `Frontend/src/components/occurrence/` contains reusable occurrence UI;
- `Frontend/src/components/maps/` contains the real map layer;
- `Frontend/src/services/occurrenceService.ts` contains orchestration and data access;
- `Frontend/src/lib/` contains scoring, geo, normalization, and analysis helpers;
- the prototype currently relies on `localStorage`, but the target architecture assumes API-backed state.

## 2. Recommended Folder Structure

```text
Frontend/src/
  app/
    routes/
    providers/
    navigation/
    App.tsx
  assets/
  components/
    ui/
    layout/
    common/
    maps/
    charts/
    feedback/
  features/
    landing/
    reporting/
    exploration/
    tracking/
    dashboard/
    insights/
    profile/
    credibility/
    validation/
    clustering/
  pages/
    web/
    mobile/
  services/
    api/
    mobile.service.ts
    dashboard.service.ts
    insights.service.ts
    map.service.ts
    profile.service.ts
    credibility.service.ts
    occurrences.service.ts
    entities.service.ts
  stores/
  hooks/
  lib/
    geo/
    scoring/
    formatting/
    validation/
    mocks/
  types/
    api/
    domain/
    ui/
  theme/
    tokens.ts
    colors.ts
    typography.ts
    spacing.ts
```

### Folder responsibilities

- `app/` owns routing, providers, and global shell composition.
- `features/` groups product domains, not generic component types.
- `pages/web/` and `pages/mobile/` separate platform-specific route surfaces.
- `components/common/` holds reusable building blocks shared across domains.
- `services/` contains API clients and request orchestration only.
- `types/domain/` models the frontend domain language.
- `types/api/` mirrors backend payloads.
- `lib/mocks/` holds local dev fixtures and canned responses.

## 3. Web Navigation

Web is the ops side of the product, built for entities.

### Web routes

- `/` - Landing Page
- `/dashboard-entidades` - Dashboard das Entidades
- `/dashboard-administrativo` - Dashboard Administrativo
- `/insights` - Insights
- `/mapa-administrativo` - Mapa Administrativo

### Web navigation model

- `Landing Page` is public and conversion-focused.
- `Dashboard das Entidades` is the main operational surface for entity teams.
- `Dashboard Administrativo` is for governance, oversight, and platform monitoring.
- `Insights` exposes trends, performance, territorial signals, and demand patterns.
- `Mapa Administrativo` exposes the territorial distribution of occurrences and clusters.
- public occurrence tracking should be treated as optional utility, not as a primary web journey.

### What web should emphasize

- triage;
- prioritization;
- entity assignment;
- territorial monitoring;
- cluster visibility;
- score visibility;
- resolution progress;
- aggregated insights.

## 4. Mobile Navigation

Mobile is the main citizen experience, no question.

### Mobile routes

- `/m/home` - Home
- `/m/reportar` - Reportar Ocorrência
- `/m/analise` - Análise IA
- `/m/confirmar-rótulos` - Confirmar Rótulos
- `/m/sucesso` - Sucesso
- `/m/explorar` - Explorar Ocorrências
- `/m/minhas-ocorrencias` - Minhas Ocorrências
- `/m/ocorrencia/:codigo` - Detalhe da Ocorrência
- `/m/perfil` - Perfil
- `/m/credibilidade` - Credibilidade

### Mobile navigation model

- `Home` is the entry point for the citizen.
- `Reportar Ocorrência` is the main create flow.
- `Análise IA` presents automated classification and suggested labels.
- `Confirmar Rótulos` lets the citizen review and validate proposed labels.
- `Sucesso` confirms submission and gives the tracking code and next steps.
- `Explorar Ocorrências` is a central surface for nearby discovery, search, filtering, and confirmation.
- `Minhas Ocorrências` shows the user’s own history and progress.
- `Detalhe da Ocorrência` is the primary tracking and confirmation surface.
- `Perfil` summarizes identity and activity.
- `Credibilidade` shows the credibility system in depth.

### Mobile citizen flow

1. Open `Home`.
2. Start `Reportar Ocorrência`.
3. Capture image, location, and note.
4. Review `Análise IA`.
5. Confirm labels in `Confirmar Rótulos`.
6. Reach `Sucesso`.
7. Explore nearby occurrences or open the detailed record.
8. Confirm occurrences when appropriate.
9. Review `Perfil` and `Credibilidade`.

## 5. Reusable Components

### Domain components

- `OccurrenceCard`
- `OccurrenceList`
- `OccurrenceDetail`
- `OccurrenceMap`
- `OccurrenceClusterCard`
- `ClusterSummaryCard`
- `NearbyOccurrenceCard`
- `Timeline`
- `StatusBadge`
- `RiskBadge`
- `ScoreBadge`
- `ScoreBreakdown`
- `DuplicateAlert`
- `CommunityValidation`
- `ConfirmationPanel`
- `ConfirmationSummary`
- `PriorityScore`
- `LocationInput`
- `ImageUploader`
- `EmptyState`
- `EntityBadge`
- `CredibilityScoreCard`
- `CredibilityTimeline`
- `CredibilityEventList`

### Shell and navigation components

- `AppHeader`
- `AppFooter`
- `Sidebar`
- `TopNav`
- `BottomNav`
- `PageHeader`
- `Breadcrumbs`
- `SectionTabs`
- `FilterBar`

### Feedback components

- `LoadingState`
- `SkeletonCard`
- `ErrorState`
- `Toast`
- `InlineAlert`
- `ConfirmDialog`

### Map components

- `RealMap`
- `MapMarker`
- `MapLegend`
- `MapCluster`
- `NearbyRadiusOverlay`

## 6. Design System

The design system should keep things clear, trustworthy, and ready for day-to-day ops.

### Principles

- show readable location names before coordinates;
- keep map surfaces real and not decorative;
- show score, status, and entity early;
- use strong hierarchy for citizen vs entity contexts;
- design for low-friction mobile reporting and high-density web operations.

### Core tokens

- `color.brand`
- `color.brandSoft`
- `color.background`
- `color.surface`
- `color.surfaceElevated`
- `color.textPrimary`
- `color.textSecondary`
- `color.border`
- `color.success`
- `color.warning`
- `color.danger`
- `color.info`
- `radius.sm`
- `radius.md`
- `radius.lg`
- `radius.xl`
- `space.1` to `space.12`
- `shadow.sm`
- `shadow.md`
- `shadow.lg`
- `typography.display`
- `typography.heading`
- `typography.body`
- `typography.caption`

### Visual states

- buttons: `primary`, `secondary`, `ghost`, `destructive`;
- badges: `status`, `risk`, `score`, `entity`, `cluster`;
- cards: `standard`, `highlight`, `map`, `metric`, `cluster`;
- inputs: `text`, `textarea`, `file`, `location`, `search`, `select`;
- progress: `stepper`, `linear`, `radial`;
- feedback: `toast`, `banner`, `inline error`, `empty state`.

## 7. Global State

### Auth and session

- authenticated user;
- guest citizen session;
- entity operator session;
- role and permissions.

### Occurrence state

- selected occurrence;
- occurrence list;
- nearby occurrences;
- occurrence detail history;
- loading and error states;
- open cluster context.

### Filtering state

- status;
- risk;
- category;
- entity;
- date range;
- distance radius;
- sort mode;
- search query.

### Submission state

- selected image;
- location capture;
- IA analysis snapshot;
- confirmed labels;
- duplicate detection state;
- clustering suggestion state;
- submission progress.

### Credibility state

- `CredibilityProfile`;
- `CredibilityEvents`;
- `CredibilityTimeline`;
- current score;
- user level;
- positive events;
- negative events;
- score evolution.

### Community confirmation state

- confirmation action state;
- confirmation count;
- confirmation history;
- confirmation impact feedback;
- already-confirmed state;
- post-confirmation success feedback.

### UI state

- theme;
- locale;
- notifications;
- dialogs;
- sheets;
- drawers;
- offline/online.

## 8. Frontend Domain Model

These are the frontend's conceptual entities, independent of backend implementation details.

- `User`
- `CredibilityProfile`
- `CredibilityEvent`
- `Occurrence`
- `OccurrenceCluster`
- `OccurrenceHistory`
- `Confirmation`
- `Entity`
- `Tag`
- `Insight`
- `NearbyOccurrence`

## 9. Backend Service Boundaries

The frontend talks to these service areas:

- `mobile.service`
- `dashboard.service`
- `insights.service`
- `map.service`
- `profile.service`
- `credibility.service`
- `occurrences.service`
- `entities.service`

### Service responsibilities

- `mobile.service` handles citizen-first flows.
- `dashboard.service` handles operational listing and state changes.
- `insights.service` handles trend and aggregate views.
- `map.service` handles territorial views and nearby occurrence discovery.
- `profile.service` handles user profile data.
- `credibility.service` handles score, events, and timeline views.
- `occurrences.service` handles detail, confirmation, and list retrieval.
- `entities.service` handles entity metadata.

## 10. Types Needed

### API-facing types

- `Occurrence`
- `OccurrenceSummary`
- `OccurrenceDetail`
- `OccurrenceStatus`
- `RiskLevel`
- `Location`
- `GeoPoint`
- `OccurrenceHistoryEntry`
- `OccurrenceScore`
- `CommunityConfidenceScore`
- `DuplicateMatch`
- `OccurrenceCluster`
- `Entity`
- `EntitySummary`
- `Insight`
- `InsightMetric`
- `InsightSeriesPoint`
- `CredibilityProfile`
- `CredibilityEvent`
- `CredibilityTimeline`
- `NearbyOccurrence`
- `Confirmation`
- `Tag`
- `LabelSuggestion`
- `ReportDraft`
- `ReportSubmission`
- `ApiError`
- `PaginatedResponse<T>`

### UI types

- `FilterState`
- `StepperState`
- `LoadingState`
- `EmptyStateProps`
- `ToastMessage`
- `MapViewport`
- `NavigationItem`

### Route types

- `WebRoute`
- `MobileRoute`
- `ProtectedRoute`
- `EntityRoute`

## 11. UX Requirements by Core Feature

### Reporting

The citizen reports from mobile. The UI should:

- make photo capture the first high-confidence action;
- keep location capture obvious and fast;
- show automated analysis before submission;
- allow label confirmation when the system is uncertain;
- present the final code clearly after success.

### Tracking

Tracking is primarily mobile. The UI should:

- show status, history, score, location, and entity at a glance;
- let the citizen open the full detail from a code or a list item;
- keep public web tracking as a secondary utility only.

### Nearby discovery

The citizen should be able to:

- see nearby occurrences;
- search occurrences;
- filter by category;
- filter by risk;
- open details;
- confirm occurrences.

Nearby discovery is a central product behavior, not a side feature.

### Community confirmation

The frontend lets people:

- confirm an occurrence;
- see the confirmation count;
- see the impact of the confirmation;
- see whether the user already confirmed the case;
- understand how confirmation changes the community trust signal.

### Credibility

The frontend should make this obvious:

- current score;
- evolution over time;
- positive events;
- negative events;
- user level.

It should expose:

- `CredibilityProfile`;
- `CredibilityEvents`;
- `CredibilityTimeline`.

The UI can explain impact, but should not expose score formulas.

### Deduplication and clustering

The frontend should support:

- possible duplicate warnings;
- clustered occurrence groups;
- a main occurrence in the cluster;
- cluster size;
- occurrence grouping context.

The UI should represent these states visibly in lists, detail, map markers, and summary cards.

### KANDA Score

The frontend should be prepared to display:

- `Risk Score`;
- `Impact Score`;
- `AI Confidence Score`;
- `Community Confidence Score`;
- `KANDA Score Final`.

It should not define formulas, only display and compare the components.

### Entity operations

Entity teams use the web dashboard to:

- triage occurrences;
- filter and sort workloads;
- inspect clusters;
- review map density;
- inspect territorial patterns;
- monitor resolution progress;
- review insights.

## 12. Backend Contracts Expected by the Frontend

Contracts are grouped by surface. Each endpoint only shows the request and response shape the UI needs.

### 12.1 Mobile Endpoints

#### `POST /api/mobile/reports/analyze`

Request:

- `multipart/form-data`
- `image` required
- `citizenNote` optional
- `location` required object with:
  - `latitude`
  - `longitude`
  - `address`
  - `municipality`
  - `province`

Response:

```json
{
  "category": "Buraco na via pública",
  "categoryKey": "buraco",
  "description": "Text for the citizen",
  "risk": "Alto",
  "scores": {
    "riskScore": 92,
    "impactScore": 87,
    "aiConfidenceScore": 95,
    "communityConfidenceScore": 0,
    "kandaScore": 89
  },
  "suggestedEntity": "Administração Municipal",
  "suggestedAction": "Encaminhar para equipa de manutenção rodoviária.",
  "suggestedTags": ["via pública", "buraco"]
}
```

#### `POST /api/mobile/reports`

Request:

```json
{
  "imageUrl": "string",
  "citizenNote": "string",
  "location": {
    "latitude": -8.8,
    "longitude": 13.2,
    "address": "string",
    "municipality": "string",
    "province": "string"
  },
  "labelsConfirmed": ["string"],
  "analysisSnapshot": {
    "category": "string",
    "categoryKey": "string",
    "risk": "Médio",
    "scores": {
      "riskScore": 0,
      "impactScore": 0,
      "aiConfidenceScore": 0,
      "communityConfidenceScore": 0,
      "kandaScore": 0
    }
  }
}
```

Response:

```json
{
  "id": "uuid",
  "code": "KANDA-00A12B",
  "status": "Reportado",
  "cluster": null,
  "credibilityImpact": {
    "type": "neutral",
    "message": "string"
  }
}
```

#### `GET /api/mobile/reports/nearby`

Request:

- query required:
  - `latitude`
  - `longitude`
- query optional:
  - `radiusMeters`
  - `category`
  - `risk`
  - `query`

Response:

```json
[
  {
    "code": "KANDA-00A12B",
    "distanceMeters": 320,
    "occurrence": {
      "id": "uuid",
      "code": "KANDA-00A12B"
    },
    "cluster": {
      "id": "cluster-id",
      "isClustered": true,
      "clusterSize": 4,
      "mainCode": "KANDA-00A12B"
    }
  }
]
```

#### `GET /api/mobile/reports/{code}`

Request:

- path `code`

Response:

```json
{
  "id": "uuid",
  "code": "KANDA-00A12B",
  "status": "Reportado",
  "cluster": {
    "id": "cluster-id",
    "isClustered": true,
    "clusterSize": 4,
    "mainCode": "KANDA-00A12B"
  },
  "confirmations": 12,
  "communityConfidenceScore": 72,
  "credibilityImpact": {
    "type": "positive",
    "message": "A tua confirmação ajuda a reforçar a confiança do caso."
  }
}
```

#### `POST /api/mobile/reports/{code}/confirm`

Request:

```json
{
  "note": "string"
}
```

Response:

```json
{
  "code": "KANDA-00A12B",
  "confirmations": 13,
  "communityConfidenceScore": 72,
  "credibilityImpact": {
    "type": "positive",
    "message": "A confirmação aumentou a confiança comunitária e a tua credibilidade."
  }
}
```

#### `GET /api/mobile/profile/me`

Request:

- no body

Response:

```json
{
  "userId": "uuid",
  "name": "string",
  "role": "citizen",
  "credibilityProfile": {
    "currentScore": 78,
    "level": "Colaborador",
    "trend": "up",
    "nextMilestone": 82
  }
}
```

#### `GET /api/mobile/profile/me/credibility`

Request:

- query optional:
  - `limit`
  - `offset`

Response:

```json
{
  "profile": {
    "currentScore": 78,
    "level": "Colaborador"
  },
  "events": [
    {
      "id": "event-id",
      "type": "positive",
      "title": "Reportou ocorrência válida",
      "description": "string",
      "impact": 2,
      "createdAt": "2026-06-08T00:00:00Z"
    }
  ],
  "timeline": [
    {
      "label": "2026-06",
      "score": 78
    }
  ]
}
```

#### `GET /api/mobile/profile/me/occurrences`

Request:

- query optional:
  - `status`
  - `limit`
  - `offset`

Response:

```json
{
  "items": [
    { "id": "uuid", "code": "KANDA-00A12B", "status": "Reportado" }
  ],
  "total": 0
}
```

### 12.2 Dashboard Endpoints

#### `GET /api/dashboard/reports`

Request:

- query optional:
  - `status`
  - `risk`
  - `entity`
  - `category`
  - `clustered`
  - `limit`
  - `offset`

Response:

```json
{
  "items": [
    {
      "code": "KANDA-00A12B",
      "status": "Reportado",
      "risk": "Alto",
      "cluster": {
        "isClustered": true,
        "clusterSize": 4,
        "mainCode": "KANDA-00A12B"
      }
    }
  ],
  "total": 0
}
```

#### `PATCH /api/dashboard/reports/{code}/status`

Request:

```json
{
  "status": "Em análise",
  "note": "string"
}
```

Response:

```json
{
  "code": "KANDA-00A12B",
  "status": "Em análise",
  "updatedAt": "2026-06-08T00:00:00Z"
}
```

#### `GET /api/dashboard/entities`

Request:

- query optional:
  - `area`

Response:

```json
[
  {
    "id": "uuid",
    "name": "Administração Municipal",
    "area": "Infraestrutura",
    "coverage": "Luanda",
    "active": true
  }
]
```

### 12.3 Insights Endpoints

#### `GET /api/insights/summary`

Request:

- query optional:
  - `period`
  - `entity`
  - `area`

Response:

```json
{
  "totalReports": 0,
  "openReports": 0,
  "resolvedReports": 0,
  "clusterCount": 0,
  "averageResolutionTimeHours": 0,
  "topCategories": [
    { "category": "Buraco na via pública", "count": 0 }
  ]
}
```

#### `GET /api/insights/timeseries`

Request:

- query:
  - `metric`
  - `period`
  - `entity`

Response:

```json
[
  { "label": "2026-06-01", "value": 12 }
]
```

#### `GET /api/insights/territorial`

Request:

- query optional:
  - `entity`
  - `period`

Response:

```json
{
  "hotspots": [
    {
      "label": "Centro",
      "count": 12
    }
  ]
}
```

### 12.4 Map Endpoints

#### `GET /api/map/reports`

Request:

- query:
  - `bounds`
  - `status`
  - `risk`
  - `entity`
  - `category`
  - `radiusMeters`

Response:

```json
[
  {
    "id": "uuid",
    "code": "KANDA-00A12B",
    "latitude": -8.8,
    "longitude": 13.2,
    "status": "Reportado",
    "risk": "Alto",
    "cluster": {
      "isClustered": true,
      "clusterSize": 4,
      "mainCode": "KANDA-00A12B"
    }
  }
]
```

### 12.5 Profile and Credibility Endpoints

#### `GET /api/profile/me`

Request:

- no body

Response:

```json
{
  "userId": "uuid",
  "name": "string",
  "role": "citizen",
  "credibilityProfile": {
    "currentScore": 78,
    "level": "Colaborador",
    "trend": "up"
  }
}
```

#### `GET /api/profile/me/credibility`

Request:

- query optional:
  - `limit`
  - `offset`

Response:

```json
{
  "profile": {
    "currentScore": 78,
    "level": "Colaborador",
    "trend": "up"
  },
  "events": [
    {
      "id": "event-id",
      "type": "positive",
      "title": "Reportou ocorrência válida",
      "description": "string",
      "impact": 2,
      "createdAt": "2026-06-08T00:00:00Z"
    }
  ],
  "timeline": [
    {
      "label": "2026-06",
      "score": 78
    }
  ]
}
```

#### `GET /api/profile/me/activity`

Request:

- query optional:
  - `limit`
  - `offset`

Response:

```json
{
  "items": [
    {
      "type": "report_created",
      "code": "KANDA-00A12B",
      "createdAt": "2026-06-08T00:00:00Z"
    }
  ],
  "total": 0
}
```

#### `GET /api/profile/me/occurrences`

Request:

- query optional:
  - `status`
  - `limit`
  - `offset`

Response:

```json
{
  "items": [
    { "id": "uuid", "code": "KANDA-00A12B", "status": "Reportado" }
  ],
  "total": 0
}
```

## 13. Mock Requirements for Parallel Development

### Data mocks

- citizen report with image, location, score, and history;
- nearby occurrence list;
- clustered occurrence group;
- duplicate occurrence warning;
- entity lists and entity cards;
- insights summary and time series;
- profile with credibility score;
- credibility events and timeline;
- empty and error states.

### Behavior mocks

- delayed IA analysis;
- repeated confirmation attempt;
- cluster expansion and collapse;
- paginated list responses;
- `404`, `409`, and `422` responses;
- offline fallback;
- map loading state;
- search and filtering state.

## 14. MVP Scope

### Included in the hackathon MVP

- Landing Page;
- Dashboard das Entidades;
- Dashboard Administrativo;
- Insights;
- Mapa Administrativo;
- mobile `Home`;
- mobile `Reportar Ocorrência`;
- mobile `Análise IA`;
- mobile `Confirmar Rótulos`;
- mobile `Sucesso`;
- mobile `Explorar Ocorrências`;
- mobile `Minhas Ocorrências`;
- mobile `Detalhe da Ocorrência`;
- mobile `Perfil`;
- mobile `Credibilidade`;
- occurrence tracking by code on mobile;
- nearby occurrences;
- confirmation of occurrences;
- credibility profile and timeline;
- clustering and duplicate warnings in the UI;
- KANDA Score breakdown in the UI;
- territorial intelligence surfaces.

### Future versions

- advanced collaboration tools for entity teams;
- richer notification center;
- offline-first sync;
- deeper role-based workflows;
- advanced map layers;
- custom dashboards per entity;
- more detailed credibility analytics;
- advanced moderation and dispute flows;
- richer profile history and reputation surfaces.

## 15. Summary of UX Intent

### Citizen side

- mobile is the main journey;
- reporting must be quick;
- tracking must be obvious;
- nearby exploration must feel central;
- confirmation must be easy to understand;
- credibility must be visible and motivating.

### Entity side

- web is the operational workstation;
- dashboards should support fast triage;
- maps should support territorial reasoning;
- insights should support decision-making;
- clusters should reduce noise and reveal patterns.
