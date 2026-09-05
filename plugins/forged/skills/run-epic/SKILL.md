---
name: run-epic
description: "Submit a locked ledger-native ore epic to Forged for durable frontier execution, mechanically integrate clean child slices, and stop at one draft PR to the default branch or an explicit input-required state. Use when the operator explicitly invokes /forged:run-epic."
---

# /forged:run-epic

Position: `forged explain --id "$EPIC_ID"` must report lifecycle stage `adjudicated`.
Next: `forged next --id "$EPIC_ID"` states the epic action; after handoff use `wait`.

Boundary: the lead verifies the plan, chooses assurance, and obtains explicit
approval. Forged then owns frontier scheduling, child controllers, provider
attempts, gates, and integration custody. Default-branch merge stays human-owned.

## One authoritative preflight

```bash
forged epic preflight --epic "$EPIC_ID" --repo "$TARGET_REPO" \
  --base-ref "$BASE_REF" --profile "$PROFILE" --roster "$ROSTER" --rolling
```

This single read returns the frozen child inventory and rehearses repository,
base, epic and child shape, complete specs versus honest stubs, definitions,
provider binaries, and authentication. Fail closed on any false check, a
missing or extra child, a repository mismatch, or an unresolved question.

Preflight does not prove adjudication or dependency geometry; the derived
lifecycle does. The epic reads `adjudicated` only when
every finding, recommendation, CRUX, and open question has a disposition
recorded through `work adjudicate`. Each accepted item must be folded into
normative fields and each rejected item must retain its reason.
Checkbox-free critique prose is not evidence of adjudication; keep the
unchecked-checkbox gate and return a child at `critiqued` or `held` to
`/forged:adjudicate`. A contradictory `parent-child`/`blocks` edge is a
planning defect to fix before handoff.

Show the returned normalized base, integration branch, assurance stage, and
each frozen child identity to the operator. Standard assurance fits ordinary
code: deterministic gates, one independent review, bounded remediation.
Escalate only children or seams with security, data, concurrency, or public
compatibility risk. The profile budget is the stopping rule.

## Ordered handoff

After approval, the mutating result must match the preflight identities:

```bash
forged epic start --epic "$EPIC_ID" --repo "$TARGET_REPO" \
  --base-ref "$BASE_REF" --profile "$PROFILE" --roster "$ROSTER" --rolling
forged epic submit --epic "$EPIC_ID"
```

Return immediately. The ore supervisor may mechanically integrate only clean,
accepted children into the integration branch. It stops at one draft PR to the
default branch or explicit input-required evidence.

## Reconnect and recover

```bash
forged explain --id "$EPIC_ID"
forged wait --id "$EPIC_ID" --until decision --timeout 240
```

When a child is held, adjudicate its native work item, then use the exact
`epic resolve` action advertised by `explain`. An epic-level hold is resolved
only after its condition is repaired.

`BEADS_CONTENTION` from start, revise, or resume means the supervisor ore pass
owns the desired row. Back off and observe with `forged explain --id "$EPIC_ID"`;
retry only the refused control verb after the pass releases its claim. A child
restart-budget exhaustion remains child-scoped; resubmitting the epic does not
reset it.

Report epic id, frozen children, profile, branches, and desired/pass state.

## Never

- Do not create a second child-verification loop, watcher, or recursive expansion.
- Do not synchronize a tracker, install software, or change protocol.
- Do not create implicit default-branch approval.
