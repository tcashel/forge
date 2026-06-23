# Security Policy

## Supported versions

Forge is pre-release (`0.4.0`). Only the latest `main` is supported —
security fixes land there. There are no backported releases yet.

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, use GitHub's private vulnerability reporting:
[**Report a vulnerability**](https://github.com/tcashel/forge/security/advisories/new).
This opens a private advisory visible only to the maintainers.

Please include enough detail to reproduce — affected command/endpoint, version
or commit, and the impact you observed. You'll get an acknowledgement as soon as
the report is triaged.

## Trust model — read this before you run Forge

Forge orchestrates coding agents on your own machine, and it is built for an
operator who trusts their agents. A few deliberate design choices matter for
security:

- **`forge serve` (the Workbench) defaults to binding `127.0.0.1`, with no
  authentication and no TLS.** It is a local, single-operator UI. The `--host`
  flag lets you bind a non-loopback address (e.g. `0.0.0.0`) — **don't**, unless
  you fully control the network. With no auth or TLS, anyone who can reach the
  port can launch, kill, and review tasks, and the Workbench spawns real
  subprocesses on your machine — so treat the port as privileged and never proxy
  it to the public internet.
- **Launched agents run headless with permission prompts disabled** (e.g.
  `claude --dangerously-skip-permissions`, `codex --dangerously-bypass-approvals-and-sandbox`).
  Forge assumes you enforce policy at the agent level via hooks
  (Claude Code hooks, opencode permissions, your own scripts). Agents execute
  with your full local privileges inside per-task git worktrees — only point
  Forge at repos and specs you trust.
- **Specs are prompts.** A spec you launch is fed to an agent that can run
  arbitrary commands. Review specs from untrusted sources before launching them.
- Forge shells out to `gh`, `git`, `tmux`, and `python3`; it relies on your
  authenticated `gh` session for any PR operations.

State lives under `~/.forge/` (override with `FORGE_HOME`). No data is sent
anywhere except through the agent CLIs and `gh` that you invoke.
