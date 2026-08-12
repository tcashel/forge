//! Shared support for the forged integration tests: hermetic scratch
//! homes, the four shims (claude, codex, bd, gh), throwaway git repos, a
//! forged-binary runner, and a minimal MCP stdio client.
//!
//! No network, no real provider, no real gh, no writes outside the temp
//! tree. The bd-gated helpers (`HomeBeadsGuard`, `sandboxed_bd`, …) are
//! ported from `crates/forged-beads/tests/support/mod.rs` — integration
//! test modules are not importable across crates — preserving their
//! behavior, with the version predicate tightened to exactly 1.2.1.

#![allow(dead_code)]

use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, ChildStdout, Command, Output, Stdio};
use std::sync::OnceLock;

use serde_json::{json, Value};

// ---------------------------------------------------------------- ported
// bd-gated helpers (from forged-beads tests/support, behavior preserved).

/// Snapshot guard for the REAL `$HOME/.beads`: a `~/.beads` that NEWLY
/// APPEARS during a scratch-HOME run means the HOME override leaked. Bind
/// as the FIRST statement of every bd-gated test.
pub struct HomeBeadsGuard {
    existed_before: bool,
}

impl HomeBeadsGuard {
    /// Take the baseline snapshot.
    pub fn new() -> Self {
        let existed_before = real_home_beads().is_some_and(|p| p.exists());
        Self { existed_before }
    }
}

impl Drop for HomeBeadsGuard {
    fn drop(&mut self) {
        if !self.existed_before && real_home_beads().is_some_and(|p| p.exists()) {
            let msg =
                "sandboxed bd leaked a machine-global ~/.beads — trash it with `trash ~/.beads`";
            if std::thread::panicking() {
                eprintln!("{msg}");
            } else {
                panic!("{msg}");
            }
        }
    }
}

fn real_home_beads() -> Option<PathBuf> {
    std::env::var_os("HOME").map(|h| PathBuf::from(h).join(".beads"))
}

/// A per-test scratch area under `CARGO_TARGET_TMPDIR`.
pub struct Scratch {
    /// The scratch root (removed and recreated per run).
    pub root: PathBuf,
    /// Scratch `HOME` for bd children.
    pub home: PathBuf,
    /// Scratch `BEADS_DIR`.
    pub beads: PathBuf,
    /// Scratch anvil home.
    pub anvil: PathBuf,
}

