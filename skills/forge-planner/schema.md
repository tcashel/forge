# Schema — The Forge Spec Markdown Structure

Loaded by `forge-planner` before drafting. Defines what goes in a Forge spec body and how it's structured.

This is the layout you write into the **working draft file** the harness gave you. The file is the spec body — you don't wrap it in fenced blocks, and you don't add YAML frontmatter (Forge prepends it on save). Use `write` for the initial complete draft and `edit` for incremental refinements.

## The spec body, top to bottom

```markdown
# <Title>

## Context

## What We're Building

## Acceptance Criteria

## Implementation Notes

## Quality Gates

## For the Executing Agent
```

That's seven sections plus the title. Some are mandatory, some optional — call below.

## Section by section

### Title (mandatory)

Imperative, present tense, 5–12 words. Describes the change as the agent would describe it after doing it.

- ✅ `# Make rate-limit bucket size configurable via env var`
- ✅ `# Add Redis caching to user session lookup`
- ❌ `# Caching` (too short, too vague)
- ❌ `# I'd like to add some caching to user sessions because they're slow` (sentence, not title)

The title is what shows up in the Forge dashboard and (Flow A) becomes the JIRA ticket summary. Make it scannable.

### Context (mandatory)

2–4 sentences. Why the work exists. Mention the user-visible problem or the technical motivation. Reference the JIRA ticket if Flow B.

This section serves the **human** reader (the engineer reviewing the spec, the JIRA reader if the spec becomes a ticket description). It does not serve the executing agent — the agent acts on goals, not motivations.

- ✅ "User session lookups currently hit the auth DB on every request. P95 is 80ms and growing with traffic. Adding a 30-second cache on session ID will keep us under the 50ms SLO without changing auth semantics."
- ❌ "Need to add caching." (no context)

### What We're Building (mandatory)

The observable behavior change. What's true after this PR merges that wasn't true before.

This section is for both the human reviewer and the agent. Be precise about what changes from the user's / caller's perspective. Don't dive into implementation here — that's `Implementation Notes`.

- ✅ "A new `cacheUserSession(userId, sessionId, ttlSeconds)` is exposed from `src/auth/session.ts`. The existing `getUserSession(userId)` consults the cache first; on miss it falls back to the DB and populates the cache. Cache misses are logged at debug level."
- ❌ "Caching for sessions." (not observable, not testable)

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

### Implementation Notes (optional but usually present)

Specific guidance about *how* to implement, when there's a meaningful choice or a landmine. Skip the section entirely if there's nothing useful to say.

Use this when:

- There's an existing helper or pattern the agent should reuse instead of inventing
- A naive implementation would have a bug (race condition, perf problem, security issue)
- The repo has a convention that's not obvious from a quick read
- There's a sequencing constraint (do X before Y)

Don't use this for:

- Restating the acceptance criteria
- Generic advice ("write good tests")
- Implementation details the agent should figure out themselves (which loop type, how to name a local variable)

### Quality Gates (optional)

Exact commands. Pulled from the repo profile or from the repo's CI config. These are commands the agent runs before opening the PR.

```bash
pnpm typecheck
pnpm lint
pnpm test --run
```

If you list these, the agent will run them. If the repo has nothing meaningful to enforce (rare), skip the section.

### For the Executing Agent (mandatory)

A short operational brief. The agent reads this last; it's the "stage directions". Cover:

- Sequencing — do TASK X before Y
- Patterns to follow — "match the existing style of `src/foo.ts:greet()`"
- Landmines — "do not modify the public signature of `getUserSession` — callers depend on it"
- Doc updates if APIs/CLI change

Keep it under ~150 words. It's not a duplicate of acceptance criteria; it's the cover letter.

## Forbidden in the spec body

- **YAML frontmatter.** Forge prepends this. You start at `# Title`.
- **Fenced wrappers around the whole spec.** The file is the spec; no ```forge-spec or ```markdown wrapper.
- **Phrases that defer decisions.** "Decide on X", "choose between Y and Z", "if it makes sense, do W". Make the call. If you genuinely can't, ask the user before drafting, not in the spec.
- **References to this conversation.** "As we discussed..." — the agent didn't see the conversation.
- **Cross-task references.** Each spec stands alone.
- **Estimates or time guesses.** Forge tracks time itself; specs aren't where you put hours.

## How long should a spec be?

Long enough that an agent who's never seen the codebase could execute it without asking questions. For a small bug fix, that might be 30 lines. For a feature, 80–200 is normal. If you're past 300, the work is too big for one spec — split it.
