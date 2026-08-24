#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 || $# -gt 4 ]]; then
  echo "usage: $0 <archive-url> <sha256> <install-dir> [expected-version]" >&2
  exit 2
fi

archive_url=$1
archive_sha=$2
install_dir=$3
expected_version=${4:-}
archive_sha=$(printf '%s' "$archive_sha" | tr '[:upper:]' '[:lower:]')

if [[ ! $archive_sha =~ ^[[:xdigit:]]{64}$ ]]; then
  echo "bd archive SHA-256 is missing or malformed" >&2
  exit 1
fi
if [[ $install_dir != /* ]]; then
  echo "bd install directory must be absolute: $install_dir" >&2
  exit 1
fi

mkdir -p "$install_dir"
install_dir=$(cd "$install_dir" && pwd -P)
archive="$install_dir/beads.tar.gz"
bd_path="$install_dir/bd"
if [[ -e $archive || -e $bd_path ]]; then
  echo "bd install directory is not fresh: $install_dir" >&2
  exit 1
fi

curl --fail --location --silent --show-error "$archive_url" --output "$archive"
printf '%s  %s\n' "$archive_sha" "$archive" | sha256sum --check -
echo "Verified bd archive SHA-256: $archive_sha"

tar -xzf "$archive" -C "$install_dir" bd
if [[ ! -f $bd_path || ! -x $bd_path ]]; then
  echo "verified archive did not contain an executable root bd" >&2
  exit 1
fi

version_home="$install_dir/version-home"
version_store="$install_dir/version-beads"
mkdir -p "$version_home" "$version_store"
version_json=$(
  env -i \
    PATH=/usr/bin:/bin \
    HOME="$version_home" \
    BEADS_DIR="$version_store" \
    BD_JSON_ENVELOPE=1 \
    TMPDIR="${RUNNER_TEMP:-/tmp}" \
    "$bd_path" version --json
)
echo "Sandboxed bd version evidence: $version_json"
observed_version=$(jq -er '(.data.version // .version) | select(type == "string" and length > 0)' <<<"$version_json")
if [[ -n $expected_version && $observed_version != "$expected_version" ]]; then
  echo "bd version mismatch: observed $observed_version, expected $expected_version" >&2
  exit 1
fi

if [[ -n ${GITHUB_OUTPUT:-} ]]; then
  printf 'path=%s\nversion=%s\nsha256=%s\n' \
    "$bd_path" "$observed_version" "$archive_sha" >>"$GITHUB_OUTPUT"
fi
