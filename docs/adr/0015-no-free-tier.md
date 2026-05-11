# ADR 0015 — No free tier on the public Juicer product

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-05-11
**Related:** [`0004-bring-your-own-agent`](./0004-bring-your-own-agent.md), [`0013-operators-cockpit-positioning`](./0013-operators-cockpit-positioning.md), [`0017-juice-flywheel-moat`](./0017-juice-flywheel-moat.md)

## Context

Conductor is free. Several other competitors offer free tiers. The temptation to match a free tier is real — every founder hears "but Conductor is free" as the most common pricing objection.

But Juicer's target audience (staff/principal engineers running agent fleets) is the audience least sensitive to a software subscription that meaningfully improves their workflow. The right move is to lean into the premium positioning, not match the free competitor.

Forge (this repo) is the **prototype**, not the product. Pricing Forge would conflict with its purpose (founder daily driver, shared with trusted friends).

## Decision

- **Juicer (Track B, public launch):** paid from day one. Target **$30-50/mo individual**, with bundle pricing alongside Juice.
- **Forge (Track A, this repo):** never priced. It's a prototype.

## Consequences

- Track B marketing has to justify paid against Conductor's free. The justification is native polish + differentiated surfaces + Juice flywheel — not feature count.
- Pricing tied to value delivered, not to inference throughput (consistent with [`0004-bring-your-own-agent`](./0004-bring-your-own-agent.md)).
- Bundle pricing with Juice is a deliberate moat (see [`0017-juice-flywheel-moat`](./0017-juice-flywheel-moat.md)).
- A free tier on Forge would create implicit expectations about a future free tier on Juicer; the framing "Forge is the prototype" makes this less likely.
- Onboarding and trial design (e.g. a 14-day trial) is a Track B Phase 5 decision, not a Phase 1 one.
