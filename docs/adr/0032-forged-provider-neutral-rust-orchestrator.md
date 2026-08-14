# ADR 0032 — forged: a provider-neutral Rust orchestrator supersedes both product lines

**Status:** Accepted — enacted by the epic merge (PR #97) and the supersession PR removing the TypeScript tree
**Deciders:** Tripp
**Date:** 2026-08-12
**Related:** [`0030-strategy-reset-surfaces-commoditized`](./0030-strategy-reset-surfaces-commoditized.md) (supersedes), [`0011-forge-retirement-timeline`](./0011-forge-retirement-timeline.md), [`0010-permissive-licenses-only`](./0010-permissive-licenses-only.md) (extended here), [`0004-bring-your-own-agent`](./0004-bring-your-own-agent.md)

## Context

ADR-0030 froze the TypeScript cockpit and posed an experiment: does Forge's
value reassemble from bare Claude Code parts (skills, Workflows, subagents)
plus beads? The **anvil** plugin (in the sibling smithy repo) answered YES —
it dogfooded successfully in June 2026 and again, at much larger scale, by
building this repo's successor (below). The bare-parts question is settled
and is no longer the interesting one.

Two new facts changed the frame in August 2026:

1. **A 24-hour Claude Max quota stall halted all work.** The anvil pipeline,
   living entirely inside one provider's harness, could not be resumed from
   the other provider's CLI. Durable cross-provider continuation became the
   hard requirement no skill-layer arrangement can satisfy.
2. **bd (beads) ≥ 1.2.x shipped native work leases** — atomic claim, TTL,
   heartbeat, scoped reclaim — meaning an orchestrator no longer needs to
   build bead-level ownership at all.
3. **anvil's own dogfood measured the bare-parts ceiling.** The forged-v0
   build epic recorded ~12.4M workflow tokens; roughly half went to
   deterministic plumbing wearing a model (67 of 142 agent seats were
   checklist work) and to recovery-by-rerun (26% of post-adjudication spend
   re-ran pipelines because a blocked slice could not resume). The full
   accounting lives in the operator's retro
   (`~/.anvil/runs/beads-4zp-retro.md`); the headline: the run's dominant
   waste is exactly what a deterministic kernel eliminates.

## Options

### A — Stay bare-parts (anvil TS workflows only)

**Pros:** zero new code; the pipeline demonstrably ships quality work.
**Cons:** cannot survive provider death (the 24-hour stall); pays model
tokens for deterministic plumbing forever; state scattered across workflow
snapshots with no durable attempt identity.

### B — TypeScript kernel inside the existing tree (epic beads-5rz)

**Pros:** reuses the existing codebase and test culture.
**Cons:** planned before bd 1.2.x leases existed — much of its scope is now
upstream; still single-runtime; the tree it would extend is the retired
cockpit. Parked frozen as the fallback (its bead family carries the
requirements record).

### C — forged: a fresh Rust workspace, provider-neutral by construction (chosen)

**Pros:** one binary any driver can call (`forged claim-next` is the
stateless resume verb); SQLite ledger with claim-token fencing and an
idempotency envelope; bd's native leases carry WHO/WHEN; crash-safety proven
by failpoint schedules rather than asserted by design prose.
**Cons:** a second implementation to maintain; Rust build times; the skill
layer (anvil) must migrate its plumbing onto it (pending, P3).

## Decision

Build **forged** (option C). The organizing rule that governs every
boundary: **bd owns WHO and WHEN** (readiness, lease claims, gates, waves);
**forged owns WHERE and WHAT HAPPENED** (stage cursor, attempts, operations,
artifacts, usage); execution vessels sit behind a thin `SessionHost` trait;
**GitHub is the code truth**, and every external effect is fenced by
confirmed process death → idempotency keys → effect probes, in that order.
Write tiers: planners write bd directly, drivers write through forged,
workers never write bd.

The TypeScript application (cockpit, workbench, cc-plugin, opencode-plugin,
its CI and docs) is removed from the working tree by the supersession PR.
It remains in git history; ADRs 0001–0031, the experiment records under
`docs/experiments/`, and `docs/archive/` are retained as the decision trail.

## Evidence

forged v0 was built by the anvil pipeline as its own last dogfood
(2026-08-11/12): eight slices, PRs #88 and #90–#96, merged to `main` as
PR #97 — 137 files, +35,336 lines, zero deletions against the untouched TS
tree. Every slice passed plan → three-critic panel (two Claude models + a
Codex leg) → operator adjudication → implement → gate → dual-family review →
bounded fix rounds. Cross-family review caught defects that would have
shipped: a shell injection, fencing fail-opens, a compliance-theater bd
probe, a claim-next scan bug, an `is_error` success fallthrough. Five spec
amendments and three overruled reviewer findings are on the record in the
slice PRs.

Crash-safety is proven by a nine-schedule failpoint kill matrix asserting
final repo content and process non-overlap, plus a genuine bd lease-expiry
run against the real 1.2.1 binary (lease lapsed at 306s; scoped reclaim
named the dead holder; bead returned to open).

**Acceptance is still open.** v0 tags only when the cross-provider falsifier
passes: a Claude-driven slice killed -9 mid-flight, resumed to the draft-PR
stop by a `codex exec` session through `forged claim-next`, with zero
duplicate claims or GitHub effects. If the falsifier fails, this ADR's bet
fails and the TS-kernel path (option B) un-parks.

## Operational findings worth recording (upstream has no resilience docs)

- bd 1.2.1 lease TTL is **hardcoded at 5 minutes** (no CLI/config knob) ⇒
  heartbeat guardians must renew at ≤ TTL/3; reclaim `--older-than` counts
  from **expiry**, not last heartbeat.
- `bd ready --claim` races resolve safely (loser gets an empty result);
  heartbeat is owner-only; unexpired leases are unreclaimable even at
  `--older-than 0s`; leases are node-local and ephemeral.
- **merge-slot bare release force-releases any holder** (confirmed live) ⇒
  always `--holder`; slots are structurally unreapable by bd (no timestamp),
  so forged owns the acquisition clock.
- bd 1.2.x creates a machine-global `~/.beads`; under mixed versions older
  binaries prefer it over `$BEADS_DIR` and silently read the wrong store.
  Never run mixed bd versions against live state; agents never run package
  managers (a mid-epic `brew upgrade beads` by a subagent forced an
  emergency store migration — the incident that hardened this rule).

## License provenance

The repo is MIT with the OpenAI/Anthropic rider (PR #89), matching the
operator's other repos. Extending ADR-0010: the **Dicklesworthstone
portfolio** (`beads_rust`, `fastmcp_rust`, `frankenterm`, `asupersync`) is
**hard-excluded from code use and from agent analysis** — its license rider
defines restricted "use" to include analyzing the code, so only LICENSE
files and public metadata were ever read, and nothing was derived from those
codebases. beads itself (gastownhall/beads, MIT) and rmcp (Apache-2.0/MIT,
the official MCP Rust SDK, adopted at 3.1.2) are the sanctioned
dependencies. Herdr (Apache-2.0) remains an optional vessel behind
`SessionHost`.

## Consequences

- This repository is now the forged Rust workspace; README, CLAUDE.md, CI
  (`rust.yml`), and dependabot were rewritten for it.
- smithy's cardinal rule "anvil never shells out to forge" is retired with
  the experiment that needed it. Successor rule: **anvil reaches forged only
  through its typed CLI/MCP contracts; no cognitive stage lives in forged.**
  Anvil 0.3 completed that migration: dispatch and epic execution submit to
  forged, while the Workflow/watch execution stack was removed.
- The build retro's process actions (resumable blocked-state fix rounds,
  deterministic readiness, chunked review coverage, evidence persisted on
  PRs, spec-size enforcement) belong to smithy and are tracked there.

## Clarification — 2026-08-14

The pending thin-client migration described above is complete in the current
Forge tree, with one distribution correction learned through dogfooding: the
next containing Forge release owns the dual-host lead-agent plugin in
`plugins/forged`. Its Claude and Codex manifests point to one shared skill tree
that plans, critiques, adjudicates, and performs the explicit typed handoff.
Smithy Anvil 0.3.1 remains historical evidence and is not an installation or
runtime dependency.

This does not change the ADR's organizing rule. The plugin is a lead-agent
adapter, not part of the Rust execution kernel: it writes native Bead
specification fields and uses Forged's public CLI contracts only after
adjudication. Beads still owns work and readiness; Forged still owns durable
execution state; provider adapters still perform execution cognition; GitHub
still owns delivery truth.
