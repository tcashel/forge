---
name: forge-planner
description: "Activates when the user wants to turn an idea or a plan-mode plan into a Forge task spec — research the repo, draft in the Forge schema, then persist via `forge spec save`. Use when the user says they want to run something with Forge, when they've just produced a plan they want to ship to a coding agent, or when they explicitly invoke /forge-ship-plan."
---

# Forge Planner

You're being asked to convert an idea (or a plan the user just produced in plan mode) into a Forge spec — the artifact the user will hand to a coding agent running in a fresh git worktree under tmux.

## What Forge does with your output

Forge is a CLI that orchestrates one-shot agent runs. The lifecycle:

1. `forge spec save -` reads the body you produce on stdin, prepends YAML frontmatter, and writes it to `~/.forge/specs/<task-id>.md`. It returns a JSON object with the new task id.
2. `forge launch <task-id>` creates a worktree, kicks off the chosen agent (claude or codex) in tmux, runs quality gates, opens a draft PR, and finally runs a reviewer agent against the diff.
3. The launched agent sees **only the spec body**. It does not see this conversation, your research notes, the user's environment — anything the agent needs has to be in the spec.

So a vague spec produces a confused agent. The whole point of this skill is to make the spec sharp before launch.

## When you're invoked

There are two common paths:

- **Plan-mode handoff.** The user produced a plan in Claude Code's plan mode and exited plan mode. They now want to ship that plan to Forge. You take the plan content (from this conversation) and reshape it into the Forge schema before saving.
- **Idea handoff.** The user typed something like "run X with forge" or "use forge to build Y". You don't have a plan yet — research the repo first, then draft.

In either case the user expects a finished spec saved to disk and (usually) a launched run.

## Workflow

You progress through three short phases. Each has a companion file you load via `read` when you reach it. Don't load them all up front — pull them in as you need them.

### Phase 1 — Research (skip if a plan-mode plan already covers this)

Read `research.md` before exploring. Use `read`, `grep`, `find`, and `bash` for safe inspection commands (`git status`, `git log`, `cat package.json`, etc.) to understand the stack, the surrounding code, and any open questions.

If the user already produced a plan-mode plan that names files and is concrete enough to act on, you can skip straight to Phase 2 — the research is done.

### Phase 2 — Draft

Read `schema.md`. It defines the section structure (Goal, Context, Tasks, Acceptance Criteria, Quality Gates, etc.) and what good vs. bad content looks like in each. Compose the spec body in your reply (no frontmatter — Forge adds that). Aim for under 200 lines unless the change is genuinely large.

### Phase 3 — Save (and optionally launch)

Run the self-check from `checklist.md`. Then save and (if the user wants it) launch:

```bash
# Save the spec via stdin. Capture taskId from the JSON response.
echo "<full spec body>" | forge spec save - --json

# Optional: launch immediately. Implementer + reviewer come from
# repo-config.json (forge config set) or explicit flags.
forge launch <task-id> --json

# Optional but recommended after launch — block until the run is done
# so you can report the outcome in the same turn.
forge wait <task-id> --until done,failed,quality_failed --json
```

Use the Bash tool for these. After `forge spec save`, surface the
returned `taskId`, `specPath`, and `branch` to the user. Ask whether
they want to launch before running `forge launch` — launches are not
free.

## Companion files

These live alongside this `SKILL.md` in the plugin's `skills/forge-planner/` directory. The plugin loader will tell you the directory; load each file with `read` only when you reach the relevant phase:

- `research.md` — how to explore a repo before drafting
- `schema.md` — the spec markdown structure, section by section
- `checklist.md` — self-review questions to run before saving

## Things to avoid

- **Drafting on turn 1 without research** unless plan mode already did the research for you. Even then, glance at the named files to confirm they exist and the diff target is what the plan assumed.
- **Adding YAML frontmatter to your draft.** Forge's `spec save` adds it. Start at `# Title`.
- **Saving silently.** Surface the `taskId` and ask before launching. The user might want to critique the spec first (`forge critique <id>`) before committing tokens to a launch.
- **Citing a file you didn't open.** If the spec mentions `src/foo.ts:42`, `read` it first.
- **Asking the agent to decide.** "Decide on retention strategy" is a bug, not an acceptance criterion. Make the call in the spec — the launched agent has less context than you do.
- **Marking a spec as ready when criteria are vague.** "Tests pass" and "code is clean" are not acceptance criteria. The reviewer skill will reject them.
