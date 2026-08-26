#!/bin/sh
# Install a verified Forge release without configuring the host.

set -eu

PROGRAM=forge-install
REPOSITORY=tcashel/forge
RELEASES_URL=${FORGE_RELEASES_URL:-https://github.com/$REPOSITORY/releases}
PREFIX=${HOME:+$HOME/.local}
REQUESTED_VERSION=latest
LOCAL_ARCHIVE=
FORCE=0
WORK_DIR=
STAGE_PARENT=

usage() {
    cat <<'EOF'
Usage: install.sh [--prefix PATH] [--version VERSION] [--archive FILE] [--force]

Install a verified Forge release. The default prefix is $HOME/.local.

  --prefix PATH      Install under PATH/{bin,share}.
  --version VERSION  Install vVERSION instead of the latest release.
  --archive FILE     Install a local archive; requires adjacent SHA256SUMS.
  --force            Replace exact foreign install-path collisions.
  -h, --help         Show this help.

This script does not use sudo, edit shell profiles, register agent plugins,
initialize operator state, install dependencies, or manage services.
EOF
}

die() {
    printf '%s: error: %s\n' "$PROGRAM" "$*" >&2
    exit 1
}

warn() {
    printf '%s: warning: %s\n' "$PROGRAM" "$*" >&2
}

cleanup() {
    if [ -n "$STAGE_PARENT" ] && [ -d "$STAGE_PARENT" ]; then
        rm -rf "$STAGE_PARENT"
    fi
    if [ -n "$WORK_DIR" ] && [ -d "$WORK_DIR" ]; then
        rm -rf "$WORK_DIR"
    fi
}

on_signal() {
    trap - HUP INT TERM
    exit 130
}

defer_interrupts() {
    # Ignore interrupts only while the old tree/link is restored or replaced,
    # so the exact live-tree transaction cannot be stranded halfway through.
    trap '' HUP INT TERM
}

restore_interrupts() {
    trap on_signal HUP INT TERM
}

trap cleanup 0
trap on_signal HUP INT TERM

while [ "$#" -gt 0 ]; do
    case "$1" in
        --prefix)
            [ "$#" -ge 2 ] || die "--prefix requires a path"
            PREFIX=$2
            shift 2
            ;;
        --version)
            [ "$#" -ge 2 ] || die "--version requires a value"
            REQUESTED_VERSION=$2
            shift 2
            ;;
        --archive)
            [ "$#" -ge 2 ] || die "--archive requires a file"
            LOCAL_ARCHIVE=$2
            shift 2
            ;;
        --force)
            FORCE=1
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        --)
            shift
            break
            ;;
        *)
            die "unknown argument: $1"
            ;;
    esac
done
[ "$#" -eq 0 ] || die "unexpected positional arguments"

[ -n "$PREFIX" ] || die "HOME is unset; pass an absolute --prefix"
case "$PREFIX" in
    /*) ;;
    *) die "prefix must be absolute: $PREFIX" ;;
esac
[ "$PREFIX" != / ] || die "refusing the filesystem root as a prefix"
case "$PREFIX" in
    */|*//*|*/./*|*/.|*/../*|*/..)
        die "prefix must be lexically normalized (no //, trailing /, ., or .. components): $PREFIX"
        ;;
    *'
'*) die "prefix must not contain a newline" ;;
esac

case "$REQUESTED_VERSION" in
    latest) EXPECTED_VERSION= ; RELEASE_PATH=latest/download ;;
    v*) EXPECTED_VERSION=${REQUESTED_VERSION#v}; RELEASE_PATH=download/v$EXPECTED_VERSION ;;
    *) EXPECTED_VERSION=$REQUESTED_VERSION; RELEASE_PATH=download/v$EXPECTED_VERSION ;;
esac
if [ -n "$EXPECTED_VERSION" ]; then
    case "$EXPECTED_VERSION" in
        ''|*[!0-9A-Za-z._-]*) die "unsafe version: $REQUESTED_VERSION" ;;
    esac
fi

