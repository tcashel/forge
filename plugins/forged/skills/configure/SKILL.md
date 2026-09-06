---
name: configure
description: "Guide the operator through Forged profile, roster, and pricing configuration: choose a model and reasoning effort for each role, name custom or gateway-routed models correctly, optionally price token-only models and tools, and validate the result. Use when the operator asks which model belongs in a role, wants to change the roster or profile, uses a custom model name, or invokes /forged:configure."
---

# /forged:configure

Position: initialized operator config -> validated authoring definitions for
future work. Next: `forged definition validate`, then `/forged:plan` or an
explicit dispatch of an already-ready item.

Boundary: configuration judgment and file edits stay in the lead session.
Forged freezes the resolved profile, roster, and rate card only when work is
started; already-running work keeps its frozen snapshot and execution remains
owned by Forged.

## Boundaries

- The authoring config is `$ANVIL_HOME/config.yaml` (default
  `~/.anvil/config.yaml`; `FORGED_CONFIG` overrides; `.json` is accepted).
- This skill edits profiles, rosters, defaults, repository overrides, and pricing
  in that file only.
  It never touches `state.db`, target repositories, provider credentials, or
  the service manifest.
- Changing cognition for already-running work uses the typed
  `epic revise-roster` or `run revise-roster` lifecycle operation through
  `../manage-work/SKILL.md`, never an authoring-config edit.
- Repairing a wrong frozen gate command, stage budget, or transport-retry
  budget starts with the config edit here, then uses `run revise-policy` or
  `epic revise-policy` through `../manage-work/SKILL.md`. The verb accepts no
  field values and applies the config-sourced policy only at the next packet
  boundary.
- `forged definition validate` is the acceptance gate.
- Provider CLIs own routing and authentication. Configure an inference gateway
  in the provider's settings, not here.
- Never invent a price. An unpriced model reports unknown cost until the
  operator supplies sourced rates.

## Inspect before editing

```bash
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
if [ -n "${FORGED_CONFIG:-}" ]; then
  CONFIG="$FORGED_CONFIG"
else
  CONFIG="$ANVIL_HOME/config.yaml"
  test -f "$CONFIG" || CONFIG="$ANVIL_HOME/config.json"
fi
cat "$CONFIG"
forged definition validate
```

A set `FORGED_CONFIG` is authoritative even when its file does not exist. If no
config exists, route to `../setup/SKILL.md`; this skill refines initialized
operator state.

## Profiles and rosters

**Profiles** describe cognitive topology: seats and bounded review rounds. They
do not name models. The defaults are `lean`, `standard`, and `high`; most
operators keep them and choose one at dispatch.

**Rosters** map semantic roles to ordered provider candidates. This is where
model and reasoning effort live. `default_profile` and
`default_roster` apply when dispatch names nothing.

The `repositories` map uses canonical absolute checkout paths. Its only
overrides are `default_profile`, `default_roster`, `gate_commands`,
`seat_commands`, and `seat_env`; named profiles and rosters remain shared.
Explicit dispatch profile/roster flags win, then repository defaults, then
global defaults. Omitted values inherit; commands and environment replace the
whole value, so `[]` and `{}` clear it. Matching normalizes `.` and `..` but
does not resolve symlinks; use the same repository path as the work record.
For example:

```yaml
repositories:
  /absolute/path/to/repository:
    default_profile: standard
    default_roster: default
    gate_commands: [make check]
    seat_commands: [make lint]
    seat_env: {CI: "1"}
```

Preview a repository change before and after editing with
`forged definition validate --repo "$TARGET_REPO"`. Runs freeze the resolved
values; supported revisions resolve against the run's original repository.

Choose models and effort from demonstrated quality and total cost on comparable
repository work. `forged usage --repo "$TARGET_REPO" --models` provides recorded
evidence, not a ranking or proof that a model caused an outcome. Keep an effective
baseline until a cheaper candidate meets the same quality bar. Reuse suitable
named rosters; do not create rosters or add prices without configuration authority.
The report shows five groups by default; `--limit` widens to at most 100 and
coverage states what was omitted. Missing historical effort stays unknown.

