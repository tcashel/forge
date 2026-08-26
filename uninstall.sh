#!/bin/sh
# Remove only an installer-managed Forge distribution.

set -eu

PROGRAM=forge-uninstall
PREFIX=${HOME:+$HOME/.local}
FORCE=0

usage() {
    cat <<'EOF'
Usage: uninstall.sh [--prefix PATH] [--force]

Remove the Forge distribution under PATH. The default prefix is $HOME/.local.

  --prefix PATH  Uninstall from PATH/{bin,share}.
  --force        Remove exact foreign install-path collisions.
  -h, --help     Show this help.

Operator state, Beads, configuration, repositories, agent-host registrations,
dependencies, and service runtime history are always preserved.
EOF
}

die() {
    printf '%s: error: %s\n' "$PROGRAM" "$*" >&2
    exit 1
}

on_signal() {
    trap - HUP INT TERM
    exit 130
}

defer_interrupts() {
    # Ignore interrupts only while the exact managed tree/link is removed or
    # restored, so the uninstall transaction cannot be stranded halfway through.
    trap '' HUP INT TERM
}

restore_interrupts() {
    trap on_signal HUP INT TERM
}

trap on_signal HUP INT TERM

while [ "$#" -gt 0 ]; do
    case "$1" in
        --prefix)
            [ "$#" -ge 2 ] || die "--prefix requires a path"
            PREFIX=$2
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

ANVIL_ROOT=${ANVIL_HOME:-${HOME:+$HOME/.anvil}}
if [ -n "$ANVIL_ROOT" ]; then
    SERVICE_MANIFEST=$ANVIL_ROOT/runtime/manifest.json
    if [ -e "$SERVICE_MANIFEST" ] || [ -L "$SERVICE_MANIFEST" ]; then
        die "the macOS Forge service still has a runtime manifest at $SERVICE_MANIFEST; run 'forged service uninstall' with the same ANVIL_HOME before removing Forge"
    fi
fi

SHARE_DIR=$PREFIX/share
BIN_DIR=$PREFIX/bin
INSTALL_ROOT=$SHARE_DIR/forge
INSTALL_BINARY=$INSTALL_ROOT/bin/forged
LINK_PATH=$BIN_DIR/forged
MARKER=$INSTALL_ROOT/.forge-install

if command -v sha256sum >/dev/null 2>&1; then
    hash_file() { sha256sum "$1" | awk '{print $1}'; }
elif command -v shasum >/dev/null 2>&1; then
    hash_file() { shasum -a 256 "$1" | awk '{print $1}'; }
else
    hash_file() { return 1; }
fi

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
    marker_binary_sha=$(marker_value binary_sha256 "$MARKER") || return 1
    [ "$marker_schema" = forge-install/1 ] || return 1
    [ "$marker_prefix" = "$PREFIX" ] || return 1
    [ "$marker_version" = "$(sed -n '1p' "$INSTALL_ROOT/VERSION" 2>/dev/null)" ] || return 1
    [ "$marker_target" = "$(sed -n '1p' "$INSTALL_ROOT/TARGET" 2>/dev/null)" ] || return 1
    installed_binary_sha=$(hash_file "$INSTALL_BINARY" 2>/dev/null | tr 'A-F' 'a-f') || return 1
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
        die "$INSTALL_ROOT is not an intact installer-managed Forge tree; use --force to remove that exact path"
    fi
fi

link_exists=0
link_exact=0
if [ -e "$LINK_PATH" ] || [ -L "$LINK_PATH" ]; then
    link_exists=1
    [ -d "$BIN_DIR" ] && [ ! -L "$BIN_DIR" ] || die "$BIN_DIR is not a regular directory"
    if [ -L "$LINK_PATH" ] && [ "$(readlink "$LINK_PATH")" = "$INSTALL_BINARY" ]; then
        link_exact=1
    elif [ -d "$LINK_PATH" ] && [ ! -L "$LINK_PATH" ]; then
        die "$LINK_PATH is a directory; refusing to remove it"
    elif [ "$FORCE" -ne 1 ]; then
        die "$LINK_PATH is not Forge's exact managed symlink; use --force to remove that exact file or symlink"
    fi
fi

if [ "$root_exists" -eq 0 ] && [ "$link_exists" -eq 0 ]; then
    printf 'Forge is already uninstalled from %s\n' "$PREFIX"
    if [ -n "$ANVIL_ROOT" ]; then
        printf 'Preserved operator state under %s\n' "$ANVIL_ROOT"
    fi
    exit 0
fi

# Without --force, an orphan exact link is removable only when its managed tree
# was present and validated during this invocation.
if [ "$FORCE" -ne 1 ] && [ "$link_exists" -eq 1 ] && [ "$root_managed" -ne 1 ]; then
    die "$LINK_PATH has no intact managed Forge tree; use --force to remove that exact symlink"
fi

defer_interrupts
BACKUP=
if [ "$root_exists" -eq 1 ]; then
    [ -d "$SHARE_DIR" ] && [ ! -L "$SHARE_DIR" ] || die "$SHARE_DIR is not a regular directory"
    BACKUP=$SHARE_DIR/.forge-uninstall.$$
    [ ! -e "$BACKUP" ] && [ ! -L "$BACKUP" ] || die "temporary uninstall path already exists: $BACKUP"
    if ! mv "$INSTALL_ROOT" "$BACKUP"; then
        restore_interrupts
        die "cannot stage $INSTALL_ROOT for removal"
    fi
fi

if [ "$link_exists" -eq 1 ]; then
    if ! rm -f "$LINK_PATH"; then
        if [ -n "$BACKUP" ]; then
            mv "$BACKUP" "$INSTALL_ROOT" 2>/dev/null || true
        fi
        restore_interrupts
        die "cannot remove $LINK_PATH; the Forge tree was restored"
    fi
fi

if [ -n "$BACKUP" ]; then
    if ! rm -rf "$BACKUP"; then
        restore_interrupts
        die "could not finish removing the staged Forge tree at $BACKUP"
    fi
fi
restore_interrupts

printf 'Uninstalled Forge from %s\n' "$PREFIX"
if [ -n "$ANVIL_ROOT" ]; then
    printf 'Preserved operator state under %s\n' "$ANVIL_ROOT"
fi
printf 'Agent-host plugin registrations and external dependencies were not changed.\n'
