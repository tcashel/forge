//! Shared support for the forged integration tests: hermetic scratch
//! homes, the four shims (claude, codex, bd, gh), throwaway git repos, a
//! forged-binary runner, and a minimal MCP stdio client.
//!
//! No network, no real provider, no real gh, no writes outside the temp
//! tree. The bd-gated helpers (`HomeBeadsGuard`, `sandboxed_bd`, …) are
//! ported from `crates/forged-beads/tests/support/mod.rs` — integration
//! test modules are not importable across crates — preserving their
//! behavior and accepting explicit sandboxed bd semver `>=1.2.1`.

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

/// Create a work in the scratch store and return its id.
pub fn create_work(bd: &Path, s: &Scratch, title: &str) -> String {
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

/// Read a work through a RAW `bd show <id> --json`, returning its first
/// data object.
pub fn show_work(bd: &Path, s: &Scratch, id: &str) -> Value {
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

/// Resolve the explicitly supplied sandboxed bd binary. Never search the host
/// `PATH` or an operator tool directory: an absent `FORGED_TEST_BD` is the only
/// skippable state, while an invalid supplied binary fails in [`require_bd`].
pub fn sandboxed_bd() -> Option<PathBuf> {
    static BD: OnceLock<Option<PathBuf>> = OnceLock::new();
    BD.get_or_init(|| bd_candidate().filter(|candidate| verify_bd_version(candidate)))
        .clone()
}

fn bd_candidate() -> Option<PathBuf> {
    std::env::var_os("FORGED_TEST_BD")
        .filter(|value| !value.is_empty())
        .map(PathBuf::from)
}

fn verify_bd_version(bd: &Path) -> bool {
    reported_bd_version(bd).is_ok_and(|version| forged_beads::supported_bd_version(&version))
}

fn reported_bd_version(bd: &Path) -> Result<String, String> {
    if !bd.is_file() {
        return Err(format!("{} is not a file", bd.display()));
    }
    let s = scratch("forged-bd-version-verify");
    let out = raw_bd(bd, &s, &["version", "--json"]).output();
    let result = match out {
        Ok(o) if o.status.success() => {
            let stdout = String::from_utf8_lossy(&o.stdout).into_owned();
            serde_json::from_str::<Value>(&stdout)
                .map_err(|error| format!("version output is not JSON: {error}: {stdout}"))
                .and_then(|v| {
                    v.get("data")
                        .and_then(|d| d.get("version"))
                        .or_else(|| v.get("version"))
                        .and_then(Value::as_str)
                        .map(str::to_owned)
                        .ok_or_else(|| format!("version output has no version field: {stdout}"))
                })
        }
        Ok(output) => Err(format!(
            "version probe exited {:?}: {}",
            output.status.code(),
            String::from_utf8_lossy(&output.stderr)
        )),
        Err(error) => Err(format!("version probe could not start: {error}")),
    };
    let _ = std::fs::remove_dir_all(&s.root);
    result
}

/// Resolve the sandboxed bd or SKIP loudly.
pub fn require_bd() -> Option<PathBuf> {
    if let Some(bd) = sandboxed_bd() {
        return Some(bd);
    }
    if let Some(candidate) = bd_candidate() {
        let detail = match reported_bd_version(&candidate) {
            Ok(version) => format!("reported unsupported version {version:?}"),
            Err(error) => error,
        };
        panic!(
            "FORGED_TEST_BD={} is not a usable bd semver >=1.2.1: {detail}; \
             supplied versions are exercised rather than skipped",
            candidate.display()
        );
    }
    let message = "sandboxed bd >=1.2.1 not supplied (set FORGED_TEST_BD to an explicit binary)";
    assert!(
        std::env::var_os("FORGED_REQUIRE_BD").is_none_or(|value| value != "1"),
        "FORGED_REQUIRE_BD=1 and {message}: the bd contract was not checked"
    );
    eprintln!("SKIP: {message}; bd-gated test not run");
    None
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
    // Production host derivation reads the raw origin URL. Keep that URL in
    // a supported GitHub shape while a repository-local rewrite preserves
    // hermetic fetch and push behavior against the local fixture.
    let remote_url = "https://github.com/forged-test/repo.git";
    git(&repo, &["remote", "set-url", "origin", remote_url]);
    let rewrite_key = format!("url.{}.insteadOf", origin.display());
    git(&repo, &["config", &rewrite_key, remote_url]);
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
val() {
  flag=$1; shift
  prev=""
  for a in "$@"; do
    if [ "$prev" = "$flag" ]; then printf '%s' "$a"; return; fi
    prev=$a
  done
}
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
      *--method\ PATCH*/pulls/*) key=update_pr ;;
      *--method\ POST*/pulls*) key=create_pr ;;
      *--method\ POST*/comments*) key=post_comment ;;
      */comments*) key=list_comments ;;
      *) key=repo ;;
    esac ;;
  auth) key=auth ;;
esac
if [ -f "$GH_SHIM_DIR/dynamic-prs" ]; then
  case "$key" in
    repo)
      printf '{"default_branch":"main"}\n'; exit 0 ;;
    create_pr)
      count=$(cat "$GH_SHIM_DIR/pr-counter" 2>/dev/null || echo 6)
      num=$((count + 1)); printf '%s' "$num" > "$GH_SHIM_DIR/pr-counter"
      head=""; base=""; prev=""
      for a in "$@"; do
        case "$a" in head=*) head=${a#head=} ;; base=*) base=${a#base=} ;; esac
      done
      printf '%s' "$head" > "$GH_SHIM_DIR/pr.$num.head"
      printf '%s' "$base" > "$GH_SHIM_DIR/pr.$num.base"
      printf 'OPEN' > "$GH_SHIM_DIR/pr.$num.state"
      printf 'true' > "$GH_SHIM_DIR/pr.$num.draft"
      printf '{"number":%s,"state":"open","draft":true,"base":{"ref":"%s"},"head":{"ref":"%s"},"html_url":"https://example.invalid/pr/%s"}\n' "$num" "$base" "$head" "$num"
      exit 0 ;;
    pr_view)
      num=$3; state=$(cat "$GH_SHIM_DIR/pr.$num.state"); draft=$(cat "$GH_SHIM_DIR/pr.$num.draft")
      base=$(cat "$GH_SHIM_DIR/pr.$num.base"); head=$(cat "$GH_SHIM_DIR/pr.$num.head")
      case "$*" in
        *headRefOid*)
          oid=$(git -C "$FORGED_SHIM_REPO" ls-remote origin "refs/heads/$head" | awk 'NR==1 {print $1}')
          printf '{"headRefOid":"%s"}\n' "$oid"; exit 0 ;;
      esac
      printf '{"number":%s,"state":"%s","isDraft":%s,"baseRefName":"%s","headRefName":"%s","url":"https://example.invalid/pr/%s"}\n' "$num" "$state" "$draft" "$base" "$head" "$num"
      exit 0 ;;
    update_pr)
      num=""
      body_value=""
      for a in "$@"; do case "$a" in repos/*/pulls/*) num=${a##*/} ;; body=*) body_value=${a#body=}; printf '%s' "$body_value" > "$GH_SHIM_DIR/pr.$num.body" ;; esac; done
      case "$body_value" in
        *"executed and integrally assured by forged"*)
          if [ -f "$GH_SHIM_DIR/drift-after-assured-update" ]; then
            drift_head=$(cat "$GH_SHIM_DIR/drift-after-assured-update")
            rm -f "$GH_SHIM_DIR/drift-after-assured-update"
            printf '%s' "$drift_head" > "$GH_SHIM_DIR/pr.$num.head"
          fi ;;
      esac
      state=$(cat "$GH_SHIM_DIR/pr.$num.state"); draft=$(cat "$GH_SHIM_DIR/pr.$num.draft")
      base=$(cat "$GH_SHIM_DIR/pr.$num.base"); head=$(cat "$GH_SHIM_DIR/pr.$num.head")
      printf '{"number":%s,"state":"%s","draft":%s,"base":{"ref":"%s"},"head":{"ref":"%s"},"html_url":"https://example.invalid/pr/%s"}\n' "$num" "$(printf '%s' "$state" | tr '[:upper:]' '[:lower:]')" "$draft" "$base" "$head" "$num"
      exit 0 ;;
    pr_ready)
      num=$3; printf 'false' > "$GH_SHIM_DIR/pr.$num.draft"; exit 0 ;;
    pr_merge)
      num=$3; printf 'MERGED' > "$GH_SHIM_DIR/pr.$num.state"; exit 0 ;;
    pr_list)
      head=$(val --head "$@"); base=$(val --base "$@")
      found=""
      for file in "$GH_SHIM_DIR"/pr.*.head; do
        [ -f "$file" ] || continue
        num=${file##*/pr.}; num=${num%.head}
        if [ "$(cat "$file")" = "$head" ] && [ "$(cat "$GH_SHIM_DIR/pr.$num.base")" = "$base" ] && [ "$(cat "$GH_SHIM_DIR/pr.$num.state")" = OPEN ]; then found=$num; break; fi
      done
      if [ -z "$found" ]; then printf '[]\n'; else
        draft=$(cat "$GH_SHIM_DIR/pr.$found.draft")
        printf '[{"number":%s,"state":"OPEN","isDraft":%s,"baseRefName":"%s","headRefName":"%s","url":"https://example.invalid/pr/%s"}]\n' "$found" "$draft" "$base" "$head" "$found"
      fi
      exit 0 ;;
  esac
fi
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
scenario_stage=$stage
case "$stage" in
  implementation) scenario_stage=implement ;;
  plan-author|plan-revision) scenario_stage=epic-plan ;;
  plan-*) scenario_stage=epic-plan-review ;;
  assurance-review-1) scenario_stage=reviewclaude ;;
  assurance-review-*|assurance-synthesis-*) scenario_stage=reviewcodex ;;
  assurance-fix) scenario_stage=fix ;;
  review-1) scenario_stage=reviewclaude ;;
  review-2|review-3|synthesis) scenario_stage=reviewcodex ;;
  remediation) scenario_stage=fix ;;
