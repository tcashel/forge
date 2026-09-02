# ADR 0035 — Operational policy revisions apply at durable stage boundaries

**Status:** Accepted
**Deciders:** Tripp
**Date:** 2026-09-01
**Related:** [`0033-execution-package-ownership-boundary`](./0033-execution-package-ownership-boundary.md), [`0034-ledger-native-work-store`](./0034-ledger-native-work-store.md)

## Context

ADR-0033 freezes the resolved execution package before execution, including
gate commands, stage and retry budgets, and process-host selection. That keeps
provider attempts reproducible, but it also makes an operational mistake such
as a wrong gate command or undersized stage budget permanent for the run.
Retrying the same stage cannot repair the frozen input and can repeatedly spend
provider work on a stage that is already doomed.

ADR-0033 also permits a safe correction mechanism: “Any later reassignment is
an explicit append-only revision at a durable stage boundary.” Its non-goal
forbids mutating a live attempt or crossing a non-durable boundary. Operational
policy needs the same append-only boundary without turning authoring config
into mutable runtime truth.

## Decision

The execution package remains immutable. Every definition-backed run receives
policy revision 1 in the same transaction as its run definition. A later
`run revise-policy` operation appends revision N+1 from the current operator
config; `epic revise-policy` appends child-specific revisions for every current
unmerged child in one transaction with one governing epic event and makes that
policy the template for future children.

A revision splices only these live-config fields over the standing effective
policy:

- `gate_commands`;
- `stage_budget_s`;
- `transport_retry_budget`.

`termination_grace_s`, `host_policy`, and `herdr_socket` remain byte-equal to
the standing effective policy. The command accepts no field values: the
operator repairs config and invokes the explicit revision verb, preserving one
authoring authority per concept.

Projection overlays the latest validated policy revision at read time and
never rewrites `run_definitions.package_json`. Each packet records the active
policy revision and freezes its `StageContract` when the packet opens. A live
attempt therefore retains the exact gate commands and stage budget it began
with; only the next packet-open boundary consumes a newer revision.

Transport retry accounting starts a new budget epoch at the revision's durable
`created_at`. Failures and retry grants before that cutoff are not rescored
against the revised budget.

This amends ADR-0033's package-contents reading only for the three operational
fields above. The frozen package is still the immutable origin, and every
departure is an explicit, append-only, provenance-bearing ledger fact.

## Consequences

- Operators can repair a doomed gate or budget through config and one
  guessable lifecycle verb without restarting successful earlier stages.
- Packet provenance identifies the exact policy revision that built each
  stage contract; status and explain surfaces expose that pointer.
- Same-content, same-reason replays retain the standing revision, while
  operation fencing and canonical digests reject conflicting reuse or corrupt
  content.
- Legacy definition-less runs fail closed because they have no immutable
  policy origin to revise.
- Epic revisions leave merged children untouched and update current unmerged
  children atomically.

## Non-goals locked by this ADR

- A revision never changes a live attempt or an already-open packet.
- `termination_grace_s` is not revisable until authoring config can express it.
- `host_policy` and `herdr_socket` remain identity-adjacent and do not follow
  config drift into a revision.
- `fix_round_budget` remains profile policy. Existing profile escalation is
  the mid-run rounds lever; an operator-facing escalation verb is a post-M3
  candidate, not part of this decision.
