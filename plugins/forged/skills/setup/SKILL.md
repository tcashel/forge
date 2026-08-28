---
name: setup
description: "Establish and verify operator-scoped Forged ledger and configuration state for the Claude, Codex, and Pi Forge package without imposing files, hooks, or settings on a target repository. Use for first-time configuration, environment diagnosis, /forged:setup, or Pi /skill:setup."
---

# /forged:setup

Position: missing or unverified operator environment -> validated Forged
configuration and ledger. Next: `/forged:configure` to choose cognition, or
`/forged:plan` when the defaults are already suitable.

Boundary: setup runs in the lead session and may initialize operator-scoped
Forged state only with explicit consent. Forged owns provider execution only
after later dispatch; setup never creates work, starts a run, or mutates a
target repository.

## Boundaries

- Default `ANVIL_HOME` is `$HOME/.anvil`.
- Durable work items and execution evidence live in the Forged ledger at
  `$ANVIL_HOME/state.db` unless configuration selects another operator path.
- Config selection matches the runtime: an explicit `FORGED_CONFIG` wins;
  otherwise an existing `$ANVIL_HOME/config.yaml` wins, then the legacy
  `$ANVIL_HOME/config.json` fallback, then the absent-config default path is
  `$ANVIL_HOME/config.yaml`.
- Setup and this plugin never install or upgrade the `forged` binary.
- Never create a repository-local work store, hooks, agent files, settings, or
  workflow files.
- Never install or modify shell profiles without explicit operator consent.
- Setup validates local tools and configuration only. It does not create work,
  route work, start a run, or contact a separate issue tracker.
- Rolling execution requires a dedicated read-only `assessment` roster role;
  its selected provider/model must be independent of critique candidates.

## Inspect before changing anything

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
if [ -n "${FORGED_CONFIG:-}" ]; then
  CONFIG="$FORGED_CONFIG"
elif [ -e "$ANVIL_HOME/config.yaml" ]; then
  CONFIG="$ANVIL_HOME/config.yaml"
elif [ -e "$ANVIL_HOME/config.json" ]; then
  CONFIG="$ANVIL_HOME/config.json"
else
  CONFIG="$ANVIL_HOME/config.yaml"
fi
printf 'ANVIL_HOME=%s\nCONFIG=%s\n' "$ANVIL_HOME" "$CONFIG"
command -v forged
forged --version
git status --short
test -f "$CONFIG" && sed -n '1,240p' "$CONFIG"
```

Preserve an existing healthy operator state. If the binary is absent, report
that exact prerequisite and stop; package installation provides skills,
extensions, and tools, not the binary.

## Initialize or validate only after consent

If configuration or the ledger is absent, inspect `forged init --help`, explain
the exact files it will create or migrate under `ANVIL_HOME`, and obtain
operator consent before running `forged init`. Never infer consent from
invoking this skill.

Before validation, explain that these commands may create or migrate
`$ANVIL_HOME/state.db`, then obtain consent:

```bash
forged doctor
forged definition validate
```

Setup proves configuration shape, not that every provider/model is well chosen
or reachable. Model, effort, gateway name, and pricing decisions belong to
`../configure/SKILL.md`. Validate provider adapters and optional durable
supervision with the commands reported by doctor. Distinguish configuration
evidence from a live run; do not install a provider, alter credentials, or
launch a test run without explicit authorization.

## Host registration migration

The Claude manifest registers the `forged mcp` server. Operators with an older
user-scope entry migrate in this order: open a fresh session and confirm the
plugin-mounted tools are listed; only after that proof run
`claude mcp remove forged` once. The host skips plugin registration silently
when bare `forged` is absent from its own `PATH`.

Until the plugin mount is proven, keep the user-scope entry. If needed, restore
it with `claude mcp add forged -- <absolute path to forged> mcp` and diagnose
`PATH` using the read-only probes above.

On macOS, the installed supervisor includes `$HOME/.local/bin` and
`$HOME/.cargo/bin` in deterministic `PATH` when those directories exist. After
intentionally changing the executable path, reinstall service configuration
only with explicit authorization before relying on it.

## Prove zero repository imposition

Capture target `git status --short` before and after setup and compare them.
Confirm no repository-local store, hook, policy, instruction file, or generated
artifact appeared. Resolve the target's canonical root and explain that new
work items store it in `metadata.repository` through `forged work create`.

Finish with detected versions, resolved operator paths, doctor and definition
results, adapter/supervision status, and repository cleanliness. Do not claim
live execution readiness when only configuration was inspected.

## Never

- Do not create work items, dispatch execution, or mutate the target repository.
- Do not install providers, rewrite credentials, or change shell profiles
  without explicit authority.
- Do not claim provider reachability from configuration validation alone.
