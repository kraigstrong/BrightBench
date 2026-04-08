# Repo Map

## Top Level
- `apps/`
  - deployable apps and sites
- `packages/`
  - shared libraries and config packages
- `docs/`
  - architecture, process, and release guidance
- `AGENTS.md`
  - first-stop operating guide for future agents
- `README.md`
  - human-facing repo overview

## Current Apps

### `apps/fraction-finder`
- Expo-managed React Native app
- Expo Router + React Native Web
- Uses shared `@education/design` and `@education/ui`
- Already validated on:
  - iOS simulator
  - local web
  - static web export

### `apps/time-tutor`
- Expo-managed React Native app
- Port of the original `/Users/kraig/code/time-tutor`
- Uses shared `@education/design` and `@education/ui`
- Core flows are implemented:
  - home
  - mode chooser
  - settings
  - explore time
  - practice modes
  - challenge modes
- Intentional migration differences are documented in:
  - `apps/time-tutor/MIGRATION_NOTES.md`

### `apps/marketing`
- Next.js App Router site
- Uses shared `@education/design`
- Current pages:
  - `/`
  - `/support`
  - `/privacy`
  - `/products/[slug]`
- Local build is validated
- Vercel project linking is still pending

### `apps/grammar-guide`
- Placeholder only

### `apps/letter-bingo`
- Placeholder only

### `apps/place-value`
- Placeholder only

## Shared Packages

### `packages/design`
- shared palette
- spacing
- radii
- motion
- platform-neutral tokens
- exports React Native-specific helpers from `@education/design/native`

### `packages/ui`
- shared card shell
- celebration overlay
- feature card
- header icon button
- app shell
- header bar
- action/selectable button primitive
- other stable primitives
- should not contain app-specific gameplay widgets

### `packages/legal-pages`
- support/privacy content helpers
- baseline text builders
- should stay generic and configurable

### `packages/app-config`
- shared naming helpers
- release/deployment conventions
- command helpers

### `packages/typescript-config`
- shared TS config for:
  - Expo apps
  - Next.js apps

### `packages/eslint-config`
- shared ESLint config for:
  - Expo apps
  - Next.js apps

## Key Docs
- `docs/current-state.md`
  - what is finished, validated, and next
- `docs/design-canon.md`
  - visual system rules
- `docs/app-template.md`
  - how to create a new app/site correctly
- `docs/release-playbook.md`
  - deployment and release conventions
- `docs/implementation-checklist.md`
  - historical implementation plan and completion state

## Read Boundaries
- Do not edit `/Users/kraig/code/time-tutor`
- Treat that repo as read-only reference material
- Make all changes inside `/Users/kraig/code/BrightBench`
