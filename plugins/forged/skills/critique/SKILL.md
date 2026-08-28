---
name: critique
description: "Harden a complete ledger-native ore specification with proportional, provider-neutral critique and persist one synthesized recommendation record for adjudication. Use after /forged:plan or when the operator invokes /forged:critique."
---

# /forged:critique

Lifecycle position: planned ore → reviewed recommendation record. Next:
`/forged:adjudicate`. Critique runs in the lead session: the lead agent and
any delegated critics read the ledger and repository, while Forged only serves
typed work-store reads and the guarded notes update. This stage never launches
or controls execution.

The goal is one useful adversarial pass proportional to risk, not a review
treadmill. Critique does not alter the normative description, design,
acceptance criteria, graph, or lifecycle state. The ledger has no commentary
verb, so its one allowed persistence effect is a revision-CAS update that
appends the synthesized review record to `notes`.

## Load the authoritative record

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
CURRENT_JSON="$(forged work show --id "$ORE_ID")"
printf '%s' "$CURRENT_JSON" | jq -e '.ok and .result.work.workId'
```

Read title, `description`, `design`, `acceptanceCriteria`, `notes`, kind,
status, priority, revision, `metadata.repository`, and dependency edges.
Inspect the named target repository read-only. Do not substitute a sidecar
file, conversation summary, or repository-local store.

If required native fields are absent, repository metadata is missing or wrong,
or an unchecked question remains, report that blocking defect and stop. The
ore is not eligible for critique-as-approval.

## Choose the smallest useful topology

- **Low risk:** the lead agent performs one structured critic pass.
- **Normal risk:** delegate one independent critic using
  `../../agents/critic.md` relative to this skill, then verify and synthesize
  its findings.
- **High risk:** use a small cross-family panel only when security, data loss,
  concurrency, compatibility, or a multi-slice contract warrants distinct
  perspectives.

Use the host's native delegation when available. Parallelize genuinely
independent perspectives. Critics are read-only and receive the rendered ore
plus repository root; they do not mutate the ledger or checkout. More seats
are not intrinsically better. Stop when the selected topology completes one
bounded pass.

## Adjudicate critic output before persisting it

Verify every cited path, reject style-only churn and speculative scope, combine
duplicates, and separate:

- **recommendations:** clear, evidence-backed corrections;
- **CRUXes:** findings whose resolution requires lead/operator judgment;
- **open questions:** facts that still need a decision or evidence;
- **rejected findings:** concise reasons critic claims are inapplicable.

Do not silently modify the specification. Produce one exact fenced block:

````markdown
```forged-spec-recommendations
work: <ore id>
repository: <canonical absolute path>
reviewed_at: <ISO-8601 UTC>
topology: <low|normal|high and seats used>

## Recommendations
- [ ] <field or edge>: <specific correction and evidence>

## CRUXes
### CRUX-1: <decision>
- Evidence: <verified facts>
- Options: <bounded choices and consequences>
- Recommendation: <lead critic's call>
- Resolution: UNRESOLVED

## Open Questions
- [ ] <question, or "None">

## Rejected Findings
- <finding and reason, or "None">

## Verification
- <what was inspected and what was not>
```
````

If there are no findings, write `None` and no unresolved CRUX or checkbox.
That completes critique but does not bypass adjudication's readiness checks.

## Persist the handoff in notes

Append the complete block to the existing notes and guard the update with the
revision just read. Use attached `--notes=value` form because the body may
start with Markdown punctuation:

```bash
REVISION="$(printf '%s' "$CURRENT_JSON" | jq -er '.result.work.revision')"
CURRENT_NOTES="$(printf '%s' "$CURRENT_JSON" | jq -er '.result.work.spec.notes')"
UPDATED_NOTES="$(printf '%s\n\n%s\n' "$CURRENT_NOTES" "$RECOMMENDATION_BLOCK")"
forged work update --id "$ORE_ID" --expected-revision "$REVISION" \
  --notes="$UPDATED_NOTES"
forged work show --id "$ORE_ID"
```

Verify the newest notes contain the exact complete block and that the update
minted one revision while every other spec field, repository value, edge, and
coordination field stayed unchanged. A moved revision is input-required: do
not overwrite concurrent planning.

## Never

- Do not edit normative fields, resolve CRUXes, or change work-item status.
- Do not invent a comment verb; critique persistence is the guarded notes
  revision described above.
- Do not run implementation, CI, installation, GitHub writes, or Forged
  execution.
- Do not repeat critique merely because another critic could imagine more.
