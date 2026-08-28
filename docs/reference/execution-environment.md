# Execution environment reference

How forged runs gate commands and what environment its child processes
see. These are runtime contracts, not decisions under debate; the source
files named below are the authority when this page and the code disagree.

## Gate execution contract

Source: `crates/forged-gate/src/runner.rs`.

- Each gate command runs as `sh -c <command>` — one shell per command.
  Shell semantics apply: pipes, `&&`, globs, `$VAR` expansion, and
  `ENV=value` prefixes all work. `sh` is resolved through `PATH`, not an
  absolute path, and is never bash.
- Commands run sequentially, in authored order, with no parallelism. A
  failure does not skip later commands: every command runs to completion
  and the gate result reports all of them.
- Each command gets its own process group. On timeout the whole group is
  SIGKILLed. The runner is Unix-only by design.
- The per-command deadline (default 900s) starts before spawn and covers
  shell reap plus draining both output streams.
- stdin is `/dev/null`. stdout/stderr stream to
  `<artifacts_dir>/gate-<n>-stdout.log` / `-stderr.log`; the gate result
  embeds a bounded preview tail (default 4000 bytes) of each.
- The working directory must be absolute with no `..` components. An
  empty command list is refused — a gate never passes vacuously.
- Authoring-side validation only rejects empty/whitespace commands
  (`crates/forged-types/src/contract.rs`); everything else is the
  shell's problem at run time.
- Before spawn, the runner removes both the controller-identity variables
  and the operator-state variables (`ANVIL_HOME`, `FORGED_CONFIG`,
  `BEADS_DIR`). Repository gates still inherit ordinary host and toolchain
  environment such as `PATH` and `HOME`.
- A `gate/<n>` entry in a run's settled operations means the gate was
  attempted, not that it passed. Pass/fail lives in the work detail's
  gate state.

## Environment contracts

Four distinct mechanisms govern what a child process inherits. None of
them is a general allowlist rebuild; know which one applies.

### 1. `CONTROLLER_ENV` — the identity strip

Source: `crates/forged-types/src/controller_env.rs`.

Five variables (`FORGED_CONTROLLER_PID_PATH`, `_LSTART_PATH`, `_SCOPE`,
`_ID`, `_GENERATION`) mark a process as a controller. Every child forged
spawns from a controller context has these removed, because a child that
inherits them is indistinguishable from the controller itself — a
repository's own test suite would observe an ownership claim it never
made. The strip is enforced at exactly two spawn points: the gate runner
(`forged-gate/src/runner.rs`) and the provider stream
(`forged-provider/src/stream.rs`). Extend the shared list, never a local
copy.

### 2. `OPERATOR_STATE_ENV` — the gate-only state strip

Source: `crates/forged-types/src/controller_env.rs`.

Three variables (`ANVIL_HOME`, `FORGED_CONFIG`, `BEADS_DIR`) route forged's
operator-scoped config and state. Gate commands are repository-owned code and
must not run against that state, so the gate runner removes the shared list in
a second, separate loop. Provider children are forged-owned agents and retain
these variables deliberately. This is a denylist strip, not `env_clear()`;
gates continue to inherit `PATH`, `HOME`, and the rest of the launching
environment.

### 3. Controller launch — an additive overlay, not a rebuild

Source: `crates/forged/src/core/handoff.rs` (spawn path).

The controller's launch env is a small overlay set on top of whatever
the host process inherits: `PATH` (only if present in the parent),
`ANVIL_HOME`, `FORGED_CONFIG`, `BEADS_DIR`, and the five
`FORGED_CONTROLLER_*` identity variables (plus failpoint plumbing under
the `failpoints` feature). The host does not call `env_clear()`: a
detached controller inherits the launching session's environment with
the overlay applied. Operator-visible consequence: an env var exported in the
shell that starts the daemon is visible to controllers. Provider children see
that environment minus controller identity; gate children see it minus both
controller identity and operator state.

### 4. The `bd` child — the only true `env_clear()` rebuild

Source: `crates/forged-beads/src/invoke.rs`.

The one-shot legacy-store import spawns `bd` with `env_clear()` and an
explicit allowlist (`PATH`, `HOME`, `TMPDIR`, `BEADS_DIR`,
`BD_JSON_ENVELOPE=1`, plus the remote-auth allowlist), because bd
resolves `$BEADS_DB` ahead of `$BEADS_DIR` and an inherited routing
variable silently redirects the store. This mechanism leaves with
`forged-beads` when the last legacy store is imported; after that, no
process forged spawns rebuilds its environment from scratch.
