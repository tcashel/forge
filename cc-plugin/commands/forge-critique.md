---
description: Run an adversarial critique on a forge spec — two critics + a synthesizer produce ranked recommendations.
argument-hint: <task-id>
---

Use the bundled forge-critic and forge-synthesizer skills against a saved Forge spec.

Steps:
1. Resolve the task. If $1 is empty, run `forge spec ls --json` and ask which spec to critique. If $1 is set, run `forge ls --json` and find the unique match.
2. Show the user the configured critique defaults: `forge config list --json` — surface `critiqueAgentA`, `critiqueModelA`, `critiqueAgentB`, `critiqueModelB`, `critiqueAgentSynth`, `critiqueModelSynth`. If any are unset, ask the user to set them via `forge config set` before running.
3. Confirm before launching — critique runs spawn three agents in tmux and consume tokens.
4. Run `forge critique <id> --json`. Surface `critiqueId` and the recommendations file path.
5. Tail the synthesizer's output once it finishes (`forge wait <id> --until done` is the right primitive once critique has wait semantics; for v0.4 the user may need to poll manually with `forge status`).

The recommendations file is markdown — open it in the user's editor or summarise key recommendations inline.
