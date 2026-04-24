# Current State

## Summary
The monorepo foundation is in good shape and is ready for future agents to continue product work without rebuilding the architecture from scratch.

What is already true:
- npm workspaces are working
- Turbo is configured
- shared design and UI packages exist
- Fraction Finder is running in the monorepo
- Time Tutor is running in the monorepo
- Letter Learner is running in the monorepo
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

Notes:
- includes `robots.txt`, `sitemap.xml`, and Time Tutor–focused learn routes for discovery (see `apps/marketing/README.md` for Search Console checklist)
- set `NEXT_PUBLIC_SITE_ORIGIN` in production so canonical URLs and social previews resolve correctly

## App Status

### Fraction Finder
Status:
- stable monorepo app

Notes:
- built on the shared Expo stack
- now uses shared app shell, header, card, celebration, action-button, and feature-card primitives
- now uses the shared progress footer for mode/session progress summaries
- includes five live game modes, including a number-line placement mode with difficulty-based scaffolding
- the compare-fractions mode is temporarily removed from the active lineup
- mode colors were rebalanced to fit the smaller five-mode set more cleanly
- `Find the Fraction` now routes through a Practice vs 1-Minute Challenge chooser modeled after Time Tutor
- the `Find the Fraction` chooser now mirrors Time Tutor's card layout, keeps the practice card stat-free, and opens challenge difficulty selection through a transparent modal launcher route
- `Find the Fraction` challenge flow now follows the Time Tutor reward standard:
  - shared countdown overlay
  - shared timer bar
  - shared challenge results overlay and star reveal
  - mastery crown unlock treatment
- `Find the Fraction` challenge progress now uses Time Tutor-style per-difficulty star tracking instead of local score summary stats
- mode progress now lives on the chooser cards and in settings instead of on a separate progress screen
- keeps game-specific logic and fraction interaction widgets app-local
- not currently the design source of truth

Recent validation:
- `npm run typecheck -w fraction-finder`
- `npm run lint -w fraction-finder`
- `npm test -w fraction-finder -- --runInBand`

### Letter Learner
Status:
- new monorepo Expo app

Notes:
- built on the shared Expo stack
- uses the shared app shell, header, card, feature-card, tiered challenge launcher, timer, countdown, and results primitives
- includes four live modes:
  - Letter Match
  - Case Pair
  - Tap the Letter
  - Sound Match
- each mode supports practice and a 1-minute challenge with Easy/Medium/Hard star progress
- Sound Match uses static audio assets generated with `node-edge-tts`
- Hard Sound Match includes digraphs and accepts multiple valid letters for ambiguous sounds
- gameplay and curriculum logic remain app-local

Recent validation:
- `npm run generate-audio -w letter-learner`
- `npm run typecheck -w letter-learner`
- `npm run lint -w letter-learner`
- `npm test -w letter-learner -- --runInBand`

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
- the Time Tutor web export now serves `/support` and `/privacy` directly so in-app help links work on `timetutor.app`
- challenge runs now start with an automatic 3-2-1-GO countdown overlay, use a simple countdown bar, and end with a centered animated end-of-round star reveal
- reveal can be skipped with a tap and includes `New Best` plus mastery unlock treatment
- reward flow UI now shares the suite-standard results card/overlay, tiered challenge launcher, star group, crown badge, and progress footer from `@education/ui`
- the original standalone app remains a read-only visual reference, but migration-specific notes are no longer maintained as a separate document

### Marketing
Status:
- working scaffold

Notes:
- Next.js App Router
- homepage is now a BrightBench brand hub instead of a catch-all ranking page
- Time Tutor now has a dedicated authority page at `/products/time-tutor`
- marketing now includes supporting intent pages for:
  - `/learn/analog-clock-practice`
  - `/learn/elapsed-time-practice`
- Time Tutor discovery flow is now intentionally structured:
  - homepage → app page
  - app page → related learning pages
  - learning pages → main app page
- placeholder product pages remain lightweight roadmap markers and should not be treated as finished SEO landing pages
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
