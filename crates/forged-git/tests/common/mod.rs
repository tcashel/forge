//! Shared helpers for forged-git integration tests: a hermetic git runner,
//! throwaway origin/clone repositories, and the fake `gh` shim.

#![allow(dead_code)]

use std::path::{Path, PathBuf};
use std::process::{Command, Output};
use std::sync::OnceLock;

use forged_git::GhClient;

/// Run git hermetically: no user/global/system config, fixed identity, no
/// signing. Panics on failure — tests own their setup.
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

/// Same hermetic environment, but the caller inspects the outcome.
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
    /// Keeps the temp tree alive for the test's lifetime.
    pub tmp: tempfile::TempDir,
    /// Canonicalized temp root.
    pub root: PathBuf,
    /// The origin repository (non-bare, local path remote).
    pub origin: PathBuf,
    /// A clone of origin with `refs/remotes/origin/<base>` populated.
    pub repo: PathBuf,
    /// An empty runs root for prepare/retire.
    pub runs_root: PathBuf,
    /// The base branch name checked into origin.
    pub base: String,
}

/// Build an origin repo on branch `base` with one commit, clone it, and lay
/// out an empty runs root. Paths are canonicalized so what git records
/// matches what the tests compare.
pub fn setup_repos(base: &str) -> Repos {
    let tmp = tempfile::tempdir().expect("tempdir");
    let root = tmp.path().canonicalize().expect("canonicalize temp root");

    let origin = root.join("origin");
    std::fs::create_dir(&origin).expect("mkdir origin");
    git(&origin, &["init", "-b", base]);
    std::fs::write(origin.join("f.txt"), "base\n").expect("seed file");
    git(&origin, &["add", "f.txt"]);
    git(&origin, &["commit", "-m", "base commit"]);

    let repo = root.join("repo");
    git(
        &root,
        &[
            "clone",
            origin.to_str().expect("utf8 origin path"),
            repo.to_str().expect("utf8 repo path"),
        ],
    );

    let runs_root = root.join("runs");
    std::fs::create_dir(&runs_root).expect("mkdir runs root");

    Repos {
        tmp,
        root,
        origin,
        repo,
        runs_root,
        base: base.to_owned(),
    }
}

/// Add and commit a file in `dir`.
pub fn commit_file(dir: &Path, name: &str, contents: &str, message: &str) {
    std::fs::write(dir.join(name), contents).expect("write file");
    git(dir, &["add", name]);
    git(dir, &["commit", "-m", message]);
}

/// The sha of `rev` in `dir`.
pub fn rev_parse(dir: &Path, rev: &str) -> String {
    git(dir, &["rev-parse", rev]).trim().to_owned()
}

/// Move the test process into a non-git temp directory (once per process,
/// leaked so the cwd always exists). GhClient behavior must not depend on the
/// working directory; every path the tests use is absolute.
pub fn enter_non_git_cwd() {
    static CWD: OnceLock<PathBuf> = OnceLock::new();
    let dir = CWD.get_or_init(|| {
        let tmp = tempfile::tempdir().expect("tempdir");
        let path = tmp.path().canonicalize().expect("canonicalize");
        std::mem::forget(tmp);
        path
    });
    std::env::set_current_dir(dir).expect("chdir to non-git temp dir");
}

pub const SHIM_SCRIPT: &str = r#"#!/bin/sh
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
    esac ;;
  api)
    case "$*" in
      *--method\ PATCH*/pulls/*) key=update_pr ;;
      *--method\ POST*/pulls*) key=create_pr ;;
      *--method\ POST*/comments*) key=post_comment ;;
      */comments*) key=list_comments ;;
      *) key=repo ;;
    esac ;;
esac
code=0
if [ -f "$GH_SHIM_DIR/$key.exit" ]; then code=$(cat "$GH_SHIM_DIR/$key.exit"); fi
if [ -f "$GH_SHIM_DIR/$key.stderr" ]; then cat "$GH_SHIM_DIR/$key.stderr" >&2; fi
if [ -f "$GH_SHIM_DIR/$key.stdout" ]; then cat "$GH_SHIM_DIR/$key.stdout"; fi
exit "$code"
"#;

