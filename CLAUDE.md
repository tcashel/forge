# Notes for agents working in the forge repo

## What this repo is

**forged** — a provider-neutral Rust orchestrator (nine-crate Cargo
workspace, binary `forged`). The TypeScript cockpit that used to live here
was removed in the supersession recorded by
[ADR-0032](docs/adr/0032-forged-provider-neutral-rust-orchestrator.md); it
survives in git history only. If you find yourself looking for `bin/forge.ts`,
`src/`, or `bun run check`, you are working from stale context.

## Gates — run all of them before calling anything done

```bash
cargo fmt   --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
cargo build --workspace --locked
cargo nextest run --workspace
cargo nextest run -p forged --features failpoints
```

CI (`.github/workflows/rust.yml`) runs exactly these. The bd-gated tests use
only an explicit `FORGED_TEST_BD` binary reporting semver `>=1.2.1`; they do
not fall back to arbitrary host `PATH`. They SKIP loudly when none is supplied,
but FAIL, never skip, when the supplied binary is missing, older, malformed,
or fails the exercised JSON/behavior contracts, and when
`FORGED_REQUIRE_BD=1` declares an unsupplied bd a failed run. Future major
versions are intentionally exercised rather than rejected by a version pin.
The genuine lease-expiry case is `#[ignore]`d (5+ real minutes) — run it
deliberately with `FORGED_SLOW_TESTS=1 cargo test -p forged --features
failpoints -- --ignored --nocapture` when you touch lease code.

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
  kill → `bd reclaim` → successor. Never reorder it; never fire a GitHub
  effect from a path that has not joined the claim token in-transaction.
- **One live attempt per packet** (partial unique index) and packet stages
  settle via attempt rows fenced by claim tokens — not via operation rows.
- **Operations**: UNIQUE(name, key), claim-before-side-effects, stored
  failures replayed verbatim, `effect_class` decides recovery
  (safe-retry | observe-only | human-ambiguous). Transport failures are
  NEVER stored as terminal — bounded retry with persisted budget.
- **Two lease identities, deliberately different.** The bd lease holder
  (`run_holder`) uses a fixed `0` pid segment so every process derives the
  identical string; the per-attempt `session_claimant` carries a real
  provider and real pid because it is STORED on the attempt row, never
  re-derived. Do not "fix" either in the other's direction — see the doc
  comments in `crates/forged/src/core/mod.rs`.
- **Canonical JSON** in the operation envelope: sorted keys, duplicate keys
  and non-integer numbers rejected at parse. No SQLite transaction held
  across an `.await` (the ledger sits behind a blocking actor).
- **forged never uses `bd update --force`**, never bare-releases a merge
  slot (always `--holder`), and never auto-reaps a slot holder it did not
  record.

## Operator scope — nothing in-repo

All runtime state is operator-scoped: ledger at `~/.anvil/state.db`, run
artifacts under `~/.anvil/runs/`, beads in `$BEADS_DIR`. Never commit any of
it. Tests write only under `CARGO_TARGET_TMPDIR` scratch dirs; bd-gated
tests bind `HomeBeadsGuard` FIRST (a leaked machine-global `~/.beads` from a
scratch run is a test failure). Never run package managers (`brew`, `cargo
install` into PATH, etc.) from an agent — the operator supplies the compatible
bd binary explicitly.

## Conventions

Conventional commits, lowercase, ≤ 70 chars. PRs target `main`; only the
operator merges to `main`. Match the existing comment density — doc comments
in this codebase state *contracts and invariants*, not narration.
