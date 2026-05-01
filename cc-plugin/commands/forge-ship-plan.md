---
description: Take the plan you just produced and ship it to forge — saves a spec and (after confirming) launches a background agent run.
argument-hint: [optional: title override]
---

You are shipping a plan to Forge. The user just produced (or has in mind) a plan they want a coding agent to execute end-to-end. Your job: turn that plan into a Forge spec, save it via the `forge` CLI, and (after they confirm) launch a run.

Use the **forge-planner** skill for the schema. Pull in `skills/forge-planner/SKILL.md` plus its companion files (`schema.md`, `checklist.md`) before composing the spec body.

Steps:
1. **Compose the spec body.** Reshape the plan content into the Forge schema (Title / Goal / Context / Tasks / Acceptance Criteria / Quality Gates). No YAML frontmatter — `forge spec save` adds it. Title argument: $1 (use this if non-empty).
2. **Save via the CLI.** Pipe the body to `forge spec save - --json` via the Bash tool. Capture `taskId`, `specPath`, `branch` from the JSON response.
3. **Surface to the user.** Print the taskId, specPath, and branch. Ask whether to launch — do not launch unprompted.
4. **If they confirm, launch.** Run `forge launch <taskId> --json` (defaults come from `forge config`). Then run `forge wait <taskId> --until done,failed,quality_failed --json` so you can report the outcome in the same turn. Surface the final status, PR URL (if any), and any error.

If the launch's defaults aren't configured (`MISSING_REVIEWER_MODEL` etc.), fall back to running `forge config list --json` to show the user what's missing, and suggest the `forge config set` commands to fix it.
