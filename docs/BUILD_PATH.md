# Build Path — Forge → Juicer

How we get from the existing TypeScript codebase to the polished Rust product, why it's two tracks, and the gate that moves us from one to the other.

---

## The frame

**Forge (this repo, TypeScript)** is the prototype track.
**Juicer (future repo, Rust + GPUI)** is the product track.

These are not competing plans. They are sequential phases of the same project, structured so that each one does what it's actually good at:

- **TypeScript answers product questions cheaply.** Surfaces, flows, what works, what doesn't.
- **Rust ships the answer with polish.** Native feel, premium presentation, the form a paid product needs to take.

Skipping the TS phase risks building polished surfaces that turn out to be the wrong shape. Skipping the Rust phase risks shipping a janky-looking product to an audience that won't tolerate it. Both errors are real and have killed real projects.

---

## Why this order

### Why TypeScript first

- **Forge already exists.** CLI, web dashboard, orchestration logic, agent integration, plan model. Reusing it cuts months off the path to validating product shape.
- **TypeScript iteration is fast.** Hot reload, broad library ecosystem, easy to throw things away. The five differentiated surfaces (plan workspace, multi-critic synthesis, In Flight view, triage queue, morning digest) need iteration on *shape*, not on *performance*.
- **The questions that matter at this stage are product questions, not engineering questions.** Does multi-critic synthesis with disagreement adjudication actually work, or is it overwhelming? Does the morning digest hit the way the VISION promises? Does headless execution feel right, or do users actually want a little visibility? You can answer these in TypeScript. You'd waste months answering them in Rust.

### Why Rust eventually

- **Product presentation is a precondition, not a finish.** Staff engineers running fleets are not switching from Conductor (free, polished, native) to a TypeScript app that looks like a side project. Polish is not optional for this audience.
- **Native feel matters at the ceiling.** Linear is the existence proof that Electron-class apps can be premium, but most aren't, and the difference comes from intense discipline. Rust + GPUI starts higher on the ceiling.
- **Marketing leverage.** "Built on the same UI framework as Zed" is a real signal. Tauri or Electron is harder to lean on.
- **The Rust port becomes much cheaper once the shape is settled.** Building Rust against a moving product is hard; building Rust against a frozen, validated spec is mostly translation work.

### Why not Tauri-only or Electron-only

Tauri or Electron with the existing TypeScript code is genuinely viable, and was seriously considered. It's the fastest path to a shipped product, and might be the right answer for many projects. For this one, two things tip the balance toward an eventual Rust rewrite:

1. The target audience is unusually opinionated about native feel.
2. The founder genuinely wants the Rust artifact as a portfolio piece, and that goal is real and worth taking seriously.

Both can coexist with TS-first: validate in TS, build the artifact in Rust. The Tauri-or-Rust question becomes "which is the *eventual* shell," not "what do we do now."

---

## The gate (surface-based)

Track B (Rust) begins when **all five of these are simultaneously true** for ~2 weeks of daily use:

1. **Plan workspace.** The document model has settled. The drafting-agent collaboration pattern feels right. The open-questions surfacing is in a shape that doesn't change every week.
2. **Multi-critic synthesis.** The critic configuration, parallel invocation, and synthesis surface work. The disagreement adjudication UX is one you reach for, not one you avoid.
3. **In Flight view.** The headless premise holds in practice — you really don't miss watching sessions. The phase indicator and ETA are accurate enough to trust. Drill-down to debug feels like the right escape hatch, not a primary surface.
4. **Risk-routed review queue.** Triage classification is accurate enough to batch-approve. Keyboard flow feels right.
5. **Morning digest.** Opening the laptop in the morning, you actually read it and act on it.

The point isn't "no bugs." Bugs are fine. The point is **shape**. When you stop wanting to redesign the surfaces and start wanting to polish them, that's the signal.

**Why surface-based and not time-based:** time-based gates either rush poorly-shaped surfaces into Rust or stall on Rust waiting for an arbitrary calendar date. Surface-based gates are aligned with the actual purpose of the prototype, which is to *learn* what the surfaces should look like.

