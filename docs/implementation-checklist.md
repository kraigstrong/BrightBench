# Implementation Checklist

## Phase 1: Monorepo Foundation
- [x] Create monorepo root
- [x] Create `apps/`, `packages/`, and `docs/`
- [x] Configure workspace package management
- [x] Add `turbo.json`
- [x] Add root `package.json`
- [x] Add root `tsconfig.base.json`
- [x] Add root `AGENTS.md`
- [x] Add root `README.md`

## Phase 2: Repo Guidance
- [x] Add `docs/design-canon.md`
- [x] Add `docs/app-template.md`
- [x] Add `docs/release-playbook.md`
- [x] Add this checklist

## Phase 3: Shared Packages
- [x] Create `packages/design/package.json`
- [x] Create `packages/design/src/index.ts`
- [x] Seed shared tokens from Time Tutor references
- [x] Create `packages/ui/package.json`
- [x] Create `packages/ui/src/index.ts`
- [x] Extract first shared UI primitives
- [x] Create `packages/legal-pages/package.json`
- [x] Create `packages/legal-pages/src/index.ts`
- [x] Create `packages/app-config/package.json`
- [x] Create `packages/app-config/src/index.ts`
- [x] Create shared TypeScript and ESLint config packages

## Phase 4: Canonical App Template
- [x] Scaffold one Expo Router app inside `apps/`
- [x] Fix local Xcode CLI selection so `xcodebuild` and `simctl` work from the terminal
- [x] Confirm iOS simulator workflow with hot reload
- [x] Confirm local web workflow
- [x] Confirm static web export
- [x] Wire app to shared design package
- [x] Wire app to shared UI package
- [x] Document CLI-first daily workflow with Xcode as the native fallback

## Phase 5: Foundation Hardening
- [x] Make every app consume the shared TypeScript config package
- [x] Make every app consume the shared ESLint config package
- [x] Define stable public entrypoints for shared packages
- [x] Split platform-neutral design tokens from React Native-specific helpers
- [x] Document package-boundary rules for `packages/ui` vs app-local code
- [x] Add a checklist item or template rule to prevent copied machine-local and generated native artifacts

## Phase 6: Product Migration
- [x] Move Fraction Finder into `apps/fraction-finder`
- [x] Replace local tokens with shared design package
- [x] Replace shared UI patterns with shared UI package
- [x] Align Fraction Finder screen chrome with shared app shell, header, and action primitives
- [x] Add a number-line placement mode to Fraction Finder with difficulty-based scaffolding
- [x] Move Fraction Finder progress summaries onto mode cards and settings
- [x] Add a Practice vs Challenge pilot to `Find the Fraction`
- [x] Create new Expo-based `apps/time-tutor`
- [x] Port Time Tutor behavior without touching the original repo

## Phase 7: Marketing Site
- [x] Scaffold `apps/marketing` with Next.js App Router
- [x] Connect it to the platform-neutral shared design tokens
- [x] Add product landing pages
- [x] Add shared privacy/support pages
- [x] Refresh the homepage around the BrightBench suite brand and live Time Tutor CTA
- [ ] Configure Vercel deployment

## Phase 8: Release Readiness
- [x] Standardize bundle ID naming
- [x] Standardize EAS profile naming
- [x] Standardize Vercel project naming
- [x] Document env var strategy
- [x] Document release flow per app
