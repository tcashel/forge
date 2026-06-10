# Notes for agents working in this repo

## What Forge is

Forge (this repo, TypeScript) **is the deliverable** — the operator's cockpit for staff engineers running agent fleets. Mission: make the operator 10000x. The old plan to rebuild it as a Rust + GPUI product ("Juicer", Track B) is archived ([`docs/archive/ROADMAP-track-b-juicer.md`](docs/archive/ROADMAP-track-b-juicer.md)); [`docs/ROADMAP.md`](docs/ROADMAP.md) is the authoritative plan (phases F0/F1/F2). The Workbench is a keeper, not legacy.

Core thesis: **"Plan. Run. Review. Ship. Don't watch."** Sessions are jobs, not shows.

## Documentation

Vision, roadmap, architecture, schema, and decisions live in `docs/`. **Read on demand — don't load the whole `docs/` tree.** The full set is ~2000 lines.

- [`docs/README.md`](docs/README.md) — docs landing page and reading order
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — **authoritative** phased delivery (F0 hardening → F1 one-shot quality → F2 scale)
- [`docs/VISION.md`](docs/VISION.md) — product thesis, target user, the five surfaces
- [`docs/BUILD_PATH.md`](docs/BUILD_PATH.md) — archived two-track plan, kept as historical record
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — module layout
- [`docs/SCHEMA.md`](docs/SCHEMA.md) — SQLite contract
- [`docs/COMPETITORS.md`](docs/COMPETITORS.md) — landscape snapshot (May 2026)
- [`docs/adr/`](docs/adr/) — numbered architecture decisions; start at [`docs/adr/README.md`](docs/adr/README.md) for the one-line index

## Working with ADRs

Before changing anything architectural, **open the relevant ADR** (`docs/adr/NNNN-*.md`). Index is in [`docs/adr/README.md`](docs/adr/README.md). Foundational ADRs to read first if you're new: 0019 (sessions are jobs), 0014 (differentiation before execution), 0031 (review publishing posture).

If a decision needs to change, **write a new ADR superseding the old one** — never edit an accepted ADR in place. Use [`docs/adr/template.md`](docs/adr/template.md).

## What still ships today

The CLI / Workbench described in [`README.md`](README.md) is the product. Operational and usage docs stay in the root README. Vision and roadmap docs stay in `docs/`.
