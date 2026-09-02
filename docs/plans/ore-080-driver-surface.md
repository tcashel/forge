# The driver surface — epic brief (suggested id `ore-080`)

**Status:** Brief for `/forged:plan`. Not yet a ledger epic.
**Design authority:** [ADR-0036](../adr/0036-agent-is-the-operator-one-id-one-lifecycle-one-next.md),
[`SYSTEM.md`](../SYSTEM.md), [`LIFECYCLE.md`](../LIFECYCLE.md),
[`DRIVING.md`](../DRIVING.md).
**Ground:** `main` at c530743e (v0.7.0 release PR #240 open).
**Release:** v0.7.x for wave 1 (projection-only), v0.8.0 at wave 2
(lifecycle in the ledger and thin skills), v0.9.0 at wave 3 (finish,
seats, slots).

## Mission

Make a fresh-context agent the operator of record. After this epic a
lead agent given only `forged next` and the responses it leads to
drives one epic from `drafted` children to one draft PR, with the human
touching only decisions, and the forged lane is chosen over the direct
lane on Forge's own repository.

## The test every slice faces

The Ore Loop's one-question test still applies — does it delete a
concept or add one? — with ADR-0036's refinement: a slice may add to
the ledger only where it removes a burden from the agent. Every PR
description states what the slice deletes from the agent-facing
surface (a field, a tool, a loop, a rule the agent had to remember)
and what it adds to the ledger.

## Ground facts the plan rests on

Verified on `main` c530743e and the operator store on 2026-09-02:

- `operations overview` returns 853 KB; `work detail` 94 KB; `overview
  --run` 105 KB. The attention rail has 62 items: 47 `blocked` symptoms
  on dependency-blocked stubs, 10 decisions.
- `explain` verdicts are execution-only (`not-started` for a closed
  epic); `work show` and `explain` advertise `work reopen` on closed,
  landed items; `run status` advertises `work supersede` on a landed
  run. Actions are honesty-tested, not relevance-tested.
- `ExecutionApprovalV1` is validated on `work note add` and never read
  by `run start` or `handoff` (grep on `core/ops.rs`, `core/handoff.rs`).
- 53 of 65 MCP tools take `Parameters<EnvelopeArgs>`; 12 take typed
  args. The server instruction is one sentence.
- The ready-frontier pagination loop appears verbatim in
  `manage-work`, `plan`, `dispatch`, and `adjudicate` SKILL.md.
- `work note list` returns zero notes for every ore-070 child: the
  ore-070 lead wrote critiques and adjudications into `notes` prose via
  scripts, not through the typed note surface.
- `repository_write_active` defaults to 1 (`config.rs:110`).
- Two v0.7.0 retro findings await slices: the orphaned-reservation
  self-capacity deadlock and the first-launch restart charge
  (`restartUsed 1` on launch). The boot-grace finding was retracted on
  2026-09-02 with evidence: the supervisor already adopts an
  identity-less spawn through `controller-<gen>.pid/.lstart`
  (`handoff.rs` `recover_reserved_record`); the real cause was the
  pre-spawn fence dead state fixed in #245.
- Two findings from the v0.7.1 work (2026-09-02) are "one next"
  defects: an exhausted run (restart budget gone) answers `explain` with
  `next: null`; and `run retry` mints its successor on a fresh branch,
  discarding an implementation branch that already carries commits
  (three, on ore-071), leaving the lead-finish door as the only recovery.
- v0.7.1 (tag expected 2026-09-03) changes `handoff.rs`
  `recover_abandoned`, `attempts.rs` (`LedgerError::AdmissionMoved`,
  code stays `StaleClaimToken`), `forged-proto` `events.rs`/`engine.rs`
  (retry logical keys, `FailureKind::Readmit`), `execute.rs`
  `charge_retry`, nextest config, and the test tree. Wave 1 bases on
  the tagged SHA and touches none of those.

## Waves and slices

### Wave 1 — legibility, projection-only (no schema change)

**.1 `next`: the driver surface.** New read operation `next` (CLI
`forged next`, MCP `next`; audience lead). Scope: `--repo`, `--id
<epic>`, or portfolio. Sections in fixed order: decisions, running,
ready (with lifecycle stage — wave 1 derives it from the existing
note kinds and checkbox rule; wave 2 makes it authoritative), landed
(last 24 h), hidden counts. Row anatomy: `id`, one-line state, age,
`spendUsd`, `next`. Symptoms hidden unless `--symptoms`. Default cap 30
rows, `coverage` always present, `--section --limit` to widen. Payload ≤
4 KB at defaults on the operator store (test with a fixture of 120
subjects and 60 attention items). *Deletes:* the need to read
`operations overview` to orient.

The same slice sets the **terminal rule** for every lead-audience read
(operator pain recorded 2026-09-02: "I must use an agent to tell me
what is going on; I have no way to glance at a forged command"): when
stdout is a TTY the CLI renders the fixed text form specified in
`DRIVING.md`; when piped, or with `--json`, it emits the envelope. The
text is a rendering of the same result, never a second classifier, and
truncation stays visible ("12 of 47 shown"). `forged` with no arguments
is `forged next` for the current repository. Spend appears on every
running and deciding row and as a total per epic; `forged cost --id`
renders usage by seat and attempt with `billed` versus `imputed`
labels. `next --follow` re-renders on the pass cadence for a human
watching a run. Text forms ship for `next`, `explain`, `run status`,
`epic status`, `usage`/`cost`, `work history`, and a summary `work show`
(bodies only with `--full`); nothing exceeds 80 columns, ids sit left,
the one `should` verb sits right, `NO_COLOR` is honored. Agent
ergonomics and human ergonomics are one property here: a model reading
Bash output and an operator glancing at a terminal need the identical
layout.

**.2 `next` on every projection, with classes.** `OperationActionV1`
gains `class: should | can | repair` (additive, default `can` for
legacy emitters). Relevance rule: terminal subjects (closed, landed,
superseded) emit no `should`; at most one `should` per subject. A
relevance test class beside the honesty test: for every advertised
`should`, the subject is non-terminal and the verb's precondition
holds. Fix the observed wrong advertisements (`work reopen` on closed,
`work supersede` on landed, `not-started` on closed epics: `explain`
gains `landed`, `closed`, `parked` verdicts). Coverage rule, the mirror
of relevance: every non-terminal subject parked on a decision has
exactly one `should` — an exhausted run (restart budget gone) answers
`next: null` today and must advertise `run retry --because
world-changed`. *Deletes:* the "check `status` before believing
`nextActions`" rule.

**.3 Bounded by construction.** Every list verb returns summary rows by
default with `coverage {shown, total, truncated, nextCursor}`; spec
bodies and event tails are opt-in (`--detail full`, `--limit`).
`operations overview` default limit drops to 30 with attention rendered
as counts plus the decision items only; `work detail` and `overview
--run` trim to ≤ 8 KB at defaults (attempt history, artifacts, and
event tails behind `--detail full`). `work ready --all` returns the
whole frontier or refuses `FRONTIER_TOO_LARGE` with a remedy, so no
skill pages. *Deletes:* four copies of the pagination loop; the
800 KB read.

**.4 One id on every read; `workId` twins.** `work detail`, `overview`,
`session list`, `events` accept `--id` and resolve kind through the
`explain` resolver (`--subject-kind` stays as an optional
disambiguator). Every projection carries the uniform `subject` block.
Frozen `bead*` keys gain `work*` twins; the surface manifest gains a
`deprecated` column listing the frozen keys with the 1.0 removal note.
*Deletes:* the kind-guessing step and the `beadId` mental translation.

**.5 MCP audiences and envelope-free reads.** The manifest gains
`audience: lead | machine | operator`; `forged mcp` serves `lead` by
default (`--audience machine|all` for packet drivers and tests). Read
tools take typed args (`id`, `repo`, `limit`, `cursor`, `detail`) with
derived keys; write tools take typed args plus an optional
`idempotencyKey`, required only where the manifest says explicit key.
The server instruction becomes the ten-line orientation (ids, `next`,
`explain`, envelope rules, payload bounds, the lifecycle). Parity
tests pin lead-audience count ≤ 24. *Deletes:* ~40 tools from the
lead's list; raw envelopes on every read.

**.6 Pile-1 core fixes from the v0.7.0 retro.** (a) the supervisor
releases an orphaned reservation whose subject has no live attempt and
no controller record (evidence-based, custody untouched), so a subject
cannot deadlock on its own stranded capacity; (b) the first-launch
restart charge asymmetry (`restartUsed 1` on launch) corrected so the
budget means what it says. Both base on post-#245 `main`
(`recover_abandoned` now reconciles when live attempts exist;
`assert_admitted_attempt_live` refuses with `AdmissionMoved`). The
boot-grace item is deliberately absent: retracted, see ground facts.
*Deletes:* two dogfood findings and one class of budget burn.

### Wave 2 — the lifecycle in the ledger

**.7 Typed lifecycle records.** Note kinds `adjudication`
(`forged.adjudication/1`: dispositions `{ref, disposition: accept |
adapt | reject, reason}` plus crux decisions), `decision`
(`forged.decision/1`: `{kind, choice, rationale, actor, at,
costUsdAtDecision}`), and `retro` (`forged.retro/1`). Kinds are
schema-validated on add like `recommendation`. The `approval` kind is
retired from the manifest (existing rows remain readable). *Adds:* two
record kinds. *Deletes:* the approval choreography.

**.8 Derived `lifecycle` and enforcement.** `lifecycle {stage, since,
basis}` on `work show`, `explain`, `next`, `work ready`, computed per
[`LIFECYCLE.md`](../LIFECYCLE.md) from revision-bound notes, status,
checkboxes, deps, runs, and delivery. `work adjudicate` performs the
CAS spec write, the adjudication note, and the status promotion in one
fenced operation (generalizing `work promote`, which becomes its
stub-only alias). `work park` sets `deferred` with a decision note and
hides the item from frontier, rails, and `next`. *Deletes:* the
`update`-then-`reopen` non-atomic pair from the skills; the stage
inference heuristics.

**.9 `run dispatch`.** One fenced verb: read the current revision,
refuse below `adjudicated` with the stage-naming remedy (or record a
`lifecycle-override` decision under `--override "<reason>"`), compile
the package, mint the run row plus the generation-0 desired
authorization plus the approval decision (`--approved-by`, `--basis`)
in one transaction — the exact composition `run retry` and the ore pass
already use. Defaults: repository from `metadata.repository`, base from
the repository default branch, profile and roster from config
defaults. `run start` and `run submit` move to the machine audience.
`run retry` gains `--because spec-amended | world-changed | rebase`
recorded as a decision, and never discards committed work: when the
terminal run's branch is ahead of its base, the successor starts from
that branch (recorded as provenance) instead of a fresh cut, so the
ore-071 case (three commits stranded, lead finish the only door) cannot
recur; `--fresh` is the explicit opt-out. *Deletes:* the two-verb dance
and the unfenced approval note; the "mutate nothing between start and
submit" rule; the stranded-branch recovery by hand.

**.10 `wait`.** `forged wait --id <id> [--until decision | stage |
terminal] --timeout <s>` (default 240) blocks on the ledger event
cursor for the subject and returns `explain` on change, or `changed:
false` at timeout. MCP `wait` with the same contract; the host timeout
is respected by the default. *Deletes:* polling loops in agents and
skills.

**.11 Thin skills.** Rewrite `plan`, `critique`, `adjudicate`,
`dispatch`, `run-epic`, `manage-work`, `board` against .1–.10: each ≤
120 lines, zero loops, zero `jq`, position and next stated by
`explain`/`next` rather than prose, approval through `run dispatch`.
`validate-plugin.sh` enforces the line budget and the absence of
pagination loops. The critic subagent prompt is unchanged. *Deletes:*
roughly 60 % of skill prose.

### Wave 3 — finish, seats, slots

**.12 Finish is a decision.** Review-budget exhaustion no longer stops
the run: it raises a `lead-adjudication` decision (residual findings
deduped by severity, diff stats, spend so far, cost of each option)
with verbs `run remediate --grant 1` (a recorded one-round budget
grant), `run accept-risk`, `work update` + `run retry`, `run stop`. A
profile-level `finish` policy (`landWhenResidualBelow: medium`) settles
clean-enough results as `clean` and marks the PR ready for review;
`run accept-risk --gate` accepts an environmental gate failure through
the same door. Landed slices close their work item automatically
(already the case). *Deletes:* `reviewBudgetExhausted` as a terminal;
the out-of-band lead finish.

**.13 Seats speak.** `packet update --attempt --snapshot` (keyed
replace-not-merge, attempt-fenced) rendered as `progress` on `run
status` and `next`; `packet ask --attempt --question` raises a
`seat-question` decision that parks the packet, not the run; `decide
--answer` records the decision and resumes the attempt where the
provider supports session resume, otherwise starts a fresh attempt from
the committed worktree with the answer as a field note. Bounded to two
questions per packet. A missing result block is reprompted once
in-session before the attempt is killed. Seats in an epic receive a
rendered `context` section (parent design excerpt, seam contracts,
sibling PRs landed) from the ledger. *Deletes:* the retry-for-a-question
cost; the kill-and-restart on a missing block.

**.14 Parallel where isolated.** `admission.implementationSlots`
(default 2) per repository behind one merge lock; reviews stay
unbounded; the DAG serializes true dependencies. A failed ore-pass
merge raises a typed `merge-conflict` decision (`run retry --because
rebase`). *Deletes:* the direct lane's reason to exist.

## Sequencing

- Wave 1 is concurrent except .1 ← .2 (the classes land first so `next`
  renders them) and .5 after .4 (typed args use the resolver).
- Wave 2 is ordered .7 → .8 → .9 → .10 → .11 (skills last, against the
  landed verbs).
- Wave 3 is concurrent; .12 and .13 both touch the protocol engine and
  merge in that order.
- Each wave ships as a release; the skills change only at wave 2.

## Acceptance for the epic

- A fresh-context agent given `DRIVING.md` and `forged next` drives a
  three-child dogfood epic on this repository from `drafted` to one
  draft PR, using only responses to choose verbs; the transcript shows
  zero polling loops and zero reads over 8 KB.
- The forged lane is used for every slice of the *following* epic; no
  direct-lane worktrees.
- `next` ≤ 4 KB and `explain` ≤ 8 KB at defaults on the operator store
  (a fixture reproducing its 2026-09-02 shape is checked in).
- The relevance test class passes for every advertised action; no
  terminal subject advertises a `should`.
- Lead-audience MCP tool count ≤ 24; the surface manifest gains
  `audience` and `deprecated` columns under the drift gate.
- At least one production run finishes under the finish policy with no
  human keystroke; at least one seat question round-trips without a
  retry.
- Every architectural invariant in `CLAUDE.md` holds; no test skipped,
  disabled, or weakened.

## Non-goals

- No workflow DSL, no new protocol kinds.
- No external tracker, no repository imposition.
- No change to the effect fence, claim tokens, operation identity, or
  the reclaim saga.
- No telemetry, complexity class, or roster policy — that is
  [`ore-081-factory-loop.md`](ore-081-factory-loop.md).
- No Apps redesign; the HTML views consume the same projections and
  shrink with them.
- No Herdr work. The protocol mismatch (forged 0.7.0 expects 19, current
  Herdr speaks 20, every seat falls back to the process host) is the
  Herdr-polish item the operator ordered last; it stays out of ore-080.

## Open questions for adjudication

1. Should `next` be a new operation or the new default of
   `operations overview`? (Recommendation: new operation; keep the
   overview for the App and mark it `audience: operator`.)
2. `wait` under MCP: return at the host's timeout with `changed: false`,
   or stream? (Recommendation: return; streaming is host-specific.)
3. Default `implementationSlots`: 2 or 3? (Recommendation: 2; raise by
   config after one epic of evidence.)
4. Does `work adjudicate` subsume `work promote`, or keep both?
   (Recommendation: subsume; keep `promote` as an alias for one release.)
5. Should the `approval` note kind be deleted or frozen? (Recommendation:
   frozen and hidden; stored rows stay readable.)
6. Store hygiene for the 47 `beads-*` blocked stubs: `work park` them in
   one operator pass after .8, or close them? (Operator's call.)
