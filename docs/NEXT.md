# CURRENT — the lead agent hands locked work to Forged

The Rust binary is the execution path. There is no preliminary “first contact”
experiment and no token-accounting-only milestone: finish planning with the
user, lock the work, submit it, then inspect durable state.

## Ownership

- The user talks to one lead agent.
- Smithy/Anvil owns plan, proportional critique, and adjudication.
- Beads owns inventory, dependencies, readiness, and leases.
- Forged owns cognitive-stage contracts, topology, provider dispatch, gates,
  review/remediation, epic waves, and results.
- Provider adapters perform cognition.
- Herdr owns panes/process transport; the Forged ledger remains truth.
- Git/GitHub own code, branches, PRs, and merge truth.

## Configure once

```sh
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
export BEADS_DIR="${BEADS_DIR:-$ANVIL_HOME/beads}"
forged init
forged doctor
forged definition validate --profile standard --roster default
```

`BEADS_DIR` may point to an embedded store or to metadata for one central team
Dolt SQL database. The collaborative setup, credential boundary, connectivity
check, and the reasons active embedded work need not migrate are documented in
[Central Beads server](beads-team-server.md). In either mode Beads owns the
work graph and leases while Forged retains its separate execution ledger.

`$ANVIL_HOME/config.yaml` contains named assurance profiles (`lean`,
`standard`, `high`) and named ordered provider/model rosters. Change a roster
when model or provider availability changes; do not rewrite topology or skills.
`standard` uses one repository-aware reviewer. `high` is an explicit choice for
consequential security, data, migration, financial, or irreversible-operation
risk; reviewer disagreement never promotes a standard run into it. A profile's
`fixRoundBudget` is the only review-loop limit: after the initial review, each
budgeted remediation is followed by another review, and exhaustion is reported
as `reviewBudgetExhausted` rather than starting a successor run or Bead.
Run start freezes the resolved package and hashes, including gate commands,
stage and transport budgets, and Herdr host policy. Editing authoring YAML
affects later runs only; recovery and detached controllers continue from the
stored policy. A live slice changes roster only at a durable boundary:

```sh
forged run revise-roster --run <run-id> --roster <name> --reason '<reason>'
```

An implement or remediation seat may stop with a structured
`specAmendmentProposed` result when repository evidence contradicts the frozen
spec. After `reviewBudgetExhausted`, a lead may make the one explicit exception;
Forged records the deduplicated final findings, identity, and rationale:

```sh
forged run accept-risk --run <run-id> --accepted-by <identity> \
  --rationale '<why the concrete consequence is acceptable>'
```

For an epic, revise once at the parent. The append-only event and all current
unmerged child revisions commit atomically; future children inherit the same
resolved snapshot without looking the roster name up again:

```sh
forged epic revise-roster --epic <epic-id> --roster <name> --reason '<reason>'
```

If a detached epic controller is active, pause it first and wait for status to
show the durable pause. Revise the roster, then resume and submit again; this
keeps child binding and roster revision under one scheduler authority.

Herdr defaults to `preferred`: unavailability is recorded and falls back to a
plain detached process. Use `required` only when execution must refuse without
an observable pane.

## Submit a slice

```sh
forged run start --bead <id> --repo /absolute/repo \
  --profile standard --roster default
forged run submit --run <id>
```

The spec is the bead: its `description`, `acceptance_criteria`, `design`, and
`notes` fields become the body every seat reads, and the packet is fenced on
the SHA-256 of that rendered body instead of a file hash. The bead's
`revision` is recorded as provenance, not as the fence — bd mints a new one
on every write to the bead, forged's own lease claim included, so a run
fenced on it would refuse its own resume. Revise a spec with `bd update`; the
next packet opened pins the new body, and a packet already open is re-pinned
before its next claim. `--spec <path>` still names a spec file for one
release and is recorded as deprecated.

Submit returns a durable controller identity immediately. Retrying while it is
live adopts the same verified driver; a confirmed-dead driver is reconciled
and restarted under a new generation. Status includes the driver's pid/start
identity, the exact executable version and digest, a per-generation durable
log, and the latest ledger progress event. An unverifiable identity is
reported as `unknown` and blocks a duplicate spawn. The run ends at a reviewed
draft PR; the human adjudicates the merge.

Push authentication and network failures consume the frozen transport retry
budget. Exhaustion stops the run with an `input-required:` reason while the
unconfirmed push operation remains reconcilable; it is never recorded as a
successful push.

Settle that whole run explicitly rather than treating a controller exit as a
delivery decision:

```sh
forged run stop --run <run-id> --outcome clean --reason '<ready-to-land reason>'
forged run stop --run <run-id> --outcome input-required --reason '<question>'
forged run stop --run <run-id> --outcome superseded \
  --superseded-by <successor-run> --reason '<replacement reason>'
forged run stop --run <run-id> --outcome landed --reason '<verification>' \
  --pr <number> --sha <exact-merge-sha>
```

