---
name: critique
description: "Harden a complete ledger-native ore work-item specification with proportional, provider-neutral critique and persist one synthesized recommendation record for adjudication. Use after /forged:plan or when the operator invokes /forged:critique."
---

# /forged:critique

Position: complete work item -> one bounded critique record. Next:
`/forged:adjudicate`.

Boundary: critique runs in the lead session. The lead reads the ledger,
delegates only read-only critic perspectives, verifies their evidence, and
stores one typed recommendation note. Forged does not execute a run here.

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

Do not silently modify the specification. Produce one exact JSON payload using
the closed `forged.spec-recommendations/1` contract:

```json
{
  "schema": "forged.spec-recommendations/1",
  "workItem": "<ore-id>",
  "repository": "<canonical absolute path>",
  "reviewedAt": "<ISO-8601 UTC>",
  "topology": "<low|normal|high and seats used>",
  "recommendations": [
    {"target": "<field or edge>", "correction": "<specific correction and evidence>"}
  ],
  "cruxes": [
    {
      "id": "CRUX-1",
      "evidence": ["<verified fact>"],
      "options": ["<bounded choice and consequence>"],
      "recommendation": "<lead critic's call>"
    }
  ],
  "openQuestions": ["<question>"],
  "rejectedFindings": [{"finding": "<finding>", "reason": "<reason>"}],
  "verification": ["<what was inspected and what was not>"]
}
```

Render the same synthesis for the operator using this fenced Markdown
guidance. This projection is not the stored contract:

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

The required `recommendations` and `cruxes` arrays may be empty. Optional
fields may be omitted. Never store the rendering as the contract. Only the
critique seat writes kind `recommendation`, so newest-wins remains truthful.

Write the raw JSON object, without a Markdown fence, through the typed note
verb. Fail closed before the add if the body file is unreadable or empty:

```bash
: "${DRAFT_DIR:?set DRAFT_DIR to the critique scratch directory}"
RECOMMENDATIONS_PATH="$DRAFT_DIR/spec-recommendations.json"
if [[ ! -r "$RECOMMENDATIONS_PATH" || ! -s "$RECOMMENDATIONS_PATH" ]]; then
  printf 'missing or empty recommendation payload: %s\n' \
    "$RECOMMENDATIONS_PATH" >&2
  exit 1
fi
forged work note add \
  --id "$WORK_ID" \
  --kind recommendation \
  --schema forged.spec-recommendations/1 \
  --actor critique \
  --body-file "$RECOMMENDATIONS_PATH"
forged work show --id "$WORK_ID"
```

The append does not mint a spec revision or change coordination state. A schema
or field refusal must be fixed in the body file and added again; never fall
back to a spec-notes append.

If there are no findings, persist empty `recommendations` and `cruxes` arrays.
That completes critique but does not bypass adjudication's readiness checks.

## Never

- Do not change `description`, `design`, `acceptanceCriteria`, title, edges, or
  work-item status here.
- Do not resolve CRUXes during critique or write a second recommendation kind.
- Do not run implementation, CI, installation, GitHub writes, or Forged
  execution.
- Do not repeat critique merely because another critic could imagine more.
