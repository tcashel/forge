# ADR 0025 — Unified agent-calling interface; the agent owns conversation context

**Status:** Proposed
**Deciders:** Tripp
**Date:** 2026-05-30
**Related:** [`0006-subprocess-agents`](./0006-subprocess-agents.md), [`0004-bring-your-own-agent`](./0004-bring-your-own-agent.md), [`0005-plan-as-document`](./0005-plan-as-document.md), [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md), [`../ROADMAP.md`](../ROADMAP.md)

## Context

[ADR-0006](./0006-subprocess-agents.md) decided agents are OS subprocesses behind a *thin adapter trait*. In practice Track A never grew that trait. What exists instead:

- **`agentCommand()`** (`src/core/launch.ts:93`) builds a **shell command string** — not a spawn handle — for `claude` / `codex` / `opencode` / `gemini`. Every caller then shell-execs it differently: `tmux send-keys`, `execSync`, `execFileSync("bash", …)`, or a generated runner script.
- **`claudeJobCommand()`** (`src/core/launch.ts:150`) is a second, claude-only variant that adds `--output-format stream-json` + a `tee` sidecar for token/cost capture.
- **`plan-chat.ts:569`** ignores both and does a bespoke `spawn("claude", …)`, hardcoded to claude, with the model fixed at `claude-opus-4-8`.

So there is no single seam. Eight call sites invoke agents, three different ways, and one of them (the most user-facing — the planning chat) is a hardcoded outlier. The audit below is exhaustive.

A second, deeper problem sits underneath the planning chat specifically. It does **not** use the agent's native session. Every turn it spawns a fresh `claude --print` with **no `--resume`**, then fakes continuity by concatenating Forge's own saved history back into a giant markdown prompt (`buildTurnPrompt`, `plan-chat.ts:288`). That reconstruction is **lossy** — it replays only `msg.text`, dropping the `blocks` (tool_use / tool_result) we bothered to persist — and it is only persisted at all on a clean exit (`plan-chat.ts:505`); a non-zero exit or signal kill saves nothing. Three symptoms we have actually hit all trace to this one choice:

1. **Audit logs aren't verbose enough** ("just input/output") — because the durable record is a text-only paraphrase, not the agent's real tool-call transcript.
2. **The chat is unreliable / you fight the agent** — because each turn replays an incomplete, flattened history, so the agent has amnesia about its own prior tool calls.
3. **We lose most of Claude's session history** — Claude writes a complete JSONL transcript per session; we ignore it, keep a worse paraphrase, and let the original orphan in `~/.claude`.

Meanwhile the agents already solve this for us, verified against current CLIs (May 2026):

- **Claude Code:** `--resume <id>` / `--continue` work in `--print` + `stream-json` headless mode. `--session-id <uuid>` lets us *assign* the id at start (so Forge owns the mapping without scraping). Session JSONL transcripts live under the default config dir at `projects/<cwd-hash>/<session-id>.jsonl`. (`CLAUDE_CONFIG_DIR` can relocate that dir, but the Decision rejects using it — it also holds credentials. `--no-session-persistence` and `CLAUDE_CODE_SKIP_PROMPT_HISTORY` exist if we ever want to opt out.)
- **Codex:** `codex resume <SESSION_ID>` / `--last` / `--all`; transcripts under `~/.codex/sessions/YYYY/MM/DD/*.jsonl`; a specific file can be loaded via the **experimental** `-c experimental_resume="<path>"`. Real, but rougher than Claude (path-based, no clean id assignment).
- Other agents (opencode, gemini) have weaker or no resume story.

Letting the agent own its own context is not just cleaner — it is **cheaper and lower-latency**, because a stable resumed session keeps a stable prompt prefix, which is the precondition for server-side **prompt caching**. Reconstructing a fresh prompt every turn defeats the cache by design. This is the rare case where fidelity, cost, and latency all point the same way.

This ADR is being written *before* the plan-workspace rebuild (Phase A1) precisely so the rebuild and every future feature call the agents through one seam, and so we don't regress the call sites that work today.

