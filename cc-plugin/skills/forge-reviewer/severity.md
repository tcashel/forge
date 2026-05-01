# Severity — How to Label Findings

Loaded by `forge-reviewer` when classifying any finding. Every finding gets exactly one label. When you're between two adjacent labels, pick the higher one.

These labels drive the verdict — a single `BLOCKER` means you cannot approve.

## BLOCKER — Stop everything

Use when **any** of:

- **Violates the spec.** Acceptance criterion not met, or behavioral contract from the spec is broken.
- **Data loss or corruption.** The change can lose, corrupt, or leak user data.
- **Security vulnerability.** SQL injection, XSS, auth bypass, secrets exposure, path traversal, command injection. Even if "unlikely to be exploited".
- **Runtime crash on normal input.** The change throws on a code path that callers will hit in production.
- **Backward compatibility break.** Public API / CLI / wire format changed without explicit intent and migration plan.
- **CI is failing for a reason caused by this PR.** Not flaky — actually failing.

A single BLOCKER → verdict is `block` (or `request-changes` if the fix is small enough that the PR should iterate rather than be closed).

## HIGH — Must fix before approve

Use when **any** of:

- **Correctness issue not visible in the spec.** Logic is wrong but no acceptance criterion catches it.
- **Missing input validation.** Inputs flow into queries / shell / file paths / network without sanitization, but no current attacker exploit is obvious.
- **Race condition or data race.** Shared state without synchronization on a path that will hit it.
- **Resource leak.** Connections, file handles, timers, listeners not cleaned up.
- **Test gap on a critical path.** A user-facing code path has no test, and the change is non-trivial.
- **Performance regression.** A hot path slowed measurably (>10%, or breaks a stated SLO).
- **Error swallowed silently.** An exception or error result is caught and dropped without logging or surfacing.

Multiple HIGH findings → verdict is `block`. A single HIGH → verdict is `request-changes`.

## MEDIUM — Should fix

Use when:

- **Code smell that will rot.** Duplicated logic, deeply nested control flow, function doing four things.
- **Naming that misleads.** A function called `getUser` that creates a user. A variable named `count` that holds a list.
- **Missing edge-case test.** Happy path is covered; one obvious edge case (empty input, max value, error path) isn't.
- **Documentation drift.** Public behavior changed; docstring / README / CHANGELOG not updated.
- **Inconsistent with repo conventions.** Different error class, different async pattern, different test file location than the rest of the codebase.

MEDIUM findings don't block — verdict can still be `approve` if everything else is fine. But they should be raised so the author can decide.

## LOW — Nice to have

Use when:

- **Style nit.** Could use a clearer comment, a better variable name, an extra blank line.
- **Minor refactor opportunity.** Unrelated to this PR's scope but the area would benefit later.
- **Typo in non-user-facing string.** Variable name typo, internal log message typo.

LOWs are **never** load-bearing on the verdict. Don't escalate to MEDIUM unless you genuinely believe leaving it would cause problems.

## How to choose between adjacent labels

When you're unsure, ask:

> If I let this merge as-is and it caused a problem, would I be embarrassed?

| Answer | Pick |
|---|---|
| "It would cause an outage / data loss / breach" | BLOCKER |
| "It would cause a customer-visible bug" | HIGH |
| "It would slow us down later" | MEDIUM |
| "It's a nit I'd mention in passing" | LOW |

When still on the fence between two labels, **pick the higher one**. Code review is a place where false negatives are worse than false positives.

## Things that are not findings

Don't list these in the review:

- Things you would have done differently as a stylistic choice, with no concrete problem.
- Hypothetical refactors that aren't part of this PR's scope.
- "Could be more efficient" without a measured regression.
- "What if the user does X?" — only if X is a realistic input. Adversarial fan-fic doesn't count.

If you find yourself starting a finding with "Consider...", check whether it's actually load-bearing. Often it's a LOW that should be left for a later PR.

## Format inside `forge-review`

Each finding starts with the severity label in brackets:

```markdown
### [BLOCKER] Validation error class changed silently
**Where:** `src/auth/session.ts:80`
**Evidence:** <quoted code or test assertion>
**Why:** <one or two sentences>
**Fix:** <concrete remediation>
```

Order findings by severity, BLOCKER first. Within a severity, order by file path.
