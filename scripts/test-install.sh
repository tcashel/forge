#!/bin/sh
# Isolated integration tests for the release installer and uninstaller.

set -eu

SCRIPT_DIR=$(CDPATH= cd "$(dirname "$0")" && pwd -P)
REPO_ROOT=$(CDPATH= cd "$SCRIPT_DIR/.." && pwd -P)
INSTALLER=$REPO_ROOT/install.sh
UNINSTALLER=$REPO_ROOT/uninstall.sh
REAL_ARCHIVE=${1:-}
REAL_VERSION=${2:-}
REAL_TARGET=${3:-}

fail() {
    printf 'FAIL: %s\n' "$*" >&2
    exit 1
}

pass() {
    printf 'PASS: %s\n' "$*"
}

assert_exists() {
    [ -e "$1" ] || [ -L "$1" ] || fail "expected path to exist: $1"
}

assert_absent() {
    [ ! -e "$1" ] && [ ! -L "$1" ] || fail "expected path to be absent: $1"
}

assert_contains() {
    grep -F "$2" "$1" >/dev/null 2>&1 || fail "$1 does not contain: $2"
}

assert_not_contains() {
    if grep -F "$2" "$1" >/dev/null 2>&1; then
        fail "$1 unexpectedly contains: $2"
    fi
}

expect_failure() {
    if "$@"; then
        fail "command unexpectedly succeeded: $*"
    fi
}

if command -v sha256sum >/dev/null 2>&1; then
    hash_file() { sha256sum "$1" | awk '{print $1}'; }
elif command -v shasum >/dev/null 2>&1; then
    hash_file() { shasum -a 256 "$1" | awk '{print $1}'; }
else
    fail "sha256sum or shasum is required"
fi

host_target() {
    case "$(uname -s):$(uname -m)" in
        Darwin:arm64|Darwin:aarch64) printf '%s\n' aarch64-apple-darwin ;;
        Darwin:x86_64|Darwin:amd64) printf '%s\n' x86_64-apple-darwin ;;
        Linux:aarch64|Linux:arm64) printf '%s\n' aarch64-unknown-linux-gnu ;;
        Linux:x86_64|Linux:amd64) printf '%s\n' x86_64-unknown-linux-gnu ;;
        *) fail "unsupported test host" ;;
    esac
}

TARGET=$(host_target)
TMP_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/forge-install-test.XXXXXX")
TMP_ROOT=$(CDPATH= cd "$TMP_ROOT" && pwd -P)
cleanup() {
    rm -rf "$TMP_ROOT"
}
trap cleanup 0 HUP INT TERM

FAKE_BIN=$TMP_ROOT/fake-bin
mkdir "$FAKE_BIN"
cat >"$FAKE_BIN/bd" <<'EOF'
#!/bin/sh
printf 'bd version 1.2.1 (test)\n'
EOF
chmod +x "$FAKE_BIN/bd"
TEST_PATH=$FAKE_BIN:$PATH

make_release() {
    release_dir=$1
    version=$2
    target=$3
    mkdir -p "$release_dir/tree/forge/bin" \
        "$release_dir/tree/forge/.agents/plugins" \
        "$release_dir/tree/forge/.claude-plugin" \
        "$release_dir/tree/forge/plugins/forged/.claude-plugin" \
        "$release_dir/tree/forge/plugins/forged/.codex-plugin"
    printf '%s\n' "$version" >"$release_dir/tree/forge/VERSION"
    printf '%s\n' "$target" >"$release_dir/tree/forge/TARGET"
    cat >"$release_dir/tree/forge/bin/forged" <<EOF
#!/bin/sh
if [ "\${1:-}" = --version ]; then
    printf 'forged %s\\n' '$version'
    exit 0
fi
printf 'fake forged %s\\n' '$version'
EOF
    chmod +x "$release_dir/tree/forge/bin/forged"
    printf '{"name":"forge"}\n' >"$release_dir/tree/forge/.claude-plugin/marketplace.json"
    printf '{"name":"forge"}\n' >"$release_dir/tree/forge/.agents/plugins/marketplace.json"
    printf '{"name":"forged"}\n' >"$release_dir/tree/forge/plugins/forged/.claude-plugin/plugin.json"
    printf '{"name":"forged"}\n' >"$release_dir/tree/forge/plugins/forged/.codex-plugin/plugin.json"
    printf '{"name":"forged-pi","version":"%s"}\n' "$version" >"$release_dir/tree/forge/package.json"
    printf 'test license\n' >"$release_dir/tree/forge/LICENSE"
    archive=$release_dir/forge-$target.tar.gz
    tar -czf "$archive" -C "$release_dir/tree" forge
    printf '%s  %s\n' "$(hash_file "$archive")" "$(basename "$archive")" \
        >"$release_dir/SHA256SUMS"
    printf '%s\n' "$archive"
}

