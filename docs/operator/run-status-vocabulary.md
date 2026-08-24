# Run status vocabulary

Use these terms as separate questions about a run. A value in one layer does
not settle the layers below or above it.

| Layer | What it proves | What it does not prove | Read next |
| --- | --- | --- | --- |
| Plan state | Beads readiness and status describe whether work is planned, ready, blocked, or otherwise inventoried. | It does not prove that a Forged controller was submitted or that a worker is live. | Direct Forged Operations, then exact Work Detail. |
| Desired controller state | The durable controller projection records intent, including desired state, generation, revision, wake, restart, and last outcome. `nextAction` describes the protocol's next projected step. | A desired `running` state is authorization, not current process liveness. | Check current controller evidence or a current attempt in Work Detail. |
| Durable run state | `RunState` is the whole-run lifecycle: `active` accepts work; `stopped` has been stopped with a reason. | `active` alone is not evidence that work is happening now, and `stopped` alone does not explain the terminal outcome. | Read the run settlement and live attempts. |
| Attempt state | `AttemptState` describes one worker generation: `running`, `completed`, `failed`, `revoking`, `reclaimed`, or `stopped`. | It is worker-local. An attempt stop or reclaim does not settle the whole run or its siblings. | Read the whole-run outcome and current controller evidence. |
| Terminal outcome | `RunOutcome` settles the complete run and records its operator-visible reason. | It is not a claim that a process is currently live; delivery claims also require delivery evidence. | For delivery, inspect the immutable PR and commit fields. |
| Delivery evidence | An immutable delivery PR and commit identify what landed. | A clean protocol result is not proof that anything landed. | Confirm the `landed` settlement and its PR/SHA. |

## Durable run outcomes

These are the seven current `RunOutcome` spellings:

- `clean` — protocol work is complete and ready for delivery.
- `blocked` — work cannot continue until a blocker is resolved.
- `input-required` — the run needs an explicit operator answer.
- `cancelled` — the operator cancelled the run without declaring the Bead complete.
- `accepted-risk` — the operator accepted a documented residual risk.
- `superseded` — a named successor run replaced this generation.
- `landed` — delivery landed and the settlement carries immutable PR and commit evidence.

`clean` is therefore delivery-ready, not delivered. Only `landed` carries the
immutable delivery evidence that supports a claim about the resulting PR and
commit.

## Liveness and observation

Do not report a run as live because a plan row, desired state, or durable run
state says `active`. Liveness needs current corroboration: a current controller
record/heartbeat or a current attempt evidence record (normally an attempt in
`running` or `revoking` state). A stopped or reclaimed attempt is evidence about
that worker only; it does not by itself settle the whole run.

Use the direct, read-only Forged Operations path:

```text
forged operations overview --repo /absolute/path/to/repository
forged work detail --subject-kind run --subject-id <run-id>
```

Start with Operations Overview to find the exact durable subject and its
controller/attempt evidence, then open that subject with exact Work Detail.
Treat those direct reads as the observation path; App or pane state is a
rendered snapshot, not authority. This reference documents observation only
and does not prescribe mutation commands.
