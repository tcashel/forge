//! Shared helpers for forged-git integration tests: a hermetic git runner,
//! throwaway origin/clone repositories, and the fake `gh` shim.

#![allow(dead_code)]

use std::path::{Path, PathBuf};
use std::process::{Command, Output};
use std::sync::OnceLock;

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
