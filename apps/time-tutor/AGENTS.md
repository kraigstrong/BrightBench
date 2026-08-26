# Time Tutor Agent Guidance

## Product invariants

- Time Tutor is a shipped, revenue-producing product; avoid regressions that could strand existing users.
- Preserve persisted settings, challenge stars, streaks, and progress across updates.
- Treat stored data as backward-compatible input and normalize older shapes safely.
- Keep `app.json` version/build values synchronized with the native Xcode project.
- Keep challenge difficulty mapping, star thresholds, mastery crowns, countdowns, and result reveals consistent across modes.
- Keep gameplay calm, readable, and child-friendly.
- Child privacy, legal disclosures, permissions, and App Store metadata are release boundaries.
- Audio and haptic changes require physical-device validation before release.

## Accessibility policy

Screen-reader support (VoiceOver/TalkBack) is best-effort, not a design target, for a
solo-maintained app. Keep the cheap wins — `accessibilityLabel`/`accessibilityRole` on
buttons, settings, and static screens — but do not chase live-region/announcement
correctness edge cases (e.g. re-announcing an identical repeated value) or build
alternate non-gesture input paths for custom drag controls (the analog clock has none
today; that's an accepted gap, not a bug). If a reviewer or automated tool flags a gap
here, the default answer is to accept the trade-off, not fix it — confirm with the user
before spending real effort on assistive-technology work beyond the existing baseline.

## Approval required

Ask the user before changing:

- Curriculum meaning, interval mappings, scoring thresholds, or mastery rules.
- Existing persisted-data semantics or migration behavior.
- Pricing, purchase behavior, tracking, privacy disclosures, or legal copy.
- Native permissions, capabilities, bundle identity, or production release metadata.
- Product-feel choices that depend on real-device judgment.

## Verification

Routine app verification:

```sh
npm run verify -w time-tutor
```

Focused checks:

```sh
npm run typecheck -w time-tutor
npm run lint -w time-tutor
npm test -w time-tutor -- --runInBand
```

Medium-risk UI or gameplay changes also require an iOS simulator or web smoke check of the changed flow.

Release preflight:

```sh
npm run verify:release -w time-tutor
```

Before release, a human must still confirm:

- Audio and haptic feel on a physical device.
- Privacy/support/legal copy and App Store disclosures.
- Version/build intent and release notes.
- EAS/App Store submission and production promotion.

## References

- `docs/rollout-plan.md`: historical rollout context and explicitly marked backlog items.
- Root `docs/design-canon.md`: suite visual source of truth.
- Root `docs/release-playbook.md`: deployment and release process.
- `/Users/kraig/code/time-tutor`: read-only historical visual reference.
