---
name: plan
description: "Turn an approved idea or plan into one ledger-native ore work-item specification, or an epic with reviewable child slices, without writing spec files into a repository. Use when the operator asks to plan work with Forged or invokes /forged:plan."
---

# /forged:plan

Position: approved idea -> authored ore work item or epic. Next:
`/forged:critique` for every complete record.

Boundary: planning and all judgment stay in the lead session, which reads and
writes the Forged ledger through typed `forged work` verbs. Forged owns provider
execution only after an explicit dispatch; this skill never starts a run.

The ledger work item is the complete specification:

| Native field | Required content |
| --- | --- |
| `title` | Conventional-commit PR title, lowercase and at most 70 characters |
| `description` | Context and the concrete behavior being built |
| `design` | Implementation constraints, seam contracts, and non-goals |
| `acceptanceCriteria` | Observable acceptance criteria and exact quality gates |
| `notes` | Agent instructions, decisions, and any unresolved questions |
| `metadata.repository` | Canonical absolute target repository root |

## State boundary

Resolve the canonical target repository once. `forged work` always addresses
the operator ledger; repository metadata associates an item with its checkout:

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
forged work ready
```

Do not create a repository-local work store, a parallel spec file, agent
instructions, hooks, or settings while planning. Never use a repository path
as a substitute for `metadata.repository`.

## Workflow

1. **Research.** Read `research.md`, inspect the target repository read-only,
   and establish current behavior, constraints, tests, and unresolved choices.
2. **Choose one slice or an epic.** Read `epic.md`. Prefer one reviewable slice
   unless real dependency seams or independent delivery waves require an epic.
3. **Draft native fields.** Read `schema.md`. Draft every field in the lead
   conversation and let the operator correct direction. Scratch files are
   allowed only outside the repository and are never authoritative.
4. **Self-check.** Apply `checklist.md`. Assume the implementation agent sees
   only the stored work item and the target checkout.
5. **Lock the record.** Create or revision-CAS update the work item, then verify
   it with `forged work show --id` and the ready frontier.

## Open-question gate

An unresolved question is an unchecked `- [ ]` item in `notes`. Create a work
item containing one as `blocked`; it must not appear on `forged work ready`.
Resolve the question in the lead session, update the normative field, remove
the checkbox, and reopen the item before critique or dispatch.

Do not write a new unresolved checkbox into an already-open item: current main
has no typed open-to-blocked transition. Resolve it before the guarded write or
leave the existing record unchanged and report the blocker. Do not hide
uncertainty in prose or delegate a product or architecture decision to the
implementation agent.

## Single-slice lock

The caller supplies a stable `ore-` id. Prepare field bodies in temporary files
outside the target repository. Use attached `--flag=value` spelling for every
body that may begin with a Markdown bullet; separated values beginning with
`-` can be parsed as flags.

```bash
WORK_ID="ore-<short-stable-id>"
TITLE="<conventional-commit title>"
DESCRIPTION="$(<"$DRAFT_DIR/description.md")"
DESIGN="$(<"$DRAFT_DIR/design.md")"
ACCEPTANCE="$(<"$DRAFT_DIR/acceptance.md")"
NOTES="$(<"$DRAFT_DIR/notes.md")"

forged work create \
  --id "$WORK_ID" \
  --title "$TITLE" \
  --kind task \
  --status open \
  --repository "$TARGET_REPO" \
  --description="$DESCRIPTION" \
  --design="$DESIGN" \
  --acceptance="$ACCEPTANCE" \
  --notes="$NOTES"
forged work show --id "$WORK_ID"
```

Use `--status blocked` instead when `notes` contains an unresolved question.
At creation only, `--priority <0-4>` may set scheduling priority. Current main
cannot mutate priority on an existing item; record the intended value in
`notes` until ore-063 adds the typed priority operation.

For an existing item, read its current `revision`, prepare the complete new
field bodies, and use the exact revision as the CAS guard:

```bash
forged work update \
  --id "$WORK_ID" \
  --expected-revision "$OBSERVED_REVISION" \
  --title "$TITLE" \
  --description="$DESCRIPTION" \
  --design="$DESIGN" \
  --acceptance="$ACCEPTANCE" \
  --notes="$NOTES"
forged work show --id "$WORK_ID"
```

Omitted fields keep their bytes, but planning should pass every reviewed spec
field so the stored contract is obvious. A moved revision fails closed: re-read,
reconcile the operator's newer content, and apply one fresh intentional update.

## Epic lock

Use native item kinds and dependency edges:

1. Create the plan map with `--kind epic`, complete native fields, and the
   canonical repository metadata.
2. Create each child with `--kind task`, then add its membership edge with
   `forged work link --from "$CHILD_ID" --to "$EPIC_ID" --kind parent-child`.
3. Fully specify wave-one children. Create downstream children as honest
   `blocked` stubs, with assumptions in `notes`.
4. Add only real `blocks` edges from the consuming child to the work it needs.
   Use `related`, `discovered-from`, and `supersedes` only for those exact
   relationships. Independent siblings remain independent.
5. At each wave boundary, re-read merged reality before promoting a stub.

Example child creation and linkage:

```bash
forged work create \
  --id "$CHILD_ID" \
  --title "$CHILD_TITLE" \
  --kind task \
  --status blocked \
  --repository "$TARGET_REPO" \
  --description="$DESCRIPTION" \
  --design="$DESIGN" \
  --acceptance="$ACCEPTANCE" \
  --notes="$NOTES"
forged work link --from "$CHILD_ID" --to "$EPIC_ID" --kind parent-child
forged work link --from "$CHILD_ID" --to "$BLOCKER_ID" --kind blocks
forged work show --id "$CHILD_ID"
```

Stub promotion on current main is deliberately non-atomic: first use
`forged work update --expected-revision` to write the complete spec, then run
`forged work reopen --id`, then re-read with `forged work show --id`. This is
safe only under one lead session with no concurrent planner. Stop on any failed
step or moved revision. Ore-063 will replace this gap with atomic stub
promotion; never pretend the current pair is atomic.

Query `forged work ready`, filter returned items by the exact canonical
`metadata.repository`, and verify that every ready record has no unresolved
question and no blocking dependency. Do not infer readiness from `status`
alone.

## Finish

Report the work-item id, or the epic id plus children grouped by wave. State
which records are ready and which are blocked with the exact reason. The next
step for every complete record is `/forged:critique`, never direct dispatch.

## Never

- Do not create or maintain a second spec artifact.
- Do not infer readiness from status alone; inspect questions, dependencies,
  and `forged work ready`.
- Do not start Forged execution, install software, edit repository policy, or
  add another work tracker.
- Do not create ceremony-only micro-slices. Prefer one coherent PR when it has
  one review and rollback boundary.
