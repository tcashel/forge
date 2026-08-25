//! Synchronous blocking writer actor for the independent history database.

use std::path::Path;
use std::sync::mpsc::{self, Sender};
use std::sync::{Arc, Mutex};
use std::thread::JoinHandle;

use rusqlite::Connection;

use crate::error::{internal, HistoryError};
use crate::path::{default_history_path, secure_open, OpenMode};
use crate::schema::configure_connection;

pub(crate) type Job = Box<dyn FnOnce(&mut Connection) + Send>;

const WRITER_UNAVAILABLE: &str = "history writer thread is unavailable";

/// Cloneable synchronous handle to one history writer connection.
#[derive(Clone)]
pub struct History {
    sender: Arc<Mutex<Option<Sender<Job>>>>,
    writer: Arc<Mutex<Option<JoinHandle<()>>>>,
}

impl std::fmt::Debug for History {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter.debug_struct("History").finish_non_exhaustive()
    }
}

impl History {
    /// Securely create/open and migrate the default operator-scoped store.
    pub fn open_default() -> Result<Self, HistoryError> {
        Self::open(&default_history_path())
    }

    /// Securely create/open and migrate a history database.
    pub fn open(path: &Path) -> Result<Self, HistoryError> {
        let secure = secure_open(path, OpenMode::Create)?
            .ok_or_else(|| internal("create-enabled history open returned absence"))?;
        let connection = configure_connection(secure)?;
        Self::start_writer(connection)
    }

    /// Open an existing history database without creating parents or a file.
    pub fn open_existing(path: &Path) -> Result<Option<Self>, HistoryError> {
        let Some(secure) = secure_open(path, OpenMode::Existing)? else {
            return Ok(None);
        };
        let connection = configure_connection(secure)?;
        Self::start_writer(connection).map(Some)
    }

    fn start_writer(connection: Connection) -> Result<Self, HistoryError> {
        let (sender, receiver) = mpsc::channel::<Job>();
        let writer = std::thread::Builder::new()
            .name("forged-history-writer".to_owned())
            .spawn(move || {
                let mut connection = connection;
                while let Ok(job) = receiver.recv() {
                    job(&mut connection);
                }
            })
            .map_err(|error| internal(format!("spawning history writer: {error}")))?;
        Ok(Self {
            sender: Arc::new(Mutex::new(Some(sender))),
            writer: Arc::new(Mutex::new(Some(writer))),
        })
    }

    /// Deliberately close and join the writer. Calls through surviving clones
    /// fail closed; repeated concurrent closes wait for the same join.
    pub fn close(self) -> Result<(), HistoryError> {
        let sender = self
            .sender
            .lock()
            .map_err(|_| internal(WRITER_UNAVAILABLE))?
            .take();
        drop(sender);
        let mut writer = self
            .writer
            .lock()
            .map_err(|_| internal(WRITER_UNAVAILABLE))?;
        if let Some(handle) = writer.take() {
            handle
                .join()
                .map_err(|_| internal("history writer thread panicked"))?;
        }
        Ok(())
    }

