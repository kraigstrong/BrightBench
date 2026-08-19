---
name: start-change
description: Scope and start a BrightBench repository change with minimal context, a user-visible outcome, affected workspaces, a risk level, and a commit-sized plan. Use when beginning implementation, fixing a bug, or taking over an unfinished branch.
---

# Start Change

## Workflow

1. Read root AGENTS.md, docs/current.md, and the target app's nested AGENTS.md when present.
2. Inspect git status, the current branch, and any existing diff before editing. Create a work-item-scoped branch before implementing if currently on `main`.
3. When the objective spans more than one outcome (a milestone, phase, or roadmap section), select the next bounded work item before scoping anything else.
4. State the user-visible outcome of that work item in one sentence.
5. Identify affected apps and shared packages. Include downstream consumers for shared-package work.
6. Assign Low, Medium, or High risk using root AGENTS.md.
7. Surface only decisions that cross a human-approval boundary. Discover repository facts instead of asking.
8. Produce a plan of small, independently verifiable steps. Prefer one coherent outcome per commit.
9. Unless the user requested planning only: for Medium or High risk, delegate implementation to a subagent on the branch already created in step 2, giving it the outcome, affected workspaces, risk level, the plan, and the relevant AGENTS.md guidance, and have it run the verification the assigned risk requires. For Low risk, implement directly.
10. When implementation was delegated, critically review the subagent's complete diff before returning it to the user: check it against the plan, confirm no unrelated files, apply root AGENTS.md's Review Priorities, and verify its claimed checks actually ran rather than passing along an unconfirmed claim.
11. If the review finds a problem: at High risk, route the fix back to the subagent or a fresh independent reviewer, since the orchestrator is the required independent reviewer here and cannot review its own correction; at Medium risk, route it back to the subagent, or fix directly only for something small. Either way, re-run the risk tier's required verification against the corrected diff, then repeat the review before handoff.
12. Stop and return the item for review once it is done; do not continue into another work item from the same objective without a new human turn.

## Planning Rules

- Keep routine UI and copy work lightweight.
- Include persistence compatibility for stored-state changes.
- Include consumer verification for shared-package changes.
- Include simulator, web, device, privacy, or release evidence only when the risk requires it.
- Do not create phase reports, PRD traceability, or speculative ADRs.
- Preserve existing user changes and separate unrelated work.
- When the requested objective spans multiple outcomes, scope and implement only the next bounded work item; do not plan or implement the remaining items in the same pass.

## Output

Keep the startup summary concise:

- Outcome
- Affected workspaces
- Risk and required evidence
- Implementation steps
- Genuine human decisions, or None
