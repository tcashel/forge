---
title: Run an epic
description: Hand an approved rolling epic to Forge and reconnect when it has a draft pull request or a decision.
---

An epic groups related work into reviewable slices. Forge executes ready
children, integrates clean results, reassesses predeclared unstarted work, and
finishes at one draft pull request to the default branch.

Start with [Getting started](/forge/getting-started/) if your operator state,
provider roster, or repository checks are not configured yet.

## Make the plan ready

Ask your lead agent to plan, critique, and adjudicate the epic. The editable
specification lives in each work item's description, design, acceptance
criteria, and notes. Each item also names its target repository.

Before execution, check that:

- The first children have complete specifications and recorded dispositions
  for every recommendation and open question.
- Later work has explicit boundaries and dependencies. A blocked planning stub
  states what is still unknown; it is not an executable task.
- The repository, base branch, assurance profile, and roster match the work
  you intend to authorize.
- The roster has an independent read-only assessment role for rolling
  planning and separate read-only critique candidates.

Inspect the exact ID returned by planning:

```sh
forged explain --id "$EPIC_ID"
```

The lifecycle should report `adjudicated` before the handoff. A later
specification change can invalidate the earlier critique and adjudication
evidence; re-read the current revision when approving work.

## Ask the lead to run it

The conversational handoff is:

```text
Run epic <id> with Forge using standard assurance. Stop at a draft pull request.
```

The `/forged:run-epic` skill checks the exact execution tuple and preflight
result, then starts and submits the approved epic. It returns the durable ID
and inspection commands. `standard` provides deterministic gates, one
independent review, and bounded remediation. Choose stronger assurance when
the specific work warrants it; disagreement does not automatically expand the
review budget.

## Or use the CLI

Set `EPIC_ID` to the ID from your plan. Run these commands from the intended
repository root. The examples use `main`; replace it with the repository's
actual default branch when different.

First, rehearse the handoff:

```sh
forged epic preflight --epic "$EPIC_ID" --repo "$PWD" \
  --base-ref main --profile standard --roster default --rolling
```

Inspect the returned child inventory, normalized base, integration branch,
definitions, provider checks, and authentication results. Resolve failed
checks or identity mismatches before continuing. Preflight does not replace
the recorded planning and adjudication evidence.

Once you approve that exact work and execution configuration:

```sh
forged epic start --epic "$EPIC_ID" --repo "$PWD" \
  --base-ref main --profile standard --roster default --rolling
forged epic submit --epic "$EPIC_ID"
```

Keep the work-item specification unchanged between start and submit. The
`--rolling` flag authorizes provider-assisted planning of the declared blocked
stubs. Changed outcomes, scope, or authority require a decision.

## Leave and reconnect

Submission starts durable detached work and returns immediately. You can leave
the lead-agent session while the host stays awake. Reconnect with:

```sh
forged explain --id "$EPIC_ID"
forged wait --id "$EPIC_ID" --until decision --timeout 240
```

`wait` returns when the requested condition changes or its timeout expires.
For a repository-wide view, use `forged next --repo "$PWD"`.

Forge may stop for a changed assumption, missing authority, a gate failure, an
exhausted budget, or an integration conflict. Read the precise recommended
action in `explain`; [Inspect and recover](/forge/guides/inspect-and-recover/)
explains the recovery loop.

## Review the result

Clean child work may be merged into the epic's integration branch. The final
delivery is one draft PR to the default branch with the run's review and check
evidence. Inspect that evidence and the diff before deciding to merge.

Default-branch merge belongs to the human. After verifying the actual merge on
GitHub, record the exact PR number and merge SHA:

```sh
forged run stop --run "$EPIC_ID" --outcome landed \
  --reason "Verified the merged pull request on GitHub" \
  --pr "$PR_NUMBER" --sha "$MERGE_SHA"
```

For the full lifecycle and agent handoff contract, read
[The one lifecycle](https://github.com/tcashel/forge/blob/main/docs/LIFECYCLE.md)
and the [epic skill](https://github.com/tcashel/forge/blob/main/plugins/forged/skills/run-epic/SKILL.md).
