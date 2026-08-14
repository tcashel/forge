# Native specification lock checklist

Before making a Bead ready, verify all of the following:

- The title is a lowercase conventional-commit title of at most 70 characters.
- `description` explains current context and the concrete outcome.
- `design` fixes important decisions, seams, compatibility, and non-goals.
- `acceptance_criteria` contains observable behaviors and exact quality gates.
- `notes` contains the instructions the agent needs and no unresolved checkbox.
- `metadata.repository` is the canonical absolute target root.
- The specification is fully native; no sidecar file is required to execute it.
- Every cited file, symbol, command, and repository convention was verified.
- Scope is one coherent PR, or the epic cut is justified by real seams.
- Native parent links express epic membership; dependency edges express only
  real ordering between children.
- Downstream stubs remain blocked until assumptions are reconciled with merged
  reality.
- The target repository received no planning artifact or Beads initialization.
- A fresh agent with only the Bead and checkout can implement and validate the
  work without asking a product or architecture question.

After writing, read the Bead back with `bd show --long --json`, inspect all
fields and metadata, and confirm its actual readiness through `bd ready`.
