use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

use forged_ledger::Ledger;
use rusqlite::{params, Connection};
use serde_json::json;

const FROM: &str = "2030-01-01T00:00:00.000000000Z";
const TO: &str = "2030-01-02T00:00:00.000000000Z";

/// A second process commits one complete historical generation at a time.
/// Every snapshot must see either all six joined facts or none of them:
/// immutable identity, run, packet, attempt, lifecycle event, and spend.
/// This is an ordering assertion over committed rows, never a timing-only
/// gate.
#[test]
fn history_snapshot_never_tears_identity_lifecycle_attempts_or_spend() {
    let dir = tempfile::tempdir().expect("tempdir");
    let path = dir.path().join("state.db");
    let reader = Ledger::open(&path).expect("reader");
    let done = Arc::new(AtomicBool::new(false));
    let writer = {
        let path = path.clone();
        let done = Arc::clone(&done);
        std::thread::spawn(move || {
            let mut conn = Connection::open(path).expect("writer connection");
            conn.pragma_update(None, "busy_timeout", 5_000)
                .expect("busy timeout");
            conn.pragma_update(None, "foreign_keys", "ON")
                .expect("foreign keys");
            for generation in 0..200_i64 {
                let run_id = format!("history-{generation:04}");
                let packet_id = format!("{run_id}/implement/1");
                let tx = conn.transaction().expect("transaction");
                tx.execute(
                    "INSERT INTO runs \
                     (run_id, bead_id, repo, base_ref, branch, protocol, state, created_at, updated_at) \
                     VALUES (?1,?2,'/tmp/repo','main',?3,'slice/v1','active',?4,?4)",
                    params![run_id, format!("bead-{run_id}"), format!("forged/{run_id}"), FROM],
                )
                .expect("run");
                tx.execute(
                    "INSERT INTO work_identities \
                     (schema, subject_kind, subject_id, bead_id, display_title, captured_at, source) \
                     VALUES ('forged.work-identity/1','run',?1,?2,?1,?3,'legacy-fallback')",
                    params![run_id, format!("bead-{run_id}"), FROM],
                )
                .expect("identity");
                tx.execute(
                    "INSERT INTO packets \
                     (packet_id, run_id, stage, seq, spec_path, spec_sha256, body_json, created_at) \
                     VALUES (?1,?2,'implement',1,'/tmp/spec',?3,'{}',?4)",
                    params![packet_id, run_id, "a".repeat(64), FROM],
                )
                .expect("packet");
                tx.execute(
                    "INSERT INTO attempts \
                     (packet_id, claim_token, claimant, state, started_at, updated_at, ended_at) \
                     VALUES (?1,?2,'writer','completed',?3,?3,?3)",
                    params![packet_id, format!("claim-{generation}"), FROM],
                )
                .expect("attempt");
                let attempt_id = tx.last_insert_rowid();
                tx.execute(
                    "INSERT INTO events (ts, run_id, kind, payload_json) VALUES (?1,?2, \
                     'attempt.state',?3)",
                    params![
                        FROM,
                        run_id,
                        json!({
                            "attemptId": attempt_id,
                            "packetId": packet_id,
                            "old": "running",
                            "new": "completed",
                        })
                        .to_string(),
                    ],
                )
                .expect("event");
                tx.execute(
                    "INSERT INTO usage \
                     (run_id, packet_id, attempt_id, provider, model, input_tokens, output_tokens, \
                      cost_usd, pricing_basis, ts) \
                     VALUES (?1,?2,?3,'codex','model',1,1,0.01,'billed',?4)",
                    params![run_id, packet_id, attempt_id, FROM],
                )
                .expect("usage");
                tx.commit().expect("commit generation");
            }
            done.store(true, Ordering::Release);
        })
    };

    let mut snapshots = 0;
    while !done.load(Ordering::Acquire) || snapshots < 50 {
        let snapshot = reader.history_snapshot(FROM, TO).expect("snapshot");
        let count = snapshot.runs.len();
        assert_eq!(snapshot.work_identities.len(), count, "identity tear");
        assert_eq!(snapshot.packets.len(), count, "packet tear");
        assert_eq!(snapshot.attempts.len(), count, "attempt tear");
        assert_eq!(snapshot.events.len(), count, "lifecycle tear");
        assert_eq!(snapshot.usage.len(), count, "spend tear");
        snapshots += 1;
    }
    writer.join().expect("writer");
    let final_snapshot = reader.history_snapshot(FROM, TO).expect("final snapshot");
    assert_eq!(final_snapshot.runs.len(), 200);
    reader.close().expect("close reader");
}
