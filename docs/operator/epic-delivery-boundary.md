# Native epic delivery boundary

Native epic execution has two distinct delivery boundaries. Forged can
integrate accepted child slices into a temporary branch, but the operator owns
the decision to deliver that integration to the selected base branch.

## What Forged may integrate

At epic start, Forged freezes the child inventory and creates
`forged/epic-<epic-id>` from the selected base ref. Each child runs against that
integration branch. When a child reaches a mechanically clean, accepted
terminal state with a durable PR, Forged may mark the PR ready and merge it
into the integration branch. This is the first boundary; it does not change the
selected base or the repository's default branch.

## The terminal boundary

After the children are reconciled, completion creates exactly one draft PR from
`forged/epic-<epic-id>` to the selected base ref. Forged stops at that draft PR:
it never merges the final integration PR and never merges the default branch.
The draft is evidence for human adjudication of input, risk acceptance,
contract amendments, and the final merge.

The terminal result is either:

- `finalPr`: the draft integration-to-base PR was created and is ready for
  human review.
- `inputRequired`: execution stopped at an explicit unresolved gate. Typical
  blockers include a missing child PR, a non-clean child, a stale
  specification, a conflict, or an unresolved decision. This is a request for
  operator input, not a successful completion or a reason to bypass the gate.

## Evidence and reconnect

Reconnect with:

```bash
forged epic status --epic <id>
```

Inspect the frozen inventory, base ref, integration branch, child states, any
input requirement, and the final PR. Together these durable projections show
what was authorized, what was integrated, why execution stopped, and what
remains for the human to decide.
