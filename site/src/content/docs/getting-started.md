---
title: Getting started
description: Install Forge, connect your lead agent, and prepare a repository for its first approved run.
---

Set up Forge on the machine where your coding agents will run. This guide gets
you to a validated configuration and a durable plan; [Run an epic](/forge/guides/run-an-epic/)
covers the handoff to execution.

## Prerequisites

You need:

- **macOS or GNU/Linux:** prebuilt archives support x86_64 and arm64. Linux
  requires glibc 2.35 or newer; musl/Alpine has no prebuilt archive.
- **Git and authenticated GitHub CLI:** `git` and `gh` must be available to the
  process that launches Forge.
- **Your provider CLIs and accounts:** the default roster uses Claude Code and
  Codex. Pi is available through an opt-in roster.
- **A repository with working build and test commands:** configure its checks
  before giving Forge unattended work.

Forge is pre-1.0 software for experienced engineers who trust their headless
agents. Agents execute commands with your local user privileges in task
worktrees, with permission prompts disabled. Read the
[security model](https://github.com/tcashel/forge/blob/main/SECURITY.md) and review
the repository and specification you give them.

Beads is **not required for new work**. The optional legacy import is qualified
with exact `bd 1.2.1`; upstream `bd 1.2.2` is unsupported for that import.

## 1. Install the release

The release installer verifies the platform archive against its SHA-256
manifest and installs into your user-owned `~/.local` prefix:

```sh
curl -fsSL https://github.com/tcashel/forge/releases/latest/download/install.sh | sh
```

The CLI goes to `~/.local/bin/forged`, and the plugin package goes to
`~/.local/share/forge`. Ensure `~/.local/bin` is on your `PATH`, then check:

```sh
forged --version
```

The installer does not use `sudo`, edit shell profiles, register plugins,
initialize operator state, or start services. See
[GitHub Releases](https://github.com/tcashel/forge/releases) for versioned assets
and release notes.

## 2. Connect your lead agent

Register the installed package in the host you use for planning.

### Claude Code

Run these commands in Claude Code, replacing `<HOME>` with your absolute home
directory:

```text
/plugin marketplace add <HOME>/.local/share/forge
/plugin install forged@forge
```

### Codex

```sh
codex plugin marketplace add "$HOME/.local/share/forge"
codex plugin add forged@forge
```

### Pi

```sh
pi install "$HOME/.local/share/forge"
```

Pi also provides the `/forge` terminal cockpit. Host registration and provider
execution are separate: installing the plugin does not install or authenticate
the provider CLIs. The [plugin guide](https://github.com/tcashel/forge/blob/main/plugins/forged/README.md)
has host-specific troubleshooting and an example Pi roster.

## 3. Set up operator state

Open a lead-agent session in your target repository. Run `/forged:setup` in
Claude Code or Codex, or `/skill:setup` in Pi.

Setup inspects the installed CLI and existing configuration, explains any
initialization it needs, and asks before creating or migrating operator state.
The default location is `~/.anvil`; it adds no store, hooks, or policy files to
the target repository.

For manual setup, these commands initialize and validate that operator state:

```sh
forged init
forged doctor
forged definition validate --repo "$PWD" \
  --profile standard --roster default
```

Run them from the repository root. Validation can create or migrate the ledger;
it does not launch a coding run. A successful configuration check also does
not prove that a selected model is reachable or suitable for your project.

## 4. Set the repository's checks

Use `/forged:configure` or edit `~/.anvil/config.yaml`. Select a roster you can
authenticate and set `gate_commands` to the actual checks for this project.
The built-in gate defaults are Rust workspace commands, so they need replacing
for other toolchains.

Keep quick checks that agents should run before committing in `seat_commands`.
Forge's controller runs the authoritative gate after implementation and fixes.
The [configuration reference](/forge/reference/configuration/) includes a
repository-specific example and explains how settings are frozen for a run.

## 5. Create the first plan

Ask your lead agent for a concrete outcome. For example:

```text
Plan this work as a rolling Forge epic: add a documented CSV export to the
existing reports page. Preserve the current report behavior. Critique the
plan and bring me the scope and acceptance decisions I need to approve.
```

The lead records the specification, dependencies, critique, and decisions in
Forge's work store. Keep the resulting epic ID, then inspect it:

```sh
forged explain --id "$EPIC_ID"
```

You have reached the first milestone when the configuration validates and the
epic's explanation records the intended specification and its lifecycle stage.
Resolve the critique and open questions until it is `adjudicated`. Planning
does not start execution: continue with [Run an epic](/forge/guides/run-an-epic/)
when you are ready to authorize the work.

## Keep the host available

Detached controllers can outlive the initiating agent session. The machine
must remain awake and available while controllers and provider agents work.
On macOS, an optional per-user supervisor can be installed after setup:

```sh
forged service install
forged service status
```

Managed service lifecycle commands are macOS-only. The CLI and detached
controllers support both macOS and Linux. After a CLI upgrade, reinstall the
managed service so it uses the new immutable binary generation.

## Uninstall

If you installed the macOS supervisor, remove it first with
`forged service uninstall`. Then remove installer-owned files:

```sh
curl -fsSL https://github.com/tcashel/forge/releases/latest/download/uninstall.sh | sh
```

The uninstaller preserves operator state, configuration, credentials, run
history, and target repositories. Harness plugin registrations are separate.
