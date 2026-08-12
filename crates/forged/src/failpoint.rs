//! Env-driven failpoints for the kill-matrix falsifier, hand-rolled behind
//! the `failpoints` cargo feature — default off, so a release binary
//! carries no failpoint code.
//!
//! `FORGED_FAILPOINT=<site>` names exactly one site; `FORGED_FAILPOINT_MODE`
//! is `pause` (default) or `crash`. `pause` requires `FORGED_FAILPOINT_DIR`:
//! the process creates `<site>.reached` there and blocks until
//! `<site>.release` exists (polled ~50 ms); the test synchronizes on
//! `.reached` and releases by creating `.release`. `crash` calls
//! `std::process::abort()` at the site.
//!
//! Sites are fixed strings at forged-owned boundaries only:
//! `op.begin.before`, `op.begin.after`, `provider.spawn.before`,
//! `provider.spawn.after`, `bd.claim.before`, `bd.claim.after`,
//! `bd.reclaim.before`, `bd.reclaim.after`, `guardian.start`,
//! `git.push.before`, `git.push.after`, `gh.call.before`, `gh.call.after`.

/// Hit a failpoint site. A no-op unless the `failpoints` feature is on AND
/// `FORGED_FAILPOINT` names this exact site.
#[cfg(feature = "failpoints")]
pub fn hit(site: &str) {
    let Some(armed) = std::env::var_os("FORGED_FAILPOINT") else {
        return;
    };
    if armed.to_string_lossy() != site {
        return;
    }
    let mode = std::env::var_os("FORGED_FAILPOINT_MODE")
        .map(|m| m.to_string_lossy().into_owned())
        .unwrap_or_else(|| "pause".to_owned());
    match mode.as_str() {
        "crash" => std::process::abort(),
        _ => pause(site),
    }
}

#[cfg(feature = "failpoints")]
fn pause(site: &str) {
    let Some(dir) = std::env::var_os("FORGED_FAILPOINT_DIR") else {
        // A pause with nowhere to signal is unusable; crash loudly rather
        // than hang the test invisibly.
        eprintln!("failpoint {site}: pause mode requires FORGED_FAILPOINT_DIR");
        std::process::abort();
    };
    let dir = std::path::PathBuf::from(dir);
    let _ = std::fs::create_dir_all(&dir);
    let _ = std::fs::write(dir.join(format!("{site}.reached")), b"");
    let release = dir.join(format!("{site}.release"));
    while !release.exists() {
        std::thread::sleep(std::time::Duration::from_millis(50));
    }
}

/// Hit a failpoint site (feature off: compiled to nothing).
#[cfg(not(feature = "failpoints"))]
#[inline(always)]
pub fn hit(_site: &str) {}
