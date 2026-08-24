//! The blocking actor: a dedicated writer thread owns the archive's
//! `rusqlite::Connection`; every public method is synchronous and sends a
//! boxed closure over `std::sync::mpsc` with a per-call reply channel.
//!
//! The shape is deliberately modelled on `forged_ledger::Ledger` — same
//! close/join discipline, same reason for existing — but the thread, the
//! connection, the errors, and the database are the archive's own. Nothing
//! here can reach `state.db`, and nothing in `forged-ledger` can reach this.
//!
//! Cross-connection serialization comes from SQLite itself (immediate
//! transactions plus `busy_timeout`), not from the actor: the actor exists
//! to keep connection use single-threaded and every transaction synchronous,
//! so no transaction can span an `.await` by construction.

use std::path::Path;
use std::sync::mpsc::{self, Sender};
use std::sync::{Arc, Mutex};
use std::thread::JoinHandle;

use rusqlite::Connection;

use crate::error::{internal, HistoryError};
use crate::migrations::configure_connection;
use crate::open::{establish_parent, precreate_owner_only, validate_database_file};
use crate::types::Pragmas;

/// A unit of work executed on the writer thread's own connection.
pub(crate) type Job = Box<dyn FnOnce(&mut Connection) + Send>;

const WRITER_UNAVAILABLE: &str = "history writer thread is unavailable";

/// Synchronous, `Clone`-able, `Send + Sync` handle to the archive.
///
/// Every clone shares ONE sender: [`History::close`] takes that sender out of
/// its `Option` (dropping the process's only sender), then joins the thread,
/// so reopen-after-close is race-free by construction. Calls on a surviving
/// clone afterwards refuse with `Internal` rather than hanging.
#[derive(Clone)]
pub struct History {
    sender: Arc<Mutex<Option<Sender<Job>>>>,
    writer: Arc<Mutex<Option<JoinHandle<()>>>>,
}

impl std::fmt::Debug for History {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("History").finish_non_exhaustive()
    }
}

impl History {
    /// Open the archive at `db_path`, creating and migrating it as needed.
    ///
    /// Creation is owner-scoped end to end: the parent directory is made
    /// `0700`, the database file is created `0600` before SQLite ever sees
    /// the path, and a symlink or special file standing at either is refused
    /// rather than followed.
    pub fn open(db_path: &Path) -> Result<History, HistoryError> {
        establish_parent(db_path)?;
        if !validate_database_file(db_path)? {
            precreate_owner_only(db_path)?;
            // Re-validate what the create actually produced: between the
            // exclusive create and here, only this process's own file can be
            // at the path, and proving it costs one stat.
            validate_database_file(db_path)?;
        }
        let mut conn = Connection::open(db_path)
            .map_err(|err| internal(format!("cannot open {}: {err}", db_path.display())))?;
        configure_connection(&mut conn)?;
        Self::start_writer(conn)
    }

    /// Open the archive at `db_path` WITHOUT creating anything: no parent
    /// directory, no database file.
    ///
    /// `Ok(None)` means no archive exists at the path. A path that exists but
    /// cannot serve as an archive — a directory, a device node, a symlink, a
    /// foreign-owned file — is a REFUSAL, never absence: answering `None`
    /// there would invite a caller to create over it.
    pub fn open_existing(db_path: &Path) -> Result<Option<History>, HistoryError> {
        if !validate_database_file(db_path)? {
            return Ok(None);
        }
        let flags = rusqlite::OpenFlags::SQLITE_OPEN_READ_WRITE
            | rusqlite::OpenFlags::SQLITE_OPEN_URI
            | rusqlite::OpenFlags::SQLITE_OPEN_NO_MUTEX;
        let mut conn = match Connection::open_with_flags(db_path, flags) {
            Ok(conn) => conn,
            // Only PROVEN absence answers `None`: the file was validated a
            // moment ago, so CANTOPEN over a now-missing path is a deletion
            // that raced us, and CANTOPEN over a present one is a real
            // failure.
            Err(rusqlite::Error::SqliteFailure(e, _))
                if e.code == rusqlite::ErrorCode::CannotOpen
                    && matches!(
                        std::fs::symlink_metadata(db_path),
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
    fn start_writer(conn: Connection) -> Result<History, HistoryError> {
        let (sender, receiver) = mpsc::channel::<Job>();
        let handle = std::thread::Builder::new()
            .name("forged-history-writer".to_owned())
            .spawn(move || {
                let mut conn = conn;
                // Jobs run serially; the thread shuts down when the last
                // sender drops.
                while let Ok(job) = receiver.recv() {
                    job(&mut conn);
                }
            })
            .map_err(|err| internal(format!("cannot spawn writer thread: {err}")))?;

        Ok(History {
            sender: Arc::new(Mutex::new(Some(sender))),
            writer: Arc::new(Mutex::new(Some(handle))),
        })
    }

    /// Drop the process's only job sender and JOIN the writer thread.
    ///
    /// Returns only after the thread has exited, so reopening the same path
    /// races nothing and the WAL is already checkpointed by SQLite's own
    /// close. The writer mutex is held ACROSS the join, so a concurrent
    /// closer blocks rather than returning a hollow `Ok`. A second `close`
    /// is an idempotent `Ok(())`; a panicked writer surfaces as `Internal`.
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
            // Join with the guard held — the writer thread never touches
            // this mutex, so this cannot deadlock.
            handle
                .join()
                .map_err(|_| internal("history writer thread panicked"))?;
        }
        Ok(())
    }

    /// Run `f` on the writer thread's connection and wait for its reply.
    ///
    /// The sender mutex is held only long enough to enqueue — never across
    /// the reply wait. Channel plumbing never panics: any send or receive
    /// failure maps to `Internal` deterministically.
    pub(crate) fn submit<T, F>(&self, f: F) -> Result<T, HistoryError>
    where
        T: Send + 'static,
        F: FnOnce(&mut Connection) -> Result<T, HistoryError> + Send + 'static,
    {
        let (reply_tx, reply_rx) = mpsc::channel::<Result<T, HistoryError>>();
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
    pub fn pragmas(&self) -> Result<Pragmas, HistoryError> {
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

    /// This archive's stable current host id.
    ///
    /// Generated once at first open and never re-derived: session identity is
    /// `(host_id, source_family, native_session_id)`, so a host id recomputed
    /// per process would fork every session in the archive.
    pub fn host_id(&self) -> Result<String, HistoryError> {
        self.submit(|conn| current_host_id(conn))
    }
}

/// Read the archive's current host id on an already-open connection.
pub(crate) fn current_host_id(conn: &Connection) -> Result<String, HistoryError> {
    conn.query_row(
        "SELECT value FROM history_meta WHERE key = 'host_id'",
        [],
        |row| row.get(0),
    )
    .map_err(|err| internal(format!("history host id is unreadable: {err}")))
}
