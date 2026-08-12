# NEXT — forged drives everything

v0 is merged and installed (`~/.cargo/bin/forged`, all eleven doctor probes
green). It has **never driven a real slice.** Everything below is about closing
that gap fast, in two sessions, and then deleting the TypeScript atom that
currently does the job.

Run this top to bottom. Each step says what "done" means; if a step breaks, fix
forged and re-run it — the runs are disposable, the ledger is append-only, and
nothing here touches a repo that matters until the PR step.

## Ground rules

- **Codex is the provider.** The fable tier is out for a week (through
  ~2026-08-19) and the Anthropic pool is needed elsewhere. Every packet below
  runs `codex` at `gpt-5.6-sol`/xhigh unless a step says otherwise.
- **The OpenAI pool is shared** with whatever codex session is driving drover.
  They compete; don't run two heavy things at once.
- **Never touch the live beads store for experiments.** `BEADS_DIR` and
  `ANVIL_HOME` are both env-overridable — use scratch values for anything that
  is not real work. (`forged doctor` reads the live store; that is fine, its
  lease probe is scratch-guarded.)

---

## Session 1 — first contact, then the falsifier

### Step 1 — forged drives one real slice, start to draft PR

Target: `beads-aj3` in drover (the wing-coverage probe — ready, zero open
questions, self-contained in `ts/`).

```bash
forged run start --bead beads-aj3 \
  --repo /Users/tcashel/repositories/drover \
  --spec /Users/tcashel/.anvil/specs/beads-aj3.md
forged run drive --run <run-id>          # or: forged run advance, one stage at a time
forged run status --run <run-id>
forged events --run <run-id> --limit 50
```

**Done when:** a draft PR is open on drover, the gate result is recorded
(pass or fail — a failing gate must NOT abort the run), both review legs
produced a verdict, and the ledger holds attempt rows plus `operations` rows
with an idempotency key per external effect.

**Where it will break first — check these before assuming a deep bug:**

1. **The gate command shape.** aj3's gate is two lines, each `cd`-prefixed:
   `cd ts && bun run check` and a second line running the probe script. The
   gate runner has only ever seen single cargo commands. Fix the runner, not
   the spec.
2. **Provider selection.** Confirm the packet's hints actually select codex,
   and that the sandbox is `workspace-write` for implement/fix and
   `read-only` for reviews.
3. **`gh pr create`.** Draft flag, correct base, and the operation must be
   recorded before the side effect (observe-only recovery class).
4. **Usage capture.** Under a ChatGPT plan there is no USD — `pricing_basis`
   must be `none` with real token counts, not a crash or a zero.

Do NOT hand-fix drover's code to make a stage pass. If the slice's content is
wrong, that is a finding about the spec; if a stage is wrong, that is a bug in
forged. Keep them separate.

### Step 2 — the falsifier (S6). This is the bet.

Same repo, real work. Start a slice, kill the driver mid-implement, resume from
a **different** session:

```bash
forged run start --bead <next-ready-bead> --repo /Users/tcashel/repositories/drover --spec ~/.anvil/specs/<id>.md
forged run drive --run <run-id> &        # let it reach Implement
kill -9 <driver-pid>                     # mid-flight, no cleanup
# from a second shell / a codex session:
forged claim-next --holder codex:$(hostname):$$ --idempotency-key falsifier-1
```

**Asserts — all must hold:**

- exactly one PR, and exactly one succeeded `pr.create` operation
- zero duplicate review comments (count the `<!-- anvil-finding id=… -->` markers)
- no packet with two completed attempts
- exactly one `lease_reclaimed` in bd's events, with never two live holders
  (cross-check bd events against the ledger)
- replaying any completed operation returns byte-identical `reused:true`
- a failing gate yields `ok:true` with a failing result, never an abort
- `usage` rows exist per attempt with provider, model, and `pricing_basis`
- zero bd writes from worker packets

**On pass: tag v0.** On fail: the architecture is wrong and the parked TS
kernel (beads-5rz) un-parks — that is the deal, and it is why this step is not
optional.

---

## Session 2 — make forged the default path

### Step 3 — codex drives forged natively

```bash
codex mcp add forged -- forged mcp
```

Then drive a slice from inside a codex session using the forged tools rather
than shell commands. The stdio server round-tripped envelopes from both hosts
during P0, so this should be registration plus a smoke test, not development.

**Done when:** a codex session starts, advances, and inspects a run without
shelling out.

### Step 4 — retire the TypeScript atom

In smithy (**in a git worktree** — the Claude marketplace reads
`~/repositories/smithy` live, so a branch checkout there swaps the pipeline
under any running session):

- Point the `dispatch` skill at `forged run start` + `run drive` instead of
  `workflows/execute-review-fix.js`.
- Delete `execute-review-fix.js` only after forged has driven **three** real
  slices clean. Until then it stays as the one-line revert.
- `run-epic.js` and `watch-epic` STAY on the TS path. Epic/v1 is a separate
  design with its own falsifier; the atom is where the tokens and the crash
  risk live, and it is the only piece forged v0 implements.
- Rewrite smithy's cardinal rule: "anvil never shells out to forge" dies with
  the experiment that needed it. Successor: *anvil reaches forged only through
  its typed CLI/MCP contracts; no cognitive stage lives in forged.*
- Bump the plugin version (both manifests) — installs are version-keyed on the
  codex side and will otherwise serve stale files.

### Step 5 — herdr panes

The `SessionHost` herdr backend ships and doctor reports the socket live at
`~/.config/herdr/herdr.sock`. Smoke it: two panes at target concurrency, kill
one, confirm death is detected via **sentinel staleness only** (herdr never
exposes exit codes). Then make it the default vessel so slices are watchable.

---

## What we are NOT doing yet

- run-epic / watch-epic in forged (epic/v1 — needs design + its own falsifier)
- the MCP App dashboard (view-only, desktop-only, deferred)
- any YAML workflow DSL (protocol-first until two genuinely different
  topologies demand it)

## Carry-over debt worth one commit each

- Historical ADRs link `../VISION.md` etc.; those moved to
  `docs/archive/ts-era/`. Add a README there rather than editing the records.
- The failpoints CI step takes 20+ minutes (second full compile + real process
  choreography). cargo-nextest or a feature-keyed cache would fix it.
- The retro that priced all of this is at `~/.anvil/runs/beads-4zp-retro.md`;
  its smithy-side actions (resumable blocked state, deterministic readiness,
  chunked review coverage) are mostly obsoleted by Step 4 — forged's ledger
  already owns them. Don't build them twice.