host_target() {
    host_os=$(uname -s 2>/dev/null || true)
    host_arch=$(uname -m 2>/dev/null || true)
    case "$host_os:$host_arch" in
        Darwin:arm64|Darwin:aarch64) printf '%s\n' aarch64-apple-darwin ;;
        Darwin:x86_64|Darwin:amd64) printf '%s\n' x86_64-apple-darwin ;;
        Linux:aarch64|Linux:arm64) printf '%s\n' aarch64-unknown-linux-gnu ;;
        Linux:x86_64|Linux:amd64) printf '%s\n' x86_64-unknown-linux-gnu ;;
        *) die "unsupported host: $host_os $host_arch" ;;
    esac
}

TARGET=$(host_target)
ASSET=forge-$TARGET.tar.gz

command -v tar >/dev/null 2>&1 || die "tar is required"
if command -v sha256sum >/dev/null 2>&1; then
    hash_file() { sha256sum "$1" | awk '{print $1}'; }
elif command -v shasum >/dev/null 2>&1; then
    hash_file() { shasum -a 256 "$1" | awk '{print $1}'; }
else
    die "sha256sum or shasum is required"
fi

WORK_DIR=$(mktemp -d "${TMPDIR:-/tmp}/forge-install.XXXXXX") || die "cannot create a temporary directory"
LIST_FILE=$WORK_DIR/archive.list
VERBOSE_FILE=$WORK_DIR/archive.verbose
EXTRACT_DIR=$WORK_DIR/extract
mkdir "$EXTRACT_DIR"

if [ -n "$LOCAL_ARCHIVE" ]; then
    [ -f "$LOCAL_ARCHIVE" ] || die "archive not found: $LOCAL_ARCHIVE"
    archive_dir=$(dirname "$LOCAL_ARCHIVE")
    archive_base=$(basename "$LOCAL_ARCHIVE")
    archive_dir=$(cd "$archive_dir" 2>/dev/null && pwd -P) || die "cannot resolve archive directory"
    ARCHIVE=$archive_dir/$archive_base
    SUMS=$archive_dir/SHA256SUMS
    [ -f "$SUMS" ] || die "local archive requires $SUMS"
else
    command -v curl >/dev/null 2>&1 || die "curl is required for release downloads"
    ARCHIVE=$WORK_DIR/$ASSET
    SUMS=$WORK_DIR/SHA256SUMS
    base_url=$RELEASES_URL/$RELEASE_PATH
    curl -fL --retry 3 --connect-timeout 15 -o "$SUMS" "$base_url/SHA256SUMS" \
        || die "could not download SHA256SUMS"
    curl -fL --retry 3 --connect-timeout 15 -o "$ARCHIVE" "$base_url/$ASSET" \
        || die "could not download $ASSET"
    archive_base=$ASSET
fi

EXPECTED_SHA=$(awk -v name="$archive_base" '
    $2 == name { value=$1; count++ }
    END { if (count != 1) exit 1; print value }
' "$SUMS") || die "SHA256SUMS must contain exactly one entry for $archive_base"
EXPECTED_SHA=$(printf '%s' "$EXPECTED_SHA" | tr 'A-F' 'a-f')
case "$EXPECTED_SHA" in
    *[!0-9a-f]*) die "invalid SHA-256 for $archive_base" ;;
esac
[ "${#EXPECTED_SHA}" -eq 64 ] || die "invalid SHA-256 for $archive_base"
ACTUAL_SHA=$(hash_file "$ARCHIVE" | tr 'A-F' 'a-f')
[ "$ACTUAL_SHA" = "$EXPECTED_SHA" ] \
    || die "checksum mismatch for $archive_base (expected $EXPECTED_SHA, got $ACTUAL_SHA)"

tar -tzf "$ARCHIVE" >"$LIST_FILE" || die "cannot list $archive_base"
[ -s "$LIST_FILE" ] || die "archive is empty"
while IFS= read -r entry; do
    case "$entry" in
        forge/|forge/*) ;;
        *) die "unsafe archive entry outside forge/: $entry" ;;
    esac
    case "$entry" in
        ../*|*/../*|*/..|./*|*/./*|*/.|*'//'*) die "unsafe archive path: $entry" ;;
    esac
    [ "$entry" != forge/.forge-install ] || die "archive contains installer-owned marker"
