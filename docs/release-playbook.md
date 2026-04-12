# Release Playbook

## Web Deployment
- Each app or site should have its own Vercel project
- Expo app web builds should use static export
- The marketing site should deploy separately from product apps
- For Vercel monorepo projects, set the Root Directory per project instead of deploying the repo root as one site

### Current Root Directories
- `apps/marketing` → Next.js marketing site
- `apps/fraction-finder` → Expo static web export
- `apps/time-tutor` → Expo static web export

### Current Web Build Conventions
- `marketing`
  - Framework preset: Next.js
  - Build command: default Next.js build
- `fraction-finder`
  - Build command: `npm run web:export -w fraction-finder`
  - Output directory: `apps/fraction-finder/dist`
- `time-tutor`
  - Build command: `npm run web:export -w time-tutor`
  - Output directory: `apps/time-tutor/dist`

## iOS Deployment
- Each app should have its own bundle identifier
- Each app should have its own EAS project and build profiles
- App Store releases should remain independent

### Current Bundle ID Convention
- Bundle IDs are app-specific and do not need to follow one exact repo-wide pattern
- Current examples:
  - `fraction-finder` iOS/Android → `com.kraig.fractionfinder`
  - `time-tutor` iOS → `com.timetutor.app`
  - `time-tutor` Android → `com.kraig.timetutor`

### Current EAS Profile Convention
- `development`
  - dev client + iOS simulator
- `preview`
  - internal distribution
- `production`
  - App Store-ready profile with `autoIncrement`

## Monorepo Deployment Principle
Shared code should not force every app to release together.

## Vercel Notes
- Keep web deploy targets separate per app
- Use monorepo project linking rather than one combined deployment target
- Project naming standard: use the workspace slug as the Vercel project name when possible
- Current repo still needs dashboard or CLI linking per project

## Environment Variable Strategy
- Do not hardcode future suite-wide domains in product code
- Keep domain-sensitive values behind per-project environment variables
- Current default posture:
  - Time Tutor support/privacy links fall back to `https://timetutor.app`
  - Marketing support email falls back to `support@timetutor.app`
- When a broader suite domain is chosen later, switch env vars first rather than rewriting app logic

### Current Environment Variables
- `EXPO_PUBLIC_SITE_ORIGIN`
  - Optional override for Time Tutor support/privacy links
- `NEXT_PUBLIC_SUPPORT_EMAIL`
  - Optional override for the marketing site support email

## Release Flow Per App

### Expo Apps
1. `npm run typecheck -w <app>`
2. `npm run lint -w <app>`
3. `npm test -w <app> -- --runInBand`
4. `npm run web:export -w <app>` for web verification
5. `npm run ios -w <app>` for simulator verification
6. `eas build --profile preview --platform ios` when ready for internal distribution
7. `eas build --profile production --platform ios` for release builds

### Marketing Site
1. `npm run typecheck -w marketing`
2. `npm run lint -w marketing`
3. `npm run build -w marketing`
4. Deploy the `marketing` workspace as its own Vercel project with Root Directory set to `apps/marketing`
