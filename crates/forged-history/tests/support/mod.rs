//! Scratch areas and synthetic prepared events.
//!
//! Every test writes below `CARGO_TARGET_TMPDIR` and uses generated content
//! only. Nothing here reads an operator's `~/.claude`, `~/.codex`, `~/.pi`,
//! or `~/.anvil`: the archive under test is always one this process made.

#![allow(dead_code)]

use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicU64, Ordering};

use forged_history::{
    EventMetadata, History, Lineage, PreparedEventHeader, SessionFacts, SourceFamily,
    SourceLocation,
};

static SEQ: AtomicU64 = AtomicU64::new(0);

/// A per-test scratch area under `CARGO_TARGET_TMPDIR`.
pub struct Scratch {
    /// The scratch root, removed and recreated per test.
    pub root: PathBuf,
}

impl Scratch {
    /// The archive path this scratch area's `ANVIL_HOME` would resolve to.
    pub fn db(&self) -> PathBuf {
        self.root.join("anvil").join("history").join("history.db")
    }

    /// A path inside the scratch area.
    pub fn join(&self, rel: &str) -> PathBuf {
        self.root.join(rel)
    }
}

/// Create a fresh scratch area named for the calling test.
pub fn scratch(name: &str) -> Scratch {
    let unique = SEQ.fetch_add(1, Ordering::Relaxed);
    let root = PathBuf::from(env!("CARGO_TARGET_TMPDIR"))
        .join(format!("history-{name}-{}-{unique}", std::process::id()));
    let _ = std::fs::remove_dir_all(&root);
    std::fs::create_dir_all(&root).expect("creating scratch root");
    Scratch { root }
}

/// Open (creating) an archive in a scratch area.
pub fn open(scratch: &Scratch) -> History {
    History::open(&scratch.db()).expect("open history")
}

/// A prepared header for one synthetic Claude Code event.
pub fn header(session: &str, relative: &str, index: u64, cwd: Option<&str>) -> PreparedEventHeader {
    PreparedEventHeader {
        source_family: SourceFamily::ClaudeCode,
        parser_version: 1,
        session: SessionFacts {
            native_session_id: session.to_owned(),
            observed_cwd: cwd.map(PathBuf::from),
            title: None,
            started_at: Some("2026-08-24T00:00:00.000000000Z".to_owned()),
        },
        source: SourceLocation {
            root_path: PathBuf::from("/synthetic/root"),
            relative_path: relative.to_owned(),
            byte_offset: index * 100,
            next_byte_offset: (index + 1) * 100,
            record_index: index,
        },
        native_event_key: Some(format!("{session}-evt-{index}")),
        lineage: Lineage::default(),
        metadata: EventMetadata {
            event_kind: "assistant_message".to_owned(),
            occurred_at: Some(format!("2026-08-24T00:00:{:02}.000000000Z", index.min(59))),
            ..EventMetadata::default()
        },
    }
}

/// A raw read-only connection for tests that must inspect or corrupt storage
/// behind the crate's back.
pub fn raw(db: &Path) -> rusqlite::Connection {
    rusqlite::Connection::open(db).expect("raw connection")
}

/// Count rows in a table through a raw connection.
pub fn count(conn: &rusqlite::Connection, sql: &str) -> i64 {
    conn.query_row(sql, [], |row| row.get(0)).expect("count")
}
