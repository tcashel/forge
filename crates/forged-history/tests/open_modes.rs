//! What the two open modes create, refuse, and prove.

mod support;

use std::path::Path;

use forged_history::{History, HistoryFilter};
use support::{header, open, scratch};

#[cfg(unix)]
fn mode_of(path: &Path) -> u32 {
    use std::os::unix::fs::PermissionsExt;
    std::fs::metadata(path)
        .expect("metadata")
        .permissions()
        .mode()
        & 0o777
}

#[test]
#[cfg(unix)]
fn creation_is_owner_scoped_end_to_end() {
    let s = scratch("open-owner");
    let history = open(&s);
    history.close().expect("close");

    assert_eq!(
        mode_of(s.db().parent().expect("parent")),
        0o700,
        "the archive directory is created owner-only, never tightened afterwards"
    );
    assert_eq!(
        mode_of(&s.db()),
        0o600,
        "the archive file is created owner-only before SQLite ever sees it"
    );
}

#[test]
#[cfg(unix)]
fn an_over_permissive_archive_file_is_tightened_on_open() {
    use std::os::unix::fs::PermissionsExt;
    let s = scratch("open-tighten");
    open(&s).close().expect("close");
    std::fs::set_permissions(s.db(), std::fs::Permissions::from_mode(0o644)).expect("loosen");

    // Reopening validates the OPENED file and restores owner-only access;
    // this only works because validation reads the descriptor's own metadata.
    History::open(&s.db())
        .expect("reopen")
        .close()
        .expect("close");
    assert_eq!(mode_of(&s.db()), 0o600);
}

#[test]
fn a_no_create_open_proves_absence_without_creating_anything() {
    let s = scratch("open-absent");
    let db = s.db();
    assert!(
        matches!(History::open_existing(&db), Ok(None)),
        "a missing archive reads as absent, not as an error"
    );
    assert!(
        !db.parent().expect("parent").exists(),
        "a no-create open creates neither the archive nor its parents"
    );

    open(&s).close().expect("close");
    History::open_existing(&db)
        .expect("no-create open of an existing archive")
        .expect("the archive exists")
        .close()
        .expect("close");
}

#[test]
#[cfg(unix)]
fn a_symlink_standing_at_the_archive_path_is_refused_by_both_modes() {
    let s = scratch("open-symlink");
    let decoy = s.join("decoy.db");
    std::fs::write(&decoy, b"not an archive").expect("decoy");
    let db = s.db();
    std::fs::create_dir_all(db.parent().expect("parent")).expect("parent");
    std::os::unix::fs::symlink(&decoy, &db).expect("symlink");

    let created = History::open(&db);
    assert!(
        matches!(
            created,
            Err(forged_history::HistoryError::UnsafePath { .. })
        ),
        "a symlink must be refused, never followed: {created:?}"
    );
    let existing = History::open_existing(&db);
    assert!(
        matches!(
            existing,
            Err(forged_history::HistoryError::UnsafePath { .. })
        ),
        "absence and refusal are different answers: {existing:?}"
    );
    assert_eq!(
        std::fs::read(&decoy).expect("decoy survives"),
        b"not an archive",
        "the symlink target must never be written through"
    );
}

#[test]
#[cfg(unix)]
fn a_symlinked_parent_directory_is_refused() {
    let s = scratch("open-symlink-parent");
    let real = s.join("elsewhere");
    std::fs::create_dir_all(&real).expect("real dir");
    let anvil = s.join("anvil");
    std::fs::create_dir_all(&anvil).expect("anvil");
    std::os::unix::fs::symlink(&real, anvil.join("history")).expect("symlink parent");

    let refused = History::open(&s.db());
    assert!(
        matches!(
            refused,
            Err(forged_history::HistoryError::UnsafePath { .. })
        ),
        "a substituted parent directory must be refused: {refused:?}"
    );
    assert!(
        !real.join("history.db").exists(),
        "nothing may be written through the substituted directory"
    );
}

#[test]
fn a_directory_standing_at_the_archive_path_is_refused() {
    let s = scratch("open-directory");
    let db = s.db();
    std::fs::create_dir_all(&db).expect("directory in the way");
    assert!(
        matches!(
            History::open(&db),
            Err(forged_history::HistoryError::UnsafePath { .. })
        ),
        "a directory is not a regular file"
    );
    assert!(
        matches!(
            History::open_existing(&db),
            Err(forged_history::HistoryError::UnsafePath { .. })
        ),
        "a present-but-unopenable path is a refusal, never absence"
    );
}

