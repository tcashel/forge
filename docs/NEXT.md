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

```sh
forged overview --run <run-id>
forged overview --epic <epic-id>
forged session list --run <run-id>
forged events --run <id> --limit 200
```

The overview aggregates status/topology, controller and provider sessions,
Herdr attach state, gates, findings, per-packet attempt history with the
outcome each seat landed, artifacts, interventions, roster revisions, usage,
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
| Ledger | The raw event stream, filterable by kind and payload text, with payloads on demand. |

Epics swap Flow's matrix for a **Waves** board: every frozen child bead by
wave, with its bd status, run, merge state, and the child that is holding
for input.

Above every view sits an attention rail that fires only on things that need
the operator — a terminal block verdict, a failed attempt and its note, a
gate that did not pass, host fallback off Herdr, reviewer dissent, a
controller that died with work outstanding — ordered blockers first.

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