run_install() {
    anvil=$1
    shift
    env HOME="$TMP_ROOT/home" ANVIL_HOME="$anvil" BEADS_DIR="$BEADS" PATH="$TEST_PATH" \
        sh "$INSTALLER" "$@"
}

run_uninstall() {
    anvil=$1
    shift
    env HOME="$TMP_ROOT/home" ANVIL_HOME="$anvil" BEADS_DIR="$BEADS" PATH="$TEST_PATH" \
        sh "$UNINSTALLER" "$@"
}

mkdir -p "$TMP_ROOT/home"
ANVIL=$TMP_ROOT/operator-state
mkdir -p "$ANVIL"
printf 'preserve me\n' >"$ANVIL/sentinel"
BEADS=$TMP_ROOT/beads-state
mkdir "$BEADS"
printf 'preserve beads\n' >"$BEADS/sentinel"

for bad_prefix in \
    "$TMP_ROOT/trailing/" \
    "$TMP_ROOT/./child" \
    "$TMP_ROOT/child/.." \
    "$TMP_ROOT//double"
do
    expect_failure run_install "$ANVIL" --archive "$TMP_ROOT/not-an-archive" \
        --prefix "$bad_prefix"
    expect_failure run_uninstall "$ANVIL" --prefix "$bad_prefix"
done
pass "install and uninstall reject non-normalized prefixes before mutation"

SYMLINK_TARGET=$TMP_ROOT/symlink-target
SYMLINK_PREFIX=$TMP_ROOT/symlink-prefix
mkdir "$SYMLINK_TARGET"
ln -s "$SYMLINK_TARGET" "$SYMLINK_PREFIX"
expect_failure run_install "$ANVIL" --archive "$TMP_ROOT/not-an-archive" \
    --prefix "$SYMLINK_PREFIX/redirected"
expect_failure run_uninstall "$ANVIL" --prefix "$SYMLINK_PREFIX/redirected"
assert_absent "$SYMLINK_TARGET/redirected"
pass "install and uninstall reject symlinked prefix ancestors before mutation"

RELEASE_ONE=$TMP_ROOT/release-one
ARCHIVE_ONE=$(make_release "$RELEASE_ONE" 9.8.7 "$TARGET")
PREFIX=$TMP_ROOT/missing/'parent with spaces'/prefix
run_install "$ANVIL" --archive "$ARCHIVE_ONE" --version 9.8.7 --prefix "$PREFIX"
assert_exists "$PREFIX/share/forge/.forge-install"
[ -L "$PREFIX/bin/forged" ] || fail "forged command is not a symlink"
[ "$(readlink "$PREFIX/bin/forged")" = "$PREFIX/share/forge/bin/forged" ] \
    || fail "forged symlink has the wrong target"
[ "$("$PREFIX/bin/forged" --version)" = 'forged 9.8.7' ] || fail "installed version mismatch"
assert_exists "$ANVIL/sentinel"
assert_exists "$BEADS/sentinel"
pass "clean install uses the exact prefix layout and preserves operator state"

printf 'same-release no-op\n' >"$PREFIX/share/forge/local-sentinel"
run_install "$ANVIL" --archive "$ARCHIVE_ONE" --version 9.8.7 --prefix "$PREFIX"
assert_exists "$PREFIX/share/forge/local-sentinel"
pass "reinstalling the same release is a no-op"

RELEASE_TWO=$TMP_ROOT/release-two
ARCHIVE_TWO=$(make_release "$RELEASE_TWO" 9.8.8 "$TARGET")
run_install "$ANVIL" --archive "$ARCHIVE_TWO" --version 9.8.8 --prefix "$PREFIX"
[ "$("$PREFIX/bin/forged" --version)" = 'forged 9.8.8' ] || fail "managed upgrade mismatch"
assert_absent "$PREFIX/share/forge/local-sentinel"
pass "recognized managed install upgrades without force"

