# Security Policy

## Supported versions

The current provider-neutral Rust release and the current `main` branch receive
security fixes. Before 1.0, fixes are not backported to older releases; they
ship in the next release.

Until 0.5.0 appears in
[GitHub Releases](https://github.com/tcashel/forge/releases), no
provider-neutral Rust release is supported. A version becomes supported only
when it is published there. The historical TypeScript `v0.4.0` and
`pre-rip-v0.3.0` tags are unsupported.

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, use GitHub's private vulnerability reporting:
[**Report a vulnerability**](https://github.com/tcashel/forge/security/advisories/new).
This opens a private advisory visible only to the maintainers.

Please include enough detail to reproduce — affected command, version or
commit, and the impact you observed. You'll get an acknowledgement as soon as
the report is triaged.

## Trust model — read this before you run forged

forged orchestrates coding agents on your own machine, and it is built for an
operator who trusts their agents. Deliberate design choices that matter:

- **Launched agents run headless with permission prompts disabled** (e.g.
  `claude --dangerously-skip-permissions`, codex with a workspace-write
  sandbox). forged assumes you enforce policy at the agent level via hooks
  and guards. Agents execute with your local privileges inside per-task git
  worktrees — only point forged at repos and specs you trust.
- **Specs and packets are prompts.** Anything forged hands an agent can lead
  to arbitrary command execution. Review material from untrusted sources
  before running it.
- forged shells out to `bd`, `git`, `gh`, and the agent CLIs; it relies on
  your authenticated `gh` session for any PR operations. Its MCP server
  speaks stdio only — there is no network listener.

State lives under `~/.anvil/` (ledger, run artifacts) and `$BEADS_DIR`. No
data is sent anywhere except through the agent CLIs and `gh` that you
invoke.
