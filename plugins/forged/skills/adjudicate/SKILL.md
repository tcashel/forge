---
name: adjudicate
description: "Resolve every recommendation, CRUX, and open question from the latest Forged critique, write accepted decisions into the ledger-native work-item fields, and make the record ready only when its execution contract is complete. Use after /forged:critique or when the operator invokes /forged:adjudicate."
---

# /forged:adjudicate

Position: critiqued work item -> coherent ready record or explicit blocker.
Next: `/forged:dispatch` for a slice or `/forged:run-epic` for an epic.

Boundary: adjudication and every judgment call stay in the lead session. The
lead reads and revision-CAS updates the ledger; Forged owns execution only after
the later explicit handoff.

## Load the record and latest critique

```bash
forged work show --id "$WORK_ID"

RECOMMENDATION_LIMIT=100
while :; do
  RECOMMENDATION_NOTES="$(forged work note list \
    --id "$WORK_ID" --kind recommendation --limit "$RECOMMENDATION_LIMIT")" || exit 1
  RECOMMENDATION_SHOWN="$(printf '%s' "$RECOMMENDATION_NOTES" | \
    jq -er '.result.totals.shown')" || exit 1
  RECOMMENDATION_TOTAL="$(printf '%s' "$RECOMMENDATION_NOTES" | \
    jq -er '.result.totals.total')" || exit 1
  [[ "$RECOMMENDATION_SHOWN" -eq "$RECOMMENDATION_TOTAL" ]] && break
  if [[ "$RECOMMENDATION_TOTAL" -gt 500 ]]; then
    printf 'recommendation notes exceed the 500-row read cap: %s; operator action required\n' \
      "$RECOMMENDATION_TOTAL" >&2
    exit 1
  fi
  RECOMMENDATION_LIMIT="$RECOMMENDATION_TOTAL"
done
if [[ "$RECOMMENDATION_TOTAL" -eq 0 ]]; then
  printf 'no recommendation note exists; run /forged:critique\n' >&2
  exit 1
fi
LATEST_RECOMMENDATION="$(printf '%s' "$RECOMMENDATION_NOTES" | \
  jq -cer '.result.notes[-1]')" || exit 1
RECOMMENDATIONS_JSON="$(printf '%s' "$LATEST_RECOMMENDATION" | jq -cer '
  select(.schema == "forged.spec-recommendations/1") | .bodyJson | fromjson
')" || {
  printf 'newest recommendation is not forged.spec-recommendations/1; run /forged:critique\n' >&2
  exit 1
}
```

This is the only newest-of-kind procedure: compare `totals.shown` with
`totals.total`; when truncated, re-read with `--limit` equal to `total`, capped
at 500; then take the last row of the requested kind. Tell the operator and
refuse beyond 500. Verify the decoded payload's `workItem` and `repository`
match the current record. Never scan backward to make a stale note win.

If the newest typed payload is incomplete or mismatched, stop and direct the
operator to `/forged:critique`; do not invent the critic's findings.

## Resolve the record

1. Verify each recommendation against current repository evidence. Accept,
   adapt, or reject it with a reason.
2. Present one unresolved CRUX at a time: evidence, bounded options,
   consequences, and a recommended choice. Capture the operator's decision.
3. Resolve every open question. Make routine engineering judgments in the lead
   session; ask only when a choice changes product scope or external authority.
4. Reconcile the full work item so fields do not contradict each other. For
   epics, include parent-child links, blocking dependencies, waves, and stub
   assumptions.

There is no “defer to implementation” outcome. A CRUX is resolved, rejected as
inapplicable with evidence, or remains blocking.

## Update the authoritative fields

Integrate accepted resolutions into `description`, `design`,
`acceptanceCriteria`, and `notes` according to the plan schema. Remove resolved
question checkboxes. Record CRUX resolutions and a concise dated adjudication
summary in the spec `notes`; accepted corrections belong in the normative
fields. The immutable recommendation note remains unchanged.

