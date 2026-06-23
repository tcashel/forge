---
name: Bug report
about: Something isn't working as expected
title: ""
labels: bug
assignees: ""
---

## What happened

A clear description of the bug.

## What you expected

What you expected to happen instead.

## Steps to reproduce

1. `forge …`
2. …

If relevant, paste the failing command and its `--json` output (the error
envelope: `{ "ok": false, "error": { "code": …, "message": …, "hint": … } }`).

## Environment

- Forge version: <!-- `forge --version` -->
- OS: <!-- e.g. macOS 15.5 -->
- Bun version: <!-- `bun --version` -->
- Agent CLI(s) involved: <!-- claude / codex / opencode / gemini + version -->

## Logs / context

Relevant lines from `~/.forge/runs/<task-id>/agent.log`, screenshots, or
anything else that helps. Please redact secrets and private paths.
