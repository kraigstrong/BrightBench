# Design Canon

## Intent
The visual language for this monorepo should feel calm, polished, warm, and child-friendly without becoming noisy or chaotic.

## Source Of Truth
Time Tutor is the design source of truth when there is any conflict with Fraction Finder's current local design layer.

## Core Visual Principles
- Clean over busy
- Encouraging over gamified
- Friendly over childish
- Spacious but not loose
- Soft surfaces with clear structure
- High readability and strong touch targets

## Priority Elements To Standardize
- Color palette
- Typography
- Card shells
- Buttons
- Header patterns
- Settings controls
- Celebration patterns
- Feedback banners

## Initial Extraction Plan
Seed the shared design layer from these Time Tutor references:
- `/Users/kraig/code/time-tutor/src/styles/theme.ts`
- `/Users/kraig/code/time-tutor/src/components/CelebrationOverlay.tsx`
- `/Users/kraig/code/time-tutor/src/components/HeaderSettingsButton.tsx`
- `/Users/kraig/code/time-tutor/src/screens/ModeChooserScreen.tsx`

## Near-Term Shared Package Targets
### `packages/design`
- palette
- spacing
- radii
- typography
- shadows
- motion timings

### `packages/ui`
- celebration overlay
- settings button
- card primitives
- suite feature cards for home/mode selection
- section headers
- prompt/result surfaces
- shared app shell
- shared header bar
- shared action/selectable button primitives

## Design Conflict Rule
If Fraction Finder and Time Tutor differ:
- choose Time Tutor for design and visual decisions
- choose Fraction Finder for stack and tooling decisions
