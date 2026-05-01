---
description: Take the plan you just produced and ship it to forge — saves a spec and (after confirming) launches a background agent run.
argument-hint: [optional: title override]
---

You are shipping a plan to Forge. The user just produced (or has in mind) a plan they want a coding agent to execute end-to-end. Your job: turn that plan into a Forge spec, save it via the `forge` CLI, and (after they confirm) launch a run.

Use the **forge-planner** skill for the schema. Pull in `skills/forge-planner/SKILL.md` plus its companion files (`schema.md`, `checklist.md`) before composing the spec body.

Steps:

1. **Compose the spec body.** Reshape the plan content into the Forge schema (Title / Goal / Context / Tasks / Acceptance Criteria / Quality Gates). No YAML frontmatter — `forge spec save` adds it. Title argument: $1 (use this if non-empty).

2. **Save via the CLI.** Pipe the body to `forge spec save - --json` via the Bash tool. If you already know the implementer agent/model the user wants, pass `--agent <claude|codex>` and `--model <model-id>` to pin them on the task. Capture `taskId`, `specPath`, `branch` from the JSON response.

3. **Pre-flight the launch config.** Before asking the user whether to launch, run `forge config list --json` and parse the `config` object. Check whether these are set:
   - `defaultAgent` (or the task already has `--agent` pinned in step 2)
   - `defaultModel` (or the task already has `--model` pinned)
   - `reviewerAgent`
   - `reviewerModel`

   If anything in that list is missing, ask the user **once** for the values they want and run `forge config set <key> <value>` for each. Recommended starting pair: implementer = `codex` / `gpt-5-codex`, reviewer = `claude` / `claude-opus-4-7` (they must differ on agent or model).

4. **Confirm with a dry-run.** Run `forge launch <taskId> --dry-run --json` and surface the resolved config (agent, model, reviewer, fixer, auto-fix). This is a safety net — if anything is still missing or the implementer/reviewer pair collides, the dry-run prints a single `MISSING_FLAGS` error with the exact `forge config set ...` commands to fix it. Show those to the user and stop until they're resolved.

5. **Surface to the user.** Print the taskId, specPath, branch, and the dry-run summary. Ask whether to launch — do not launch unprompted.

6. **If they confirm, launch.** Run `forge launch <taskId> --json` (no flags needed once defaults exist). Then run `forge wait <taskId> --until done,failed,quality_failed --json` so you can report the outcome in the same turn. Surface the final status, PR URL (if any), and any error.

If you ever hit a `MISSING_FLAGS` error mid-flow despite the preflight, the JSON envelope's `error.detail` is a structured array of `{flag, message, hint}` objects — read it and run the suggested `forge config set` commands rather than asking the user to figure it out.
