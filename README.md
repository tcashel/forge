# forge

> **forged** — a provider-neutral orchestrator for agent-driven software work.
> Work survives the death of any one agent, session, or provider.

forged is a Rust binary that owns *where* work runs and *what happened* —
stage cursor, attempts, operations, artifacts, usage — while delegating *who*
and *when* to [beads](https://github.com/gastownhall/beads) (`bd` ≥ 1.2.x,
whose native lease primitives carry claims, TTLs, heartbeats, and reclaims)
and keeping GitHub as the code truth. Any lead-agent harness can use the same
CLI or MCP contracts. `forged run submit` and `forged epic submit` detach a
durable controller (Herdr-backed when available), so the initiating session is
not the lifetime of the job.

The design requirement is durable **cross-provider continuation**: a slice
started by one provider's agent, killed mid-flight, is resumed by another
provider's agent through `forged claim-next` — reconcile, reclaim the lease,
continue — with no duplicate claims and no duplicate GitHub effects. That
property has a scripted falsifier (kill -9 mid-implement, resume from the
other CLI); v0 tags only when it passes.

## Organizing rule

- **bd owns WHO and WHEN** — readiness, lease claims, gates, waves.
- **forged owns WHERE and WHAT HAPPENED** — the SQLite ledger: runs, packets,
  attempts (claim-token fencing), operations (idempotency envelope), usage.
- **Herdr / plain processes are the execution vessel** behind a thin
  `SessionHost` trait; sentinel status files supply liveness.
- **GitHub is the code truth** — every external effect is fenced by confirmed
  process death, idempotency keys, and effect probes, in that order.

Write tiers: planners write bd directly; drivers write through forged;
workers never write bd.

## Workspace

| Crate | What it owns |
| --- | --- |
| `forged-types` | Frozen contracts: operation envelope (canonical JSON, 18-code closed error set), packet/result types |
| `forged-ledger` | SQLite ledger (WAL, `BEGIN IMMEDIATE`): runs, packets, attempts, operations, merge slots, events, usage |
| `forged-host` | `SessionHost` trait; process and Herdr backends |
| `forged-git` | Worktrees, gh wrapper with effect probes, merge guard |
| `forged-gate` | Quality-gate runner |
| `forged-beads` | bd lease wrapper: claim/heartbeat/scoped reclaim, TTL/3 guardian, contention classifier |
| `forged-provider` | Claude + Codex drivers; usage parsers golden-tested against real captures |
| `forged-proto` | The slice/v1 advance engine and the kill-confirmed reclaim saga |
| `forged` (bin) | clap CLI + rmcp MCP/App server over one shared core; detached slice/epic submission, reconnect overview, and session controls |

All operator state lives out-of-repo under `~/.anvil/` (ledger at
`~/.anvil/state.db`, run artifacts under `~/.anvil/runs/`). forged imposes
nothing on the repositories it targets.

## Build and test

```bash
cargo build --workspace --locked
cargo test  --workspace
cargo clippy --workspace --all-targets -- -D warnings
cargo fmt   --all -- --check
cargo test -p forged --features failpoints   # the nine-schedule kill matrix
```

The kill matrix proves crash-safety with failpoints at every SQLite↔bd
handoff and effect boundary — asserting final repo content and process
non-overlap, not ledger labels. A genuine bd lease-expiry case (waits out the
real 5-minute TTL) is `#[ignore]`d and run deliberately:
`FORGED_SLOW_TESTS=1 cargo test -p forged --features failpoints -- --ignored`.

## Status

The Rust product now owns adaptive execution packages, YAML profiles/rosters,
Claude and Codex provider adapters, Herdr supervision, durable epic waves,
detached handoff, and one CLI/MCP/MCP-App control plane. Smithy/Anvil 0.3 is the
thin planning client: it hands locked slices and epics to these typed
contracts instead of running Claude-specific execution Workflows.

History and rationale live in [`docs/adr/`](docs/adr/) — start at
[ADR-0032](docs/adr/0032-forged-provider-neutral-rust-orchestrator.md) and
[ADR-0033](docs/adr/0033-execution-package-ownership-boundary.md).

## License

MIT with the OpenAI/Anthropic rider — see [LICENSE](LICENSE).
