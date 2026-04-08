# BrightBench

BrightBench is the shared home for a suite of educational products.

## Product Strategy
- Technical stack: Expo-managed React Native + Expo Router
- Visual source of truth: Time Tutor
- Marketing site: Next.js App Router

## Current Apps
- Fraction Finder
- Time Tutor
- Marketing site

## Planned Apps
- Grammar Guide
- Letter Bingo
- Place Value

## Core Goals
- Monorepo for the BrightBench app suite
- Shared design language and reusable UI
- Independent App Store releases
- Vercel-friendly web deployment
- Strong iOS simulator hot-reload workflow

## Important Safety Rule
`/Users/kraig/code/time-tutor` is read-only during migration while it is in App Store review.

## Read First
- `AGENTS.md`
- `docs/repo-map.md`
- `docs/current-state.md`
- `docs/architecture.md`
- `docs/design-canon.md`
- `docs/app-template.md`
- `docs/release-playbook.md`

## Quick Start
- Fraction Finder iOS:
  - `npm run dev -w fraction-finder`
  - `npm run ios -w fraction-finder`
- Time Tutor iOS:
  - `npm run dev -w time-tutor`
  - `npm run ios -w time-tutor`
- Marketing site:
  - `npm run dev -w marketing`

## Current Status
- `apps/fraction-finder`
  - Healthy Expo app in the monorepo
  - Uses shared app shell, header, card, celebration, and action primitives
  - Validated on iOS simulator, web dev, and static web export
  - Current local checks pass:
    `npm run typecheck -w fraction-finder`, `npm run lint -w fraction-finder`, `npm test -w fraction-finder -- --runInBand`
- `apps/time-tutor`
  - Healthy Expo app in the monorepo
  - Core gameplay and settings are ported
  - Contains intentional migration differences documented in `apps/time-tutor/MIGRATION_NOTES.md`
- `apps/marketing`
  - Next.js App Router site scaffold is working
  - Local build is validated
  - Vercel project linking is still the main remaining deployment task

## Start Here If You Are An Agent
- Read `AGENTS.md`
- Then read `docs/repo-map.md`
- Then read `docs/current-state.md`

## Workspace Tooling
- Package manager: npm workspaces
- Task runner: Turbo

## Recommended Dev Workflow
- Default: CLI-first
- Start Metro: `npm run dev -w <app>`
- Launch iOS: `npm run ios -w <app>`
- Use Xcode when you need native debugging, simulator management, or signing changes
