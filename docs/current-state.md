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
- `Find the Fraction` now routes through a Practice vs 1-Minute Challenge chooser modeled after Time Tutor
- `Find the Fraction` challenge progress is now tracked separately from practice progress
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
- challenge cards now show persisted Easy/Medium/Hard star progression with crown mastery state
- challenge launch now uses a dedicated Easy/Medium/Hard popup that maps to `15-minute`, `5-minute`, and `1-minute`
- practice mode now uses a dedicated interval chooser and passes the selected interval through the route instead of relying on the settings page
- Explore Time now uses the same interval chooser pattern and receives its interval through the route instead of relying on the settings page
- challenge mode is disabled on web and shows the official App Store badge button
- the settings screen no longer includes a practice interval control
- challenge runs now start with an automatic 3-2-1-GO countdown overlay, use a simple countdown bar, and end with a centered animated end-of-round star reveal
- reveal can be skipped with a tap and includes `New Best` plus mastery unlock treatment
- the original standalone app remains a read-only visual reference, but migration-specific notes are no longer maintained as a separate document

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
- Some monorepo changes are deliberate improvements, not regressions
- Example categories:
  - gesture handling on interactive gameplay routes
  - shared celebration copy
  - challenge start and results layout refinements
  - layout stability improvements

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
6. Use the original `/Users/kraig/code/time-tutor` app only as read-only reference material when a Time Tutor visual or behavior comparison is genuinely needed
