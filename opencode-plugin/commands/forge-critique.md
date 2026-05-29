---
description: Run an adversarial critique on a Forge spec.
---

Use the bundled `forge-critic` and `forge-synthesizer` skills against a saved Forge spec.

Task argument: $1

Steps:

1. Resolve the task. If $1 is empty, run `forge spec ls --json` and ask which spec to critique. If $1 is set, run `forge ls --json` and find the unique match.

2. Show the user configured critique defaults from `forge config list --json`: `critiqueAgentA`, `critiqueModelA`, `critiqueAgentB`, `critiqueModelB`, `critiqueAgentSynth`, `critiqueModelSynth`. If any are unset, ask the user to set them via `forge config set` before running.

3. Confirm before launching. Critique spawns three agents in tmux and consumes tokens.

4. After confirmation, run `forge critique <id> --json`. Surface `critiqueId` and the recommendations file path.

5. The recommendations file is markdown. Summarize key recommendations inline or point to the file path.
