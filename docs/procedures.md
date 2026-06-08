# Team Procedures

## Daily Development

1. Pull the latest changes.
2. Enter `Frontend/`.
3. Run `npm install` if dependencies changed.
4. Start with `npm run dev`.
5. Keep changes scoped to the task.
6. Run `npm run lint`, `npm run build`, and `npm test` before handing off.

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

1. Enter `Frontend/`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Run `npm test`.
5. Review the production build with `npm run preview`.
6. Update documentation if behavior changed.
7. Commit with a clear message.
8. Push to GitHub.

## Incident Procedure

If a critical demo path breaks:

1. Reproduce the issue.
2. Identify the route and component.
3. Check console errors.
4. Fix the smallest responsible surface.
5. Re-run lint/build/tests.
6. Document the issue and resolution in the handoff notes if teammates need to know.
