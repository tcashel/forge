//! Audit-mirror and doctor integration tests, plus the source-hygiene greps.

mod support;

use std::path::PathBuf;

use forged_beads::{
    audit_record, claim_specific, heartbeat, run_doctor, AuditEntry, BdConfig, DoctorConfig,
};

const PROBE_ORDER: [&str; 6] = [
    "bd-version",
    "bd-lease-liveness",
    "beads-dir-resolves",
    "gh-auth",
    "herdr-ping",
    "anvil-home-writable",
];

#[tokio::test]
async fn audit_record_err_is_ignorable_and_never_delays_the_operation() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("audit-mirror");
    support::init_store(&bd, &s);
    let cfg = support::cfg_for(&bd, &s);
    let id = support::create_bead(&bd, &s, "audit bead");
    claim_specific(&cfg, &id, "aud-holder")
        .await
        .expect("claim");

    // Explicit call at terminal-attempt time, with the sidecar DISABLED
    // (bd's default): the Err is expected and safely ignorable.
    let entry = AuditEntry {
        tool_name: "probe-tool".to_string(),
        exit_code: 0,
        bead: id.clone(),
        holder: "aud-holder".to_string(),
    };
    if let Err(e) = audit_record(&cfg, &entry).await {
        eprintln!("audit_record returned an ignorable Err (sidecar disabled): {e}");
    }

    // The wrapped operation's world is intact: the lease still works.
    heartbeat(&cfg, &id, "aud-holder")
        .await
        .expect("the underlying operation must be unaffected by the mirror");
}

#[test]
fn invoke_write_never_calls_the_audit_mirror() {
    let invoke_src = include_str!("../src/invoke.rs");
    assert!(
        !invoke_src.contains("audit"),
        "invoke must never call the audit mirror — mirroring is the caller's explicit choice"
    );
}

#[test]
fn source_hygiene_no_force_flag_and_no_path_bd() {
    let sources = [
        ("lib.rs", include_str!("../src/lib.rs")),
        ("audit.rs", include_str!("../src/audit.rs")),
        ("classify.rs", include_str!("../src/classify.rs")),
        ("config.rs", include_str!("../src/config.rs")),
        ("doctor.rs", include_str!("../src/doctor.rs")),
        ("envelope.rs", include_str!("../src/envelope.rs")),
        ("guardian.rs", include_str!("../src/guardian.rs")),
        ("invoke.rs", include_str!("../src/invoke.rs")),
        ("lease.rs", include_str!("../src/lease.rs")),
        ("slot.rs", include_str!("../src/slot.rs")),
    ];
    // Build the needles at runtime so this test file itself cannot trip them.
    let force_flag = ["--", "force"].concat();
    let path_bd = ["Command::new(", "\"bd\"", ")"].concat();
    for (name, src) in sources {
        assert!(
            !src.contains(&force_flag),
            "{name} must never pass bd's {force_flag} bypass"
        );
        assert!(
            !src.contains(&path_bd),
            "{name} must never resolve bd via PATH"
        );
    }
}

#[tokio::test]
async fn doctor_returns_six_probes_and_never_panics_without_bd() {
    let _guard = support::HomeBeadsGuard::new();
    // Always-on: points bd_path at a nonexistent file.
    let s = support::scratch("doctor-missing-bd");
    let scratch_root = s.root.join("doctor-scratch");
    std::fs::create_dir_all(&scratch_root).expect("creating doctor scratch root");
    let cfg = DoctorConfig {
        bd: BdConfig {
            bd_path: s.root.join("no-such-bd"),
            beads_dir: s.beads.clone(),
            home_override: Some(s.home.clone()),
            anvil_home: s.anvil.clone(),
            work_dir: s.beads.clone(),
            read_timeout_s: 10,
            write_timeout_s: 10,
        },
        scratch_root: scratch_root.clone(),
        herdr_sock: Some(s.root.join("no-such-herdr.sock")),
    };
    let results = run_doctor(cfg).await;
    assert_eq!(results.len(), 6, "exactly six probe results: {results:?}");
    for (result, expected) in results.iter().zip(PROBE_ORDER) {
        assert_eq!(result.name, expected, "probe order is pinned");
    }
    assert!(!results[0].ok, "bd-version must fail with a missing binary");
    assert!(
        !results[1].ok,
        "bd-lease-liveness must fail with a missing binary"
    );
    assert!(
        !results[2].ok,
        "beads-dir-resolves must fail with a missing binary"
    );
    assert!(
        !results[4].ok,
        "herdr-ping must fail on a nonexistent socket"
    );
    assert!(results[5].ok, "scratch anvil home must be writable");
    let leftover: Vec<_> = std::fs::read_dir(&scratch_root)
        .expect("scratch root readable")
        .collect();
    assert!(
        leftover.is_empty(),
        "scratch_root must be EMPTY when run_doctor returns: {leftover:?}"
    );
}

#[tokio::test]
async fn doctor_with_the_sandboxed_bd_probes_green() {
    let _guard = support::HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let s = support::scratch("doctor-live");
    support::init_store(&bd, &s);
    // One bead so the beads-dir-resolves probe sees a NON-EMPTY list.
    let _id = support::create_bead(&bd, &s, "doctor resolve bead");
    let scratch_root = s.root.join("doctor-scratch");
    std::fs::create_dir_all(&scratch_root).expect("creating doctor scratch root");
    let cfg = DoctorConfig {
        bd: support::cfg_for(&bd, &s),
        scratch_root: scratch_root.clone(),
        herdr_sock: Some(PathBuf::from(env!("CARGO_TARGET_TMPDIR")).join("absent-herdr.sock")),
    };
    let results = run_doctor(cfg).await;
    assert_eq!(results.len(), 6, "exactly six probe results: {results:?}");
    for (result, expected) in results.iter().zip(PROBE_ORDER) {
        assert_eq!(result.name, expected, "probe order is pinned");
    }
    assert!(
        results[0].ok,
        "bd-version must accept the sandboxed 1.2.x: {}",
        results[0].detail
    );
    assert!(
        results[2].ok,
        "beads-dir-resolves must see the non-empty scratch store: {}",
        results[2].detail
    );
    assert!(results[5].ok, "anvil-home-writable: {}", results[5].detail);
    // bd-lease-liveness normally passes but shares the machine with parallel
    // tests inside its pinned 10s budget; gh-auth and herdr-ping depend on
    // machine state. Report rather than hard-assert.
    for r in &results {
        eprintln!("doctor probe {}: ok={} ({})", r.name, r.ok, r.detail);
    }
    let leftover: Vec<_> = std::fs::read_dir(&scratch_root)
        .expect("scratch root readable")
        .collect();
    assert!(
        leftover.is_empty(),
        "scratch_root must be EMPTY when run_doctor returns: {leftover:?}"
    );
}
