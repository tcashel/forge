# Self-Check — Run Before Each Edit/Write to the Draft

Loaded by `forge-planner` and run mentally before each `edit` or `write` call against the draft file. The user trusts you to filter the obvious failures — they shouldn't have to point them out.

## The checks

### Did you actually research?

- [ ] Every file path I cite, I opened with `read`.
- [ ] Every error string, I copied from the actual file (not paraphrased).
- [ ] The build/test/lint commands match what's in the repo, not what's in my training data.
- [ ] If anything was ambiguous, I asked the user before drafting.

### Is the title good?

- [ ] Matches `<type>(<scope>): <imperative>` format, all lowercase, ≤ 70 chars.
- [ ] `<type>` is one of feat, fix, chore, docs, refactor, test, ci, style, perf, build.
- [ ] `<scope>` names the area touched (package, dir, subsystem) — not generic.
- [ ] Imperative reads as a description of what the merged PR did.
- [ ] Not `feat: caching` or `fix: bug` — specific enough to be searchable later.

### Is `Context` doing its job?

- [ ] 2–4 sentences.
- [ ] Says *why*, not *what*.
- [ ] References the JIRA ticket if Flow B.
- [ ] Doesn't bleed into "What We're Building" (those are different sections).

### Is `What We're Building` observable?

- [ ] Describes behavior change visible from the caller / user perspective.
- [ ] Quotes function signatures, exported names, exact behaviors.
- [ ] Doesn't dive into implementation strategy.

### Are the Acceptance Criteria verifiable?

- [ ] Every bullet can be checked by a test, command, or visual inspection of the PR.
- [ ] No vague items ("X works correctly").
- [ ] Edge cases included (empty input, validation failure, error path).
- [ ] Quality-gate criteria included if applicable (`typecheck && lint && test --run`).
- [ ] File paths and exact strings appear when relevant.

### Are Implementation Notes load-bearing?

If the section is present:

- [ ] Each note tells the agent something they couldn't infer from research.
- [ ] No restating of acceptance criteria.
- [ ] No generic advice.

If you can't fill this section with something useful, **delete the section.** Empty sections are noise.

### Is `For the Executing Agent` operational?

- [ ] Under 150 words.
- [ ] Sequences the tasks if there's a meaningful order.
- [ ] Names patterns to match (`like src/foo.ts:greet()`).
- [ ] Names landmines (signatures to preserve, deps not to add).
- [ ] Does not duplicate acceptance criteria.

### Is the spec self-contained?

The single most important check. Imagine an agent who has never seen this conversation, the JIRA ticket, the user's clarifying answers, or your research notes. They have only the spec body and a fresh worktree of the repo.

- [ ] They know which files to change.
- [ ] They know what behavior to produce, including exact strings.
- [ ] They know which existing helpers/utilities to call (named with location).
- [ ] They know what tests to add and where.
- [ ] They know what command to run to verify they're done.
- [ ] They know which decisions are theirs (none, ideally) vs. already made (most).

If any of these is unclear, fix the spec before output.

### Format

- [ ] No YAML frontmatter in the draft (Forge prepends it on save).
- [ ] No fenced wrapper around the whole spec.
- [ ] Starts with `# Title`.
- [ ] Markdown is well-formed (headings hierarchical, lists consistent, code blocks closed).

## When a check fails

Don't output the spec yet. Common fixes:

| Failed check | Fix |
|---|---|
| Vague acceptance criterion | Quote a file path, function name, or exact string from research |
| Decision deferred | Make the call, write it in. If you can't, ask the user before output |
| Missing exact error string | Open the test that asserts it, copy verbatim |
| Cited a file you didn't open | Open it with `read` before the next output |
| Implementation Notes is generic | Either fill with repo-specific guidance or delete the section |
| Spec depends on chat context | Inline the context into the spec |

## When to ask the user instead of drafting

A short clarifying question is much cheaper than a wrong spec. Ask when:

- The user's idea has multiple plausible interpretations.
- A behavioral contract is ambiguous in the existing code (e.g., two tests assert different behavior).
- The scope is too big for one spec — propose splitting and let the user pick.
- A decision is the user's to make (product trade-off, breaking change, security policy, naming).

Don't ask when:

- You can find the answer with a `read` or `rg` call. Just go look.
- The question is "should I include tests?". Yes, always.
- The question is rhetorical. Don't theater.
