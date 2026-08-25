# Run status vocabulary

Use these terms separately when triaging Forge work. A projection can report
one fact without proving the others.

| Layer | What it proves | What it does not prove |
| --- | --- | --- |
| **Beads plan/readiness** | The planned work, its dependencies, and whether the Bead is ready to be claimed. | That a Forged run exists, a controller is present, or a worker is executing. |
| **Desired controller state** | Durable operator intent for a subject: `running`, `paused`, or `stopped`; its generation, restart budget, last reconcile outcome, and `nextAction` projection. | Current process liveness. `running` is authorization to keep a controller present, not evidence that one is alive. |
| **Run state** (`RunState`) | The whole durable run is `active` (accepting work) or `stopped`. | The state of any one worker attempt, or that an active run is currently making progress. |
| **Attempt state** (`AttemptState`) | The lifecycle of one worker claim: `running`, `completed`, `failed`, `revoking`, `reclaimed`, or `stopped`. | The settlement of the whole run. An attempt stop, failure, revocation, or reclamation is worker-local and does not by itself settle the run. |
| **Terminal outcome** (`RunOutcome`) | The durable operator-visible settlement of the complete run. | That the result was delivered, unless the outcome is `landed` and its immutable evidence is present. |
| **Current liveness** | Verified current controller-process evidence or a current attempt/session heartbeat showing useful execution. | A historical event, a stale heartbeat, a `state: active` projection, `desiredState: running`, or the existence of a durable controller record alone. |
| **Delivery evidence** | Immutable Git/GitHub evidence for what was delivered. | That a reviewed result has landed merely because it is `clean`. |

## Whole-run terminal outcomes

These are the seven current `RunOutcome` wire spellings:

- `clean` — protocol work is clean and ready for delivery.
- `blocked` — work cannot continue until a blocker is resolved.
- `input-required` — the run needs an explicit operator answer.
- `cancelled` — the operator cancelled the run without declaring the Bead complete.
- `accepted-risk` — the operator accepted a documented residual risk.
- `superseded` — a named successor run replaced this generation.
- `landed` — delivery landed and carries immutable PR and commit evidence.

`clean` is ready for delivery; it is not proof that delivery happened. Only
`landed` carries the immutable delivery PR and commit evidence that establishes
the landing. Inspect the recorded delivery fields rather than inferring them
from a queue group, attempt state, or controller state.

## Triage reads

Start with the read-only Operations Overview, scoped to the repository when
needed:

```sh
forged operations overview --repo <path>
```

Use it to see plan/readiness projections, desired controller facts, run and
attempt summaries, attention, `nextAction`, and delivery projections. Treat
controller records as durable history/authorization until liveness is
corroborated; verify current controller-process evidence or a current
attempt/session heartbeat before calling work live.

Then open the exact Work Detail for the subject:

```sh
forged work detail --id <id>
```

Work Detail is the next read for the run's state, terminal outcome, attempts,
heartbeats, controller evidence, and delivery fields. These reads explain the
state; they do not prescribe or perform mutation, recovery, claiming, or
delivery actions.
