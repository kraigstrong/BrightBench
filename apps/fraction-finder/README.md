# Fraction Finder

Fraction Finder is the fraction-learning Expo app inside the education monorepo.

## What it uses
- Expo-managed React Native with Expo Router
- shared tokens from `@education/design`
- shared layout and UI primitives from `@education/ui`
- app-local gameplay logic in `src/features/game`

## Local workflow
From the monorepo root:

```bash
npm run dev -w fraction-finder
npm run ios -w fraction-finder
npm run web -w fraction-finder
```

## Quality checks
From the monorepo root:

```bash
npm run typecheck -w fraction-finder
npm run lint -w fraction-finder
npm test -w fraction-finder -- --runInBand
```

## Design notes
- Time Tutor is the design source of truth for suite-level visual decisions.
- Fraction Finder keeps its mode colors, prompts, and gameplay widgets local.
- Shared screen chrome should come from `@education/ui` before adding app-specific wrappers.
