# LEARNINGS — evidence behind the Forge lead-agent plugin

These are durable engineering lessons from the Smithy Anvil bare-parts
experiment. Historical Workflow details explain decisions; they are not an
active alternate execution path.

## 0. Keep the lead-agent UX; colocate it with Forged

One user-facing lead agent is the right front door. It plans, critiques, and
adjudicates. Beads is the durable specification and work graph. Forged owns
execution packages, providers, attempts, gates, review, recovery, and results.
Herdr is process transport; GitHub is delivery truth.

Smithy Anvil 0.3 proved the boundary. The current Forge tree now carries the
same thin dual-host adapter beside the binary for its next containing release,
so normal installation no longer depends on another repository. Smithy history
remains evidence, not runtime authority.

## 1. The Bead specification is the sole instruction

The implementing seat receives the Bead title plus its native `description`,
`design`, `acceptance_criteria`, and `notes`. It does not receive the planning
conversation. Anything needed to implement safely must be in those fields.
`metadata.repository` identifies the repository whose cited paths were
verified. A path to an old Markdown spec is archival provenance only.

## 2. Trust durable result evidence, not a process exit code

The early Workflow stack learned that pipelines, filters, SIGPIPE, and
truncated streams make exit codes ambiguous. Forged moved this boundary into
typed terminal results, attempt rows, artifacts, and an append-only event log.
The plugin never reconstructs execution state from terminal output.

## 3. Independent critique is proportional, not ceremonial

One critic is enough for a small reversible slice. Normal non-trivial work may
benefit from two genuinely independent angles. Security, migration,
concurrency, financial, or irreversible behavior can justify another provider
family. The lead synthesizes corroborated, single, and conflicting findings;
votes never erase a severe evidence-backed finding.

## 4. Execution stops at a human-owned default-branch merge

A slice ends at a reviewed draft pull request. An epic may merge mechanically
clean children into its disposable integration branch, then opens one draft
pull request to the default branch. The human owns that final merge. The
plugin initiates the typed handoff and does not duplicate GitHub state.

## 5. Structured critique output is a planning contract

Critics emit one `forged-spec-critique` block. Synthesis emits one
`forged-spec-recommendations` block and persists it as a tagged Bead comment.
Adjudication reads that durable comment, applies accepted edits to native Bead
fields, and records a concise decision log in notes. Legacy
`anvil-spec-recommendations` comments may be read during migration.

## 6. Idempotent external effects belong to Forged

The old Workflow used hidden GitHub markers to deduplicate comments. The
general lesson survives, but the implementation belongs to Forged's operation
ledger and GitHub adapter. The plugin must never publish review state by
inventing its own identity or retry policy.

## 7. Operator state stays out of target repositories

All Beads and Forged state lives under explicit `$BEADS_DIR` and
`$ANVIL_HOME`. Planning never routes issue creation to a repository, never
initializes from the target checkout, and never commits `.beads`, agent
settings, or spec files.
Worktrees are disposable; the operator store is not.

## 8. Headless gates cannot depend on interactive authentication

Every quality gate in a Bead must be runnable without a signing prompt, login
dialog, or unlocked desktop session. A command that can block indefinitely is
not an unattended gate. Provider and GitHub authentication are verified before
submission, not smuggled into repository tests.

## 9. Open questions are a readiness gate

Unresolved product decisions remain explicit and the Bead stays blocked.
Adjudication may move it to `open` only after the native fields contain every
resolution and scheduling dependencies are satisfied. `bd ready` derives the
frontier; neither the plugin nor Forged guesses around it.

## 10. Detachment is a Forged primitive

The lead agent never uses `nohup`, `&`, PID files, scheduled watch jobs, or a
poll loop to keep work alive. `forged run submit` and `forged epic submit`
return durable controller identities. Another host session can reconnect
through overview, events, and session controls.

## 11. Use sanctioned host delegation for planning cognition

Critique uses the current host's native read-only delegation. It does not spawn
provider CLIs or persist provider session topology as workflow state. Provider
selection for implementation and code review belongs to the immutable Forged
roster, not to the planning plugin.

## 12. Lock late with rolling epic waves

An epic plans the goal, cut lines, seam contracts, waves, and checkable
assumptions up front. Only the current frontier receives a complete executable
spec. Downstream children remain native Beads in `blocked` state with explicit
assumptions. After upstream integration, the lead verifies reality, expands
the native fields, critiques, adjudicates, and opens the next frontier.

## 13. Read-only roles get a mechanical cage

Critics receive read-only repository authority. Implementers need write access,
so their containment is structural: isolated worktrees, fenced claims, typed
operations, reviewed draft PRs, and a human-owned default-branch merge.

## 14. Price and bound the review loop, not individual seats

Forged profiles scale assurance to consequence. The normal profile uses one
repository-aware reviewer; explicit high assurance may use a small panel.
`fixRoundBudget` is the only review-loop bound. Exhaustion becomes a durable
terminal outcome that the operator may adjudicate or explicitly accept as
risk—it never creates an endless successor chain.
