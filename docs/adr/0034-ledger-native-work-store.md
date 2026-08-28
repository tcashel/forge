# ADR 0034 — The ledger owns the work graph; bd becomes the one-shot import source

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-08-28
**Related:** [`0032-forged-provider-neutral-rust-orchestrator`](./0032-forged-provider-neutral-rust-orchestrator.md), [`0033-execution-package-ownership-boundary`](./0033-execution-package-ownership-boundary.md)

## Context

ADR-0033 drew the ownership boundary "Beads owns work items, dependencies,
readiness, and leases." In practice that boundary put the most contended
state in forged's crash-safety story — custody, readiness, spec revisions,
lease expiry — behind an external child process with its own storage engine,
its own retry semantics, and its own failure vocabulary. The seam cost was
real and recurring: a guardian process existed solely to keep bd leases
alive; every claim, heartbeat, and release crossed a process boundary that
could fail independently of the transaction it fenced; the test suite
carried a bd shim whose semantics drifted from the pinned binary (the shim
ignored lease TTLs); and operators had to install and version-match a second
binary before forged could schedule anything.

Meanwhile every consumer of that boundary already lived on the forged
ledger — attempts, operations, events, settlement all commit through one
SQLite writer actor with one crash-recovery discipline.

## Decision

The work graph moves into the ledger. Migration 022 adds `work_items`,
append-only `work_revisions` (immutability trigger), `work_deps`, and
`work_leases` to `state.db`; `crates/forged-ledger/src/work.rs` and
`work_lease.rs` implement the verbs on the same writer actor the rest of
the ledger uses. `forged work import-beads` performs a one-shot,
byte-fidelity import of an operator's existing bd store (with an automatic
pre-import snapshot); `forged` auto-imports once at daemon start when the
work store is empty and a bd store is configured.

The `forged-beads` crate shrinks to that importer's reader — discovery
(`all_issue_ids`) and status-tolerant hydration (`all_issues_with_deps`) —
and is deleted outright once no operator store remains to import. Nothing
at runtime consults bd: no leases, no slots, no guardian, no doctor probes,
no write spine.

Contracts carried over rather than reinvented:

- **Refusal vocabulary is preserved verbatim** ("issue not claimable:
  status ...") because durable retry rows store failure text and replay it.
- **Custody (assignee) is the holder of record; the lease row adds
  expiry.** Reclaim remains the only door that moves custody off a holder.
- **Coordination churn never mints revisions.** Spec-field writes mint
  revision N+1 under a CAS on the caller's expected N; claims, heartbeats,
  releases, reclaims, and settlements do not touch revisions.
- **No dead states.** Typed repair verbs (`work
  reopen/release/revert/supersede`, `epic abandon`) cover every reachable
  state; abandon opens a new start epoch without replay-key collisions.

Lease renewal rides the attempt heartbeat: the controller renews its work
lease on the same beat that proves the attempt alive, and a refused renewal
self-terminates the attempt AND durably fails the packet — the guardian
process is gone.

## Consequences

- ADR-0033's ownership table changes in one row: **the ledger** owns work
  items, dependencies, readiness, and leases. Everything else stands.
- One binary, one store, one recovery discipline. Claims and settlements
  join ledger transactions instead of fencing across a process boundary.
- The bd shim test harness is retired; tests shape the ledger directly and
  assert the real lease semantics (unexpired leases refuse reclaim).
- Operators no longer install bd to run forged. The pinned bd 1.2.1
  remains a test-only artifact until the importer is deleted, exercised by
  the single bd-gated import round-trip test.
- The bd store left on disk after import is an archive, not a replica;
  post-import writes never flow back.