/// Create a fresh scratch area named for the calling test.
pub fn scratch(name: &str) -> Scratch {
    let root =
        PathBuf::from(env!("CARGO_TARGET_TMPDIR")).join(format!("{name}-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&root);
    let s = Scratch {
        home: root.join("home"),
        beads: root.join("beads"),
        anvil: root.join("anvil"),
        root,
    };
    for dir in [&s.home, &s.beads, &s.anvil] {
        std::fs::create_dir_all(dir).expect("creating scratch dir");
    }
    s
}

/// Build a RAW bd command against a scratch area with the crate's env
/// allowlist: env_clear + PATH, scratch HOME, scratch BEADS_DIR,
/// BD_JSON_ENVELOPE=1, TMPDIR passthrough; cwd = the scratch store.
pub fn raw_bd(bd: &Path, s: &Scratch, args: &[&str]) -> Command {
    let mut c = Command::new(bd);
    c.args(args).env_clear();
    if let Some(p) = std::env::var_os("PATH") {
        c.env("PATH", p);
    }
    c.env("HOME", &s.home)
        .env("BEADS_DIR", &s.beads)
        .env("BD_JSON_ENVELOPE", "1");
    if let Some(t) = std::env::var_os("TMPDIR") {
        c.env("TMPDIR", t);
    }
    c.current_dir(&s.beads);
    c
}

/// Bring the scratch store into existence — every pre-store call runs from
/// an ancestor-clean cwd under the system temp dir (bd's workspace
/// discovery lets a CWD-ancestor `.beads` preempt an uninitialized
/// `$BEADS_DIR`; this has already written into an operator's real
/// `~/.beads` once), and the store is verified to have landed in the
/// scratch `BEADS_DIR`.
pub fn init_store(bd: &Path, s: &Scratch) {
    let unique = s
        .root
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| "scratch".to_string());
    let clean_cwd = std::env::temp_dir().join(format!("forged-bin-init-{unique}"));
    let _ = std::fs::remove_dir_all(&clean_cwd);
    std::fs::create_dir_all(&clean_cwd).expect("creating ancestor-clean cwd");
    let init = raw_bd(
        bd,
        s,
        // Inert init: a bare one writes CLAUDE.md, AGENTS.md, .claude/ and
        // .agents/ into its cwd.
        &[
            "init",
            "--non-interactive",
            "--quiet",
            "--skip-agents",
            "--skip-hooks",
        ],
    )
    .current_dir(&clean_cwd)
    .output()
    .expect("spawning bd init");
    assert!(
        init.status.success(),
        "initializing the scratch store failed: {}",
        String::from_utf8_lossy(&init.stderr)
    );
    assert!(
        s.beads.join("config.yaml").exists(),
        "the scratch store did not land in {} — ancestor workspace discovery \
         must never win over the test's BEADS_DIR",
        s.beads.display()
    );
    let _ = std::fs::remove_dir_all(&clean_cwd);
    let where_out = raw_bd(bd, s, &["where"])
        .output()
        .expect("spawning bd where");
    let resolved = String::from_utf8_lossy(&where_out.stdout).into_owned();
    assert!(
        resolved.contains(&s.beads.to_string_lossy().into_owned()),
        "bd where must resolve the scratch store {}, got: {resolved}",
        s.beads.display()
    );
}

/// Create a bead in the scratch store and return its id.
pub fn create_bead(bd: &Path, s: &Scratch, title: &str) -> String {
    let out = raw_bd(bd, s, &["create", title, "--json"])
        .output()
        .expect("spawning bd create");
    assert!(
        out.status.success(),
        "bd create failed: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let v: Value =
        serde_json::from_str(&String::from_utf8_lossy(&out.stdout)).expect("create envelope");
    v.get("data")
        .and_then(|d| d.get("id"))
        .and_then(Value::as_str)
        .expect("created bead id")
        .to_string()
}

/// Read a bead through a RAW `bd show <id> --json`, returning its first
/// data object.
pub fn show_bead(bd: &Path, s: &Scratch, id: &str) -> Value {
    let out = raw_bd(bd, s, &["show", id, "--json"])
        .output()
        .expect("spawning bd show");
    assert!(
        out.status.success(),
        "bd show failed: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let v: Value =
        serde_json::from_str(&String::from_utf8_lossy(&out.stdout)).expect("show envelope");
    match v.get("data").cloned().expect("show envelope data") {
        Value::Array(items) => items.into_iter().next().expect("bd show returned no issue"),
        other => other,
    }
}

/// Resolve the sandboxed bd binary: `$FORGED_TEST_BD`, else
/// `~/.anvil/tools/bd-1.2.1/bin/bd`, else `None` — never the PATH bd. The
/// ported predicate is tightened to EXACT equality with 1.2.1; any other
/// version is skipped with the same loud SKIP message.
pub fn sandboxed_bd() -> Option<PathBuf> {
    static BD: OnceLock<Option<PathBuf>> = OnceLock::new();
    BD.get_or_init(|| {
        let mut candidates = Vec::new();
        if let Some(p) = std::env::var_os("FORGED_TEST_BD") {
            candidates.push(PathBuf::from(p));
        }
        if let Some(h) = std::env::var_os("HOME") {
            candidates.push(PathBuf::from(h).join(".anvil/tools/bd-1.2.1/bin/bd"));
        }
        candidates
            .into_iter()
            .find(|c| c.exists() && verify_bd_version(c))
    })
    .clone()
}

fn verify_bd_version(bd: &Path) -> bool {
    let s = scratch("forged-bd-version-verify");
    let out = raw_bd(bd, &s, &["version", "--json"]).output();
    let ok = match out {
        Ok(o) if o.status.success() => {
            let stdout = String::from_utf8_lossy(&o.stdout).into_owned();
            serde_json::from_str::<Value>(&stdout)
                .ok()
                .and_then(|v| {
                    v.get("data")
                        .and_then(|d| d.get("version"))
                        .or_else(|| v.get("version"))
                        .and_then(Value::as_str)
                        .map(|ver| ver == "1.2.1")
                })
                .unwrap_or(false)
        }
        _ => false,
    };
    let _ = std::fs::remove_dir_all(&s.root);
    ok
}

/// Resolve the sandboxed bd or SKIP loudly.
pub fn require_bd() -> Option<PathBuf> {
    match sandboxed_bd() {
        Some(bd) => Some(bd),
        None => {
            eprintln!(
                "SKIP: sandboxed bd 1.2.1 not found (set FORGED_TEST_BD or install \
                 ~/.anvil/tools/bd-1.2.1/bin/bd); bd-gated test not run"
            );
            None
        }
    }
}

// ------------------------------------------------------------- git repos
// (ported from forged-git tests/common, behavior preserved)

/// Run git hermetically: no user/global/system config, fixed identity, no
/// signing. Panics on failure.
pub fn git(dir: &Path, args: &[&str]) -> String {
    let output = git_raw(dir, args);
    assert!(
        output.status.success(),
        "git {:?} in {} failed: {}",
        args,
        dir.display(),
        String::from_utf8_lossy(&output.stderr)
    );
    String::from_utf8_lossy(&output.stdout).into_owned()
}

/// The same hermetic environment; the caller inspects the outcome.
pub fn git_raw(dir: &Path, args: &[&str]) -> Output {
    Command::new("git")
        .arg("-C")
        .arg(dir)
        .args(args)
        .env("GIT_CONFIG_GLOBAL", "/dev/null")
        .env("GIT_CONFIG_SYSTEM", "/dev/null")
        .env("GIT_CONFIG_NOSYSTEM", "1")
        .env("GIT_AUTHOR_NAME", "forged-test")
        .env("GIT_AUTHOR_EMAIL", "forged-test@example.invalid")
        .env("GIT_COMMITTER_NAME", "forged-test")
        .env("GIT_COMMITTER_EMAIL", "forged-test@example.invalid")
        .output()
        .expect("git spawns")
}

/// A throwaway origin repository plus a local-path clone of it.
pub struct Repos {
    /// The origin repository (non-bare, local-path remote).
    pub origin: PathBuf,
    /// A clone with `refs/remotes/origin/<base>` populated.
    pub repo: PathBuf,
    /// The base branch name.
    pub base: String,
}

/// Build an origin repo on branch `base` with one commit and clone it,
/// both under `root`.
pub fn setup_repos(root: &Path, base: &str) -> Repos {
    let origin = root.join("origin");
    std::fs::create_dir_all(&origin).expect("mkdir origin");
    git(&origin, &["init", "-b", base]);
    std::fs::write(origin.join("f.txt"), "base\n").expect("seed file");
    git(&origin, &["add", "f.txt"]);
    git(&origin, &["commit", "-m", "base commit"]);

    let repo = root.join("repo");
    git(
        root,
        &[
            "clone",
            origin.to_str().expect("utf8 origin path"),
            repo.to_str().expect("utf8 repo path"),
        ],
    );
    Repos {
        origin,
        repo,
        base: base.to_owned(),
    }
}

/// The sha of `rev` in `dir`.
pub fn rev_parse(dir: &Path, rev: &str) -> String {
    git(dir, &["rev-parse", rev]).trim().to_owned()
}

// ------------------------------------------------------------------ shims

const GH_SHIM: &str = r#"#!/bin/sh
{
  printf '%s\037' "$@"
  printf '\036'
} >> "$GH_SHIM_LOG"
key=unknown
case "$1" in
  pr)
    case "$2" in
      view) key=pr_view ;;
      list) key=pr_list ;;
      merge) key=pr_merge ;;
      ready) key=pr_ready ;;
    esac ;;
  api)
    case "$*" in
      *--method\ POST*/pulls*) key=create_pr ;;
      *--method\ POST*/comments*) key=post_comment ;;
      */comments*) key=list_comments ;;
      *) key=repo ;;
    esac ;;
  auth) exit 0 ;;
