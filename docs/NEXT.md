# CURRENT — the lead agent hands locked work to Forged

The Rust binary is the execution path. There is no preliminary “first contact”
experiment and no token-accounting-only milestone: finish planning with the
user, lock the work, submit it, then inspect durable state.

## Ownership

- The user talks to one lead agent.
- Forge's dual-host `plugins/forged` lead-agent plugin owns plan,
  proportional critique, adjudication, and the explicit typed handoff.
- Beads owns inventory, dependencies, readiness, and leases.
- Forged owns cognitive-stage contracts, topology, provider dispatch, gates,
  review/remediation, epic waves, and results.
- Provider adapters perform cognition.
- Herdr owns panes/process transport; the Forged ledger remains truth.
- Git/GitHub own code, branches, PRs, and merge truth.

**2026-08-14 clarification:** the thin planning client is moving from the
sibling Smithy experiment into the current Forge tree for its next containing
release. Claude and Codex load one shared skill tree from this repository.
Smithy remains historical evidence and is neither an installation dependency
nor a second workflow authority. The move changes distribution and ownership
only: the lead agent still performs cognition, native Bead fields remain the
editable specification, and Forged remains the durable execution control
plane.

## Install the lead-agent plugin

From a Forge checkout, validate first with `bash scripts/validate-plugin.sh`.
Then register the checkout as the `forge` marketplace and install `forged`:

```text
# Claude Code
/plugin marketplace add /absolute/path/to/forge
/plugin install forged@forge
```

```sh
# Codex
codex plugin marketplace add /absolute/path/to/forge
codex plugin add forged@forge
```

Run `/forged:setup` after installation. Setup preserves `ANVIL_HOME` and
`BEADS_DIR`, and its before/after cleanliness check proves zero target-repo
imposition. Validation and CI do not install or configure the plugin.

## Configure once

```sh
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
export BEADS_DIR="${BEADS_DIR:-$ANVIL_HOME/beads}"
forged init
forged doctor
forged definition validate --profile standard --roster default
```

### Optional macOS supervisor service

After the CLI has been installed, macOS operators may run the desired-work
supervisor as a per-user LaunchAgent:

```sh
forged service install
forged service status
forged service stop --drain --timeout-seconds 300
forged service start
forged service restart
forged service uninstall
```

`install` copies the exact running executable to
`$ANVIL_HOME/runtime/bin/<sha256>/forged`; launchd invokes that immutable path
and its exact service generation, never a mutable `PATH` lookup. The manifest,
transition journal, idempotency receipts, and generation-scoped health files
are machine-local runtime state. They do not move or migrate the execution
ledger. Every lifecycle mutation is serialized, repeated explicit
`--idempotency-key` values replay their durable result, and an upgrade or
uninstall refuses until incompatible live controllers drain. `status` verifies
the manifest digest, `current` projection, on-disk plist, loaded launchd
program/arguments, PID/process-start identity, generation, and fresh tick.

The service passes only the explicit Anvil/Beads configuration and a bounded
system path to launchd. Install/start/stop/restart/uninstall are typed
unsupported operations on non-macOS hosts; `status` and `doctor` report that
portable state without invoking launchctl. Normal tests use an isolated fake
host. The real macOS smoke is ignored unless explicitly armed with
`FORGED_SERVICE_SMOKE_TEST=1`.

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

When `run stop` refuses with `ADJUDICATION_REQUIRED` — the run's latest
controller record carries no durable driver identity, so no death fence is
possible — the settlement path is `run adjudicate-settlement`: an explicitly
destructive operator adjudication of the evidence gap that records the
decision durably and settles the run (`landed`/`superseded`/`cancelled`),
converging an already-closed Bead and releasing forged's stale custody on
it. It refuses any run the normal fence can settle.

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

Start with `operations overview`. It is the bounded operator surface over
durable work plus the current nonterminal Beads plan. `work list` remains the
compatibility inventory and `overview` remains the compatibility reconnect
facade. Exact subject detail requires both kind and canonical id; it never
guesses or widens by prefix:

