# App Template

This repo now has two app shapes:
- Expo product apps
- one Next.js marketing site

Use the right template for the job instead of forcing every workspace into the same mold.

## Standard Stack For Product Apps
- Expo-managed React Native
- Expo Router
- React Native Web
- Expo dev client for iOS simulator development

## Standard Stack For Marketing
- Next.js App Router
- shared tokens from `@education/design`
- content/config helpers from `@education/legal-pages` and `@education/app-config`

## Workflow Standard
- Default workflow: CLI-first
- Native fallback tool: Xcode
- Goal: make switching between apps fast and consistent from the terminal

## Standard Scripts For Expo Product Apps
- `dev`
- `ios`
- `ios:device`
- `web`
- `lint`
- `test`
- `typecheck`
- `web:export`

## Standard Scripts For Marketing
- `dev`
- `build`
- `lint`
- `typecheck`

## Standard Workflow For Expo Product Apps
1. Run `npm run dev -w <app>`
2. Run `npm run ios -w <app>`
3. Validate on web with `npm run web -w <app>`

Use Xcode when you need:
- signing or capability changes
- native build debugging
- simulator or device management
- deeper inspection of generated iOS project settings

## Standard Workflow For Marketing
1. Run `npm run dev -w marketing`
2. Run `npm run typecheck -w marketing`
3. Run `npm run lint -w marketing`
4. Run `npm run build -w marketing`

## App Ownership
Each app owns:
- app name
- bundle identifier
- App Store metadata
- assets and app icon
- EAS project configuration
- Vercel project configuration

## Shared Package Usage
Each app should import from:
- `@education/design`
- `@education/design/native` for React Native-specific typography and shadow helpers
- `@education/ui`
- `@education/legal-pages`
- `@education/app-config`

Gameplay and curriculum logic should remain app-local unless patterns clearly repeat across products.

## Challenge Standard
When a product app adds a timed or star-based challenge mode:
- default to the shared challenge primitives from `@education/ui`
  - `TieredChallengeLauncher`
  - challenge countdown overlay
  - challenge timer bar
  - challenge results overlay and reveal card
  - reward stars and mastery crown badge
- keep round generation, answer checking, scoring thresholds, and progression rules app-local
- do not invent a different challenge flow unless the user explicitly confirms that deviation

## Local Structure For Expo Product Apps
- `src/app`
- `src/features`
- `src/state`
- `src/components`
- `src/lib`

## Local Structure For Marketing
- `app`
- `src/lib`
- app-local styles only where needed

## Important Rule
Do not build a new app by copying an existing app blindly. Start from the common template and pull in only the behavior the app actually needs.

## Current Reference Apps
- Expo reference: `apps/fraction-finder`
- Migration-quality Expo reference: `apps/time-tutor`
- Next.js reference: `apps/marketing`

## Package Boundary Rules
- `@education/design` should stay platform-neutral whenever possible
- `@education/design/native` is the place for React Native-specific helpers
- `@education/ui` should hold stable shared primitives, not app-specific gameplay widgets
- `@education/legal-pages` should hold reusable support/privacy content helpers, not hardcoded brand-specific copy for every app
- machine-local and generated native artifacts must not be copied into new app templates

## New App Checklist
For Expo product apps:
- `src/app`
- `src/features`
- `src/state`
- `src/components`
- `src/lib`
  - add `app.json`
  - add `eas.json`
  - add Expo scripts
  - add `tsconfig.json` extending `@education/typescript-config/expo-app`
  - add `eslint.config.js` using `@education/eslint-config/expo`

For marketing-like web sites:
  - add `next.config.ts`
  - add `app/`
  - add `tsconfig.json` extending `@education/typescript-config/next-app`
  - add `eslint.config.js` using `@education/eslint-config/next`
