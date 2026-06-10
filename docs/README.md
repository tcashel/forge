# Forge — Vision & roadmap

> The operator's cockpit for staff engineers running agent fleets.
> Plan. Run. Review. Ship. Don't watch.

This directory is the canonical source of truth for **where Forge is going**. The repo root's `README.md` covers what ships today (the TypeScript CLI + Workbench). These docs cover what the product is becoming.

## The thesis in one sentence

Conductor and Superset are tools for *watching* coding agents. Forge is a tool for *deploying* them.

## Status

🔨 **Phase F0 — production hardening.** Forge (TypeScript, this repo) **is the deliverable**; see [`ROADMAP.md`](./ROADMAP.md) for the authoritative phases (F0 hardening → F1 one-shot quality → F2 scale). The earlier plan to rebuild it as a Rust + GPUI product ("Juicer", Track B) is archived at [`archive/ROADMAP-track-b-juicer.md`](./archive/ROADMAP-track-b-juicer.md); it returns only if a product-shaped need revives it.

## Read in this order

1. **[`ROADMAP.md`](./ROADMAP.md)** — the authoritative plan: operating principles and phased delivery
2. **[`VISION.md`](./VISION.md)** — the job-not-show thesis, target user, the surfaces, competitive positioning
3. **[`COMPETITORS.md`](./COMPETITORS.md)** — current landscape (session-as-surface vs. headless)
4. **[`ARCHITECTURE.md`](./ARCHITECTURE.md)** — technical architecture
5. **[`SCHEMA.md`](./SCHEMA.md)** — SQLite data model
6. **[`adr/`](./adr/)** — numbered architecture decisions; see [`adr/README.md`](./adr/README.md) for the index

Historical record: [`BUILD_PATH.md`](./BUILD_PATH.md) documents the archived two-track (TS prototype → Rust product) plan. Read it for context, not as the current plan.

## Companion product

**Juice** — Mac-native (Swift) app that mines coding agent conversation history and generates per-repo optimizations (CLAUDE.md, AGENTS.md, skills, settings, coaching). Juice ships as a standalone product; Forge can read its outputs and feed session history back to its mining pipeline.

## Direct competitors

- [Conductor](https://www.conductor.build/) — free Mac app, Claude Code + Codex parallel execution
- [Superset](https://superset.sh/) — source-available Mac desktop, broadest agent support
- [Windsurf 2.0](https://docs.windsurf.com/windsurf/agent-command-center) — Cognition's IDE with Agent Command Center + Devin
- [Intent](https://www.augmentcode.com/) — Augment Code's spec-driven enterprise orchestrator

All of these treat the agent session as a first-class surface. Forge doesn't.
