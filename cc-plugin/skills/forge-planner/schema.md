# Schema — The Forge Spec Markdown Structure

Loaded by `forge-planner` before drafting. Defines what goes in a Forge spec body and how it's structured.

This is the layout you write into the **working draft file** the harness gave you. The file is the spec body — you don't wrap it in fenced blocks, and you don't add YAML frontmatter (Forge prepends it on save). Use `write` for the initial complete draft and `edit` for incremental refinements.

## The spec body, top to bottom

```markdown
# <Title>

## Goals

## Constraints

## Non-goals

## Approach

## Risks

## Open Questions

## Acceptance Criteria
```

That's seven structured sections plus the title. The Workbench document pane reads these headings directly and uses `Open Questions` for its counter.

## Section by section

### Title (mandatory)

Conventional-commit format, all lowercase, total length ≤ 70 chars:

```
<type>(<scope>): <imperative>
```

- `<type>` is one of `feat | fix | chore | docs | refactor | test | ci | style | perf | build`.
- `<scope>` is the area touched — a package name, top-level dir, or subsystem (`auth`, `launch`, `cc-plugin`).
- `<imperative>` is the change as the agent would describe it after doing it. Present tense, no trailing period.

Forge uses the H1 verbatim as the PR title, so it must already be in this format.

- ✅ `# feat(auth): add redis caching to user session lookup`
- ✅ `# fix(launch): unbreak unattended claude runs`
- ✅ `# chore(cc-plugin): rename forge-critic severity labels`
- ❌ `# Add Redis caching to user session lookup` (no prefix, capitalized)
- ❌ `# feat: caching` (no scope, too vague)
- ❌ `# I'd like to add some caching to user sessions` (sentence, not title)

The title is what shows up in the Forge dashboard and (Flow A) becomes the JIRA ticket summary. Make it scannable.

### Goals (mandatory)

Bullets describing the observable behavior and outcome. Include enough context that a human reviewer understands why the work exists, but keep this section action-oriented.

- ✅ "Session lookup P95 stays under 50ms by consulting a 30-second cache before the auth DB."
- ❌ "Improve auth." (too vague)

### Constraints (optional but usually present)

Hard requirements the implementation must respect: compatibility, performance bounds, public API stability, storage shape, security constraints, or repo conventions.

- ✅ "Do not change the public signature of `getUserSession(userId)`."
- ❌ "Use good patterns." (not a constraint)

### Non-goals (optional)

Explicitly out-of-scope work. Use this to stop the executing agent from expanding the task.

- ✅ "Do not migrate unrelated auth endpoints to the new cache."

### Approach (mandatory)

Specific guidance about how to implement when there is a meaningful choice or landmine. Mention files, helpers, and sequencing when relevant.

- ✅ "Reuse `src/auth/cache.ts:getCacheClient()` and add tests beside `tests/auth/session.test.ts`."
- ❌ "Figure out the best approach." (defers the decision)

### Risks (optional)

Known failure modes or review concerns the agent should watch while implementing.

- ✅ "Cache stampedes are possible if multiple misses for the same session arrive simultaneously."

### Open Questions (mandatory; can be empty)

Unresolved questions that block confidence. Use unchecked bullets (`- [ ] ...`) for open items. The Workbench open-question counter is driven by this section. If there are no open questions, write `- None`.

```markdown
## Open Questions

- [ ] Should cache entries be invalidated on explicit logout?
```

### Acceptance Criteria (mandatory)

Bullets. Each one is a verifiable check. A reviewer must be able to look at the PR and say "yes" or "no" for each item.

- File paths when relevant. Function names when relevant.
- Quote exact strings (errors, log messages) the implementation must produce.
- Cover edge cases, not just the happy path.
- Quality gates (typecheck, test, lint passing) belong here.

```markdown
## Acceptance Criteria

- `cacheUserSession(userId, sessionId, ttlSeconds)` exported from `src/auth/session.ts` with TypeScript signature `(string, string, number) => Promise<void>`
- Cache hit path returns the cached session without touching the DB; verified by mocking the DB client and asserting zero calls
- Cache miss falls back to DB, populates cache, returns the session
- Negative or zero `ttlSeconds` rejected with `ValidationError("ttlSeconds must be positive")` matching existing error class in `src/errors.ts`
- New tests in `tests/auth/session.test.ts` cover hit, miss, expiry, and validation paths
- `pnpm typecheck && pnpm lint && pnpm test --run` passes
```

Avoid: "X works", "tests pass", "code is clean" — these aren't checkable.

## Forbidden in the spec body

- **YAML frontmatter.** Forge prepends this. You start at `# Title`.
- **Fenced wrappers around the whole spec.** The file is the spec; no ```forge-spec or ```markdown wrapper.
- **Phrases that defer decisions.** "Decide on X", "choose between Y and Z", "if it makes sense, do W". Make the call. If you genuinely can't, ask the user before drafting, not in the spec.
- **References to this conversation.** "As we discussed..." — the agent didn't see the conversation.
- **Cross-task references.** Each spec stands alone.
- **Estimates or time guesses.** Forge tracks time itself; specs aren't where you put hours.

## How long should a spec be?

Long enough that an agent who's never seen the codebase could execute it without asking questions. For a small bug fix, that might be 30 lines. For a feature, 80–200 is normal. If you're past 300, the work is too big for one spec — split it.
