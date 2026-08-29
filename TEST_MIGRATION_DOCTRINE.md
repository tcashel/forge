# Ingot P2 test-migration doctrine

Context: forged's work graph moved from the external `bd` CLI (a shell shim in
tests) into ledger-native SQLite tables (`work_items`, append-only
`work_revisions`, `work_deps`, `work_leases` in the same state.db as runs).
The runtime no longer invokes bd for work state. TestEnv helpers were
rewritten to shape the LEDGER (`ensure_work_item`, `set_work_field`,
`seed_epic`, `seed_frontier`, `set_assignee`, `set_lease_unexpired`,
`work_revision`, `assignee` — see crates/forged/tests/support/mod.rs). Tests
fail or hang for the reasons below. For each failing test, classify and give
a concrete edit plan (exact code to change). NEVER weaken a production
invariant to make a test pass.

## Semantics that CHANGED deliberately (tests must follow)

1. **Revisions are integers** minted ONLY by spec-field writes
   (title/description/acceptance/design/notes). Status, custody, lease,
   priority, metadata churn NEVER move the revision. Tests asserting
   "revision moved on claim/status change" are asserting a bd wart the
   design removed — rework them to assert the revision did NOT move, or
   drop the assertion. `env.work_revision()` now returns the integer as a
   string. Pinning an exact revision value (`set_work_field(_, "revision",
   _)`) is a no-op; `null_revision_after_next_show` is inert (bd wire quirk
   with no analogue — tests about it should be retired or repurposed to
   assert the ledger read always carries a revision).
2. **No transport failures / outages.** The store is in-process.
   `set_bd_show_unreachable` / `set_bd_list_unreachable` /
   `set_bd_spec_show_unreachable` are inert. Tests proving graceful bd-outage
   degradation (fail-soft "unknown" titles, transport retry budgets charged,
   outage-then-recovery) describe a failure mode that no longer exists:
   RETIRE the outage half; keep/strengthen any half asserting the healthy
   path. A test named "...when work is unavailable" should become
   "...answers from the store" or be deleted with a note.
3. **Claims are transactional.** No `bd.claim.*`/`bd.reclaim.*` failpoints —
   they are `work.claim.before/after`, `work.reclaim.before/after`.
   `bd_calls()` (the shim call log) is empty for work operations — assertions
   on bd argv must be dropped or replaced by ledger-state/event assertions
   (`work.updated`, `work.lease.reclaimed`, `work.settled.note` events).
4. **Settlement markers are events.** The bd comment marker became a
   `work.settled.note` event on the run (payload: workId, actor, marker,
   detail). `comment_present` probes became event scans. Tests asserting bd
   comment argv should assert the event instead.
5. **Planning apply** promotes the stub blocked→open, actor-guarded
   (if-assignee '' + if-status blocked) in ONE transaction; there is no
   read-back and no revision token on the wire. It mints exactly one
   revision (cause planning-apply).
6. **Refusal vocabulary preserved**: "issue not claimable: status <s>" for
   mechanism refusals; lease-held refusals are WorkLeaseHeld naming the
   holder; the closed-item settlement release still refuses with "refusing
   to reopen closed work item".
7. **seed_epic children**: readiness is now a query (open + unassigned + no
   open `blocks` edge + no lease). The old `ready: false` flag no longer
   withholds an open child from the frontier. A test relying on a child NOT
   being ready must make that true structurally: `set_work_field(child,
   "status", "blocked")` or add a blocks edge via `set_work_field(child,
   "dependencies", ...)` or assign custody.
8. **Lease races**: `set_successor_on_guard` (mid-CAS race injection) is
   inert; the transactional store cannot interleave there. Tests of that
   race should assert the new truth: the guarded verb refuses or succeeds
   atomically (construct the competing state BEFORE the call instead).
9. **Hangs**: poll helpers (`wait_for`, convergence loops) that spin on a
   condition that can no longer occur must have their conditions updated,
   not their timeouts extended.

## What must NOT change

- Production code (crates/*/src) — report a suspected production bug
  separately instead of editing it.
- The operator-adjudicated behaviors: blocked-residue retake, closed-work
  release refusal, anti-steal, frontier-holder identity chain.
- Tests that still pass.

## Output format (per test file)

For each failing test fn: `disposition: fix-seed | rework | retire`,
one-line why, and the exact edit (code snippet or precise instruction).
Retirements need a one-line justification tied to a doctrine point.
