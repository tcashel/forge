---
name: configure
description: "Guide the operator through Forged profile, roster, and pricing configuration: choose a model and reasoning effort for each roster role, name custom or gateway-routed models correctly, price token-only models, and validate the result. Use when the operator asks which model belongs in a role, wants to change the roster or profile, uses a custom model name from an inference provider or AI gateway, or invokes /forged:configure."
---

# /forged:configure

Author the cognitive configuration Forged freezes into new work: which roles
exist per assurance profile, and which provider/model answers each role. All
edits target the operator authoring config; compiled snapshots in `state.db`
are runtime truth, so a config change affects only work started after it.
Changing the roster of already-running work is a typed lifecycle operation
(`epic revise-roster` / `run revise-roster`) owned by `../manage-work/SKILL.md`,
never a config edit.

## Boundaries

- The authoring config is `$ANVIL_HOME/config.yaml` (default
  `~/.anvil/config.yaml`; `FORGED_CONFIG` overrides; `.json` is accepted).
- This skill edits profiles, rosters, defaults, and pricing in that file only.
  It never touches `state.db`, target repositories, provider credentials, or
  the service manifest.
- `forged definition validate` is the acceptance gate; an edit is not done
  until it passes.
- Provider CLIs own routing and authentication. Pointing a provider at an
  inference gateway happens in that provider's own configuration, not here.
- Never invent a price. A model without a rate-card entry reports unknown
  cost, which is correct until the operator supplies real rates.

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

A set `FORGED_CONFIG` is authoritative even when the file it names does not
exist yet — Forged never falls back past it, so neither may this skill: edit
the named path, never a legacy `config.json` beside it.

If no config exists yet, route to `../setup/SKILL.md` first — `forged init`
writes the commented default document; this skill refines it.

## The two documents, and which one the operator means

**Profiles** describe cognitive topology — which seats exist and how many
review rounds run. They never name a model. The defaults are `lean` (one
review, zero fix rounds, escalates to `standard` on gate failure), `standard`
(one review, one fix round), and `high` (three reviews plus synthesis, for
consequential changes). Most operators keep these and only choose between
them at dispatch time.

**Rosters** map semantic roles to ordered provider candidates. This is where
model names, reasoning effort, and budget live. "Use a cheaper model", "swap
in my gateway model", and "which model should review?" are all roster edits.

`default_profile` and `default_roster` select what dispatch uses when the
operator names nothing.

## Choose a model per role

A roster must fill these roles. Match capability to what the seat actually
does; the roster is the budget dial, so spend intelligence where it changes
the outcome:

| Role | Sandbox | What it needs |
| --- | --- | --- |
| `implementation` | workspaceWrite | The strongest coding model affordable — it writes the change and consumes most tokens. |
| `remediation` | workspaceWrite | Same tier as implementation, or one step down; it applies review findings, it does not redesign. |
| `review.primary` | readOnly | Strong reasoning at high effort; finding real defects is the whole job. |
| `review.secondary` | readOnly | A **different provider family** from primary — cross-family disagreement is the signal the profile pays for. |
| `review.tertiary` | readOnly | Used by `high` only; a third perspective, commonly the primary family at high effort. |
| `synthesis` | readOnly | Adjudicates conflicting findings; strong reasoning, low volume — effort matters more than speed. |
| `assessment` | readOnly | Fast and cheap; it is the rolling-epic monitor that reads state between waves. Correctness of judgment, not depth. |

Two layers of hard rules apply, enforced at different moments — design to
both rather than discovering them:

**`forged definition validate` proves shape.** Every role a profile seat
names must exist with a non-empty candidate list, identifiers must be
printable, and sandbox must agree with capabilities: `readOnly` forbids
`repositoryWrite`, `workspaceWrite` requires it. Ordering within a role is
meaningful: earlier candidates are preferred.

**Rolling-epic rules are enforced only when the epic starts.** A roster
that passes validation can still be refused at submission, and no CLI
probe checks these earlier — never tell the operator validation covered
them. Design to them upfront:

- A dedicated `assessment` role whose every candidate is read-only
  (`readOnly` sandbox, `repositoryRead` + `structuredOutput`, no
  `repositoryWrite`) with provider `claude`, `codex`, or `pi`.
- Read-only critique candidates — review and synthesis roles.
- No assessment candidate may overlap any critique candidate; reusing a
  review model for assessment is rejected at epic start.

Candidate shape (camelCase keys, unknown fields rejected):

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

`effort` is optional and provider-specific; leave it absent where the
provider does not accept one:

- **codex** — passed as `model_reasoning_effort`. Use `xhigh` for review and
  synthesis seats, lower tiers for cheap seats.
- **pi** — passed as `--thinking`; the closed set is
  `off|minimal|low|medium|high|xhigh|max`. Anything else fails the packet.
- **claude** — the adapter passes no effort flag; the model name alone
  selects capability. Omit `effort`.

## Custom model names, inference providers, and AI gateways

The `model` string is passed verbatim to the provider CLI (`claude --model`,
`codex -m`, `pi --model`). Forged validates only the charset
(`^[A-Za-z0-9][A-Za-z0-9._:/-]*$` — gateway ids like `org/model:tag` and
`us.anthropic.claude-...` pass) and never checks that the model exists.
That split means:

1. **Route in the provider, name in the roster.** The gateway or alternate
   endpoint is configured where the provider CLI reads its own settings —
   for codex that home directory is selected by the `codex_home` config key.
   The roster then names whatever model id the gateway expects.
2. **Prove the name before trusting a dispatch to it.** Run the provider CLI
   once by hand with the exact string; a wrong model id should fail a
   one-line probe, not the first packet of a run.
3. **Keep the name stable.** The roster string keys usage rows and the rate
   card; renaming a model orphans its pricing entry.

## Price what the provider will not

Claude reports billed `costUSD` and is stored verbatim — never add claude
models to the card. Token-only providers (codex, gateway-routed models that
report tokens) are imputed from `pricing.models`, keyed by the **exact
roster model string**. A model with no entry keeps `cost_usd: null`, counts
in `rowsMissingCost`, and raises `missing-cost` attention — that is honest,
not broken; resolve it by adding real rates or explicitly accepting
`accepted-unknown`.

A `pricing` block **replaces** the built-in card wholesale — it is one
complete document, never merged with the defaults. Carry forward entries
for every token-only model the rosters still name, and include the required
`tools` rates; omitting either loses pricing or fails the parse:

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
      # long: only for models publishing a second tier
    # ...plus an entry for every other token-only model the rosters name
```

The context window is required — it is what makes the long-context tier
decision provable. Transcribe rates from the provider's published pricing
and record the date and source; the overview surfaces a stale card rather
than hiding it.

## Apply and verify

Edit the file, then:

```bash
forged definition validate
forged doctor
```

Report the resolved defaults, each role's chosen candidate with one line of
why, and any model left unpriced. State plainly that already-started work
keeps its frozen snapshot and new starts pick up the change.

## Never

- Never edit `state.db` or a frozen package to change models; use the typed
  roster-revision operations for live work.
- Never put gateway URLs, API keys, or credentials in the Forged config.
- Never claim a custom model works because validation passed — validation
  proves shape, not that the provider can reach the model.
- Never seed a rate card entry from memory of a price; only from a source
  the operator names.
- Never weaken a read-only role to workspaceWrite to satisfy a validator
  error — the error means the role is on the wrong side of the boundary.
