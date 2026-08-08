---
name: review-ready
description: Prepare a BrightBench branch for review by inspecting the complete diff, confirming scope, running the risk-tier checks, and drafting a concise truthful PR description. Use before opening or updating a pull request or handing work to an independent reviewer.
---

# Review Ready

## Workflow

1. Determine the intended base branch and inspect git status.
2. Review the full base-to-HEAD diff plus uncommitted changes.
3. Confirm no unrelated files, generated debris, secrets, or false validation claims are present.
4. Reassess Low, Medium, or High risk from the actual diff.
5. Run missing checks required by the verify-change skill.
6. Confirm documentation changed only where a source of truth changed.
7. Record manual checks that remain.
8. Draft the PR body using .github/PULL_REQUEST_TEMPLATE.md.

## Review Priorities

Inspect in this order:

1. Behavioral regressions.
2. Persistence compatibility.
3. Shared-package blast radius.
4. Invalid route, mode, and state combinations.
5. Accessibility and child privacy.
6. Native and release metadata.
7. Missing tests or inaccurate evidence.

An independent reviewer must receive the objective, root guidance, target-app guidance, and actual diff rather than only the implementer's summary.

## Completion Standard

A branch is review-ready when its scope is coherent, required checks pass, and remaining human checks are explicit. The pull request is the durable completion record; do not create a separate phase report.
