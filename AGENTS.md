## Cursor Cloud specific instructions

### Runtime & Package Manager

- **Bun** is the sole runtime — no Node.js required. Ensure `~/.bun/bin` is on `PATH`.
- Lockfile is `bun.lock` (text format). Use `bun install --frozen-lockfile` in CI; `bun install` locally.

### Quick Reference (commands)

| Task | Command |
|------|---------|
| Install deps | `bun install` |
| Lint | `bun run lint` (biome check .) |
| Auto-fix lint | `bun run check` (biome check --write .) |
| Tests | `bun test` |
| Web UI (Workbench) | `bun ./bin/forge.ts serve --port 7456` |
| TUI dashboard | `bun ./bin/forge.ts dash` |
| CLI help | `bun ./bin/forge.ts --help` |

### State Directory

Forge keeps state in `~/.forge/`. If starting fresh, initialize with:

```bash
mkdir -p ~/.forge/{specs,runs,critiques}
echo '{"version":1,"repos":{}}' > ~/.forge/repo-config.json
```

The `index.json` file is auto-created on first spec save.

### Non-obvious Caveats

- `forge spec save` will error if `~/.forge/repo-config.json` doesn't have the `{"version":1,"repos":{}}` structure. The update script does not create this — initialize it manually if needed.
- The `IMPROVE_FAILED` warning on spec save is normal without an AI agent configured — the auto-critique step is optional and non-blocking.
- `forge launch` requires `tmux`, `git`, and an AI agent binary (`claude`/`codex`) on PATH. Without these, spec creation and the web UI still work fine.
- The Workbench bundles its frontend on-the-fly via `Bun.build()` at startup — no separate build step needed.
- Lint produces warnings (style suggestions) but exits 0; these do not block CI.

### Agent CLIs (installed globally via npm)

Forge orchestrates AI agents as subprocesses. Three CLIs are installed in this environment:

| Binary | Package | Used for |
|--------|---------|----------|
| `claude` | `@anthropic-ai/claude-code` | Planner chat, launch, critique, review |
| `codex` | `@openai/codex` | Launch (implementer/reviewer) |
| `opencode` | `opencode-ai` | Launch (implementer) |

### Required API Keys (environment secrets)

Forge passes `process.env` to all agent subprocesses. The CLIs need:

| Secret | Required by | Notes |
|--------|------------|-------|
| `ANTHROPIC_API_KEY` | `claude` CLI | Required for planner chat, Claude-based launch/critique |
| `OPENAI_API_KEY` | `codex` CLI | Required for Codex-based launch/review |

Add these as Cursor Cloud secrets. Without them, the planner chat returns "Not logged in" and Codex returns 401.

### Planner Chat Verification

To verify the planner chat subprocess works end-to-end:
1. Start the Workbench: `bun ./bin/forge.ts serve --port 7456`
2. Create a draft: `curl -X POST http://127.0.0.1:7456/api/plan-chat/draft -H "Content-Type: application/json" -d '{"repoRoot":"/workspace"}'`
3. Send a message: `curl -N -X POST http://127.0.0.1:7456/api/plan-chat/draft/<draftId>/message -H "Content-Type: application/json" -d '{"message":"hello"}'`

The SSE stream should show `event: meta` → `event: text` → `event: done` when `ANTHROPIC_API_KEY` is set.

### Agent Launch Subprocess Mechanism

`forge launch` does **not** spawn agents from Node directly. The flow is:
1. Writes prompt + runner script to `~/.forge/runs/<taskId>/`
2. Creates a **detached tmux session** that executes the bash runner
3. Runner invokes the agent CLI with the prompt file via stdin/cat

This means `tmux` must be available (it is in this env) and the agent binary must be on PATH.

# CI diagnostic marker: 20260522180624