## Options

### A — Forge owns conversation context (status quo, made lossless)

Keep reconstructing the prompt each turn, but losslessly — replay full `blocks`, persist every event durably regardless of exit code, agent stays fully stateless.

**Pros:**
- Agent-agnostic; identical mechanism for every CLI.
- No dependency on per-agent resume semantics.

**Cons:**
- Reimplements conversation-state management the agents already do better.
- **Defeats prompt caching** — new prefix every turn → higher cost and latency.
- Can never match native fidelity; we reconstruct context rather than replay the agent's real session.

### B — The agent owns conversation context (native resume), Forge owns the graph

Each conversation maps to a native agent session (`--session-id` / `--resume` for Claude; `resume` for Codex). Forge sends only the *new* user turn and lets the agent remember the rest. The agent writes to its **own default session store** (Forge does not relocate it — see the auth correction in the Decision section); Forge **locates** that JSONL by the assigned `--session-id` and reads/copies it for the verbose audit trail. Forge stores a **pointer** (`{ agent, sessionId, cwd }`) plus, at spec state, a durable copy — never the turn-by-turn source of truth for continuity.

**Pros:**
- **Prompt caching works** → cheaper, faster.
- Lossless fidelity: the agent's native JSONL *is* the verbose audit log.
- Ends the "we lose Claude's history" data loss outright.
- Far less code in `plan-chat`: `buildTurnPrompt`'s lossy replay is deleted.

**Cons:**
- Continuity quality is **per-agent asymmetric** — Claude is first-class, Codex real-but-rough, others worse.
- Couples Forge to each agent's resume CLI surface (mitigated by the adapter).

### C — Persistent agent-server protocol (e.g. opencode server / ACP)

Hold a long-lived bidirectional session against an agent server.

**Pros:**
- Richest live-editing / streaming-edit potential.

**Cons:**
- **Fragments agent support** — binds the plan workspace to one server protocol, locking out Claude Max / Codex subscription CLIs. Directly violates [ADR-0004](./0004-bring-your-own-agent.md) and the BYO-agent thesis.
- Makes the agent a stateful first-class collaborator — the opposite of [ADR-0006](./0006-subprocess-agents.md).
- More moving parts for an interaction (turn-based, human-paced ideation) that does not need them.

## Decision

Two coupled decisions:

1. **One agent-calling interface.** Introduce a single adapter seam (`src/core/agents/`) that every agent invocation goes through — spawn, argv/flag construction, stdin/prompt handling, stream parsing, output capture, and session bookkeeping. `agentCommand()` / `claudeJobCommand()` become *internal details of the adapter*, not things callers assemble. All eight call sites in the audit migrate to it. This realizes the adapter trait [ADR-0006](./0006-subprocess-agents.md) named but never built.

2. **The agent owns turn-by-turn context (Option B); Forge owns the conversation graph, and snapshots the transcript at spec promotion.** Continuity is the agent's native session (`--session-id`/`--resume`), not a Forge-reconstructed prompt. The agent writes to its **own default session store** — Forge does **not** relocate it (see the auth correction below). Forge's durable layer owns the *graph*: which conversations exist, their session pointers, and their many-to-many links to plans and to each other (the substrate for interconnected specs). For continuity it holds only a **pointer** (`{agent, session-id, cwd}`) and resumes through it. For audit, durability is **tiered by lifecycle state** (below): Forge takes a full **read-only copy** of the native JSONL only once a conversation becomes a spec.

   **Conversation lifecycle (auto-save + archive):**
   - **Conversation** — every conversation is **auto-saved** on creation: Forge writes a pointer (`{agent, session-id, cwd}` + metadata) immediately. No "keep" gate — nothing is lost by forgetting to save. Durable in Forge's list, resumable for ideation via `--resume`; **pointer only, no transcript copy**.
   - **Archived** — the user clicks archive, which **deletes Forge's pointer record only**. It does **not** touch the agent's session store. Archive is a plain row delete (no soft-delete flag, no un-archive view) — the simplest possible mechanism, safe precisely because Forge's pointer was never the source of truth. Not reversible from Forge's side; the underlying agent session may still be resumable via the agent's own CLI until its cleanup window, but Forge won't surface it.
   - **Spec** — promoted via `POST /api/specs`. At this promotion (the existing `promotePlanDraft` / `promoteDraftingSessions` step), Forge takes a **full copy** of the transcript into Forge-owned storage, and **re-copies at the end of each subsequent plan-scoped turn**. This is the audit source of truth, immune to the agent's cleanup window.

   The snapshot is a **one-way, read-only archive**: it is never fed back to the agent and never reconciled. `--resume` always reads the agent's native session, never Forge's copy. So authority splits cleanly: **agent's native session = authoritative for live continuity; Forge's copy = authoritative for historical audit once a spec exists.** Forge never mutates the agent's session store — it only reads (to resume / to copy at promotion).

