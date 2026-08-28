# Native specification lock checklist

Before making a work item ready, verify all of the following:

- A newly created id is caller-supplied and `ore-` prefixed; every existing or
  imported stored id is preserved verbatim.
- The title is a lowercase conventional-commit title of at most 70 characters.
- `description` explains current context and the concrete outcome.
- `design` fixes important decisions, seams, compatibility, and non-goals.
- `acceptanceCriteria` contains observable behaviors and exact quality gates.
- `notes` contains the instructions the agent needs and no unresolved checkbox.
- `metadata.repository` is the canonical absolute target root.
- The specification is fully native; no sidecar file is required to execute it.
- Every cited file, symbol, command, and repository convention was verified.
- Scope is one coherent PR, or the epic cut is justified by real seams.
- `parent-child` edges express epic membership; `blocks` edges express only
  real ordering between children.
- Downstream stubs remain blocked until assumptions are reconciled with merged
  reality.
- The target repository received no planning artifact or work-store setup.
- A fresh agent with only the work item and checkout can implement and validate
  the work without asking a product or architecture question.

After writing, read the record back with `forged work show --id`, inspect all
fields and metadata, and confirm actual readiness through `forged work ready`.
