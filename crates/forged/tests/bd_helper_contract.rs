mod support;

use std::os::unix::fs::PermissionsExt;
use std::path::{Path, PathBuf};

use support::BdTestPolicy;

fn candidate(root: &Path, name: &str, evidence: &str, exit: i32) -> PathBuf {
    let path = root.join(name);
    std::fs::write(
        &path,
        format!("#!/bin/sh\nprintf '%s\\n' '{evidence}'\nexit {exit}\n"),
    )
    .expect("write candidate");
    let mut permissions = std::fs::metadata(&path)
        .expect("candidate metadata")
        .permissions();
    permissions.set_mode(0o755);
    std::fs::set_permissions(&path, permissions).expect("make candidate executable");
    path
}

fn policy(
    explicit: Option<PathBuf>,
    canonical: Option<PathBuf>,
    required: bool,
    expected_version: Option<&str>,
) -> BdTestPolicy {
    BdTestPolicy {
        explicit,
        canonical,
        required,
        expected_version: expected_version.map(str::to_owned),
    }
}

#[test]
fn bd_selection_policy_is_fail_closed_and_has_no_explicit_fallback() {
    let scratch = support::scratch("forged-bd-helper-contract");
    let canonical = candidate(
        &scratch.root,
        "canonical-bd",
        r#"{"data":{"version":"1.2.1"}}"#,
        0,
    );

    assert_eq!(
        support::resolve_bd(&policy(None, None, false, None)).expect("optional absence"),
        None,
        "optional total absence is the one skip outcome"
    );
    assert!(support::resolve_bd(&policy(None, None, true, None))
        .expect_err("required absence must fail")
        .contains("FORGED_REQUIRE_BD=1"));

    assert!(support::resolve_bd(&policy(
        Some(PathBuf::from("bd")),
        Some(canonical.clone()),
        false,
        None,
    ))
    .expect_err("relative explicit candidate must fail")
    .contains("ambient PATH is never searched"));

    let missing = scratch.root.join("missing-bd");
    assert!(
        support::resolve_bd(&policy(Some(missing), Some(canonical.clone()), false, None,))
            .expect_err("missing explicit candidate must fail")
            .contains("does not exist")
    );

    let non_executable = candidate(
        &scratch.root,
        "non-executable-bd",
        r#"{"data":{"version":"1.2.1"}}"#,
        0,
    );
    let mut permissions = std::fs::metadata(&non_executable)
        .expect("candidate metadata")
        .permissions();
    permissions.set_mode(0o644);
    std::fs::set_permissions(&non_executable, permissions).expect("remove executable bit");
    assert!(support::resolve_bd(&policy(
        Some(non_executable),
        Some(canonical.clone()),
        false,
        None,
    ))
    .expect_err("non-executable explicit candidate must fail")
    .contains("could not execute"));

    let malformed = candidate(&scratch.root, "malformed-bd", "not-json", 0);
    assert!(support::resolve_bd(&policy(
        Some(malformed),
        Some(canonical.clone()),
        false,
        None,
    ))
    .expect_err("malformed explicit candidate must fail")
    .contains("malformed version JSON"));

    let malformed_version = candidate(
        &scratch.root,
        "malformed-version-bd",
        r#"{"data":{"version":"not-semver"}}"#,
        0,
    );
    assert!(support::resolve_bd(&policy(
        Some(malformed_version),
        Some(canonical.clone()),
        false,
        None,
    ))
    .expect_err("malformed explicit version evidence must fail")
    .contains("malformed version evidence"));

    let unsuccessful = candidate(
        &scratch.root,
        "unsuccessful-bd",
        r#"{"data":{"version":"1.2.1"}}"#,
        9,
    );
    assert!(support::resolve_bd(&policy(
        Some(unsuccessful),
        Some(canonical.clone()),
        false,
        None,
    ))
    .expect_err("unsuccessful explicit candidate must fail")
    .contains("exited unsuccessfully"));

    let different = candidate(
        &scratch.root,
        "different-bd",
        r#"{"data":{"version":"1.3.0"}}"#,
        0,
    );
    assert!(support::resolve_bd(&policy(
        Some(different),
        Some(canonical.clone()),
        true,
        Some("1.2.1"),
    ))
    .expect_err("expected-version mismatch must fail")
    .contains("expected exactly 1.2.1"));

    let exact = candidate(
        &scratch.root,
        "exact-bd",
        r#"{"data":{"version":"1.2.1"}}"#,
        0,
    );
    assert_eq!(
        support::resolve_bd(&policy(
            Some(exact.clone()),
            Some(canonical.clone()),
            true,
            Some("1.2.1"),
        ))
        .expect("exact expected version must execute"),
        Some(exact)
    );

    let compatibility = candidate(
        &scratch.root,
        "compatibility-bd",
        r#"{"data":{"version":"2.0.0"}}"#,
        0,
    );
    assert_eq!(
        support::resolve_bd(&policy(
            Some(compatibility.clone()),
            Some(canonical),
            true,
            None,
        ))
        .expect("unpinned explicit compatibility candidate must execute"),
        Some(compatibility)
    );

    let _ = std::fs::remove_dir_all(&scratch.root);
}
