# BrightBench

BrightBench is the shared home for a suite of focused educational apps built
around the concepts that are hardest to teach and hardest to make click.

## Product Strategy
- Technical stack: Expo-managed React Native + Expo Router
- Visual source of truth: Time Tutor
- Marketing site: Next.js App Router

## Current Apps
- Fraction Finder
- Time Tutor
- Marketing site

## Planned Apps
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
  - Includes six playable modes, including the new number-line placement mode
  - `Find the Fraction` now has a Time Tutor-style Practice vs 1-Minute Challenge split
  - Progress now shows on mode cards and in settings instead of a dedicated progress screen
  - Validated on iOS simulator, web dev, and static web export
  - Current local checks pass:
    `npm run typecheck -w fraction-finder`, `npm run lint -w fraction-finder`, `npm test -w fraction-finder -- --runInBand`
- `apps/time-tutor`
  - Healthy Expo app in the monorepo
  - Core gameplay and settings are established in the monorepo
  - Challenge cards now show persisted Easy/Medium/Hard star progression with crown mastery state
  - Challenge launch now uses a dedicated difficulty popup before the timed run, followed by a separate in-screen Start step, a countdown bar, and a skippable animated end-of-run reveal
  - Uses the original standalone app as read-only visual reference material, but no longer maintains a separate migration-notes file
- `apps/marketing`
  - Next.js App Router site is working
  - Homepage is positioned around the BrightBench suite brand and product philosophy
  - Time Tutor App Store CTA is embedded directly in the suite card
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
