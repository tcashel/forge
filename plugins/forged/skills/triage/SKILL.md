---
name: triage
description: "Read-only causal triage for multiple blocked, stale-looking, failed, or never-started Forge items. Use for repository or cross-project portfolio questions about root causes, human decisions, recoverable work, or stale custody; use manage-work for one exact subject or any repair."
---

# /forged:triage

Turn one fresh, bounded operator snapshot into a causal work report. Collapse
dependency fan-out under root blockers, classify cause separately from action
ownership, and preserve exact repository and Bead/run identities. This is a
diagnostic route, not another dashboard or a source of execution authority.

Use this skill for multi-item questions such as “why is this portfolio
blocked?”, “which runs failed?”, “what needs me?”, “what can agents recover?”,
or “what looks stale?”. A question about one exact run or epic stays with
`../manage-work/SKILL.md` and Work Detail. `/forged:board` remains the deliberate
one-card portfolio view.

## Fix the scope before reading

Default to the exact canonical repository named or implied by the request.
Only explicit “all”, “portfolio”, or “across projects” language selects the
operator portfolio. Resolve repository language to the exact
`metadata.repository` identity; never guess an unknown repository or merge
same-titled work across repositories.

Even for one repository, acquire Operations and Attention operator-wide, then
filter locally by exact canonical repository. This is the V1 workaround for
repo-scoped Operations omitting some closed or settled durable identities. For
portfolio scope, retain exact identities and group results by repository;
place missing identities in an `unknown repository` bucket.

## Take one bounded snapshot

Prefer the typed server tools. Use the documented CLI equivalents below when
those tools are unavailable; if both paths fail, expose the source failure and
stop classifications that depend on it.

1. Capture operator-wide Operations Overview and active Attention once:

   ```bash
   forged operations overview --limit 500
   forged attention list --state active --limit 500
   ```

   Preserve the `forged.operations-overview/1`,
   `forged.attention-list/1`, and `forged.attention-item/1` facts. Record each
   capture time, health, coverage, and truncation plus their capture skew.
   Conversation-embedded App cards are not fresh evidence.

2. If Operations is truncated, make at most one additional bounded read for
   each Operations group. Deduplicate by canonical WorkIdentity; compare
   capture and revision facts. Conflicts become `partial/recheck`. If a group
   remains truncated, the report remains partial. Attention has no cursor, so
   truncation there is always partial.

3. Use Work Map only when Operations lacks enough dependency evidence to find
   roots, with at most 500 nodes:

   ```bash
   forged work map --scope repository --repository "$TARGET_REPO" --max-nodes 500
   forged work map --scope operator --max-nodes 500
   ```

   Use repository scope only for an exact-repository request and operator scope
   only for portfolio triage. An oversized or incomplete graph leaves deeper
   roots unknown; retain any trustworthy direct dependency evidence.

4. Exclude genuinely running work from the cause lanes but report its count.
   `state: active` without live controller or attempt evidence is not running.

5. Inspect only exact plan-root IDs present in the fresh snapshot: roots whose
   readiness is blocked, unknown, or deferred, plus blocked rows whose known
   hard dependencies are closed. Batch no more than 100 IDs total:

   ```bash
   env BEADS_DIR="$BEADS_DIR" "$BD_BIN" --readonly show "$BEAD_ID" \
     --long --brief-deps --json
   ```

   Preserve revision/update evidence. Drift during acquisition becomes
   `unknown/recheck`; it never proves stale. If native Beads is unavailable,
   retain typed durable facts but mark plan purpose unknown. Never widen to a
   repository-local `.beads` store.

6. Use `forged work detail` only when typed Operations and Attention cannot
   explain a durable root. Drill at most ten exact durable roots and state how
   many were omitted. Never perform an N+1 sweep, poll, open a watcher, or cache
   triage state. One invocation is one snapshot.

Operations and Attention are separate captures, not an atomic transaction.
Changing or conflicting identities are classified conservatively.

## Classify cause and ownership separately

Use evidence in this order: typed durable run, attempt, and attention facts;
typed Operations plan, dependency, claim, and admission facts; exact canonical
Bead fields; explicitly labeled inference; unknown. Age and free-form prose
alone never prove staleness. A generic plan-only `condition=blocked`,
`owner=human`, and `resolve-blocker` tuple is a projection default, not proof
that a human owns the next action.

Give each non-running root exactly one primary counted cause and retain other
facts as secondary causes:

- `human-decision-or-gate`: a typed human decision, explicit manual/live gate,
  or unresolved operator question; merely owning attention after another cause
  does not move that root here.
- `durable-execution-failed`: a durable run has a current unresolved terminal,
  gate, provider, or retry failure. A plan-only row is never failed.
