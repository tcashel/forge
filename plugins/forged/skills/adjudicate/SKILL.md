---
name: adjudicate
description: "Resolve every recommendation, CRUX, and open question from the latest Forged critique, write accepted decisions into the ledger-native work-item fields, and make the record ready only when its execution contract is complete. Use after /forged:critique or when the operator invokes /forged:adjudicate."
---

# /forged:adjudicate

Position: `forged explain --id "$WORK_ID"` must report lifecycle stage `critiqued`.
Next: `forged next --repo "$TARGET_REPO"` reports dispatch only after atomic adjudication.

Boundary: the lead owns evidence checks, CRUX choices, and operator dialogue.
The ledger performs the guarded field, note, and status transition as one
operation; execution still requires a later explicit handoff.

## Load the critique

```bash
forged explain --id "$WORK_ID"
forged work note list --id "$WORK_ID" --kind recommendation --limit 500
```

Require lifecycle stage `critiqued`, then load the exact recommendation row
whose `noteId` is named by `lifecycle.basis.noteIds`; do not substitute another
recommendation. Decode its `bodyJson`. If the named row is absent from this
bounded result, stop instead of guessing or scanning another source.

## Resolve every finding

Use the newest `forged.spec-recommendations/1` note named by the lifecycle
projection. Verify its work id and repository against the current record; a
missing, stale, malformed, or mismatched recommendation returns to critique.

1. Verify each recommendation against current repository evidence; accept,
   adapt, or reject it with a reason.
2. Present one unresolved CRUX at a time with facts, bounded options,
   consequences, and a recommended choice. Capture operator decisions when
   product scope or external authority changes.
3. Resolve open questions and reconcile every native field and dependency.
4. Fold accepted outcomes into normative fields; retain rejection reasons.

There is no “defer to implementation” disposition. A later-wave assumption
remains an explicit hold.

## Commit the adjudication atomically

Prepare complete field bodies and one raw `forged.adjudication/1` payload
outside the repository. Each referenced file must be readable, nonempty, and
UTF-8. The payload names the recommendation note and covers every
recommendation and CRUX:

```json
{
  "schema": "forged.adjudication/1",
  "revision": 1,
  "workItem": "<ore-id>",
  "critiquedRevision": 4,
  "recommendationNoteId": "<note-id>",
  "resultingRevision": 5,
  "dispositions": [
    {"ref": {"noteId": "<note-id>", "index": 0}, "disposition": "accept", "reason": "<evidence>"},
    {"ref": {"noteId": "<note-id>", "cruxId": "CRUX-1"}, "disposition": "accept", "reason": "<choice basis>"}
  ],
  "cruxes": [{"id": "CRUX-1", "choice": "<choice>", "rationale": "<reason>"}],
  "adjudicatedAt": "<ISO-8601 UTC>",
  "actor": "<operator or lead>"
}
```

`resultingRevision` equals the observed revision when fields do not change and
the next revision when any field changes.

```bash
forged work adjudicate --id "$WORK_ID" \
  --expected-revision "$OBSERVED_REVISION" --title "$TITLE" \
  --description-file "$DESCRIPTION_PATH" --design-file "$DESIGN_PATH" \
  --acceptance-file "$ACCEPTANCE_PATH" --notes-file "$NOTES_PATH" \
  --dispositions-file "$DISPOSITIONS_PATH"
forged explain --id "$WORK_ID"
forged next --repo "$TARGET_REPO"
```

Stop on a moved revision, reconcile the newer record and evidence, then make
one fresh operation. Verify the resulting lifecycle, revision, note id,
repository, fields, and graph. Report each disposition and any remaining hold.

## Never

- Do not conceal an unresolved question or make an incomplete stub ready.
- Do not create a parallel spec, rerun critics to seek unanimity, or execute.
- Do not change GitHub, install software, or edit the target repository.
