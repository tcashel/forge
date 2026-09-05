---
name: critique
description: "Harden a complete ledger-native ore work-item specification with proportional, provider-neutral critique and persist one synthesized recommendation record for adjudication. Use after /forged:plan or when the operator invokes /forged:critique."
---

# /forged:critique

Position: `forged explain --id "$WORK_ID"` must report lifecycle stage `drafted`.
Next: `forged next --repo "$TARGET_REPO"` reports adjudication after the note lands.

Boundary: critique is lead-session cognition. Critics inspect the rendered
ledger record and repository read-only; they never mutate the ledger, checkout,
GitHub, or execution state.

## Gate and topology

Read every native spec field, repository identity, dependency, revision, and
unchecked question. A missing field, wrong repository, unresolved question, or
later-wave stub blocks critique.

Choose the smallest useful topology:

- Low risk: one structured lead pass.
- Normal risk: one independent critic using `../../agents/critic.md`.
- High risk: a small cross-family panel only when security, data loss,
  concurrency, compatibility, or a multi-slice seam needs distinct evidence.

Use native delegation when available and parallelize only independent views.
The critic subagent prompt is unchanged. Verify every cited path, reject
style-only churn, combine duplicates, and stop after the selected bounded pass.

## Persist one synthesis

Separate evidence-backed recommendations, judgment-bearing CRUXes, open
questions, and rejected findings. Do not alter the specification here. Write
one raw JSON object using `forged.spec-recommendations/1`:

```json
{
  "schema": "forged.spec-recommendations/1",
  "workItem": "<ore-id>",
  "repository": "<canonical absolute path>",
  "reviewedAt": "<ISO-8601 UTC>",
  "topology": "<low|normal|high and seats used>",
  "recommendations": [{"target": "<field or edge>", "correction": "<specific correction and evidence>"}],
  "cruxes": [{"id": "CRUX-1", "evidence": ["<fact>"], "options": ["<choice and consequence>"], "recommendation": "<call>"}],
  "openQuestions": ["<question>"],
  "rejectedFindings": [{"finding": "<claim>", "reason": "<reason>"}],
  "verification": ["<inspected and not inspected>"]
}
```

Empty `recommendations` and `cruxes` arrays are valid and still require
adjudication. Reject an unreadable or empty payload file, then append exactly
one typed note; only the critique seat writes kind `recommendation`:

```bash
forged work note add --id "$WORK_ID" --kind recommendation \
  --schema forged.spec-recommendations/1 --actor critique \
  --body-file "$RECOMMENDATIONS_PATH"
forged explain --id "$WORK_ID"
forged next --repo "$TARGET_REPO"
```

A schema refusal is repaired in the payload and added once; it never falls back
to specification prose.

## Never

- Do not change native fields, edges, status, or resolve CRUXes.
- Do not execute, run CI, install software, or write to GitHub.
- Do not repeat critique merely because another critic might disagree.
