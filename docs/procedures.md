# Team Procedures

## Daily Development

1. Pull the latest changes.
2. Run `npm install` if dependencies changed.
3. Start with `npm run dev`.
4. Keep changes scoped to the task.
5. Run `npm run lint`, `npm run build`, and `npm test` before handing off.

## Product Review Procedure

Review these screens after UI changes:

1. `/` landing page on desktop and mobile.
2. `/reportar` with empty state and with a selected image.
3. GPS capture and readable place name.
4. `/acompanhar` empty and invalid-code states.
5. `/ocorrencia/:codigo` after creating a sample occurrence.

## Map Review Procedure

When map or location code changes:

1. Confirm Leaflet tiles load.
2. Confirm markers are visible.
3. Confirm reverse geocoding fills a readable location when GPS is allowed.
4. Confirm coordinates remain visible.
5. Confirm map controls do not overlap important content on mobile.

## Release Procedure

1. Run `npm run lint`.
2. Run `npm run build`.
3. Run `npm test`.
4. Review the production build with `npm run preview`.
5. Update documentation if behavior changed.
6. Commit with a clear message.
7. Push to GitHub.

## Incident Procedure

If a critical demo path breaks:

1. Reproduce the issue.
2. Identify the route and component.
3. Check console errors.
4. Fix the smallest responsible surface.
5. Re-run lint/build/tests.
6. Document the issue and resolution in the handoff notes if teammates need to know.
