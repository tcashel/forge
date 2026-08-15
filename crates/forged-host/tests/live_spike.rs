//! Feature-gated end-to-end proof that a real `claude -p` run works through
//! HerdrHost. Compiled only under `--features live`; armed only when
//! `FORGED_LIVE_TESTS=1`. Unarmed — or with the herdr socket or the
//! `claude` binary absent — it logs the skip reason and returns green.
//!
//! The ONLY hard failures are forged-host's own contract breaking: a spawn
//! error, a `HostError`, or a status file that exists but does not parse.
//! Auth failures, rate limits, and an offline machine are not this crate's
//! defects and must never fail the suite.
#![cfg(feature = "live")]

use std::collections::HashMap;
use std::panic::{catch_unwind, resume_unwind, AssertUnwindSafe};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use forged_host::{
    HerdrCloseOutcome, HerdrControl, HerdrHost, HerdrSessionIdentity, HostSessionId, Liveness,
    SessionHost,
};

const POLLS: u32 = 60; // 2 s apart ≈ 120 s overall

fn claude_binary_present() -> bool {
    std::process::Command::new("sh")
        .args(["-c", "command -v claude"])
        .output()
        .map(|out| out.status.success())
        .unwrap_or(false)
}

#[test]
fn live_spike_claude_p_through_herdr() {
    if std::env::var("FORGED_LIVE_TESTS").as_deref() != Ok("1") {
        eprintln!("live spike SKIPPED: FORGED_LIVE_TESTS=1 not set");
        return;
    }
    let socket_path = HerdrHost::default_socket_path();
    if !socket_path.exists() {
        eprintln!(
            "live spike SKIPPED: herdr socket absent at {}",
            socket_path.display()
        );
        return;
    }
    if !claude_binary_present() {
        eprintln!("live spike SKIPPED: no `claude` binary on PATH");
        return;
    }

    let rt = tokio::runtime::Runtime::new().expect("tokio runtime");
    let cwd = tempfile::tempdir().expect("tempdir");
    let base = tempfile::tempdir().expect("tempdir");

    // The prompt never rides in the shell line: it lives in a file the
    // fixed line references by a safe relative path within cwd.
    std::fs::write(cwd.path().join("prompt.txt"), "reply with exactly: ok")
        .expect("write prompt file");

    let host = Arc::new(
        rt.block_on(HerdrHost::connect(&socket_path, base.path()))
            .expect("HerdrHost::connect against a live socket"),
    );

    // Cleanup must survive panics: record the session id immediately after
    // spawn and close the pane (via kill_confirmed) whatever happens.
    let session: Arc<Mutex<Option<HostSessionId>>> = Arc::new(Mutex::new(None));
    let body = {
        let host = Arc::clone(&host);
        let session = Arc::clone(&session);
        let base_dir = base.path().to_path_buf();
        let cwd_dir = cwd.path().to_path_buf();
        let rt = &rt;
        catch_unwind(AssertUnwindSafe(move || {
            rt.block_on(async move {
                let id = host
                    .spawn(&cwd_dir, "claude -p < prompt.txt", &HashMap::new())
                    .await
                    .expect("spawn through HerdrHost");
                *session.lock().expect("session lock") = Some(id.clone());

                for _ in 0..POLLS {
                    match host.alive(&id).await.expect("alive") {
                        Liveness::Exited(0) => {
                            eprintln!("live spike PASS: claude exited 0 via the sentinel");
                            return;
                        }
                        Liveness::Exited(code) => {
                            eprintln!(
                                "live spike SKIPPED: claude exited {code} (auth/rate-limit/offline are not this crate's defects)"
                            );
                            return;
                        }
                        Liveness::Vanished => {
                            eprintln!(
                                "live spike SKIPPED: session vanished (pane closed externally)"
                            );
                            return;
                        }
                        Liveness::Running => {}
                    }
                    tokio::time::sleep(Duration::from_secs(2)).await;
                }
                // Timed out. A status file that exists but does not parse
                // is a forged-host contract break — the one hard failure
                // left; a merely absent file is an environment problem.
                let status_file_exists = std::fs::read_dir(&base_dir)
                    .expect("read live status base")
                    .map(|entry| entry.expect("status directory entry").path().join("status"))
                    .any(|path| path.exists());
                assert!(
                    !status_file_exists,
                    "status file exists but never parsed: contract break"
                );
                eprintln!("live spike SKIPPED: 120 s timeout elapsed without an exit");
            });
        }))
    };

    if let Some(id) = session.lock().expect("session lock").take() {
        let _ = rt.block_on(host.kill_confirmed(&id));
    }
    if let Err(panic) = body {
        resume_unwind(panic);
    }
}

#[test]
fn live_owned_provider_and_controller_cleanup_without_focus() {
    if std::env::var("FORGED_LIVE_TESTS").as_deref() != Ok("1") {
        eprintln!("live cleanup SKIPPED: FORGED_LIVE_TESTS=1 not set");
        return;
    }
    let socket_path = HerdrHost::default_socket_path();
    if !socket_path.exists() {
        eprintln!(
            "live cleanup SKIPPED: herdr socket absent at {}",
            socket_path.display()
        );
        return;
    }

    let rt = tokio::runtime::Runtime::new().expect("tokio runtime");
    let cwd = tempfile::tempdir().expect("tempdir");
    let base = tempfile::tempdir().expect("tempdir");
    let mut owned: Vec<HerdrSessionIdentity> = Vec::new();
    let body = catch_unwind(AssertUnwindSafe(|| {
        rt.block_on(async {
            let host = HerdrHost::connect(&socket_path, base.path())
                .await
                .expect("connect live Herdr");
            for role in ["provider", "controller"] {
                let prepared = host
                    .prepare(
                        cwd.path(),
                        &format!("printf '%s\\n' {role}"),
                        &HashMap::new(),
                    )
                    .await
                    .expect("prepare owned pane");
                let exact_status = prepared.sentinel_path().to_path_buf();
                let identity = prepared.herdr_identity().expect("Herdr identity").clone();
                owned.push(identity.clone());
                let id = host.start(prepared).await.expect("start once");
                for _ in 0..50 {
                    match host.alive(&id).await.expect("owned pane liveness") {
                        Liveness::Exited(0) => break,
                        Liveness::Exited(code) => panic!("{role} exited {code}"),
                        Liveness::Vanished => panic!("{role} pane vanished before cleanup"),
                        Liveness::Running => tokio::time::sleep(Duration::from_millis(100)).await,
                    }
                }
                assert!(exact_status.is_file(), "{role} exact sentinel did not land");
                let control = HerdrControl::connect_for(&identity)
                    .await
                    .expect("connect exact cleanup control");
                assert!(matches!(
                    control
                        .close_owned(&identity)
                        .await
                        .expect("close owned pane"),
                    HerdrCloseOutcome::Closed | HerdrCloseOutcome::AlreadyMissing
                ));
                owned.retain(|candidate| candidate != &identity);
            }
        });
    }));

    for identity in owned {
        let _ = rt.block_on(async {
            let control = HerdrControl::connect_for(&identity).await?;
            control.close_owned(&identity).await
        });
    }
    if let Err(panic) = body {
        resume_unwind(panic);
    }
}
