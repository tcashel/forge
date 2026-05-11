# Notes for agents working in this repo

## What Forge is becoming

Forge (this repo, TypeScript) is the **prototype track** for **Juicer** — the operator's cockpit for staff engineers running agent fleets. The eventual paid product is Rust + GPUI in a separate repo.

Core thesis: **"Plan. Run. Review. Ship. Don't watch."** Sessions are jobs, not shows.

## Documentation

Vision, roadmap, architecture, schema, and decisions live in `docs/`. **Read on demand — don't load the whole `docs/` tree.** The full set is ~2000 lines.

- [`docs/README.md`](docs/README.md) — docs landing page and reading order
- [`docs/VISION.md`](docs/VISION.md) — product thesis, target user, the five surfaces
- [`docs/BUILD_PATH.md`](docs/BUILD_PATH.md) — two-track model (Track A TS prototype → Track B Rust product)
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — phased delivery
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Track A modules / Track B crates
- [`docs/SCHEMA.md`](docs/SCHEMA.md) — SQLite contract shared across tracks
- [`docs/COMPETITORS.md`](docs/COMPETITORS.md) — landscape snapshot (May 2026)
- [`docs/adr/`](docs/adr/) — numbered architecture decisions; start at [`docs/adr/README.md`](docs/adr/README.md) for the one-line index

## Working with ADRs

Before changing anything architectural, **open the relevant ADR** (`docs/adr/NNNN-*.md`). Index is in [`docs/adr/README.md`](docs/adr/README.md). Foundational ADRs to read first if you're new: 0021 (two-track build), 0019 (sessions are jobs), 0014 (differentiation before execution).

If a decision needs to change, **write a new ADR superseding the old one** — never edit an accepted ADR in place. Use [`docs/adr/template.md`](docs/adr/template.md).

## What still ships today

The current CLI / Workbench described in [`README.md`](README.md) is the Track A implementation. Operational and usage docs stay in the root README. Vision and roadmap docs stay in `docs/`.
