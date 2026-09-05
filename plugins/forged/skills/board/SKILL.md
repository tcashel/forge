---
name: board
description: "Deliberately open the Forged control plane: call operations_overview, render the Operations view where the host can, and answer with a one-line portfolio state summary that keeps every degradation fact. Use when the operator asks for the board or invokes /forged:board."
---

# /forged:board

Position: `forged next --repo "$TARGET_REPO"` reports the repository lifecycle queues.
Next: `forged explain --id "$SUBJECT_ID"` resolves any exact subject selected later.

Boundary: the lead requests and interprets one read-only projection. Views are
optional renderings, never state, authority, or mutation selectors.

## Open once

With native Forge tools, call `operations_overview` once, unscoped unless the
operator named a repository or group. Its authoritative schema is
`forged.operations-overview/1`; an App-capable host renders
`ui://forged/operations-overview.html`. Pi may use its direct
`forged_overview` tool or `/forge` terminal cockpit.

Answer in one line with Needs me, Ready to merge, Running, Stalled or
recoverable, and Planned counts plus attention. Preserve every degraded or
missing source, capture time, incomplete coverage or truncation, and unknown
spend. Missing cost is unknown, never zero.

Do not refresh by mutation, poll, or drill into every row. A follow-up gets a
fresh exact read.

## CLI fallback

If server tools are absent, state that fact and use one matching read:

```bash
forged operations overview --repo "$TARGET_REPO"
forged next --repo "$TARGET_REPO"
```

Omit `--repo` only when the operator requested the whole portfolio; a named
group uses `--group <code>`. If the CLI is absent, say so and point to
`/forged:setup`; never fail silently or install anything here.

## Never

- Do not mutate, dispatch, poll, or broaden scope.
- Do not use a rendered card or human title as a mutation selector.
- Do not conceal degradation or treat missing spend as zero.