```sh
forged operations overview
forged operations overview --repo /absolute/path/to/repository
forged operations overview --group needs-me --limit 50
forged work map
forged work map --scope repository --repository /absolute/path/to/repository
forged work map --scope epic --epic-id <epic-id> --max-nodes 250
forged work detail --subject-kind run --subject-id <run-id>
forged work detail --subject-kind epic --subject-id <epic-id>
forged work list
forged work list --repo /absolute/path/to/repository
forged overview                    # no scope: the whole portfolio
forged overview --run <run-id>
forged overview --epic <epic-id>
forged overview --id <id>          # kind-blind: resolves either, or lists candidates
forged session list --run <run-id>
forged events --run <id> --limit 200
forged attention acknowledge --subject <id> --attention-id <id> \
  --occurrence-id <id> --actor <identity>
forged attention resolve --subject <id> --attention-id <id> \
  --occurrence-id <id> --actor <identity> --disposition <disposition> --note '<note>'
forged attention reopen --subject <id> --attention-id <id> \
  --occurrence-id <id> --actor <identity>
```

`operations overview` returns `forged.operations-overview/1` and renders
through `ui://forged/operations-overview.html`. Its stable groups are **Needs
me**, **Ready to merge**, **Running**, **Stalled or recoverable**, and
**Planned**. The live-plan adapter uses exactly one bounded N+1 native Beads
discovery and one batched exact-id hydrate; it never parses `bd graph`, calls
`bd ready`, claims work, or performs a per-node subprocess. Durable rows win
when a Bead also has execution history. A Beads outage keeps the durable
projection and marks plan coverage unavailable. The hot path reports
controller liveness only from its one ledger snapshot, so it performs no
per-row process or controller-file probe.

`work detail` returns `forged.work-detail/1` and renders through
`ui://forged/work-detail.html`. The Operations App may open it as a read-only
drawer when the host supports server tool calls; otherwise the exact CLI/MCP
command remains visible to the lead agent. Plan-only rows deliberately have
no detail target until durable execution exists.

`work map` returns `forged.work-map/1` and renders through
`ui://forged/work-map.html`. It keeps current Beads plans and durable run or
epic executions as distinct nodes, joined by explicit `execution-of` edges;
multiple executions of one Bead never overwrite each other. Native dependency
edges run from dependent to prerequisite, parent edges run child to parent,
and filtered or cross-scope coordinates are bounded `contextOnly` nodes.
Cycles, missing blocker status, and genuinely unavailable targets remain
visible in graph health. Operator and repository scope use at most two Beads
processes; epic scope uses at most three. Graphs over `maxNodes` refuse with
`GRAPH_SCOPE_TOO_LARGE` rather than returning a misleading partial graph.

Queue and attention fields use the same pure classifier as Operations, while
desired/admission facts remain on their exact durable subjects. Work Map adds
one bounded history projection and reports unattached subjects explicitly;
plan-only nodes never inherit execution spend. Ledger, Beads, plan, and
history captures and health remain separate because the sources are not one
cross-system transaction. Selecting a durable App node calls Work Detail with
its exact `{subjectKind, subjectId}`; plan nodes expose no execution control.

The repository selector performs one native, id-bounded
`metadata.repository` Beads query and reuses its rows for claim-health and
queue enrichment. Missing metadata and deleted or unreadable Beads are
reported as `repositoryScope.known: false` in the operator-wide view and are
never guessed into a scoped result; an unavailable authoritative read fails a
scoped request closed. The operator-database storage and repository-identity
decision is recorded in Bead `beads-zws.17`. The selector changes only the
query projection: one operator-scoped Beads database remains authoritative.