esac
code=0
if [ -f "$GH_SHIM_DIR/$key.exit" ]; then code=$(cat "$GH_SHIM_DIR/$key.exit"); fi
if [ -f "$GH_SHIM_DIR/$key.stderr" ]; then cat "$GH_SHIM_DIR/$key.stderr" >&2; fi
if [ -f "$GH_SHIM_DIR/$key.stdout" ]; then cat "$GH_SHIM_DIR/$key.stdout"; fi
exit "$code"
"#;

const CLAUDE_SHIM: &str = r#"#!/bin/sh
# forged test shim: claude. Reads the rendered prompt on stdin, extracts
# the packet id and result schema, applies the per-stage scenario, does the
# stage's real work in the cwd (the worktree), and emits claude-shaped
# stream-json.
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null GIT_CONFIG_NOSYSTEM=1
export GIT_AUTHOR_NAME=shim GIT_AUTHOR_EMAIL=shim@example.invalid
export GIT_COMMITTER_NAME=shim GIT_COMMITTER_EMAIL=shim@example.invalid
prompt=$(cat)
pkt=$(printf '%s\n' "$prompt" | sed -n 's/.*"packetId": "\([^"]*\)".*/\1/p' | head -1)
schema=$(printf '%s\n' "$prompt" | sed -n 's/.*"schema": "\([^"]*\)".*/\1/p' | head -1)
stage=$(printf '%s' "$pkt" | awk -F/ '{print $(NF-1)}')
seq=$(printf '%s' "$pkt" | awk -F/ '{print $NF}')
log="${FORGED_SHIM_DIR:?}/provider.log"
echo "$pkt start $(date +%s) $$" >> "$log"

mode=normal
sf="$FORGED_SHIM_DIR/scenario.$stage"
if [ -f "$sf" ]; then
  read -r m n < "$sf"
  if [ "${n:-0}" -gt 0 ] 2>/dev/null; then
    mode=$m
    echo "$m $((n-1))" > "$sf"
  fi
fi

json_escape() { sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | awk '{printf "%s\\n", $0}'; }

emit_result() {
  esc=$(printf '%s' "$1" | json_escape)
  printf '{"type":"system","subtype":"init","session_id":"shim-claude"}\n'
  printf '{"type":"result","subtype":"success","is_error":false,"result":"%s","session_id":"shim-claude","total_cost_usd":0.01,"usage":{"input_tokens":5,"cache_read_input_tokens":1,"cache_creation_input_tokens":1,"output_tokens":2}}\n' "$esc"
}

