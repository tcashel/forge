---
name: board
description: "Deliberately open the Forged control plane: call operations_overview, render the Operations view where the host can, and answer with a one-line portfolio state summary that keeps every degradation fact. Use when the operator asks for the board or invokes /forged:board."
---

# /forged:board

Open the control plane on purpose. This is the plugin's front door to the
bounded operator portfolio: one read, one optional view, one honest line.
The skill is read-only — it never mutates, never dispatches, and never turns
visible App state into a mutation selector. Apps are views; for any control,
follow `../manage-work/SKILL.md`.

## With native Forge tools in the session

Call `operations_overview` in an MCP host or Pi's direct `forged_overview`
tool once, unscoped unless the operator named a repository or group. The
authoritative response schema is
`forged.operations-overview/1` and its App resource is
`ui://forged/operations-overview.html`. In an App-capable host, render that
view. In Pi, `/forge` opens the native terminal cockpit over the same
Operations, history, and provider-session projections. Views stay optional
projections over the same data — the structured response, not rendered UI, is
what the answer reads.

Answer with one line summarizing portfolio state: the Needs me, Ready to
merge, Running, Stalled or recoverable, and Planned group counts plus
attention items. Degradation facts belong in that line, never dropped: a
degraded or missing source, stale capture time, incomplete coverage or
truncation, and unknown spend are stated exactly as the response reports
them. A missing cost is unknown, never zero.

Do not refresh by mutation, poll, drill into every row, or open several
views. One read answers the question; a follow-up question gets its own read.

## Without forged server tools

The host silently skips the server registration when the operator-installed
binary is missing, so absent forged tools are ordinary evidence, not an error
to hide. Degrade explicitly to the CLI, which remains the primary read path:

```bash
forged operations overview
```

Preserve any scope the operator named: a repository carries through as
`--repo <canonical path>` and a group as `--group <code>` — the fallback
answers the same question, never a wider one.

Report the same one-line summary from its JSON output, and say that the
session has no forged server tools. If the CLI is also missing, state that
and point the operator at `/forged:setup` — never fail silently, and never
install anything from here.
