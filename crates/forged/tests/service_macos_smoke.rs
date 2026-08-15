//! Separately armed launchd smoke. Normal CI never mutates launchd.

#![cfg(target_os = "macos")]

use std::path::{Path, PathBuf};
use std::process::Command;

use serde_json::Value;

struct Cleanup {
    home: PathBuf,
    anvil: PathBuf,
}

impl Drop for Cleanup {
    fn drop(&mut self) {
        let _ = forged(&self.home, &self.anvil, &["service", "uninstall"]);
    }
}

fn forged(home: &Path, anvil: &Path, args: &[&str]) -> (bool, Value) {
    let output = Command::new(env!("CARGO_BIN_EXE_forged"))
        .args(args)
        .env("HOME", home)
        .env("ANVIL_HOME", anvil)
        .env("BEADS_DIR", anvil.join("beads"))
        .env_remove("FORGED_CONFIG")
        .stdin(std::process::Stdio::null())
        .output()
        .expect("run isolated forged service command");
    let value = serde_json::from_slice(&output.stdout).unwrap_or_else(|error| {
        panic!(
            "service JSON: {error}; stdout={} stderr={}",
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        )
    });
    (output.status.success(), value)
}

#[test]
#[ignore = "set FORGED_SERVICE_SMOKE_TEST=1 and run explicitly on macOS"]
fn isolated_launchd_install_status_uninstall() {
    assert_eq!(
        std::env::var("FORGED_SERVICE_SMOKE_TEST").as_deref(),
        Ok("1"),
        "the real-launchd smoke requires explicit arming"
    );
    let temp = tempfile::tempdir().expect("tempdir");
    let root = std::fs::canonicalize(temp.path()).expect("canonical tempdir");
    let home = root.join("home");
    let anvil = root.join("anvil");
    std::fs::create_dir_all(&home).expect("isolated home");
    std::fs::create_dir_all(anvil.join("beads")).expect("isolated anvil");
    let cleanup = Cleanup {
        home: home.clone(),
        anvil: anvil.clone(),
    };

    let (ok, installed) = forged(&home, &anvil, &["service", "install"]);
    assert!(ok, "install: {installed}");
    let (ok, status) = forged(&home, &anvil, &["service", "status"]);
    assert!(ok, "status: {status}");
    assert!(matches!(
        status["result"]["state"].as_str(),
        Some("running" | "degraded")
    ));
    let (ok, removed) = forged(&home, &anvil, &["service", "uninstall"]);
    assert!(ok, "uninstall: {removed}");
    std::mem::forget(cleanup);
}