finish() {
  echo "$pkt end $(date +%s) $$" >> "$log"
  exit 0
}

fence='```'
case "$mode" in
  hang) sleep 3600; finish ;;
  slow) sleep 4 ;;
  no-block) emit_result "done without any result block"; finish ;;
  malformed) emit_result "done
${fence}forged-result
{not json
${fence}"; finish ;;
  rate-limit)
    printf '{"type":"system","subtype":"init","session_id":"shim-claude"}\n'
    printf '{"type":"result","subtype":"error","is_error":true,"result":"Rate limit reached","session_id":"shim-claude","usage":{"input_tokens":0,"cache_read_input_tokens":0,"output_tokens":0}}\n'
    finish ;;
esac

inner=""
case "$stage" in
  implement)
    printf 'impl by shim\n' > "impl-$seq.txt"
    git add "impl-$seq.txt"
    git commit -q -m "feat: shim implement $seq"
    commits=$(git rev-list --count "origin/${FORGED_SHIM_BASE:-main}..HEAD" 2>/dev/null || echo 1)
    inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"implement\": {\"implemented\": true, \"commitsAhead\": $commits, \"summary\": \"shim implement\", \"gateState\": \"pass\", \"note\": null}}}"
    ;;
  reviewclaude|reviewcodex)
    if [ "$seq" -le 1 ]; then
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"review\": {\"verdict\": \"requestChanges\", \"summary\": \"shim review\", \"findings\": [{\"severity\": \"high\", \"file\": \"impl-1.txt\", \"line\": 1, \"message\": \"needs a fix\"}], \"available\": true}}}"
    else
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"review\": {\"verdict\": \"approve\", \"summary\": \"shim review\", \"findings\": [], \"available\": true}}}"
    fi
    ;;
  fix)
    printf 'fix by shim\n' > "fix-$seq.txt"
    git add "fix-$seq.txt"
    git commit -q -m "fix(review): shim fix $seq"
    git push -q origin HEAD
    inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"fix\": {\"applied\": true, \"summary\": \"shim fix\"}}}"
    ;;
esac

emit_result "work complete
${fence}forged-result
$inner
${fence}"
finish
"#;

const CODEX_SHIM: &str = r#"#!/bin/sh
# forged test shim: codex. Parses its -o last-message argument, reads the
# prompt on stdin, applies the per-stage scenario, does the stage's work in
# the cwd, writes the final message to -o, and emits codex-shaped JSONL.
export GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_SYSTEM=/dev/null GIT_CONFIG_NOSYSTEM=1
export GIT_AUTHOR_NAME=shim GIT_AUTHOR_EMAIL=shim@example.invalid
export GIT_COMMITTER_NAME=shim GIT_COMMITTER_EMAIL=shim@example.invalid
last=""
prev=""
for a in "$@"; do
  if [ "$prev" = "-o" ]; then last=$a; fi
  prev=$a
done
prompt=$(cat)
pkt=$(printf '%s\n' "$prompt" | sed -n 's/.*"packetId": "\([^"]*\)".*/\1/p' | head -1)
schema=$(printf '%s\n' "$prompt" | sed -n 's/.*"schema": "\([^"]*\)".*/\1/p' | head -1)
stage=$(printf '%s' "$pkt" | awk -F/ '{print $(NF-1)}')
seq=$(printf '%s' "$pkt" | awk -F/ '{print $NF}')
log="${FORGED_SHIM_DIR:?}/provider.log"
echo "$pkt start $(date +%s) $$" >> "$log"

mode=normal
sf="$FORGED_SHIM_DIR/scenario.$stage"
if [ -f "$sf" ]; then
  read -r m n < "$sf"
  if [ "${n:-0}" -gt 0 ] 2>/dev/null; then
    mode=$m
    echo "$m $((n-1))" > "$sf"
  fi
fi

finish() {
  echo "$pkt end $(date +%s) $$" >> "$log"
  exit 0
}

printf '{"type":"thread.started","thread_id":"shim-thread-1"}\n'
printf '{"type":"turn.started"}\n'

fence='```'
case "$mode" in
  hang) sleep 3600; finish ;;
  slow) sleep 4 ;;
  rate-limit)
    printf '{"type":"turn.failed","error":{"message":"rate limit"}}\n'
    finish ;;
  no-block)
    printf 'no result block here' > "$last"
    printf '{"type":"turn.completed","usage":{"input_tokens":3,"cached_input_tokens":1,"cache_write_input_tokens":0,"output_tokens":1}}\n'
    finish ;;
  malformed)
    printf '%s\n' "${fence}forged-result" '{not json' "${fence}" > "$last"
    printf '{"type":"turn.completed","usage":{"input_tokens":3,"cached_input_tokens":1,"cache_write_input_tokens":0,"output_tokens":1}}\n'
    finish ;;
