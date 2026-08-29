//! Provider-session inventory integration: bounded historical projection,
//! canonical filtering, pagination, durable intervention folding, and no
//! work-store dependency on the read path.

mod support;

use serde_json::{json, Value};
use support::TestEnv;

fn rows(value: &Value) -> &[Value] {
    value["result"]["rows"]
        .as_array()
        .map(Vec::as_slice)
        .unwrap_or_default()
}

#[test]
fn process_history_is_bounded_filterable_and_independent_of_live_plan() {
    let env = TestEnv::new("forged-provider-session-inventory");
    assert_eq!(env.forged(&["init"]).0, 0);
    env.seed_work_spec(
        "inventory-run",
        "Exercise the durable provider-session inventory.",
        "Every attempt remains diagnosable without a live probe.",
    );
    let repo = env.repos.repo.to_string_lossy().into_owned();
    let spec = env.spec.to_string_lossy().into_owned();
    let (code, started) = env.forged(&[
        "run",
        "start",
        "--work",
        "inventory-run",
        "--repo",
        &repo,
        "--spec",
        &spec,
        "--base-ref",
        "main",
        "--profile",
        "lean",
    ]);
    assert_eq!(code, 0, "start: {started}");
    env.authorize_run("inventory-run");
    let (code, driven) = env.forged(&["run", "drive", "--run", "inventory-run"]);
    assert_eq!(code, 0, "drive: {driven}");

    // Terminal process attempts are historical; default inventory does not
    // pretend their session-start event is unresolved durable ownership.
    let (code, current) = env.forged(&["session", "inventory", "--run", "inventory-run"]);
    assert_eq!(code, 0, "default inventory: {current}");
    assert!(
        rows(&current).is_empty(),
        "default terminal exclusion: {current}"
    );

    // Queue after the provider boundary. Inventory folds only the durable
    // identity and never returns the message text.
    let (_, queued) = env.forged(&[
        "session",
        "message",
        "--run",
        "inventory-run",
        "--message",
        "private inventory test payload",
    ]);
    assert_eq!(queued["ok"], json!(true), "queue after drive: {queued}");

    let events_before = {
        let ledger = env.ledger();
        let count = ledger.list_events(None, 0, 65_536).expect("events").len();
        ledger.close().expect("close");
        count
    };
    let (code, history) = env.forged(&[
        "session",
        "inventory",
        "--run",
        "inventory-run",
        "--repository",
        &repo,
        "--include-historical",
    ]);
    assert_eq!(code, 0, "historical inventory: {history}");
    assert_eq!(
        history["result"]["schema"],
        json!("forged.provider-session-inventory/1")
    );
    assert_eq!(
        {
            let ledger = env.ledger();
            let count = ledger.list_events(None, 0, 65_536).expect("events").len();
            ledger.close().expect("close");
            count
        },
        events_before,
        "the inventory is a pure projection: no work event is appended"
    );
    assert!(!history
        .to_string()
        .contains("private inventory test payload"));
    let historical = rows(&history);
    assert!(!historical.is_empty(), "historical rows: {history}");
    for row in historical {
        assert_eq!(row["runId"], json!("inventory-run"));
        assert_eq!(row["identity"]["subject"]["id"], json!("inventory-run"));
        assert_eq!(row["repository"], json!(repo));
        assert_eq!(row["hostMode"], json!("process"));
        assert!(row["providerSessionId"].is_null());
        assert!(row["ownedHerdr"].is_null());
        assert!(row["projection"].is_null());
        assert_eq!(row["recovery"], json!("terminal"));
        assert_eq!(row["pendingInterventions"], json!(1));
    }

    let provider = historical[0]["provider"].as_str().expect("provider");
    let activity = historical[0]["attempt"]["activity"]
        .as_str()
        .expect("activity");
    let (code, filtered) = env.forged(&[
        "session",
        "inventory",
        "--run",
        "inventory-run",
        "--provider",
        provider,
        "--activity",
        activity,
        "--include-historical",
    ]);
    assert_eq!(code, 0, "filtered inventory: {filtered}");
    assert!(rows(&filtered).iter().all(|row| {
        row["provider"] == json!(provider) && row["attempt"]["activity"] == json!(activity)
    }));

    if historical.len() > 1 {
        let (_, first) = env.forged(&[
            "session",
            "inventory",
            "--run",
            "inventory-run",
            "--include-historical",
            "--limit",
            "1",
        ]);
        assert_eq!(rows(&first).len(), 1, "first page: {first}");
        let cursor = first["result"]["nextCursor"]
            .as_str()
            .expect("first page cursor");
        let (_, second) = env.forged(&["session", "inventory", "--cursor", cursor]);
        assert_eq!(rows(&second).len(), 1, "second page: {second}");
        assert_ne!(
            rows(&first)[0]["attemptId"],
            rows(&second)[0]["attemptId"],
            "keyset pages do not repeat"
        );
    }
}
