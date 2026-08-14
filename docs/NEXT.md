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

`$ANVIL_HOME/config.yaml` contains named assurance profiles (`lean`,
`standard`, `high`) and named ordered provider/model rosters. Change a roster
when model or provider availability changes; do not rewrite topology or skills.
Run start freezes the resolved package and hashes, including gate commands,
stage and transport budgets, and Herdr host policy. Editing authoring YAML
affects later runs only; recovery and detached controllers continue from the
stored policy. A live slice changes roster only at a durable boundary:

```sh
forged run revise-roster --run <run-id> --roster <name> --reason '<reason>'
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
  --spec "$ANVIL_HOME/specs/<id>.md" --profile standard --roster default
forged run submit --run <id>
```

Submit returns a durable controller identity immediately. Retrying while it is
live adopts the same controller. The run ends at a reviewed draft PR; the
human adjudicates the merge.

## Submit an epic

```sh
forged epic start --epic <epic-id> --repo /absolute/repo \
  --spec "$ANVIL_HOME/specs/<epic-id>.md" --profile standard --roster default
forged epic submit --epic <epic-id>
```

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

Start with `work list`: it is the one command that takes no id, so it is
where the ids every other command needs come from.

```sh
forged work list
forged overview --run <run-id>
forged overview --epic <epic-id>
forged overview --id <id>          # kind-blind: resolves either, or lists candidates
forged session list --run <run-id>
forged events --run <id> --limit 200
```

Each `work list` entry carries its `kind` (`slice` or `epic`), lifecycle
(`state`, `stopReason`, `createdAt`, `updatedAt`), live seat count, and
spend, so an inventory can be drawn without a second call per entry. An
epic's lifecycle is derived from its durable events — `active` until
`forged.epic.paused`, `active` again after `forged.epic.resumed`,
`submitted` once its final PR exists.

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