esac

inner=""
case "$stage" in
  implement)
    printf 'impl by shim\n' > "impl-$seq.txt"
    git add "impl-$seq.txt"
    git commit -q -m "feat: shim implement $seq"
    commits=$(git rev-list --count "origin/${FORGED_SHIM_BASE:-main}..HEAD" 2>/dev/null || echo 1)
    inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"implement\": {\"implemented\": true, \"commitsAhead\": $commits, \"summary\": \"shim implement\", \"gateState\": \"pass\", \"note\": null}}}"
    ;;
  reviewclaude|reviewcodex)
    if [ "$seq" -le 1 ]; then
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"review\": {\"verdict\": \"requestChanges\", \"summary\": \"shim review\", \"findings\": [{\"severity\": \"high\", \"file\": \"impl-1.txt\", \"line\": 1, \"message\": \"needs a fix\"}], \"available\": true}}}"
    else
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"review\": {\"verdict\": \"approve\", \"summary\": \"shim review\", \"findings\": [], \"available\": true}}}"
    fi
    ;;
  fix)
    printf 'fix by shim\n' > "fix-$seq.txt"
    git add "fix-$seq.txt"
    git commit -q -m "fix(review): shim fix $seq"
    git push -q origin HEAD
    inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"fix\": {\"applied\": true, \"summary\": \"shim fix\"}}}"
    ;;
esac

printf '%s\n' "final message" "${fence}forged-result" "$inner" "${fence}" > "$last"
printf '{"type":"turn.completed","usage":{"input_tokens":3,"cached_input_tokens":1,"cache_write_input_tokens":0,"output_tokens":1}}\n'
finish
"#;

const BD_SHIM: &str = r#"#!/bin/sh
# forged test shim: bd. Answers the envelope shapes forged-beads pins, with
# lease state under $BEADS_DIR/shim-state.
state="${BEADS_DIR:?}/shim-state"
mkdir -p "$state"
printf '%s\n' "$*" >> "$state/calls.log"
val() {
  flag=$1; shift
  prev=""
  for a in "$@"; do
    if [ "$prev" = "$flag" ]; then printf '%s' "$a"; return; fi
    prev=$a
  done
}
cmd=$1
case "$cmd" in
  version)
    printf '{"schema_version":1,"data":{"version":"1.2.1"}}\n' ;;
  update)
    id=$2
    actor=$(val --actor "$@")
    cur=$(cat "$state/$id.assignee" 2>/dev/null || true)
    if [ -z "$cur" ] || [ "$cur" = "$actor" ]; then
      printf '%s' "$actor" > "$state/$id.assignee"
      printf '{"schema_version":1,"data":[{"id":"%s","assignee":"%s","status":"in_progress"}]}\n' "$id" "$actor"
    else
      printf '{"schema_version":1,"data":[{"id":"%s","assignee":"%s"}]}\n' "$id" "$cur"
    fi ;;
  heartbeat)
    id=$2
    actor=$(val --actor "$@")
    cur=$(cat "$state/$id.assignee" 2>/dev/null || true)
    if [ "$cur" = "$actor" ]; then
      printf '{"schema_version":1,"data":{"id":"%s","owner":"%s","status":"heartbeat"}}\n' "$id" "$actor"
    else
      printf '{"schema_version":1,"data":{"error":"heartbeat %s: issue already claimed by %s"}}\n' "$id" "$cur"
      exit 1
    fi ;;
  reclaim)
    id=$(val --id "$@")
    assignee=$(val --assignee "$@")
    cur=$(cat "$state/$id.assignee" 2>/dev/null || true)
    if [ -n "$cur" ] && [ "$cur" = "$assignee" ]; then
      rm -f "$state/$id.assignee"
      printf '{"schema_version":1,"data":{"count":1,"reclaimed":[{"id":"%s","previous_owner":"%s"}],"scoped":true}}\n' "$id" "$cur"
    else
      printf '{"schema_version":1,"data":{"count":0,"reclaimed":null,"scoped":true}}\n'
    fi ;;
  show)
    id=$2
    cur=$(cat "$state/$id.assignee" 2>/dev/null || true)
    printf '{"schema_version":1,"data":[{"id":"%s","assignee":"%s"}]}\n' "$id" "$cur" ;;
  ready)
    actor=$(val --actor "$@")
    front="$state/frontier"
    if [ -s "$front" ]; then
      id=$(head -1 "$front")
      tail -n +2 "$front" > "$front.tmp" && mv "$front.tmp" "$front"
      printf '%s' "$actor" > "$state/$id.assignee"
      printf '{"schema_version":1,"data":[{"id":"%s","assignee":"%s","status":"in_progress"}]}\n' "$id" "$actor"
    else
      printf '{"schema_version":1,"data":[]}\n'
    fi ;;
  *)
    printf '{"schema_version":1,"data":[]}\n' ;;
