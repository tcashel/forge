---
name: critique
description: "Harden a complete native Bead specification with proportional, provider-neutral critique and persist one synthesized recommendation record for adjudication. Use after /forged:plan or when the operator invokes /forged:critique."
---

# /forged:critique

Critique the native Bead before execution. The goal is one useful adversarial
pass proportional to risk, not a review treadmill. This skill reads and
comments on operator-scoped Beads; it does not edit their normative spec fields
and does not launch Forged.

## Load the authoritative record

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
export BEADS_DIR="${BEADS_DIR:-$ANVIL_HOME/beads}"
BD_BIN="${BD_BIN:-$(command -v bd)}"
env BEADS_DIR="$BEADS_DIR" "$BD_BIN" show "$BEAD_ID" \
  --long --include-comments --json
```

Read title, `description`, `design`, `acceptance_criteria`, `notes`, type,
status, `metadata.repository`, parent and dependency edges. Inspect the target
repository named by the metadata read-only. Do not substitute a sidecar file,
conversation summary, or repository-local Beads store.

If required native fields are absent, repository metadata is missing or wrong,
or an unchecked question remains, report that blocking defect and stop. The
record is not eligible for critique-as-approval.

## Choose the smallest useful topology

- **Low risk:** the lead agent performs one structured critic pass.
- **Normal risk:** delegate one independent critic using
  `../../agents/critic.md` relative to this skill, then verify and synthesize
  its findings.
- **High risk:** use a small cross-family panel only when security, data loss,
  concurrency, compatibility, or a multi-slice contract warrants distinct
  perspectives.

Use the host's native delegation when available. Parallelize genuinely
independent perspectives. Critics are read-only and receive the rendered native
Bead plus repository root; they do not mutate Beads or the checkout. More seats
are not intrinsically better. Stop when the selected topology has completed one
bounded pass.

## Adjudicate critic output before persisting it

Verify every cited path, reject style-only churn and speculative scope, combine
duplicates, and separate:

- **recommendations:** clear, evidence-backed corrections;
- **CRUXes:** findings whose resolution requires lead/operator judgment;
- **open questions:** facts that still need a decision or evidence;
- **rejected findings:** concise reason a critic claim is inapplicable.

Do not silently modify the specification. Produce one exact fenced block:

````markdown
```forged-spec-recommendations
bead: <id>
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

The block is the handoff contract for `/forged:adjudicate`. Save it as one Bead
comment using `bd comments add <id> --file <scratch-file>` with explicit
`BEADS_DIR`, then read the comments back and verify the block was stored intact.
The scratch file must live outside the target repository and may be deleted
after verification.

If there are no findings, persist a block that says `None` and has no unresolved
CRUX. That is a completed critique, not permission to skip adjudication's
readiness checks.

## Never

- Do not write native spec fields, resolve CRUXes, or change Bead status here.
- Do not run implementation, CI, installation, GitHub writes, or Forged.
- Do not repeat critique because a critic could imagine more. One bounded
  topology completes this stage; new evidence can justify a later explicit run.