`overview` with no scope answers with the portfolio: `kind: "portfolio"` on
the same `forged.overview/1` schema, carrying the inventory entries newest
first (capped, with `total` and `cap` stated so a truncated page reads as
truncated), the portfolio-wide `spend`, and one queue grouped in this stable
order: **Needs me**, **Ready to merge**, **Running**, **Stalled or
recoverable**, **Planned**. The App renders that same queue; it does not
derive a second classification. The `attention` rail names each
active condition with a closed severity, owner (`human` or `lead-agent`),
stable `attentionId`, occurrence-fenced `occurrenceId`, bounded durable
evidence references, and a typed recommended action. The shared projector
covers input and terminal blockers, Beads settlement, revocation and
quarantine custody, merge approval, partial cost, controller/restart
failure, abandoned gates/retries, typed provider degradation, ambiguous
effects, missing attempt evidence, and reviewer disagreement. Routine
capacity waits and healthy automatic recovery are not attention. The same
typed array and order appear in `overview`, `work list`, CLI, MCP, and the
App; an empty rail means nothing needs attention and is never omitted.

Acknowledgement records custody and stays visible. Resolve is accepted only
for explicitly adjudicable custody conditions; source-backed operational
conditions clear through their own domain transition. A later causal source
keeps the stable attention id but receives a new occurrence id, so a stale
control cannot dismiss a recurrence. These controls never resume work,
release capacity, retry an effect, settle Beads, or merge a PR.

Each queue/inventory entry carries a live Bead title (with a deterministic
legacy fallback), durable launch repository and base branch, authoritative
`repositoryScope`, current stage/seat, last
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
A clean or accepted-risk run deliberately retains its claim while its reviewed
PR awaits delivery and is reported as awaiting delivery, not as stale.

The compatibility overview aggregates status/topology, controller and provider sessions,
Herdr attach state, gates, findings, per-packet attempt history with the
outcome each seat landed, artifacts, interventions, roster revisions, per-seat priced usage,
and events. The MCP `overview` tool returns the identical structured
projection and renders it through `ui://forged/overview.html`.

## Bounded work history

`work history` projects durable cross-run throughput, rework, settlement, and
spend without consulting Beads, the filesystem, providers, GitHub, or live
services. The CLI and MCP tool return the same `forged.work-history/1`
contract:

```sh
forged work history
forged work history --from 2030-01-01T00:00:00Z \
  --to 2030-02-01T00:00:00Z --bucket day --group-by repository
forged work history --repo /absolute/path/to/repository --epic <epic-id>
forged work history --subject <run-or-epic-id> --limit 50 --cursor <cursor>
```

Windows are UTC and half-open (`from <= timestamp < to`). The default is the
30 days ending at the response's `asOf`; explicit windows are capped at 366
days and 400 closed hour/day/week buckets. Repository, epic, and subject
filters are exact canonical identifiers, never display-title guesses. Subject
pagination uses an opaque request-bound cursor. Grouping is closed to `none`,
`repository`, `epic`, `stage`, and `provider`; at most 50 series are returned,
with overflow combined into an explicit `other` series and missing dimensions
retained as `unknown`.

Each call reads one SQLite snapshot and returns canonical nested
`WorkIdentityV1` values. Attempt ordinals include earlier durable attempts, so
repeat attempts and rework stay correct when the first attempt predates the
window. Rates carry their denominator and are null when that denominator is
zero. Spend totals preserve every raw usage row: known cost is summed by its
recorded `billed` or `imputed_api_rate` provenance, while unknown cost remains
null and contributes to `rowsMissingCost`. Live plans are intentionally
excluded until they have a durable identity.

That compatibility MCP App draws one projection five ways, and never invents a state the
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

## Forge plugin convergence — 2026-08-14

The current Forge tree now carries the six lead-agent capabilities in
`plugins/forged` with Claude and Codex manifests over one shared tree. The
plugin writes complete native Bead fields and parent links, then invokes the
typed commands above; it does not carry the removed execution Workflow/watch
stack. Smithy Anvil 0.3.1 is archival migration input only.

Normal validation is noninteractive and separate from installation:
`scripts/validate-plugin.sh` checks manifests, marketplaces, version parity,
skill contracts, bootstrap syntax, and absence of legacy execution paths; the
`plugin` CI workflow runs that validator independently of Rust CI. The next
operational action after merge and release is to install the first Forge
version containing this marketplace and use `/forged:plan` →
`/forged:critique` → `/forged:adjudicate` → typed submission on real work. No
alternate execution path remains to reconcile.
