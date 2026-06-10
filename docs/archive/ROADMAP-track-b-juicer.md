# Archived — Track B (Juicer, Rust + GPUI) roadmap

> **Archived 2026-06-09.** Track B was paused by [ADR-0030](../adr/0030-strategy-reset-surfaces-commoditized.md) and removed from the active roadmap when the roadmap was rewritten around the one-shot mission. Forge (TypeScript) is the deliverable. This file preserves the Track B phase plan verbatim in case a product-shaped need ever revives it. Do not treat anything below as current plan.

---

# Track B — Juicer (Rust + GPUI)

Goal: ship the polished, paid product. Build from Track A's validated spec. The marketing artifact.

Track B starts only when the surface-based gate fires. See `BUILD_PATH.md`.

## Phase B0 — GPUI calibration + workspace skeleton

**Duration:** ~2-3 weeks
**Goal:** Verify GPUI. Set up the workspace. Read Zed source for calibration.

### Deliverables
- **GPUI throwaway:** one screen, two adjacent panels — left panel shows a fake job list, right panel shows a fake document with inline edits
- Read 3-5 Zed source modules (terminal, diff view, command palette) for calibration
- Cargo workspace skeleton with crate structure committed (see ARCHITECTURE.md Track B section)
- Database compatibility check: confirm Rust can read Forge's SQLite

### Exit criteria
GPUI go/no-go. Workspace builds. Can read Forge plans from disk.

---

## Phase B1 — Plan workspace + critic panel (Rust)

**Duration:** ~2-3 months
**Goal:** Port the validated plan workspace and critic panel surfaces to Rust + GPUI. Same shape, native polish.

The work here is mostly translation, since shape is settled. The remaining design space is the polish layer.

### Deliverables
- Plan workspace in GPUI (document-shaped, structured sections, inline drafting agent)
- Critic panel and multi-critic synthesis surface in GPUI
- Lock gate and adjudication UI in GPUI
- Plan library in GPUI
- SQLite layer in Rust (`sqlx`), reading the same schema Forge writes
- Plan export

### Exit criteria
You draft and lock a plan in Juicer. Feels meaningfully more polished than the Forge equivalent. Plan library reads existing Forge plans.

---

## Phase B2 — Run, review, ship (Rust)

**Duration:** ~2-3 months
**Goal:** Port the headless execution flow, In Flight view, triage queue, and morning digest to Rust.

### Deliverables
- Worktree management in Rust
- Subprocess supervisor (Tokio)
- In Flight view in GPUI
- Auto-review pipeline
- Risk-routed review queue in GPUI
- Morning digest in GPUI
- Concurrent execution

### Exit criteria
Full plan-to-ship loop works in Juicer. Forge can be retired (or kept as a fallback briefly).

---

## Phase B3 — The environment

**Duration:** ~3 months
**Goal:** Multi-plan concurrency. Fleet view. Multi-agent backends.

### Deliverables
- Multiple plans in flight simultaneously
- Fleet view — home screen showing all in-flight plans grouped by lifecycle stage
- Per-plan status, drill-down to plan workspace
- Notes attached to plans
- Plan library v2 — full FTS search, fork-from-existing, tag/filter
- Enhanced morning digest for multi-plan environment
- **Multi-agent backends** — adapters for Codex, Gemini CLI, opencode
- First read of Juice-generated configs

### Exit criteria
Comfortably run 5+ plans in parallel for at least two weeks.

---

## Phase B4 — Juice flywheel + advanced capabilities + first external users

**Duration:** ~4-6 months
**Goal:** Lock in the structural moat. Bring in trusted external users beyond the friend circle.

### Deliverables
- Deep Juice integration (read configs, write session history, joint dashboard)
- Speculative execution
- Plan-to-execution traceability
- Critique replay
- Outcome learning v1
- Dry-run mode
- **First external users (5-10 invited, beyond the original Track A friend circle)**

### Exit criteria
At least 5 invited users running Juicer daily. At least 2 give unsolicited testimonials about the headless flow. Juice flywheel measurable.

---

## Phase B5 — The product

**Duration:** ~6+ months
**Goal:** Commercial product. Revenue. Recognized category position.

### Deliverables
- Pricing and packaging (Personal $30-50/mo, Juice+Juicer bundle)
- Onboarding flows and first-run experience
- Landing page, documentation site, demo screencasts
- Public Discord or community
- Code signing, notarization, update mechanism
- Opt-in privacy-preserving telemetry
- Crash reporting, license management
- Remote execution over SSH
- Plugin / extension system v1
- Possible Conductor or Superset integration partnership

### Exit criteria
$20-50k MRR. Distinct category recognition. Roadmap driven by user signal.
