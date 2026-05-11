# Forge → Juicer — Vision & roadmap

> The operator's cockpit for staff engineers running agent fleets.
> Plan. Run. Review. Ship. Don't watch.

This directory is the canonical source of truth for **where Forge is going**. The repo root's `README.md` covers what ships today (the current TypeScript CLI + Workbench). These docs cover what the product is becoming.

## The thesis in one sentence

Conductor and Superset are tools for *watching* coding agents. Juicer is a tool for *deploying* them.

## Two tracks

- **Track A — Forge (TypeScript, this repo):** validates the five differentiated surfaces (plan workspace, multi-critic synthesis, In Flight view, risk-routed review queue, morning digest). Used daily by the founder; shared with trusted friends. Not for public launch.
- **Track B — Juicer (Rust + GPUI, future repo):** the polished, paid product, built from Track A's validated spec.

Surface-based gate: Track B begins only when all five surfaces have been used daily without major shape changes for ~2 weeks. See [`BUILD_PATH.md`](./BUILD_PATH.md) for details.

## Status

🚧 **Track A, pre-phase-1.** Documentation phase. The Forge CLI + Workbench described in the root README is the working substrate; these docs describe what it's becoming.

## Read in this order

1. **[`VISION.md`](./VISION.md)** — what we're building, the job-not-show thesis, competitive positioning
2. **[`BUILD_PATH.md`](./BUILD_PATH.md)** — the two-track model, why TS first then Rust, gate criteria
3. **[`COMPETITORS.md`](./COMPETITORS.md)** — current landscape (session-as-surface vs. headless)
4. **[`ROADMAP.md`](./ROADMAP.md)** — phased delivery across both tracks
5. **[`ARCHITECTURE.md`](./ARCHITECTURE.md)** — technical architecture (Track A TypeScript, Track B Rust)
6. **[`SCHEMA.md`](./SCHEMA.md)** — data model (shared across tracks)
7. **[`adr/`](./adr/)** — numbered architecture decisions; see [`adr/README.md`](./adr/README.md) for the index

## Companion product

**Juice** — Mac-native (Swift) app that mines coding agent conversation history and generates per-repo optimizations (CLAUDE.md, AGENTS.md, skills, settings, coaching). Juice ships first as a standalone product. The Forge→Juicer line reads Juice's outputs and feeds session history back to Juice's mining pipeline. The integration is the structural moat.

## Direct competitors

- [Conductor](https://www.conductor.build/) — free Mac app, Claude Code + Codex parallel execution
- [Superset](https://superset.sh/) — source-available Mac desktop, broadest agent support
- [Windsurf 2.0](https://docs.windsurf.com/windsurf/agent-command-center) — Cognition's IDE with Agent Command Center + Devin
- [Intent](https://www.augmentcode.com/) — Augment Code's spec-driven enterprise orchestrator

All of these treat the agent session as a first-class surface. Juicer doesn't.
