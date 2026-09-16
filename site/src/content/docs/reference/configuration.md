---
title: Configuration
description: Choose repository checks, assurance profiles, provider rosters, and budgets in operator-scoped configuration.
---

Forge keeps configuration outside the repositories it works on. Use
`/forged:configure` with your lead agent or edit the operator file directly,
then validate the resolved definition before dispatch.

## Files and precedence

`ANVIL_HOME` defaults to `~/.anvil`. Configuration selection is:

1. An explicit `FORGED_CONFIG` path.
2. An existing `$ANVIL_HOME/config.yaml`.
3. An existing legacy `$ANVIL_HOME/config.json`.
4. `$ANVIL_HOME/config.yaml` as the default path for new configuration.

The execution ledger normally lives at `$ANVIL_HOME/state.db`, with run
artifacts under `$ANVIL_HOME/runs/`. Change authoring configuration through its
supported fields; do not edit ledger rows or stored execution packages.

## Configure each repository's checks

The built-in gate commands target a Rust workspace. Replace them with your
project's real checks. This example assumes the project already provides
`make check` and `make lint`:

```yaml title="~/.anvil/config.yaml — repository settings"
repositories:
  /absolute/path/to/repository:
    default_profile: standard
    default_roster: default
    gate_commands:
      - make check
    seat_commands:
      - make lint
    seat_env:
      CI: "1"
```

Use the same absolute original checkout path recorded on the work item.
Matching normalizes path components without resolving symlinks.

Repository entries can override `default_profile`, `default_roster`,
`gate_commands`, `seat_commands`, and `seat_env`. Omitted fields inherit global
defaults. Supplied command lists and environment maps replace the whole value.
Explicit profile or roster flags win over repository defaults, which win over
global defaults.

Check the effective result from the repository root:

```sh
forged definition validate --repo "$PWD"
```

### Seat checks and gates

`seat_commands` are checks an implementation or fix agent runs before each
commit, alongside repository-required checks. The controller owns
`gate_commands` and runs them after implementation and after fixes.

Each gate command runs sequentially as `sh -c` in the worktree. Commands get
separate shells, so a shell variable set in one does not carry into the next.
The gate records the checked HEAD and requires a clean tracked worktree and
index before and after the suite; ignored build artifacts are allowed. An
empty gate list is refused.

`seat_env` applies to provider processes. Put gate-specific environment values
in the gate command itself, such as `CI=1 make check`. See the
[execution environment reference](https://github.com/tcashel/forge/blob/main/docs/reference/execution-environment.md)
for timeouts, output capture, and environment inheritance.

## Choose assurance and providers

| Setting | Controls |
| --- | --- |
| **Profile** | The review structure and bounded remediation rounds. Built-ins are `lean`, `standard`, and `high`. |
| **Roster** | Ordered provider/model candidates for each role. |
| **Policy** | Checks, deadlines, transport retries, and other execution limits. |

`standard` provides one independent repository-aware reviewer and bounded
fixes. `high` is an explicit choice for consequential work. A profile's
`fixRoundBudget` bounds its review and remediation loop; exhaustion becomes a
recorded decision instead of an unlimited search for agreement.

Rosters select candidates for roles such as `implementation`, `remediation`,
`review.primary`, and `assessment`. Implementation and remediation need
repository write capability. Review and assessment roles are read-only.

Rolling epics require a dedicated read-only assessment role and independent
read-only critique candidates. Keep the generated roster as a starting point,
then select providers and models available through your own accounts. The
[configuration skill](https://github.com/tcashel/forge/blob/main/plugins/forged/skills/configure/SKILL.md)
documents candidate shape, reasoning effort, and custom model names.

Provider CLIs own authentication and inference routing. A valid model name in
Forge's configuration does not prove that the provider can serve it. Keep
credentials and gateway configuration in the provider's own supported setup.

## Understand frozen settings

Starting work compiles and stores the resolved execution package. Editing YAML
affects later starts and explicit run retries; it does not silently replace an
active run's policy or roster. Frontier-created epic children inherit the
parent's active frozen definition.

For an existing run, use `run revise-roster` or `run revise-policy` at the
supported durable boundary. Epic-wide changes use the corresponding `epic`
operation so current and future children stay coordinated. Follow the exact
action and preconditions returned by `explain`; an active epic may need to be
paused first.

## Budgets and recorded cost

Stage deadlines, deadline retries, transport retries, and review rounds are
separate bounds. Capacity lives in the `admission` policy. Select limits that
fit the host and provider accounts, then inspect their effect through durable
status instead of inferring capacity from open terminals.

Forge records provider-billed cost where supplied. For token-only usage it
uses configured rates when pricing is supported by the evidence. Missing
model rates or insufficient tier evidence leave cost unknown.

```sh
forged usage --repo "$PWD" --models
```

Use comparable repository work to evaluate a roster. The usage report is
evidence about recorded attempts, not a model ranking or a quote for future
work. If you customize the rate card, record its source and date and preserve
entries for models you still use.

After changes, validate the intended selection explicitly:

```sh
forged definition validate --repo "$PWD" \
  --profile standard --roster default
```