esac
"#;

fn write_shim(dir: &Path, name: &str, body: &str) -> PathBuf {
    use std::os::unix::fs::PermissionsExt;
    let path = dir.join(name);
    std::fs::write(&path, body).expect("write shim");
    std::fs::set_permissions(&path, std::fs::Permissions::from_mode(0o755)).expect("chmod shim");
    path
}

// ---------------------------------------------------------------- TestEnv

/// One hermetic forged environment: scratch HOME (so `<anvil_home>` lands
/// inside the temp tree), shims on a prepended PATH, a config file naming
/// the bd shim, and throwaway git repos.
pub struct TestEnv {
    /// The scratch root under `CARGO_TARGET_TMPDIR`.
    pub root: PathBuf,
    /// The scratch HOME.
    pub home: PathBuf,
    /// `<home>/.anvil`.
    pub anvil: PathBuf,
    /// The shim bin dir (claude, codex, bd, gh).
    pub shim_bin: PathBuf,
    /// The shim scenario/log dir (`FORGED_SHIM_DIR`).
    pub shim_dir: PathBuf,
    /// gh scenario dir.
    pub gh_dir: PathBuf,
    /// gh call log.
    pub gh_log: PathBuf,
    /// The scratch `BEADS_DIR` (bd shim state).
    pub beads_dir: PathBuf,
    /// The throwaway repos.
    pub repos: Repos,
    /// The spec file runs build.
    pub spec: PathBuf,
}

