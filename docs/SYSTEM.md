# Forge as a system — the tower

This is the map. Read it before any other document in this repository.
It states what each layer is, what it promises, where its truth lives,
and which surface an agent reads or writes it through. Lines marked
**(ADR-0036)** describe the target shape decided in
[ADR-0036](adr/0036-agent-is-the-operator-one-id-one-lifecycle-one-next.md)
and not yet fully on `main`; everything else describes the shipped
system as of v0.7.0.

## One paragraph

Forge is a factory with a ledger at its heart. Work items (the ore)
enter as complete specifications. One scheduler — the supervisor's ore
pass — dispatches ready ore to seats (coding agents) working in isolated
worktrees. A closed protocol assures each slice: gate, independent
review, bounded remediation, draft pull request. Landed slices merge
into their group's integration branch; a group ends at one draft PR to
the default branch that a human merges. Every request, effect, attempt,
and settlement is an append-only fact; every external effect is fenced
by confirmed process death and an idempotent operation identity. Three
agents touch it — the **lead** (plans, decides, drives), the **seats**
(implement, review, fix, plan), and a **narrator** (writes PR bodies
from evidence) — and the human sits only at decision points.

## Who is the operator

The operator of record is an agent. The human delegates authority to a
lead agent in a Claude Code, Codex, or Pi session; the lead reads
operation responses and acts through typed verbs. Every surface is
therefore designed for a reader with bounded context, no memory of the
previous session, and no ability to look at a screen: **legibility
lives in responses, not in documentation.** A fresh-context agent must
be able to drive an epic from the responses alone. When a rule about
process has to be remembered by the agent, the kernel is missing an
affordance.

## The tower

Each layer depends only on the layers below it. The invariant column
names what breaks the crash-safety story if violated (see `CLAUDE.md`).

### L0 — Facts

- **Nouns:** event, operation row, attempt row, revision row, usage row.
- **Promise:** append-only; canonical JSON; no SQLite transaction across
  an `.await`; one writer actor.
- **Truth:** `~/.anvil/state.db`.
- **Read:** `forged events`, `packet show`, `artifact verify`.
- **Write:** never directly. Every write above is a fact here.
- **Agent need:** forensics only. A driver should almost never read L0.

### L1 — Effects

- **Nouns:** operation (`UNIQUE(name, key)`), effect class
  (`safe-retry` | `observe-only` | `human-ambiguous`), claim token,
  confirmed death.
- **Promise:** claim before side effects; stored failures replay
  verbatim; transport failures are never terminal; an external effect
  fires only from a path that joined the claim token in-transaction;
  the reclaim saga is attempt → REVOKING → verified kill → lease reclaim
  → successor, never reordered.
- **Truth:** operation rows plus the `runs/<id>` controller files.
- **Read:** `run status` (`settledOperations`), `explain`.
- **Write:** `reconcile` (repairs a held operation lease), settlement
  verbs.
- **Agent need:** trust it. The only agent-facing fact is `reused:
  true` on a replayed response.

### L2 — Work

- **Nouns:** work item (`kind`: task | bug | feature | story | spike |
  chore | decision | milestone | epic), spec (`title`, `description`,
  `design`, `acceptanceCriteria`, `notes`), revision (append-only,
  CAS-guarded), edge (`parent-child` | `blocks` | `supersedes` |
  `related` | `discovered-from`), status (`open` | `blocked` |
  `in_progress` | `deferred` | `closed`), priority (0–4), assignee
  (custody) and lease (expiry), note (`comment` | `critique` |
  `recommendation` | `approval`; **(ADR-0036)** adds `adjudication`,
  `decision`, `retro`), `metadata.repository`.
- **Promise:** spec writes mint revision N+1 only when the caller's
  expected N is current; coordination churn never mints a revision;
  reclaim is the only door that moves custody; refusal strings are
  frozen; every reachable state has a typed repair verb.
- **Truth:** `work_items`, `work_revisions`, `work_deps`,
  `work_leases`, `work_notes`.
- **Read:** `work show --id`, `work ready --repo`, `work list`,
  `work map`, `work history`, `work note list`.
- **Write:** `work create | update | promote | link | close | reopen |
  release | supersede | revert | note add`; **(ADR-0036)** `work
  adjudicate` (spec revision plus typed dispositions in one fenced
  write, generalizing `promote`) and `work park`.
- **Agent need:** the spec is the *sole* instruction a seat receives.
  Anything a seat must know is in the four fields or it does not exist.

### L3 — Execution

- **Nouns:** run (one execution of a work item; `<id>` first,
  `<id>-rN` on retry), package (frozen profile + resolved roster +
  policy, hashed), packet (one stage of one run), attempt (one seat
  process on one packet, claim-token fenced), stage (`implement` |
  `gate` | `review-*` | `synthesis` | `fix` | epic-plan and
  epic-assurance stages), outcome (`clean` | `blocked` |
  `input-required` | `cancelled` | `superseded` | `landed`), delivery
  (`pr`, `sha`), policy revision (ADR-0035), roster revision.
