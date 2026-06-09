# ADR 0029 — Repo setup lifecycle + validated quality-gate contract

**Status:** Proposed
**Deciders:** Tripp
**Date:** 2026-06-02
**Related:** [`0019-sessions-are-jobs`](./0019-sessions-are-jobs.md), [`0022-skill-cli-as-agent-contract`](./0022-skill-cli-as-agent-contract.md), [`0023-sqlite-cutover-track-a`](./0023-sqlite-cutover-track-a.md), [`0021-two-track-build-path`](./0021-two-track-build-path.md), [`../VISION.md`](../VISION.md)

## Context

Forge runs agents unattended — "Plan. Run. Review. Ship. Don't watch." ([`0019`](./0019-sessions-are-jobs.md)). The implicit precondition is that a repo is *operable*: gh is authed, the worktree bootstraps clean, agent binaries resolve, and — critically — the **quality gate actually runs the right checks**. Today none of that is verified before the first spec. Three concrete failures surfaced this:

1. **The quality gate is an ephemeral per-stack guess.** `detectQualityCommands` / `pkgMgr` (`src/core/repo.ts`) sniff lockfiles and script names and pick commands on *every* invocation — never persisted, never validated, never confirmed. A bun repo silently got `npm run …` because `pkgMgr` had no bun branch (its sibling `jsInstallCmd` did). The dangerous version of this bug isn't a wrong runner that happens to pass through — it's a gate that **selects a test command that runs nothing and reports green**, shipping unverified code and recording a clean delivery in the Cost-to-Ship lens that never happened.

2. **The detector can't span the real surface.** The interface to a repo's checks is usually a task runner the repo defines (`just`, `make`, `mise`, `poe`, `task`, `nx`, `turbo`, `cargo make`, `scripts/ci.sh`), not a language default — an open-ended set no per-stack table can enumerate. `detectStack` also returns a single stack, so polyglot repos get a fraction of their checks. And toolchain activation (mise/asdf/`rust-toolchain.toml`) is a separate axis: a correctly-named command can still resolve to the wrong tool version.

3. **There is no "is this repo set up?" state, and detection drift is invisible.** Ephemeral detection means a lockfile or CLAUDE.md change silently changes behavior with no signal.

A live incident during this work made the cost vivid: deleting test-fixture plans from the DB kept getting reverted because a running `forge serve` re-seeded `~/.forge/index.json` from memory and the JSON→DB backfill (`src/core/db/backfill.ts`, `INSERT OR IGNORE`) re-materialized them on read. That is the same root disease as the gate problem — **detection/seed logic treated as ephemeral and re-derived, rather than a reviewed, persisted, single-source-of-truth contract.**

`RepoConfig` (`src/core/store.ts`) already persists per-repo agents, models, and gh account, but has **no quality-command field and no setup stamp**. The home for the contract exists; the lifecycle around it does not.

## Options

### A — Keep ephemeral detection, just add more cases

**Pros:** Zero new concepts; one-line fixes (e.g. add the bun branch).
**Cons:** Doesn't address the failure *mode* — only ever a wrong guess away from silent-green. Can't cover the open-ended task-runner/polyglot/toolchain surface. No drift signal. Re-derived every run.

### B — Require a hand-written config before any repo is usable

**Pros:** Fully explicit; no guessing.
**Cons:** Kills the zero-config first-run magic that "don't watch" depends on. High friction; most repos never get configured well.

### C — A setup lifecycle that detects → validates → persists → blesses, with detection as bootstrap (chosen)

A one-time, re-runnable **`forge setup`** pass turns ephemeral detection into a reviewed, persisted contract on `RepoConfig`. Its defining step is **validation**: actually *run* the candidate quality commands once and confirm they exist, exit 0 on clean HEAD, and did real work (tests collected > 0). The deterministic checklist lives in the CLI core (portable to Track B); fuzzy long-tail cases delegate to a setup **skill/agent** ([`0022`](./0022-skill-cli-as-agent-contract.md)).