The adapter interface is tiered and honest about asymmetry: `mint` / `resume` / `locateTranscript` are implemented natively where the agent supports it (Claude first-class, Codex real-but-rough), and degrade to Forge-owned lossless reconstruction (Option A) as the floor for agents with no resume mechanism. Claude is the only agent that must be fully wired on day one.

**Rationale:** Option B is the only one where fidelity, cost (prompt caching), and latency align, and it deletes more code than it adds in the worst offender. Option C is rejected outright as anti-thesis and agent-fragmenting. The unified interface is the prerequisite that stops the plan-workspace rebuild — and every future feature — from minting a ninth bespoke call site.

**Auth correction (was wrong in an earlier draft):** An earlier draft proposed relocating transcripts via `CLAUDE_CONFIG_DIR`. That is **rejected** — `CLAUDE_CONFIG_DIR` holds credentials/auth and personal settings, not just transcripts, so pointing a spawned `claude` at a fresh Forge-owned tree turns working Claude Max / subscription installs into "not logged in." The agent keeps its default config/session location; Forge instead **locates** the transcript (by the `--session-id` it assigned) and **copies** it. This means the clean "Forge owns only a pointer" framing does **not** fully hold: Forge owns a pointer for *continuity* and a durable *copy* for *audit* (at spec state). That tension is real and stated deliberately rather than hidden.

**Risks to monitor:**
- Headless prompt-cache hit rate on resumed sessions is expected but not contractually documented by Anthropic — **measure it** during implementation; if it doesn't materialize, the cost argument weakens (fidelity argument still holds).
- Codex parity is a known, accepted gap, not an oversight. If Codex usage grows, revisit.
- **Transcript location:** the path is `<default-config>/projects/<cwd-hash>/<session-id>.jsonl`. Forge's cwd-hash algorithm is **not** assumed — locate by globbing for the assigned `<session-id>.jsonl` under the projects tree. Verify the filename-is-session-id assumption during impl.
- **Append-only assumption avoided:** snapshots are **full file copies**, not delta-appends, so they remain correct even if the agent rewrites earlier transcript content (e.g. compaction). At plan-chat transcript sizes (hundreds of KB) a per-turn full copy is negligible; do not optimize this into an incremental scheme.
- **Non-spec conversation resume expiry (accepted degradation):** a conversation that never became a spec, left idle past the agent's cleanup window (Claude default `cleanupPeriodDays` = 30), loses resumability — the native session is gone and we deliberately kept no copy. The conversation still lists (title/pointer/notes) but cannot be continued. This is accepted: an un-promoted month-old brainstorm is low-stakes, and the user can fork a fresh conversation seeded from the listed text. We do **not** depend on changing `cleanupPeriodDays`. (Optional softener, not required now: surface "resumable until ~date" in the list.)

## Consequences

