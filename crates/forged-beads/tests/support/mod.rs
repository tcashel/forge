//! Shared support for the bd-gated integration tests.
//!
//! Scratch-isolation contract: every bd child these tests spawn runs under a
//! scratch `HOME` and a scratch `BEADS_DIR` (plus a scratch `anvil_home` so
//! nothing lands under the real `~/.anvil`, including its `locks/`
//! directory), all under `CARGO_TARGET_TMPDIR`. The [`HomeBeadsGuard`] makes
//! the containment structural: a `~/.beads` that NEWLY APPEARS where none
//! existed before a scratch-HOME run means the HOME override leaked.

#![allow(dead_code)]

use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::OnceLock;

use forged_beads::BdConfig;
use serde_json::Value;

/// Snapshot guard for the REAL `$HOME/.beads`. `new()` snapshots whether it
/// exists — taken BEFORE any bd run, and that snapshot is the baseline. A
/// pre-existing `~/.beads` is expected machine state: the guard must NOT
/// fail, warn-and-stop, or delete anything for it; only a NEWLY APPEARING
/// `~/.beads` is a containment violation.
pub struct HomeBeadsGuard {
    existed_before: bool,
}

impl HomeBeadsGuard {
    /// Take the baseline snapshot. Bind as the FIRST statement of every
    /// bd-gated test: `let _guard = support::HomeBeadsGuard::new();`
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
                // Do not double-panic (that aborts the test binary); the leak
                // still must be loud.
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
    /// Scratch anvil home (write locks land here, never in the real
    /// `~/.anvil/locks`).
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

/// The wrapper config for a scratch area: scratch `HOME` override, scratch
/// `BEADS_DIR`, scratch anvil home, work_dir pinned to the scratch store.
pub fn cfg_for(bd: &Path, s: &Scratch) -> BdConfig {
    BdConfig {
        bd_path: bd.to_path_buf(),
        beads_dir: s.beads.clone(),
        home_override: Some(s.home.clone()),
        anvil_home: s.anvil.clone(),
        work_dir: s.beads.clone(),
        read_timeout_s: 30,
        write_timeout_s: 60,
    }
}

/// Build a RAW bd command against a scratch area with the same env allowlist
/// the crate uses: env_clear + PATH, scratch HOME, scratch BEADS_DIR,
/// BD_JSON_ENVELOPE=1, TMPDIR passthrough; cwd = the scratch store. Used for
/// store setup and for the deliberately-unwrapped race children.
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

/// Bring the scratch store into existence.
///
/// The spec's protocol is tried FIRST and unmodified: a fresh store is
/// initialized by its first `bd create`, and `bd init` is forbidden because
/// the P0 probe recorded it refusing temp paths as an "unsafe location". The
/// pinned sandboxed bd 1.2.1 contradicts both halves — `bd create` on an
/// empty `$BEADS_DIR` exits 1 with "no beads database found", and `bd init`
/// accepts a temp path — so the fallback fires ONLY on that exact refusal and
/// says so on stderr. That mismatch is a reported environment fact, not a
/// silent protocol change: the day a bd auto-initializes again, the fallback
/// stops running on its own.
///
/// CRITICAL, dogfood-proven: bd's workspace discovery lets a CWD-ancestor
/// `.beads` preempt an UNINITIALIZED `$BEADS_DIR` — and the operator's
/// machine-global `~/.beads` is an initialized ancestor of everything under
/// this repo's `CARGO_TARGET_TMPDIR`. Running an uninitialized-store command
/// with cwd inside the worktree once wrote into the REAL `~/.beads` despite
/// the scratch `HOME` and `BEADS_DIR`. So: every pre-store call runs from an
/// ancestor-clean cwd under the system temp dir, and the store is verified to
/// have actually landed in the scratch `BEADS_DIR` before any test writes a
/// bead. Once a store is INITIALIZED, `$BEADS_DIR` wins over ancestor
/// discovery (probe-verified), so every later bd child may safely use the
/// scratch store as its cwd.
pub fn init_store(bd: &Path, s: &Scratch) {
    let unique = s
        .root
        .file_name()
        .map(|n| n.to_string_lossy().into_owned())
        .unwrap_or_else(|| "scratch".to_string());
    let clean_cwd = std::env::temp_dir().join(format!("forged-beads-init-{unique}"));
    let _ = std::fs::remove_dir_all(&clean_cwd);
    std::fs::create_dir_all(&clean_cwd).expect("creating ancestor-clean cwd");
    let first = raw_bd(bd, s, &["create", "store bootstrap", "--json"])
        .current_dir(&clean_cwd)
        .output()
        .expect("spawning bd create");
    if !first.status.success() {
        let refusal = format!(
            "{}{}",
            String::from_utf8_lossy(&first.stdout),
            String::from_utf8_lossy(&first.stderr)
        );
        assert!(
            refusal.contains("no beads database found"),
            "bd create on a fresh store failed for an unexpected reason: {refusal}"
        );
        eprintln!(
            "NOTE bd/spec mismatch: this bd does NOT auto-initialize on first create \
             (\"no beads database found\"); initializing the scratch store explicitly"
        );
        let init = raw_bd(
            bd,
            s,
            // Inert init: a bare one writes CLAUDE.md, AGENTS.md, .claude/
            // and .agents/ into its cwd.
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
    }
    let _ = std::fs::remove_dir_all(&clean_cwd);
    // Belt and braces, and the containment check that covers BOTH paths: bd
    // must resolve the scratch store, never an ancestor's.
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

/// Resolve the sandboxed bd 1.2.x binary: `$FORGED_TEST_BD` if set, else
/// `~/.anvil/tools/bd-1.2.1/bin/bd` (the canonical operator-scoped
/// location), else `None` — the fallback is NEVER the PATH bd. Each
/// candidate is verified once per process via `version --json` under a
/// scratch `HOME`/`BEADS_DIR` (never the real `$HOME`, even for a version
/// check).
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
    let s = scratch("bd-version-verify");
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
                        .map(|ver| ver.starts_with("1.2."))
                })
                .unwrap_or(false)
        }
        _ => false,
    };
    let _ = std::fs::remove_dir_all(&s.root);
    ok
}

/// Resolve the sandboxed bd or SKIP loudly (eprintln + `None` for the
/// caller's early return) — presence is detected at runtime, never via a
/// cargo feature.
pub fn require_bd() -> Option<PathBuf> {
    match sandboxed_bd() {
        Some(bd) => Some(bd),
        None => {
            eprintln!(
                "SKIP: sandboxed bd 1.2.x not found (set FORGED_TEST_BD or install \
                 ~/.anvil/tools/bd-1.2.1/bin/bd); bd-gated test not run"
            );
            None
        }
    }
}