- `runtime-recovery`: typed evidence names an authorized lead-agent,
  controller, or reconciliation action whose authority is not exhausted.
- `stale-execution-custody`: `claimHealth.staleInProgress` plus independent
  no-live, dead-controller, or terminal evidence. Holder or assignee mismatch
  alone is only secondary `custody-mismatch/revalidate` evidence.
- `dependency-wait`: at least one nonclosed hard `blocks` dependency.
- `capacity-or-backoff-wait`: typed admission deferral, rate-limit wake, or
  provider backoff has a future eligibility condition.
- `intentional-planning-hold`: canonical label `manual-gate`, `live-gate`,
  `post-install`, or `anvil-stub`, an unchecked item under `Open Questions`, or
  an unchecked `ASSUMES:` entry. Unknown labels and unconstrained prose do not
  establish a hold.
- `status-only-stale-candidate`: status is blocked, all known hard blockers are
  closed, and no live/failed durable work or explicit gate, question, stub, or
  hold explains it. Always say `stale candidate`, never `stale`.
- `ready-not-started`: plan readiness is ready with no durable desired work or
  run.
- `unknown-or-degraded`: required repository, source, dependency, revision, or
  blocker evidence is missing or inconsistent.

Assign one action owner independently:

- `needs-you` for authoritative human attention or an explicit operator gate;
- `agent-can-recover` for a lead-agent/system action already within authority;
- `waiting-normally` for dependency, capacity, rate-limit, or backoff waits;
- `parked-by-design` for a later wave or unfinished specification;
- `ready-to-dispatch` for ready work that has not been submitted; or
- `unknown` when no safe owner can be established.

A failed run that now needs a human remains counted once under failed
execution and is merely indexed under `Needs you`.

## Collapse hard blockers to roots

Build the causal graph only from nonclosed hard `blocks` dependencies. Never
traverse parent-child, related, discovered-from, or supersedes edges as
readiness blockers. Walk upstream to unresolved roots and detect cycles; a
cycle is `unknown/recheck`, not a chosen root.

Assign each downstream item to one deterministic primary root: nearest
unresolved root first, then exact repository plus Bead ID as the tie-breaker.
Keep other unresolved roots as secondary blockers. Render each primary root
once with its impacted-descendant count and bounded exact-ID examples; do not
count descendants as separate causes or decisions. Rank by action urgency,
then impacted count, then stable repository/ID order.

## Report the result

Every report includes:

1. Scope; Operations and Attention capture times/skew, health, coverage, and
   truncation; graph/Beads/detail coverage; and the excluded running count.
2. Exclusive cause totals and all action-owner totals, explicitly saying that
   descendants were collapsed.
3. Counted sections named `Human decision or gate`, `Failed execution`,
   `Runtime recovery`, `Dependency or capacity wait`, `Parked by design`,
   `Stale custody or candidates`, `Ready but not started`, and
   `Unknown/degraded`. Omit empty sections. Always report zero confirmed failed executions
   and zero confirmed stale work when true.
4. Non-counted `Needs you`, `Agent can recover`, and `Waiting normally`
   indexes pointing to exact roots in those sections.
5. For each counted root: exact repository, Bead/run ID and title,
   evidence-backed cause, confidence (`confirmed`, `inferred`, or `unknown`),
   affected count, authoritative owner, secondary blockers, and one safe next
   action. Show at most ten examples per section and state omitted counts.
6. A short highest-leverage order without performing any action.

Limit exhaustion, source failure, revision drift, graph cycles, missing
dependency status, unknown repositories, and conflicting recovery reads must
be visible as partial or unknown. Never turn incomplete evidence into a clean
bill of health.

## Follow-ups do not inherit authority

A batch label is only a conversational selector. “Inspect batch A” takes a new
snapshot and may refresh Work Detail for at most ten exact subjects. “Repair
batch A” returns to `../manage-work/SKILL.md`, refreshes every exact Bead
revision or attention occurrence/control tuple, and follows the existing
guarded route one subject at a time. The triage snapshot never authorizes a
mutation or bulk “fix all”.

## Zero-effect budget

This skill performs no acknowledgement or attention control; no Bead status,
assignee, dependency, comment, claim, or reservation change; no retry,
restart, reconcile, resubmit, dispatch, start, or submit; no provider, service,
configuration, process, Git, GitHub, installation, or cache mutation. Reads
that reveal a safe action report that action without taking it.

`triage-fixtures.json` is deterministic validation evidence for these bounds,
classifications, root-collapse rules, degraded states, and zero-effect budget.
It is not runtime routing logic or another state store.
