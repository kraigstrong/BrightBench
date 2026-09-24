# Current Work (retired)

**Live work state now lives in GitHub Issues.** This file is a tombstone. It is
never updated, and nothing should be recorded here.

## Where to look instead

Read the open work for the app you are changing:

```sh
gh issue list --state open --label "app:<app>" --limit 100 --json number,title,labels,body,closedByPullRequestsReferences
```

`<app>` is one of `time-tutor`, `fraction-finder`, `letter-learner`,
`marketing`, `letter-bingo`, `place-value`, or `shared` for packages, tooling,
and repo-wide work.

## Label families

- `app:*` scopes an item to one app, or to `app:shared`.
- `verify:*` names the evidence the item needs: `verify:automated`,
  `verify:simulator`, `verify:device`, `verify:web`.
- `owner:kraig` means only the developer can do it.
- `blocked:kraig` means it is waiting on a decision or action from the developer.
- `decision` means it needs a product, architecture, scope, or cost call before
  implementation.
- `defect-class` means the item covers a whole class of defects; closing it on a
  single instance is wrong.

Acceptance criteria live in the issue body, not in a separate document.

An open issue whose `closedByPullRequestsReferences` is non-empty is in flight —
a pull request already exists against it. An empty array means unstarted. A
closed issue is done.

`gh issue list` fetches 30 issues by default, so pass an explicit `--limit`
above the real count or older open work is silently omitted.

Milestones are per-app releases (`Time Tutor 1.2`, `Fraction Finder 1.0`,
`Letter Learner 1.0`, `Marketing launch`) and carry release-blocking for that
app only.

The project board (https://github.com/users/kraigstrong/projects/1) is a view
over the issues, not a second source of truth. **If a board field and the issue
disagree, the issue wins.**

Gotcha: `gh issue list` with a label or milestone that does not exist prints
`[]` and **exits 0**. An empty result means check the name first; it does not
mean there is no work.

## Why it moved

This file was a status marker. Keeping it accurate meant editing a tracked file
on nearly every branch, which produced churn, merge friction, and lines that
outlived the work they described.

The `@education/audio` work (#16) showed both failure modes in one change. An
open human check listed here went stale the moment the check was performed, and
the active-work block restated what the pull request already said — branch,
status, next action — so the two could only ever agree by hand.

`kraigstrong/Keepsake` hit the same problem and measured it: because its ship
step required editing this file per work item, 17 of every 60 commits changed no
product code. It fixed it by deleting that step rather than by trying to keep
the file honest. BrightBench has done the same. `AGENTS.md`'s documentation
routing no longer has an "update the status file" instruction, and work state is
never recorded in a committed file.

`docs/decisions/` is unaffected. ADRs are durable, not status, and stay in the
repository.

Older documents and commits still cite `docs/current.md`. They are correct about
what was true when they were written and are deliberately not being rewritten.
