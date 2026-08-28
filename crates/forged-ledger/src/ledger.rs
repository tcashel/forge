//! The blocking actor: a dedicated writer thread owns the
//! `rusqlite::Connection`; public methods are synchronous and send boxed
//! closures over `std::sync::mpsc` with per-call reply channels.
//!
//! Cross-connection serialization comes from SQLite itself (immediate
//! transactions + busy_timeout), not from the actor — the actor exists to
//! keep connection use single-threaded and transactions synchronous.

use std::path::{Path, PathBuf};
use std::sync::mpsc::{self, Sender};
use std::sync::{Arc, Mutex};
use std::thread::JoinHandle;

use rusqlite::Connection;

use crate::error::{internal, LedgerError};
use crate::migrations::configure_connection;
use crate::types::Pragmas;

/// A unit of work executed on the writer thread's own connection.
pub(crate) type Job = Box<dyn FnOnce(&mut Connection) + Send>;

const WRITER_UNAVAILABLE: &str = "ledger writer thread is unavailable";

/// Synchronous, `Clone`-able, `Send + Sync` handle to the writer thread.
///
/// Every clone shares ONE sender: [`Ledger::close`] takes that sender out of
/// its `Option` (dropping the process's only sender), then joins the thread,
/// so reopen-after-close is race-free by construction. Calls on a surviving
/// clone afterwards refuse with `Internal`.
#[derive(Clone)]
pub struct Ledger {
    sender: Arc<Mutex<Option<Sender<Job>>>>,
    writer: Arc<Mutex<Option<JoinHandle<()>>>>,
}

impl std::fmt::Debug for Ledger {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Ledger").finish_non_exhaustive()
    }
}

/// The default `state.db` location.
///
/// Resolves, in order: `$ANVIL_HOME` (set and non-empty) →
/// `$ANVIL_HOME/state.db`; else `$HOME` (set and non-empty) →
/// `$HOME/.anvil/state.db`; else the relative path `.anvil/state.db`.
/// Empty env values count as unset. Never panics, never errors.
pub fn default_db_path() -> PathBuf {
    let anvil_home = std::env::var("ANVIL_HOME").ok();
    let home = std::env::var("HOME").ok();
    resolve_db_path(anvil_home.as_deref(), home.as_deref())
}

/// Pure resolution behind [`default_db_path`], testable without mutating
/// process env.
pub(crate) fn resolve_db_path(anvil_home: Option<&str>, home: Option<&str>) -> PathBuf {
    if let Some(anvil) = anvil_home.filter(|v| !v.is_empty()) {
        return Path::new(anvil).join("state.db");
    }
    if let Some(home) = home.filter(|v| !v.is_empty()) {
        return Path::new(home).join(".anvil").join("state.db");
    }
    Path::new(".anvil").join("state.db")
}

impl Ledger {
    /// Open (creating and migrating as needed) the ledger at `db_path`.
    ///
    /// Creates the parent directory first; a directory-creation or open
    /// failure maps to `Internal`.
    pub fn open(db_path: &Path) -> Result<Ledger, LedgerError> {
        if let Some(parent) = db_path.parent() {
            if !parent.as_os_str().is_empty() {
                std::fs::create_dir_all(parent).map_err(|err| {
                    internal(format!("cannot create {}: {err}", parent.display()))
                })?;
            }
        }
        let mut conn = Connection::open(db_path)
            .map_err(|err| internal(format!("cannot open {}: {err}", db_path.display())))?;
        configure_connection(&mut conn)?;
        Self::start_writer(conn)
    }

    /// Open the ledger at `db_path` WITHOUT creating anything: no parent
    /// directory, no database file. `Ok(None)` means no database exists at
    /// the path — decided by the no-create open itself, so no interleaving
    /// with a concurrent deletion can mint a blank database the way a
    /// caller-side existence check followed by [`Ledger::open`] can.
    pub fn open_existing(db_path: &Path) -> Result<Option<Ledger>, LedgerError> {
        let flags = rusqlite::OpenFlags::SQLITE_OPEN_READ_WRITE
            | rusqlite::OpenFlags::SQLITE_OPEN_URI
            | rusqlite::OpenFlags::SQLITE_OPEN_NO_MUTEX;
        let mut conn = match Connection::open_with_flags(db_path, flags) {
            Ok(conn) => conn,
            // CANTOPEN over a still-present path is a real failure
            // (permissions, a directory), not absence — and only PROVEN
            // absence answers `None`: a metadata error here is an
            // inspection failure, not evidence the ledger is missing.
            Err(rusqlite::Error::SqliteFailure(e, _))
                if e.code == rusqlite::ErrorCode::CannotOpen
                    && matches!(
                        std::fs::metadata(db_path),
                        Err(ref meta) if meta.kind() == std::io::ErrorKind::NotFound
                    ) =>
            {
                return Ok(None);
            }
            Err(err) => {
                return Err(internal(format!(
                    "cannot open {}: {err}",
                    db_path.display()
                )))
            }
        };
        configure_connection(&mut conn)?;
        Self::start_writer(conn).map(Some)
    }

    /// Hand a configured connection to a fresh writer thread.
    fn start_writer(conn: Connection) -> Result<Ledger, LedgerError> {
        let (sender, receiver) = mpsc::channel::<Job>();
        let handle = std::thread::Builder::new()
            .name("forged-ledger-writer".to_owned())
            .spawn(move || {
                let mut conn = conn;
                // The writer thread executes jobs serially and shuts down
                // when the last sender drops.
                while let Ok(job) = receiver.recv() {
                    job(&mut conn);
                }
            })
            .map_err(|err| internal(format!("cannot spawn writer thread: {err}")))?;

        Ok(Ledger {
            sender: Arc::new(Mutex::new(Some(sender))),
            writer: Arc::new(Mutex::new(Some(handle))),
        })
    }