- A new `src/core/agents/` module becomes a core subsystem (consistent with [ADR-0006](./0006-subprocess-agents.md) calling subprocess management core). The test injection seam (`spawnImpl`) generalizes to the adapter.
- `plan-chat.ts` loses `buildTurnPrompt`'s history replay; turns become `resume`-based. The lossy persistence path is removed.
- The "logs aren't verbose enough" and chat-reliability complaints are resolved as a side effect of (2), not as separate features.
- Conversations become durable, listable, cross-linkable entities, **auto-saved on creation** — replacing today's promote-or-reap ephemeral draft model (`NewSpecModal` deletes unpromoted drafts on close). Removal is an explicit **archive** (delete Forge's pointer row; agent session untouched), not silent reaping.
- A migration sequence is required so we **do not break what works today** (see below).
- Per the BYO thesis ([ADR-0004](./0004-bring-your-own-agent.md)), no agent is privileged at the *capability* level — every agent works; only continuity *fidelity* is tiered.

## Implications for current work

This ADR gates the Phase A1 plan-workspace rebuild. Recommended sequence, each step shippable and non-regressing:

1. **Land the adapter seam** behind the existing behavior — `agentCommand`/`claudeJobCommand` move *inside* it; the eight call sites call the adapter but produce byte-identical invocations. Pure refactor, no behavior change, full green test suite. This is the "don't break what works" gate.
2. **Add native-session support to the adapter** (Claude `--session-id`/`--resume`) as a new capability, unused by launch/critique/review yet. The agent keeps its **default** config/session location — **no `CLAUDE_CONFIG_DIR` relocation** (it would break auth; see the Decision section). Forge **locates** the transcript by the assigned `--session-id` (glob for `<session-id>.jsonl`) and **copies** it at spec promotion, per step 4.
3. **Cut plan-chat over to resume-based context**; delete `buildTurnPrompt` replay; UI tails the native JSONL.
4. **Introduce the conversation lifecycle + transcript snapshot** — auto-save conversations as pointers, archive = delete pointer row only, and the full transcript copy at spec promotion (re-copied each subsequent turn). Durable, linkable; retires the ephemeral promote-or-reap draft lifecycle.
5. Later, opportunistically migrate launch/critique/review/comment-fix to native sessions where it buys caching; they are correct as-is on the adapter and need not change in lockstep.

### Audited agent call sites (all must route through the adapter)

| # | Call site | Agent | Path / mechanism today |
|---|---|---|---|
| 1 | `src/core/plan-chat.ts:569` | claude (hardcoded) | bespoke `spawn("claude")`, stream-json, lossy reconstruct |
| 2 | `src/core/launch.ts` (main, runner script) | dynamic | `agentCommand()` → tmux/bash runner |
| 3 | `src/core/launch.ts` (reviewer, runner script) | dynamic | `agentCommand()` → bash |
| 4 | `src/core/launch.ts` (fixer, auto-fix loop) | dynamic | `agentCommand()` → bash |
| 5 | `src/core/critique.ts:142-159` (critic A, critic B, synth) | dynamic | `agentCommand()` / `claudeJobCommand()` → bash, parallel |
| 6 | `src/core/improve.ts:310-320` | dynamic | `agentCommand()` / `claudeJobCommand()` → `execSync` |
| 7 | `src/cli/cmd/review-actions.ts:368,380` | dynamic | `agentCommand()` → `execFileSync("bash")` worker |
| 8 | `src/cli/cmd/comment-fix-actions.ts:612,620` | dynamic | `agentCommand()` → `execFileSync("bash")` worker |

Shared builders to absorb into the adapter: `agentCommand()` (`launch.ts:93`), `claudeJobCommand()` (`launch.ts:150`), `claudeJobStreamFilter` (`launch.ts:148`).

## Non-goals locked by this ADR

- **No persistent agent-server protocol** (opencode server / ACP) for the plan workspace — Option C is rejected. Stateless spawn-per-turn with native resume stays the model.
- **No reselling inference / no privileged agent** — BYO and agent-agnostic capability per [ADR-0004](./0004-bring-your-own-agent.md). Continuity *fidelity* is tiered; agent *support* is not.
- **Forge does not own turn-by-turn conversation content** — that is the agent's native transcript. Forge owns the graph and the pointers.
- **Not a big-bang rewrite** — the adapter lands as a behavior-preserving refactor first; native-session features are additive.