The whole-run stop first makes the state machine terminal, then durably
revokes and confirms death for every live attempt. `blocked` and
`input-required` return the Bead to blocked/unassigned; `cancelled` and
`superseded` return it open/unassigned; `clean` preserves its claim while the
reviewed PR awaits delivery. Only `landed` closes the Bead, clears its
assignment, and retires a clean worktree. The stored PR and full SHA make a
clean squash-merged worktree safe to retire without pretending the topic
branch is an ancestor of the base. Dirty or unresolved worktrees remain for
inspection and are reported in the settlement result.

`run status` reports the terminal outcome, delivery evidence, successor, and
`claimHealth`. An `in_progress` Bead with neither a live controller nor a live
attempt is marked `staleInProgress: true` instead of silently looking active.

## Submit an epic

```sh
forged epic start --epic <epic-id> --repo /absolute/repo \
  --profile standard --roster default
forged epic submit --epic <epic-id>
```

The epic Bead is the plan map and the frozen child inventory is read from its
native parent links; there is no second editable epic spec file. The old
`--spec <absolute-path>` flag remains readable for one release and is recorded
as deprecated provenance only.

Code-producing children (`bug`, `feature`, `task`, `story`, and `spike`) run
through `slice/v1`. No-diff children (`chore`, `decision`, and `milestone`)
become one explicit `inputRequired` action: complete the work directly in
Beads, close the child, then `epic resolve`. Forged never manufactures an
empty commit or PR for them, and a child closed after epic start counts as
accounted work.

Resolving a child-specific stop retires that terminal child binding from the
epic projection. The next wave starts a fresh child run generation (for
example, `<child>-g2`) from the adjudicated spec; it never reuses or silently
accepts the unclean terminal run.

Forged freezes the Beads inventory, drives ready children in waves, and
squash-merges only mechanically clean slices into
`forged/epic-<epic-id>`. It never merges that branch to the default branch. A
completed epic ends at one draft PR; ambiguity/no-ready/non-clean work becomes
durable `inputRequired`, not a hidden cognitive replan.

After the lead agent or user adjudicates a held child:

```sh
forged epic resolve --epic <epic-id> --child <child-id> --note '<resolution>'
forged epic submit --epic <epic-id>
```

Pause is an out-of-band signal observed at the next durable boundary:

```sh
forged epic pause --epic <epic-id> --reason '<reason>'
forged epic resume --epic <epic-id> --reason '<reason>'
forged epic submit --epic <epic-id>
```

## Reconnect from any agent harness

Start with `overview` or `work list`. Both carry the same operator queue;
`work list` additionally serves the uncapped raw inventory. Neither needs an
id.

```sh
forged work list
forged overview                    # no scope: the whole portfolio
forged overview --run <run-id>
forged overview --epic <epic-id>
forged overview --id <id>          # kind-blind: resolves either, or lists candidates
forged session list --run <run-id>
forged events --run <id> --limit 200
```

`overview` with no scope answers with the portfolio: `kind: "portfolio"` on
the same `forged.overview/1` schema, carrying the inventory entries newest
first (capped, with `total` and `cap` stated so a truncated page reads as
truncated), the portfolio-wide `spend`, and one queue grouped in this stable
order: **Needs me**, **Ready to merge**, **Running**, **Stalled or
recoverable**, **Planned**. The App renders that same queue; it does not
derive a second classification. The `attention` rail names each
subject that needs a human and the durable evidence for it — an epic holding
on `input.required`, an attempt marked `revoking` and not yet reclaimed, a
result taken into custody by `proto.quarantine`, or usage rows carrying no
cost. An empty rail means nothing needs attention; it is never omitted.

Each queue/inventory entry carries a live Bead title (with a deterministic
legacy fallback), repository and base branch, current stage/seat, last
progress timestamp plus the clock used for age, exact blocker and next
action, PR delivery, explicitly-known-or-unknown CI, spend, verified
controller identity, and Bead `claimHealth`. Beads enrichment is one bounded
read for the exact ledger ids, not one subprocess per row. A shell or Herdr
pane is never enough to classify an entry as Running; a verified driver
identity or live attempt is required. An
epic's lifecycle is derived from its durable events — `active` until
`forged.epic.paused`, `active` again after `forged.epic.resumed`,
`submitted` once its final PR exists.

Lifecycle fields are additive and always present: `outcome`,
`delivery: {pr, sha}`, and `supersededBy`. Legacy rows have null values until
a `run.settled` event records them. CI remains `unknown` unless durable
evidence exists; the queue does not turn an unavailable GitHub lookup into a
green check. `run status` and queue entries use the same `claimHealth` shape
(`known`, status, assignee, expected assignee, stale-in-progress flag, and
detail), so abandoned Bead ownership is visible instead of silently trusted.

