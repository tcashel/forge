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
    HerdrCloseOutcome, HerdrControl, HerdrHost, HerdrLayoutInspection, HerdrLayoutTarget,
    HerdrSessionIdentity, HostSessionId, Liveness, SessionHost, HERDR_PROTOCOL_VERSION,
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

/// Opt-in proof for the durable layout-specific protocol seam. It creates two
/// unfocused tabs in one private workspace, reuses the first tab for two
/// prepared sessions, verifies exact tab membership, and removes children
/// before both exact roots. Nothing runs unless the operator explicitly arms
/// live tests.
#[test]
fn live_layout_tabs_reuse_exact_roots_and_cleanup() {
    if std::env::var("FORGED_LIVE_TESTS").as_deref() != Ok("1") {
        eprintln!("live layout SKIPPED: FORGED_LIVE_TESTS=1 not set");
        return;
    }
    let socket_path = HerdrHost::default_socket_path();
    if !socket_path.exists() {
        eprintln!(
            "live layout SKIPPED: herdr socket absent at {}",
            socket_path.display()
        );
        return;
    }

    let rt = tokio::runtime::Runtime::new().expect("tokio runtime");
    let cwd = tempfile::tempdir().expect("tempdir");
    let base = tempfile::tempdir().expect("tempdir");
    let mut cleanup: Vec<HerdrSessionIdentity> = Vec::new();
    let body = catch_unwind(AssertUnwindSafe(|| {
        rt.block_on(async {
            let host = HerdrHost::connect(&socket_path, base.path())
                .await
                .expect("connect live Herdr");
            let nonce = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .expect("wall clock")
                .as_nanos();
            let workspace = host
                .ensure_workspace(&format!(
                    "forged-live-layout-{}-{nonce}",
                    std::process::id()
                ))
                .await
                .expect("create private workspace without focus");
            let first = host
                .create_layout_tab(
                    &workspace,
                    "forged live layout one",
                    cwd.path(),
                    &HashMap::new(),
                )
                .await
                .expect("create first unfocused tab");
            let second = host
                .create_layout_tab(
                    &workspace,
                    "forged live layout two",
                    cwd.path(),
                    &HashMap::new(),
                )
                .await
                .expect("create second unfocused tab");
            assert_ne!(
                first.tab_id, second.tab_id,
                "subjects must get distinct tabs"
            );
            assert_ne!(
                first.root_pane_id, second.root_pane_id,
                "subjects must get distinct root anchors"
            );
            for created in [&first, &second] {
                cleanup.push(HerdrSessionIdentity::from_durable(
                    created.root_pane_id.clone(),
                    socket_path.clone(),
                    HERDR_PROTOCOL_VERSION,
                ));
            }

            let target = HerdrLayoutTarget::new(
                "live-layout:one",
                workspace.clone(),
                first.tab_id.clone(),
                first.root_pane_id.clone(),
                Vec::<String>::new(),
            )
            .expect("first layout target");
            let host = host.with_layout(target);
            let prepared = host
                .prepare(cwd.path(), "printf 'layout-one\\n'", &HashMap::new())
                .await
                .expect("prepare first child");
            assert_eq!(prepared.herdr_layout_id(), Some("live-layout:one"));
            let first_child = prepared
                .herdr_identity()
                .expect("first child identity")
                .clone();
            cleanup.push(first_child.clone());
            host.start(prepared).await.expect("start first child");

            let target = HerdrLayoutTarget::new(
                "live-layout:one",
                workspace.clone(),
                first.tab_id.clone(),
                first.root_pane_id.clone(),
                [first_child.pane_id().to_owned()],
            )
            .expect("reused layout target");
            let host = host.with_layout(target);
            let prepared = host
                .prepare(cwd.path(), "printf 'layout-two\\n'", &HashMap::new())
                .await
                .expect("prepare second child in same tab");
            assert_eq!(prepared.herdr_layout_id(), Some("live-layout:one"));
            let second_child = prepared
                .herdr_identity()
                .expect("second child identity")
                .clone();
            cleanup.push(second_child.clone());
            host.start(prepared).await.expect("start second child");

            let HerdrLayoutInspection::Present(snapshot) = host
                .inspect_layout(&first.root_pane_id)
                .await
                .expect("inspect exact first root")
            else {
                panic!("first layout disappeared before cleanup")
            };
            assert_eq!(snapshot.workspace_id, workspace);
            assert_eq!(snapshot.tab_id, first.tab_id);
            assert!(snapshot
                .panes
                .iter()
                .any(|pane| pane.pane_id == first_child.pane_id()));
            assert!(snapshot
                .panes
                .iter()
                .any(|pane| pane.pane_id == second_child.pane_id()));

            // Child panes settle first; only then are the exact idle roots
            // eligible for cleanup. No workspace- or label-wide close exists.
            for identity in [second_child, first_child] {
                let control = HerdrControl::connect_for(&identity)
                    .await
                    .expect("connect exact child cleanup");
                control
                    .close_owned(&identity)
                    .await
                    .expect("close exact child");
                cleanup.retain(|candidate| candidate != &identity);
            }
            for created in [first, second] {
                let identity = HerdrSessionIdentity::from_durable(
                    created.root_pane_id,
                    socket_path.clone(),
                    HERDR_PROTOCOL_VERSION,
                );
                let control = HerdrControl::connect_for(&identity)
                    .await
                    .expect("connect exact root cleanup");
                assert!(matches!(
                    control
                        .close_owned(&identity)
                        .await
                        .expect("close exact root"),
                    HerdrCloseOutcome::Closed | HerdrCloseOutcome::AlreadyMissing
                ));
                cleanup.retain(|candidate| candidate != &identity);
            }
        });
    }));

    for identity in cleanup {
        let _ = rt.block_on(async {
            let control = HerdrControl::connect_for(&identity).await?;
            control.close_owned(&identity).await
        });
    }
    if let Err(panic) = body {
        resume_unwind(panic);
    }
}
