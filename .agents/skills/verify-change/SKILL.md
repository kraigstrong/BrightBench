---
name: verify-change
description: Verify a BrightBench change using the repository's Low, Medium, or High risk tiers and report only evidence that actually ran. Use after implementation, before review, or when deciding whether a branch has enough automated and manual validation.
---

# Verify Change

## Workflow

1. Read root AGENTS.md and any target-app AGENTS.md.
2. Inspect the complete working-tree and branch diff.
3. Confirm affected apps, packages, and downstream consumers.
4. Assign the smallest honest risk level.
5. Run the required checks below.
6. Report commands, results, and manual evidence still missing.

## Low Risk

Run target workspace typecheck and lint. Run focused tests whenever behavior changed.

    npm run typecheck -w <workspace>
    npm run lint -w <workspace>

## Medium Risk

Run each affected workspace's complete gate:

    npm run verify -w <workspace>

For shared-package changes, use the affected-consumer runner:

    npm run check:affected -- --base origin/main

Smoke-test the changed flow in an iOS simulator or on web and record which path was exercised.

## High Risk

Run the full repository gate:

    npm run check

Also require an independent review of the actual diff and physical-device or production evidence where relevant. Do not treat an automated command as proof of device feel, privacy correctness, or release readiness.

## Integrity

- Never claim a skipped, interrupted, or failing command passed.
- Distinguish automated checks from manual checks.
- Record blockers and the exact remaining evidence.
- Do not broaden release-level ceremony to a lower-risk change.