    pub(crate) fn submit<T, F>(&self, operation: F) -> Result<T, HistoryError>
    where
        T: Send + 'static,
        F: FnOnce(&mut Connection) -> Result<T, HistoryError> + Send + 'static,
    {
        let (reply_sender, reply_receiver) = mpsc::channel();
        {
            let sender = self
                .sender
                .lock()
                .map_err(|_| internal(WRITER_UNAVAILABLE))?;
            let sender = sender
                .as_ref()
                .ok_or_else(|| internal(WRITER_UNAVAILABLE))?;
            sender
                .send(Box::new(move |connection| {
                    let _ = reply_sender.send(operation(connection));
                }))
                .map_err(|_| internal(WRITER_UNAVAILABLE))?;
        }
        reply_receiver
            .recv()
            .map_err(|_| internal(WRITER_UNAVAILABLE))?
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::os::unix::fs::PermissionsExt;
    use std::path::PathBuf;
    use std::process::Command;

    #[test]
    fn deliberate_close_disables_surviving_clones() {
        let scratch = crate::test_scratch();
        let path = scratch.path().join("history/history.db");
        let history = History::open(&path).unwrap();
        let survivor = history.clone();
        history.close().unwrap();
        assert!(survivor.submit(|_| Ok(())).is_err());
    }

    #[test]
    fn independent_connections_share_wal_and_migrations_replay() {
        let scratch = crate::test_scratch();
        let path = scratch.path().join("history/history.db");
        let first = History::open(&path).unwrap();
        let second = History::open_existing(&path).unwrap().unwrap();
        let first_host = first
            .submit(|connection| {
                connection
                    .query_row(
                        "SELECT value FROM history_meta WHERE key='host_id'",
                        [],
                        |row| row.get::<_, String>(0),
                    )
                    .map_err(Into::into)
            })
            .unwrap();
        let second_host = second
            .submit(|connection| {
                let mode: String =
                    connection.query_row("PRAGMA journal_mode", [], |row| row.get(0))?;
                assert_eq!(mode.to_ascii_lowercase(), "wal");
                connection
                    .query_row(
                        "SELECT value FROM history_meta WHERE key='host_id'",
                        [],
                        |row| row.get::<_, String>(0),
                    )
                    .map_err(Into::into)
            })
            .unwrap();
        assert_eq!(first_host, second_host);
        first.close().unwrap();
        second.close().unwrap();
    }

    #[test]
    fn uri_shaped_names_are_literal_and_foreign_databases_are_unchanged() {
        let scratch = crate::test_scratch();
        let parent = scratch.path().join("history");
        fs::create_dir(&parent).unwrap();
        fs::set_permissions(&parent, fs::Permissions::from_mode(0o700)).unwrap();

        let alternate = parent.join("alternate.db");
        let state = parent.join("state.db");
        for path in [&alternate, &state] {
            let connection = Connection::open(path).unwrap();
            connection
                .execute("CREATE TABLE sentinel(value TEXT NOT NULL)", [])
                .unwrap();
            connection
                .execute("INSERT INTO sentinel VALUES ('untouched')", [])
                .unwrap();
            drop(connection);
            fs::set_permissions(path, fs::Permissions::from_mode(0o600)).unwrap();
        }
        let alternate_before = fs::read(&alternate).unwrap();
        let state_before = fs::read(&state).unwrap();

        let literal = parent.join("file:alternate.db?mode=rw");
        let history = History::open(&literal).unwrap();
        history
            .record_tombstone(
                crate::types::TombstoneScope::Session,
                "literal",
                &"a".repeat(64),
                "test",
            )
            .unwrap();
        let literal_wal = PathBuf::from(format!("{}-wal", literal.display()));
        let literal_shm = PathBuf::from(format!("{}-shm", literal.display()));
        assert!(literal_wal.is_file());
        for sidecar in [&literal_wal, &literal_shm] {
            if sidecar.exists() {
                let mode = fs::metadata(sidecar).unwrap().permissions().mode();
                assert_eq!(mode & 0o077, 0, "{}", sidecar.display());
            }
        }
        assert!(!PathBuf::from(format!("{}-wal", alternate.display())).exists());
        assert!(!PathBuf::from(format!("{}-shm", alternate.display())).exists());
        history.close().unwrap();
        assert!(literal.is_file());

        assert!(History::open(&alternate).is_err());
        assert!(History::open(&state).is_err());
        assert_eq!(fs::read(&alternate).unwrap(), alternate_before);
        assert_eq!(fs::read(&state).unwrap(), state_before);
        for path in [&alternate, &state] {
            let connection = Connection::open(path).unwrap();
            let value: String = connection
                .query_row("SELECT value FROM sentinel", [], |row| row.get(0))
                .unwrap();
            let history_objects: i64 = connection
                .query_row(
                    "SELECT count(*) FROM sqlite_schema WHERE name LIKE 'history_%'",
                    [],
                    |row| row.get(0),
                )
                .unwrap();
            assert_eq!(value, "untouched");
            assert_eq!(history_objects, 0);
        }
    }

    #[test]
    fn busy_timeout_waits_for_a_concurrent_writer_and_reports_busy() {
        let scratch = crate::test_scratch();
        let path = scratch.path().join("history/history.db");
        let history = History::open(&path).unwrap();
        let mut blocker = Connection::open(&path).unwrap();
        blocker
            .busy_timeout(std::time::Duration::from_secs(1))
            .unwrap();
        let transaction = blocker
            .transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)
            .unwrap();
        let writer = history.clone();
        let join = std::thread::spawn(move || {
            writer.record_tombstone(
                crate::types::TombstoneScope::Session,
                "waited",
                &"b".repeat(64),
                "test",
            )
        });
        std::thread::sleep(std::time::Duration::from_millis(100));
        transaction.commit().unwrap();
        join.join().unwrap().unwrap();

        history
            .submit(|connection| {
                connection.busy_timeout(std::time::Duration::from_millis(20))?;
                Ok(())
            })
            .unwrap();
        let transaction = blocker
            .transaction_with_behavior(rusqlite::TransactionBehavior::Immediate)
            .unwrap();
        let error = history
            .record_tombstone(
                crate::types::TombstoneScope::Session,
                "busy",
                &"c".repeat(64),
                "test",
            )
            .unwrap_err();
        assert_eq!(error, HistoryError::Busy);
        transaction.rollback().unwrap();
    }

    #[test]
    fn concurrent_process_wal_helper() {
        let Ok(path) = std::env::var("FORGED_HISTORY_CHILD_DB") else {
            return;
        };
        let history = History::open_existing(Path::new(&path)).unwrap().unwrap();
        history
            .record_tombstone(
                crate::types::TombstoneScope::Session,
                "child",
                &"d".repeat(64),
                "subprocess",
            )
            .unwrap();
        history.close().unwrap();
    }

    #[test]
    fn concurrent_process_can_write_the_same_wal_database() {
        let scratch = crate::test_scratch();
        let path = scratch.path().join("history/history.db");
        let history = History::open(&path).unwrap();
        let output = Command::new(std::env::current_exe().unwrap())
            .args([
                "--exact",
                "actor::tests::concurrent_process_wal_helper",
                "--nocapture",
            ])
            .env("FORGED_HISTORY_CHILD_DB", &path)
            .output()
            .unwrap();
        assert!(
            output.status.success(),
            "stdout={} stderr={}",
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        );
        let count: i64 = history
            .submit(|connection| {
                connection
                    .query_row(
                        "SELECT count(*) FROM history_purge_tombstones
                          WHERE scope_key='child'",
                        [],
                        |row| row.get(0),
                    )
                    .map_err(Into::into)
            })
            .unwrap();
        assert_eq!(count, 1);
    }
}
