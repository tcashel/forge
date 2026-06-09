# Handoff — Operator-Scope Validation Experiment (gates ADR-0030)

> Paste the prompt below into a fresh Claude Code session in this repo to run the experiment.
> Full strategic context lives in [ADR-0030](../adr/0030-strategy-reset-surfaces-commoditized.md) and the agent memory index (`MEMORY.md`).

---

You are picking up a deliberately-compacted thread. Your job is to **run a 2-week validation experiment that decides whether Forge should exist as a product**, then report the result. Do not assume Forge should exist — the prior analysis was found to be motivated reasoning, and an Opus adversarial review concluded "kill Track B; ship a skill pack." One counter-argument survived: Forge's value may be **operator-scoped, zero-repo-imposition integration**. This experiment tests exactly that. Stay skeptical; your value is an honest verdict, not a justification.

## Read first (do not skip)
- `docs/adr/0030-strategy-reset-surfaces-commoditized.md` — the strategy reset and why this experiment is the gate.
- Agent memories (loaded via `MEMORY.md`): `forge-operator-scoped-differentiator`, `beads-hands-on-friction`, `multi-critic-synthesis-deferred`, `forge-a2-build-order`.
- The existing skill prompts you will reuse: `skills/forge-planner`, `skills/forge-critic`, `skills/forge-synthesizer`, `skills/forge-reviewer`.

## The hypothesis to FALSIFY
"Forge (Track A) must exist; bare skills + beads can't capture its value — **and** its operator-scoping isn't just config."

## Setup (days 1–3) — build the bare-parts alternative, NOT more Forge
1. Install `beads_rust` (`br`; MIT, SQLite). Configure it **operator-scoped and non-invasive on purpose**: try to run it WITHOUT committing a per-repo DB and WITHOUT editing the repo's CLAUDE.md (use `BEADS_DIR` / `--stealth` / user-scoped config). Record exactly what it takes.
2. Adapt the four existing `skills/forge-*` prompts into **user-scoped** Claude Code skills (`~/.claude/skills`, not repo-committed): `plan` (plan-mode + maintain `spec.md` sections + open-questions lock gate), `critic-panel` (a Claude Code Workflow judge-panel returning agreements/disagreements/cruxes as JSON), `adjudicate` (print each crux, take A/B/edit, write back to `spec.md`, gate on zero unresolved), `dispatch-and-review` (pull `br ready`, launch headless under your hook policy, run an auto-review Workflow, label PRs via `gh`).
3. Wire **one Routine** (nightly + on-PR): `br ready` → dispatch → auto-review → post a morning digest (completions, blockers, queue state, next action) to Slack/terminal. No GUI.

## Run (days 4–12) — daily-drive ONLY the bare-parts stack
- Lock ≥3 real specs through the `plan` skill + lock gate.
- Run `critic-panel` + `adjudicate` on each.
- Burn one small epic (`br` parent + children) ready→dispatch→review→merge **without watching a session**.
- Do it across **at least two different repos**, including a worktree-heavy one.

## Measure (days 13–14) — the questions that actually matter
1. **Operator-scope / zero-imposition (the decisive one):** Could you get operator-scoped, **worktree-safe**, zero-repo-imposition plan→spec→run→review out of bare parts? Or did assembling it **reassemble Forge** (out-of-repo state, repo-untouched, worktree-keyed)? Log every place the bare stack forced a repo/CLAUDE.md/teammate-visible change.
2. **Digest:** did the morning Routine orient you in <60s? (y/n)
3. **Adjudication friction:** rate each crux-resolution 1–5.
4. Anything you needed a native surface for that a skill/`gh`/`br` couldn't render? (expected: nothing.)

## Decision rule (report which fires)
- Assembling the non-invasive operator workflow **kept landing back at Forge** → **Track A IS the product**; flip ADR-0030 to Accepted, keep scope lean (skill-first, out-of-repo, non-invasive). Do NOT start Track B/Rust.
- `BEADS_DIR` + user-scoped skills + a Routine got you ~90% there in an afternoon → **ship the skill pack, retire Forge-as-product** (ADR-0030 Option B).
- Only crux-adjudication genuinely hurt (≥4/5) and everything else was fine → build **just** an adjudication TUI over `forge dash`; nothing more.

## Deliverable
A short report: which decision-rule branch fired, the operator-scope log (#1), the digest y/n, the adjudication friction average, and a one-line recommendation. Then update `docs/adr/0030-strategy-reset-surfaces-commoditized.md` status accordingly (Accepted / superseded-by-Option-B / amended).

## Guardrails
- Do not build Track B / Rust / GPUI. Do not build `work_items`/`work_item_edges`. Do not build a Jira↔beads sync layer.
- Do not rescue Forge by reflex; do not nihilistically kill it either. Let the operator-scope log and the friction numbers decide.
