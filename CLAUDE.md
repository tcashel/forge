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
cargo test  --workspace
cargo test -p forged --features failpoints
```

CI (`.github/workflows/rust.yml`) runs exactly these. The bd-gated tests
require a sandboxed **bd 1.2.1** binary and SKIP loudly without one; the
genuine lease-expiry case is `#[ignore]`d (5+ real minutes) — run it
deliberately with `FORGED_SLOW_TESTS=1 cargo test -p forged --features
failpoints -- --ignored --nocapture` when you touch lease code.

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
install` into PATH, etc.) from an agent — the live bd binary is pinned by
the operator.

## License boundary (hard exclusion)

This repo is MIT + OpenAI/Anthropic rider (see LICENSE). The
Dicklesworthstone portfolio (`beads_rust`, `fastmcp_rust`, `frankenterm`,
`asupersync`) carries a rider that defines restricted *use* to include
**analyzing** the code: do not read, clone, vendor, or derive from those
repositories in any agent session here. beads itself (gastownhall/beads, MIT)
and rmcp (the official MCP Rust SDK) are the sanctioned dependencies.

## Conventions

Conventional commits, lowercase, ≤ 70 chars. PRs target `main`; only the
operator merges to `main`. Match the existing comment density — doc comments
in this codebase state *contracts and invariants*, not narration.