esac
log="${FORGED_SHIM_DIR:?}/provider.log"
echo "$pkt start $(date +%s) $$" >> "$log"

mode=normal
sf="$FORGED_SHIM_DIR/scenario.$scenario_stage"
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
  wait-release)
    for _ in $(seq 1 600); do
      [ -f "$FORGED_SHIM_DIR/release.$scenario_stage" ] && break
      sleep 0.1
    done ;;
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
  plan-author|plan-revision)
    inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"plan\": {\"spec\": {\"description\": \"planned context and outcome\", \"acceptanceCriteria\": \"planned observable acceptance\", \"design\": \"planned minimal design\", \"notes\": \"planned no scope expansion\"}, \"traceability\": {\"assumptions\": [], \"requirements\": [\"preserve the frozen epic outcome\"]}, \"cruxes\": []}}}"
    ;;
  plan-*)
    if [ "$mode" = block ]; then
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"specAmendment\": {\"amendment\": {\"summary\": \"root authority must change\", \"evidence\": \"the frozen root excludes the required dependency mutation\", \"proposedChange\": \"authorize dependency mutation or remove the requirement\"}}}}"
    elif [ "$seq" -eq 0 ]; then
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"review\": {\"verdict\": \"requestChanges\", \"summary\": \"shim plan review\", \"findings\": [{\"severity\": \"high\", \"file\": null, \"line\": null, \"message\": \"Requirement R1 needs an exact readback\"}], \"available\": true}}}"
    else
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"review\": {\"verdict\": \"approve\", \"summary\": \"shim plan review\", \"findings\": [], \"available\": true}}}"
    fi
    ;;
  implement|implementation)
    if [ "$mode" = spec-amendment ]; then
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"specAmendment\": {\"amendment\": {\"summary\": \"contract conflicts with repository\", \"evidence\": \"the named API is absent\", \"proposedChange\": \"target the replacement API\"}}}}"
    else
      printf 'impl by shim\n' > "impl-$seq.txt"
      git add "impl-$seq.txt"
      git commit -q -m "feat: shim implement $seq"
      commits=$(git rev-list --count "origin/${FORGED_SHIM_BASE:-main}..HEAD" 2>/dev/null || echo 1)
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"implement\": {\"implemented\": true, \"commitsAhead\": $commits, \"summary\": \"shim implement\", \"gateState\": \"pass\", \"note\": null}}}"
    fi
    ;;
  reviewclaude|reviewcodex|review-1|review-2|review-3|synthesis|assurance-review-*|assurance-synthesis-*)
    if [ "$mode" = block ]; then
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"specAmendment\": {\"amendment\": {\"summary\": \"root authority must change\", \"evidence\": \"the frozen root excludes the required dependency mutation\", \"proposedChange\": \"authorize dependency mutation or remove the requirement\"}}}}"
    elif [ "$mode" = approve ]; then
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"review\": {\"verdict\": \"approve\", \"summary\": \"shim review\", \"findings\": [], \"available\": true}}}"
    elif [ "$mode" = request-changes ]; then
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"review\": {\"verdict\": \"requestChanges\", \"summary\": \"shim review\", \"findings\": [{\"severity\": \"high\", \"file\": \"impl-1.txt\", \"line\": 1, \"message\": \"needs a fix\"}], \"available\": true}}}"
    elif { [ "$stage" = reviewclaude ] || [ "$stage" = reviewcodex ]; } && [ "$seq" -le 1 ] || { [ "$stage" != reviewclaude ] && [ "$stage" != reviewcodex ] && [ "$seq" -eq 0 ]; }; then
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"review\": {\"verdict\": \"requestChanges\", \"summary\": \"shim review\", \"findings\": [{\"severity\": \"high\", \"file\": \"impl-1.txt\", \"line\": 1, \"message\": \"needs a fix\"}], \"available\": true}}}"
    else
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"review\": {\"verdict\": \"approve\", \"summary\": \"shim review\", \"findings\": [], \"available\": true}}}"
    fi
    ;;
  fix|remediation|assurance-fix)
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
scenario_stage=$stage
case "$stage" in
  implementation) scenario_stage=implement ;;
  plan-author|plan-revision) scenario_stage=epic-plan ;;
  plan-*) scenario_stage=epic-plan-review ;;
  assurance-review-1) scenario_stage=reviewclaude ;;
  assurance-review-*|assurance-synthesis-*) scenario_stage=reviewcodex ;;
  assurance-fix) scenario_stage=fix ;;
  review-1) scenario_stage=reviewclaude ;;
  review-2|review-3|synthesis) scenario_stage=reviewcodex ;;
  remediation) scenario_stage=fix ;;
esac
log="${FORGED_SHIM_DIR:?}/provider.log"
echo "$pkt start $(date +%s) $$" >> "$log"