impl TestEnv {
    /// Build a fresh environment named for the calling test.
    pub fn new(name: &str) -> Self {
        let root = PathBuf::from(env!("CARGO_TARGET_TMPDIR"))
            .join(format!("{name}-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&root);
        let home = root.join("home");
        let anvil = home.join(".anvil");
        let shim_bin = root.join("bin");
        let shim_dir = root.join("shim");
        let gh_dir = root.join("gh-scenarios");
        let beads_dir = root.join("beads");
        for dir in [&home, &anvil, &shim_bin, &shim_dir, &gh_dir, &beads_dir] {
            std::fs::create_dir_all(dir).expect("creating test env dir");
        }
        write_shim(&shim_bin, "claude", CLAUDE_SHIM);
        write_shim(&shim_bin, "codex", CODEX_SHIM);
        write_shim(&shim_bin, "bd", BD_SHIM);
        write_shim(&shim_bin, "gh", GH_SHIM);
        let gh_log = root.join("gh-calls.log");
        let repos = setup_repos(&root, "main");
        let spec = root.join("spec.md");
        std::fs::write(&spec, "# test spec\nbuild the thing\n").expect("write spec");
        let env = TestEnv {
            root,
            home,
            anvil,
            shim_bin,
            shim_dir,
            gh_dir,
            gh_log,
            beads_dir,
            repos,
            spec,
        };
        env.write_config(None);
        // Default gh scenarios: no existing PR; creation succeeds.
        env.gh_set("pr_list", "stdout", "[]");
        env.gh_set(
            "create_pr",
            "stdout",
            &format!(
                "{{\"number\":7,\"state\":\"open\",\"draft\":true,\
                 \"base\":{{\"ref\":\"main\"}},\"head\":{{\"ref\":\"forged/{name}\"}},\
                 \"html_url\":\"https://example.invalid/pr/7\"}}"
            ),
        );
        env
    }

    /// Write the config file; `fix_provider` overrides the Fix stage's
    /// provider (the codex rate-limit case).
    pub fn write_config(&self, fix_provider: Option<&str>) {
        let bd_path = self.shim_bin.join("bd");
        let hint = |provider: &str, model: &str, effort: Option<&str>, sandbox: &str| json!({"provider": provider, "model": model, "effort": effort, "sandbox": sandbox});
        let fix = match fix_provider {
            Some("codex") => hint("codex", "gpt-5.6-sol", Some("xhigh"), "workspaceWrite"),
            _ => hint("claude", "opus", None, "workspaceWrite"),
        };
        let config = json!({
            "roster": {
                "implement": hint("claude", "opus", None, "workspaceWrite"),
                "reviewclaude": hint("claude", "opus", None, "readOnly"),
                "reviewcodex": hint("codex", "gpt-5.6-sol", Some("xhigh"), "readOnly"),
                "fix": fix,
            },
            "gate_commands": ["true"],
            "stage_budget_s": {
                "implement": 1800, "reviewclaude": 1800, "reviewcodex": 1800, "fix": 1800
            },
            "transport_retry_budget": 3,
            "bd_path": bd_path.to_string_lossy(),
            "codex_home": self.root.join("codex-home").to_string_lossy(),
        });
        std::fs::write(
            self.anvil.join("config.json"),
            serde_json::to_string_pretty(&config).expect("config json"),
        )
        .expect("write config");
    }

    /// The environment a forged child (or MCP server) runs under.
    pub fn forged_cmd(&self, args: &[&str]) -> Command {
        let mut cmd = Command::new(env!("CARGO_BIN_EXE_forged"));
        let inherited = std::env::var("PATH").unwrap_or_default();
        cmd.args(args)
            .env("HOME", &self.home)
            .env("BEADS_DIR", &self.beads_dir)
            .env("PATH", format!("{}:{inherited}", self.shim_bin.display()))
            .env("FORGED_SHIM_DIR", &self.shim_dir)
            .env("FORGED_SHIM_BASE", &self.repos.base)
            .env("GH_SHIM_LOG", &self.gh_log)
            .env("GH_SHIM_DIR", &self.gh_dir)
            .env_remove("ANVIL_HOME")
            .env_remove("FORGED_CONFIG")
            .env_remove("FORGED_FAILPOINT")
            .env_remove("FORGED_FAILPOINT_MODE")
            .env_remove("FORGED_FAILPOINT_DIR")
            .current_dir(&self.root);
        cmd
    }

    /// Run forged to completion; return (exit code, parsed envelope).
    pub fn forged(&self, args: &[&str]) -> (i32, Value) {
        let out = self
            .forged_cmd(args)
            .output()
            .expect("forged binary spawns");
        let stdout = String::from_utf8_lossy(&out.stdout);
        let envelope: Value = serde_json::from_str(stdout.trim()).unwrap_or_else(|e| {
            panic!(
                "forged {:?} stdout is not one JSON envelope ({e}): {stdout:?}; stderr: {}",
                args,
                String::from_utf8_lossy(&out.stderr)
            )
        });
        (out.status.code().unwrap_or(-1), envelope)
    }

    /// Arm a per-stage provider scenario for the next `count` invocations.
    pub fn set_scenario(&self, stage: &str, mode: &str, count: u32) {
        std::fs::write(
            self.shim_dir.join(format!("scenario.{stage}")),
            format!("{mode} {count}\n"),
        )
        .expect("write scenario");
    }

    /// Write (or overwrite) a gh scenario file.
    pub fn gh_set(&self, key: &str, kind: &str, contents: &str) {
        std::fs::write(self.gh_dir.join(format!("{key}.{kind}")), contents)
            .expect("write gh scenario");
    }

    /// Every recorded gh invocation, oldest first, one argv per entry.
    pub fn gh_calls(&self) -> Vec<Vec<String>> {
        let raw = match std::fs::read_to_string(&self.gh_log) {
            Ok(raw) => raw,
            Err(_) => return Vec::new(),
        };
        raw.split('\u{1e}')
            .filter(|record| !record.is_empty())
            .map(|record| {
                let mut argv: Vec<String> = record.split('\u{1f}').map(str::to_owned).collect();
                if argv.last().is_some_and(String::is_empty) {
                    argv.pop();
                }
                argv
            })
            .collect()
    }

    /// The provider shim log lines (`<packet_id> start|end <stamp> <pid>`).
    pub fn provider_log(&self) -> Vec<String> {
        std::fs::read_to_string(self.shim_dir.join("provider.log"))
            .unwrap_or_default()
            .lines()
            .map(str::to_owned)
            .collect()
    }

    /// The bd shim call log, one argv line per call.
    pub fn bd_calls(&self) -> Vec<String> {
        std::fs::read_to_string(self.beads_dir.join("shim-state/calls.log"))
            .unwrap_or_default()
            .lines()
            .map(str::to_owned)
            .collect()
    }

    /// Seed the bd shim's frontier with a ready bead.
    pub fn seed_frontier(&self, bead: &str) {
        let state = self.beads_dir.join("shim-state");
        std::fs::create_dir_all(&state).expect("shim state");
        let front = state.join("frontier");
        let mut existing = std::fs::read_to_string(&front).unwrap_or_default();
        existing.push_str(bead);
        existing.push('\n');
        std::fs::write(front, existing).expect("seed frontier");
    }

    /// Set a bead's assignee in the bd shim state directly.
    pub fn set_assignee(&self, bead: &str, holder: &str) {
        let state = self.beads_dir.join("shim-state");
        std::fs::create_dir_all(&state).expect("shim state");
        std::fs::write(state.join(format!("{bead}.assignee")), holder).expect("set assignee");
    }

    /// A bead's current assignee in the bd shim state.
    pub fn assignee(&self, bead: &str) -> Option<String> {
        std::fs::read_to_string(self.beads_dir.join(format!("shim-state/{bead}.assignee")))
            .ok()
            .filter(|s| !s.is_empty())
    }

    /// Open the environment's ledger (state.db) directly.
    pub fn ledger(&self) -> forged_ledger::Ledger {
        forged_ledger::Ledger::open(&self.anvil.join("state.db")).expect("open test ledger")
    }

    /// The run's worktree path.
    pub fn worktree(&self, run_id: &str) -> PathBuf {
        self.anvil.join("runs").join(run_id).join("worktree")
    }

    /// The packet dir for `<run>/<stage>/<seq>`.
    pub fn packet_dir(&self, run_id: &str, stage: &str, seq: i64) -> PathBuf {
        self.anvil
            .join("runs")
            .join(run_id)
            .join("packets")
            .join(stage)
            .join(seq.to_string())
    }
}

/// Assert that a provider log shows no interleaved start/end pairs for one
/// packet: every `start` for the packet is preceded by the previous
/// attempt's `end` (or nothing).
pub fn assert_no_overlap(log: &[String], packet_id: &str) {
    assert_no_overlap_after_kills(log, packet_id, &[]);
}

/// The same non-overlap scan, excluding pids the TEST ITSELF killed and
/// verified dead before any successor started: a SIGKILLed shim can never
/// write its `end` line, so its verified death (asserted separately by the
/// caller and by the ledger's attempt-order record) stands in for it.
pub fn assert_no_overlap_after_kills(log: &[String], packet_id: &str, killed_pids: &[i32]) {
    let mut open = 0i32;
    let lines = log.iter().filter(|l| l.starts_with(packet_id)).filter(|l| {
        let pid = l.rsplit(' ').next().and_then(|p| p.parse::<i32>().ok());
        !pid.is_some_and(|p| killed_pids.contains(&p))
    });
    for line in lines {
        if line.contains(" start ") {
            open += 1;
            assert!(
                open <= 1,
                "two provider processes for {packet_id} overlapped: {log:?}"
            );
        } else if line.contains(" end ") {
            open -= 1;
        }
    }
}

// ------------------------------------------------------------- MCP client

/// A minimal MCP stdio client speaking newline-delimited JSON-RPC to a
/// `forged mcp` child.
pub struct McpClient {
    child: Child,
    stdin: ChildStdin,
    reader: BufReader<ChildStdout>,
    next_id: i64,
}

impl McpClient {
    /// Spawn `forged mcp` in the environment and complete the initialize
    /// handshake.
    pub fn new(env: &TestEnv) -> Self {
        let mut child = env
            .forged_cmd(&["mcp"])
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::null())
            .spawn()
            .expect("forged mcp spawns");
        let stdin = child.stdin.take().expect("mcp stdin");
        let stdout = child.stdout.take().expect("mcp stdout");
        let mut client = McpClient {
            child,
            stdin,
            reader: BufReader::new(stdout),
            next_id: 1,
        };
        let init = client.request(
            "initialize",
            json!({
                "protocolVersion": "2025-06-18",
                "capabilities": {},
                "clientInfo": {"name": "forged-test", "version": "0"},
            }),
        );
        assert!(init.get("result").is_some(), "initialize failed: {init}");
        client.notify("notifications/initialized", json!({}));
        client
    }

    fn send(&mut self, value: &Value) {
        let mut line = serde_json::to_string(value).expect("jsonrpc serializes");
        line.push('\n');
        self.stdin
            .write_all(line.as_bytes())
            .expect("mcp stdin write");
        self.stdin.flush().expect("mcp stdin flush");
    }

    fn request(&mut self, method: &str, params: Value) -> Value {
        let id = self.next_id;
        self.next_id += 1;
        self.send(&json!({"jsonrpc": "2.0", "id": id, "method": method, "params": params}));
        loop {
            let mut line = String::new();
            let n = self.reader.read_line(&mut line).expect("mcp stdout read");
            assert!(n > 0, "mcp server closed stdout mid-request");
            let value: Value = match serde_json::from_str(line.trim()) {
                Ok(v) => v,
                Err(_) => continue,
            };
            if value.get("id").and_then(Value::as_i64) == Some(id) {
                return value;
            }
        }
    }

    fn notify(&mut self, method: &str, params: Value) {
        self.send(&json!({"jsonrpc": "2.0", "method": method, "params": params}));
    }

    /// Call one tool with an operation envelope; return the parsed
    /// `OperationResponse` from the result's first text content block.
    pub fn call_tool(&mut self, name: &str, envelope: Value) -> Value {
        let reply = self.request("tools/call", json!({"name": name, "arguments": envelope}));
        let text = reply
            .pointer("/result/content/0/text")
            .and_then(Value::as_str)
            .unwrap_or_else(|| panic!("tool {name} returned no text content: {reply}"));
        serde_json::from_str(text)
            .unwrap_or_else(|e| panic!("tool {name} text is not an envelope ({e}): {text}"))
    }

    /// The tool names the server declares.
    pub fn list_tools(&mut self) -> Vec<String> {
        let reply = self.request("tools/list", json!({}));
        reply
            .pointer("/result/tools")
            .and_then(Value::as_array)
            .map(|tools| {
                tools
                    .iter()
                    .filter_map(|t| t.get("name").and_then(Value::as_str))
                    .map(str::to_owned)
                    .collect()
            })
            .unwrap_or_default()
    }
}

impl Drop for McpClient {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}