done <"$LIST_FILE"
DUPLICATES=$(sort "$LIST_FILE" | uniq -d)
[ -z "$DUPLICATES" ] || die "archive contains duplicate paths"

tar -tvzf "$ARCHIVE" >"$VERBOSE_FILE" || die "cannot inspect $archive_base"
while IFS= read -r entry; do
    entry_type=$(printf '%.1s' "$entry")
    case "$entry_type" in
        -|d) ;;
        *) die "archive contains a link or special file" ;;
    esac
done <"$VERBOSE_FILE"

tar -xzf "$ARCHIVE" -C "$EXTRACT_DIR" || die "cannot extract $archive_base"
PAYLOAD=$EXTRACT_DIR/forge
[ -d "$PAYLOAD" ] && [ ! -L "$PAYLOAD" ] || die "archive has no regular forge/ directory"
for required in \
    VERSION \
    TARGET \
    bin/forged \
    .agents/plugins/marketplace.json \
    .claude-plugin/marketplace.json \
    package.json \
    plugins/forged/.claude-plugin/plugin.json \
    plugins/forged/.codex-plugin/plugin.json \
    LICENSE
do
    [ -f "$PAYLOAD/$required" ] && [ ! -L "$PAYLOAD/$required" ] \
        || die "archive is missing regular forge/$required"
done
[ -x "$PAYLOAD/bin/forged" ] || die "forge/bin/forged is not executable"

PAYLOAD_VERSION=$(sed -n '1p' "$PAYLOAD/VERSION")
PAYLOAD_TARGET=$(sed -n '1p' "$PAYLOAD/TARGET")
[ -n "$PAYLOAD_VERSION" ] || die "forge/VERSION is empty"
case "$PAYLOAD_VERSION" in
    *[!0-9A-Za-z._-]*) die "forge/VERSION is unsafe: $PAYLOAD_VERSION" ;;
esac
[ "$PAYLOAD_TARGET" = "$TARGET" ] \
    || die "archive target $PAYLOAD_TARGET does not match host target $TARGET"
if [ -n "$EXPECTED_VERSION" ]; then
    [ "$PAYLOAD_VERSION" = "$EXPECTED_VERSION" ] \
        || die "archive version $PAYLOAD_VERSION does not match requested $EXPECTED_VERSION"
fi
VERSION_OUTPUT=$("$PAYLOAD/bin/forged" --version) \
    || die "downloaded forged binary could not report its version"
[ "$VERSION_OUTPUT" = "forged $PAYLOAD_VERSION" ] \
    || die "binary version $VERSION_OUTPUT does not match forge/VERSION $PAYLOAD_VERSION"
PAYLOAD_BINARY_SHA=$(hash_file "$PAYLOAD/bin/forged" | tr 'A-F' 'a-f')

SHARE_DIR=$PREFIX/share
BIN_DIR=$PREFIX/bin
INSTALL_ROOT=$SHARE_DIR/forge
INSTALL_BINARY=$INSTALL_ROOT/bin/forged
LINK_PATH=$BIN_DIR/forged
MARKER=$INSTALL_ROOT/.forge-install

marker_value() {
    marker_key=$1
    marker_file=$2
    awk -v key="$marker_key" '
        index($0, key "=") == 1 { sub(/^[^=]*=/, ""); value=$0; count++ }
        END { if (count != 1) exit 1; print value }
    ' "$marker_file"
}

