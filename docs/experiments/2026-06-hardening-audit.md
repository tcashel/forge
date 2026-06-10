# Forge F0 hardening audit — 2026-06-09

**Method.** Seven parallel deep-dive auditors (review-publish, review-resolve, headless execution,
DB/store, CLI UX, Workbench/serve, docs+suite health), every BLOCKER/HIGH finding re-verified by an
independent adversarial agent that re-traced the cited code path. 36 serious findings confirmed,
1 refuted, ~43 minor. Full structured findings with file:line evidence: [`audit-findings.json`](audit-findings.json).
Finding ids below reference that file.

**Baseline at audit time** (main @ `16e1805`): typecheck green; lint red (1 formatting error,
9 warnings); `bun test` 422/431 pass — 8 worktrees failures (gpg signing inherited from operator
config) + 1 agent-drift failure (binary missing; Bun's `node:test` shim ignores `skip`). Suite is
also nondeterministic under load (parallel runs executed 431/222/304 tests — wedged HTTP tests
cascade into silently dropped files).

---

## The story the audit tells

The review pipeline's machinery is mostly *sound* — marker-based idempotency (anvil lesson 6) is
implemented and wired, the publish POST is a single batched review, diff anchoring handles renames.
What's broken is **truthfulness at every boundary**: outcomes are computed and then thrown away.
Five independent auditors converged on the same root causes:

1. **Publish outcome is discarded.** `publishReviewFindings` returns a rich result; the worker
   logs it into a detached `agent.log` and finalizes the session `completed` no matter what.
   Nothing persists whether findings reached GitHub. (`pub-publish-outcome-not-persisted`,
   `resolve-rereview-publish-outcome-invisible`, `exec-headless-publish-findings-best-effort-invisible`,
   `serve-review-publish-failure-invisible` — four areas, one bug.)
2. **The launch runner's `set_status` has been a silent no-op since inception** — a bash quoting
   bug (`""$1""`) makes every status transition fail JSON parsing, swallowed by `|| true`. Failed
   runs stay "running" forever; `reviewError`, `baseSha`, `finalSha` never reach meta.json.
   (`exec-headless-set-status-quoting-silently-broken`, `pub-runner-meta-quoting-noop`.)
3. **Dead workers wedge the world.** No pid tracking, no reaper for review/comment-fix sessions or
   tmux jobs; a SIGKILLed worker leaves `running` rows that 409-block all future reviews of that PR.
   (`pub-stale-running-review-session-blocks-pr`, `serve-stuck-review-session-blocks-pipeline`,
   `exec-headless-dead-tmux-jobs-never-reaped`, `data-dash-kill-leaves-db-and-meta-running-forever`.)
4. **Headless isn't headless.** Forge-authored commits (auto-fix round, comment-fix) inherit
   gpg signing → 1Password locks the loop with the screen; no timeout anywhere in the execution
   layer. (`exec-headless-forge-commits-hit-gpg-signing-prompt`, `resolve-rereview-git-push-commit-can-block-headless`,
   `exec-headless-no-timeouts-hung-agent-runs-forever`.)
5. **The suite pollutes the operator's real `~/.forge`** — `process.env.HOME` mutation is a no-op
   under Bun's `os.homedir()`; fixture plans verified written into production forge.db.
   (`cli-bun-test-pollutes-real-forge-home`, `docs-suite-tests-pollute-real-forge-home`.)

## Ranked findings (confirmed serious)

### P1 — Review pipeline reliability (the top pain)

| id | sev | one-liner |
|---|---|---|
| pub-publish-outcome-not-persisted | BLOCKER | Publish success/failure never persisted or surfaced; session 'completed' even when 0/N posted |
| serve-review-publish-failure-invisible | BLOCKER | Same bug from the Workbench's view — no banner, no chip, no retry |
| pub-runner-meta-quoting-noop | BLOCKER | Runner `set_status`/unquoted `set_meta_field` silent no-ops |
| pub-launch-findings-never-extracted | HIGH | Launch auto-review findings never parsed to findings.json — pipeline findings invisible & unpublishable |
| pub-bare-fence-truncates-findings | HIGH | Bare ``` inside the forge-review block truncates extraction; later findings silently dropped |
| pub-no-headless-publish-path | MEDIUM | `forge review` only prints a prompt; publish exists only behind a default-off Workbench checkbox; documented `publishReviewToGitHub` config key was never implemented |
| pub-stale-diff-commit-race | MEDIUM | Diff/headRefOid captured before the (minutes-long) agent run; mid-review push 422s the whole batch or posts outdated comments |
| pub-empty-diff-silent-degrade | MEDIUM | `gh pr diff` failure returns "" → all findings demoted to out-of-diff bullets, reviewer reviews blind |
| pub-gh-stderr-discarded | MEDIUM | runGh discards stderr — publish failures are undiagnosable ("unknown") |
| resolve-rereview-bundle-paginate-no-slurp | HIGH | fetchPrBundle missing `--slurp` — >100 comments breaks JSON.parse, fixer targeting collapses |
| resolve-rereview-parent-drops-unmatched-targets-silently | HIGH | Selected fix targets silently dropped pre-worker; no state, no warning |
| resolve-rereview-finding-id-unstable-on-line-shift | MEDIUM | id hashes lineStart → line shift after fix re-posts duplicates and severs resolve linkage |
| serve-review-drawer-unmounts-on-done | HIGH | Drawer unmounts itself on done before failure text can render |

### P2 — Truthful status & recoverability

| id | sev | one-liner |
|---|---|---|
| data-reviewing-status-strands-plans-and-crashes-api | BLOCKER | Runner-only "reviewing" leaks into Plan.status; strands plan, 500s /api/plans |
| data-transient-done-latch-before-review | HIGH | Runner writes 'done' before review/auto-fix; a poll in the window terminally latches done |
| exec-headless-dead-worker-stuck-running-blocks-pr-reviews | HIGH | Dead review/fix worker leaves 'running' row; single-flight 409s forever |
| exec-headless-dead-tmux-jobs-never-reaped | HIGH | No job reaper — dead tmux runner = 'running' forever |
| serve-running-plan-dead-tmux-never-fails | HIGH | Workbench shows pulsing Running pill for dead runners |
| data-dash-kill-leaves-db-and-meta-running-forever | HIGH | TUI kill updates only index.json; jobs row + meta stay running |
| cli-status-never-syncs-meta | HIGH | `forge status`/`ls` never reconcile meta.json — CLI-only operator sees stale state |
| cli-status-hides-failure-detail | HIGH | errorMessage/reviewVerdict/quality results never printed |
| serve-port-in-use-silent-double-bind | HIGH | Second `forge serve` silently double-binds (SO_REUSEPORT); dashboards diverge |

### P3 — Headless robustness

| id | sev | one-liner |
|---|---|---|
| exec-headless-forge-commits-hit-gpg-signing-prompt | HIGH | Forge-authored commits inherit gpg signing — 1Password locks the loop |
| resolve-rereview-git-push-commit-can-block-headless | HIGH | Same for comment-fix `commit`/`push` + credential prompts |
| exec-headless-no-timeouts-hung-agent-runs-forever | HIGH | No timeout on agent/gh/git anywhere in the execution layer |
| exec-headless-result-event-rescue-only-in-critique | HIGH | PR #64 sidecar-trust applied only to critique; launch/review/fix still trust exit codes |
| data-stale-file-lock-unrecoverable | HIGH | Crash while holding lockfile = permanent 'Could not acquire lock' |
| data-no-sqlite-busy-timeout | HIGH | busy_timeout=0 with 3 concurrent writer processes → dropped writes |
| data-unwrapped-dual-writes | HIGH | spec save / improve / plan edit crash user commands after JSON commit on DB hiccup |

### P4 — Suite health & CLI safety

| id | sev | one-liner |
|---|---|---|
| cli-bun-test-pollutes-real-forge-home | HIGH | `bun test` writes fixtures into production ~/.forge |
| docs-suite-worktrees-gpg-signing-confirmed | MEDIUM | worktrees tests inherit operator git config (8 failures; hang risk) |
| docs-suite-wedged-test-silently-drops-half-the-suite | MEDIUM | node:test shim wedge cascade silently drops test files |
| cli-help-after-positional-executes-command | HIGH | `forge launch <id> --help` launches an agent |
| (drift-skip) | MEDIUM | Bun ignores node:test `skip` — drift tests fail where binaries absent |

Minor findings (MEDIUM/LOW, ~43) are listed per-area in `audit-findings.json`.

## Scope decision for this session

**Doing now (F0, in order):**
1. P1 publish reliability — persisted per-finding publish state machine (`publish.json` + session
   metrics), loud failure surfacing in `forge status` + Workbench, retry path, `forge review --run
   [--publish]` CLI, launch-findings extraction, fence fix, slurp fix, stderr capture, stale-head
   re-check, target-drop stamping.
2. P2 truthful status — runner quoting fix, done-latch fix, status whitelist, reapers (jobs +
   review/fix sessions, pid-based), dash kill parity, status/ls meta sync + failure detail,
   port-in-use guard.
3. P3 headless — env-scoped `commit.gpgsign=false` + `GIT_TERMINAL_PROMPT=0` for all Forge-authored
   git, per-stage timeouts, sidecar-trust generalized to launch runner + workers, lock staleness
   reclaim, busy_timeout, dual-write guards.
4. P4 suite — ~/.forge isolation (explicit forgeDir), git-config isolation, drift-test skip fix,
   lint clean.
5. Doc alignment — README/VISION/BUILD_PATH vs new roadmap; SKILL.md publish-gate correction;
   ADR-0031 for the publish state machine.
6. Live verification — real PR publish/re-run/resolve; headless loop; mid-flight kill.

**Deferred (new scope, written up instead of done):**
- `node:test` → `bun:test` wholesale migration (mechanical but wide; do after this PR).
- Finding-id stability across line shifts (`resolve-rereview-finding-id-unstable-on-line-shift`) —
  needs a marker schema bump + fuzzy reconciliation; design sketched in the finding, sequenced next.
- Purging historical test pollution from the operator's ~/.forge (list captured; operator data —
  needs explicit confirmation).
- Workbench review-queue/triage improvements beyond failure surfacing (F2 territory).
- Most per-area MEDIUM/LOW minors not on the critical path (see audit-findings.json).
