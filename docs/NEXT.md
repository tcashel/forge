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
Run start freezes the resolved package and hashes. A live slice changes roster
only at a durable boundary:

```sh
forged run revise-roster --run <run-id> --roster <name> --reason '<reason>'
```

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
Herdr attach state, gates, findings, artifacts, interventions, roster
revisions, usage, and events. The MCP `overview` tool returns the identical
structured projection and renders it through `ui://forged/overview.html`.

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
