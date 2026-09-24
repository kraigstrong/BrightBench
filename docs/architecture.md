# Architecture

## Monorepo Shape
This repo is organized around:
- independently deployable apps in `apps/`
- stable shared packages in `packages/`
- process and system docs in `docs/`

The monorepo is intentionally not a “shared everything” repo. Shared code should reduce duplication without forcing all apps into the same release cycle.

## Technical Standards

### Product Apps
Use:
- Expo-managed React Native
- Expo Router
- React Native Web

Why:
- one stack for iOS and web
- strong simulator-first developer experience
- lower native maintenance overhead for small educational products

### Marketing Site
Use:
- Next.js App Router

Why:
- better fit for marketing pages and future SEO work
- straightforward Vercel deployment model
- clean separation from app-product concerns

## Design Standards
- Time Tutor is the visual source of truth
- Fraction Finder is the tooling/stack reference that helped establish the monorepo app shape
- if Time Tutor and Fraction Finder disagree:
  - use Time Tutor for design
  - use Fraction Finder for technical workflow decisions

## Shared Package Boundaries

### `@education/design`
Should contain:
- platform-neutral tokens
- palette
- spacing
- radii
- motion

May also expose:
- React Native-specific helpers through `@education/design/native`

Should not contain:
- app-specific gameplay styling logic
- product-specific copy

### `@education/ui`
Should contain:
- stable shared primitives
- card shells
- celebration overlays
- reusable header/button building blocks
- suite-standard reward and progression surfaces when the interaction model is intentionally shared across apps
  - reward stars and mastery crown badge
  - progress footer
  - challenge countdown overlay
  - challenge timer bar
  - challenge results card and overlay
  - tiered challenge launcher

Should not contain:
- per-app gameplay widgets
- tightly coupled screens

### `@education/audio`
Should contain:
- the shared reward sound files and their credits
- generic playback helpers:
  - audio-mode configuration
  - lazy single players keyed by sound
  - a round-robin pool so overlapping plays ring together
  - a prewarmed synchronous "instant sound" path for latency-sensitive presses

Should not contain:
- which sound means "correct", "wrong", or "round complete"
- reward rules such as when a summary sound replaces per-star dings
- haptics
- a sound-effects settings gate

The split is deliberate: the package knows how to make a noise, the app decides
what the noise means. Function names stay generic verbs — `playSound`,
`playPooledSound`, `playInstantSound` — with no gameplay vocabulary.

Sound files belong here rather than in an app because reward audio is suite
identity, not product identity. Product identity — icons, splash screens, store
metadata — stays app-local. Curriculum audio (letter names, phoneme
recordings) is content, not reward feedback, and also stays app-local.

`expo-audio` is a peer dependency. The package does not pull a native module
into an app that does not already have one; adding audio to an app without
`expo-audio` is a native-dependency change in that app.

### `@education/legal-pages`
Should contain:
- generic support/privacy content builders
- configurable page content helpers

Should not contain:
- hardcoded final legal copy for every app forever

### `@education/app-config`
Should contain:
- shared naming conventions
- command helpers
- release/deployment conventions

## App Ownership Rules
Each app should own:
- its routes/screens
- gameplay logic
- content/curriculum rules
- App Store identity
- assets and iconography, except the shared reward sounds in `@education/audio`
- bundle IDs and EAS config
- Vercel project linkage

Challenge-specific rule:
- future challenge modes should default to the shared challenge primitives in `@education/ui`
  - tiered challenge launcher
  - countdown overlay
  - timer bar
  - results overlay and star reveal
  - mastery crown treatment
- challenge orchestration and scoring rules should stay app-local unless reuse is clearly proven
- do not introduce an alternate challenge UX pattern without explicit confirmation from the user

## Deployment Model

### Web
- one Vercel project per app/site
- one Root Directory per project
- no “deploy the entire repo as one site” model

### iOS
- one EAS project per app
- one App Store listing per app
- shared packages must not force synchronized releases

## Environment Strategy
- domain-sensitive values must be environment-driven
- do not hardcode speculative future suite-wide domains
- current product-specific defaults are acceptable as temporary fallbacks

## Architecture Guardrails
- Do not modify `/Users/kraig/code/time-tutor`
- Do not over-extract shared code too early
- Do not copy generated native artifacts into new app templates
- Prefer evolving shared packages only after at least one real second consumer exists
