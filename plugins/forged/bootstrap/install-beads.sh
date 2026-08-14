#!/usr/bin/env bash
# SPDX-License-Identifier: LicenseRef-MIT-OpenAI-Anthropic-Rider
# License text: see ../LICENSE in this plugin package.
# Stand up an operator-scoped Beads store without touching a target repo.

set -euo pipefail

ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
export ANVIL_HOME
export BEADS_DIR="${BEADS_DIR:-$ANVIL_HOME/beads}"

BD_BIN="${BD_BIN:-}"
if [[ -z "$BD_BIN" ]]; then
  BD_BIN="$(command -v bd || true)"
fi
if [[ -z "$BD_BIN" ]]; then
  echo "forged setup: ERROR — bd 1.2.1 is required on PATH or in BD_BIN" >&2
  exit 1
fi

version="$("$BD_BIN" --version 2>&1 || true)"
if [[ ! "$version" =~ (^|[[:space:]])1\.2\.1([[:space:]]|$) ]]; then
  echo "forged setup: ERROR — expected bd 1.2.1, got: $version" >&2
  exit 1
fi

mkdir -p "$ANVIL_HOME" "$BEADS_DIR"

if [[ ! -f "$BEADS_DIR/metadata.json" ]]; then
  (
    cd "$BEADS_DIR"
    env BEADS_DIR="$BEADS_DIR" "$BD_BIN" init \
      --init-if-missing --non-interactive --skip-agents --skip-hooks
  )
fi

echo "forged setup: ANVIL_HOME=$ANVIL_HOME"
echo "forged setup: BEADS_DIR=$BEADS_DIR"
env BEADS_DIR="$BEADS_DIR" "$BD_BIN" where --json
env BEADS_DIR="$BEADS_DIR" "$BD_BIN" ready --json >/dev/null

cat <<EOF

Operator-scoped Beads state is ready.

Persist these exact values for lead agents and Forged:
  export ANVIL_HOME="$ANVIL_HOME"
  export BEADS_DIR="$BEADS_DIR"

The plugin never passes repository-routing options to the issue creation
command. New work must set metadata.repository to the target repo's canonical
absolute root while keeping all Beads state in the operator store above.
EOF
