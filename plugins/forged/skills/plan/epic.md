# Epic altitude and plan map

Use an epic only when one PR would obscure independent contracts or when real
dependency seams require ordered delivery. Good signals include:

- multiple reviewable slices with independent validation or rollback;
- a shared interface that must land before several consumers;
- a migration wave followed by adoption waves;
- parallel work that can merge safely into an integration branch.

Do not choose an epic for line count alone. Closely coupled changes with one
acceptance boundary usually belong in one strong slice.

## Native epic fields

The epic's `description` states the outcome and current constraints. Its
`design` is the plan map:

- cut lines and why each is independently reviewable;
- cross-slice seam contracts and ownership;
- delivery waves and integration checkpoints;
- rollback or compatibility ordering;
- assumptions that later waves must revalidate.

The epic's `acceptanceCriteria` describes the integrated outcome, not merely
completion of children. Its `notes` records operator decisions and unresolved
epic-level questions.

## Child records

- Every child carries a `parent-child` edge from the child to the epic.
- Wave-one children get complete native specifications.
- Later-wave children begin as blocked stubs. A stub names its expected result,
  dependencies, and `- [ ] ASSUMES:` items, but must not pretend to be ready.
- `blocks` edges express actual production and consumption between children.
  Parent membership is not a dependency and must not serialize the graph.
- At a wave checkpoint, compare assumptions with merged code before promoting a
  stub through the documented update, reopen, and show sequence.

The result should let independent children proceed in parallel while making
every real integration seam visible.
