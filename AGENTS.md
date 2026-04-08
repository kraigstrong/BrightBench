# AGENTS.md

## Purpose
This monorepo contains multiple educational apps that share one technical foundation and one design language.

## Read In This Order
1. This file
2. `docs/repo-map.md`
3. `docs/current-state.md`
4. `docs/architecture.md`
5. `docs/design-canon.md`
6. `docs/app-template.md`
7. `docs/release-playbook.md`

## Source Of Truth
- Technical stack standard: Expo-managed React Native + Expo Router for app products
- Visual/design standard: Time Tutor design language
- Marketing site standard: Next.js App Router
- Deployment standard:
  - Expo apps deploy individually to the App Store via EAS
  - Web properties deploy individually to Vercel

## Safety Rules
- Do not modify `/Users/kraig/code/time-tutor`
- Treat `/Users/kraig/code/time-tutor` as read-only reference material
- Copy or adapt code only into this monorepo

## Repo Layout
- `apps/*`: product apps and sites
- `packages/design`: tokens, palette, typography, spacing, motion
- `packages/ui`: shared UI primitives and reusable visual components
- `packages/legal-pages`: privacy, support, and help content plus shells
- `packages/app-config`: shared app config helpers and conventions
- `docs/repo-map.md`: current folder structure and what each area is for
- `docs/current-state.md`: what is already built, validated, and intentionally different
- `docs/architecture.md`: why the repo is shaped this way and how package boundaries work
- `docs/design-canon.md`: visual source of truth
- `docs/app-template.md`: new app structure and required scripts
- `docs/release-playbook.md`: deploy and release instructions

## Current Reality
- `apps/fraction-finder` is a working Expo app in the monorepo
- `apps/time-tutor` is a working Expo app in the monorepo
- `apps/marketing` is a working Next.js App Router site scaffold
- `apps/grammar-guide`, `apps/letter-bingo`, and `apps/place-value` are still placeholders
- `apps/time-tutor/MIGRATION_NOTES.md` documents intentional differences from the original app

## Architectural Rules
- Time Tutor wins when design and visual patterns conflict
- Fraction Finder wins when tooling and stack decisions conflict
- Share stable primitives, not premature abstractions
- Keep gameplay logic app-local unless reuse is clearly proven
- Apps must remain independently deployable

## Developer Workflow
- Use `npm` workspaces
- Use Turbo for repo task orchestration
- Run one app at a time during focused work
- Preferred daily workflow: CLI-first
- Default Expo workflow:
  1. `npm run dev -w <app>`
  2. `npm run ios -w <app>`
- Use Xcode as the native fallback tool for:
  - signing and capabilities
  - simulator/device management
  - native build debugging
  - inspecting generated iOS project settings
- Web validation should be available locally for each app
- Next.js marketing workflow:
  1. `npm run dev -w marketing`
  2. `npm run build -w marketing`

## Token Efficiency
Before exploring code:
1. Read this file
2. Read `docs/repo-map.md`
3. Read `docs/current-state.md`
4. Read `docs/architecture.md`
5. Read only the target app and directly related packages
6. Avoid scanning the whole monorepo unless the task is architectural

## Shared Design Guidance
Prefer patterns derived from Time Tutor:
- card feel
- spacing density
- header composition
- celebration and confetti style
- settings controls
- result banners
- calm, polished, child-friendly UI tone

## Package Boundary Rules
- Keep `@education/design` platform-neutral whenever possible
- Put React Native-specific typography and shadow helpers in `@education/design/native`
- Keep `@education/ui` focused on stable shared primitives
- Keep app-specific gameplay widgets inside the app until reuse is clearly proven
- Do not copy machine-local or generated native artifacts into new app templates

## When Adding A New App
- Start from the app template
- Use shared design and UI packages first
- Keep app identity, content, and store metadata local to the app

## When Updating Docs
- Keep `README.md`, `docs/current-state.md`, and `docs/implementation-checklist.md` in sync
- If an intentional design or behavior difference is introduced during a migration, document it near the app, not only in chat history

## Documentation Maintenance Rule
When implementing a larger change, future agents should update the relevant docs in the same workstream before considering the task complete.

Examples:
- architecture or package-boundary changes
  - update `docs/architecture.md`
  - update `docs/repo-map.md` if folder roles changed
- app status, migration progress, or validated workflow changes
  - update `docs/current-state.md`
  - update `docs/implementation-checklist.md`
- design-source-of-truth or shared UI decisions
  - update `docs/design-canon.md`
- app scaffolding or workflow convention changes
  - update `docs/app-template.md`
  - update `README.md` if quick-start guidance changed
- deployment, env var, naming, or release process changes
  - update `docs/release-playbook.md`
- intentional app-specific migration differences
  - update the app-local note such as `apps/time-tutor/MIGRATION_NOTES.md`

Do not leave major structural or workflow changes documented only in chat history.
