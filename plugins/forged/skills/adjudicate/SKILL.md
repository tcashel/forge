---
name: adjudicate
description: "Resolve every recommendation, CRUX, and open question from the latest Forged critique, write accepted decisions into the native Bead fields, and open the record only when its execution contract is complete. Use after /forged:critique or when the operator invokes /forged:adjudicate."
---

# /forged:adjudicate

Turn critique into one coherent, executable native Bead. Walk judgment calls
with the operator one at a time, decide routine corrections as the lead agent,
and perform one intentional update after the complete result is known.

## Load the record and latest critique

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
export BEADS_DIR="${BEADS_DIR:-$ANVIL_HOME/beads}"
BD_BIN="${BD_BIN:-$(command -v bd)}"
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
env BEADS_DIR="$BEADS_DIR" "$BD_BIN" show "$BEAD_ID" \
  --long --include-comments --json
```

Use the newest complete `forged-spec-recommendations` comment for this Bead.
For migration compatibility only, accept the newest complete legacy
`anvil-spec-recommendations` block if no Forged-tagged block exists. Never use
a recommendation for another id or repository.

If no complete block exists, stop and direct the operator to
`/forged:critique`; do not invent the critic's findings.

## Resolve the ledger

1. Verify each recommendation against current repository evidence. Accept,
   adapt, or reject it with a reason.
2. Present one unresolved CRUX at a time: evidence, bounded options,
   consequences, and a recommended choice. Capture the operator's decision.
3. Resolve every open question. When normal engineering judgment is sufficient,
   make the call; ask only when the choice changes product scope or external
   authority.
4. Reconcile the full Bead so fields do not contradict each other. For epics,
   include parent links, dependencies, waves, and stub assumptions.

There is no “defer to implementation” outcome. A CRUX is resolved, rejected as
inapplicable with evidence, or remains blocking.

## Update the authoritative native fields

Integrate accepted resolutions into `description`, `design`,
`acceptance_criteria`, and `notes` according to the plan schema. Remove resolved
question checkboxes. Preserve only a concise dated adjudication summary in
`notes`; the comment retains the detailed review history.

Use one intentional `bd update` with explicit `BEADS_DIR`. Pass complete field
bodies via the supported pinned-bd flags, not a partial edit that loses existing
content. Preserve `metadata.repository`, parent, dependencies, assignee, labels,
and unrelated metadata. Read `bd update --help` before selecting flags.

Set status to `open` only when:

- every native field is complete and consistent;
- every recommendation and CRUX has a disposition;
- no unchecked question remains;
- the record is not deliberately held by a real dependency or later-wave
  assumption.

A dependency-blocked child can remain `open`; `bd ready` will withhold it until
the dependency closes. A later-wave stub or unresolved-spec record stays
`blocked` and must not be made superficially ready.

## Verify and report

Read the Bead back:

```bash
env BEADS_DIR="$BEADS_DIR" "$BD_BIN" show "$BEAD_ID" \
  --long --include-comments --json
env BEADS_DIR="$BEADS_DIR" "$BD_BIN" ready \
  --metadata-field "repository=$TARGET_REPO" --json
```

Check that every intended edit persisted, repository metadata and graph edges
are unchanged unless explicitly adjudicated, and readiness matches reality.
Report the decisions, exact native fields or edges changed, rejected findings,
and whether the next valid action is `/forged:dispatch`,
`/forged:run-epic`, or resolving a named blocker.

## Never

- Do not create or update a parallel spec file.
- Do not conceal unresolved questions in prose or mark a stub ready.
- Do not start Forged, change GitHub, install software, or edit the target repo.
- Do not rerun critics merely to seek unanimity. Adjudication owns judgment.
