---
name: setup
description: "Establish and verify operator-scoped Beads and Forged state for the dual-host Forge plugin without imposing files, hooks, or settings on a target repository. Use for first-time configuration, environment diagnosis, or /forged:setup."
---

# /forged:setup

Configure the operator environment shared by lead agents and Forged. Setup is
non-invasive: all durable state lives under `ANVIL_HOME` and `BEADS_DIR`, while
target repositories are identified by native `metadata.repository`.

## Boundaries

- Default `ANVIL_HOME` is `$HOME/.anvil`.
- Default `BEADS_DIR` is `$ANVIL_HOME/beads`; an existing override wins.
- The supported Beads version is pinned by the bundled bootstrap.
- Never initialize Beads from a target checkout or add `.beads`, hooks, agent
  files, settings, or workflow files there.
- Never install or modify shell profiles without explicit operator consent.
- Setup validates local tools and configuration only. It does not create work,
  route work, start a run, or contact a separate issue tracker.

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
printf 'ANVIL_HOME=%s\nBEADS_DIR=%s\n' "$ANVIL_HOME" "$BEADS_DIR"
command -v bd
bd --version
command -v forged
forged --version
git status --short
```

If Beads is already pinned and `BEADS_DIR` is healthy, preserve it. If Beads or
the operator store is missing, explain the exact change, obtain consent, then
run the bundled `../../bootstrap/install-beads.sh`. The bootstrap honors both
environment variables, initializes only the out-of-repo operator store, and
fails closed on a version mismatch.

## Validate Forged

Run the installed CLI's current non-mutating probes:

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

## Prove zero repository imposition

Capture target `git status --short` before and after setup and compare them.
Confirm no repository-local Beads database, hook, policy file, instruction file,
or generated artifact appeared. Resolve the target's canonical root and explain
that new Beads records must store it in `metadata.repository`; the creation
command itself never routes to a repository.

Finish with exact detected versions, resolved operator paths, doctor and
definition results, adapter/supervision status, and repository cleanliness. Do
not claim live execution readiness when only configuration was inspected.