The overview aggregates status/topology, controller and provider sessions,
Herdr attach state, gates, findings, per-packet attempt history with the
outcome each seat landed, artifacts, interventions, roster revisions, per-seat priced usage,
and events. The MCP `overview` tool returns the identical structured
projection and renders it through `ui://forged/overview.html`.

That MCP App draws one projection five ways, and never invents a state the
ledger did not record:

| View | What it answers |
| --- | --- |
| Flow | Where every seat stands. A seats × rounds matrix — rows are the profile's seats, columns are protocol rounds — with each cell carrying its provider/model, verdict, and a duration bar scaled to the run's longest attempt. |
| Timeline | Where the wall clock went. Attempt spans reconstructed from `attempt.state`, with gate, PR, and escalation milestones ticked above them. |
| Evidence | What the reviewers actually said. Findings carried into the fix round, or every seat's own list; each seat's report; gate rows with exit codes; artifact paths. |
| Workers | What to attach to. Sessions with claimants and copyable Herdr attach hints, the controller row, queued interventions, roster revisions. |
| Cost | What the run spent. Per-seat tokens, web-search calls, and money, with each cost labelled `billed` (the provider charged it) or `imputed` (derived from the rate card), and superseded attempts marked as rework. |
| Ledger | The raw event stream, filterable by kind and payload text, with payloads on demand. |

Epics swap Flow's matrix for a **Waves** board: every frozen child bead by
wave, with its bd status, run, merge state, and the child that is holding
for input.

Above every view sits an attention rail that fires only on things that need
the operator — a terminal block verdict, a failed attempt and its note, a
gate that did not pass, host fallback off Herdr, reviewer dissent, a
controller that died with work outstanding — ordered blockers first.

## Usage and cost

Usage is recorded by the attempt that spends it — no operator step, no batch
pass. When an attempt settles, forged parses the capture it just wrote and
records one row per model, keyed
`(run, packet, attempt, provider, model)`. The key is what makes the record
idempotent, so re-reading a capture never doubles a run's spend, and it is
also why rework is visible: a superseded attempt keeps its own row instead of
being overwritten by the attempt that replaced it.

Token buckets are disjoint on every provider: `input + cacheRead + cacheWrite`
is the prompt. Claude reports them that way; codex reports a total with the
cache buckets nested inside it, so its parsers subtract them back out. Without
that normalization a cross-provider sum — and every cost derived from one —
is silently wrong.

Cost is reported, not invented. Claude bills a cost and forged stores it
verbatim (`billed`). Codex reports tokens only, so cost is imputed from the
rate card in `$ANVIL_HOME/config.yaml` (`imputed_api_rate`); it ships seeded
with OpenAI's published rates and a `rates_as_of` date the Cost view shows, so
a stale card is visible rather than silent. A model with no card entry keeps a
null cost and counts in `rowsMissingCost`.

Server-side web searches are billed per call, not per token, so their count
rides beside the token buckets rather than inside them and is priced from the
card's `tools.web_search_per_1k`. It is added only to rows forged is already
imputing: a provider that billed the turn billed its searches in that same
figure, and estimating on top would charge one search twice.

The long-context tier is decided provably, never guessed. OpenAI prices a
prompt above the threshold at the long-context rates, and the threshold is
per request — but a provider capture reports the sum over every request in a
turn, and a 1.4M-token turn is routinely 27 requests of 50K. Tiering off that
total would overcharge roughly twofold. The card carries each model's
`context_window`: when the window cannot exceed the threshold, the short-context
rates are correct for the whole turn whatever the total says. When it can,
forged declines to price the row rather than pick a tier.

Runs that settled before capture existed are backfilled with:

```sh
forged usage ingest --run <run-id>     # or --all
```

Ingest is reconciliation and safe to repeat: it attributes to the same
attempt the capture would have, so repeat runs upsert rather than accumulate.

For a Herdr-backed attempt:

```sh
forged session read --attempt <attempt-id> --lines 120
forged session message --run <run-id> --attempt <attempt-id> \
  --message '<guidance>' --requested-by '<human-or-agent>'
```

Messages without live-delivery capability are ledgered for the next provider
boundary.

## Smithy cutover

Anvil 0.3 removes `execute-review-fix.js`, `run-epic.js`, the critique Workflow,
`watch-epic`, and its monitor. Its dispatch skills are typed clients of the
commands above. Planning remains human-in-the-loop and provider-neutral;
execution has one durable authority.

The next operational action is to review/merge the Forge and Smithy branches,
install those exact versions, and use the normal Anvil plan → adjudicate →
submit path on real work. No alternate execution path remains to reconcile.
