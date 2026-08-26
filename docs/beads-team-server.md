# Central Beads server

A central Dolt SQL server is an optional Beads deployment, not a Forged
backend. Use it when several people or agent processes need the same specs,
dependency graph, ready frontier, and leases. A single operator or active
epic can keep using its embedded store; enabling this support does **not**
require migrating an existing `$BEADS_DIR`, and an active store should not be
moved mid-run.

The ownership boundary does not change:

- Beads is authoritative for spec bodies, parent/dependency edges, readiness,
  status, assignees, claims, heartbeats, and reclaims.
- Forged keeps execution-only state in its own SQLite ledger: immutable run
  snapshots, attempts, operations, events, artifacts, usage, and controller
  recovery evidence.
- A central Beads database does not replicate or replace the Forged ledger.
  One Forged control plane owns each run; another machine must not try to
  reconstruct that run from Beads alone.

## Fresh team setup

Provision one Dolt SQL server and one database for the team's Beads work. Use
an existing `bd` reporting semver `>=1.2.1` and exposing the required epic and
lease commands; schema and behavior probes remain the compatibility authority.
Resolve an explicit `BD_BIN` first, otherwise the host's `bd` on `PATH`
(substitute the real endpoint and database name):

```sh
export ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
export BEADS_DIR="$ANVIL_HOME/beads-team"
BD_REQUEST="${BD_BIN:-bd}"
case "$BD_REQUEST" in
  /*) export BD_BIN="$BD_REQUEST" ;;
  */*) echo 'BD_BIN must be absolute or a command on PATH' >&2; exit 1 ;;
  *) export BD_BIN="$(command -v "$BD_REQUEST" || true)" ;;
esac
test -n "$BD_BIN" && test -x "$BD_BIN" \
  || { echo 'bd >=1.2.1 is required' >&2; exit 1; }
"$BD_BIN" --version
for capability in heartbeat reclaim merge-slot epic; do
  "$BD_BIN" "$capability" --help >/dev/null 2>&1 \
    || { echo "bd lacks required Forge command: $capability" >&2; exit 1; }
done

mkdir -p "$BEADS_DIR"
(
  cd "$BEADS_DIR"
  env BEADS_DIR="$BEADS_DIR" "$BD_BIN" init \
    --server --external --non-interactive --skip-agents --skip-hooks \
    --server-host beads.team.example --server-port 3307 \
    --server-user forged --database forged_team
)
```

The server user used for initialization needs permission to create and migrate
that database. After bootstrap, use the permissions appropriate for normal bd
reads and writes. Give every cooperating lead/driver an explicit
`BEADS_DIR` whose non-secret metadata names this same endpoint and database.
Do not mix databases within one epic.

Store the password outside Beads metadata. bd supports its default credentials
file (`~/.config/beads/credentials`) or an explicit file:

```ini
[beads.team.example:3307]
password = <team-managed secret>
```

```sh
export BEADS_CREDENTIALS_FILE="$HOME/.config/beads/credentials"
export BEADS_DOLT_SERVER_TLS=1
```

Forged clears the ambient environment for every bd child. It passes through
only the four remote authentication/TLS settings documented by `bd dolt
--help`:

- `BEADS_DOLT_PASSWORD`
- `BEADS_DOLT_SERVER_TLS`
- `BEADS_DOLT_SERVER_USER`
- `BEADS_CREDENTIALS_FILE`

Their values are never included in Forged diagnostics. Prefer the credentials
file over a long-lived password environment variable.

Routing remains metadata-owned. Forged deliberately strips ambient
`BEADS_DB`, `BD_DB`, host, port, socket, server-mode, shared-server, and actor
overrides so a shell cannot silently redirect a run away from its explicit
`BEADS_DIR`. Change host, port, user, or database with Beads configuration
commands against the intended store, not with inherited routing variables.

## Verify before dispatch

Use the same environment that will launch Forged:

```sh
"$BD_BIN" where --json
"$BD_BIN" dolt show --json
"$BD_BIN" ready --json
forged doctor
```

The `beads-dir-resolves` doctor probe must name the explicit workspace,
database, and server mode, and must report the configured endpoint connection
as `connection=ok`. An unreachable server fails that probe. Embedded stores
continue to report `mode=embedded` and their data directory. Passing the
minimum version check alone is insufficient: dispatch only after these schema
and behavior probes pass.
