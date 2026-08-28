# Native specification lock checklist

Before reporting an ore ready, verify all of the following:

- The id is caller-minted, stable, unused, and `ore-` prefixed.
- The title is a lowercase conventional-commit title of at most 70 characters.
- `description` explains current context and the concrete outcome.
- `design` fixes important decisions, seams, compatibility, and non-goals.
- `acceptance_criteria` contains observable behaviors and exact quality gates.
- `notes` contains the instructions the agent needs and no unresolved
  checkbox.
- `metadata.repository` is the canonical absolute target root.
- The specification is fully native; no sidecar file is required to execute it.
- Every cited file, symbol, command, and repository convention was verified.
- Scope is one coherent PR, or the epic cut is justified by real seams.
- `parent-child` links express epic membership; `blocks` links express only
  real ordering between children.
- Downstream stubs remain blocked until assumptions are reconciled with merged
  reality.
- The target repository received no planning artifact or work-store
  initialization.
- A fresh agent with only the stored ore and checkout can implement and
  validate the work without asking a product or architecture question.

After writing, read the ore back with `forged work show --id "$ORE_ID"`,
inspect all fields, metadata, revision, and links, then confirm actual readiness
through `forged work ready`.