| Role | Sandbox | What it needs |
| --- | --- | --- |
| `implementation` | workspaceWrite | Coding capability proven on comparable work. |
| `remediation` | workspaceWrite | Capability to repair the reported failures within scope. |
| `review.primary` | readOnly | Independent reasoning suited to the repository's risks. |
| `review.secondary` | readOnly | A different provider family from primary. |
| `review.tertiary` | readOnly | An additional perspective when the selected assurance needs it. |
| `synthesis` | readOnly | Judgment to resolve conflicting findings. |
| `assessment` | readOnly | Rolling-epic planning judgment between waves. |

`forged definition validate` proves shape: every profile role has candidates,
identifiers are printable, and sandbox agrees with capabilities. Rolling-epic
rules are checked only at start, so design for them upfront:

- a dedicated read-only `assessment` role using provider `claude`, `codex`, or
  `pi`;
- read-only critique candidates;
- no assessment candidate overlapping a critique candidate.

Candidate shape uses camelCase keys and rejects unknown fields:

```yaml
rosters:
  default:
    schema: forged.roster/1
    name: default
    roles:
      review.secondary:
        - provider: codex
          model: gpt-5.6-sol
          effort: xhigh
          sandbox: readOnly
          capabilities: [repositoryRead, structuredOutput]
```

## Reasoning effort per provider

`effort` is optional and provider-specific:

- **codex** — passed as `model_reasoning_effort`; select it using the task and
  evidence above.
- **pi** — passed as `--thinking`; allowed values are
  `off|minimal|low|medium|high|xhigh|max`.
- **claude** — the adapter passes no effort flag; omit it.

## Custom model names and gateways

The `model` string is passed verbatim to the provider CLI (`claude --model`,
`codex -m`, `pi --model`). Forged validates its charset, not model existence.

1. Route in the provider, name the exact gateway model id in the roster.
2. Prove the name with that provider CLI before trusting a dispatch.
3. Keep the name stable because usage and pricing key on the exact string.

## Pricing and optional tool rates

Claude-reported billed cost is stored verbatim. Token-only providers are
imputed from `pricing.models`; an absent exact model entry remains honest
unknown cost and raises missing-cost attention.

Tool rates are optional operator input. When `pricing` is omitted entirely,
config resolution calls `default_rate_card`, which supplies the complete
built-in model and tool card. Do not demand tool prices during ordinary roster
configuration. Ask only when a selected roster capability and provider setup
actually imply server-side tool use whose rate differs from that default.

A custom `pricing` block replaces the built-in card wholesale. In that case the
serialized `tools` object is required by the current config shape even when the
operator did not customize it: carry forward the sourced default value, or ask
for a different sourced value only when server-side tool use requires one.
Carry forward every token-only model the rosters still name:

```yaml
pricing:
  rates_as_of: "2026-08-27"
  source: "<where these numbers were transcribed from>"
  long_context_threshold: 272000
  tools:
    web_search_per_1k: 10.00
  models:
    "org/custom-model:tag":
      context_window: 200000
      short: { input: 3.00, cached_input: 0.30, cache_write: 3.75, output: 15.00 }
      # long: only for a model publishing a second tier
```

The context window makes long-tier selection provable. Transcribe rates from a
source the operator names and record date plus source; never fill a gap from
memory.

## Apply and verify

```bash
forged definition validate
forged doctor
```

Report resolved defaults, each role's candidates and rationale, the rate card,
and unpriced models. Standalone starts and explicit `run retry` use current
authoring settings. Packet retries keep their frozen definition; frontier-created
epic children inherit the parent's active frozen definition. Roster revisions
change cognition. Policy revisions change gates and budgets, never the selected
profile or roster.

## Never

- Do not edit `state.db` or a frozen package to change cognition.
- Do not put gateway URLs, API keys, or credentials in Forged config.
- Do not claim a custom model works because definition validation passed.
- Do not invent model or tool pricing.
- Do not weaken a read-only role to satisfy a validator error.
