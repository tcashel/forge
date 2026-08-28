# Notes for agents working in the forge repo

## What this repo is

**forged** — a provider-neutral Rust orchestrator (nine-crate Cargo
workspace, binary `forged`). The TypeScript cockpit that used to live here
was removed in the supersession recorded by
[ADR-0032](docs/adr/0032-forged-provider-neutral-rust-orchestrator.md); it
survives in git history only. The work graph and leases live in the ledger
itself ([ADR-0034](docs/adr/0034-ledger-native-work-store.md)); bd (beads)
is only the one-shot legacy import source. If you find yourself looking for
`bin/forge.ts`, `src/`, `bun run check`, or runtime bd calls, you are
working from stale context.

## Gates — run all of them before calling anything done

```bash
cargo fmt   --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo build --workspace --locked
cargo nextest run --workspace
cargo nextest run -p forged --features failpoints
```

CI (`.github/workflows/rust.yml`) runs exactly these. The one bd-gated test
(the import round-trip in `crates/forged/tests/work_import.rs`) uses only an
explicit `FORGED_TEST_BD` binary reporting semver `>=1.2.1`; it does not
fall back to arbitrary host `PATH`. It SKIPs loudly when none is supplied,
but FAILs, never skips, when the supplied binary is missing, older,
malformed, or fails the exercised JSON contracts, and when
`FORGED_REQUIRE_BD=1` declares an unsupplied bd a failed run. Future major
versions are intentionally exercised rather than rejected by a version pin.

The two `cargo nextest run` gates need `cargo-nextest` on `PATH` (a
development tool, not a Cargo dependency — cargo cannot declare binary tool
deps); the operator installs it, never an agent. Its config at
`.config/nextest.toml` carries the serialization contract for
`crates/forged/tests/supervise.rs`. Under any other runner — plain
`cargo test` included — those cases SKIP loudly unless `RUST_TEST_THREADS=1`
marks a deliberately serial run. If you see those skips, switch runners; never
reintroduce an in-process lock to chase them.

## Invariants that must never be broken

These carry the architecture; breaking one invalidates the crash-safety
story even if every test still passes:

- **External effects are fenced by confirmed death, not token checks.**
  The reclaim saga is: attempt → REVOKING (durable) → verified process-group
  kill → work-lease reclaim → successor. Never reorder it; never fire a
  GitHub effect from a path that has not joined the claim token
  in-transaction.
- **One live attempt per packet** (partial unique index) and packet stages
  settle via attempt rows fenced by claim tokens — not via operation rows.
- **Operations**: UNIQUE(name, key), claim-before-side-effects, stored
  failures replayed verbatim, `effect_class` decides recovery
  (safe-retry | observe-only | human-ambiguous). Transport failures are
  NEVER stored as terminal — bounded retry with persisted budget.
- **Work revisions are append-only and CAS-guarded.** A spec write mints
  revision N+1 iff the current revision is the caller's expected N; frozen
  revision rows are never rewritten (immutability trigger). Coordination
  churn — claims, heartbeats, releases, reclaims, status settles — NEVER
  mints a revision; only spec-field writes do.
- **Custody and leases are distinct rows with one door.** The assignee is
  custody of record; the lease row adds expiry. Reclaim is the only path
  that moves custody off a holder (anti-steal); refusal vocabulary is the
  bd-era strings verbatim ("issue not claimable: status ...") because
  durable retry rows store them.
- **No dead states.** Every reachable work/epic state has a typed repair
  verb (`work reopen/release/revert/supersede`, `epic abandon`); epic
  projections and start keys are scoped to the epoch after the last
  `forged.epic.abandoned` event, while operation control keys count the
  FULL stream so replay keys never collide across epochs.
- **Canonical JSON** in the operation envelope: sorted keys, duplicate keys
  and non-integer numbers rejected at parse. No SQLite transaction held
  across an `.await` (the ledger sits behind a blocking actor).

## Operator scope — nothing in-repo

All runtime state is operator-scoped: ledger at `~/.anvil/state.db`, run
artifacts under `~/.anvil/runs/`, snapshots under `~/.anvil/backups/`.
Never commit any of it. Tests write only under `CARGO_TARGET_TMPDIR`
scratch dirs; the bd-gated import test binds `HomeBeadsGuard` FIRST (a
leaked machine-global `~/.beads` from a scratch run is a test failure).
Never run package managers (`brew`, `cargo install` into PATH, etc.) from
an agent — the operator supplies the compatible bd binary explicitly.

## Conventions

Conventional commits, lowercase, ≤ 70 chars. PRs target `main`; only the
operator merges to `main`. Match the existing comment density — doc comments
in this codebase state *contracts and invariants*, not narration.
