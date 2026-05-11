# ADR 0006 — Subprocess agents, not API integrations

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-10
**Related:** [`0004-bring-your-own-agent`](./0004-bring-your-own-agent.md), [`0008-critics-are-agents`](./0008-critics-are-agents.md), [`0020-hook-policy-at-agent-level`](./0020-hook-policy-at-agent-level.md)

## Context

Juicer needs to integrate with multiple agent runtimes (Claude Code, Codex, opencode, future entrants). Two integration models exist:

- **API integration**: speak each agent's wire protocol directly, reimplementing the prompt loop, tool dispatch, hook handling, etc., in Juicer.
- **Subprocess integration**: spawn the agent's own CLI as a child process and interact through stdio.

The API path makes Juicer the implementation of N agents. The subprocess path makes Juicer the orchestrator of N existing implementations.

## Options

### A — Subprocess via adapter trait

**Pros:**
- Per-agent adapter layer is small; new agent support is a config row + thin shim, not a reimplementation.
- Process isolation is a feature, not an accident — each agent's environment, hooks, and permissions are governed by its own runtime.
- Hook-policy enforcement (see [`0020-hook-policy-at-agent-level`](./0020-hook-policy-at-agent-level.md)) becomes the agent's responsibility, where it belongs.
- The orchestrator and agents have independent release cycles.

**Cons:**
- Subprocess management (lifecycle, signals, stdio buffering, output capture) is a real engineering problem and a core subsystem.
- Streaming visibility is at the granularity the agent's CLI emits, not at the granularity the orchestrator might wish for.

### B — API integration per agent

**Pros:**
- Finer-grained control over the prompt loop and tool dispatch.

**Cons:**
- Juicer becomes the implementation of N agent runtimes. Each new agent is a major project.
- Hook semantics, permission UI, and tool dispatch get re-implemented in the orchestrator — directly conflicts with [`0020-hook-policy-at-agent-level`](./0020-hook-policy-at-agent-level.md).

## Decision

Spawn agents as **OS subprocesses** via an adapter trait. Each agent (Claude Code, Codex, etc.) gets a thin adapter that knows how to launch its CLI, pass it the spec, and parse its output.

## Consequences

- Adapter layer is small per agent; supporting a new agent runtime is days, not weeks.
- Subprocess management (process trees, signal forwarding, stdio capture, kill paths) is a core subsystem in both Track A and Track B.
- Critics use the same adapter trait (see [`0008-critics-are-agents`](./0008-critics-are-agents.md)) — no parallel mechanism for critic invocation.
- Output capture goes to storage for debug drill-down; streaming output is not a primary UI surface (see [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md)).
