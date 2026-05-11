# ADR 0021 — Two-track build path: TypeScript prototype, Rust product

**Status:** Accepted (clarifies [`0002-rust-gpui-for-juicer`](./0002-rust-gpui-for-juicer.md), [`0009-workspace-crate-structure`](./0009-workspace-crate-structure.md), [`0011-forge-retirement-timeline`](./0011-forge-retirement-timeline.md))
**Deciders:** Tripp
**Date:** 2026-05-11
**Related:** [`../BUILD_PATH.md`](../BUILD_PATH.md), [`../ROADMAP.md`](../ROADMAP.md), [`../ARCHITECTURE.md`](../ARCHITECTURE.md), [`../SCHEMA.md`](../SCHEMA.md), [`../VISION.md`](../VISION.md)

## Context

Three considerations converged on the question of *how* Juicer gets built:

1. **The founder's stated preference**: ship a product that demonstrates technical capability for self-promotion, not get stuck fighting UI tooling.
2. **Product presentation is a precondition** for the target audience. Staff/principal engineers won't switch from polished free competitors to a janky-looking app. The polish bar is unusually high.
3. **The existing Forge codebase** (TypeScript CLI + web dashboard) already implements much of the orchestration backbone. A purely Rust-first path risks slow shipping and wasted existing work; a purely TypeScript path risks a polish ceiling too low for the audience.

A single-track decision in either direction fails one of these three. The two-track structure is what falls out when all three are taken seriously.

## Options

### A — Two-track: TS prototype (Track A) → Rust product (Track B) (selected)

**Pros:**
- Fast iteration on shape (Track A) before committing to native polish (Track B).
- Existing Forge code is leveraged, not discarded.
- Surface-based gate forces the polish investment to wait until the shape is right.
- The Rust artifact remains the portfolio piece.

**Cons:**
- Two codebases, two stacks, two skill sets.
- Risk of getting comfortable in Track A and never porting (mitigated by the gate and by [`0011-forge-retirement-timeline`](./0011-forge-retirement-timeline.md)).

### B — Pure Rust from day one

**Rejected.** Slow shipping; risk of building polished surfaces around the wrong shape; the existing Forge codebase becomes wasted work.

### C — Pure TypeScript permanently (Tauri or Electron)

**Rejected.** Ceiling on native polish too low for the target audience; weaker marketing artifact; misses the founder's stated preference for the Rust artifact.

### D — Tauri with the existing TS code as the permanent stack

**Seriously considered.** Linear is the existence proof that Electron-class apps can feel premium. Tipped against because of (a) the target audience's unusual sensitivity to native feel and (b) the founder's explicit preference for the Rust artifact as portfolio.

### E — vercel-labs/zero-native (Zig + web UI)

**Rejected.** 3 days old at time of decision. Too immature for a 6-month project.

### F — Build TS prototype but commit publicly only to that

**Rejected.** Shifts the goal from "build a product I want" to "ship the smallest possible thing." Founder is willing to invest in the polished version.

## Decision

Build in **two sequential tracks**:

- **Track A — Forge (TypeScript, this repo):** validates the five differentiated surfaces (plan workspace, multi-critic synthesis, In Flight view, risk-routed review queue, morning digest). Built on top of existing Forge code. Used daily by the founder; shared with 3-5 trusted friends for workflow feedback in Phase A3. **Not for public launch.** Allowed to be ugly where it doesn't matter.

- **Track B — Juicer (Rust + GPUI, future repo):** the polished, paid public product. Built from Track A's validated spec. **The marketing artifact.**

**Gate: surface-based.** Track B begins only when all five surfaces have been used daily without major shape changes for ~2 weeks. See [`../BUILD_PATH.md`](../BUILD_PATH.md) for details.

**Schema compatibility.** Track A and Track B use the **same SQLite schema**, written in migration files runnable from either language. Plan library content, critic configs, and run history carry forward across the transition.

## Consequences

- The existing Forge codebase is **reframed**: it's not "the thing I use until Juicer is ready," it's **the Juicer prototype**. Investment in it is intentional, not regrettable.
- Two-track structure documented in dedicated [`../BUILD_PATH.md`](../BUILD_PATH.md).
- Roadmap restructured around tracks (see [`../ROADMAP.md`](../ROADMAP.md)).
- Architecture documents both stacks side-by-side (see [`../ARCHITECTURE.md`](../ARCHITECTURE.md)).
- Schema explicitly designed for portability across tracks (see [`../SCHEMA.md`](../SCHEMA.md)).
- Module names in Track A mirror crate names in Track B for ease of conceptual port (per [`0009-workspace-crate-structure`](./0009-workspace-crate-structure.md)).
- Friends-trying-the-prototype protocol added to [`../BUILD_PATH.md`](../BUILD_PATH.md) (selective invites, shape feedback over feature feedback, no public marketing).
- [`0002-rust-gpui-for-juicer`](./0002-rust-gpui-for-juicer.md) is preserved but clarified as the **Track B target**. It is not superseded.
- [`0009-workspace-crate-structure`](./0009-workspace-crate-structure.md) is preserved as the Track B structure, with a Track A mirror.
- [`0011-forge-retirement-timeline`](./0011-forge-retirement-timeline.md) is revised: retirement aligned with Track B Phase 2 completion.

## Non-goals locked by this ADR

- **Anti-pattern flagged:** if friends love the TS prototype, there's pressure to extend it instead of porting. The surface-based gate exists to prevent this. The answer to "add this in TS" once the gate fires is "**help me prioritize the port**," not "we'll add it in TS too."
- **No public marketing of Forge.** Track A is for the founder and trusted friends; public launch is a Track B event.
- **No Rust experimentation in Track A.** Cross-track curiosity is fine; cross-track scope creep is what kills the gate.
