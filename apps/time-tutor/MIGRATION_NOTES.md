# Time Tutor Migration Notes

This app is a port of the original Time Tutor at `/Users/kraig/code/time-tutor`.

The goal is strong visual and behavioral parity, but not blind 1:1 copying. Some differences in the monorepo app are intentional improvements and should not be treated as regressions automatically.

## Intentional Differences

- The app uses the monorepo standard stack:
  - Expo-managed React Native
  - Expo Router
  - React Native Web
- Interactive gameplay routes disable native swipe-back gestures to avoid accidental navigation during drag-heavy clock interactions.
- The shared celebration modal copy is standardized:
  - title: `Nice work!`
  - body: `New challenge coming up`
- Challenge `Start` button placement has been adjusted where helpful for clarity and stability:
  - `Set the Clock` start button is centered to the actual clock face
  - `Elapsed Time` challenge start button lives in the prompt card instead of overlaying the answer input
- Some layout changes are intentionally made to reduce motion and jumping:
  - example: elapsed-time challenge prompt area keeps a stable height before and after start
- Challenge cards now use a new mastery-oriented progression treatment:
  - Easy, Medium, and Hard star progress are shown on the card
  - a crown appears when all 9 stars are earned
  - challenge launch now opens a dedicated difficulty popup before gameplay starts
  - challenge runs now require a separate in-screen Start tap and use a simple countdown bar during play
  - challenge runs now end with a centered animated summary overlay driven by score and accuracy threshold bars
  - the reveal can be skipped with a tap and includes `New Best` plus mastery unlock treatment

## Parity Guidance

- Prefer the original Time Tutor design language when styling conflicts arise.
- Do not modify the original `/Users/kraig/code/time-tutor` repo during this migration.
- Treat the original app as the reference for:
  - spacing density
  - typography feel
  - header composition
  - card styling
  - settings/support flows
- When a monorepo implementation differs, decide whether it is:
  - a regression to fix
  - a platform-driven compromise
  - an intentional improvement to preserve

## Current Port Scope

The monorepo version already includes:

- Home
- Mode chooser
- Settings
- Explore Time
- Set the Clock practice
- Read the Clock practice
- Elapsed Time practice
- 1-minute challenge for all three modes

Further polish work should compare against the original app screen-by-screen, while preserving the intentional differences above.
