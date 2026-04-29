# Research — How to Explore Before Drafting

Loaded by `forge-planner` before writing any spec content. The downstream agent only sees the spec body — so anything you don't capture during research is information they won't have.

## Why research is non-optional

Forge launches the agent in a fresh git worktree. The agent has the codebase but not your conversation, not the JIRA ticket (unless you copied it into the spec), and not the user's clarifying answers. If the spec says "fix the bug in the rate limiter" and the repo has three rate limiters, the agent picks the wrong one and the PR comes back broken. Research is how you make sure that doesn't happen.

## What to figure out before you draft

In rough order of priority:

1. **Where the change lives.** Concrete file paths, not "the foo module". Open them.
2. **The behavioral contract you must preserve.** Exact error strings, exact validation rules, exact ordering, exact response shapes. Tests are the canonical source.
3. **The repo's idioms.** How does this codebase raise errors? Where do tests live and what's the test runner? What's the linter configured to enforce? You match the existing style; you don't impose your own.
4. **The full blast radius.** What other code calls into the area you're changing? Any sibling modules that need the same change? Docs that reference the current behavior?
5. **The quality gates.** What command does CI run? What does the user run before opening a PR?

## Useful exploration commands

These are all read-only and allowed:

```bash
# Project layout
ls
cat README.md 2>/dev/null | head -200
cat package.json pyproject.toml Cargo.toml go.mod 2>/dev/null

# Recent activity in the area
git log --oneline -n 20 -- <path>
git log --all --oneline --grep="<keyword>"
git diff HEAD~5 HEAD -- <path>

# Find references
rg -n "<symbol>"
rg -n "<symbol>" --type ts            # constrained by language

# CI / quality gates
cat .github/workflows/*.yml 2>/dev/null
cat .pre-commit-config.yaml 2>/dev/null
```

For specific files, use `read` (not `cat`) — it gives you the file with line numbers preserved cleanly.

## What "I read it" means

Stronger than skim. You read it well enough to:

- Cite the exact line for any claim you make about the file
- Quote any error string, validation rule, or magic constant verbatim
- Identify which functions are public surface vs. internal helpers

If you can't do that for a file, you haven't read it yet.

## Reporting findings

Before you draft, say what you learned in the conversation. The user uses this to catch wrong assumptions before they get baked into the spec. Format that works well:

> **What I found:**
> - Stack: TypeScript + Vitest, build via `tsup`, tests under `tests/` matching `*.test.ts`
> - The rate limiter is in `src/middleware/rate-limit.ts` (78 lines). Wired up at `src/server.ts:42`. Bucket size is hardcoded to `60` on line 23.
> - Tests in `tests/middleware/rate-limit.test.ts` assert exact error message `"rate limit exceeded for IP <addr>"` (line 14) — this is a contract.
> - Quality gates: `pnpm typecheck && pnpm lint && pnpm test --run`
>
> **Open questions:**
> - Should the bucket size be configurable per-route or globally?
> - Is there a Redis-backed limiter elsewhere I should be consistent with? (Couldn't find one in `src/`.)

Make the user confirm before drafting if anything material is open.

## When to skip research

Almost never. Even simple-sounding changes have surprising context. The exceptions:

- The user explicitly said "I already know what I want, just write the spec from this exact description" — then ask once if they want you to verify any specific facts before drafting, and respect a no.
- The change is purely additive to a file that doesn't exist yet (e.g., "add a new CLI subcommand `frob`"). Even then, read the entry point, the existing subcommands, and the test conventions.

## Anti-patterns

- Reading file *names* from `ls` and inferring contents.
- Quoting a function signature you didn't actually open.
- Skipping tests "because the user said it's a small change".
- Drafting a spec, then doing research to justify it.
- Assuming a stack convention from another repo (e.g., "Python projects always use `pytest`" — confirm in the actual `pyproject.toml`).
