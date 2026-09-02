# The factory loop — epic brief (suggested id `ore-081`)

**Status:** Brief for `/forged:plan`, after
[`ore-080-driver-surface.md`](ore-080-driver-surface.md) lands.
**Design authority:** [ADR-0036](../adr/0036-agent-is-the-operator-one-id-one-lifecycle-one-next.md)
(accretion corollary); the code-factory north star recorded 2026-08-27:
the agent is the interface, complexity classes drive rosters, telemetry
tunes model choice, the human stays at adjudication points only.
**Release:** v1.0 candidate.

## Mission

Close the loop that makes the system improve itself: every landed
slice leaves the record richer, and the next planning session reads
cost and quality per class from the ledger instead of from memory
files. The agent suggests; the operator adjudicates.

## Why after ore-080

Telemetry without a denominator is noise: finding counts are
confounded by task weight, so "fewer findings" would select for weak
reviewers (the Goodhart trap named in the north star). The class field
is the denominator, and the lifecycle records from ore-080 are the
numerator. Build order is fixed: class → policy → telemetry → advice.

## Slices

**.1 Complexity class on the work item.** `class: trivial | routine |
consequential | hazardous` as a first-class field set at planning,
locked at adjudication (a class change after adjudication resets the
stage like a spec revision). `work create --class`, `work update
--class` under revision CAS. The critic reports when the declared class
disagrees with the spec's blast radius. *Adds:* one field. *Deletes:*
the profile guess at dispatch.

**.2 Roster policy by class.** Config gains `policy.byClass: {class:
{profile, roster, critique: required | optional, finish: {…}}}`. `run
dispatch` resolves profile and roster from the item's class when the
caller names none; the resolution is recorded in the package
provenance. Models are never pinned on the item — the policy is the one
config telemetry tunes. *Deletes:* per-dispatch profile/roster
arguments in the ordinary path.

**.3 Telemetry with a denominator.** `work history --group-by class`
and per-class metrics: cost per landed slice, findings per review round
by severity, fix rounds to clean, decisions per run, gate-failure rate,
wall-clock per stage, retries. Rates carry denominators and are null at
zero. A `forged report` text rendering for the planning session, ≤ 4
KB. *Adds:* one grouping dimension and one rendering.

**.4 Cost on `next`.** Every `next` verb carries `costEstimateUsd` from
the class's stage averages (retry ≈ last attempt; remediation grant ≈
one fix round plus one review); decision records store
`costUsdAtDecision`. *Deletes:* the "how much will this cost" question
at every decision.

**.5 Narrative from evidence.** `forged pr describe --id <run>` renders
a PR title from the spec title and a body from acceptance criteria,
gate rows, adjudicated findings, decisions, and spend — every claim
citing an evidence field, anything unsourced omitted. Authored by a
small model where the roster names a `narrator` role, template-only
otherwise. The protocol calls it at draft-PR time; `review publish`
keeps its own contract. Changelog entries only when the target
repository already has a changelog (detect, never impose). *Deletes:*
"Draft PR opened by forged for run …" titles.

**.6 Retros on the record.** `work note add --kind retro` on an epic
with a typed shape (what worked, what cost, ranked, each item citing
ids); `next --id <epic>` shows the last retro's top items when planning
a successor epic; `forged report` includes retro deltas. *Deletes:* the
dogfood log as the only retro store.

**.7 Advice, adjudicated.** `forged advise --repo` proposes roster
policy changes from telemetry (e.g. "consequential slices reviewed by
X averaged N high findings caught by the secondary reviewer; keep the
cross-family pair") as a `decision` request the operator accepts or
refuses; accepted advice edits config through the configure path and
records the decision. Never auto-applies. *Adds:* one read and one
decision kind.

## Acceptance

- Two consecutive epics run with no `--profile`/`--roster` on any
  dispatch; every package records its class-derived resolution.
- `forged report` for the second epic states cost per landed slice by
  class with denominators, and the planning session for the third epic
  cites it in the epic's `notes`.
- Every PR opened by the protocol has a conventional title and an
  evidence-cited body; a reviewer can trace each claim to a field.
- At least one `advise` decision is accepted and changes config through
  the recorded path.
- Goodhart guard: the report always shows findings *by severity and
  reviewer family*, never a single "fewer findings" number.

## Non-goals

- No automatic model switching without an accepted decision.
- No semantic session search (see
  [`forged-history-mvp.md`](forged-history-mvp.md)).
- No vendor telemetry; everything is local usage rows.
