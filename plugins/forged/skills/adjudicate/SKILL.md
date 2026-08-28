---
name: adjudicate
description: "Resolve every recommendation, CRUX, and open question from the latest Forged critique, write accepted decisions into the ledger-native ore fields, and open the work item only when its execution contract is complete. Use after /forged:critique or when the operator invokes /forged:adjudicate."
---

# /forged:adjudicate

Lifecycle position: critiqued ore → execution-ready contract. Next:
`/forged:dispatch` for one slice or `/forged:run-epic` for an epic. This
stage runs in the lead session: the lead agent owns operator judgment and
edits the ledger through typed work verbs. Forged execution begins only after
the later explicit handoff.

Walk judgment calls with the operator one at a time, decide routine corrections
as the lead agent, and perform one intentional revision-CAS update after the
complete result is known.

## Load the ore and latest critique

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
CURRENT_JSON="$(forged work show --id "$ORE_ID")"
printf '%s' "$CURRENT_JSON" | jq -e '.ok and .result.work.workId'
```

Use the newest complete `forged-spec-recommendations` block in `notes` whose
`work` and `repository` match the current ore. For migrated records only,
accept the newest complete `anvil-spec-recommendations` block when no
Forged-tagged block exists. Never use recommendations for another id or
repository.

If no complete block exists, stop and direct the operator to
`/forged:critique`; do not invent the critic's findings.

## Resolve the review

1. Verify each recommendation against current repository evidence. Accept,
   adapt, or reject it with a reason.
2. Present one unresolved CRUX at a time: evidence, bounded options,
   consequences, and a recommended choice. Capture the operator's decision.
3. Resolve every open question. When normal engineering judgment is
   sufficient, make the call; ask only when the choice changes product scope
   or external authority.
4. Reconcile the full work item so fields do not contradict each other. For
   epics, include parent links, dependencies, waves, and stub assumptions.

There is no “defer to implementation” outcome. A CRUX is resolved, rejected as
inapplicable with evidence, or remains blocking.

## Update the authoritative native fields

Integrate accepted resolutions into `description`, `design`,
`acceptance_criteria`, and `notes` according to the plan schema. Remove
resolved question checkboxes. The ledger has no commentary verb: replace the
detailed live recommendation block in `notes` with a concise dated
adjudication summary that records dispositions and operator decisions.

Use one guarded update with the complete reconciled bodies. Attached value form
protects bullet-led Markdown:

```bash
REVISION="$(printf '%s' "$CURRENT_JSON" | jq -er '.result.work.revision')"
forged work update --id "$ORE_ID" --expected-revision "$REVISION" \
  --title "$TITLE" --description="$DESCRIPTION" --design="$DESIGN" \
  --acceptance="$ACCEPTANCE" --notes="$NOTES"
forged work show --id "$ORE_ID"
```

`work update` changes only spec fields and refuses a moved revision. It
therefore preserves repository metadata, typed links, priority, custody, and
coordination status. Re-read rather than retrying if the CAS loses.

Make a blocked ore open with `forged work reopen --id "$ORE_ID"` only when:

- every native field is complete and consistent;
- every recommendation and CRUX has a disposition;
- no unchecked question remains;
- the work item is not deliberately held as a later-wave stub.

A dependency-blocked child may be open; `forged work ready` withholds it until
its `blocks` prerequisites close. A later-wave stub or unresolved contract
stays blocked and must not be made superficially ready.

## Verify and report

```bash
forged work show --id "$ORE_ID"
forged work ready |
  jq --arg id "$ORE_ID" --arg repo "$TARGET_REPO" \
    '.result.ready[] |
     select(.workId == $id and .metadata.repository == $repo)'
```

Check that every intended edit persisted, metadata and links are unchanged
unless explicitly adjudicated, no stale recommendation block remains
unresolved, and readiness matches reality. Report decisions, exact native
fields or links changed, rejected findings, and whether the next valid action
is `/forged:dispatch`, `/forged:run-epic`, or resolving a named blocker.

## Never

- Do not create or update a parallel spec file.
- Do not conceal unresolved questions in prose or make a stub ready.
- Do not invent or depend on a comment verb.
- Do not start execution, change GitHub, install software, or edit the target
  repository.
- Do not rerun critics merely to seek unanimity. Adjudication owns judgment.
