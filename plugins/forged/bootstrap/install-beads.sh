#!/usr/bin/env bash
# SPDX-License-Identifier: LicenseRef-MIT-OpenAI-Anthropic-Rider
# License text: see ../LICENSE in this plugin package.
# Validate the operator's existing bd and stand up an operator-scoped Beads
# store without installing/upgrading tools or touching a target repo.

set -euo pipefail

ANVIL_HOME="${ANVIL_HOME:-$HOME/.anvil}"
export ANVIL_HOME
export BEADS_DIR="${BEADS_DIR:-$ANVIL_HOME/beads}"

BD_REQUEST="${BD_BIN:-bd}"
case "$BD_REQUEST" in
  /*) BD_BIN="$BD_REQUEST" ;;
  */*)
    echo "forged setup: ERROR — BD_BIN must be absolute or a command on PATH" >&2
    exit 1
    ;;
  *) BD_BIN="$(command -v "$BD_REQUEST" || true)" ;;
esac
if [[ -z "$BD_BIN" ]]; then
  echo "forged setup: ERROR — bd >=1.2.1 is required on PATH or in BD_BIN" >&2
  exit 1
fi
BD_DIR="$(cd "$(dirname "$BD_BIN")" && pwd -P)"
BD_BIN="$BD_DIR/$(basename "$BD_BIN")"
export BD_BIN

version="$("$BD_BIN" --version 2>&1 || true)"
semver_re='(^|[[:space:]])([0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?)([[:space:]]|$)'
if [[ ! "$version" =~ $semver_re ]]; then
  echo "forged setup: ERROR — expected bd semver >=1.2.1, got: $version" >&2
  exit 1
fi
semver="${BASH_REMATCH[2]}"
without_build="${semver%%+*}"
core="${without_build%%-*}"
prerelease=""
if [[ "$without_build" == *-* ]]; then
  prerelease="-${without_build#*-}"
fi
IFS=. read -r major_raw minor_raw patch_raw <<<"$core"
for component in "$major_raw" "$minor_raw" "$patch_raw"; do
  if [[ ${#component} -gt 1 && "$component" == 0* ]]; then
    echo "forged setup: ERROR — expected bd semver >=1.2.1, got: $version" >&2
    exit 1
  fi
done
if [[ -n "$prerelease" ]]; then
  IFS=. read -r -a prerelease_parts <<<"${prerelease#-}"
  for identifier in "${prerelease_parts[@]}"; do
    if [[ "$identifier" =~ ^[0-9]+$ && ${#identifier} -gt 1 && "$identifier" == 0* ]]; then
      echo "forged setup: ERROR — expected bd semver >=1.2.1, got: $version" >&2
      exit 1
    fi
  done
fi
major=$((10#$major_raw))
minor=$((10#$minor_raw))
patch=$((10#$patch_raw))
supported=0
if (( major > 1 )); then
  supported=1
elif (( major == 1 && minor > 2 )); then
  supported=1
elif (( major == 1 && minor == 2 && patch > 1 )); then
  supported=1
elif (( major == 1 && minor == 2 && patch == 1 )) && [[ -z "$prerelease" ]]; then
  supported=1
fi
if (( supported == 0 )); then
  echo "forged setup: ERROR — expected bd >=1.2.1, got: $version" >&2
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
  export BD_BIN="$BD_BIN"

The plugin never passes repository-routing options to the issue creation
command. New work must set metadata.repository to the target repo's canonical
absolute root while keeping all Beads state in the operator store above.
EOF