**Pros:** Preserves zero-config first run (detection still proposes), but the proposal is *proven* and *persisted* before it's trusted. Kills silent-green. Spans polyglot/task-runner cases via aggregate-target detection + agent inference. Gives an explicit operable state and drift detection. `doctor` falls out as the same checklist run read-only.
**Cons:** New lifecycle state and a config-schema/SQLite-contract extension. Validation has a runtime cost. Correctness must not depend on the (Track-A-only) skill.

## Decision

A repo becomes *operable* only after a **setup pass** that produces a **validated, persisted quality-gate contract**.

- **`forge setup <repo>`** (deterministic CLI core) owns the checklist: gh auth/account/host, default-branch resolution, agent binaries on PATH, worktree bootstrap rehydrates clean, CLAUDE.md/AGENTS.md presence, `.forge` writability, and quality-command resolution + **validation**. It writes results + a `setupVersion`/`setupAt` stamp into `RepoConfig`.
- **Quality-gate resolution ladder** (highest wins), persisted with a `source` tag: `declared` (explicit `[quality]` in repo/Forge config or a `scripts/forge-check.sh` sentinel) → `aggregate` (the repo's own canonical target: `just check` / `make ci` / `poe check-all` / npm-script `check|ci|verify` / `task`) → `guessed` (today's per-stack table, **only as last resort and logged as a guess**). The guess is persisted and editable, never silently re-derived.
- **Validation is mandatory** for the chosen commands: prove they exist and do real work before the gate is trusted. The gate distinguishes `declared|aggregate|guessed|none` so the rework/shipped lens can discount or flag specs whose gate was guessed or empty.
- **`forge doctor`** is the same checklist run read-only as a health report; `setup` is the mode permitted to write fixes. Setup runs inside a real bootstrapped worktree so toolchain activation (mise/asdf) is exercised, not just the repo root.
- **Setup is a soft gate** with override, except the quality gate, which is required — a repo with an unvalidated/empty gate cannot ship unattended.

**Rationale:** Detection is valuable as *bootstrap* but corrosive as *contract*. Making the proposal visible, validated, and persisted keeps zero-config onboarding while removing the silent-wrong failure mode that directly threatens the "don't watch" promise.

**Risks to monitor:** Validation latency (mitigate: full lint/typecheck but collect-only for tests where supported); the skill becoming load-bearing for correctness (forbidden — see non-goals); stamp staleness logic producing false "needs re-setup" churn.

## Consequences

- **Contract surface grows:** `RepoConfig` gains `qualityCommands` + `source` + setup stamp; SQLite/JSON state gains a notion of repo operability. Must be migrated and kept single-source-of-truth — no second store re-deriving it (the backfill/serve re-seed incident is the cautionary tale: deletes/edits to a derived store get reverted unless there is one owner).
- **Behavior becomes inspectable:** "what will the gate run, and is it proven?" is answerable before launch, and drift is signalled rather than silent.
- **Track B inherits the model, not the code:** the checklist + contract live in the portable CLI core; the skill is a Track-A accelerator only.
- **Cost:** added onboarding step and validation runtime; a new lifecycle state to maintain and surface in the Workbench.

## Implications for current work

- Supersedes the immediate `pkgMgr` bun-branch patch as the *real* fix: that patch stays as a stop-gap for the `guessed` tier, but the durable answer is the resolution ladder + validation.
- Pairs with [`0028`](./0028-spec-dependency-graph-and-orchestration-agent.md): orchestration assumes repos are operable; setup is the precondition that assumption rests on.
- The Cost-to-Ship / "fought back" lens should consume the gate `source` so guessed/empty gates don't read as verified deliveries.

## Non-goals locked by this ADR

- **Not** a universal build-system abstraction — Forge never tries to *understand* every runner; it runs the repo's own declared/aggregate entrypoint or a logged last-resort guess.
- **Correctness never depends on the skill.** The CLI checklist + persisted contract are the source of truth; the skill only proposes/accelerates and must be absent-tolerant (headless, Track B).
- **Not** a replacement for CI — the gate is the unattended-ship precondition, not the project's authoritative test pipeline.
