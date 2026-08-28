# Ledger-native work-item specification schema

The work item is the complete, durable execution contract. Keep it concise, but
include every fact an implementation and review agent needs without access to
the planning conversation.

## Title

Use `<type>(<scope>): <imperative>`, lowercase, at most 70 characters. The title
must be suitable as the pull request title. Use `feat`, `fix`, `refactor`,
`docs`, `test`, `build`, or `chore` according to the actual change.

## `description`

Include:

- **Context:** current behavior, user pain, and why the work matters.
- **What we're building:** concrete behavior and the reviewable boundary.

Name relevant components and existing contracts only after inspecting them.
Avoid prescribing an implementation here; that belongs in `design`.

## `design`

Record the decisions the implementation must preserve:

- intended data flow and ownership boundary;
- public or internal interfaces and compatibility constraints;
- failure behavior, migration or rollout constraints, and non-goals;
- for an epic, cross-slice seam contracts and wave checkpoints.

Do not write “decide X.” Make the decision or put the question in `notes` and
hold the record blocked.

## `acceptanceCriteria`

Use checkable bullets that describe observable behavior. Include exact quality
gates: named test targets, format or lint commands, compatibility checks, and
manual verification only when automation cannot prove the behavior. “Tests
pass” by itself is not sufficient.

Keep acceptance distinct from implementation steps. A reviewer should be able
to falsify every item from the final diff and evidence.

## `notes`

Include:

- explicit agent instructions that do not belong in the design;
- decisions and evidence that prevent repeated research;
- non-goals and operational cautions worth making conspicuous;
- unresolved questions only as `- [ ]` bullets.

Any unchecked question makes the work item blocked. When adjudicated, move the
answer into the normative field it changes and remove the checkbox. Keep only a
short dated decision note when the history is useful.

Critique and execution-approval records also live in `notes` on current main
because there is no separate ledger commentary operation. Preserve those
fenced records during later spec updates.

## Repository metadata

Set `metadata.repository` to `git rev-parse --show-toplevel` from the target
checkout, resolved to a canonical absolute path. Verify the stored bytes with:

```bash
forged work show --id "$WORK_ID"
```
