---
name: critique
description: "Harden a complete ledger-native ore work-item specification with proportional, provider-neutral critique and persist one synthesized recommendation record for adjudication. Use after /forged:plan or when the operator invokes /forged:critique."
---

# /forged:critique

Position: complete work item -> one bounded critique record. Next:
`/forged:adjudicate`.

Boundary: critique runs in the lead session. The lead reads the ledger,
delegates only read-only critic perspectives, verifies their evidence, and
stores the synthesized record in `notes`. Forged does not execute a run here.

## Load the authoritative record

```bash
forged work show --id "$WORK_ID"
```

Read `title`, `description`, `design`, `acceptanceCriteria`, `notes`, kind,
status, revision, `metadata.repository`, and dependency edges. Inspect the
named target repository read-only. Do not substitute a sidecar file,
conversation summary, or another work store.

If required fields are absent, repository metadata is missing or wrong, an
unchecked question remains, or the record is a later-wave stub, report that
blocking defect and stop. The record is not eligible for critique-as-approval.

## Choose the smallest useful topology

- **Low risk:** the lead agent performs one structured critic pass.
- **Normal risk:** delegate one independent critic using
  `../../agents/critic.md` relative to this skill, then verify and synthesize
  its findings.
- **High risk:** use a small cross-family panel only when security, data loss,
  concurrency, compatibility, or a multi-slice contract warrants distinct
  perspectives.

Use the host's native delegation when available. Parallelize genuinely
independent perspectives. Critics are read-only and receive the rendered work
item plus repository root; they do not mutate the ledger or checkout. Stop when
the selected topology has completed one bounded pass.

## Adjudicate critic output before persisting it

Verify every cited path, reject style-only churn and speculative scope, combine
duplicates, and separate:

- **recommendations:** clear, evidence-backed corrections;
- **CRUXes:** findings whose resolution requires lead/operator judgment;
- **open questions:** facts that still need a decision or evidence;
- **rejected findings:** concise reasons critic claims are inapplicable.

Do not silently modify the specification. Produce one exact fenced block. The
block deliberately avoids unchecked Markdown checkboxes: the plan gate reserves
those for questions that make an item ledger-blocked.

````markdown
```forged-spec-recommendations
workItem: <ore-id>
repository: <canonical absolute path>
reviewedAt: <ISO-8601 UTC>
topology: <low|normal|high and seats used>

## Recommendations
1. <field or edge>: <specific correction and evidence>

## CRUXes
### CRUX-1: <decision>
- Evidence: <verified facts>
- Options: <bounded choices and consequences>
- Recommendation: <lead critic's call>
- Resolution: UNRESOLVED

## Open Questions
- <question, or "None">

## Rejected Findings
- <finding and reason, or "None">

## Verification
- <what was inspected and what was not>
```
````

Current main has no separate ledger commentary operation. Construct one
combined notes file from the exact existing `notes` bytes plus the complete
block, preserving everything already there. Fail closed before the update if
the combined file cannot be read, is empty, or cannot be loaded:

```bash
: "${DRAFT_DIR:?set DRAFT_DIR to the critique scratch directory}"
UPDATED_NOTES_PATH="$DRAFT_DIR/notes-with-critique.md"
if [[ ! -r "$UPDATED_NOTES_PATH" || ! -s "$UPDATED_NOTES_PATH" ]]; then
  printf 'missing or empty combined critique notes: %s\n' \
    "$UPDATED_NOTES_PATH" >&2
  exit 1
fi
UPDATED_NOTES="$(<"$UPDATED_NOTES_PATH")" || exit 1
if [[ -z "$UPDATED_NOTES" ]]; then
  printf 'combined critique notes must be nonempty\n' >&2
  exit 1
fi
forged work update \
  --id "$WORK_ID" \
  --expected-revision "$OBSERVED_REVISION" \
  --notes="$UPDATED_NOTES"
forged work show --id "$WORK_ID"
```

The update mints a spec revision. This is a known temporary gap, so only one
lead session may write the record during critique. A moved revision fails
closed: re-read and reconcile; never overwrite another planner's notes.

If there are no findings, persist a block that says `None` and has no unresolved
CRUX. That completes critique but does not bypass adjudication's readiness
checks.

## Never

- Do not change `description`, `design`, `acceptanceCriteria`, title, edges, or
  work-item status here.
- Do not resolve CRUXes during critique or invent a nonexistent comment verb.
- Do not run implementation, CI, installation, GitHub writes, or Forged
  execution.
- Do not repeat critique merely because another critic could imagine more.
