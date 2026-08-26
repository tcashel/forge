---
name: setup
description: "Establish and verify operator-scoped Beads and Forged state for the Claude, Codex, and Pi Forge package without imposing files, hooks, or settings on a target repository. Use for first-time configuration, environment diagnosis, /forged:setup, or Pi /skill:setup."
---

# /forged:setup

Configure the operator environment shared by lead agents and Forged. Setup is
non-invasive: all durable state lives under `ANVIL_HOME` and `BEADS_DIR`, while
target repositories are identified by native `metadata.repository`. Pi package
installation provides only skills, extensions, and tools; it never installs the
Forged binary.

## Boundaries

- Default `ANVIL_HOME` is `$HOME/.anvil`.
- Default `BEADS_DIR` is `$ANVIL_HOME/beads`; an existing override wins.
- Beads must report semver `>=1.2.1`; behavioral and schema probes remain the
  compatibility authority.
- Setup and the bundled bootstrap never install or upgrade `bd`.
- Never initialize Beads from a target checkout or add `.beads`, hooks, agent
  files, settings, or workflow files there.
- Never install or modify shell profiles without explicit operator consent.
- Setup validates local tools and configuration only. It does not install the
  Forged binary, create work, route work, start a run, or contact a separate
  issue tracker.
- Rolling execution requires a dedicated read-only `assessment` roster role;
  its selected provider/model must be independent of every critique candidate.

## Locate this plugin portably

Resolve the current skill's plugin root through the host's skill-relative
resource mechanism. Do not hard-code a Claude cache, Codex cache, marketplace
checkout, or Smithy path. The shared bootstrap is:

```text
../../bootstrap/install-beads.sh
```

Resolve that path relative to this `SKILL.md`; it names
`<plugin-root>/bootstrap/install-beads.sh`. The same file is used by both host
manifests.

## Inspect before changing anything

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
export BEADS_DIR="${BEADS_DIR:-$ANVIL_HOME/beads}"
BD_REQUEST="${BD_BIN:-bd}"
case "$BD_REQUEST" in
  /*) export BD_BIN="$BD_REQUEST" ;;
  */*) echo 'BD_BIN must be absolute or a command on PATH' >&2; exit 1 ;;
  *) export BD_BIN="$(command -v "$BD_REQUEST" || true)" ;;
esac
printf 'ANVIL_HOME=%s\nBEADS_DIR=%s\nBD_BIN=%s\n' "$ANVIL_HOME" "$BEADS_DIR" "$BD_BIN"
test -n "$BD_BIN" && test -x "$BD_BIN"
"$BD_BIN" --version
command -v forged
forged --version
git status --short
```

Forged resolves `bd` from an explicit absolute config `bdPath`, then a nonempty
`BD_BIN`, then the bare `bd` command on `PATH`. Preserve an existing compatible binary
and healthy `BEADS_DIR`. If the operator store is missing, explain the exact
change, obtain consent, then run the bundled
`../../bootstrap/install-beads.sh`. The bootstrap honors the environment
variables, validates the existing `bd >=1.2.1`, initializes only the
out-of-repo operator store, and never installs or upgrades the binary.

## Validate Forged after consent

Before the first run, explain that these commands may create or migrate
`$ANVIL_HOME/state.db`; `forged doctor` also creates and removes an isolated
temporary Beads store. Obtain operator consent, then run:

```bash
forged doctor
forged definition validate
```

If initial Forged configuration is absent, inspect `forged init --help` and tell
the operator exactly what it will create under `ANVIL_HOME` before requesting
consent. Never infer permission from invoking this skill.

Migration: the Claude plugin manifest now registers the `forged mcp` server
itself. Operators with an existing user-scope entry migrate in this order:
first open a fresh session and confirm the plugin-mounted forged tools are
listed — the host skips the plugin registration silently, with no error, when
the bare `forged` command does not resolve on the host's own PATH — and only
after that proof run `claude mcp remove forged` once. Until then the two
registrations spawn the same binary and tool-name precedence is host-defined.
If the plugin mount never appears, keep the user-scope entry (restore it with
`claude mcp add forged -- <absolute path to forged> mcp`) and diagnose PATH
with the probes above.

Validate configured provider adapters and optional durable supervision with the
commands reported by `forged doctor`. Distinguish source/config evidence from a
live runtime proof. Do not install a provider, alter credentials, or launch a
test run without explicit authorization.

On macOS, the installed supervisor includes `$HOME/.local/bin` and
`$HOME/.cargo/bin` in its deterministic `PATH` when those directories exist,
ahead of the available system binary directories. The service manifest freezes
the absolute `BD_BIN` that setup resolved. After intentionally changing that
binary, reinstall the service configuration before relying on the new path.

## Prove zero repository imposition

Capture target `git status --short` before and after setup and compare them.
Confirm no repository-local Beads database, hook, policy file, instruction file,
or generated artifact appeared. Resolve the target's canonical root and explain
that new Beads records must store it in `metadata.repository`; the creation
command itself never routes to a repository.

Finish with exact detected versions, resolved operator paths, doctor and
definition results, adapter/supervision status, and repository cleanliness. Do
not claim live execution readiness when only configuration was inspected.