/// A fake `gh`: an executable script that appends every invocation to a call
/// log and replies from per-endpoint scenario files.
pub struct Shim {
    tmp: tempfile::TempDir,
    /// Directory holding the `gh` script (for PATH-prepend tests).
    pub bin_dir: PathBuf,
    /// The scenario directory: `<key>.stdout` / `<key>.stderr` / `<key>.exit`.
    pub scenario_dir: PathBuf,
    /// The inert data file the script is written to. Nothing ever execs it,
    /// and it is deliberately NOT the inode published as `bin/gh`.
    pub script_source: PathBuf,
    log: PathBuf,
    program: PathBuf,
}

impl Shim {
    pub fn new() -> Self {
        use std::os::unix::fs::PermissionsExt;

        let tmp = tempfile::tempdir().expect("tempdir");
        let root = tmp.path().canonicalize().expect("canonicalize");
        let bin_dir = root.join("bin");
        let scenario_dir = root.join("scenarios");
        std::fs::create_dir(&bin_dir).expect("mkdir bin");
        std::fs::create_dir(&scenario_dir).expect("mkdir scenarios");
        let program = bin_dir.join("gh");
        // ETXTBSY is inode-scoped: the kernel refuses to exec any inode a
        // process holds a writable descriptor to, and rename preserves the
        // inode -- so staging plus rename would still publish the very inode
        // this process wrote. The test binary is multithreaded and forks
        // constantly, so a sibling spawning inside that write would inherit
        // the descriptor and make `bin/gh` briefly unexecutable.
        //
        // So this process never opens the exec'd inode for writing at all.
        // The script lands in an inert data file that nothing execs, and the
        // published inode is created by a child `cp` -- single-threaded,
        // never forks, and exited before `new` returns, so no descriptor to
        // it can outlive the copy or be inherited by anything. Mode is set on
        // the staging name, so `gh` is never observable without it.
        let script_source = root.join("gh.script");
        std::fs::write(&script_source, SHIM_SCRIPT).expect("write shim source");
        let staging = bin_dir.join("gh.staging");
        let copied = Command::new("cp")
            .arg(&script_source)
            .arg(&staging)
            .status()
            .expect("cp spawns");
        assert!(copied.success(), "cp published the shim: {copied}");
        std::fs::set_permissions(&staging, std::fs::Permissions::from_mode(0o755))
            .expect("chmod shim");
        std::fs::rename(&staging, &program).expect("publish shim");
        let log = root.join("calls.log");
        Self {
            tmp,
            bin_dir,
            scenario_dir,
            script_source,
            log,
            program,
        }
    }

    /// A GhClient wired to the shim via `with_program`.
    pub fn client(&self) -> GhClient {
        GhClient::with_program(&self.program)
            .env("GH_SHIM_LOG", &self.log)
            .env("GH_SHIM_DIR", &self.scenario_dir)
    }

    /// A GhClient resolving plain `gh` through a child-only PATH prepend.
    pub fn path_client(&self) -> GhClient {
        let inherited = std::env::var("PATH").unwrap_or_default();
        let path = format!("{}:{inherited}", self.bin_dir.display());
        GhClient::new()
            .env("PATH", path)
            .env("GH_SHIM_LOG", &self.log)
            .env("GH_SHIM_DIR", &self.scenario_dir)
    }

    /// Write (or overwrite) a scenario file: `kind` is `stdout`, `stderr`,
    /// or `exit`.
    pub fn set(&self, key: &str, kind: &str, contents: &str) {
        std::fs::write(self.scenario_dir.join(format!("{key}.{kind}")), contents)
            .expect("write scenario");
    }

    /// Every recorded invocation, oldest first, one argv per entry.
    pub fn calls(&self) -> Vec<Vec<String>> {
        let raw = match std::fs::read_to_string(&self.log) {
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
}

/// A canned PrMeta JSON body in gh `--json` camelCase form.
pub fn pr_json(
    number: u64,
    state: &str,
    is_draft: bool,
    base: &str,
    head: &str,
    url: &str,
) -> String {
    format!(
        concat!(
            "{{\"number\":{},\"state\":\"{}\",\"isDraft\":{},",
            "\"baseRefName\":\"{}\",\"headRefName\":\"{}\",\"url\":\"{}\"}}"
        ),
        number, state, is_draft, base, head, url
    )
}
