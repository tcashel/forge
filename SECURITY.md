# Security Policy

## Supported versions

Forge is pre-release (`0.4.0-dev`). Only the latest `main` is supported —
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

- **`forge serve` (the Workbench) binds to `127.0.0.1` only, with no
  authentication and no TLS.** It is a local, single-operator UI. Do not expose
  it to other hosts or proxy it to the public internet — anyone who can reach the
  port can launch, kill, and review tasks. The Workbench can launch and kill
  real subprocesses, so treat the port as privileged.
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
