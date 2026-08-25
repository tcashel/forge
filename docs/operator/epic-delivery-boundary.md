# Native epic delivery boundary

Forged executes a native epic in two deliberate stages. It resolves the
selected remote base, creates the integration branch
`forged/epic-<epic-id>`, and starts every child against that branch. A child
PR may be merged automatically only when the child is accepted and the merge
is clean; those merges go only into the integration branch.

When all children are accounted for, successful completion creates one draft
PR from `forged/epic-<epic-id>` to the selected base. Forged stops there. It
never merges that final PR, the selected base, or the repository's default
branch. The final integration-PR merge remains a human decision.

## Terminal evidence

There are two distinct terminal outcomes:

- `finalPr` means the integration completed and the one draft
  integration-to-selected-base PR was created.
- `inputRequired` means Forged stopped with an explicit action for a human.
  Missing or non-clean child work, a stale specification, a conflict,
  exhausted bounded remediation, or missing authority can produce this stop.
  It is not permission to bypass the boundary or infer completion.

Epic status is the source for child states, the integration branch, the
input requirement, and the final PR. Reconnect directly with:

```sh
forged epic status --epic <id>
forged events --run <id> --limit 200
```

The durable `forged.epic.started` event and its event stream carry the frozen
base SHA and inventory digest. Epic status does not expose those two fields;
use the event stream for that evidence.

## Human authority

Forged preserves human authority over input resolution, risk acceptance,
contract amendments, and merging the final integration PR. A human must
adjudicate those decisions before delivery crosses into the selected base or
default branch.