managed_install() {
    [ -d "$INSTALL_ROOT" ] && [ ! -L "$INSTALL_ROOT" ] || return 1
    [ -f "$MARKER" ] && [ ! -L "$MARKER" ] || return 1
    [ -f "$INSTALL_BINARY" ] && [ ! -L "$INSTALL_BINARY" ] || return 1
    marker_schema=$(marker_value schema "$MARKER") || return 1
    marker_prefix=$(marker_value prefix "$MARKER") || return 1
    marker_version=$(marker_value version "$MARKER") || return 1
    marker_target=$(marker_value target "$MARKER") || return 1
    marker_archive_sha=$(marker_value archive_sha256 "$MARKER") || return 1
    marker_binary_sha=$(marker_value binary_sha256 "$MARKER") || return 1
    [ "$marker_schema" = forge-install/1 ] || return 1
    [ "$marker_prefix" = "$PREFIX" ] || return 1
    [ "$marker_target" = "$(sed -n '1p' "$INSTALL_ROOT/TARGET" 2>/dev/null)" ] || return 1
    [ "$marker_version" = "$(sed -n '1p' "$INSTALL_ROOT/VERSION" 2>/dev/null)" ] || return 1
    installed_binary_sha=$(hash_file "$INSTALL_BINARY" | tr 'A-F' 'a-f') || return 1
    [ "$marker_binary_sha" = "$installed_binary_sha" ] || return 1
    return 0
}

root_exists=0
root_managed=0
if [ -e "$INSTALL_ROOT" ] || [ -L "$INSTALL_ROOT" ]; then
    root_exists=1
    if managed_install; then
        root_managed=1
    elif [ "$FORCE" -ne 1 ]; then
        die "$INSTALL_ROOT exists but is not an intact installer-managed Forge tree; use --force to replace that exact path"
    fi
fi

link_exists=0
link_exact=0
if [ -e "$LINK_PATH" ] || [ -L "$LINK_PATH" ]; then
    link_exists=1
    if [ -L "$LINK_PATH" ] && [ "$(readlink "$LINK_PATH")" = "$INSTALL_BINARY" ]; then
        link_exact=1
    elif [ -d "$LINK_PATH" ] && [ ! -L "$LINK_PATH" ]; then
        die "$LINK_PATH is a directory; refusing to replace it"
    elif [ "$FORCE" -ne 1 ]; then
        die "$LINK_PATH is a foreign collision; use --force to replace that exact file or symlink"
    fi
fi

same_release=0
if [ "$root_managed" -eq 1 ] \
    && [ "$marker_archive_sha" = "$ACTUAL_SHA" ] \
    && [ "$marker_version" = "$PAYLOAD_VERSION" ] \
    && [ "$marker_target" = "$TARGET" ]; then
    same_release=1
fi

for parent in "$PREFIX" "$SHARE_DIR" "$BIN_DIR"; do
    if [ -e "$parent" ] || [ -L "$parent" ]; then
        [ -d "$parent" ] && [ ! -L "$parent" ] || die "$parent is not a regular directory"
    else
        mkdir -p "$parent" || die "cannot create $parent"
    fi
done

publish_link() {
    tmp_link=$BIN_DIR/.forged-link.$$
    old_link=$BIN_DIR/.forged-link-backup.$$
    [ ! -e "$tmp_link" ] && [ ! -L "$tmp_link" ] || return 1
    [ ! -e "$old_link" ] && [ ! -L "$old_link" ] || return 1
    ln -s "$INSTALL_BINARY" "$tmp_link" || return 1
    if [ -e "$LINK_PATH" ] || [ -L "$LINK_PATH" ]; then
        if ! mv "$LINK_PATH" "$old_link"; then
            rm -f "$tmp_link"
            return 1
        fi
    fi
    if ! mv "$tmp_link" "$LINK_PATH"; then
        rm -f "$tmp_link"
        if [ -e "$old_link" ] || [ -L "$old_link" ]; then
            mv "$old_link" "$LINK_PATH" 2>/dev/null || true
        fi
        return 1
    fi
    if [ -e "$old_link" ] || [ -L "$old_link" ]; then
        if ! rm -f "$old_link"; then
            warn "installed $LINK_PATH but could not remove temporary backup $old_link"
        fi
    fi
    return 0
}

if [ "$same_release" -eq 1 ]; then
    if [ "$link_exact" -ne 1 ]; then
        defer_interrupts
        if ! publish_link; then
            restore_interrupts
            die "cannot publish $LINK_PATH"
        fi
        restore_interrupts
    fi
    printf 'Forge %s is already installed at %s\n' "$PAYLOAD_VERSION" "$INSTALL_ROOT"