chmod 500 "$PREFIX/bin"
expect_failure run_install "$ANVIL" --archive "$ARCHIVE_ONE" --version 9.8.7 --prefix "$PREFIX"
chmod 700 "$PREFIX/bin"
[ "$("$PREFIX/bin/forged" --version)" = 'forged 9.8.8' ] \
    || fail "link publication failure did not restore the prior tree"
pass "link publication failure restores the prior managed tree"

CORRUPT=$TMP_ROOT/corrupt
mkdir "$CORRUPT"
cp "$ARCHIVE_ONE" "$CORRUPT/forge-$TARGET.tar.gz"
printf '\ncorrupt\n' >>"$CORRUPT/forge-$TARGET.tar.gz"
printf '%064d  %s\n' 0 "forge-$TARGET.tar.gz" >"$CORRUPT/SHA256SUMS"
expect_failure run_install "$ANVIL" --archive "$CORRUPT/forge-$TARGET.tar.gz" \
    --prefix "$PREFIX"
[ "$("$PREFIX/bin/forged" --version)" = 'forged 9.8.8' ] \
    || fail "corrupt install changed the managed release"
pass "corrupt archive is rejected before replacement"

FOREIGN=$TMP_ROOT/foreign-prefix
mkdir -p "$FOREIGN/share/forge" "$FOREIGN/bin"
printf 'unrelated\n' >"$FOREIGN/share/unrelated"
printf 'foreign tree\n' >"$FOREIGN/share/forge/sentinel"
printf 'foreign command\n' >"$FOREIGN/bin/forged"
expect_failure run_install "$ANVIL" --archive "$ARCHIVE_ONE" --prefix "$FOREIGN"
assert_contains "$FOREIGN/share/forge/sentinel" 'foreign tree'
assert_contains "$FOREIGN/bin/forged" 'foreign command'
run_install "$ANVIL" --archive "$ARCHIVE_ONE" --prefix "$FOREIGN" --force
[ -L "$FOREIGN/bin/forged" ] || fail "force did not replace the exact command collision"
[ "$("$FOREIGN/bin/forged" --version)" = 'forged 9.8.7' ] || fail "forced install mismatch"
assert_exists "$FOREIGN/share/unrelated"
pass "foreign collisions refuse by default and exact force replacement succeeds"

UNSAFE=$TMP_ROOT/unsafe
mkdir -p "$UNSAFE/tree"
cp -R "$RELEASE_ONE/tree/forge" "$UNSAFE/tree/forge"
ln -s /tmp "$UNSAFE/tree/forge/unsafe-link"
UNSAFE_ARCHIVE=$UNSAFE/forge-$TARGET.tar.gz
tar -czf "$UNSAFE_ARCHIVE" -C "$UNSAFE/tree" forge
printf '%s  %s\n' "$(hash_file "$UNSAFE_ARCHIVE")" "$(basename "$UNSAFE_ARCHIVE")" \
    >"$UNSAFE/SHA256SUMS"
UNSAFE_PREFIX=$TMP_ROOT/unsafe-prefix
expect_failure run_install "$ANVIL" --archive "$UNSAFE_ARCHIVE" --prefix "$UNSAFE_PREFIX"
assert_absent "$UNSAFE_PREFIX/share/forge"
pass "archive links and special entries are rejected before extraction"

OLD_BIN=$TMP_ROOT/old-bin
mkdir "$OLD_BIN"
cat >"$OLD_BIN/bd" <<'EOF'
#!/bin/sh
printf 'bd version 1.1.9 (test)\n'
EOF
chmod +x "$OLD_BIN/bd"
OLD_PREFIX=$TMP_ROOT/old-bd-prefix
OLD_LOG=$TMP_ROOT/old-bd.log
env HOME="$TMP_ROOT/home" ANVIL_HOME="$ANVIL" BEADS_DIR="$BEADS" PATH="$OLD_BIN:/usr/bin:/bin" \
    sh "$INSTALLER" --archive "$ARCHIVE_ONE" --prefix "$OLD_PREFIX" >"$OLD_LOG" 2>&1
assert_contains "$OLD_LOG" 'bd 1.2.1 or newer was not detected'
pass "old bd warns without failing or changing the dependency"

