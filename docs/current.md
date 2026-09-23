# Current Work

## Active work

- App: Time Tutor
- Objective: Replace the placeholder reward sounds and add mode-tap, per-star, and crown audio
- Branch: `time-tutor/reward-sound-refresh`
- Status: complete and approved on device; in review
- Next action: merge, then pick the next Phase 1 follow-up
- Blocked on: nothing

## Portfolio

| App | State | Next meaningful action |
|---|---|---|
| Time Tutor | Shipped, active | Physical-device haptic review, then pick the next Phase 1 follow-up (see `apps/time-tutor/docs/rollout-plan.md`) |
| Fraction Finder | Development, automated PR gate passing | Run an iOS and web gameplay smoke pass |
| Letter Learner | Development | Validate curriculum and audio behavior on a physical device |
| Marketing | Deployable | Complete Vercel project linking and production environment setup |
| Letter Bingo | Placeholder | Define the first playable learning loop |
| Place Value | Placeholder | Define the first playable learning loop |

## Open human checks

- Judge Time Tutor haptic strength on a physical iPhone. Audio was judged on
  device during the reward-sound refresh; haptics were not changed and have not
  been reviewed since.
- Confirm App Store privacy disclosures whenever permissions or data handling change.
- Decide production domains and complete Vercel linking when the portfolio is ready.