else
    STAGE_PARENT=$(mktemp -d "$SHARE_DIR/.forge-stage.XXXXXX") \
        || die "cannot stage the Forge tree under $SHARE_DIR"
    STAGE_ROOT=$STAGE_PARENT/forge
    cp -R "$PAYLOAD" "$STAGE_ROOT" || die "cannot stage the Forge tree"
    {
        printf 'schema=forge-install/1\n'
        printf 'prefix=%s\n' "$PREFIX"
        printf 'version=%s\n' "$PAYLOAD_VERSION"
        printf 'target=%s\n' "$TARGET"
        printf 'archive_sha256=%s\n' "$ACTUAL_SHA"
        printf 'binary_sha256=%s\n' "$PAYLOAD_BINARY_SHA"
    } >"$STAGE_ROOT/.forge-install" || die "cannot write the install marker"
    chmod 600 "$STAGE_ROOT/.forge-install" || die "cannot protect the install marker"

    defer_interrupts
    BACKUP=
    if [ "$root_exists" -eq 1 ]; then
        BACKUP=$SHARE_DIR/.forge-backup.$$
        [ ! -e "$BACKUP" ] && [ ! -L "$BACKUP" ] || die "backup path already exists: $BACKUP"
        mv "$INSTALL_ROOT" "$BACKUP" || die "cannot stage the existing Forge tree for replacement"
    fi
    if ! mv "$STAGE_ROOT" "$INSTALL_ROOT"; then
        if [ -n "$BACKUP" ]; then
            mv "$BACKUP" "$INSTALL_ROOT" 2>/dev/null || true
        fi
        restore_interrupts
        die "cannot publish $INSTALL_ROOT"
    fi
    if ! publish_link; then
        rm -rf "$INSTALL_ROOT"
        if [ -n "$BACKUP" ]; then
            mv "$BACKUP" "$INSTALL_ROOT" 2>/dev/null || true
        fi
        restore_interrupts
        die "could not publish the forged command; the prior tree was restored"
    fi
    if [ -n "$BACKUP" ]; then
        rm -rf "$BACKUP"
    fi
    rmdir "$STAGE_PARENT" 2>/dev/null || true
    STAGE_PARENT=
    restore_interrupts
    printf 'Installed Forge %s for %s at %s\n' "$PAYLOAD_VERSION" "$TARGET" "$INSTALL_ROOT"
fi

BD_REQUEST=${BD_BIN:-bd}
case "$BD_REQUEST" in
    */*)
        if [ -x "$BD_REQUEST" ]; then
            BD_COMMAND=$BD_REQUEST
        else
            BD_COMMAND=
        fi
        ;;
    *) BD_COMMAND=$(command -v "$BD_REQUEST" 2>/dev/null || true) ;;
esac
if [ -n "$BD_COMMAND" ]; then
    bd_output=$("$BD_COMMAND" --version 2>/dev/null || true)
fi
if [ -n "$BD_COMMAND" ]; then
    bd_version=$(printf '%s\n' "$bd_output" | sed -n 's/[^0-9]*\([0-9][0-9]*\)\.\([0-9][0-9]*\)\.\([0-9][0-9]*\).*/\1.\2.\3/p' | sed -n '1p')
    bd_supported=0
    if [ -n "$bd_version" ]; then
        bd_supported=$(printf '%s\n' "$bd_version" | awk -F. '{ if ($1 > 1 || ($1 == 1 && ($2 > 2 || ($2 == 2 && $3 >= 1)))) print 1; else print 0 }')
        case "$bd_output" in
            *"$bd_version-"*)
                # 1.2.1 prereleases are older than the minimum stable release.
                [ "$bd_version" != 1.2.1 ] || bd_supported=0
                ;;
        esac
    fi
    if [ "$bd_supported" -ne 1 ]; then
        warn "bd 1.2.1 or newer was not detected; install a supported bd before running Forge setup"
    fi
else
    warn "bd was not found on PATH; install bd 1.2.1 or newer before running Forge setup"
fi

case ":${PATH:-}:" in
    *":$BIN_DIR:"*) ;;
    *) warn "$BIN_DIR is not on PATH; add it explicitly before invoking forged" ;;
esac

printf 'Run `forged --version`, register %s with your agent host, then run the Forge setup skill.\n' "$INSTALL_ROOT"
