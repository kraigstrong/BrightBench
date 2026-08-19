# AGENTS.md

## Purpose

BrightBench is a portfolio of independently deployable educational apps with a shared technical foundation and design language. This file is the compact baseline for every coding agent working in the repository.

## Start Here

For routine work, read only:

1. This file.
2. `docs/current.md`.
3. The target app's nested `AGENTS.md`, when one exists.
4. Files directly involved in the change.

Read additional documentation only when the routing section says it is relevant.

## Scope Of A Change

A milestone, roadmap outcome, or historical "phase" may contain multiple work items. Treat the work item, not the milestone, as the unit of execution.

When an objective spans more than one outcome, identify and state the next bounded work item, implement only that item, then stop and return it for review. Do not chain into the next item from the same objective without a new human turn, even when working autonomously.

A work item produces one understandable outcome, can be verified independently, and is reasonable for a human to review as one pull request.

## Repository Map

- `apps/*`: independently deployable products and sites.
- `packages/design`: platform-neutral palette, spacing, radii, typography tokens, and motion.
- `packages/ui`: stable shared React Native primitives; no app-specific gameplay.
- `packages/legal-pages`: configurable privacy, support, and help content.
- `packages/app-config`: shared naming, routing, and release conventions.
- `packages/typescript-config`: shared TypeScript configurations.
- `packages/eslint-config`: shared ESLint configurations.
- `docs/current.md`: active work, portfolio status, and outstanding human checks.
- `docs/decisions`: durable decisions that meet the ADR threshold.
- `.agents/skills`: canonical reusable workflows for agents.

## Technical Standards

- Product apps use Expo-managed React Native, Expo Router, and React Native Web.
- The marketing site uses Next.js App Router.
- Use npm workspaces and Turbo.
- Apps remain independently deployable.
- Time Tutor is the visual source of truth.
- Fraction Finder is the tooling and Expo-workflow reference.
- Share stable primitives; keep gameplay and curriculum logic app-local until reuse is proven.

## Package Boundaries

- Keep `@education/design` platform-neutral whenever possible.
- Put React Native-only typography and shadow helpers in `@education/design/native`.
- Keep `@education/ui` limited to stable primitives with multiple real consumers.
- Do not move scoring, round generation, or curriculum rules into shared packages prematurely.
- Keep product identity, assets, store metadata, bundle IDs, and deployment configuration app-local.
- Shared-package changes must verify every affected consumer.

## Safety Rules

- Do not modify `/Users/kraig/code/time-tutor`; it is read-only reference material.
- Do not copy generated native artifacts or machine-local configuration into templates.
- Preserve unrelated work in a dirty worktree.
- Do not reset, discard, or overwrite user changes without explicit approval.
- Do not claim a check passed unless it ran successfully in the current workstream.
- Keep domain-sensitive values environment-driven.
- Do not hardcode a speculative portfolio-wide domain.

## Canonical Commands

Run the standard repository quality gate:

```sh
npm run check
```

Run the full CI-equivalent gate, including affected Expo exports and the
production dependency audit:

```sh
npm run check:ci
```

Verify only changed workspaces and their consumers:

```sh
npm run check:affected -- --base origin/main
```

Verify one app:

```sh
npm run verify -w <app>
```

Run the Time Tutor release preflight:

```sh
npm run verify:release -w time-tutor
```

Focused Expo development:

```sh
npm run dev -w <app>
npm run ios -w <app>
npm run web -w <app>
```

## Verification By Risk

Assign the smallest honest risk level before implementation.

### Low Risk

Examples: copy, isolated styling, documentation, or a simple leaf component.

Required evidence:

- Target workspace typecheck.
- Target workspace lint (warnings fail by default).
- Focused tests when behavior is touched.

### Medium Risk

Examples: gameplay, persistence, navigation, shared UI, or multi-file product behavior.

Required evidence:

- `verify` for every affected workspace.
- Full tests for the target app.
- Simulator or web smoke check for the changed flow.
- Consumer checks for shared-package changes.

### High Risk

Examples: native dependencies, permissions, privacy, analytics, release configuration, or shared-state migration.

Required evidence:

- Full repository CI-equivalent checks via `npm run check:ci`.
- Independent review of the actual diff.
- Physical-device or production validation where relevant.
- Explicit record of remaining human release checks.

Use `.agents/skills/verify-change` for the detailed workflow.

## Human Approval Boundaries

Ask before:

- Changing pricing, subscriptions, or monetization.
- Changing curriculum meaning, scoring thresholds, or reward rules.
- Resetting, dropping, or incompatibly migrating persisted progress.
- Adding analytics, tracking, advertising, accounts, or external data collection.
- Changing child-privacy disclosures, legal copy, or App Store privacy answers.
- Adding native permissions or capabilities.
- Shipping, submitting, promoting, or rolling back a production release.
- Making a product-feel decision that cannot be validated mechanically.

Routine implementation inside an approved objective does not require repeated confirmation.

## Review Priorities

Review the actual branch diff, not only the implementation summary. Prioritize:

1. Behavioral regressions.
2. Persistence compatibility.
3. Shared-package blast radius.
4. Invalid route, mode, and state combinations.
5. Accessibility and child privacy.
6. Native and release metadata.
7. Missing tests or false validation claims.

Independent review is required at High risk and valuable at your discretion for consequential Medium-risk changes (shared-package blast radius, persistence). Skip it for Low risk. When used, the reviewer receives the objective, repository guidance, and complete diff.

## Documentation Routing

- Active status or portfolio priority: update `docs/current.md`. Keep each row's next action scoped to one bounded work item, not a phase or milestone.
- Package boundaries or system shape: read and update `docs/architecture.md`.
- Shared visual decisions: read and update `docs/design-canon.md`.
- Deployment or release process: read and update `docs/release-playbook.md`.
- Long-lived, difficult-to-reverse decisions: add an ADR under `docs/decisions`.
- App-specific invariants: update the app's nested `AGENTS.md` only when they genuinely differ.

Do not create phase-completion reports, PRD traceability tables, or threat-model updates for ordinary UI and gameplay work. Git history and pull requests are the durable change record.

## Completion

Before handing off a change:

- Inspect the complete diff.
- Confirm no unrelated files are included.
- Run the checks required by the assigned risk.
- Record manual checks still needed.
- Update only the documentation whose source of truth changed.
