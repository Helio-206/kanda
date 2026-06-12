# Mobile Integration

## Where the mobile app lives

The MVP mobile app lives in [`kanda-mobile/`](../kanda-mobile) inside this repository.

It remains intentionally separate from the Web app in `Frontend/` so we do not mix React Native and React Web code, but both now share one Git repository.

## What it uses

- framework: React Native + Expo
- routing: Expo Router
- state: Zustand
- local persistence: AsyncStorage
- location: Expo Location
- maps: React Native Maps

## How to run it

```bash
cd kanda-mobile
npm install
npm run start
```

Useful Expo commands:

```bash
npm run android
npm run ios
npm run web
```

## Existing screens

- Login
- Home
- Report
- Map
- Profile
- Occurrence detail

## Existing services and helpers

- AI report analysis service
- AI vision service
- location service
- location humanizer service
- occurrence store
- app store
- current location hook

## Visual alignment with the Web

The mobile app keeps its own React Native-safe implementation, but now shares the same KANDA tone:

- brand color close to the Web palette;
- neutral background and surfaces;
- strong text hierarchy;
- rounded cards and buttons;
- institutional language instead of generic consumer-app copy;
- status, priority, and map surfaces styled like part of the same product family.

The shared design source now lives in [`kanda-mobile/src/theme/tokens.ts`](../kanda-mobile/src/theme/tokens.ts), and [`kanda-mobile/src/utils/theme.ts`](../kanda-mobile/src/utils/theme.ts) keeps the existing screen imports working.

## What was preserved

- existing Web code stayed untouched except for the separate integration docs and routing scope already aligned earlier;
- mobile logic stays local and isolated;
- no backend calls were introduced;
- no complex mocks were added;
- no React Native code was moved into the Web app.

## What still exists on the mobile side

The MVP already covers the citizen-facing core flow, but it still needs polish before the final hackathon round:

- visual alignment pass across screens;
- clearer credibility presentation;
- clearer community confirmation states;
- more polished empty states and loading states;
- final mobile-specific navigation polish.

## 24-hour next steps

1. Finish visual polish on the core mobile screens.
2. Keep the theme aligned with the official Web identity.
3. Preserve local-only services until the backend is ready.
4. Avoid moving code across Web and Mobile boundaries.
5. Validate the app starts cleanly in Expo.