Prepare complete field bodies outside the repository and make one guarded
update. Fail closed before the update unless every scratch file is readable and
nonempty and every body was constructed successfully. Attached values protect
bullet-led Markdown:

```bash
: "${DRAFT_DIR:?set DRAFT_DIR to the adjudication scratch directory}"
for FIELD_FILE in title description design acceptance notes; do
  FIELD_PATH="$DRAFT_DIR/$FIELD_FILE.md"
  if [[ ! -r "$FIELD_PATH" || ! -s "$FIELD_PATH" ]]; then
    printf 'missing or empty adjudication field: %s\n' "$FIELD_PATH" >&2
    exit 1
  fi
done
TITLE="$(<"$DRAFT_DIR/title.md")" || exit 1
DESCRIPTION="$(<"$DRAFT_DIR/description.md")" || exit 1
DESIGN="$(<"$DRAFT_DIR/design.md")" || exit 1
ACCEPTANCE="$(<"$DRAFT_DIR/acceptance.md")" || exit 1
NOTES="$(<"$DRAFT_DIR/notes.md")" || exit 1
if [[ -z "$TITLE" || -z "$DESCRIPTION" || -z "$DESIGN" || \
      -z "$ACCEPTANCE" || -z "$NOTES" ]]; then
  printf 'adjudication fields must all be nonempty\n' >&2
  exit 1
fi
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

Preserve repository metadata, dependency edges, custody, kind, and unrelated
state. A moved revision requires a fresh read and reconciliation.

A blocked planning stub becomes open only after all normative fields and
dispositions are complete. Current main exposes that promotion as two separate
mutations: the revision-CAS `work update` above, then:

```bash
forged work reopen --id "$WORK_ID"
forged work show --id "$WORK_ID"
```

This update-then-reopen sequence is non-atomic and safe only under one lead
session. Stop if either step fails or the readback differs. ore-063 will add
atomic stub promotion; never represent the current sequence as atomic.

Reopen only when:

- every native field is complete and consistent;
- every recommendation and CRUX has a disposition;
- no unchecked question remains;
- the record is not deliberately held by a later-wave assumption.

A dependency-blocked child may be open; the repository-scoped ready frontier
withholds it until its `blocks` targets close. A later-wave stub remains
blocked.

## Verify and report

```bash
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
forged work show --id "$WORK_ID"
READY_LIMIT=100
while :; do
  READY_JSON="$(forged work ready --repo "$TARGET_REPO" --limit "$READY_LIMIT")" || exit 1
  READY_SHOWN="$(printf '%s' "$READY_JSON" | jq -er '.result.totals.shown')" || exit 1
  READY_TOTAL="$(printf '%s' "$READY_JSON" | jq -er '.result.totals.total')" || exit 1
  [ "$READY_SHOWN" -eq "$READY_TOTAL" ] && break
  if [ "$READY_TOTAL" -gt 500 ]; then
    printf 'ready frontier exceeds maximum limit: %s\n' "$READY_TOTAL" >&2
    exit 1
  fi
  READY_LIMIT="$READY_TOTAL"
done
while IFS= read -r READY_ID; do
  forged work show --id "$READY_ID"
done < <(printf '%s' "$READY_JSON" | jq -r '.result.ready[].id')
```

The default ready limit is 100 and the maximum is 500. Each `result.ready` row
contains only `id`, `title`, `kind`, `status`, `priority`, `repository`, and
`revision`, not specification bodies. The loop compares
`result.totals.shown` with `result.totals.total`, raises `--limit` when
truncated, fails closed beyond the maximum, and fetches every full record by
id. Check that every intended edit persisted, metadata and graph edges remained
unchanged unless explicitly adjudicated, and readiness matches reality. Report
decisions, exact fields or edges changed, rejected findings, and the next valid
skill or named blocker.

## Never

- Do not create or update a parallel spec file.
- Do not conceal unresolved questions in prose or mark a stub ready.
- Do not start Forged execution, change GitHub, install software, or edit the
  target repository.
- Do not rerun critics merely to seek unanimity. Adjudication owns judgment.