**Why all-five-simultaneously and not majority:** Juicer's product thesis depends on the surfaces working together as a system. Plan → run → review → ship is one flow. If only four out of five are validated, the loop is incomplete and porting it early risks freezing in a broken integration.

---

## What the prototype is and isn't

### Forge during this period IS:

- The founder's daily driver for running agents
- A validation vehicle for the five surfaces
- Shareable with **trusted friends** for workflow feedback (small, hand-picked group; not public)
- Allowed to be ugly in places it doesn't matter (settings panels, edge cases)
- Allowed to be slow in places it doesn't matter (background tasks, infrequent operations)

### Forge during this period IS NOT:

- A publicly launched product
- A marketing artifact
- A subscription business
- A finished thing

The promotional/portfolio artifact is the Rust version. Forge is the workshop, not the showroom.

---

## What carries over from Forge to Juicer

Useful framing for what gets reused vs. rebuilt:

| What | Carries over? | How |
|---|---|---|
| Plan document representation (markdown + frontmatter) | ✅ Yes | Same on-disk format |
| SQLite schema | ✅ Yes | Rust can read Forge's DB |
| Plan library content | ✅ Yes | Plans you write in Forge live on in Juicer |
| Critic prompt library | ✅ Yes | Prompts are portable text |
| Agent adapter pattern | ✅ Conceptually | Re-implemented in Rust |
| Subprocess supervision logic | ⚠️ Re-implemented | Different concurrency model |
| UI components | ❌ Rebuilt | Different framework entirely |
| Workflow shape and surfaces | ✅ Yes | This is the whole point — validated shape ports forward |

The schema portability is intentional: I want the prototype to feed forward into the product, not be discarded.

---

## What this means for the roadmap

The phases on the ROADMAP map onto the tracks like this:

- **Track A — Forge (TypeScript)**
  - Phase A0: extend Forge's existing architecture into the new module structure
  - Phase A1: plan workspace + multi-critic synthesis
  - Phase A2: In Flight + auto-review + triage queue + morning digest
  - Phase A3 (optional): concurrent plans, fleet view, multi-agent — only if the shape questions warrant TS validation rather than going to Rust
  - **Gate decision point** at end of A2 (or A3)
- **Track B — Juicer (Rust + GPUI)**
  - Phase B0: GPUI calibration + workspace skeleton
  - Phases B1–B5: build the validated product, with the original five-phase roadmap structure, against the spec frozen by Track A

In practice, the gate likely fires after Phase A2. Phase A3 only happens if multi-plan concurrency raises shape questions that can't be answered from a single-plan prototype.

---

## Letting friends try it

A few principles when sharing Forge with trusted friends:

- **Frame it correctly.** "This is the prototype for a product I'm building. I want feedback on the workflow, not the polish. The polished version is coming and is in a different stack."
- **Be selective.** Hand-pick people who run agents seriously. Three or four good testers beat ten casual ones.
- **Ask for shape feedback, not feature feedback.** "Does this flow make sense?" beats "what features should I add?" The point is to validate, not to ship.
- **Don't promise stability.** It's a prototype. They should expect breakage. Be explicit.
- **Don't market.** No landing page, no public docs, no Twitter. The marketing artifact is the Rust version.
- **Capture feedback structurally.** A simple shared doc or Linear project for friend-feedback items. Sort by "does this change the shape" vs. "polish."

A specific anti-pattern to avoid: **friends asking for the TS version to keep growing**. If five friends use Forge and love it, there's pressure to keep extending it instead of porting. The gate exists to prevent that. When the surfaces are settled, the answer is "the better version is coming in Rust; help me prioritize the port" rather than "let's add this in TS."

---

## What success looks like for Track A

You can articulate, in concrete terms:

- What the plan workspace looks like (sections, drafting UX, open-questions surfacing)
- How the critic panel is configured and what synthesis outputs look like
- How disagreement adjudication flows
- What the In Flight view shows and what it deliberately doesn't
- What the triage queue's risk classification signals are and how they're rendered
- What the morning digest contains and how it's prioritized

…and you've used all of them daily for two weeks without wanting to redesign any of them.

At that point you have a spec. Then you build it in Rust.
