# ADR 0022 — Skill + CLI as the agent↔orchestrator contract (no MCP)

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-24
**Related:** [`0004-bring-your-own-agent`](./0004-bring-your-own-agent.md), [`0005-plan-as-document`](./0005-plan-as-document.md), [`0006-subprocess-agents`](./0006-subprocess-agents.md), [`0020-hook-policy-at-agent-level`](./0020-hook-policy-at-agent-level.md)

## Context

[`0006-subprocess-agents`](./0006-subprocess-agents.md) commits to spawning agents as OS subprocesses but is silent on the **side-channel**: when a spawned agent needs to call back into Forge — to update a plan section, append a critic finding, report task status — what shape does that take?

Three patterns are in active use across the ecosystem:

1. **MCP (Model Context Protocol).** Forge would host an MCP server; spawned agents connect over stdio or HTTP and call typed tools. The pattern Windsurf, Cursor, and the broader agent stack are converging on.
2. **CLI subcommands invoked from a skill.** Forge ships a CLI with verbs like `forge spec save`, `forge plan update`, `forge critique`. A *skill* (markdown instructions loaded into the agent at runtime) teaches the agent which verb to call via its existing Bash tool. The agent does not know Forge exists; it knows there is a CLI it has been instructed to call.
3. **Custom stdout protocol.** Forge defines a JSON envelope the agent emits on stdout; the orchestrator parses and applies. No CLI, no MCP.

Forge has been quietly using pattern (2) for everything that already works — `skills/forge-planner` drives `forge spec save -`, `skills/forge-reviewer` drives `gh pr diff` and the `forge` CLI, `skills/forge-critic` and `skills/forge-synthesizer` emit structured output that the orchestrator picks up. It works. The question on the table is whether the next round of agent↔orchestrator capabilities (chat-driven live plan editing in Phase A1, executor status reporting in A2, etc.) should *stay* in the CLI+skill pattern, or graduate to MCP.

This ADR makes that choice explicit.

## Options

### A — Skill + CLI (selected)

A `forge <verb>` subcommand exists for each capability; a skill instructs the agent which verb to call and when.

**Pros:**
- **Already the established pattern.** No new infrastructure; extends what works.
- **BYOA-cheap.** Any agent with a Bash tool can drive Forge. Adding a new agent backend (Codex, opencode, Gemini CLI) requires no new MCP-config shape per [`0004-bring-your-own-agent`](./0004-bring-your-own-agent.md) — it just needs to be able to shell out.
- **Subprocess-clean.** The agent stays a black box receiving stdin and emitting stdout, consistent with [`0006-subprocess-agents`](./0006-subprocess-agents.md). Forge does not become a long-lived service the agent has a stateful connection to.
- **Track B portable.** Rust spawns the same CLI in B as TS does in A. No protocol-server reimplementation; the CLI binary *is* the contract.
- **Observable for free.** The Workbench's `plan-chat` SSE stream already renders `tool_use` blocks (`ChatToolCard.tsx`). A `Bash: forge plan update --section approach` call shows up in chat with no extra rendering work.
- **Hook policy still wins.** Per [`0020-hook-policy-at-agent-level`](./0020-hook-policy-at-agent-level.md), the agent's hooks govern whether it can run `forge plan update`. No new permission surface in Forge.
- **Process-isolation by default.** A misbehaving `forge plan update` invocation fails locally and is reported as a tool error; no shared connection to corrupt.

**Cons:**
- **No typed schema discovery.** The agent learns the CLI surface from the skill, not from an introspectable tool spec. Skills must stay in sync with CLI flags.
- **Per-call process spawn.** Each `forge` invocation pays Bun startup. Cheap (tens of ms) but not free; if a future use case needs 10s of structured calls per turn the math changes.
- **No persistent capability handshake.** The orchestrator cannot enumerate what tools an agent has access to; the skill is the only contract.

### B — MCP server hosted by Forge

Forge runs an MCP server (stdio per task, or HTTP on the same port as `forge serve`). Each spawned agent gets an MCP config injected into its worktree pointing at the server. Tool surface is scoped by role (planner sees `plan.*`, executor sees `task.*`, critic sees `findings.*`).

**Pros:**
- Typed tool schema the agent can introspect.
- Persistent connection — no per-call process spawn cost.
- Aligns with where the broader agent ecosystem is heading.