- **Promise:** one live attempt per packet (partial unique index);
  stages settle through attempt rows, not operation rows; a completed
  packet is never reclaimed — retry mints a fresh run; the package is
  immutable and departures are append-only revisions at durable
  boundaries.
- **Truth:** `runs`, `run_definitions`, `packets`, `attempts`,
  `policy_revisions`, `roster_revisions`; artifacts under
  `~/.anvil/runs/<id>/`.
- **Read:** `run status --run`, `explain --id`, `session list | read |
  inventory`, `usage`.
- **Write:** `run start`, `run submit`, `run retry`, `run stop`,
  `run accept-risk`, `run adjudicate-settlement`, `run revise-roster`,
  `run revise-policy`; **(ADR-0036)** `run dispatch` (start + authorize
  + approval record in one fenced verb; `start`/`submit` move to the
  machine audience) and `run remediate --grant`.
- **Agent need:** one verdict, one stage, one next. Not seven state
  fields.

### L4 — Scheduling

- **Nouns:** desired row (the operator's authorization for a subject),
  admission (capacity, `repository_write_active`, reservations),
  supervisor tick, ore pass (the epic frontier reconciliation),
  controller (the detached process that drives one run), generation,
  restart budget.
- **Promise:** the frontier is the only scheduler; the ore pass claims
  an epic's desired row through the same lease the due loop uses, never
  reserves capacity for the epic, and dispatches children through the
  exact `run_start` operation identity; a controller is fenced by pid +
  start-time identity and killed only when that identity is confirmed.
- **Truth:** `desired_work`, admission tables, controller files.
- **Read:** `supervise --once` (its report), `service status`,
  `doctor`, the `health` block of `explain`.
- **Write:** `supervise`, `service *`, `epic pause | resume | abandon`.
- **Agent need:** none of these nouns in ordinary driving. They fold
  into `health.verdict` and `health.inputs`. **(ADR-0036)** raises
  implementation slots above one per repository behind one merge lock.

### L5 — Assurance

- **Nouns:** protocol (`slice/1`, `epic-plan/1`, `epic-assurance/1`),
  profile (seats and `fixRoundBudget`; `lean` | `standard` | `high`),
  roster (role → ordered provider candidates), seat (role: implementation
  | review.primary | review.secondary | review.tertiary | synthesis |
  remediation | assessment), gate (shell command in the worktree),
  finding (`severity`, `file`, `line`, `message`), verdict (`approve` |
  `requestChanges` | `block`), spec amendment, accepted risk.
- **Promise:** profiles name topology, rosters name cognition, policy
  names gates and budgets; the profile's round budget is the only
  review-loop bound; reviewers are read-only; the human owns the
  default-branch merge.
- **Truth:** frozen packages and the attempt results they produced.
- **Read:** `definition validate`, `run status` (`gateState`,
  findings), `review publish`.
- **Write:** `~/.anvil/config.yaml` (authoring), `run revise-*`.
- **Agent need:** **(ADR-0036)** a finish policy so a clean-enough
  result lands without a keystroke, and a decision instead of a stop
  when it does not.

### L6 — Attention and decisions

- **Nouns:** attention item (`condition`, `severity`, `owner`,
  `attentionId`, `occurrenceId`), classification (`decision` |
  `symptom`), recommended action, `nextActions`.
- **Promise:** one projector for every surface; decision conditions
  carry their verbs; a stale occurrence cannot dismiss a recurrence;
  acknowledgement is custody, resolution is only for adjudicable
  conditions; symptoms die with their subject.
- **Truth:** projected from L2–L5 facts plus attention custody events.
- **Read:** `attention list`, `operations overview`, `explain`.
- **Write:** `attention acknowledge | resolve | reopen`.
- **Agent need:** decisions first, symptoms hidden, every decision with
  exactly one `should`. **(ADR-0036)** `forged next` is this layer's
  driver surface.

### L7 — Lifecycle

- **Nouns:** stage (`drafted` → `critiqued` → `adjudicated` → `ready` →
  `dispatched` → `deciding` → `reviewed` → `landed` → `closed`; held:
  `blocked`, `parked`), decision record, override.
- **Promise (ADR-0036):** derived from typed notes bound to the spec
  revision; the kernel refuses to dispatch below `adjudicated`; a moved
  revision resets the stage; every stage move is a fact.
- **Today:** lives only in skill prose. See [`LIFECYCLE.md`](LIFECYCLE.md).
- **Read:** `work show`, `explain`, `next`.
- **Write:** `work note add --kind recommendation | adjudication |
  decision`, `work adjudicate`, `run dispatch`.

### L8 — Conversation

- **Nouns:** lead agent, skill, critic subagent, operator, board.
- **Promise:** the lead owns judgment; the plugin never becomes a state
  store; authority is monotonic (a read never becomes a write; a plan
  never becomes execution); Apps are views, never selectors.
- **Truth:** none. Everything durable is a ledger write.
- **Read/Write:** the skills in `plugins/forged/skills/*`.
- **Agent need:** thin skills. Position, verbs, judgment. No loops.

## Ids

- The work id is the only handle (`ore-070.4`). Caller-supplied,
  `ore-` prefixed for new items; imported `beads-*` ids are preserved.
- Executions reuse it: `ore-070.4` is the first run, `ore-070.4-r2`
  the first retry. Attempts are `ore-070.4/review-1/0`.
- `explain --id` resolves any of these without a kind. **(ADR-0036)**
  every read verb does; a subject kind is only a disambiguator.
- Attention ids and occurrence ids are content hashes; they are handles
  for custody verbs, never something to type from memory.

## Response anatomy

Every operation returns one envelope: `{ok, operationId, reused,
result, error}`. `reused: true` means the response was replayed from a
stored operation, not re-executed — read it before believing a start
"worked". A refusal carries `error.code`, `error.recoverable`, and
`error.detail.remedy` (`forged.remedy/1`: verb, args, reason).

**(ADR-0036)** every projection result carries, in this order:

```text
schema, capturedAt
subject   {id, kind, title, repository, revision}
lifecycle {stage, since, basis}
health    {verdict, inputs}
next      [{verb, args, reason, class: should | can | repair}]
…kind-specific bounded facts…
coverage  {shown, total, truncated, nextCursor?}
```

At most one `next` entry is `should`. Terminal subjects have none.
Placeholder args are JSON `null` with the precondition in `reason`.

## Vocabulary

Lead-facing nouns (the whole set an agent must hold):

> work item, spec, revision, edge, epic, run, retry, stage, seat,
> attempt, gate, review, finding, verdict, decision, attention,
> profile, roster, policy, repository, worktree, branch, PR, landed.

Internal nouns that projections fold into `health` and `lifecycle` and
that a driver never needs to type: desired row, controller, generation,
reservation, slot, occurrence, driver identity, epoch, wave (historical
streams only), custody, claim health.

Frozen wire keys that survive for compatibility and are shadowed by
work-vocabulary twins **(ADR-0036)**: `beadId`, `identity.bead`,
`evidence.beadId`, `sourceHealth.beads`, `BEADS_CONTENTION`,
`BEAD_LEASE_HELD`, `BEADS_ERROR`, the `bead` operation parameter. Read
the manifest's deprecation column; never rename a stored string.

## Where truth lives

| Question | Source | Verb |
| --- | --- | --- |
| What is the spec? | ledger work revision | `work show --id` |
| Is it ready? | ledger frontier (deps, questions, custody) | `work ready --repo` |
| Where is it in the lifecycle? | **(ADR-0036)** derived from typed notes | `explain --id`, `next` |
| Is it running, and where? | attempts + desired row + controller identity | `run status --run`, `explain --id` |
| What did the reviewers say? | attempt results | `run status`, `work detail` |
| Did the gate pass? | newest gate event | `run status` (`gateState`) |
| What is it costing? | usage rows keyed by attempt | `usage --run`, `work history` |
| Is the code merged? | GitHub | `delivery {pr, sha}` after `landed` |
| What needs me? | attention projection | `attention list --classification decision`, **(ADR-0036)** `next` |
| Why did it refuse? | `error.detail.remedy` | any verb |
| What happened, exactly? | events | `events --run --limit` |

## Payload budgets

A read must fit one tool result. Targets **(ADR-0036)**: `next` ≤ 4 KB
JSON at default limits; `explain`, `work show`, `run status` ≤ 8 KB;
list verbs return summary rows with `coverage` and a cursor; spec
bodies and event tails are opt-in (`--detail full`, `--limit`). Today
`operations overview` exceeds 800 KB on the operator store and is
unusable as a tool result; use `--group needs-me --limit 20` or
`attention list --classification decision` until `next` lands.

## Read next

- [`LIFECYCLE.md`](LIFECYCLE.md) — the one lifecycle, stage by stage,
  with the evidence that moves it and the verb that records it.
- [`DRIVING.md`](DRIVING.md) — the driver's runbook for an agent.
- [`reference/operation-surface.md`](reference/operation-surface.md) —
  the generated verb manifest (CLI, MCP, fence class, key policy).
- [`reference/execution-environment.md`](reference/execution-environment.md)
  — what gate and seat processes inherit.
- [`NEXT.md`](NEXT.md) — the operational guide and roadmap.
- ADRs 0032–0036 — the decisions, in order.
