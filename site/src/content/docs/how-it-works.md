---
title: How it works
description: How Forge turns a durable specification into bounded implementation, checks, review, and a draft pull request.
---

Forge separates the conversation that shapes work from the durable machinery
that executes it. A lead agent records the intended outcome and decisions.
Detached controllers then drive coding agents through implementation, checks,
review, and bounded fixes.

The result is a reviewed draft PR or an explicit decision with evidence. The
human owns the default-branch merge.

## A specification survives the session

The work item is the specification. Its description, design, acceptance
criteria, and notes carry the contract, alongside repository identity and
dependencies. A changed specification creates a new revision; old decisions
remain part of its history.

The lifecycle follows that evidence:

```text
Draft → Critique → Adjudicate → Dispatch
                                ↓
                         Implement → Gate → Review
                                ↑             ↓
                                └── Bounded fixes
                                              ↓
                                     Draft PR or decision
```

Critique records independent findings. Adjudication records a disposition for
each finding and folds accepted changes into the specification. Readiness
also considers dependencies, ownership, and holds. The kernel derives these
stages from the current revision's evidence instead of relying on the lead
agent to remember the previous session.

## Each layer has a job

| Layer | Responsibility |
| --- | --- |
| Lead agent and plugin | Plan, critique, decide, and make the explicit execution handoff. |
| Work store | Specifications, revisions, dependencies, readiness, and ownership. |
| Forged controllers | Execution packages, provider attempts, gates, review, recovery, and outcomes. |
| Provider agents | Implement, inspect, review, or fix within the assigned stage's contract. |
| Herdr | Optional panes and process transport. |
| Git and GitHub | Commits, branches, pull requests, and merge truth. |

The CLI is named `forged`. Claude Code, Codex, and Pi can serve as lead-agent
hosts, and provider rosters choose the agents for individual execution roles.
A host conversation is not a second execution ledger.

## Gates and review serve different purposes

An implementation agent makes changes and commits them in a task worktree.
It runs the configured seat checks and repository-required checks. The
controller then runs the authoritative gate against a recorded code revision.
Independent read-only reviewers assess the result against the specification
and repository evidence.

If fixes are required, the selected profile bounds the remediation and review
rounds. A failed gate, an unresolved finding, a changed assumption, or an
exhausted budget can require a decision. Neither a green test suite nor a
review verdict proves the code is correct in every environment; both become
evidence for the final review.

## Rolling epics keep later work bounded

An epic declares children and dependencies before execution. Ready children
run through the slice protocol. Forge may integrate mechanically clean child
work into the epic's integration branch.

With rolling planning authorized, an assessment role reassesses predeclared,
unstarted work as earlier results arrive. It can refine that work within the
approved boundaries. A change to the outcome, scope, or authority stops for
input. Final integration assurance ends at one draft PR to the default branch.

## Durability makes reconnection practical

Runs, attempts, revisions, outcomes, and usage are recorded under the
operator's `ANVIL_HOME`, normally `~/.anvil`. Execution packages freeze the
selected profile, resolved roster, and policy. Changes to an active run use
explicit recorded revisions at supported stage boundaries.

Operations carry identities so a retried request can replay its recorded
result. Controller recovery checks process identity before reclaiming work.
A successor run preserves the source run's history and requires fresh checks
and review where the recovery contract calls for them.

This lets a new lead session reconnect with `next`, inspect one subject with
`explain`, take a typed action, and `wait` for a change. The host still needs
to remain awake and available for local execution.

## Local state, trusted agents

Forge requires no Forge-hosted service and adds no hooks or policy files to
target repositories. That does not make provider execution offline: your
configured agent CLIs and GitHub CLI communicate with their services.

Agents run headless with permission prompts disabled and your local user
privileges. Worktrees separate task checkouts; they are not a general security
boundary against a malicious repository or prompt. Only dispatch specifications
and code you trust, with the provider controls you require. The
[security model](https://github.com/tcashel/forge/blob/main/SECURITY.md)
describes these boundaries and private vulnerability reporting.

## Read the engineering references

- [The system as a tower](https://github.com/tcashel/forge/blob/main/docs/SYSTEM.md)
  maps state ownership and invariants.
- [The one lifecycle](https://github.com/tcashel/forge/blob/main/docs/LIFECYCLE.md)
  defines stage evidence and decisions.
- [Driving Forge](https://github.com/tcashel/forge/blob/main/docs/DRIVING.md)
  is the lead agent's operational runbook.
- [Execution environment](https://github.com/tcashel/forge/blob/main/docs/reference/execution-environment.md)
  specifies gate and child-process behavior.

Some engineering documents retain explicitly marked future design. Use the
[command reference](/forge/reference/commands/), your installed CLI's help, and
the generated operation manifest to check which operations are available.
