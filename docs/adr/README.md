# Architecture Decision Records

This directory holds dated, numbered decisions about Forge → Juicer.
Each ADR is **self-contained**. Read individual files on demand — **do not load this directory wholesale** into agent context.

## How to use

- **Reference ADRs by number** when discussing decisions (`ADR-0019`).
- **New ADRs:** copy [`template.md`](./template.md), increment the number, set status to `Proposed`.
- **Never edit accepted ADRs in place.** If a decision needs to change, write a new ADR and set the old one's status to `Superseded by NNNN-...`.
- The full convention (sections, status values, cross-link style) lives in [`template.md`](./template.md).

## Index

| #    | Title                                                                                       | Status                          |
| ---- | ------------------------------------------------------------------------------------------- | ------------------------------- |
| 0001 | [Juicer separate from Juice](./0001-juicer-separate-from-juice.md)                          | Accepted                        |
| 0002 | [Rust + GPUI for Juicer (Track B)](./0002-rust-gpui-for-juicer.md)                          | Accepted (clarified by 0021)    |
| 0003 | [Local-first, no required backend](./0003-local-first-no-backend.md)                        | Accepted                        |
| 0004 | [Bring your own agent](./0004-bring-your-own-agent.md)                                      | Accepted                        |
| 0005 | [Plan-as-document, not plan-as-chat](./0005-plan-as-document.md)                            | Accepted (clarified by 0026)    |
| 0006 | [Subprocess agents](./0006-subprocess-agents.md)                                            | Accepted                        |
| 0007 | [Git worktree per task](./0007-worktrees-per-task.md)                                       | Accepted (clarified by 0024)    |
| 0008 | [Critics are agents](./0008-critics-are-agents.md)                                          | Accepted                        |
| 0009 | [Workspace crate structure (Track B); mirror module names (Track A)](./0009-workspace-crate-structure.md) | Accepted (clarified by 0021) |
| 0010 | [Permissive licenses only](./0010-permissive-licenses-only.md)                              | Accepted                        |
| 0011 | [Forge retirement timeline](./0011-forge-retirement-timeline.md)                            | Accepted (revised by 0021)      |
| 0012 | [macOS-only through foreseeable future](./0012-macos-only.md)                               | Accepted                        |
| 0013 | [Position as "operator's cockpit"](./0013-operators-cockpit-positioning.md)                 | Accepted                        |
| 0014 | [Differentiation before execution](./0014-differentiation-before-execution.md)              | Accepted                        |
| 0015 | [No free tier on the public Juicer](./0015-no-free-tier.md)                                 | Accepted                        |
| 0016 | [Multi-critic synthesis with disagreement adjudication](./0016-multi-critic-synthesis.md)   | Accepted                        |
| 0017 | [Juice flywheel as structural moat](./0017-juice-flywheel-moat.md)                          | Accepted                        |
| 0018 | [Avoid IDE positioning](./0018-non-ide-positioning.md)                                      | Accepted                        |
| 0019 | [Sessions are jobs, not shows](./0019-sessions-are-jobs.md)                                 | Accepted                        |
| 0020 | [Hook-policy enforcement at agent level](./0020-hook-policy-at-agent-level.md)              | Accepted                        |
| 0021 | [Two-track build path: TS prototype → Rust product](./0021-two-track-build-path.md)         | Accepted                        |
| 0022 | [Skill + CLI as the agent↔orchestrator contract (no MCP)](./0022-skill-cli-as-agent-contract.md) | Accepted                        |
| 0023 | [SQLite cutover for Track A (Forge)](./0023-sqlite-cutover-track-a.md)                       | Accepted                        |
| 0024 | [Worktrees are disposable: lifecycle UI + lazy rehydration](./0024-worktrees-disposable-lifecycle.md) | Accepted               |
| 0025 | [Unified agent interface; agent owns conversation context](./0025-unified-agent-interface-agent-owned-context.md) | Accepted |
| 0026 | [Plan authoring is conversation-led; the document is the maintained artifact](./0026-conversation-led-plan-authoring.md) | Proposed |

## Foundational ADRs

If you're trying to understand the shape of the product quickly, read these in order:

1. [`0021-two-track-build-path`](./0021-two-track-build-path.md) — the meta-architecture (TS prototype → Rust product)
2. [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md) — the core thesis (jobs, not shows)
3. [`0014-differentiation-before-execution`](./0014-differentiation-before-execution.md) — the roadmap priority
4. [`0005-plan-as-document`](./0005-plan-as-document.md) — the central product surface
5. [`0001-juicer-separate-from-juice`](./0001-juicer-separate-from-juice.md) — the product boundary

## Pending decisions

Forward-looking decisions to capture as ADRs when they're made. Pulled from the original `DECISIONS.md` log.

- Track A UI shell: web dashboard vs. Tauri wrapper (Phase A0)
- GPUI version pinning strategy (after Phase B0)
- Plan document representation: markdown vs. AST (early Phase A1)
- Worktree root location (Phase A2) — still open; [`0024`](./0024-worktrees-disposable-lifecycle.md) keeps the `<parent>/worktrees/` status quo without deciding it
- ~~Agent stdio protocol: per-adapter vs. unified JSON-lines (Phase A2)~~ — resolved by [`0022`](./0022-skill-cli-as-agent-contract.md) (skill + CLI; no stdio protocol)
- Synthesis approach: agent-based vs. rule-based (Phase A1)
- Disagreement adjudication UX: inline vs. modal vs. separate workspace (Phase A1)
- Phase detection heuristics (Phase A2)
- ETA model (Phase A2)
- Hook config validation / baseline recommendations (Phase B3+)
- Juice integration contract (Phase B4)
- Pricing model and license (Phase B5)
- Conductor/Superset partnership integration (Phase B5)
