# Product Phases

## Phase 0 — Prototype Hardening

Goal: keep the prototype stable, credible, and easy to present.

Scope:

- landing page;
- occurrence creation;
- GPS capture and reverse geocoding;
- real map rendering;
- occurrence scoring;
- tracking by code;
- local persistence.

Exit criteria:

- `npm run lint` passes;
- `npm run build` passes;
- desktop and mobile flows are visually reviewed;
- no broken route or missing map tile in the core flow.

## Phase 1 — Team Pilot

Goal: test the workflow with a small operational team.

Scope:

- backend API;
- database schema;
- user roles;
- status audit trail;
- notification proof of concept;
- exportable records.

Exit criteria:

- occurrences persist outside browser storage;
- records can be searched across users;
- status changes are auditable;
- pilot team can review and resolve occurrences.

## Phase 2 — Operational Product

Goal: make KANDA usable as a paid operational system.

Scope:

- organization accounts;
- permissions;
- service team assignment;
- dashboards based on real data;
- SLA and priority rules;
- reporting and exports.

Exit criteria:

- customer can onboard without engineering support;
- service teams can own workflows;
- data can be filtered by location, status, priority, and date.

## Phase 3 — Scale and Integrations

Goal: connect KANDA to existing tools and support larger deployments.

Scope:

- SMS/WhatsApp/email notifications;
- GIS integrations;
- ticketing integrations;
- mobile-first field workflows;
- analytics and forecasting.

Exit criteria:

- integrations are documented;
- operational metrics are reliable;
- map and geospatial queries perform at production scale.
