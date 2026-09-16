---
title: Commands
description: The everyday Forge commands for setup, planning, inspection, execution, and recovery.
---

The executable is `forged`. Use `forged --help` and each command's `--help` for
the flags supported by your installed release. This page covers the everyday
operator surface; the [generated operation manifest](https://github.com/tcashel/forge/blob/main/docs/reference/operation-surface.md)
lists the complete CLI and MCP surface.

## Set up and validate

| Command | Purpose |
| --- | --- |
| `forged --version` | Show the installed CLI version. |
| `forged init` | Initialize operator configuration and state. |
| `forged doctor` | Diagnose local prerequisites, configuration, and supervision. |
| `forged definition validate --repo "$PWD"` | Resolve and validate this repository's profile, roster, and checks. |
| `forged service status` | Inspect the managed supervisor's state. |

Initialization and first-use validation may create or migrate state under
`ANVIL_HOME`. Managed service installation, start, stop, restart, and uninstall
are macOS-only. [Getting started](/forge/getting-started/) explains installation
and host registration.

## Read work and progress

```sh
forged next --repo "$PWD"
forged explain --id "$WORK_ID"
forged work show --id "$WORK_ID" --full
forged run status --run "$RUN_ID"
forged epic status --epic "$EPIC_ID"
forged wait --id "$WORK_ID" --until decision --timeout 240
```

`next` answers what needs attention. `explain` answers what one subject is and
which action follows. `wait` returns on a requested `decision`, `stage`, or
`terminal` condition, or at timeout.

Lead-facing reads use text in a terminal and JSON when piped. Request
`--text` or `--json` explicitly when you need a stable output format. Text
`work show` omits specification bodies unless `--full` is set.

## Plan and decide

These are durable writes. Lead-agent skills normally supply the structured
arguments and expected revisions for you.

| Command family | What it records |
| --- | --- |
| `work create`, `work update` | The specification and its revision. |
| `work link` | Parent-child relationships and dependencies. |
| `work note add` | A typed recommendation or other supported note. |
| `work adjudicate` | Dispositions and accepted specification changes together. |
| `work park`, `work reopen` | A decision to shelve work or return it to consideration. |
| `work close`, `work supersede` | Completion or replacement with a recorded reason. |

Read `explain` before acting. Editing a specification can reset its derived
lifecycle stage; a previous adjudication does not approve a later revision.

## Execute approved work

For one adjudicated work item:

```sh
forged run dispatch --id "$WORK_ID" \
  --approved-by "$ACTOR" --basis "$APPROVAL_BASIS" \
  --repo "$PWD" --profile standard --roster default
```

The approval basis describes why that exact revision and execution
configuration are authorized. Dispatch records approval and the immutable
handoff in one operation.

For an approved rolling epic:

```sh
forged epic preflight --epic "$EPIC_ID" --repo "$PWD" \
  --profile standard --roster default --rolling
forged epic start --epic "$EPIC_ID" --repo "$PWD" \
  --profile standard --roster default --rolling
forged epic submit --epic "$EPIC_ID"
```

Check preflight and approve the returned identities before start and submit.
The base defaults from the repository; `--base-ref` selects an existing branch
on `origin`. See [Run an epic](/forge/guides/run-an-epic/) for the full sequence.

## Recover and change running work

| Command family | Purpose |
| --- | --- |
| `run retry --id … --because …` | Create a successor for `world-changed`, `spec-amended`, or `rebase`. |
| `run revise-roster`, `epic revise-roster` | Revise provider/model choices at a durable boundary. |
| `run revise-policy`, `epic revise-policy` | Apply supported policy changes from authoring configuration. |
| `epic pause`, `epic resume` | Control an exact epic with a recorded reason. |
| `epic resolve` | Record resolution of a child or epic input requirement. |
| `run accept-risk` | Record explicit acceptance of residual findings with an actor and rationale. |
| `run stop` | Settle a run with an explicit outcome and supporting evidence. |

These operations have different preconditions. Use the returned `should`,
`can`, or `repair` action for the current subject; the table is not a sequence
to run. See [Inspect and recover](/forge/guides/inspect-and-recover/).

## Read usage and history

```sh
forged usage --run "$RUN_ID"
forged usage --repo "$PWD" --models
forged work history --repo "$PWD"
forged session read --attempt "$ATTEMPT_ID" --lines 120
```

Usage is attributed to attempts, including retries. Estimates carry their
pricing provenance, and missing cost stays unknown. Work history defaults to
a bounded 30-day window.

`session read` requires a Herdr-backed attempt. For process-backed attempts,
use `run status` and the run's recorded artifacts instead.

## Plugin shortcuts

Claude Code and Codex expose `/forged:setup`, `/forged:configure`,
`/forged:plan`, `/forged:critique`, `/forged:adjudicate`, `/forged:dispatch`,
`/forged:run-epic`, and `/forged:board`. Pi uses `/skill:<name>` and offers
`/forge` for its cockpit. You can also describe the work in normal language;
the shared routing skill selects the appropriate lifecycle operation.

The [plugin guide](https://github.com/tcashel/forge/blob/main/plugins/forged/README.md)
covers MCP availability and the differences between hosts.