**Cons:**
- **Per-adapter config burden.** Every supported agent backend (Claude Code, Codex, opencode, Gemini CLI, …) has a different MCP-config shape that Forge would have to generate at launch time. Direct cost against [`0004-bring-your-own-agent`](./0004-bring-your-own-agent.md) — adding a backend is no longer "thin adapter shim," it's "thin adapter shim + MCP config generator."
- **New long-lived service.** Forge becomes a stateful MCP host the agent depends on. Failure modes (server crash, port conflict, stale config) are new operational concerns.
- **Duplicates capabilities the CLI already covers.** The existing skills work today; MCP would re-implement them for marginal gain.
- **Owner preference against MCP.** The user has expressed a clear preference to stay off MCP for this product. ADRs are partly preference instruments; this is a legitimate input.

### C — Custom stdout protocol

Agent emits a JSON envelope (e.g., `{"forge": "plan.update", "section": "...", "content": "..."}`) on stdout; orchestrator parses and applies.

**Pros:**
- No CLI invocation overhead.
- No MCP infrastructure.

**Cons:**
- Bespoke protocol the agent has to be carefully prompted to emit correctly. Brittle.
- Pollutes the agent's primary output channel with control messages, complicating log capture and the future "demote raw transcript to debug view" goal from [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md).
- No process boundary on individual calls; a malformed envelope is harder to recover from than a `forge` exit code.

## Decision

The agent↔Forge contract is **a stable CLI surface paired with skills that teach the agent when and how to call it**. No MCP server. No custom stdout protocol.

Every new agent-driven capability follows this shape:
1. Add a `forge <verb>` subcommand that does the structured work and writes through to the storage layer.
2. Update or add a skill that instructs the agent to call that verb at the right moment.
3. If the Workbench needs to react live, the *server* watches the storage layer and emits an SSE frame — the agent does not push to the UI directly.

**Rationale:** The pattern is already load-bearing across `forge-planner`, `forge-reviewer`, `forge-critic`, and `forge-synthesizer`. Promoting it from "ambient practice" to "named contract" lets future contributors extend the agent surface without reinventing the channel. MCP solves a problem Forge does not have, at the cost of every BYOA adapter Forge ships ([`0004`](./0004-bring-your-own-agent.md)).

**Risks to monitor:**
- **Per-turn call volume.** If a single agent turn needs >10 structured calls, process-spawn overhead becomes visible. Mitigations: a batched-update verb (`forge plan apply <patch.json>`) or stdin-streamed multi-op mode. Revisit if observed.
- **Skill/CLI drift.** A renamed flag in `forge plan update` silently breaks every skill that calls it. Mitigations: integration tests that exercise each skill's documented commands; a skill-lint pass that grep-matches commands against `--help` output.
- **Capability discovery.** Agents cannot enumerate their available tools. If a future agent role needs dynamic capability discovery, this ADR is the load-bearing constraint to revisit.
- **Ecosystem drift.** If MCP becomes table stakes for *consuming* third-party tools, Forge may still need MCP-client capability (a different question — see non-goals). This ADR only governs the agent↔Forge side-channel.

## Consequences

- **Phase A1 live plan editing** is implemented as `forge plan {get, update, set-question, resolve-question, lock}` subcommands plus an updated `forge-planner` skill. The Workbench's `plan-chat` server watches the plan storage and emits a `plan_updated` SSE frame after each turn so the right pane re-renders.
- **Lock gate is server-side.** `forge plan lock` refuses to lock with open questions or unresolved disagreements. The agent cannot bypass it.
- **Phase A2 executor reporting** follows the same shape — `forge task status`, `forge task block`, `forge notes append`. The In-Flight view reads through to storage; the agent never talks to the UI directly.
- **CLI is now load-bearing API surface, not internal tooling.** Subcommand stability matters; breaking changes require a skill update in lockstep.
- **Track B portability is preserved.** Rust spawns the same `forge` CLI (or its Rust successor with an identical verb surface) and skills are reused unchanged.
- **The pending decision "Agent stdio protocol: per-adapter vs. unified JSON-lines (Phase A2)"** in [`./README.md`](./README.md) is resolved by this ADR — the answer is "neither; we don't define a stdio protocol, we define a CLI."

## Non-goals locked by this ADR

- **No Forge-hosted MCP server.** Not for plan editing, not for executor reporting, not for any other agent↔Forge interaction.
- **No custom JSON-over-stdout control protocol.** Stdout stays the agent's primary output channel; Forge does not parse control messages from it.
- **No long-lived stateful side-channel** between spawned agent and orchestrator. The contract is per-call invocation of a stable CLI.
- **This ADR does not prohibit Forge from being an MCP *client* later** — i.e., spawning agents that themselves consume third-party MCPs — but that is a separate decision. This ADR only governs the agent↔Forge direction.
