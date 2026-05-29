# ADR 0007 — Git worktree per task

**Status:** Accepted (clarified by [`0024-worktrees-disposable-lifecycle`](./0024-worktrees-disposable-lifecycle.md))
**Deciders:** Tripp
**Date:** 2026-05-10
**Related:** [`0006-subprocess-agents`](./0006-subprocess-agents.md), [`0024-worktrees-disposable-lifecycle`](./0024-worktrees-disposable-lifecycle.md), [`../ARCHITECTURE.md`](../ARCHITECTURE.md), [`../ROADMAP.md`](../ROADMAP.md)

## Context

Multiple agents running in parallel on the same repo will trample each other if they share a working tree. The user's main checkout must also remain usable while agents are running — they're the operator, not a spectator paused on whatever the last agent touched.

## Decision

Each task gets its own **git worktree**. The agent runs inside that worktree; the user's main checkout is untouched. Worktrees are created at task launch and cleaned up after the task ships, fails, or is explicitly abandoned.

Applies to Track A Phase 2+ (execution) and Track B Phase 2+ (execution port).

## Consequences

- Worktree lifecycle (create, attach, prune, garbage-collect) is a core subsystem.
- Disk usage scales linearly with active tasks. The target audience runs ≤20 concurrent tasks in practice; disk pressure stays acceptable.
- Worktree root location is deferred (see `DECISIONS.md` pending list — Phase A2 decision).
- Cross-task isolation is structural: a runaway agent can't corrupt a sibling task's branch.
- Fits cleanly with the subprocess agent model (see [`0006-subprocess-agents`](./0006-subprocess-agents.md)): each subprocess gets its own `cwd`.