#[test]
#[cfg(unix)]
fn a_special_file_standing_at_the_archive_path_is_refused() {
    let s = scratch("open-fifo");
    let db = s.db();
    std::fs::create_dir_all(db.parent().expect("parent")).expect("parent");
    let made = std::process::Command::new("mkfifo")
        .arg(&db)
        .status()
        .expect("run mkfifo");
    assert!(made.success(), "mkfifo must create the special file");

    // The opened DESCRIPTOR is validated, so a FIFO is caught by what it is
    // rather than by its name — and O_NONBLOCK keeps the open from hanging.
    let refused = History::open(&db);
    assert!(
        matches!(
            refused,
            Err(forged_history::HistoryError::UnsafePath { .. })
        ),
        "a special file is not an archive: {refused:?}"
    );
}

#[test]
fn close_is_deliberate_and_leaves_surviving_clones_refusing() {
    let s = scratch("open-close");
    let history = open(&s);
    let clone = history.clone();
    history.close().expect("close");

    let after = clone.status();
    assert!(
        after.is_err(),
        "a clone that outlives close must refuse, not hang or answer stale"
    );
    // A second close is idempotent, and the archive reopens race-free.
    clone.close().expect("second close is idempotent");
    History::open(&s.db())
        .expect("reopen")
        .close()
        .expect("close");
}

#[test]
fn a_held_write_lock_is_waited_out_rather_than_failed() {
    let s = scratch("open-busy");
    let history = open(&s);
    assert_eq!(history.pragmas().expect("pragmas").busy_timeout_ms, 5000);

    // A foreign connection holds the write lock; the archive's own write must
    // wait it out inside the busy timeout instead of refusing.
    let blocker = support::raw(&s.db());
    blocker
        .execute_batch("BEGIN IMMEDIATE; INSERT INTO history_meta(key,value,updated_at) VALUES ('probe','1','x');")
        .expect("hold the write lock");

    let writer = std::thread::spawn({
        let history = history.clone();
        move || {
            history.ingest_event(
                header("s-1", "a.jsonl", 0, Some("/repos/forge")),
                &b"{\"k\":1}"[..],
                &b"searchable"[..],
                [],
            )
        }
    });
    std::thread::sleep(std::time::Duration::from_millis(250));
    blocker.execute_batch("ROLLBACK").expect("release");
    drop(blocker);

    writer
        .join()
        .expect("writer thread")
        .expect("the write waits out contention rather than failing");
    assert_eq!(
        history
            .list_events(&HistoryFilter::default(), None, 10)
            .expect("events")
            .rows
            .len(),
        1
    );
    history.close().expect("close");
}

#[test]
fn two_processes_share_one_archive_over_wal() {
    let s = scratch("open-cross-process");
    let history = open(&s);
    history
        .ingest_event(
            header("parent", "a.jsonl", 0, Some("/repos/forge")),
            &b"{\"who\":\"parent\"}"[..],
            &b"parent wrote this"[..],
            [],
        )
        .expect("parent ingest");

    // The handle stays OPEN across the child's run: this is concurrent
    // access between two processes, not a handoff.
    let status = std::process::Command::new(std::env::current_exe().expect("test binary"))
        .args([
            "cross_process_child",
            "--exact",
            "--ignored",
            "--nocapture",
            "--test-threads=1",
        ])
        .env("FORGED_HISTORY_CHILD_DB", s.db())
        .status()
        .expect("spawn the child process");
    assert!(status.success(), "the child process must succeed");

    let events = history
        .list_events(&HistoryFilter::default(), None, 10)
        .expect("events");
    assert_eq!(
        events.rows.len(),
        2,
        "the parent's live connection must see the child's committed write"
    );
    let keys: Vec<&str> = events.rows.iter().map(|r| r.event_key.as_str()).collect();
    assert!(
        keys.contains(&"parent-evt-0") && keys.contains(&"child-evt-0"),
        "{keys:?}"
    );
    history.close().expect("close");
}

/// The child half of [`two_processes_share_one_archive_over_wal`], run by
/// re-executing this test binary. Ignored so a normal run never picks it up.
#[test]
#[ignore = "spawned as a child process by two_processes_share_one_archive_over_wal"]
fn cross_process_child() {
    let db = std::env::var_os("FORGED_HISTORY_CHILD_DB")
        .expect("the child needs FORGED_HISTORY_CHILD_DB");
    let db = Path::new(&db);
    let history = History::open_existing(db)
        .expect("open the parent's archive")
        .expect("the parent already created it");
    let parent_rows = history
        .list_events(&HistoryFilter::default(), None, 10)
        .expect("events");
    assert_eq!(
        parent_rows.rows.len(),
        1,
        "the child must see the parent's committed write"
    );
    history
        .ingest_event(
            header("child", "b.jsonl", 0, Some("/repos/forge")),
            &b"{\"who\":\"child\"}"[..],
            &b"child wrote this"[..],
            [],
        )
        .expect("child ingest");
    history.close().expect("close");
}