    /// Drop the process's only job sender and JOIN the writer thread.
    ///
    /// Returns after the thread has exited, so reopening the same DB path
    /// races nothing. The writer mutex is held ACROSS the join: a concurrent
    /// closer that finds the handle already taken blocks on the lock until
    /// the joining closer finishes, so EVERY `close` returns only after the
    /// thread has really exited — never early with a hollow `Ok`. A second
    /// `close` is an idempotent `Ok(())`; a panicked writer thread surfaces
    /// as `Internal`.
    /// Snapshot the whole database to `dest` via `VACUUM INTO` — the
    /// backup primitive for a store that now holds both the crash evidence
    /// and the operator's backlog. Refuses to overwrite an existing file
    /// (VACUUM INTO's own contract); callers stamp unique names.
    pub fn snapshot_into(&self, dest: &std::path::Path) -> Result<(), LedgerError> {
        let dest = dest.to_path_buf();
        self.submit(move |conn| {
            let dest_text = dest.to_string_lossy().into_owned();
            conn.execute("VACUUM INTO ?1", [dest_text])?;
            Ok(())
        })
    }

    pub fn close(self) -> Result<(), LedgerError> {
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
            // Join with the guard held — the writer thread never touches
            // this mutex, so this cannot deadlock.
            handle
                .join()
                .map_err(|_| internal("ledger writer thread panicked"))?;
        }
        Ok(())
    }

    /// Run `f` on the writer thread's connection and wait for its reply.
    ///
    /// The sender mutex is held only long enough to enqueue — never across
    /// the reply-channel wait. Channel plumbing never panics: any send or
    /// receive failure maps to `Internal` deterministically.
    pub(crate) fn submit<T, F>(&self, f: F) -> Result<T, LedgerError>
    where
        T: Send + 'static,
        F: FnOnce(&mut Connection) -> Result<T, LedgerError> + Send + 'static,
    {
        let (reply_tx, reply_rx) = mpsc::channel::<Result<T, LedgerError>>();
        {
            let guard = self
                .sender
                .lock()
                .map_err(|_| internal(WRITER_UNAVAILABLE))?;
            let sender = guard.as_ref().ok_or_else(|| internal(WRITER_UNAVAILABLE))?;
            let job: Job = Box::new(move |conn| {
                let _ = reply_tx.send(f(conn));
            });
            sender.send(job).map_err(|_| internal(WRITER_UNAVAILABLE))?;
        }
        reply_rx.recv().map_err(|_| internal(WRITER_UNAVAILABLE))?
    }

    /// Read the writer connection's configuration — the sanctioned seam
    /// member for test observability.
    pub fn pragmas(&self) -> Result<Pragmas, LedgerError> {
        self.submit(|conn| {
            let journal_mode: String = conn.query_row("PRAGMA journal_mode", [], |r| r.get(0))?;
            let synchronous: i64 = conn.query_row("PRAGMA synchronous", [], |r| r.get(0))?;
            let foreign_keys: i64 = conn.query_row("PRAGMA foreign_keys", [], |r| r.get(0))?;
            let busy_timeout_ms: i64 = conn.query_row("PRAGMA busy_timeout", [], |r| r.get(0))?;
            let user_version: i64 = conn.query_row("PRAGMA user_version", [], |r| r.get(0))?;
            Ok(Pragmas {
                journal_mode,
                synchronous,
                foreign_keys: foreign_keys != 0,
                busy_timeout_ms,
                user_version,
            })
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::migrations::BUSY_TIMEOUT_MS;

    #[test]
    fn resolve_db_path_prefers_anvil_home() {
        assert_eq!(
            resolve_db_path(Some("/x/anvil"), Some("/home/u")),
            PathBuf::from("/x/anvil/state.db")
        );
    }

    #[test]
    fn resolve_db_path_falls_back_to_home() {
        for anvil in [None, Some("")] {
            assert_eq!(
                resolve_db_path(anvil, Some("/home/u")),
                PathBuf::from("/home/u/.anvil/state.db")
            );
        }
    }

    #[test]
    fn resolve_db_path_falls_back_to_relative() {
        for home in [None, Some("")] {
            assert_eq!(
                resolve_db_path(None, home),
                PathBuf::from(".anvil/state.db")
            );
        }
    }

    #[test]
    fn busy_timeout_constant_matches_the_contract() {
        assert_eq!(BUSY_TIMEOUT_MS, 5000);
    }

    #[test]
    fn open_existing_refuses_to_create_a_missing_ledger() {
        let dir = tempfile::tempdir().expect("scratch dir");
        let db = dir.path().join("nested").join("state.db");
        assert!(
            matches!(Ledger::open_existing(&db), Ok(None)),
            "a missing database must read as absent, not as an error"
        );
        assert!(
            !db.parent().expect("nested parent").exists(),
            "a no-create open must create neither the database nor its parents"
        );

        // The same path, once created by an operator-intent open, opens.
        Ledger::open(&db)
            .expect("create-enabled open")
            .close()
            .expect("close created ledger");
        Ledger::open_existing(&db)
            .expect("no-create open of an existing ledger")
            .expect("the database exists")
            .close()
            .expect("close reopened ledger");
    }

    #[test]
    fn open_existing_reports_an_unopenable_present_path_as_a_failure() {
        let dir = tempfile::tempdir().expect("scratch dir");
        // The path EXISTS but cannot open: a directory is not a database.
        let db = dir.path().join("state.db");
        std::fs::create_dir_all(&db).expect("db path dir");
        assert!(
            matches!(
                Ledger::open_existing(&db),
                Err(LedgerError::Internal { .. })
            ),
            "a present-but-unopenable path is a failure, never absence"
        );
    }
}
