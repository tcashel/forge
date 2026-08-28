//! [`BdConfig`]: explicit-config resolution for every bd child.
//!
//! The wrapper never discovers bd via PATH: the binary path always arrives via
//! explicit config, so this crate's behavior never depends on what a machine
//! happens to have installed.

use std::ffi::OsString;
use std::path::PathBuf;

/// Configuration governing every bd child this crate spawns.
#[derive(Debug, Clone)]
pub struct BdConfig {
    /// Absolute path to the bd binary. `Command::new` is always given this
    /// path, never the literal `"bd"` — no PATH lookup ever. Enforced at
    /// runtime, not just by convention: the crate's single spawn point
    /// (`invoke::run_bd`) refuses a non-absolute `bd_path` before spawning,
    /// because these fields are public and a relative name would make
    /// `Command` search `PATH`.
    pub bd_path: PathBuf,
    /// Exported as `BEADS_DIR` to every bd child.
    pub beads_dir: PathBuf,
    /// When set, exported as `HOME` to bd children so bd 1.2.x's
    /// machine-global `~/.beads` lands there, not in the real home. Tests and
    /// doctor always set it to a scratch dir; production live use leaves it
    /// `None`. Non-bd children (`kill`, `ps`, `gh`) never receive it — they
    /// inherit the process's real environment.
    pub home_override: Option<PathBuf>,
    /// Where the write-lock files live (`<anvil_home>/locks/...`). Defaults
    /// from `$ANVIL_HOME`, else `~/.anvil`.
    pub anvil_home: PathBuf,
    /// Every bd child's `current_dir` (default: `beads_dir`) — NEVER the
    /// process's inherited cwd: bd resolves git context from CWD and its
    /// auto-export path (`export.git-add`, cmd/bd/export_auto.go) will
    /// `git add` files into an enclosing repo, so a bd child must never run
    /// inside the forge worktree.
    pub work_dir: PathBuf,
    /// Timeout in seconds for read invocations (default 30).
    pub read_timeout_s: u64,
    /// Timeout in seconds for write invocations and the write flock
    /// acquisition (default 60).
    pub write_timeout_s: u64,
}

impl BdConfig {
    /// Build a config with the defaults the spec pins: no `HOME` override,
    /// `anvil_home` from `$ANVIL_HOME` else `~/.anvil`, `work_dir` equal to
    /// `beads_dir`, and 30 s / 60 s read/write timeouts.
    pub fn new(bd_path: PathBuf, beads_dir: PathBuf) -> Self {
        let anvil_home = anvil_home_from(std::env::var_os("ANVIL_HOME"), std::env::var_os("HOME"));
        Self {
            bd_path,
            work_dir: beads_dir.clone(),
            beads_dir,
            home_override: None,
            anvil_home,
            read_timeout_s: 30,
            write_timeout_s: 60,
        }
    }
}

/// Resolve the anvil home: `$ANVIL_HOME` when set, else `$HOME/.anvil`, else
/// the relative `.anvil` as a degenerate last resort (no home at all).
fn anvil_home_from(anvil_home: Option<OsString>, home: Option<OsString>) -> PathBuf {
    match (anvil_home, home) {
        (Some(a), _) => PathBuf::from(a),
        (None, Some(h)) => PathBuf::from(h).join(".anvil"),
        (None, None) => PathBuf::from(".anvil"),
    }
}

/// Return whether `version` is valid semver at or above the bd version floor,
/// `1.2.1`. This predicate alone does not establish compatibility; the
/// bd-gated import round-trip test remains authoritative. Prereleases of the
/// minimum itself are below the floor.
pub fn supported_bd_version(version: &str) -> bool {
    let (without_build, build) = version
        .split_once('+')
        .map_or((version, None), |(core, build)| (core, Some(build)));
    if build.is_some_and(|value| !valid_semver_identifiers(value, false)) {
        return false;
    }
    let (core, prerelease) = without_build
        .split_once('-')
        .map_or((without_build, None), |(core, prerelease)| {
            (core, Some(prerelease))
        });
    if prerelease.is_some_and(|value| !valid_semver_identifiers(value, true)) {
        return false;
    }
    let mut parts = core.split('.');
    let parse = |part: Option<&str>| {
        let part = part?;
        if part.is_empty() || (part.len() > 1 && part.starts_with('0')) {
            return None;
        }
        part.parse::<u64>().ok()
    };
    let version = match (
        parse(parts.next()),
        parse(parts.next()),
        parse(parts.next()),
    ) {
        (Some(major), Some(minor), Some(patch)) => (major, minor, patch),
        _ => return false,
    };
    if parts.next().is_some() {
        return false;
    }
    version > (1, 2, 1) || (version == (1, 2, 1) && prerelease.is_none())
}

fn valid_semver_identifiers(value: &str, reject_numeric_leading_zero: bool) -> bool {
    value.split('.').all(|identifier| {
        !identifier.is_empty()
            && identifier
                .bytes()
                .all(|byte| byte.is_ascii_alphanumeric() || byte == b'-')
            && !(reject_numeric_leading_zero
                && identifier.len() > 1
                && identifier.starts_with('0')
                && identifier.bytes().all(|byte| byte.is_ascii_digit()))
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn anvil_home_prefers_explicit_env() {
        assert_eq!(
            anvil_home_from(Some("/x/anvil".into()), Some("/home/u".into())),
            PathBuf::from("/x/anvil")
        );
        assert_eq!(
            anvil_home_from(None, Some("/home/u".into())),
            PathBuf::from("/home/u/.anvil")
        );
        assert_eq!(anvil_home_from(None, None), PathBuf::from(".anvil"));
    }

    #[test]
    fn new_defaults_work_dir_to_beads_dir_and_timeouts() {
        let cfg = BdConfig::new(PathBuf::from("/opt/bd"), PathBuf::from("/tmp/store"));
        assert_eq!(cfg.work_dir, cfg.beads_dir);
        assert_eq!(cfg.home_override, None);
        assert_eq!(cfg.read_timeout_s, 30);
        assert_eq!(cfg.write_timeout_s, 60);
    }

    #[test]
    fn bd_version_accepts_every_semver_at_or_above_1_2_1() {
        for version in ["1.2.1", "1.2.1+build.7", "1.3.0-rc.1", "2.0.0", "10.0.0"] {
            assert!(supported_bd_version(version), "{version} should pass");
        }
    }

    #[test]
    fn bd_version_rejects_older_prerelease_and_malformed_values() {
        for version in [
            "1.2.0",
            "1.2.1-rc.1",
            "1.1.99",
            "1.2",
            "01.2.1",
            "1.2.1-01",
            "1.2.1+bad+build",
            "not-semver",
        ] {
            assert!(!supported_bd_version(version), "{version} should fail");
        }
    }
}