PRERELEASE_BIN=$TMP_ROOT/prerelease-bin
mkdir "$PRERELEASE_BIN"
cat >"$PRERELEASE_BIN/bd" <<'EOF'
#!/bin/sh
printf 'bd version 1.2.1-rc.1 (test)\n'
EOF
chmod +x "$PRERELEASE_BIN/bd"
PRERELEASE_PREFIX=$TMP_ROOT/prerelease-bd-prefix
PRERELEASE_LOG=$TMP_ROOT/prerelease-bd.log
env HOME="$TMP_ROOT/home" ANVIL_HOME="$ANVIL" BEADS_DIR="$BEADS" \
    PATH="$PRERELEASE_BIN:/usr/bin:/bin" \
    sh "$INSTALLER" --archive "$ARCHIVE_ONE" --prefix "$PRERELEASE_PREFIX" \
    >"$PRERELEASE_LOG" 2>&1
assert_contains "$PRERELEASE_LOG" 'bd 1.2.1 or newer was not detected'
pass "the 1.2.1 prerelease does not satisfy the stable bd floor"

BD_BIN_PREFIX=$TMP_ROOT/bd-bin-prefix
BD_BIN_LOG=$TMP_ROOT/bd-bin.log
env HOME="$TMP_ROOT/home" ANVIL_HOME="$ANVIL" BEADS_DIR="$BEADS" \
    BD_BIN=bd PATH="$TEST_PATH" \
    sh "$INSTALLER" --archive "$ARCHIVE_ONE" --prefix "$BD_BIN_PREFIX" >"$BD_BIN_LOG" 2>&1
assert_not_contains "$BD_BIN_LOG" 'bd was not found'
assert_not_contains "$BD_BIN_LOG" 'bd 1.2.1 or newer was not detected'
pass "BD_BIN command names resolve through PATH before the bd fallback"

run_uninstall "$ANVIL" --prefix "$PREFIX"
assert_absent "$PREFIX/share/forge"
assert_absent "$PREFIX/bin/forged"
assert_exists "$ANVIL/sentinel"
assert_exists "$BEADS/sentinel"
run_uninstall "$ANVIL" --prefix "$PREFIX"
assert_exists "$ANVIL/sentinel"
pass "uninstall is idempotent and preserves operator state"

SERVICE_PREFIX=$TMP_ROOT/service-prefix
run_install "$ANVIL" --archive "$ARCHIVE_ONE" --prefix "$SERVICE_PREFIX"
mkdir -p "$ANVIL/runtime"
printf '{}\n' >"$ANVIL/runtime/manifest.json"
expect_failure run_uninstall "$ANVIL" --prefix "$SERVICE_PREFIX"
assert_exists "$SERVICE_PREFIX/share/forge"
rm "$ANVIL/runtime/manifest.json"
run_uninstall "$ANVIL" --prefix "$SERVICE_PREFIX"
pass "installed macOS service manifest blocks distribution removal"

run_uninstall "$ANVIL" --prefix "$FOREIGN"
run_uninstall "$ANVIL" --prefix "$OLD_PREFIX"
run_uninstall "$ANVIL" --prefix "$PRERELEASE_PREFIX"
run_uninstall "$ANVIL" --prefix "$BD_BIN_PREFIX"

if [ -n "$REAL_ARCHIVE" ]; then
    [ -n "$REAL_VERSION" ] || fail "real archive smoke requires expected version"
    [ -n "$REAL_TARGET" ] || fail "real archive smoke requires expected target"
    [ "$REAL_TARGET" = "$TARGET" ] \
        || fail "real archive target $REAL_TARGET does not match test host $TARGET"
    REAL_PREFIX=$TMP_ROOT/real-prefix
    REAL_ANVIL=$TMP_ROOT/real-anvil
    mkdir "$REAL_ANVIL"
    printf 'preserve real state\n' >"$REAL_ANVIL/sentinel"
    run_install "$REAL_ANVIL" --archive "$REAL_ARCHIVE" --version "$REAL_VERSION" \
        --prefix "$REAL_PREFIX"
    [ "$("$REAL_PREFIX/bin/forged" --version)" = "forged $REAL_VERSION" ] \
        || fail "real archive reports the wrong version"
    run_install "$REAL_ANVIL" --archive "$REAL_ARCHIVE" --version "$REAL_VERSION" \
        --prefix "$REAL_PREFIX"
    run_uninstall "$REAL_ANVIL" --prefix "$REAL_PREFIX"
    run_uninstall "$REAL_ANVIL" --prefix "$REAL_PREFIX"
    assert_exists "$REAL_ANVIL/sentinel"
    pass "real release archive clean/repeat/uninstall smoke"
fi

printf 'All installer tests passed for %s.\n' "$TARGET"
