---
name: board
description: "Deliberately open the Forged control plane: call operations_overview, render the Operations view where the host can, and answer with a one-line portfolio state summary that keeps every degradation fact. Use when the operator asks for the board or invokes /forged:board."
---

# /forged:board

Position: any ledger/run lifecycle state -> one read-only portfolio snapshot.
Next: inspect or control an exact subject through `../manage-work/SKILL.md`.

Boundary: the lead session requests and interprets one projection. Forged owns
the ledger, run/controller evidence, and execution state; this skill never
mutates a work item, dispatches work, or turns App state into authority.

## With native Forge tools in the session

Call `operations_overview` in an MCP host or Pi's direct `forged_overview` tool
once, unscoped unless the operator named a repository or group. The
authoritative response schema is `forged.operations-overview/1` and its App
resource is `ui://forged/operations-overview.html`. In an App-capable host,
render that view. In Pi, `/forge` opens the native terminal cockpit over the
same Operations, history, and provider-session projections. Views are optional
projections; the structured response is what the answer reads.

Answer with one line summarizing Needs me, Ready to merge, Running, Stalled or
recoverable, and Planned group counts plus attention items. Keep every
degradation fact: degraded or missing sources, stale capture time, incomplete
coverage or truncation, and unknown spend. Missing cost is unknown, never zero.

Do not refresh by mutation, poll, drill into every row, or open several views.
One read answers the question; a follow-up gets its own read.

## Without forged server tools

The host silently skips server registration when the operator-installed binary
is missing, so absent tools are evidence to report. Degrade to the CLI:

```bash
forged operations overview
```

Preserve operator scope: a repository carries through as `--repo <canonical
path>` and a group as `--group <code>`. Report the same one-line summary from
the JSON output and say the session has no server tools. If the CLI is also
missing, state that and point the operator at `/forged:setup`; never fail silently
and never install anything from here.

## Never

- Do not mutate, dispatch, poll, or broaden the requested scope.
- Do not use a rendered card as a mutation selector.
- Do not conceal source degradation or treat missing spend as zero.
