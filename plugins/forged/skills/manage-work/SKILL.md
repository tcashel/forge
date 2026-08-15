---
name: manage-work
description: "Automatically route ordinary requests to inspect, plan, critique, adjudicate, or explicitly execute Forge work through native operator-scoped Beads and typed Forged handoff. Use whenever the operator discusses work without naming a Forged skill."
---

# Manage work conversationally

This is the normal entrypoint for Forge. The operator can speak in ordinary
language; they do not need to know a skill name. Classify the request, preserve
its authority boundary, and follow exactly one existing sibling workflow when
one applies.

The lead agent owns conversation and judgment. Beads owns the editable plan.
Forged owns durable execution only after explicit submission. Conversation is
never a substitute for either durable authority.

## Route one intent

Authority is monotonic. Do not let a read become a write or a plan become
execution merely because the next step seems obvious.

| Intent | Route | Authority |
| --- | --- | --- |
| Observe | Read the smallest relevant Beads or Forged projection | No claims or writes |
| Explore | Discuss or research supplied context | Persist nothing |
| Plan or revise | Read and follow `../plan/SKILL.md` | Native Bead writes only |
| Critique | Read and follow `../critique/SKILL.md` | Its one bounded recommendation comment only |
| Adjudicate | Read and follow `../adjudicate/SKILL.md` | Its intentional native-field update only |
| Approve plan wording | Continue planning or adjudication | Never execution |
| Execute one slice | Apply the authorization gate, then follow `../dispatch/SKILL.md` | One approved start and submit |
| Execute one epic | Apply the authorization gate, then follow `../run-epic/SKILL.md` | One approved start and submit |
| Status | Read only | Never initial submission |
| Priority, pause, resume, stop, or attention control | Do not reinterpret as execution approval | Use only a separately landed conversational control contract |

When a request mixes intents, complete the least-authorized part first. A
request to “plan and run this” authorizes planning, not execution; return the
locked plan and ask for the exact execution approval described below.

## Resolve operator and repository scope

Resolve the operator store and canonical repository once:

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
export BEADS_DIR="${BEADS_DIR:-$ANVIL_HOME/beads}"
BD_BIN="${BD_BIN:-$(command -v bd)}"
TARGET_REPO="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
env BEADS_DIR="$BEADS_DIR" "$BD_BIN" where --json
```

Every Beads command must carry the explicit `BEADS_DIR`. Never initialize
Beads in the target checkout, route creation through a repository option, or
create a parallel specification file.

For reads and execution, prefer an exact id supplied by the operator. Otherwise
query only the bounded frontier whose `metadata.repository` exactly equals
`TARGET_REPO`. A title is display context, not an execution selector. Zero
matches is not found. Multiple matches require a concise disambiguation and no
mutation.

Before revising an existing plan or handing work to execution, read the
complete native Bead, its parent and dependencies, comments, status, assignee,
revision, and repository metadata. New-work creation remains owned by the plan
skill. Unresolved questions, an unresolved critique CRUX, stale repository
identity, an incompatible issue type, unmet dependencies, or absence from the
exact ready frontier blocks execution.

## Distinguish discussion from durable work

Observation and exploration are read-only. Do not create a Bead because a
conversation sounds useful. Create or revise durable work only when the
operator clearly asks to capture, plan, or change it; then delegate to the plan
skill and let its native-field and open-question gates decide readiness.

External context already supplied by the operator or another host tool can
inform research. This skill neither retrieves nor synchronizes an external
tracker and never stores its credentials.

## Require exact execution approval

Approval of a plan, critique resolution, implementation direction, or prior
work is not execution approval.

Before asking, resolve the base branch and use `forged definition validate`
with the intended profile and roster (omitting unset optional flags) to resolve
their exact references. Present one bounded confirmation tuple:

- slice or epic;
- Bead id, title, and observed revision;
- canonical `metadata.repository`;
- base branch;
- resolved profile and roster;
- the exact start-then-submit action being authorized.

A short reply such as “yes” or “do it” is valid only when it immediately and
unambiguously answers that one tuple. A later reply, a general approval, a
different subject, or changed normative fields requires a new tuple.

After approval and before start, store exactly one JSON record in a Bead
comment, fenced as `forged-execution-approval`:

```forged-execution-approval
{
  "schema": "forged-execution-approval/1",
  "subjectKind": "<slice|epic>",
  "beadId": "<exact id>",
  "observedRevision": "<revision shown in the tuple>",
  "repository": "<canonical absolute root>",
  "baseRef": "<base>",
  "profile": "<resolved profile>",
  "roster": "<resolved roster>",
  "action": "<run-start-submit|epic-start-submit>",
  "approvedAt": "<ISO-8601 UTC>",
  "actor": "<operator identity>",
  "basis": "<short non-secret approval basis>"
}
```

Prepare the complete fenced comment in a scratch file outside the target
repository. Add it using the pinned `bd comments add` command with explicit
`BEADS_DIR`, then read the Bead and comments back. Verify the record and prove
that title, description, design, acceptance criteria, notes, repository,
parent, dependencies, issue type, readiness, and ready-frontier membership are
unchanged. The comment's own revision change is expected; retain the resulting
revision as the handoff snapshot. Any normative drift requires fresh approval.

## Verify unattended handoff, then return

Before promising unattended continuation, run only the installed CLI's
read-only health checks:

```bash
forged doctor
forged service status
```

An absent, incompatible, or degraded supervisor is an input-required result.
Do not install, start, restart, or repair it here.

For a slice, follow `../dispatch/SKILL.md`: invoke one typed `run start`, verify
the returned Bead identity and frozen base/profile/roster, then submit that
exact returned run id once. For an epic, follow `../run-epic/SKILL.md`: invoke
one typed `epic start`, verify the exact epic and frozen inventory, then submit
that same epic once.

Perform no Bead or repository mutation between start and submit. A mismatched
identity or inventory prevents submit and is reported as input required. Do
not retry, resubmit, or manufacture a replacement subject.

After successful submit, return the durable identifiers and the sibling
skill's concrete read-only reconnect commands, then stop. Do not poll, create a
watcher, shell-detach work, or keep the host conversation alive to propel it.

## Mutation budget

The validation-only `intent-fixtures.json` records the closed intent matrix.
For this router itself:

- all observation, exploration, plan-approval, ambiguity, stale-approval,
  status, control, and external-context cases have zero mutations;
- planning, critique, and adjudication delegate their mutations to exactly one
  sibling contract;
- approved slice execution adds at most one approval comment, one run start,
  and one run submit;
- approved epic execution adds at most one approval comment, one epic start,
  and one epic submit;
- service mutations, direct provider-adapter calls, and GitHub writes are
  always zero here. The approved submit deliberately authorizes Forged's later
  durable execution; the lead-agent router never launches that provider itself.

The fixture is test evidence, not runtime routing logic or a second workflow
engine. Static validation is not native Claude or Codex behavior proof.

## Never

- Never treat a status or lifecycle request as authorization for initial
  execution.
- Never claim work merely to observe it.
- Never store approval only in conversation state.
- Never create a repository-local Beads store or a sidecar specification.
- Never retrieve or synchronize an external tracker.
- Never install or mutate the service, invoke a provider for testing, or merge
  the default branch.
- Never add review rounds in search of unanimity.
