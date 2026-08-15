//! Exact-id hydration is a different native Beads contract from repository
//! membership. Admission needs the complete `show` row because pinned bd
//! 1.2.1 omits `revision` from brief `list` output.

mod support;

use std::os::unix::fs::PermissionsExt;

use forged_beads::list_issues;

#[tokio::test]
async fn exact_ids_use_one_multi_show_and_keep_signed_revision_digits() {
    let s = support::scratch("exact-hydration-shim");
    let bd = s.root.join("bd-shim");
    std::fs::write(
        &bd,
        r#"#!/bin/sh
printf '%s\n' "$*" >> "${BEADS_DIR:?}/calls.log"
if [ "$*" != "show issue-a issue-b --brief-deps --json" ]; then
  printf 'unexpected argv: %s\n' "$*" >&2
  exit 9
fi
printf '%s\n' '{"schema_version":1,"data":[{"id":"issue-b","title":"Issue B","status":"in_progress","priority":2,"issue_type":"task","metadata":{"repository":"/tmp/repository"},"revision":-6192208415116251521},{"id":"issue-a","title":"Issue A","status":"open","priority":0,"issue_type":"bug","metadata":{"repository":"/tmp/repository"},"revision":9146914492635073757}]}'
"#,
    )
    .expect("write bd shim");
    std::fs::set_permissions(&bd, std::fs::Permissions::from_mode(0o755))
        .expect("make bd shim executable");
    let cfg = support::cfg_for(&bd, &s);
    let ids = vec!["issue-a".to_owned(), "issue-b".to_owned()];

    let issues = list_issues(&cfg, &ids).await.expect("exact hydration");
    assert_eq!(issues.len(), 2);
    assert_eq!(issues[0].id, "issue-a");
    assert_eq!(issues[0].status, "open");
    assert_eq!(issues[0].priority, Some(0));
    assert_eq!(issues[0].revision.as_deref(), Some("9146914492635073757"));
    assert_eq!(issues[1].id, "issue-b");
    assert_eq!(issues[1].status, "in_progress");
    assert_eq!(issues[1].priority, Some(2));
    assert_eq!(issues[1].revision.as_deref(), Some("-6192208415116251521"));
    assert!(issues.iter().all(|issue| {
        issue.metadata.get("repository").map(String::as_str) == Some("/tmp/repository")
    }));

    assert!(
        list_issues(&cfg, &[])
            .await
            .expect("empty exact read")
            .is_empty(),
        "empty input is answered without a subprocess"
    );
    assert_eq!(
        std::fs::read_to_string(s.beads.join("calls.log")).expect("shim call log"),
        "show issue-a issue-b --brief-deps --json\n"
    );
}
