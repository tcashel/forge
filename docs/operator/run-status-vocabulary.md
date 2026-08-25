# Durable run status vocabulary

Use these layers separately when triaging Forged work. A value in one layer
does not substitute for evidence in another.

| Layer | What it answers | What it proves | What it does not prove |
| --- | --- | --- | --- |
| Beads plan/readiness | Should this work be selected or is it ready to run? | The plan, dependencies, and readiness projection as observed from Beads. | That a durable run exists, a controller is present, or a worker is live. |
| Desired controller state | What has the operator authorized the supervisor to do? | `running` authorizes a controller, `paused` retains authorization without starting one, and `stopped` authorizes no new controller. | Current process liveness. Durable `running` authorization is not a heartbeat. |
| Durable run state (`RunState`) | Is the whole run still able to accept work? | `active` means the run accepts work; `stopped` means it was stopped with a reason. | That an active run currently has a worker, or that a stopped run has a terminal outcome when that field is absent. |
| Worker attempt state (`AttemptState`) | What happened to one worker claim? | `running`, `completed`, `failed`, `revoking`, `reclaimed`, or `stopped` for that attempt. | The settlement of the whole run. An attempt stop, failure, revocation, or reclamation is worker-local and does not by itself settle the run. |
| Terminal outcome (`RunOutcome`) | Why did the complete run stop? | The operator-visible settlement of the whole run. | Current liveness or delivery, except where the outcome's delivery evidence is also present. |
| Current liveness | Is useful execution occurring now? | Current controller or attempt evidence, such as a current controller record or live attempt evidence corroborated by the read surface. | A plan row, desired `running`, or a historical event by itself. `active` alone is not liveness evidence. |
| Delivery evidence | Is the result immutably delivered? | The immutable PR and commit evidence recorded for a landed run. | That clean work has already landed. |

## Whole-run outcomes

These are the seven current `RunOutcome` wire spellings:

- `clean` — protocol work is clean and ready for delivery.
- `blocked` — work cannot continue until a blocker is resolved.
- `input-required` — the run needs an explicit operator answer.
- `cancelled` — the operator cancelled the run without declaring the Bead complete.
- `accepted-risk` — the operator accepted a documented residual risk.
- `superseded` — a named successor run replaced this generation.
- `landed` — delivery landed and carries immutable PR and commit evidence.

`clean` means ready for delivery; it is not proof that delivery happened. Only
`landed`, together with its immutable delivery PR and commit evidence, proves
that delivery landed. `blocked`, `input-required`, and other terminal outcomes
describe the whole-run settlement, not the state of any one worker.

## Reading a portfolio

Start with the bounded, read-only Operations Overview:

```sh
forged operations overview --repo <path>
```

Use its plan/readiness, desired-state, run-state, outcome, and running groups
to find the subject and its next direct read. Then inspect the exact durable
subject:

```sh
forged work detail --id <id>
```

For a live claim, corroborate the detail with current controller or attempt
evidence. Treat `active`, desired `running`, and old progress events as
insufficient on their own. Read `nextAction` as the projected next protocol
step, not as a liveness signal or a delivery claim. These commands only read
Forged projections; this guide does not prescribe mutation or recovery
commands.
