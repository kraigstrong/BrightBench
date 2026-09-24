# Current Work

## Active work

- App: Shared packages (Time Tutor is the first consumer)
- Objective: Add `@education/audio` holding the shared reward sounds and generic
  playback helpers, and migrate Time Tutor onto it with no behavior change
- Branch: `shared/audio-package`
- Status: implemented and verified; in review. The Challenge results reveal was
  exercised on a physical device after the move and all reward audio plays
  correctly from the package. That pass surfaced a pre-existing drum-roll timing
  defect, unrelated to this change and tracked in issue #17.
- Next action: review and merge, then wire Letter Learner onto the shared
  correct/try-again sounds
- Blocked on: nothing

See `docs/decisions/0001-shared-audio-package-boundary.md` for what the package
owns and what stays app-local.

## Decisions already made for the follow-up work

These are settled; the work items that carry them out are not started.

- **Letter Learner will adopt the shared `correct` and `try-again` sounds** when
  it is wired up, replacing its duplicate copies. Its `go.mp3` has no shared
  equivalent and stays app-local, and its letter-name, letter-sound, and digraph
  recordings are curriculum content, so they stay app-local too.
- **Fraction Finder's `soundEnabled` default will flip from `false` to `true`**
  when it gains audio, matching Time Tutor and Letter Learner. Existing stored
  user preferences must be preserved — the flip changes the default for new
  installs only, not the value already on disk for an existing player.
  Fraction Finder has no `expo-audio` dependency today, so wiring it up adds a
  native dependency and is High risk.

## Portfolio

| App | State | Next meaningful action |
|---|---|---|
| Time Tutor | Shipped, active | Physical-device haptic review (see `apps/time-tutor/docs/rollout-plan.md`) |
| Fraction Finder | Development, automated PR gate passing | Run an iOS and web gameplay smoke pass |
| Letter Learner | Development | Adopt the shared `correct`/`try-again` sounds from `@education/audio` |
| Marketing | Deployable | Complete Vercel project linking and production environment setup |
| Letter Bingo | Placeholder | Define the first playable learning loop |
| Place Value | Placeholder | Define the first playable learning loop |

## Open human checks

- Judge Time Tutor haptic strength on a physical iPhone. Audio was judged on
  device during the reward-sound refresh; haptics were not changed and have not
  been reviewed since.
- Confirm App Store privacy disclosures whenever permissions or data handling change.
- Decide production domains and complete Vercel linking when the portfolio is ready.

## Known local blockers

- `pod install` fails in this checkout: `react-native-reanimated` 4.2.1 rejects
  the hoisted `react-native-worklets` 0.8.3 (the apps pin 0.7.2, which installs
  nested). This predates the audio package work and blocks fresh iOS native
  builds locally.
