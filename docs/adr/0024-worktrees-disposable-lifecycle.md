# ADR 0024 — Worktrees are disposable: lifecycle UI + lazy rehydration

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-29
**Related:** [`0007-worktrees-per-task`](./0007-worktrees-per-task.md), [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md), [`0022-skill-cli-as-agent-contract`](./0022-skill-cli-as-agent-contract.md), [`../ROADMAP.md`](../ROADMAP.md)

## Context

[ADR-0007](./0007-worktrees-per-task.md) established a git worktree per task and named "create, attach, prune, garbage-collect" as a core subsystem — but only **create** and **attach** ever shipped. Worktrees accumulate at `<parent-of-repo>/worktrees/<sanitized-branch>` (`src/core/repo.ts:274`), and the only removal that exists is the rollback when a `forge launch` itself fails (`src/cli/cmd/launch.ts:466`). Nothing prunes after a PR merges.

The operator therefore can't tell which worktrees are safe to delete, can't reclaim disk, and — the concrete itch that prompted this — can't easily pull a branch into their **main checkout** to run and test it (git refuses to check out a branch that's already live in a worktree).

The reason "just delete them" isn't already safe is an asymmetry in how the agents use the worktree:

- **Review** (`src/cli/cmd/review-actions.ts`) runs in `repoRoot` off `gh pr diff`. It never touches a worktree — deleting one can't break it.
- **Comment-fix** (`src/cli/cmd/comment-fix-actions.ts`) runs *inside* the worktree: it does `git add/commit/push` and runs the repo's quality gates there. Today it hard-fails `NO_WORKTREE` (HTTP 422, `comment-fix-actions.ts:160-178` → `serve.ts:1950`) when the worktree is gone, hinting "re-launch this branch via Forge."

So deleting a worktree is safe to *correctness* but currently destroys the *fix capability*. That coupling is the real design problem; the UI is the easy half.

We also weighed deferring the whole thing to a future opencode/codex **agent-chat** surface ("tell an agent to clean up the worktrees"), since multi-agent backends are already on the roadmap (Phase B3).

## Options

### A — Worktrees are disposable: lifecycle management + lazy rehydration

Build worktree inventory, safety status, remove, bulk clean-merged, and "test locally" as `forge worktree` verbs surfaced in the Workbench; make comment-fix **rehydrate** a worktree from the PR head branch on demand when none exists.

**Pros:**
- Removes the coupling at its root — once fix can rebuild a worktree, deletion never costs capability, only disk + a few seconds on the next fix.
- Deterministic, reversible-aware git plumbing behind explicit verbs/buttons — matches [ADR-0022](./0022-skill-cli-as-agent-contract.md) (CLI + skills, no MCP) and [ADR-0019](./0019-sessions-are-jobs.md) (jobs, not shows).
- Solves the "pull into main to test" workflow directly.

**Cons:**
- Touches the shared `createWorktree` (hot launch path) to add a checkout-existing-branch mode.
- Rehydration adds latency + a bootstrap step on the first fix after a delete.

### B — Block deletion when a fix might be pending

Leave fix unchanged; the UI refuses or warns on deletion when a PR has unresolved review comments.

**Pros:** Smallest change.
**Cons:** Leaves the fragility in place, just hides it; turns "free up disk" into a guessing game about future fixes; the `NO_WORKTREE` dead-end still happens whenever a worktree is removed out-of-band.

### C — Defer to agent-chat (opencode/codex)

Wait for a multi-agent chat surface and have the operator instruct an agent to remove worktrees.

**Pros:** No new Forge subsystem now.
**Cons:** Phase B3, not the Phase A2 gap we feel today; conflicts with "jobs, not shows" and "no MCP"; hands destructive `git worktree remove` to a non-deterministic agent; and it *still* doesn't fix the comment-fix coupling — that coordination lives below the UI regardless of who clicks the button.

## Decision

**Worktrees are disposable.** Forge gains worktree lifecycle management — inventory + per-worktree safety status + remove + bulk "clean merged" + "test locally" — exposed as `forge worktree` verbs and surfaced in the Workbench. **Comment-fix lazily rehydrates** a worktree from the PR head branch when none exists, instead of failing. Deleting a worktree therefore costs only disk and a few seconds on the next fix, never capability.

**Rationale:** The blocker was never the UI; it was that one agent treats the worktree as durable state. Making the worktree cheaply re-creatable converts it from durable state into a cache, which is what unlocks safe, casual deletion — and is strictly more robust than guarding deletion (B) or outsourcing it (C).

**Risks to monitor:** rehydration latency / bootstrap failures making the first post-delete fix feel slow; the three tracking locations (`jobs.worktree_path`, `sessions.cwd`, `Plan.worktree`) drifting from on-disk reality; "test locally" clobbering a dirty main checkout.

## Consequences

- **`git worktree list --porcelain` becomes ground truth** for the inventory; the DB (`jobs`/`plans`) is the annotation layer (PR number, branch, session linkage). The inventory self-heals when worktrees are removed out-of-band.
- **`createWorktree` (`repo.ts:264`) gains a checkout-existing-branch mode.** Today it only does `git worktree add -b <branch>` (creates a new branch); rehydration needs `git worktree add <path> <branch>` against an existing remote head, plus the same dependency bootstrap so quality gates can run.
- **Comment-fix's hard `NO_WORKTREE` path is replaced** with `ensureWorktreeForPr()`. Only a branch that's truly gone from the remote stays fatal. A worktree that's *present but dirty / on the wrong branch* keeps today's `409` behavior — rehydration never blows away uncommitted local work.
- **No schema migration initially.** Safety status is computed live from `git` + existing tables; if the list view proves slow, a `worktrees` cache table is a later, separable decision.
- **Worktree root location is unchanged** (`<parent-of-repo>/worktrees/<sanitized-branch>`). This ADR does not resolve the long-standing "Worktree root location (Phase A2)" pending decision — it keeps the status quo and leaves that open.

## Non-goals locked by this ADR

- **No agent-chat-driven worktree ops.** Destructive git plumbing stays deterministic CLI verbs + UI buttons (rejected option C).
- **No silent deletion.** Cleanup is badge-driven and click-confirmed (per-worktree or "clean merged" bulk); Forge never auto-prunes behind the operator's back.
- **No worktree mutation while a session is live in it.** An in-flight session pins its worktree; remove/test-locally refuse until it's terminal.
