---
name: plan
description: "Turn an approved idea or plan into one ledger-native ore work-item specification, or an epic with reviewable child slices, without writing spec files into a repository. Use when the operator asks to plan work with Forged or invokes /forged:plan."
---

# /forged:plan

Position: `forged explain --id "$WORK_ID"` reports lifecycle stage `drafted` after the record exists.
Next: `forged next --repo "$TARGET_REPO"` points each complete record to critique.

Boundary: the lead researches, makes product and architecture judgments, and
authors the operator ledger. Planning never starts provider execution or writes
a specification, hook, setting, or work store into the target repository.

## Author the native record

The ledger record is the specification. Resolve one canonical absolute
`metadata.repository`, then fill every field:

| Field | Contract |
| --- | --- |
| `title` | lowercase conventional-commit PR title, at most 70 characters |
| `description` | context and concrete behavior |
| `design` | seam constraints and non-goals |
| `acceptanceCriteria` | observable outcomes and exact gates |
| `notes` | agent instructions, decisions, and unresolved `- [ ]` questions |

Read `research.md`, `schema.md`, `epic.md`, and `checklist.md`. Inspect the
repository read-only. Prefer one reviewable task; use an epic only when real
dependencies or independent waves require it. Fully specify the first wave and
make later work honest blocked stubs. The lead resolves routine engineering
choices and asks the operator only about product scope or external authority.

Prepare the four Markdown bodies outside the repository. Reject a draft that
is missing, unreadable, non-UTF-8, or empty. Each file flag conflicts with its corresponding inline flag.

```bash
WORK_ID="ore-<short-stable-id>"
forged work create --id "$WORK_ID" --title "$TITLE" --kind task --status open \
  --repository "$TARGET_REPO" --description-file "$DESCRIPTION_PATH" \
  --design-file "$DESIGN_PATH" --acceptance-file "$ACCEPTANCE_PATH" \
  --notes-file "$NOTES_PATH"
```

Use `--kind epic` on the plan map and `--status blocked` on any item with an
unresolved question or later-wave assumption. A new task is linked to its epic
and to only genuine prerequisites:

```bash
forged work link --from "$CHILD_ID" --to "$EPIC_ID" --kind parent-child
forged work link --from "$CHILD_ID" --to "$BLOCKER_ID" --kind blocks
```

Revise an existing open record under its observed revision. Omitted fields keep
their bytes, but planning passes every reviewed field so the contract is clear:

```bash
forged work update --id "$WORK_ID" --expected-revision "$OBSERVED_REVISION" \
  --title "$TITLE" --description-file "$DESCRIPTION_PATH" \
  --design-file "$DESIGN_PATH" --acceptance-file "$ACCEPTANCE_PATH" \
  --notes-file "$NOTES_PATH"
```

Promote a completed blocked stub atomically with the same file set:

```bash
forged work promote --id "$WORK_ID" --expected-revision "$OBSERVED_REVISION" \
  --title "$TITLE" --description-file "$DESCRIPTION_PATH" \
  --design-file "$DESIGN_PATH" --acceptance-file "$ACCEPTANCE_PATH" \
  --notes-file "$NOTES_PATH"
```

Stop on a moved revision, reconcile the newer content, then make one fresh
guarded write. Model only actual `blocks` edges; independent siblings stay
independent.

## Readback

The complete repository frontier is bounded at 500 and returns full native
records without skill-side pagination:

```bash
forged work ready --repo "$TARGET_REPO" --all --full
forged explain --id "$WORK_ID"
forged next --repo "$TARGET_REPO"
```

Verify repository identity, fields, questions, status, and edges from the
readback. Report ids grouped by wave, ready records, and exact blockers.

## Never

- Do not hide uncertainty in prose or delegate product judgment to a builder.
- Do not create ceremony-only slices or a parallel specification artifact.
- Do not infer readiness from status alone or widen beyond the named repository.
- Do not execute, install software, edit repository policy, or add a tracker.
