---
description: Take the plan you just produced and ship it to Forge.
---

You are shipping a plan to Forge. The user just produced, or has in mind, a plan they want a coding agent to execute end-to-end. Your job: turn that plan into a Forge spec, save it via the `forge` CLI, and after confirmation launch a run.

Use the `forge-planner` skill for the schema. If you need the companion files, read them from `{{FORGE_SKILLS_PATH}}/forge-planner/`.

Steps:

1. Compose the spec body. Reshape the plan content into the Forge schema: Title, Context, What We're Building, Acceptance Criteria, Implementation Notes, Quality Gates, For the Executing Agent. No YAML frontmatter; `forge spec save` adds it. Title argument: $1, use this if non-empty.

2. Save via the CLI. Pipe the body to `forge spec save - --json` via the Bash tool. If you already know the implementer agent/model the user wants, pass `--agent <claude|codex|opencode|gemini>` and `--model <model-id>` to pin them on the task. Capture `taskId`, `specPath`, `branch`, and `improve` from the JSON response.

3. Interpret `improve` before launch confirmation. If `improve === null`, print nothing extra. If `improve.mode === "applied"`, print `auto-improved - {improve.changeCount} changes applied. Run forge spec diff <id> to see what changed.` If `improve.mode === "no-op"`, print `no actionable findings - original spec saved.` If `improve.mode === "skipped"`, print `auto-improve skipped: {improve.error}`.

4. Pre-flight launch config. Run `forge config list --json` and parse `config`. Check whether `defaultAgent`, `defaultModel`, `reviewerAgent`, and `reviewerModel` are set unless the task already has agent/model pinned. If anything is missing, ask once for values and run `forge config set <key> <value>` for each. Recommended starting pair: implementer = `opencode` with the user's opencode model, reviewer = `claude` / `claude-opus-4-7`; they must differ on agent or model.

5. Confirm with a dry-run. Run `forge launch <taskId> --dry-run --json` and surface the resolved config: agent, model, reviewer, fixer, auto-fix. If dry-run prints a `MISSING_FLAGS` error, show the suggested `forge config set ...` commands and stop until they are resolved.

6. Surface the task. Print the taskId, specPath, branch, and dry-run summary. Ask whether to launch; do not launch unprompted.

7. If they confirm, launch. Run `forge launch <taskId> --json`, then `forge wait <taskId> --until done,failed,quality_failed --json`. Surface final status, PR URL if any, and any error.

If you ever hit a `MISSING_FLAGS` error mid-flow despite preflight, read the JSON envelope's `error.detail` array and run the suggested `forge config set` commands rather than asking the user to figure it out.
