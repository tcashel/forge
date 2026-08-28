---
name: plan
description: "Turn an approved idea or plan into one ledger-native ore specification, or an epic with reviewable child work items, without writing spec files into any repository. Use when the operator asks to plan work with Forged or invokes /forged:plan."
---

# /forged:plan

Lifecycle position: approved idea → ledger-native ore. Next:
`/forged:critique`. This stage runs in the lead session: the lead agent owns
research, operator conversation, and every planning judgment. Forged owns the
ledger that stores the result and owns execution only after an explicit
dispatch; planning never launches a run.

An ore's native fields, not a parallel Markdown file, are the complete
specification:

| Native field | Required content |
| --- | --- |
| `title` | Conventional-commit PR title, lowercase and at most 70 characters |
| `description` | Context and the concrete behavior being built |
| `design` | Implementation constraints, seam contracts, and non-goals |
| `acceptance_criteria` | Observable acceptance criteria and exact quality gates |
| `notes` | Agent instructions, decisions, and any unresolved questions |
| `metadata.repository` | Canonical absolute target repository root |

## Store and repository boundary

The work store is the Forged ledger under `ANVIL_HOME`; access it only
through typed `forged work` verbs. Resolve the canonical target once:

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
forged work ready
```

Never create a repository-local work store. Never add a spec file, agent
instructions, hooks, settings, or generated planning artifacts to the target
repository. The `--repository` value on `work create` becomes
`metadata.repository` and is the only planning-time repository association.

## Workflow

1. **Research.** Read `research.md`, inspect the target repository read-only,
   and establish current behavior, constraints, tests, and unresolved choices.
2. **Choose one slice or an epic.** Read `epic.md`. Prefer one reviewable
   slice unless real dependency seams or independent delivery waves justify an
   epic.
3. **Draft native fields.** Read `schema.md`. Draft every field in the lead
   conversation and let the operator correct direction. Scratch files are
   allowed only outside the repository and are never authoritative.
4. **Self-check.** Apply `checklist.md`. Assume the implementation agent sees
   only the stored ore and target checkout, not this conversation.
5. **Lock the record.** Mint a stable caller-supplied `ore-` id, create or
   revision-CAS update the work item, add typed links, then verify it with
   `forged work show --id` and `forged work ready`.

## Open-question gate

An unresolved question is an unchecked `- [ ]` item in `notes`. Create an
ore containing one with `--status blocked`; it must not appear in
`forged work ready`. Resolve the question with the operator, update the
normative field, remove the checkbox, and use `forged work reopen --id` when
the stored status is still blocked. Re-read the item and frontier before
claiming it is ready.

Do not hide uncertainty in prose and do not tell the implementation agent to
choose a product or architecture direction. Make the decision in the lead
session or keep the ore blocked.

## Single-slice lock

Prepare field bodies in temporary files outside the target repository, then
create the record. `work create` takes the stable id from the caller; mint an
unused `ore-` prefixed id before invoking it. Use attached
`--flag=value` form for the four Markdown bodies because a body may begin
with a bullet:

```bash
ORE_ID="${ORE_ID:-ore-<x>}"
DESCRIPTION="$(<"$DRAFT_DIR/description.md")"
DESIGN="$(<"$DRAFT_DIR/design.md")"
ACCEPTANCE="$(<"$DRAFT_DIR/acceptance.md")"
NOTES="$(<"$DRAFT_DIR/notes.md")"

CREATE_JSON="$(
  forged work create --id "$ORE_ID" --title "$TITLE" \
    --kind task --status "${STATUS:-open}" --priority "${PRIORITY:-2}" \
    --repository "$TARGET_REPO" \
    --description="$DESCRIPTION" --design="$DESIGN" \
    --acceptance="$ACCEPTANCE" --notes="$NOTES"
)"
printf '%s' "$CREATE_JSON" |
  jq -e --arg id "$ORE_ID" '.ok and .result.work.workId == $id'
forged work show --id "$ORE_ID"
```

For an existing ore, read its current revision and guard the full intended
update with that exact value. Omitted fields retain their bytes, but planning
should normally pass every reviewed body so the final contract is obvious:

```bash
CURRENT_JSON="$(forged work show --id "$ORE_ID")"
REVISION="$(printf '%s' "$CURRENT_JSON" | jq -er '.result.work.revision')"
forged work update --id "$ORE_ID" --expected-revision "$REVISION" \
  --title "$TITLE" --description="$DESCRIPTION" --design="$DESIGN" \
  --acceptance="$ACCEPTANCE" --notes="$NOTES"
forged work show --id "$ORE_ID"
```

A moved revision is a contention stop: re-read, reconcile in the lead session,
and apply one newly guarded update. Never retry stale field bodies blindly.

## Epic lock

Use `--kind epic` and typed work links:

1. Create the plan-map ore as an epic with complete native fields and the
   canonical repository.
2. Create each child as a task, then link child to epic with
   `--kind parent-child`. Parent membership is structural, not a scheduling
   dependency.
3. Fully specify wave-one children. Create downstream children as honest
   `--status blocked` stubs with assumptions in `notes`.
4. Add a `blocks` link only when the `--from` child consumes the
   `--to` prerequisite's output. Independent siblings remain independent.
5. At each wave boundary, re-read merged reality, replace the stub fields,
   remove resolved assumption checkboxes, and reopen it only when its
   questions and intended hold are resolved.

Example child creation and membership:

```bash
forged work create --id "$CHILD_ID" --title "$CHILD_TITLE" \
  --kind task --status "$CHILD_STATUS" --priority "${PRIORITY:-2}" \
  --repository "$TARGET_REPO" \
  --description="$DESCRIPTION" --design="$DESIGN" \
  --acceptance="$ACCEPTANCE" --notes="$NOTES"
forged work link --from "$CHILD_ID" --to "$EPIC_ID" --kind parent-child
```

Example real dependency, where `$CONSUMER_ID` cannot run until
`$PREREQUISITE_ID` closes:

```bash
forged work link --from "$CONSUMER_ID" --to "$PREREQUISITE_ID" --kind blocks
```

The allowed link kinds are `blocks`, `parent-child`, `related`,
`discovered-from`, and `supersedes`. Read every child back. Because
`work ready` returns the whole operator frontier, filter its response and
then verify exact repository metadata:

```bash
forged work ready |
  jq --arg repo "$TARGET_REPO" \
    '.result.ready[] | select(.metadata.repository == $repo)'
```

## Finish

Report the single ore id, or the epic id plus child work items grouped by wave.
State which items are ready and which are blocked with the exact reason. The
next step for a complete record is `/forged:critique`, not dispatch.

If the operator explicitly abandons an unstarted plan, close only that exact
ore and record the reason:

```bash
forged work close --id "$ORE_ID" --reason "$REASON"
forged work show --id "$ORE_ID"
```

Closing is not part of normal planning and must never stand in for resolving a
question, changing priority, or superseding work.

## Never

- Do not create or maintain a second spec artifact.
- Do not infer readiness from status alone; check questions, typed links, and
  the actual `forged work ready` frontier.
- Do not start execution, install software, edit repository policy, or add
  another work tracker.
- Do not create ceremony-only micro-slices. Prefer one strong PR with a
  coherent review and rollback boundary.
