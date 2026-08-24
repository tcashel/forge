# Forge for Pi

This extension is the native Pi adapter over the independently installed
`forged` binary. It does not use MCP, install software, or own durable state.
Every tool executes a closed argv vector and reads Forged's standard JSON
operation envelope.

## Cockpit

Run `/forge` to open the terminal cockpit.

| Key | Action |
| --- | --- |
| `1`–`4`, `Tab` | Work, attention, usage, and agent views |
| `←`/`→`, `h`/`l` | Change queue group |
| `↑`/`↓`, `j`/`k` | Move selection |
| `Enter`, `d` | Load exact durable Work Detail |
| `r` | Refresh all bounded projections |
| `q`, `Esc` | Close |

The display is inspired by btop's dense operational hierarchy and cliamp's
keyboard-first terminal ergonomics: health and urgent counts stay visible,
work is grouped before it is listed, selected rows have a compact inspector,
usage is rendered as provider sparklines, and provider attempts form a fleet
view. It derives no status of its own.

Pass an exact repository path to scope the Operations view:

```text
/forge /absolute/path/to/repository
```

## Tools

- `forged_overview`
- `forged_detail`
- `forged_history`
- `forged_sessions`
- `forged_submit`
- `forged_control`
- `forged_attention`
- `forged_critic`

`forged_submit` composes exactly one start and one submit after the shared
skills obtain explicit approval. `forged_control` and `forged_attention` expose
only existing-work transitions. The critic launches an isolated read-only Pi
process with the one shared `plugins/forged/agents/critic.md` prompt.

Set `FORGED_BIN` to an explicit binary path when `forged` is not on `PATH`.
Set `PI_BIN` only when critic delegation should use a non-default Pi binary.
