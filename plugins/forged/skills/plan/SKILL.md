---
name: plan
description: "Turn an approved idea or plan into one native operator-scoped Bead specification, or a native epic with reviewable child slices, without writing spec files into any repository. Use when the operator asks to plan work with Forged or invokes /forged:plan."
---

# /forged:plan

Convert an idea into the durable specification that Forged will execute. The
operator-scoped Beads database is the source of truth. A Bead's native fields,
not a parallel Markdown file, carry the complete specification:

| Native field | Required content |
| --- | --- |
| `title` | Conventional-commit PR title, lowercase and at most 70 characters |
| `description` | Context and the concrete behavior being built |
| `design` | Implementation constraints, seam contracts, and non-goals |
| `acceptance_criteria` | Observable acceptance criteria and exact quality gates |
| `notes` | Agent instructions, decisions, and any unresolved questions |
| `metadata.repository` | Canonical absolute target repository root |

The lead agent owns the conversation and judgment. Forged owns durable
execution after an explicit handoff. Planning must not launch a run.

## State boundary

Resolve the operator paths once and pass `BEADS_DIR` on every command:

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
export BEADS_DIR="${BEADS_DIR:-$ANVIL_HOME/beads}"
BD_BIN="${BD_BIN:-$(command -v bd)}"
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
REPOSITORY_METADATA="$(jq -cn --arg repository "$TARGET_REPO" \
  '{repository: $repository}')"
env BEADS_DIR="$BEADS_DIR" "$BD_BIN" where --json
```

Do not initialize Beads from the target checkout. Do not use repository-routing
flags on `bd create`. The one operator store holds work for many repositories;
`metadata.repository` performs that association. Never add `.beads`, a spec
file, agent instructions, hooks, or settings to the target repository while
planning.

## Workflow

1. **Research.** Read `research.md`, inspect the target repository read-only,
   and establish current behavior, constraints, tests, and unresolved choices.
2. **Choose one slice or an epic.** Read `epic.md`. Prefer one reviewable slice
   unless there are real dependency seams or independent delivery waves.
3. **Draft native fields.** Read `schema.md`. Draft every field in the
   conversation, make decisions at the lead-agent level, and let the operator
   correct direction. Temporary scratch files are allowed only outside the
   repository and are not authoritative.
4. **Self-check.** Apply `checklist.md`. Assume the implementation agent sees
   the native Bead and target checkout, not this conversation.
5. **Lock the record.** Create or update the Bead with all native fields and
   repository metadata. Then verify the stored record with `bd show`.

## Open-question gate

An unresolved question is an unchecked `- [ ]` item in `notes`. A Bead with any
such item must have status `blocked`; it must not appear on `bd ready`. Resolve
the question with the operator, update the normative field, remove the item,
and change the status to `open` before critique or dispatch.

Do not hide uncertainty in prose and do not tell the implementation agent to
choose a product or architecture direction. Make the decision here or hold the
record blocked.

## Single-slice lock

Prepare the field bodies in temporary files outside the target repository so
shell quoting cannot corrupt Markdown, then create the record. The exact files
below are illustrative; delete them after verification.

```bash
ACCEPTANCE="$(<"$DRAFT_DIR/acceptance.md")"
NOTES="$(<"$DRAFT_DIR/notes.md")"
ISSUE_JSON="$(env BEADS_DIR="$BEADS_DIR" "$BD_BIN" create "$TITLE" \
  --type task \
  --body-file "$DRAFT_DIR/description.md" \
  --design-file "$DRAFT_DIR/design.md" \
  --acceptance "$ACCEPTANCE" \
  --notes "$NOTES" \
  --metadata "$REPOSITORY_METADATA" \
  --json)"
ID="$(printf '%s' "$ISSUE_JSON" | jq -r '.id')"
env BEADS_DIR="$BEADS_DIR" "$BD_BIN" show "$ID" --long --json
```

The pinned CLI accepts description and design files as `--body-file` and
`--design-file`; acceptance and notes use text flags. Inspect `bd create --help`
first and do not silently drop a field. In JSON, confirm the result contains
`acceptance_criteria`, the other native fields, and the exact repository value.

## Epic lock

Use native issue types and parent-child edges:

1. Create the plan map as `--type epic` with complete native fields and
   `metadata.repository`.
2. Create each child with `--parent "$EPIC_ID"`. The native parent edge means
   membership; do not add synthetic dependencies from the epic to every child.
3. Fully specify wave-one children. Create downstream children as honest stubs
   in status `blocked`, with their assumptions in `notes`.
4. Add only useful `blocks` dependencies between children where one slice
   consumes another slice's output. Independent siblings remain independent.
5. At each wave boundary, re-read merged reality, replace a stub with complete
   native fields, remove its assumption checkboxes, and open it only when its
   dependencies and questions are resolved.

Example child creation:

```bash
env BEADS_DIR="$BEADS_DIR" "$BD_BIN" create "$CHILD_TITLE" \
  --type task --parent "$EPIC_ID" \
  --description "$DESCRIPTION" --design "$DESIGN" \
  --acceptance "$ACCEPTANCE" --notes "$NOTES" \
  --metadata "$REPOSITORY_METADATA" --json
```

After creation, query the epic's native children and dependency graph. Verify
that every record has the same canonical repository metadata, no ready child
has unresolved questions, and no false dependency serializes independent work.
Use `bd ready --parent "$EPIC_ID" --metadata-field
"repository=$TARGET_REPO" --json` with explicit `BEADS_DIR` to inspect the
repository-scoped frontier.

## Finish

Report the single Bead id, or the epic id plus children grouped by wave; state
which records are ready and which are blocked with the exact reason. The next
step for a complete record is `/forged:critique`, not dispatch.

## Never

- Do not create or maintain a second spec artifact.
- Do not infer readiness from a status label alone; check questions and native
  dependencies and confirm with `bd ready`.
- Do not start Forged, install software, edit repository policy, or add another
  work tracker.
- Do not create ceremony-only micro-slices. One strong PR is preferred when it
  has a coherent review and rollback boundary.
