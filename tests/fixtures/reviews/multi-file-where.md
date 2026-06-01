## Verdict
request-changes

## Summary
One finding whose Where line lists several files (real-world reviewer shape).

## Findings

### [HIGH] Codex cost estimates charge cached input at full input price
**Where:** `src/core/pricing.ts:67-76`, `src/core/codex-stream.ts:56-58`, `tests/codex-stream.test.ts:45-51`
**Evidence:**
```ts
const cost = (input.tokensIn * price.inputPer1M + input.tokensOut * price.outputPer1M) / 1_000_000;
```
**Why:** `estimateCost` prices all input tokens at the full rate, ignoring the captured cached-input tokens.
**Fix:** Thread `cacheRead` into `estimateCost` and price cached input at the discounted rate.

## What I Verified
- [x] Checked pricing against the official model docs.
