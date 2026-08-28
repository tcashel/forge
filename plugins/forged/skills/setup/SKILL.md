---
name: setup
description: "Establish and verify the operator-scoped Forged ledger, configuration, adapters, and optional supervision without imposing files, hooks, or settings on a target repository. Use for first-time configuration, environment diagnosis, /forged:setup, or Pi /skill:setup."
---

# /forged:setup

Lifecycle position: unverified operator environment → initialized and validated
Forged control plane. Next: `/forged:configure` when profile or roster choices
need changes, otherwise `/forged:plan`. Setup runs in the lead session and
requires consent before authoring operator state. Forged owns the ledger,
configuration validation, controllers, and later execution; setup never
creates work or launches a run.

All durable work lives in the Forged ledger under `ANVIL_HOME`. Target
repositories are associated by `metadata.repository` on work items, never by
state placed in a checkout. Pi package installation provides skills,
extensions, and tools; it does not install the Forged binary.

## Boundaries

- Default `ANVIL_HOME` is `$HOME/.anvil`.
- `forged init` creates `$ANVIL_HOME/runs`, the default authoring config,
  and the ledger schema.
- Setup never creates, updates, links, closes, or dispatches an ore.
- Never create a repository-local work store or add hooks, agent files,
  settings, workflow files, or generated artifacts to the target repository.
- Never install the Forged binary, modify shell profiles, install a provider,
  alter credentials, or change service state without explicit operator consent.
- Rolling execution requires a dedicated read-only `assessment` roster role;
  its selected provider/model must be independent of every critique candidate.

## Inspect before changing anything

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
printf 'ANVIL_HOME=%s\nTARGET_REPO=%s\n' "$ANVIL_HOME" "$TARGET_REPO"
command -v forged
forged --version
git status --short
test -f "$ANVIL_HOME/config.yaml" || test -f "$ANVIL_HOME/config.json"
test -f "$ANVIL_HOME/state.db"
```

These probes are read-only. Report missing paths or tools exactly; do not
silently initialize, install, migrate, or repair anything.

## Initialize and validate only after consent

Ordinary work/config probes such as `forged definition validate` and
`forged doctor` open the ledger and may apply a schema or legacy-state
migration before dispatch. Explain that boundary and obtain consent before the
first such command. If operator state is absent, explain that `forged init`
creates or migrates only paths under `ANVIL_HOME` and show the resolved path,
then run:

```bash
forged init
```

With initialized state, validate it after the same consent:

```bash
forged definition validate
forged doctor
```

Read back the returned paths and results. Do not infer permission from invoking
this skill. If initialization refuses because existing state is malformed,
report the refusal and preserve the files for operator adjudication.

Setup proves configuration shape and environment health, not that model,
effort, or pricing choices are well selected. Route those choices to
`../configure/SKILL.md`.

## Validate host registration and adapters

The Claude plugin manifest registers the `forged mcp` server. In a fresh
session, confirm plugin-mounted Forged tools are listed before removing any
older user-scope registration. If both registrations exist, tool precedence is
host-defined. If the plugin mount is absent, keep the user-scope registration
and diagnose whether the bare `forged` command resolves on the host's own
`PATH`.

Validate provider adapters and optional durable supervision using the exact
commands reported by `forged doctor`. Distinguish source/config evidence from
a live runtime proof. Do not launch a provider probe or test run without
explicit authorization.

Inspect optional supervision read-only:

```bash
forged service status
```

Service install, start, stop, restart, and uninstall are separate mutations and
need their own explicit authorization. The installed supervisor freezes the
operator-selected executable and deterministic environment; after an
intentional binary or configuration change, follow the service command's
reported reconciliation guidance before relying on it.

## Prove zero repository imposition

Capture `git status --short` before and after setup and compare them. Confirm
no work-store database, hook, policy file, instruction file, or generated
artifact appeared in the target repository. Resolve its canonical root and
explain that future `forged work create --repository "$TARGET_REPO"` stores
that value as `metadata.repository` in the ledger.

Finish with the exact detected version, resolved operator paths, initialization
state, doctor and definition results, adapter/supervision status, and repository
cleanliness. Do not claim live execution readiness when only configuration was
inspected.
