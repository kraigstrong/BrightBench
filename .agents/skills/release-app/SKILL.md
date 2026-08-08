---
name: release-app
description: Run a BrightBench app release preflight covering versions, full verification, exports, native metadata, permissions, privacy, audio credits, device checks, and handoff. Use only when preparing to ship, submit, tag, promote, or release an app.
---

# Release App

## Boundaries

Releasing is High risk. Read root AGENTS.md, docs/current.md, docs/release-playbook.md, and the target app's nested AGENTS.md.

Do not submit, publish, promote, tag, or roll back production without explicit human approval.

## Preflight

1. Confirm the target app, platform, release version, build number, and intended channel.
2. Inspect the full release diff and dependency changes.
3. Verify app config, native Xcode metadata, bundle identity, permissions, and capabilities.
4. Review persisted-state compatibility.
5. Review privacy, support, legal copy, and App Store disclosure impact.
6. Confirm audio licensing and credits when audio changed.
7. Run the app's release command. For Time Tutor:

       npm run verify:release -w time-tutor

8. Run the full repository gate when shared packages or release infrastructure changed:

       npm run check:ci

9. Record physical-device smoke results, including audio and haptics when relevant.
10. Prepare release notes and the EAS/App Store handoff.
11. Ask for approval before the actual build submission, production promotion, or tag.

## Handoff

Report:

- Version and build consistency
- Automated commands and results
- Dependency, permission, privacy, and audio review
- Device and production checks completed
- Human gates remaining
- Release notes or tag still needed
