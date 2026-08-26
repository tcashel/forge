# forged lead-agent plugin

**Talk to one agent. Keep the specification in Beads. Manage durable work.**

This Forge-owned plugin is the conversational adapter for the `forged` binary.
It gives Claude, Codex, and Pi the same eight capabilities through one shared
skill tree: automatic conversational routing, planning, proportional critique,
adjudication, operator setup, slice dispatch, epic handoff, and a deliberate
board launcher. The Pi package adds direct custom tools and a btop-inspired
terminal cockpit without copying the skills or adding another state store. The
shared router also projects the bounded operator portfolio and invokes landed,
target-scoped controls.

## Ownership

- **Lead agent/plugin:** conversation, planning, critique, adjudication,
  portfolio presentation, control authorization, and explicit submission.
- **Beads:** native specification fields, parent/dependency graph, readiness,
  statuses, and leases.
- **Forged:** immutable execution packages, provider dispatch, attempts, gates,
  review/remediation, artifacts, controller recovery, and outcomes.
- **Herdr:** panes, processes, and message transport.
- **Git/GitHub:** commits, branches, pull requests, and merge truth.

No layer duplicates another's durable state. The plugin never turns host
conversation or subagent sessions into an execution ledger.

## Beads is the specification

The editable specification is the Bead's `description`, `design`,
`acceptance_criteria`, and `notes`. Every Bead created by the plugin also has
`metadata.repository` set to the canonical absolute target-repository root.
Epic membership uses native parent links. Old operator-owned spec files may be
read as archival migration input, but the plugin never creates a new parallel
spec file or treats one as authoritative.

Every `bd` command uses the explicitly resolved `$BEADS_DIR`. The plugin never
passes repository-routing options to Bead creation, initializes Beads in a
target repository, or creates a repository-local `.beads` directory.

## Setup and use

Register the Forge checkout as a marketplace and install the same plugin from
either supported host.

Claude Code:

```text
/plugin marketplace add /absolute/path/to/forge
/plugin install forged@forge
```

Codex:

```bash
codex plugin marketplace add /absolute/path/to/forge
codex plugin add forged@forge
```

Pi installs the whole Forge checkout as one package while loading only the
resources named by the root manifest. The Forged binary remains a separate
operator installation:

```bash
pi install git:github.com/tcashel/forge@<release-tag>
# or, while developing a checkout
pi install /absolute/path/to/forge
```

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
the operator-installed `forged` binary from PATH (the host silently skips a
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

After installation, run `/forged:setup`. Then talk normally: ask the lead agent
to explore an idea, plan or revise work, critique or adjudicate a Bead, ask
what needs attention, explain one run's blocker or spend, reprioritize a Bead,
or safely pause, resume, or cancel exact existing work. It can also prepare one
ready subject for explicit execution approval. The shared `manage-work` skill
routes that intent without requiring a command name or machine id.

Portfolio answers come from headless Operations Overview and exact Work Detail
projections. Their Apps are optional views over the same data. Every mutation
uses a canonical id, one bounded authority decision, one typed operation, and
a durable readback; titles, panes, processes, and visible App state are never
mutation selectors.

Named skills remain available as explicit power-user and debugging surfaces:

- `/forged:manage-work`
- `/forged:board`
- `/forged:plan`
- `/forged:critique`
- `/forged:adjudicate`
- `/forged:dispatch`
- `/forged:run-epic`

The dispatch skills call `forged run start` followed by `forged run submit`, or
the corresponding epic commands, and return immediately with durable
inspection commands. They do not shell-detach jobs or keep the lead session
alive. Slice work stops at a reviewed draft pull request. An epic may integrate
mechanically clean children, but default-branch merge remains human-owned.

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
