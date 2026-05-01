# Severity — How to Label Spec Findings

Every finding gets exactly one label. When you're between two adjacent labels, pick the higher one.

## BLOCKER — The agent will fail

Use when **any** of:

- **Acceptance criterion is untestable.** "The feature works correctly" — correct according to what? The agent has no way to verify this.
- **Critical file path is wrong.** The spec says to modify `src/auth/session.ts` but the file doesn't exist, or the function it references isn't there.
- **Contradictory requirements.** Section A says "never auto-edit the spec" and section B says "apply all recommendations automatically".
- **Missing error handling spec.** The feature involves I/O, network, or user input but the spec doesn't define what happens on failure.
- **Key decision deferred to agent.** "Choose an appropriate caching strategy" — the agent will guess, and guess wrong.

## HIGH — Significant gap likely

Use when **any** of:

- **Acceptance criterion is vague but not untestable.** "Tests cover the main paths" — which paths? How many? What assertions?
- **Edge case not addressed.** The spec covers creation but not deletion, or success but not failure.
- **Implicit assumption.** The spec assumes a dependency exists, a config value is set, or a pattern is followed, without stating it.
- **Scope mismatch.** An acceptance criterion asks for something not described in "What We're Building".
- **Missing integration point.** The spec describes a new module but doesn't say how existing code calls it.

## MEDIUM — Ambiguity the agent will probably resolve

Use when:

- **Wording is imprecise but intent is clear.** "Update the tests" — which test file? The agent can probably find it, but shouldn't have to.
- **Minor missing context.** A term is used without definition but is standard in the codebase.
- **Ordering ambiguity.** The spec lists steps but doesn't say whether order matters.
- **Style inconsistency in the spec.** Some criteria are specific, others are hand-wavy, but the hand-wavy ones are for low-risk items.

## LOW — Clarity nit

Use when:

- **Typo or grammar issue** in the spec that doesn't affect meaning.
- **Redundant section.** The same information appears in two places.
- **Could be more specific but it's fine.** "Add appropriate logging" for a non-critical debug path.

## Decision rule

> If the implementing agent hits this issue mid-run, what happens?

| Answer | Severity |
|---|---|
| Agent produces wrong output or crashes | BLOCKER |
| Agent produces incomplete output | HIGH |
| Agent wastes time figuring it out | MEDIUM |
| Agent doesn't notice | LOW |
