# forged lead-agent plugin

**Talk to one agent. Keep the specification in the work store. Manage durable work.**

This Forge-owned plugin is the conversational adapter for the `forged` binary.
It gives Claude, Codex, and Pi the same eight capabilities through one shared
skill tree: automatic conversational routing, planning, proportional critique,
adjudication, operator setup, slice dispatch, epic handoff, and a deliberate
board launcher. The Pi package adds direct custom tools and a btop-inspired
terminal cockpit without copying the skills or adding another state store. The
shared router also projects the bounded operator portfolio and invokes landed,
target-scoped controls.

## Lead MCP tools

The Claude plugin registers the server with `--audience all` so the host can offer every App-launching operator read alongside the lead verbs; a bare `forged mcp` (other hosts, machine seats) lists only the manifest's lead audience:

- `attention_acknowledge`
- `attention_list`
- `attention_reopen`
- `attention_resolve`
- `definition_validate`
- `doctor`
- `epic_abandon`
- `epic_pause`
- `epic_preflight`
- `epic_resolve`
- `epic_resume`
- `epic_revise_policy`
- `epic_revise_roster`
- `epic_start`
- `epic_status`
- `epic_submit`
- `explain`
- `next`
- `run_accept_risk`
- `run_adjudicate_settlement`
- `run_dispatch`
- `run_retry`
- `run_revise_policy`
- `run_revise_roster`
- `run_status`
- `run_stop`
- `session_list`
- `session_message`
- `session_read`
- `usage_report`
- `wait`
- `work_adjudicate`
- `work_close`
- `work_create`
- `work_link`
- `work_list`
- `work_note_add`
- `work_note_list`
- `work_park`
- `work_promote`
- `work_ready`
- `work_release`
- `work_reopen`
- `work_revert`
- `work_show`
- `work_supersede`
- `work_update`

## Ownership

- **Lead agent/plugin:** conversation, planning, critique, adjudication,
  portfolio presentation, control authorization, and explicit submission.
- **Work store:** native specification fields, parent/dependency graph, readiness,
  statuses, and leases.
- **Forged:** immutable execution packages, provider dispatch, attempts, gates,
  review/remediation, artifacts, controller recovery, and outcomes.
- **Herdr:** panes, processes, and message transport.
- **Git/GitHub:** commits, branches, pull requests, and merge truth.

No layer duplicates another's durable state. The plugin never turns host
conversation or subagent sessions into an execution ledger.

## Work is the specification

The editable specification is the work item's `description`, `design`,
`acceptance_criteria`, and `notes`. Every work item created by the plugin also has
`metadata.repository` set to the canonical absolute target-repository root.
Epic membership uses native parent links. Old operator-owned spec files may be
read as archival migration input, but the plugin never creates a new parallel
spec file or treats one as authoritative.

The optional legacy importer resolves every `bd` command through the explicit
`$BEADS_DIR`. Normal planning writes the operator-scoped work store directly;
the plugin never initializes state in a target repository or creates a
repository-local `.beads` directory.

## Install and register

Starting with the published `v0.5.0` release, the installer verifies the
selected archive against `SHA256SUMS` and installs into a user-owned prefix.
The default is `$HOME/.local`, with the binary at
`$HOME/.local/bin/forged` and the Forge release package at
`$HOME/.local/share/forge`. It does not use `sudo` or edit shell profiles.

```sh
curl -fsSL https://github.com/tcashel/forge/releases/latest/download/install.sh \
  | sh
```

If `$HOME/.local/bin` is not already on `PATH`, add it in your shell
configuration before starting an agent harness. To select an exact release or
another user-owned prefix:

```sh
curl -fsSL https://github.com/tcashel/forge/releases/latest/download/install.sh \
  | sh -s -- --version 0.5.0 --prefix /absolute/prefix
```

Reinstalling the same verified release succeeds without changing it. The
installer refuses modified or foreign destination paths; pass `--force` only
when you intend to replace those exact install paths. It never uses force to
change services or operator state.

The installer does not register plugins. Register the installed package
explicitly from `$PREFIX/share/forge`.

Claude Code:

```text
/plugin marketplace add /absolute/prefix/share/forge
/plugin install forged@forge
```

Codex:

```sh
codex plugin marketplace add /absolute/prefix/share/forge
codex plugin add forged@forge
```

Pi:

```sh
pi install /absolute/prefix/share/forge
```

Beads is needed only for the optional one-shot legacy import. Supply it through
`PATH` or `BD_BIN`; Forge `v0.5.0` qualifies exact `bd 1.2.1`, while upstream
`bd 1.2.2` lacks required import commands. Forge does not install, upgrade, or
downgrade Beads, Git, GitHub CLI, provider CLIs, credentials, profiles,
configuration, or services.

Use `/forge` for the native terminal cockpit. It presents work queues,
attention, 30-day usage trends, and provider attempts directly from Forged's
bounded JSON projections. Number keys switch views, arrows or vim keys move,
Enter opens durable detail, and `r` refreshes. Use `/skill:setup`,
`/skill:plan`, and the other shared skill commands when an explicit command is
useful.

To run detached packet seats through Pi as well, add an opt-in roster to
`$ANVIL_HOME/config.yaml` using full Pi model coordinates. A standard-profile
example is:

```yaml
rosters:
  pi-standard:
    schema: forged.roster/1
    name: pi-standard
    roles:
      implementation:
      - provider: pi
        model: anthropic/claude-sonnet-4-5
        effort: high
        sandbox: workspaceWrite
        capabilities: [repositoryRead, repositoryWrite, structuredOutput]
      review.primary:
      - provider: pi
        model: openai-codex/gpt-5.4
        effort: high
        sandbox: readOnly
        capabilities: [repositoryRead, structuredOutput]
      assessment:
      - provider: pi
        model: anthropic/claude-sonnet-4-5
        effort: high
        sandbox: readOnly
        capabilities: [repositoryRead, structuredOutput]
      remediation:
      - provider: pi
        model: anthropic/claude-sonnet-4-5
        effort: high
        sandbox: workspaceWrite
        capabilities: [repositoryRead, repositoryWrite, structuredOutput]
```

Validate it with `forged definition validate --profile standard --roster
pi-standard`. Rolling epics additionally require this dedicated read-only
`assessment` role and an independently selected critique candidate. Pi packet
workers keep repository skills and context enabled but
disable extension code; direct Claude and Codex rosters remain available.
The Claude manifest registers the `forged mcp` server over stdio, resolving
the operator-installed `forged` binary from `PATH` (the host silently skips a
missing binary; the plugin never installs software). Migration: operators
with a prior user-scope entry first confirm in a fresh session that the
plugin-mounted forged tools appear — a bare name the host cannot resolve is
skipped silently, leaving no forged tools and no diagnostic — and only then
run `claude mcp remove forged` once. Until then two registrations spawn the
same binary and tool-name precedence is host-defined. If the plugin mount
does not appear, keep or re-add the user-scope entry
(`claude mcp add forged -- <absolute path to forged> mcp`) and run
`/forged:setup` to diagnose PATH. The Codex manifest carries no server registration; skills there use the CLI
read path. Pi likewise has no MCP connector: its extension registers a small
native tool set and executes the independently installed `forged` binary with
argument arrays.

After installation, run `/forged:setup` in Claude Code or Codex, or
`/skill:setup` in Pi. On macOS, `forged service install` optionally installs the
per-user supervisor after setup; rerun it after a CLI upgrade so the service
uses the new immutable binary generation. Managed service lifecycle commands
are unsupported on Linux.

Then talk normally. Ask the lead agent to explore an idea, plan or revise work,
critique or adjudicate a work item, identify what needs attention, explain one run's
blocker or spend, reprioritize a work item, or safely pause, resume, or cancel exact
existing work. It can also prepare one ready subject for explicit execution
approval. The shared `manage-work` skill routes that intent without requiring a
command name or machine id. The lifecycle the skills walk is stated once in
[`docs/LIFECYCLE.md`](../../docs/LIFECYCLE.md), and the way an agent drives
Forge from responses alone is [`docs/DRIVING.md`](../../docs/DRIVING.md).

Portfolio answers come from headless Operations Overview and exact Work Detail
projections. Their Apps are optional views over the same data. Every mutation
uses a canonical id, one bounded authority decision, one typed operation, and
a durable readback; titles, panes, processes, and visible App state are never
mutation selectors.

To remove the installed files, first uninstall the optional macOS supervisor,
then run the release uninstaller:

```sh
forged service uninstall # macOS only, when installed
curl -fsSL https://github.com/tcashel/forge/releases/latest/download/uninstall.sh \
  | sh
```

Pass the same `--prefix` used during installation after `sh -s --` when it was
not `$HOME/.local`.

The uninstaller removes only installer-owned files and the exact `forged`
symlink. It does not unregister harness plugins or remove `ANVIL_HOME`,
`BEADS_DIR`, configuration, credentials, run history, or target repositories.

Named skills remain available as explicit power-user and debugging surfaces:

- `/forged:manage-work`
- `/forged:board`
- `/forged:configure`
- `/forged:plan`
- `/forged:critique`
- `/forged:adjudicate`
- `/forged:dispatch`
- `/forged:run-epic`

The slice dispatch skill calls the single fenced `forged run dispatch` verb;
epic dispatch uses the corresponding epic commands. Both return immediately with durable
inspection commands. They do not shell-detach jobs or keep the lead session
alive. Slice work stops at a reviewed draft pull request. An epic may integrate
mechanically clean children, but default-branch merge remains human-owned.

The lead skills are thin lifecycle clients: `next` or `explain` establishes
position, one typed verb changes state, and `wait --id` reconnects without a
polling loop. `work adjudicate` commits dispositions with any field and status
change atomically; `run dispatch` records execution approval with the immutable
handoff. The ledger now owns pagination, readiness, lifecycle evidence, and the
single recommended next action, so a lead no longer carries those procedures in
prompt prose.

## Operator scope

Runtime and planning state stays under `$ANVIL_HOME` and `$BEADS_DIR`
(normally `~/.anvil`). `BEADS_DIR` may select an embedded operator store or the
metadata for a central team Dolt SQL database. Forged's SQLite execution ledger
remains separate in either mode.

## License and provenance

This package is distributed under the repository's MIT license with the
OpenAI/Anthropic rider. See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md).
Historical lessons from the Smithy Anvil experiment are retained in
[LEARNINGS.md](LEARNINGS.md); they are evidence, not a second active product.
