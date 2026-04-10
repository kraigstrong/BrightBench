# Current State

## Summary
The monorepo foundation is in good shape and is ready for future agents to continue product work without rebuilding the architecture from scratch.

What is already true:
- npm workspaces are working
- Turbo is configured
- shared design and UI packages exist
- Fraction Finder is running in the monorepo
- Time Tutor is running in the monorepo
- the marketing site scaffold is running and builds successfully

## Validated Workflows

### Expo Product Apps
- local iOS simulator workflow works from the terminal
- local web workflow works
- static web export works

Current standard flow:
1. `npm run dev -w <app>`
2. `npm run ios -w <app>`
3. `npm run web -w <app>`

### Marketing Site
Current standard flow:
1. `npm run dev -w marketing`
2. `npm run typecheck -w marketing`
3. `npm run lint -w marketing`
4. `npm run build -w marketing`

## App Status

### Fraction Finder
Status:
- stable monorepo app

Notes:
- built on the shared Expo stack
- now uses shared app shell, header, card, celebration, action-button, and feature-card primitives
- includes six game modes, including a number-line placement mode with difficulty-based scaffolding
- mode progress now lives on the chooser cards and in settings instead of on a separate progress screen
- keeps game-specific logic and fraction interaction widgets app-local
- not currently the design source of truth

Recent validation:
- `npm run typecheck -w fraction-finder`
- `npm run lint -w fraction-finder`
- `npm test -w fraction-finder -- --runInBand`

### Time Tutor
Status:
- stable monorepo app

Notes:
- design source of truth for the suite
- migrated from the original standalone repo
- intentional differences from the original app are documented in:
  - `apps/time-tutor/MIGRATION_NOTES.md`

### Marketing
Status:
- working scaffold

Notes:
- Next.js App Router
- homepage is now aligned to the BrightBench suite brand line:
  - Small apps. Big learning moments.
- product suite section keeps the outlined app-card visual language
- Time Tutor is presented as the only live app with a direct App Store CTA
- Grammar Guide is no longer presented in the marketing lineup
- local production build already succeeds
- Vercel linking/config is still pending

## Shared Architecture Decisions
- Technical standard for product apps:
  - Expo-managed React Native + Expo Router
- Marketing standard:
  - Next.js App Router
- Visual source of truth:
  - Time Tutor
- Design conflict rule:
  - Time Tutor wins on design
  - Fraction Finder wins on tooling/stack
- Shared code rule:
  - share stable primitives
  - keep gameplay logic app-local until reuse is clearly proven

## Important Intentional Differences
- Some migration changes are deliberate improvements, not regressions
- Example categories:
  - gesture handling on interactive gameplay routes
  - shared celebration copy
  - some challenge start button placement changes
  - some layout stability improvements

For Time Tutor specifics, always read:
- `apps/time-tutor/MIGRATION_NOTES.md`

## Remaining Open Work
- Link and configure Vercel projects for the monorepo
- Add real content/apps for:
  - Letter Bingo
  - Place Value
- Expand shared support/privacy handling if needed
- Choose a future suite-wide domain when ready

## Domain Reality
- The only existing product domain right now is `timetutor.app`
- The repo should not assume a final suite-wide domain yet
- Domain-sensitive values should stay environment-driven

Current env-backed defaults:
- Time Tutor support/privacy links:
  - `EXPO_PUBLIC_SITE_ORIGIN`
  - fallback: `https://timetutor.app`
- Marketing support email:
  - `NEXT_PUBLIC_SUPPORT_EMAIL`
  - fallback: `support@timetutor.app`

## Best Next Steps For A New Agent
1. Read `AGENTS.md`
2. Read `docs/repo-map.md`
3. Read this file
4. Read `docs/design-canon.md`
5. Read the specific app folder you are changing
6. Read `apps/time-tutor/MIGRATION_NOTES.md` before changing Time Tutor behavior
