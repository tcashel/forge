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
