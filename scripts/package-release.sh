#!/usr/bin/env bash

set -euo pipefail

usage() {
  cat <<'EOF'
usage: scripts/package-release.sh <target> [output-directory]

Package a native forged release build and the shared lead-agent resources as
forge-<target>.tar.gz. FORGE_RELEASE_BINARY may override the binary path.
EOF
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage >&2
  exit 2
fi

target=$1
case "$target" in
  aarch64-apple-darwin | x86_64-apple-darwin | \
    aarch64-unknown-linux-gnu | x86_64-unknown-linux-gnu) ;;
  *)
    echo "package-release: unsupported target: $target" >&2
    exit 2
    ;;
esac

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "$repo_root"

version="$({
  sed -n '/^\[workspace\.package\]$/,/^\[/ {
    s/^version = "\([^"]*\)"$/\1/p
  }' Cargo.toml
} | head -n 1)"
if [[ -z "$version" ]]; then
  echo "package-release: workspace package version is missing" >&2
  exit 1
fi

target_dir=${CARGO_TARGET_DIR:-target}
binary=${FORGE_RELEASE_BINARY:-$target_dir/$target/release/forged}
if [[ ! -x "$binary" ]]; then
  echo "package-release: executable not found: $binary" >&2
  exit 1
fi

reported_version="$($binary --version)"
if [[ "$reported_version" != "forged $version" ]]; then
  echo "package-release: expected 'forged $version', got '$reported_version'" >&2
  exit 1
fi

for required in \
  .agents/plugins/marketplace.json \
  .claude-plugin/marketplace.json \
  package.json \
  plugins/forged \
  LICENSE \
  uninstall.sh; do
  if [[ ! -e "$required" ]]; then
    echo "package-release: required release input is missing: $required" >&2
    exit 1
  fi
done

output_dir=${2:-dist}
mkdir -p "$output_dir"
output_dir="$(cd "$output_dir" && pwd -P)"
asset="forge-$target.tar.gz"
archive="$output_dir/$asset"
if [[ -e "$archive" ]]; then
  echo "package-release: refusing to overwrite $archive" >&2
  exit 1
fi

stage="$(mktemp -d "$output_dir/.forge-package.XXXXXX")"
archive_tmp="$output_dir/.$asset.tmp.$$"
cleanup() {
  rm -rf -- "$stage"
  rm -f -- "$archive_tmp"
}
trap cleanup EXIT

forge_root="$stage/forge"
mkdir -p \
  "$forge_root/.agents/plugins" \
  "$forge_root/.claude-plugin" \
  "$forge_root/bin" \
  "$forge_root/plugins"
install -m 0755 "$binary" "$forge_root/bin/forged"
install -m 0644 .agents/plugins/marketplace.json \
  "$forge_root/.agents/plugins/marketplace.json"
install -m 0644 .claude-plugin/marketplace.json \
  "$forge_root/.claude-plugin/marketplace.json"
cp -R plugins/forged "$forge_root/plugins/forged"
install -m 0644 package.json "$forge_root/package.json"
install -m 0644 LICENSE "$forge_root/LICENSE"
install -m 0755 uninstall.sh "$forge_root/uninstall.sh"
printf '%s\n' "$version" > "$forge_root/VERSION"
printf '%s\n' "$target" > "$forge_root/TARGET"

COPYFILE_DISABLE=1 tar -C "$stage" -czf "$archive_tmp" forge
mv "$archive_tmp" "$archive"

printf '%s\n' "$archive"
