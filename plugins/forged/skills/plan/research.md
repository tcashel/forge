# Repository research

Research only enough to make the ledger-native ore executable and falsifiable.

1. Resolve the canonical repository root and inspect `git status` before
   doing anything else. Existing changes belong to the operator.
2. Read repository instructions, manifests, architecture records, and the code
   directly adjacent to the requested behavior.
3. Identify the narrowest coherent review boundary, existing extension seams,
   and the tests or validation commands the repository actually uses.
4. Verify named files and symbols. Do not cite paths or line numbers you did
   not inspect.
5. Record assumptions that affect scope, compatibility, security, data, or
   rollout. Resolve them with the operator or make them blocking questions.
6. For an existing work item, use `forged work show --id` to verify its
   current native fields, revision, repository, links, and relevant PR state.
   Preserve valid history and dependencies.

Read-only discovery does not authorize dependency installation, generated file
updates, network writes, work-item mutation, or repository cleanup. Planning
writes only the Forged ledger after direction is settled.

Stop researching once the specification can tell a fresh implementation agent
what to change, what not to change, and how completion will be verified.
