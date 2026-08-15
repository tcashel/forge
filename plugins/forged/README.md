# forged lead-agent plugin

**Talk to one agent. Keep the specification in Beads. Manage durable work.**

This Forge-owned plugin is the conversational adapter for the `forged` binary.
It gives Claude and Codex the same seven capabilities through one shared skill
tree: automatic conversational routing, planning, proportional critique,
adjudication, operator setup, slice dispatch, and epic handoff. The shared
router also projects the bounded operator portfolio and invokes landed,
target-scoped controls without adding another state store.

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
