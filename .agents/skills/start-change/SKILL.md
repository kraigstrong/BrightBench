---
name: start-change
description: Scope and start a BrightBench repository change with minimal context, a user-visible outcome, affected workspaces, a risk level, and a commit-sized plan. Use when beginning implementation, fixing a bug, or taking over an unfinished branch.
---

# Start Change

## Workflow

1. Read root AGENTS.md, docs/current.md, and the target app's nested AGENTS.md when present.
2. Inspect git status, the current branch, and any existing diff before editing.
3. State the user-visible outcome in one sentence.
4. Identify affected apps and shared packages. Include downstream consumers for shared-package work.
5. Assign Low, Medium, or High risk using root AGENTS.md.
6. Surface only decisions that cross a human-approval boundary. Discover repository facts instead of asking.
7. Produce a plan of small, independently verifiable steps. Prefer one coherent outcome per commit.
8. Continue implementation unless the user requested planning only.

## Planning Rules

- Keep routine UI and copy work lightweight.
- Include persistence compatibility for stored-state changes.
- Include consumer verification for shared-package changes.
- Include simulator, web, device, privacy, or release evidence only when the risk requires it.
- Do not create phase reports, PRD traceability, or speculative ADRs.
- Preserve existing user changes and separate unrelated work.

## Output

Keep the startup summary concise:

- Outcome
- Affected workspaces
- Risk and required evidence
- Implementation steps
- Genuine human decisions, or None