mode=normal
sf="$FORGED_SHIM_DIR/scenario.$scenario_stage"
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
  wait-release)
    for _ in $(seq 1 600); do
      [ -f "$FORGED_SHIM_DIR/release.$scenario_stage" ] && break
      sleep 0.1
    done ;;
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
  plan-author|plan-revision)
    inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"plan\": {\"spec\": {\"description\": \"planned context and outcome\", \"acceptanceCriteria\": \"planned observable acceptance\", \"design\": \"planned minimal design\", \"notes\": \"planned no scope expansion\"}, \"traceability\": {\"assumptions\": [], \"requirements\": [\"preserve the frozen epic outcome\"]}, \"cruxes\": []}}}"
    ;;
  plan-*)
    if [ "$mode" = block ]; then
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"specAmendment\": {\"amendment\": {\"summary\": \"root authority must change\", \"evidence\": \"the frozen root excludes the required dependency mutation\", \"proposedChange\": \"authorize dependency mutation or remove the requirement\"}}}}"
    elif [ "$seq" -eq 0 ]; then
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"review\": {\"verdict\": \"requestChanges\", \"summary\": \"shim plan review\", \"findings\": [{\"severity\": \"high\", \"file\": null, \"line\": null, \"message\": \"Requirement R1 needs an exact readback\"}], \"available\": true}}}"
    else
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"review\": {\"verdict\": \"approve\", \"summary\": \"shim plan review\", \"findings\": [], \"available\": true}}}"
    fi
    ;;
  implement|implementation)
    if [ "$mode" = spec-amendment ]; then
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"specAmendment\": {\"amendment\": {\"summary\": \"contract conflicts with repository\", \"evidence\": \"the named API is absent\", \"proposedChange\": \"target the replacement API\"}}}}"
    else
      printf 'impl by shim\n' > "impl-$seq.txt"
      git add "impl-$seq.txt"
      git commit -q -m "feat: shim implement $seq"
      commits=$(git rev-list --count "origin/${FORGED_SHIM_BASE:-main}..HEAD" 2>/dev/null || echo 1)
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"implement\": {\"implemented\": true, \"commitsAhead\": $commits, \"summary\": \"shim implement\", \"gateState\": \"pass\", \"note\": null}}}"
    fi
    ;;
  reviewclaude|reviewcodex|review-1|review-2|review-3|synthesis|assurance-review-*|assurance-synthesis-*)
    if [ "$mode" = block ]; then
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"specAmendment\": {\"amendment\": {\"summary\": \"root authority must change\", \"evidence\": \"the frozen root excludes the required dependency mutation\", \"proposedChange\": \"authorize dependency mutation or remove the requirement\"}}}}"
    elif [ "$mode" = approve ]; then
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"review\": {\"verdict\": \"approve\", \"summary\": \"shim review\", \"findings\": [], \"available\": true}}}"
    elif [ "$mode" = request-changes ]; then
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"review\": {\"verdict\": \"requestChanges\", \"summary\": \"shim review\", \"findings\": [{\"severity\": \"high\", \"file\": \"impl-1.txt\", \"line\": 1, \"message\": \"needs a fix\"}], \"available\": true}}}"
    elif { [ "$stage" = reviewclaude ] || [ "$stage" = reviewcodex ]; } && [ "$seq" -le 1 ] || { [ "$stage" != reviewclaude ] && [ "$stage" != reviewcodex ] && [ "$seq" -eq 0 ]; }; then
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"review\": {\"verdict\": \"requestChanges\", \"summary\": \"shim review\", \"findings\": [{\"severity\": \"high\", \"file\": \"impl-1.txt\", \"line\": 1, \"message\": \"needs a fix\"}], \"available\": true}}}"
    else
      inner="{\"schema\": \"$schema\", \"packetId\": \"$pkt\", \"outcome\": {\"review\": {\"verdict\": \"approve\", \"summary\": \"shim review\", \"findings\": [], \"available\": true}}}"
    fi
    ;;
  fix|remediation|assurance-fix)
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
# Probe-verified against bd 1.2.1: `revision` is a WRITE TOKEN, not a spec
# digest. EVERY write to a bead mints a new one — a lease claim and a status
# change included — and the old value never returns. The shim mints one the
# same way, because a shim whose revision only moved on a spec edit would let
# a fence-on-the-token bug pass the whole suite.
bump_revision() {
  id=$1
  n=$(cat "$state/$id.revseq" 2>/dev/null || echo 0)
  n=$((n + 1))
  printf '%s' "$n" > "$state/$id.revseq"
  if [ -f "$state/$id.force-null-revision" ]; then
    printf 'null' > "$state/$id.revision"
  else
    printf -- '-61922084151162515%02d' "$((n % 100))" > "$state/$id.revision"
  fi
}
issue_json() {
  id=$1
  shape=${2:-show}
  title=$(cat "$state/$id.title" 2>/dev/null || echo "$id")
  description=$(cat "$state/$id.description" 2>/dev/null || true)
  status=$(cat "$state/$id.status" 2>/dev/null || echo open)
  type=$(cat "$state/$id.type" 2>/dev/null || echo task)
  assignee=$(cat "$state/$id.assignee" 2>/dev/null || true)
  acceptance=$(cat "$state/$id.acceptance" 2>/dev/null || true)
  design=$(cat "$state/$id.design" 2>/dev/null || true)
  notes=$(cat "$state/$id.notes" 2>/dev/null || true)
  repository=$(cat "$state/default-repository" 2>/dev/null || true)
  metadata=$(cat "$state/$id.metadata" 2>/dev/null || printf '{"repository":"%s"}' "$repository")
  priority=$(cat "$state/$id.priority" 2>/dev/null || echo 2)
  parent=$(cat "$state/$id.parent" 2>/dev/null || true)
  if [ -n "$parent" ]; then parent_json="\"$parent\""; else parent_json=null; fi
  dependencies=$(cat "$state/$id.dependencies" 2>/dev/null || echo '[]')
  # bd emits `revision` on show/children only, as a signed 64-bit integer
  # that changes on every write.
  revision=$(cat "$state/$id.revision" 2>/dev/null || echo -6192208415116251521)
  if [ "$shape" = brief ]; then revision_json=""; else revision_json=",\"revision\":$revision"; fi
  printf '{"id":"%s","title":"%s","description":"%s","status":"%s","priority":%s,"issue_type":"%s","assignee":"%s","acceptance_criteria":"%s","design":"%s","notes":"%s","metadata":%s%s,"updated_at":"2026-08-14T00:00:00Z","parent":%s,"dependencies":%s}' "$id" "$title" "$description" "$status" "$priority" "$type" "$assignee" "$acceptance" "$design" "$notes" "$metadata" "$revision_json" "$parent_json" "$dependencies"
}
case "$cmd" in
  version)
    printf '{"schema_version":1,"data":{"version":"1.2.1"}}\n' ;;
  where)
    printf '{"schema_version":1,"data":{"path":"%s","database_path":"%s/embeddeddolt"}}\n' "$BEADS_DIR" "$BEADS_DIR" ;;
  dolt)
    printf '{"schema_version":1,"data":{"backend":"dolt","data_dir":"%s/embeddeddolt","database":"beads","embedded":true}}\n' "$BEADS_DIR" ;;
  update)
    id=$2
    actor=$(val --actor "$@")
    new_status=$(val --status "$@")
    [ -n "$new_status" ] || new_status=$(val -s "$@")
    new_assignee=$(val --assignee "$@")
    new_description=$(val --description "$@")
    new_acceptance=$(val --acceptance "$@")
    new_design=$(val --design "$@")
    new_notes=$(val --notes "$@")
    [ -n "$new_assignee" ] || new_assignee=$(val -a "$@")
    has_assignee=0; has_if_assignee=0; has_if_status=0; has_claim=0; expected_assignee=""; expected_status=""; prev=""
    for a in "$@"; do
      { [ "$prev" = "--assignee" ] || [ "$prev" = "-a" ]; } && has_assignee=1
      if [ "$prev" = "--if-assignee" ]; then
        has_if_assignee=1
        expected_assignee=$a
      fi
      if [ "$prev" = "--if-status" ]; then
        has_if_status=1
        expected_status=$a
      fi
      [ "$a" = "--claim" ] && has_claim=1
      prev=$a
    done
    cur=$(cat "$state/$id.assignee" 2>/dev/null || true)
    # Deterministic close-CAS race: a successor claim lands after forged's
    # pre-read but before bd evaluates --if-assignee. The guarded update must
    # then refuse without changing status or clearing the successor.
    successor_on_guard="$state/$id.successor-on-guard"
    if [ "$has_if_assignee" = 1 ] && [ -f "$successor_on_guard" ]; then
      cur=$(cat "$successor_on_guard")
      printf '%s' "$cur" > "$state/$id.assignee"
      rm -f "$successor_on_guard"
      bump_revision "$id"
    fi
    if [ "$has_if_assignee" = 1 ] && [ "$cur" != "$expected_assignee" ]; then
      printf '{"schema_version":1,"data":{"error":"stale --if-assignee guard: expected %s, found %s"}}\n' "$expected_assignee" "$cur"
      exit 13
    fi
    if [ "$has_if_status" = 1 ] && [ "$(cat "$state/$id.status" 2>/dev/null || echo open)" != "$expected_status" ]; then
      printf '{"schema_version":1,"data":{"error":"stale --if-status guard: expected %s"}}\n' "$expected_status"
      exit 13
    fi
    # An explicit scenario for a future/incompatible bd applying its claim
    # status rule to the guarded plain assignment. The exact pinned refusal
    # lets settlement prove it parks after this one charged attempt.
    if [ "$has_assignee" = 1 ] && [ "$new_status" = "in_progress" ] && [ "$expected_assignee" = "" ] && [ -f "$state/$id.refuse-guarded-custody" ]; then
      printf '{"schema_version":1,"data":{"error":"issue not claimable: status blocked"}}\n'
      exit 1
    fi
    if [ -n "$new_status" ]; then
      [ -z "$new_description" ] || printf '%s' "$new_description" > "$state/$id.description"
      [ -z "$new_acceptance" ] || printf '%s' "$new_acceptance" > "$state/$id.acceptance"
      [ -z "$new_design" ] || printf '%s' "$new_design" > "$state/$id.design"
      [ -z "$new_notes" ] || printf '%s' "$new_notes" > "$state/$id.notes"
      printf '%s' "$new_status" > "$state/$id.status"
      if [ "$has_assignee" = 1 ]; then
        if [ -n "$new_assignee" ]; then
          printf '%s' "$new_assignee" > "$state/$id.assignee"
        else
          rm -f "$state/$id.assignee"
        fi
      fi
      bump_revision "$id"
      printf '{"schema_version":1,"data":['; issue_json "$id"; printf ']}\n'
      exit 0
    fi
    if [ "$has_assignee" = 1 ]; then
      rm -f "$state/$id.assignee"
      bump_revision "$id"
      printf '{"schema_version":1,"data":['; issue_json "$id"; printf ']}\n'
      exit 0
    fi
    if [ "$has_claim" = 1 ]; then
      # Pinned bd's claim contract, in ITS order: the ownership CAS first
      # (a foreign holder answers "issue already claimed by <holder>",
      # which forged classifies as a held lease), then the
      # claimable-status rule, then assignee AND status move together.
      if [ -n "$cur" ] && [ "$cur" != "$actor" ]; then
        printf '{"schema_version":1,"data":{"error":"issue already claimed by %s"}}\n' "$cur"
        exit 1
      fi
      if [ "$cur" = "$actor" ]; then
        printf '{"schema_version":1,"data":[{"id":"%s","assignee":"%s","status":"in_progress"}]}\n' "$id" "$actor"
        exit 0
      fi
      status=$(cat "$state/$id.status" 2>/dev/null || echo open)
      case "$status" in
        open) ;;
        *)
          printf '{"schema_version":1,"data":{"error":"issue not claimable: status %s"}}\n' "$status"
          exit 1 ;;
      esac
      printf '%s' "$actor" > "$state/$id.assignee"
      printf 'in_progress' > "$state/$id.status"
      bump_revision "$id"
      printf '{"schema_version":1,"data":[{"id":"%s","assignee":"%s","status":"in_progress"}]}\n' "$id" "$actor"
    else
      printf '{"schema_version":1,"data":['; issue_json "$id"; printf ']}\n'
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
    if [ -f "$state/$id.unexpired" ]; then
      # bd 1.2.1's probe-verified refusal shape: an UNEXPIRED lease is
      # unreclaimable even at --older-than 0s — exit 0, nothing reclaimed,
      # the assignee left intact.
      printf '{"schema_version":1,"data":{"count":0,"reclaimed":null,"scoped":true}}\n'
    elif [ -n "$cur" ] && [ "$cur" = "$assignee" ]; then
      rm -f "$state/$id.assignee"
      printf 'open' > "$state/$id.status"
      bump_revision "$id"
      printf '{"schema_version":1,"data":{"count":1,"reclaimed":[{"id":"%s","previous_owner":"%s"}],"scoped":true}}\n' "$id" "$cur"
    else
      printf '{"schema_version":1,"data":{"count":0,"reclaimed":null,"scoped":true}}\n'
    fi ;;
  show)
    # Simulated bd outage: `show` is the read the spec fence depends on.
    if [ -f "$state/show.unreachable" ]; then
      printf 'bd: connection refused\n' >&2
      exit 1
    fi
    # Some tests isolate the packet's spec-fence read from admission's full
    # multi-row hydrate. Pinned admission adds --brief-deps; show_issue does
    # not, so the marker can fail only the latter contract.
    if [ -f "$state/spec-show.unreachable" ]; then
      case " $* " in
        *" --brief-deps "*) ;;
        *) printf 'bd: connection refused\n' >&2; exit 1 ;;
      esac
    fi
    # A direct run-start test has no reason to maintain the global frontier
    # fixture by hand. Remember every shown issue so `bd ready` can expose
    # open ones when no explicit frontier was seeded. Tests that exercise a
    # competing frontier still seed it and therefore keep exact control.
    first=1; printf '{"schema_version":1,"data":['
    shift
    for id in "$@"; do
      [ "$id" = "--json" ] && continue
      case "$id" in --*) continue ;; esac
      : > "$state/$id.seen"
      [ "$first" = 1 ] || printf ','; first=0; issue_json "$id"
      if [ -f "$state/$id.revision-null-after-show" ]; then
        printf 'null' > "$state/$id.revision"
        : > "$state/$id.force-null-revision"
        rm -f "$state/$id.revision-null-after-show"
      fi
    done
    printf ']}\n' ;;
  comments)
    id=$2; text=$(cat "$state/$id.comment" 2>/dev/null || true)
    if [ -n "$text" ]; then
      printf '{"schema_version":1,"data":[{"text":"%s"}]}\n' "$text"
    else
      printf '{"schema_version":1,"data":[]}\n'
    fi ;;
  comment)
    id=$2; printf '%s' "$3" > "$state/$id.comment"
    printf '{"schema_version":1,"data":{"id":"%s"}}\n' "$id" ;;
  list)
    if [ -f "$state/list.unreachable" ]; then
      printf 'bd: connection refused\n' >&2
      exit 1
    fi
    ids=$(val --id "$@")
    statuses=$(val --status "$@")
    limit=$(val --limit "$@")
    metadata_filter=$(val --metadata-field "$@")
    parent_filter=$(val --parent "$@")
    if [ -z "$ids" ]; then
      ids=$(for field in "$state"/*.status; do
        [ -e "$field" ] || continue
        printf '%s,' "$(basename "$field" .status)"
      done)
      ids=${ids%,}
    fi
    first=1; printf '{"schema_version":1,"data":['
    oldifs=$IFS; IFS=,
    shown=0
    for id in $ids; do
      [ -n "$id" ] || continue
      if [ -n "$statuses" ]; then
        current_status=$(cat "$state/$id.status" 2>/dev/null || echo open)
        case ",$statuses," in *",$current_status,"*) ;; *) continue ;; esac
      fi
      if [ -n "$metadata_filter" ]; then
        case "$metadata_filter" in
          repository=*) expected_repository=${metadata_filter#repository=} ;;
          *) continue ;;
        esac
        repository=$(cat "$state/$id.repository" 2>/dev/null || true)
        [ "$repository" = "$expected_repository" ] || continue
      fi
      if [ -n "$parent_filter" ]; then
        current_parent=$(cat "$state/$id.parent" 2>/dev/null || true)
        [ "$current_parent" = "$parent_filter" ] || continue
      fi
      if [ -n "$limit" ] && [ "$limit" -gt 0 ] 2>/dev/null && [ "$shown" -ge "$limit" ]; then
        continue
      fi
      [ "$first" = 1 ] || printf ','; first=0; issue_json "$id" brief
      shown=$((shown + 1))
    done
    IFS=$oldifs
    printf ']}\n' ;;
  children)
    epic=$2; first=1
    printf '{"schema_version":1,"data":['
    while IFS= read -r id; do
      [ -n "$id" ] || continue
      [ "$first" = 1 ] || printf ','; first=0; issue_json "$id"
    done < "$state/$epic.children"
    printf ']}\n' ;;
  close)
    id=$2; printf 'closed' > "$state/$id.status"
    rm -f "$state/$id.assignee"
    bump_revision "$id"
    printf '{"schema_version":1,"data":['; issue_json "$id"; printf ']}\n' ;;
  ready)
    actor=$(val --actor "$@")
    front="$state/frontier"
    if [ -z "$actor" ]; then
      first=1; printf '{"schema_version":1,"data":['
      if [ -s "$front" ]; then
        ids=$(cat "$front")
      else
        ids=$(for seen in "$state"/*.seen; do
          [ -e "$seen" ] || continue
          basename "$seen" .seen
        done)
      fi
      printf '%s\n' "$ids" | while IFS= read -r id; do
        [ -n "$id" ] || continue
        [ "$(cat "$state/$id.status" 2>/dev/null || echo open)" = open ] || continue
        [ "$first" = 1 ] || printf ','; first=0; issue_json "$id"
      done
      printf ']}\n'
    elif [ -s "$front" ]; then
      id=$(head -1 "$front")
      status=$(cat "$state/$id.status" 2>/dev/null || echo open)
      cur=$(cat "$state/$id.assignee" 2>/dev/null || true)
      if [ -n "$cur" ] && [ "$cur" != "$actor" ]; then
        printf '{"schema_version":1,"data":{"error":"issue already claimed by %s"}}\n' "$cur"
        exit 1
      fi
      case "$status" in
        open)
          tail -n +2 "$front" > "$front.tmp" && mv "$front.tmp" "$front"
          printf '%s' "$actor" > "$state/$id.assignee"
          printf 'in_progress' > "$state/$id.status"
          bump_revision "$id"
          printf '{"schema_version":1,"data":[{"id":"%s","assignee":"%s","status":"in_progress"}]}\n' "$id" "$actor" ;;
        *)
          printf '{"schema_version":1,"data":{"error":"issue not claimable: status %s"}}\n' "$status"
          exit 1 ;;
      esac
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
        let shim_state = beads_dir.join("shim-state");
        std::fs::create_dir_all(&shim_state).expect("creating bd shim state");
        std::fs::write(
            shim_state.join("default-repository"),
            repos.repo.to_string_lossy().as_bytes(),
        )
        .expect("write default Bead repository metadata");
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

    /// Add a provider-uniform semantic roster while retaining the mixed
    /// default roster. Every role remains present so any stored profile can
    /// escalate without consulting config again.
    pub fn add_uniform_roster(&self, name: &str, provider: &str, model: &str) {
        let path = self.anvil.join("config.json");
        let mut config: Value = serde_json::from_str(
            &std::fs::read_to_string(&path).expect("read config for roster extension"),
        )
        .expect("config json");
        let candidate = |provider: &str, model: &str, write: bool| {
            let mut capabilities = vec!["repositoryRead", "structuredOutput"];
            if write {
                capabilities.push("repositoryWrite");
            }
            json!({
                "provider": provider,
                "model": model,
                "effort": (provider == "codex").then_some("xhigh"),
                "sandbox": if write { "workspaceWrite" } else { "readOnly" },
                "capabilities": capabilities,
            })
        };
        let roster = |roster_name: &str, uniform: Option<(&str, &str)>| {
            let for_role = |role: &str, write: bool| match uniform {
                Some((provider, model)) => candidate(provider, model, write),
                None => match role {
                    "assessment" => candidate("claude", "sonnet", write),
                    "review.secondary" | "synthesis" => candidate("codex", "gpt-5.6-sol", write),
                    _ => candidate("claude", "opus", write),
                },
            };
            json!({
                "schema": "forged.roster/1",
                "name": roster_name,
                "roles": {
                    "implementation": [for_role("implementation", true)],
                    "assessment": [for_role("assessment", false)],
                    "review.primary": [for_role("review.primary", false)],
                    "review.secondary": [for_role("review.secondary", false)],
                    "review.tertiary": [for_role("review.tertiary", false)],
                    "synthesis": [for_role("synthesis", false)],
                    "remediation": [for_role("remediation", true)],
                }
            })
        };
        let mut rosters = serde_json::Map::new();
        rosters.insert("default".to_owned(), roster("default", None));
        rosters.insert(name.to_owned(), roster(name, Some((provider, model))));
        config["rosters"] = Value::Object(rosters);
        std::fs::write(
            path,
            serde_json::to_string_pretty(&config).expect("extended config json"),
        )
        .expect("write extended config");
    }

    /// Add a roster whose implementation role first names an unavailable
    /// adapter and then Claude. Other roles are Claude-only.
    pub fn add_implementation_fallback_roster(&self, name: &str) {
        self.add_uniform_roster(name, "claude", "opus");
        let path = self.anvil.join("config.json");
        let mut config: Value =
            serde_json::from_str(&std::fs::read_to_string(&path).expect("read fallback config"))
                .expect("fallback config json");
        let candidates = config
            .pointer_mut(&format!("/rosters/{name}/roles/implementation"))
            .and_then(Value::as_array_mut)
            .expect("implementation candidates");
        candidates.insert(
            0,
            json!({
                "provider": "uninstalled",
                "model": "unavailable-model",
                "effort": null,
                "sandbox": "workspaceWrite",
                "capabilities": ["repositoryRead", "repositoryWrite", "structuredOutput"],
            }),
        );
        std::fs::write(
            path,
            serde_json::to_string_pretty(&config).expect("fallback config json"),
        )
        .expect("write fallback config");
    }

    /// Append one implementation candidate to an existing named roster.
    pub fn append_implementation_candidate(&self, name: &str, provider: &str, model: &str) {
        let path = self.anvil.join("config.json");
        let mut config: Value =
            serde_json::from_str(&std::fs::read_to_string(&path).expect("read roster config"))
                .expect("roster config json");
        let candidates = config
            .pointer_mut(&format!("/rosters/{name}/roles/implementation"))
            .and_then(Value::as_array_mut)
            .expect("implementation candidates");
        candidates.push(json!({
            "provider": provider,
            "model": model,
            "effort": (provider == "codex").then_some("xhigh"),
            "sandbox": "workspaceWrite",
            "capabilities": ["repositoryRead", "repositoryWrite", "structuredOutput"],
        }));
        std::fs::write(
            path,
            serde_json::to_string_pretty(&config).expect("roster config json"),
        )
        .expect("write roster config");
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
            .env("FORGED_SHIM_REPO", &self.repos.repo)
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

    /// Release every provider invocation held by a `wait-release` scenario
    /// for this stage; it proceeds with its normal work.
    pub fn release_stage(&self, stage: &str) {
        std::fs::write(self.shim_dir.join(format!("release.{stage}")), "1")
            .expect("write stage release");
    }

    /// Write (or overwrite) a gh scenario file.
    pub fn gh_set(&self, key: &str, kind: &str, contents: &str) {
        std::fs::write(self.gh_dir.join(format!("{key}.{kind}")), contents)
            .expect("write gh scenario");
    }

    /// Enable the stateful gh shim used by epic PR ready/merge/final-PR tests.
    pub fn enable_dynamic_gh(&self) {
        std::fs::write(self.gh_dir.join("dynamic-prs"), "1").expect("dynamic gh flag");
    }

    /// Seed an epic plus child inventory/status/spec pointers in the bd shim.
    pub fn seed_epic(&self, epic: &str, children: &[(&str, &Path, bool)]) {
        self.ensure_work_item(epic);
        self.set_work_field(epic, "type", "epic");
        self.set_work_field(epic, "title", "Test epic");
        self.set_work_field(
            epic,
            "description",
            "## Context\n\nThe epic Bead is the canonical plan map.",
        );
        self.set_work_field(epic, "acceptance", "- every child is accounted for");
        for (id, spec, _ready) in children {
            self.ensure_work_item(id);
            self.set_work_field(id, "title", &format!("Child {id}"));
            self.set_work_field(id, "description", &format!("spec: {}", spec.display()));
            self.set_work_field(id, "status", "open");
            self.set_work_field(id, "parent", epic);
            // Readiness is a store query now: an open, unassigned, unblocked
            // child IS the frontier; the `ready` flag kept its meaning by
            // children that other fixture calls block or claim afterwards.
        }
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

    /// Seed the ready frontier: ensure a ledger work item exists, open and
    /// unassigned (the shim-file frontier this replaces was consumed by
    /// `bd ready --claim`; the ledger frontier is a query).
    pub fn seed_frontier(&self, work: &str) {
        self.ensure_work_item(work);
    }

    /// Open the raw state.db for direct test shaping — the ledger-native
    /// analogue of poking shim-state files. Tests may construct any state,
    /// including ones the typed verbs refuse, exactly as the file-backed
    /// shim allowed.
    fn work_db(&self) -> rusqlite::Connection {
        // Seeding may run before `forged init`; opening through the ledger
        // first applies the migrations exactly as the binary would. A live
        // controller spawned by the same test holds write locks on its own
        // cadence, and slow runners (coverage instrumentation) can outlast
        // the ledger's busy timeout — lock contention here is scheduling,
        // not state, so the migrator open retries under a wall-clock
        // deadline instead of panicking on the first locked window.
        let db = self.anvil.join("state.db");
        let deadline = std::time::Instant::now() + std::time::Duration::from_secs(60);
        loop {
            match forged_ledger::Ledger::open(&db) {
                Ok(ledger) => {
                    ledger.close().expect("close migrator");
                    break;
                }
                Err(error)
                    if error.to_string().contains("database is locked")
                        && std::time::Instant::now() < deadline =>
                {
                    std::thread::sleep(std::time::Duration::from_millis(250));
                }
                Err(error) => panic!("migrate state.db: {error:?}"),
            }
        }
        let conn = rusqlite::Connection::open(self.anvil.join("state.db")).expect("open state.db");
        conn.busy_timeout(std::time::Duration::from_millis(5000))
            .expect("busy timeout");
        conn
    }

    /// Ensure a work item row exists with the shim-default shape: title =
    /// id, open task, priority 2, repository metadata, revision 1.
    pub fn ensure_work_item(&self, work: &str) {
        let conn = self.work_db();
        let now = "2026-08-14T00:00:00.000000000Z";
        let metadata = json!({"repository": self.repos.repo.to_string_lossy()}).to_string();
        conn.execute(
            "INSERT OR IGNORE INTO work_items \
             (work_id, kind, status, priority, assignee, metadata_json, \
              current_revision, created_at, updated_at) \
             VALUES (?1, 'task', 'open', 2, NULL, ?2, 1, ?3, ?3)",
            rusqlite::params![work, metadata, now],
        )
        .expect("ensure work item");
        conn.execute(
            "INSERT OR IGNORE INTO work_revisions \
             (work_id, revision, title, description, acceptance_criteria, \
              design, notes, cause, written_at) \
             VALUES (?1, 1, ?1, '', '', '', '', 'import', ?2)",
            rusqlite::params![work, now],
        )
        .expect("ensure work revision");
    }

    fn current_work_revision(&self, conn: &rusqlite::Connection, work: &str) -> i64 {
        conn.query_row(
            "SELECT current_revision FROM work_items WHERE work_id = ?1",
            [work],
            |row| row.get(0),
        )
        .expect("current revision")
    }

    /// Shape one field of a ledger work item (`description`, `acceptance`,
    /// `design`, `notes`, `title`, `status`, `assignee`, `priority`,
    /// `type`, `metadata`, `parent`, `dependencies`). Spec fields mint a
    /// new revision, exactly as guarded writes do; coordination fields
    /// never do. `revision` pinning has no ledger analogue and is a no-op.
    pub fn set_work_field(&self, work: &str, field: &str, value: &str) {
        self.ensure_work_item(work);
        let conn = self.work_db();
        let now = "2026-08-14T00:00:00.000000000Z";
        match field {
            "title" | "description" | "acceptance" | "design" | "notes" => {
                // The bd shim embedded these into JSON, so `\n` in a test
                // literal became a real newline on the read. Preserve that
                // exact round-trip; a value that is not a valid JSON string
                // body passes through raw.
                let value = serde_json::from_str::<String>(&format!("\"{value}\""))
                    .unwrap_or_else(|_| value.to_owned());
                let value = value.as_str();
                let column = match field {
                    "acceptance" => "acceptance_criteria",
                    other => other,
                };
                let current = self.current_work_revision(&conn, work);
                let next = current + 1;
                conn.execute(
                    &format!(
                        "INSERT INTO work_revisions \
                         (work_id, revision, title, description, \
                          acceptance_criteria, design, notes, cause, written_at) \
                         SELECT work_id, ?2, \
                                CASE WHEN '{column}' = 'title' THEN ?3 ELSE title END, \
                                CASE WHEN '{column}' = 'description' THEN ?3 ELSE description END, \
                                CASE WHEN '{column}' = 'acceptance_criteria' THEN ?3 \
                                     ELSE acceptance_criteria END, \
                                CASE WHEN '{column}' = 'design' THEN ?3 ELSE design END, \
                                CASE WHEN '{column}' = 'notes' THEN ?3 ELSE notes END, \
                                'authored', ?4 \
                         FROM work_revisions WHERE work_id = ?1 AND revision = ?5"
                    ),
                    rusqlite::params![work, next, value, now, current],
                )
                .expect("mint shaped revision");
                conn.execute(
                    "UPDATE work_items SET current_revision = ?2, updated_at = ?3 \
                     WHERE work_id = ?1",
                    rusqlite::params![work, next, now],
                )
                .expect("bump revision pointer");
            }
            "status" => {
                conn.execute(
                    "UPDATE work_items SET status = ?2, updated_at = ?3 WHERE work_id = ?1",
                    rusqlite::params![work, value, now],
                )
                .expect("set status");
            }
            "assignee" => {
                let assignee = if value.is_empty() { None } else { Some(value) };
                conn.execute(
                    "UPDATE work_items SET assignee = ?2, updated_at = ?3 WHERE work_id = ?1",
                    rusqlite::params![work, assignee, now],
                )
                .expect("set assignee");
            }
            "priority" => {
                let priority = value.parse::<i64>().ok();
                conn.execute(
                    "UPDATE work_items SET priority = ?2, updated_at = ?3 WHERE work_id = ?1",
                    rusqlite::params![work, priority, now],
                )
                .expect("set priority");
            }
            "type" => {
                // Unknown kinds map to task with provenance metadata — the
                // importer's rule; the store's kind vocabulary is closed.
                let kind = if value == "epic" { "epic" } else { "task" };
                conn.execute(
                    "UPDATE work_items SET kind = ?2, updated_at = ?3 WHERE work_id = ?1",
                    rusqlite::params![work, kind, now],
                )
                .expect("set kind");
                if kind != value {
                    let metadata: String = conn
                        .query_row(
                            "SELECT metadata_json FROM work_items WHERE work_id = ?1",
                            [work],
                            |row| row.get(0),
                        )
                        .expect("metadata read");
                    let mut parsed: serde_json::Map<String, serde_json::Value> =
                        serde_json::from_str(&metadata).unwrap_or_default();
                    parsed.insert("imported:issue-type".to_owned(), json!(value));
                    conn.execute(
                        "UPDATE work_items SET metadata_json = ?2 WHERE work_id = ?1",
                        rusqlite::params![work, serde_json::Value::Object(parsed).to_string()],
                    )
                    .expect("kind provenance");
                }
            }
            "metadata" => {
                conn.execute(
                    "UPDATE work_items SET metadata_json = ?2, updated_at = ?3 \
                     WHERE work_id = ?1",
                    rusqlite::params![work, value, now],
                )
                .expect("set metadata");
            }
            "parent" => {
                self.ensure_work_item(value);
                conn.execute(
                    "INSERT OR IGNORE INTO work_deps (from_id, to_id, kind) \
                     VALUES (?1, ?2, 'parent-child')",
                    rusqlite::params![work, value],
                )
                .expect("set parent edge");
            }
            "dependencies" => {
                // The shim file this replaces was overwritten wholesale, so
                // an empty list must CLEAR the edges. Parent-child is carried
                // by its own field and is never part of this list.
                conn.execute(
                    "DELETE FROM work_deps WHERE from_id = ?1 AND kind <> 'parent-child'",
                    rusqlite::params![work],
                )
                .expect("clear dependency edges");
                let deps: Vec<serde_json::Value> =
                    serde_json::from_str(value).expect("dependencies json");
                for dep in deps {
                    let id = dep
                        .get("id")
                        .or_else(|| dep.get("depends_on_id"))
                        .and_then(serde_json::Value::as_str)
                        .expect("dependency id");
                    let kind = dep
                        .get("dependency_type")
                        .or_else(|| dep.get("dependencyType"))
                        .and_then(serde_json::Value::as_str)
                        .unwrap_or("blocks");
                    self.ensure_work_item(id);
                    if let Some(status) = dep.get("status").and_then(serde_json::Value::as_str) {
                        conn.execute(
                            "UPDATE work_items SET status = ?2 WHERE work_id = ?1",
                            rusqlite::params![id, status],
                        )
                        .expect("dependency status");
                    }
                    conn.execute(
                        "INSERT OR IGNORE INTO work_deps (from_id, to_id, kind) \
                         VALUES (?1, ?2, ?3)",
                        rusqlite::params![work, id, kind],
                    )
                    .expect("dependency edge");
                }
            }
            // The bd-era write token cannot be pinned on the ledger; the
            // integer revision is authoritative.
            "revision" => {}
            other => {
                // Preserved for bd-era shim quirks a test still shapes
                // (e.g. race markers); harmless once nothing reads them.
                let state = self.beads_dir.join("shim-state");
                std::fs::create_dir_all(&state).expect("shim state");
                std::fs::write(state.join(format!("{work}.{other}")), value)
                    .expect("set shim field");
            }
        }
    }

    /// Set the authoritative work-store `metadata.repository` identity used by
    /// native repository-filter tests.
    pub fn set_work_repository(&self, work: &str, repository: &str) {
        self.set_work_field(
            work,
            "metadata",
            &json!({"repository": repository}).to_string(),
        );
        std::fs::write(
            self.beads_dir
                .join("shim-state")
                .join(format!("{work}.repository")),
            repository,
        )
        .expect("set bead repository");
    }

    /// The status the work store reports for a work right now — the
    /// ledger-native replacement for reading `shim-state/<work>.status`.
    pub fn work_status(&self, work: &str) -> String {
        self.work_db()
            .query_row(
                "SELECT status FROM work_items WHERE work_id = ?1",
                [work],
                |row| row.get(0),
            )
            .expect("work item status")
    }

    /// One spec field at the work's current revision (`title`,
    /// `description`, `acceptance`, `design`, `notes`).
    pub fn work_field(&self, work: &str, field: &str) -> String {
        let column = match field {
            "acceptance" => "acceptance_criteria",
            other => other,
        };
        self.work_db()
            .query_row(
                &format!(
                    "SELECT r.{column} FROM work_revisions r \
                     JOIN work_items i ON i.work_id = r.work_id \
                        AND i.current_revision = r.revision \
                     WHERE r.work_id = ?1"
                ),
                [work],
                |row| row.get(0),
            )
            .expect("work item spec field")
    }

    /// The revision the work store reports for a work right now.
    pub fn work_revision(&self, work: &str) -> String {
        let conn = self.work_db();
        self.current_work_revision(&conn, work).to_string()
    }

    /// Return the current full row once, then make every later `bd show` for
    /// this Work carry a null revision. This models a row becoming malformed
    /// after controller admission but before packet admission.
    pub fn null_revision_after_next_show(&self, work: &str) {
        let state = self.beads_dir.join("shim-state");
        std::fs::create_dir_all(&state).expect("shim state");
        std::fs::write(state.join(format!("{work}.revision-null-after-show")), "1")
            .expect("arm revision removal");
    }

    /// Seed a work whose OWN fields are the spec — the supported route.
    pub fn seed_work_spec(&self, work: &str, description: &str, acceptance: &str) {
        self.set_work_field(work, "title", &format!("Bead {work}"));
        self.set_work_field(work, "description", description);
        self.set_work_field(work, "acceptance", acceptance);
        self.set_work_field(work, "status", "open");
    }

    /// Make every `bd show` fail, the way an unreachable bd does.
    pub fn set_bd_show_unreachable(&self, unreachable: bool) {
        let state = self.beads_dir.join("shim-state");
        std::fs::create_dir_all(&state).expect("shim state");
        let marker = state.join("show.unreachable");
        if unreachable {
            std::fs::write(marker, "1").expect("set bd outage");
        } else {
            let _ = std::fs::remove_file(marker);
        }
    }

    /// Make only the plain `bd show <id> --json` spec-fence read fail while
    /// admission's `show <ids...> --brief-deps --json` hydrate remains live.
    pub fn set_bd_spec_show_unreachable(&self, unreachable: bool) {
        let state = self.beads_dir.join("shim-state");
        std::fs::create_dir_all(&state).expect("shim state");
        let marker = state.join("spec-show.unreachable");
        if unreachable {
            std::fs::write(marker, "1").expect("set bd spec-read outage");
        } else {
            let _ = std::fs::remove_file(marker);
        }
    }

    /// Make every `bd list` fail, the way an unreachable authoritative store
    /// does during repository-scoped discovery.
    pub fn set_bd_list_unreachable(&self, unreachable: bool) {
        let state = self.beads_dir.join("shim-state");
        std::fs::create_dir_all(&state).expect("shim state");
        let marker = state.join("list.unreachable");
        if unreachable {
            std::fs::write(marker, "1").expect("set bd list outage");
        } else {
            let _ = std::fs::remove_file(marker);
        }
    }

    /// Set a work's custody directly (no lease row: reclaimable residue,
    /// exactly what imported or crash-abandoned custody looks like).
    pub fn set_assignee(&self, work: &str, holder: &str) {
        self.set_work_field(work, "assignee", holder);
    }

    /// Arrange for the bd shim to install a successor immediately before its
    /// next `--if-assignee` check, simulating the close-CAS race precisely.
    pub fn set_successor_on_guard(&self, work: &str, holder: &str) {
        let state = self.beads_dir.join("shim-state");
        std::fs::create_dir_all(&state).expect("shim state");
        std::fs::write(state.join(format!("{work}.successor-on-guard")), holder)
            .expect("set successor race");
    }

    /// Give a work's current assignee a far-future lease: every scoped
    /// reclaim answers the refusal shape (nothing reclaimed, custody
    /// intact), whoever asks — the live-lease behavior, now literal.
    pub fn set_lease_unexpired(&self, work: &str) {
        let conn = self.work_db();
        let holder: Option<String> = conn
            .query_row(
                "SELECT assignee FROM work_items WHERE work_id = ?1",
                [work],
                |row| row.get(0),
            )
            .expect("lease holder read");
        let holder = holder.expect("set_lease_unexpired needs an assignee first");
        conn.execute(
            "INSERT INTO work_leases (work_id, holder, acquired_at, expires_at) \
             VALUES (?1, ?2, '2026-08-14T00:00:00.000000000Z', '2099-01-01T00:00:00.000000000Z') \
             ON CONFLICT(work_id) DO UPDATE SET holder = ?2, \
             expires_at = '2099-01-01T00:00:00.000000000Z'",
            rusqlite::params![work, holder],
        )
        .expect("set unexpired lease");
    }

    /// A work's current assignee in the bd shim state.
    pub fn assignee(&self, work: &str) -> Option<String> {
        let conn = self.work_db();
        conn.query_row(
            "SELECT assignee FROM work_items WHERE work_id = ?1",
            [work],
            |row| row.get::<_, Option<String>>(0),
        )
        .ok()
        .flatten()
        .filter(|holder| !holder.is_empty())
    }

    /// Open the environment's ledger (state.db) directly.
    pub fn ledger(&self) -> forged_ledger::Ledger {
        forged_ledger::Ledger::open(&self.anvil.join("state.db")).expect("open test ledger")
    }

    /// Mark a started run as operator-authorized when an integration test is
    /// intentionally exercising a provider launch without going through the
    /// detached `run submit` surface. Production admission must otherwise
    /// refuse these ready-but-unsubmitted rows.
    pub fn authorize_run(&self, run_id: &str) {
        let ledger = self.ledger();
        ledger
            .authorize_desired_work(forged_ledger::DesiredSubjectKind::Run, run_id, 0)
            .expect("authorize test run");
        ledger.close().expect("close test ledger");
    }

    /// Authorize an epic fixture without exercising the public submit wrapper.
    /// Child packet admission delegates to this parent epoch.
    pub fn authorize_epic(&self, epic_id: &str) {
        let ledger = self.ledger();
        ledger
            .authorize_desired_work(forged_ledger::DesiredSubjectKind::Epic, epic_id, 0)
            .expect("authorize test epic");
        ledger.close().expect("close test ledger");
    }

    /// Make one authorized epic due for a process-level supervisor tick.
    /// Expiring a retained token models the lease boundary after a crashed
    /// pass; a live test process never calls this concurrently with the pass.
    pub fn wake_epic(&self, epic_id: &str) {
        assert!(
            self.wake_epic_if_running(epic_id),
            "epic {epic_id} has no running desired row"
        );
    }

    /// Make a running epic due, returning false after it reaches a stop.
    pub fn wake_epic_if_running(&self, epic_id: &str) -> bool {
        let connection = rusqlite::Connection::open(self.anvil.join("state.db"))
            .expect("open desired-work clock");
        let affected = connection
            .execute(
                "UPDATE desired_work SET next_wake_at = ?1, \
                 reconcile_lease_until = CASE WHEN reconcile_token IS NULL THEN NULL ELSE ?1 END \
                 WHERE subject_kind = 'epic' AND subject_id = ?2 AND desired_state = 'running'",
                rusqlite::params!["2000-01-01T00:00:00.000000000Z", epic_id],
            )
            .expect("wake desired epic");
        affected == 1
    }

    /// Drive one bounded epic frontier iteration through `supervise --once`.
    /// The returned shape preserves concise assertions while the exercised
    /// production surface is exclusively the supervisor ore pass.
    pub fn reconcile_epic(&self, epic_id: &str) -> (i32, Value) {
        self.wake_epic(epic_id);
        let (code, tick) = self.forged(&["supervise", "--once"]);
        if code != 0 {
            return (code, tick);
        }
        let subject = tick["result"]["orePass"]["subjects"]
            .as_array()
            .and_then(|subjects| {
                subjects
                    .iter()
                    .find(|subject| subject["epicId"] == json!(epic_id))
            });
        let Some(subject) = subject else {
            return (code, tick);
        };
        let result = subject["result"].clone();
        let projected = match subject["action"].as_str() {
            Some("progress") => json!({"progress": result}),
            Some("waiting") => json!({"waiting": result}),
            Some("stopped") => json!({
                "stopped": result
                    .get("inputRequired")
                    .cloned()
                    .unwrap_or(result),
            }),
            Some("backoff") => json!({"backoff": subject["error"].clone()}),
            _ => json!({"pass": subject}),
        };
        (
            code,
            json!({
                "ok": true,
                "reused": false,
                "operationId": Value::Null,
                "result": projected,
                "error": Value::Null,
            }),
        )
    }

    /// Reconcile an epic until its pass reports a durable stop. Loop-mode
    /// epics settle through real supervisor cadences and detached child
    /// controllers, so the bound is a wall-clock deadline sized for a loaded
    /// CI runner, never an iteration count.
    pub fn drive_epic_to_stop(&self, epic_id: &str) -> (i32, Value) {
        let mut last = Value::Null;
        let deadline = std::time::Instant::now() + std::time::Duration::from_secs(240);
        while std::time::Instant::now() < deadline {
            let (code, value) = self.reconcile_epic(epic_id);
            if code != 0 || value["result"]["stopped"].is_object() {
                return (code, value);
            }
            last = value;
            std::thread::sleep(std::time::Duration::from_millis(50));
        }
        panic!("epic {epic_id} did not reach a durable stop: {last}")
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

    /// The newest numeric attempt directory for one packet, if execution has
    /// created one. Provider runtime and immutable evidence are attempt-scoped.
    pub fn latest_attempt_dir(&self, run_id: &str, stage: &str, seq: i64) -> Option<PathBuf> {
        std::fs::read_dir(self.packet_dir(run_id, stage, seq).join("attempts"))
            .ok()?
            .filter_map(Result::ok)
            .filter_map(|entry| {
                let id = entry.file_name().to_str()?.parse::<i64>().ok()?;
                Some((id, entry.path()))
            })
            .max_by_key(|(id, _)| *id)
            .map(|(_, path)| path)
    }
}

/// Whether `pid` names a live process, via `/bin/kill -0` — a probe, no
/// signal delivered.
pub fn pid_alive(pid: i32) -> bool {
    Command::new("/bin/kill")
        .args(["-0", &pid.to_string()])
        .stderr(Stdio::null())
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
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

// ------------------------------------------------------ inventory fixtures

/// Create a bare run row — what `run_start` writes for a slice.
pub fn fabricate_run(env: &TestEnv, run_id: &str) {
    let ledger = env.ledger();
    ledger
        .create_run(forged_ledger::NewRun {
            run_id: forged_types::RunId::new(run_id).expect("run id"),
            work_id: format!("bead-{run_id}"),
            repo: env.repos.repo.to_string_lossy().into_owned(),
            base_ref: env.repos.base.clone(),
            branch: format!("forged/{run_id}"),
        })
        .expect("create run");
    ledger.close().expect("close");
}

/// Start an epic the way `epic_start` does: ONE `forged.epic.started` event
/// under the epic work id and NO run row — the combination production
/// actually produces. A fixture that also created a run row would prove
/// nothing about epic discovery.
pub fn fabricate_epic(env: &TestEnv, epic_id: &str) {
    let ledger = env.ledger();
    let repo = forged_types::normalize_repository_path(&env.repos.repo.to_string_lossy())
        .expect("canonical fixture repo");
    let label = forged_types::repository_label(&repo).expect("fixture repo label");
    let title = format!("Epic {epic_id}");
    let identity = forged_types::WorkIdentityV1 {
        schema: forged_types::WORK_IDENTITY_SCHEMA_V1.to_owned(),
        subject: forged_types::WorkIdentitySubjectV1 {
            kind: forged_types::WorkIdentitySubjectKind::Epic,
            id: epic_id.to_owned(),
        },
        work: forged_types::WorkIdentityWorkV1 {
            id: epic_id.to_owned(),
            title: Some(title.clone()),
            revision: None,
        },
        repository: Some(forged_types::WorkIdentityRepositoryV1 {
            path: repo.clone(),
            label: label.clone(),
        }),
        project: None,
        epic: None,
        display_title: forged_types::work_display_title(
            epic_id,
            Some(&title),
            Some(&label),
            None,
            None,
        ),
        captured_at: "2026-01-01T00:00:00.000000000Z".to_owned(),
        source: forged_types::WorkIdentitySource::Durable,
    };
    ledger
        .append_epic_started_with_identity(
            epic_id,
            json!({
                "schema": "forged.epic/1",
                "epicId": epic_id,
                "title": title,
                "repo": repo,
                "specPath": env.spec.to_string_lossy(),
                "baseRef": env.repos.base,
                "integrationBranch": format!("forged/epic-{epic_id}"),
                "children": [],
            }),
            identity,
        )
        .expect("epic started event");
    ledger.close().expect("close");
}

// ------------------------------------------------------- App render harness

/// One App view as an operator reads it: every rendered node that carries
/// text, in document order, plus those texts joined by newlines.
pub struct Rendered {
    pub nodes: Vec<Value>,
    pub text: String,
}

impl Rendered {
    /// What clicking each pickable card would ask the host for. Empty when
    /// nothing is pickable, which is itself an assertion worth making.
    pub fn picks(&self) -> Vec<Value> {
        self.nodes
            .iter()
            .filter_map(|node| node.get("picks").cloned())
            .filter(|picks| !picks.is_null())
            .collect()
    }

    /// The spend header's cost subtitle — the line that either splits billed
    /// from imputed spend or claims the provider billed all of it.
    pub fn spend_subtitle(&self) -> String {
        let cost = self
            .nodes
            .iter()
            .position(|node| node["class"] == json!("spend__k") && node["text"] == json!("cost"))
            .expect("the spend header renders a cost stat");
        self.nodes
            .get(cost + 1)
            .filter(|node| node["class"] == json!("spend__sub"))
            .and_then(|node| node["text"].as_str())
            .unwrap_or_default()
            .to_owned()
    }

    /// The value under one `spend__k` key, e.g. `"priced attempts"`.
    pub fn stat(&self, key: &str) -> String {
        let at = self
            .nodes
            .iter()
            .position(|node| node["class"] == json!("spend__k") && node["text"] == json!(key));
        at.and_then(|at| at.checked_sub(1))
            .and_then(|at| self.nodes.get(at))
            .and_then(|node| node["text"].as_str())
            .unwrap_or_default()
            .to_owned()
    }
}

/// Resolve a `node` able to run the render harnesses, or SKIP loudly.
///
/// The App lives in `assets/overview.html`, which ships no JS toolchain and
/// no module boundary; a harness lifts one view function out of it and runs
/// it against a DOM shim. Without a node on PATH the App's own render cannot
/// be exercised, so the test says so rather than passing on a
/// re-implementation of what the asset does.
pub fn require_node() -> Option<String> {
    let ok = Command::new("node")
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .is_ok_and(|status| status.success());
    if ok {
        return Some("node".to_owned());
    }
    eprintln!("SKIP: no `node` on PATH; the App render-level test was not run");
    None
}

/// Render `data`'s Cost tab through `assets/overview.html` itself.
pub fn render_cost(node: &str, data: &Value) -> Rendered {
    render(
        node,
        concat!(env!("CARGO_MANIFEST_DIR"), "/tests/support/render_cost.mjs"),
        data,
    )
}

/// What one envelope produced after the App's own `ingest` and `render`.
///
/// [`Rendered`] reports a single view called directly. This reports the
/// DISPATCH: which branch of `render` an envelope reached, and the identity,
/// chips, chrome and `state.args` it left behind on the way.
pub struct Dispatched {
    pub view: Vec<Value>,
    /// Identity-strip navigation lives outside `#view`; report it separately
    /// so return-to-portfolio clicks are part of the dispatch contract.
    pub subident: Vec<Value>,
    pub text: String,
    pub ident: String,
    pub chips: Vec<String>,
    /// The attention rail, each item `{label, detail}`. It is drawn outside
    /// `#view`, so a payload whose subject IS what needs a human is not
    /// observable from `view` alone.
    pub rail: Vec<Value>,
    pub tabs_hidden: bool,
    pub controls_hidden: bool,
    pub args: Value,
    pub error: Value,
    /// The one visible sentence that opens the rendered surface.
    pub headline: String,
    /// Every model-context push captured from the same render dispatch.
    pub model_context: Vec<String>,
}

impl Dispatched {
    /// What clicking each pickable card would ask the host for.
    pub fn picks(&self) -> Vec<Value> {
        self.view
            .iter()
            .filter_map(|node| node.get("picks").cloned())
            .filter(|picks| !picks.is_null())
            .collect()
    }

    /// What clicking identity-strip navigation would ask the host for.
    pub fn navigation_picks(&self) -> Vec<Value> {
        self.subident
            .iter()
            .filter_map(|node| node.get("picks").cloned())
            .filter(|picks| !picks.is_null())
            .collect()
    }

    /// Parameter keys present before JSON serialization of navigation calls.
    pub fn navigation_param_keys(&self) -> Vec<Value> {
        self.subident
            .iter()
            .filter_map(|node| node.get("paramKeys").cloned())
            .collect()
    }

    /// The rail item drawn under one label, if any.
    pub fn rail_item(&self, label: &str) -> Option<&Value> {
        self.rail.iter().find(|item| item["label"] == json!(label))
    }
}

/// Drive one whole operation envelope through `ingest` and `render`.
///
/// `render_resolution` calls `viewResolution` directly, so it proves the
/// chooser draws and proves nothing about whether a resolution payload ever
/// reaches it — delete `render`'s `if (data.resolution)` branch and those
/// tests stay green. This enters where the host enters.
pub fn render_dispatch(node: &str, envelope: &Value) -> Dispatched {
    let out = harness_output(
        node,
        concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/tests/support/render_dispatch.mjs"
        ),
        envelope,
    );
    dispatched(out)
}

/// Drive the dispatch as a host that cannot proxy `tools/call` receives it.
pub fn render_dispatch_without_server_tools(node: &str, envelope: &Value) -> Dispatched {
    let out = harness_output_env(
        node,
        concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/tests/support/render_dispatch.mjs"
        ),
        envelope,
        &[("SERVER_TOOLS", "0")],
    );
    dispatched(out)
}

/// Drive a payload that arrives before a capable host finishes its handshake.
pub fn render_dispatch_before_server_tools(node: &str, envelope: &Value) -> Dispatched {
    let out = harness_output_env(
        node,
        concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/tests/support/render_dispatch.mjs"
        ),
        envelope,
        &[("SERVER_TOOLS", "0"), ("SERVER_TOOLS_AFTER_INGEST", "1")],
    );
    dispatched(out)
}

fn dispatched(out: Value) -> Dispatched {
    Dispatched {
        view: out["view"].as_array().cloned().unwrap_or_default(),
        subident: out["subident"].as_array().cloned().unwrap_or_default(),
        text: out["text"].as_str().unwrap_or_default().to_owned(),
        ident: out["ident"].as_str().unwrap_or_default().to_owned(),
        chips: out["chips"]
            .as_array()
            .map(|chips| {
                chips
                    .iter()
                    .map(|chip| chip.as_str().unwrap_or_default().to_owned())
                    .collect()
            })
            .unwrap_or_default(),
        rail: out["rail"].as_array().cloned().unwrap_or_default(),
        tabs_hidden: out["tabsHidden"].as_bool().unwrap_or(false),
        controls_hidden: out["controlsHidden"].as_bool().unwrap_or(false),
        args: out["args"].clone(),
        error: out["error"].clone(),
        headline: out["headline"].as_str().unwrap_or_default().to_owned(),
        model_context: out["modelContext"]
            .as_array()
            .map(|values| {
                values
                    .iter()
                    .filter_map(Value::as_str)
                    .map(str::to_owned)
                    .collect()
            })
            .unwrap_or_default(),
    }
}

/// The chooser as a host that cannot proxy `tools/call` receives it.
pub fn render_resolution_without_server_tools(node: &str, resolution: &Value) -> Rendered {
    let out = harness_output_env(
        node,
        concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/tests/support/render_resolution.mjs"
        ),
        resolution,
        &[("SERVER_TOOLS", "0")],
    );
    Rendered {
        nodes: out["nodes"].as_array().cloned().unwrap_or_default(),
        text: out["text"].as_str().unwrap_or_default().to_owned(),
    }
}

/// Render one `resolution` object's chooser through `assets/overview.html`
/// itself.
pub fn render_resolution(node: &str, resolution: &Value) -> Rendered {
    render(
        node,
        concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/tests/support/render_resolution.mjs"
        ),
        resolution,
    )
}

/// Render the epic Waves tab through `assets/overview.html` itself.
pub fn render_waves(node: &str, data: &Value) -> Value {
    harness_output(
        node,
        concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/tests/support/render_waves.mjs"
        ),
        data,
    )
}

/// Execute a split App through a deterministic MCP Apps host lifecycle.
pub fn run_split_app_host(node: &str, asset: &Path) -> Value {
    let harness = concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/tests/support/split_app_host.mjs"
    );
    let out = Command::new(node)
        .args([harness, asset.to_string_lossy().as_ref()])
        .output()
        .expect("spawn the split App host harness");
    assert!(
        out.status.success(),
        "the split App host harness failed for {}: {}",
        asset.display(),
        String::from_utf8_lossy(&out.stderr)
    );
    serde_json::from_slice(&out.stdout).expect("the split App harness prints one JSON object")
}

/// Execute one split App against an exact captured MCP tool result and an
/// explicit host scenario. The scenario crosses stdin so large structured
/// envelopes are never re-encoded as shell arguments. Each invocation owns a
/// fresh Node process and therefore a fresh resource context.
pub fn run_split_app_host_scenario(node: &str, asset: &Path, scenario: &Value) -> Value {
    let harness = concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/tests/support/split_app_host.mjs"
    );
    let mut child = Command::new(node)
        .args([harness, asset.to_string_lossy().as_ref(), "--scenario"])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("spawn the scenario split App host harness");
    serde_json::to_writer(
        child.stdin.as_mut().expect("scenario harness stdin"),
        scenario,
    )
    .expect("write split App host scenario");
    drop(child.stdin.take());
    let out = child
        .wait_with_output()
        .expect("wait for the scenario split App host harness");
    assert!(
        out.status.success(),
        "the scenario split App host harness failed for {}: {}",
        asset.display(),
        String::from_utf8_lossy(&out.stderr)
    );
    serde_json::from_slice(&out.stdout)
        .expect("the scenario split App harness prints one JSON object")
}

/// Exercise the Agent Sessions App's explicit read-only controls through the
/// same deterministic host, with `serverTools` deliberately enabled.
pub fn run_agent_sessions_host(node: &str, asset: &Path) -> Value {
    let harness = concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/tests/support/split_app_host.mjs"
    );
    let out = Command::new(node)
        .args([harness, asset.to_string_lossy().as_ref(), "--interactive"])
        .output()
        .expect("spawn the interactive Agent Sessions host harness");
    assert!(
        out.status.success(),
        "the interactive Agent Sessions harness failed for {}: {}",
        asset.display(),
        String::from_utf8_lossy(&out.stderr)
    );
    serde_json::from_slice(&out.stdout)
        .expect("the interactive Agent Sessions harness prints one JSON object")
}

fn render(node: &str, harness: &str, data: &Value) -> Rendered {
    let rendered = harness_output(node, harness, data);
    Rendered {
        nodes: rendered["nodes"].as_array().cloned().unwrap_or_default(),
        text: rendered["text"].as_str().unwrap_or_default().to_owned(),
    }
}

/// Run one render harness against the asset and return the JSON it printed.
fn harness_output(node: &str, harness: &str, data: &Value) -> Value {
    harness_output_env(node, harness, data, &[])
}

/// Run a render harness with extra environment — the App reads the host's
/// capabilities, so a test has to be able to render against a host that
/// lacks one.
fn harness_output_env(node: &str, harness: &str, data: &Value, env: &[(&str, &str)]) -> Value {
    let asset = concat!(env!("CARGO_MANIFEST_DIR"), "/assets/overview.html");
    let mut command = Command::new(node);
    for (key, value) in env {
        command.env(key, value);
    }
    let mut child = command
        .args([harness, asset])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("spawn the render harness");
    child
        .stdin
        .take()
        .expect("harness stdin")
        .write_all(data.to_string().as_bytes())
        .expect("write the projection to the harness");
    let out = child.wait_with_output().expect("render harness output");
    assert!(
        out.status.success(),
        "the App render harness failed: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    serde_json::from_slice(&out.stdout).expect("the harness prints one JSON object")
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
        Self::from_command(env.forged_cmd(&["mcp"]))
    }

    /// Spawn a prepared `forged mcp` command (e.g. over a bare HOME) and
    /// complete the initialize handshake.
    pub fn from_command(mut cmd: Command) -> Self {
        let mut child = cmd
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

    /// Call a tool and return the error result a malformed argument earns.
    /// An `invalid_params` refusal reaches the host as an `isError` tool
    /// result whose text is a deserialization message, NOT an operation
    /// envelope — dispatch never ran, so there is no envelope to read.
    pub fn call_tool_error_result(&mut self, name: &str, envelope: Value) -> Value {
        let result = self.call_tool_result(name, envelope);
        assert_eq!(
            result["isError"],
            json!(true),
            "tool {name} answered instead of refusing: {result}"
        );
        result
    }

    /// Call a tool and return its raw JSON-RPC result object.
    pub fn call_tool_result(&mut self, name: &str, envelope: Value) -> Value {
        self.request("tools/call", json!({"name": name, "arguments": envelope}))
            .get("result")
            .cloned()
            .unwrap_or(Value::Null)
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

    /// One declared tool, including extension metadata.
    pub fn tool(&mut self, name: &str) -> Value {
        let reply = self.request("tools/list", json!({}));
        reply
            .pointer("/result/tools")
            .and_then(Value::as_array)
            .into_iter()
            .flatten()
            .find(|tool| tool.get("name").and_then(Value::as_str) == Some(name))
            .cloned()
            .unwrap_or(Value::Null)
    }

    /// Resource URIs declared by the server.
    pub fn list_resources(&mut self) -> Vec<String> {
        let reply = self.request("resources/list", json!({}));
        reply
            .pointer("/result/resources")
            .and_then(Value::as_array)
            .into_iter()
            .flatten()
            .filter_map(|resource| resource.get("uri").and_then(Value::as_str))
            .map(str::to_owned)
            .collect()
    }

    /// One declared resource, including any extension metadata.
    pub fn resource(&mut self, uri: &str) -> Value {
        let reply = self.request("resources/list", json!({}));
        reply
            .pointer("/result/resources")
            .and_then(Value::as_array)
            .into_iter()
            .flatten()
            .find(|resource| resource.get("uri").and_then(Value::as_str) == Some(uri))
            .cloned()
            .unwrap_or(Value::Null)
    }

    /// Read one text resource.
    pub fn read_resource(&mut self, uri: &str) -> Value {
        self.request("resources/read", json!({"uri": uri}))
            .get("result")
            .cloned()
            .unwrap_or(Value::Null)
    }
}

impl Drop for McpClient {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}
