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

Should not contain:
- per-app gameplay widgets
- tightly coupled screens

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
- assets and iconography
- bundle IDs and EAS config
- Vercel project linkage

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

## Workflow Model
- default workflow is CLI-first
- Xcode is the native fallback/debugging tool
- typical Expo flow:
  1. `npm run dev -w <app>`
  2. `npm run ios -w <app>`

## Architecture Guardrails
- Do not modify `/Users/kraig/code/time-tutor`
- Do not over-extract shared code too early
- Do not copy generated native artifacts into new app templates
- Prefer evolving shared packages only after at least one real second consumer exists
