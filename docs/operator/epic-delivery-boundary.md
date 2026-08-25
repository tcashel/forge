# Native epic delivery boundary

Forged executes a native epic in two deliberate stages. It freezes the
selected remote base and child inventory, then creates the integration branch
`forged/epic-<epic-id>`. Each child runs against that branch. Only a child that
is accepted and mechanically clean may be merged automatically, and that
merge is into the integration branch only.

When every child is accounted for, Forged creates one draft integration-to-
selected-base PR. It stops there: Forged does not merge the selected base or
the repository's default branch, and it never treats the draft PR as human
approval. The human retains authority over the final integration-PR merge,
risk acceptance, contract amendments, and any work requiring explicit input.

## Terminal outcomes

Successful completion is represented by a terminal `finalPr` result: the
draft PR is the handoff for human adjudication. A held or ambiguous epic stops
with explicit `inputRequired` instead. Representative blockers include
missing or non-clean child work, a stale specification, a conflict, exhausted
bounded remediation, or missing authority. These stops are durable requests
for resolution; they are not permission to bypass a child, force a merge, or
silently replan the epic.

At either terminal outcome, treat the durable record and event stream as the
evidence. In particular, retain and verify the frozen base SHA, inventory
digest, child states, integration branch, input requirement (when present),
and final PR (when present). The status projection exposes these fields and
distinguishes `inputRequired` from `finalPr`.

## Reconnect

Use the direct status and event commands with the exact epic or run identity:

```sh
forged epic status --epic <id>
forged events --run <id> --limit 200
```

Status is the compact projection of the frozen base, inventory, children,
integration branch, input requirement, and final PR. The event stream supplies
the durable sequence behind that projection; use it to reconnect after a
lost operator session before taking any human-authorized resolution action.
