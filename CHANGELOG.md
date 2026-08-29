# Changelog

This file records user-visible changes to Forge.

## [Unreleased]

## [0.6.3] - 2026-08-29

The affordance and query release (epic ore-063, PRs #213-#226): the
surface learns to explain itself, refusals learn to teach their
recovery, the work store gains its evidence and query layers, and the
whole operation surface is frozen under a generated manifest.

### Added

- `forged explain --id <anything>`: one kind-blind read resolving work
  items, runs, epics, attempts, and attention ids (normative
  precedence on exact collisions) and answering what / how / next —
  identity and lifecycle position, the execution-health verdict, and
  typed next actions.
- Typed next actions on `run status`, `work show`, and attention
  items, and a structured `forged.remedy/1` on refusals: attention
  refusals surface their stored recommended action, the stale-submit
  conflict advises keyless resubmission, `epic abandon` names its
  pause-first prerequisite, and admission defers name the exact
  failing fields. Actions may carry declared placeholders (JSON null)
  with the precondition in `reason`; every advertised action is
  honesty-tested — the test binds placeholders and executes the verb.
- `work note add` / `work note list`: an append-only annotation
  surface (comment / critique / recommendation / approval) beside the
  spec, never part of it — notes mint no revisions and stay outside
  the frozen-digest and drift fences. Recommendation and approval
  payloads are schema-validated wire contracts
  (`forged.spec-recommendations/1`, `forged.execution-approval/1`);
  the skills' critique-adjudicate-approve flows write through them.
- `work promote`: atomic stub promotion (spec revision + open status
  + event in one fenced operation under revision CAS); `work update
  --priority`: CAS-fenced priority that never mints a revision —
  closing the class where a priority-less item stalled admission
  undetected.
- `run adjudicate-settlement` gains the lead-finish case: a run
  stopped by review-budget exhaustion upgrades to landed with
  delivery PR/sha, actor, and rationale — admissible only through
  the adjudication-authority ledger door; plain `run stop` still
  refuses the transition.
- Keyset cursors on `work ready` (opaque token, existing order,
  composing with filters); the repository identity is a real indexed
  generated column; plan hydration collapses to one transaction,
  replacing two ledger round-trips per item.
- `docs/reference/operation-surface.{json,md}`: the generated
  manifest of all 69 operations — CLI verb, availability, fence
  class, key policy — enforced by a CI drift test; the parity suite
  and skill-verb validation consume it, so surface and skills can no
  longer diverge silently.

### Changed

- MCP failures set `isError` (envelope unchanged in content);
  `packet_show`, `gate_run`, and `worktree_retire` are exposed over
  MCP; the two deliberately unfenced writes route through an honestly
  named wrapper with a source-audit test pinning the tenant list.
- `run_status` projections read their direct sources: semantic stage
  ids for adaptive packets, terminal-only deadline-kill counts, gate
  state from the newest gate event.
- Provider transport classification takes operator-extensible
  `transportPatterns` in config.yaml (global and per-provider,
  extending the built-ins) — corpus verification found no reliable
  structured provider failure fields, so the substring lists remain
  the mechanism, now a config edit instead of a release.

### Fixed

- The `recoverable` flag tells the truth at the machine edges:
  gh/git/gate/provider failures classify by evidence (context-guarded
  status parsing, conservative transport signatures, transient IO
  kinds), with deterministic refusals and unknown signatures staying
  nonrecoverable. The supervisor halt gate is unchanged.
- A cross-epoch pause-key replay: abandoning a paused epic could make
  the next epoch's pause replay the old operation. Control keys still
  count the full stream; same-kind idempotency is now scoped to the
  current epoch and keys stay monotonic across abandon boundaries.
- Ledger indexes for the ready frontier and operation-state reads
  (plan-pinned), and the migration presence test now covers the
  work-store tables.

## [0.6.2] - 2026-08-29

The pile-1 core-fix release: dogfood-driven fixes from the v0.6.0/0.6.1
operating period (epic ore-062, PRs #200-#211). No wire or stored-shape
changes; every projection addition is additive.

### Added

- `run status` reports `currentStage`, `gateState` (passed/failed once a
  gate attempt exists — the disambiguation for settled gate operations),
  `startedAt`, and `deadlineKills`; work detail carries the same
  deadline-kill count, all projected from stored revoke evidence.
- `work ready` and `work list` take composable exact filters (`--repo`,
  `--status`, `--assignee`) executed in SQL, mirrored by the MCP params.
- `work create` / `work update` accept `--description-file`,
  `--acceptance-file`, `--design-file`, and `--notes-file` — fail-closed,
  mutually exclusive with their inline twins — so spec bodies never
  transit shell quoting.
- Model values accept bracketed suffixes (for example
  `claude-sonnet-4[1m]`) with one shared charset for authoring and the
  provider fence; bullet-led spec values parse in both flag forms.
- `service install` warns when the same-source install would shadow a
  newer forged already on the canonical path.

### Changed

- `work ready` returns bounded summary rows by default (limit 100, max
  500, honest shown/total counts); `--full` restores complete snapshots.
- Plugin skills are rewritten for the ledger-native work store:
  fail-closed file-based plan choreography, repository-scoped bounded
  ready frontier, a critique-disposition gate before dispatch, the
  runtime config fallback order, and typed `BEADS_CONTENTION` recovery.
- The bd-era "bead" vocabulary renames to work-store nouns across code,
  CLI (`run start --work`), HTML, and docs. Every wire contract — error
  codes, persisted JSON keys and operation params, SQLite schema, stored
  enum strings, template variables — stays byte-identical.

### Fixed

- Pre-identity controller deaths no longer burn the whole restart
  budget in milliseconds: the supervisor fences a terminal on the
  desired row's own controller generation before controller identity
  exists, and halts only on deterministic refusal codes
  (`INVALID_REQUEST` / `SPEC_DRIFT`) — transport and GitHub failures
  ride bounded backoff. Host session loss converts as recoverable, and
  explicit resubmission of an exhausted subject is admitted and
  advances past the dead generation.
- Gate children run hermetically: operator-state environment
  (`ANVIL_HOME`, `FORGED_CONFIG`, `BEADS_DIR`) is stripped and
  `ANVIL_HOME` re-pointed at per-run scratch, so gates can never read
  or write live operator state.
- The GitHub host is derived from the checkout's origin remote (https
  authorities always pin `GH_HOST`; dotted ssh hosts pin; dotless ssh
  aliases never do), ending wrong-host draft PRs from checkouts on
  non-default hosts.

## [0.6.1] - 2026-08-28

### Fixed

- An epic that was abandoned and restarted while its base branch had not
  moved never finished integration setup: the fresh epoch re-cut the
  identical integration branch, the identical event was suppressed as a
  duplicate of the abandoned epoch's, and the controller spun at full CPU
  appending a request event every few milliseconds instead of proceeding.
  Each epoch now records its own integration event, an epic already stuck
  this way heals itself on the next tick after resuming, and a controller
  step that keeps repeating itself unchanged is polled at the normal wait
  cadence instead of spinning.

## [0.6.0] - 2026-08-28

The work graph moves into the Forge ledger (ADR-0034): work items,
dependencies, readiness, and leases now live in `~/.anvil/state.db`
alongside execution state, and nothing at runtime consults the external
`bd` (Beads) binary. An existing Beads store is imported automatically,
once, on the first daemon start after upgrading — with a pre-import
snapshot of `state.db` written to `~/.anvil/backups/` first. Beads
remains on disk as an archive; `bd` is only needed if a legacy store has
not yet been imported.

### Added

- Ledger-native work store: append-only, CAS-guarded spec revisions;
  custody and leases with a single reclaim door; the bd refusal
  vocabulary preserved verbatim.
- One-shot Beads import (`forged work import-beads` and automatic at
  first daemon start), with byte-fidelity verification and a durable
  completion marker.
- Typed work authoring and repair verbs: `work create / update / link /
  close / reopen / release / supersede / revert / show / ready`, on the
  CLI and as MCP tools, with strict input validation and derived
  idempotency keys that make keyless repetition safe.
- `epic abandon`: ends a wedged epic's epoch durably; a fresh
  `epic start` then opens a clean epoch — projections, setup, child
  generations, and recovery are all epoch-aware.
- Daily `state.db` snapshots (VACUUM INTO, pruned to seven) from the
  supervisor.
- A `work-store-integrity` doctor probe whose findings name their typed
  repair verb; all external doctor probes are bounded at ten seconds.

### Changed

- The lease guardian process is gone: work-lease renewal rides the
  attempt heartbeat, a refused renewal self-terminates the attempt and
  durably fails the packet, and only typed refusals revoke — transient
  ledger errors are never terminal.
- An ordinary run refuses to spawn a provider when its work lease is
  foreign or absent; internal planning and assurance runs claim no lease
  by design.
- The ready frontier claims only schedulable work: epics and imported
  no-diff types (chore, decision, milestone) are never claimed under the
  frontier holder.
- `work list` and `overview` fold abandon boundaries: an abandoned epic
  reports `stopped` with its reason; a restarted one reports the fresh
  epoch's geometry.
- Service install refuses when a legacy Beads store exists un-imported
  and no `bd` resolves; otherwise `bd` is optional and ambient `bd`
  drift never invalidates an installed service.

## [0.5.0] - 2026-08-26

This is the first distribution of the provider-neutral Rust system. The
historical TypeScript `v0.4.0` product has been replaced and is unsupported.

### Added

- Durable slice and epic execution that continues independently of the lead
  agent session and stops at a reviewed draft pull request.
- Rolling-wave epic planning that reassesses the remaining plan as integrated
  code changes, while preserving the operator's locked outcome and safety
  boundaries.
- Final integrated assurance over the exact epic branch before Forge declares
  the draft pull request ready for human review.
- One shared lead-agent plugin for Claude Code, Codex, and Pi, with planning,
  critique, adjudication, portfolio inspection, and explicit execution handoff.
- Versioned macOS and Linux release archives, checksum verification, and
  idempotent install and uninstall scripts.

### Changed

- Replaced the former TypeScript workflow product with the `forged` Rust
  execution kernel and operator-scoped state under `~/.anvil`.
- Made native Bead fields the editable specification and Beads dependencies the
  work graph; Forge no longer creates a parallel repository specification.
- Kept default-branch merge human-owned. Unattended work may prepare and review
  pull requests, but it does not merge them.
- Treats Beads as a host dependency with required behavior probes, without
  installing, upgrading, or downgrading it. Forge `v0.5.0` is release-qualified
  with exact `bd 1.2.1`; upstream `bd 1.2.2` lacks required commands and is
  unsupported. The macOS service freezes the absolute compatible binary
  selected at setup.

### Fixed

- Hardened controller recovery, provider deadlines, planning checkpoints, and
  cleanup so interrupted work either resumes safely or stops with explicit
  operator action required.

### Security

- Fenced claims, provider effects, GitHub publication, and recovery against
  stale or ambiguous execution identity.
- Made release installation verify SHA-256 checksums before replacing
  installer-owned files.
- Refuses non-normalized or root-equivalent install prefixes before touching a
  live path.

[Unreleased]: https://github.com/tcashel/forge/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/tcashel/forge/compare/v0.4.0...v0.5.0
