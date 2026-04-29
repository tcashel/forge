# forge

Mission control for agentic coding workflows — spec, launch, track, review, PR.

A [pi](https://github.com/badlogic/pi) extension that bundles tools and skills
for running spec-driven coding workflows end-to-end.

## What's inside

- **`index.ts`** — extension entry point, registers tools and slash commands
- **`spec-mode.ts`** — spec-driven authoring workflow
- **`launch.ts`** — launching agent runs
- **`dashboard.ts`** — status / mission control view
- **`jira.ts`** — Jira integration
- **`repo.ts`** — repo introspection helpers
- **`store.ts`** — local state persistence
- **`skills/forge-planner/`** — planner skill (spec → checklist → research)
- **`skills/forge-reviewer/`** — reviewer skill (severity + scoring rubrics)

## Install

Clone into your pi extensions directory:

```bash
git clone git@github.com:tcashel/forge.git ~/.pi/agent/extensions/forge
```

Pi will pick up the extension on next launch via the `pi` block in
`package.json`:

```json
{
  "pi": {
    "extensions": ["./index.ts"],
    "skills": ["./skills"]
  }
}
```

## Development

Edit files in place under `~/.pi/agent/extensions/forge/`. Pi reloads
extensions on agent restart.

## License

TBD
