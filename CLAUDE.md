# CLAUDE.md

`AGENTS.md` is the canonical cross-agent instruction file for this repository. Read it first and follow it in full.

For routine Time Tutor work, the complete startup context is:

1. `AGENTS.md`
2. The open issues: `gh issue list --state open --label "app:time-tutor" --limit 100 --json number,title,labels,body,closedByPullRequestsReferences`
3. `apps/time-tutor/AGENTS.md`
4. Files directly involved in the change

Work state lives in GitHub Issues, not in a committed file. See the
"Current-State Pointer" section of `AGENTS.md`.

Canonical reusable workflows live in `.agents/skills`. The `.claude/skills` entries are thin compatibility bridges and must not duplicate or diverge from the canonical workflow text.

Do not require phase reports, PRD traceability, or release-level paperwork for routine UI and gameplay changes. Apply the risk-based verification model in `AGENTS.md`.
