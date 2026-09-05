---
name: dispatch
description: "Submit one complete ready ledger-native ore work item to Forged for detached provider-neutral execution with a proportional assurance profile, then return immediately with durable status commands. Use when the operator explicitly asks to execute a ready slice or invokes /forged:dispatch."
---

# /forged:dispatch

Position: `forged explain --id "$WORK_ID"` must report lifecycle stage `ready`.
Next: `forged next --repo "$TARGET_REPO"` selects the exact ready subject; after handoff use `wait`.

Boundary: the lead selects, verifies, and approves one task. The atomic dispatch
then owns approval evidence, immutable packaging, submission, provider attempts,
gates, and review. Default-branch merge remains human-owned.

## Select and verify

Resolve the canonical repository, then use the bounded projection and exact id:

```bash
forged next --repo "$TARGET_REPO"
forged explain --id "$WORK_ID"
```

Dispatch only a reviewable task whose repository and revision match, native
fields are complete, no question or `blocks` edge is unresolved, and lifecycle
is `ready`. If critique evidence exists, every finding, recommendation, CRUX, and
open question needs an explicit disposition. Each accepted item must be
folded into normative fields; each rejected item must retain its reason.
Checkbox-free critique prose is not evidence of adjudication; keep the
unchecked-checkbox gate and return incomplete work to `/forged:adjudicate`.

Choose the smallest assurance profile justified by impact. Standard is routine
implementation, deterministic gates, one independent review, and bounded
remediation. Escalate only risks involving security, destructive data,
concurrency, or public compatibility. The profile budget is the stopping rule.

## Confirm and dispatch once

Present work id, title, revision, repository, base, profile, roster, actor, and
the durable effect. A short approval is valid only as the immediate unambiguous
answer to that tuple. Any normative drift requires a fresh tuple.

```bash
forged run dispatch --id "$WORK_ID" --basis "$BASIS" \
  --approved-by "$APPROVED_BY" --repo "$TARGET_REPO" \
  --base-ref "$BASE_REF" --profile "$PROFILE" --roster "$ROSTER"
```

`run dispatch` records approval and atomically creates and submits the immutable
run. It has no spec-file argument. Capture the returned run id; do not reconstruct
the handoff from lower-level operations and do not mutate the work item between
approval and dispatch.

## Reconnect without polling

```bash
forged explain --id "$RUN_ID"
forged wait --id "$RUN_ID" --until decision --timeout 240
```

Report the work id, run id, repository, base, profile, roster, branch, and the
terminal contract: reviewed draft PR or explicit input-required evidence. When
`wait` returns, follow the single `should` action from `explain`; retry creates a
successor only when that typed remedy is offered.

## Never

- Do not auto-route, install software, add a watcher, or change protocol.
- Do not bypass lifecycle without an explicit operator-owned override reason.
- Do not accept review risk or merge the default branch without human authority.
