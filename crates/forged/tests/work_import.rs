//! `work import-beads` against the real sandboxed bd: author a small store
//! with every status class, full spec fields, unicode, and typed edges, run
//! the one-shot import, and byte-verify the ledger-native rows.

mod support;

use std::path::Path;
use std::process::Command;

use serde_json::Value;
use support::{HomeBeadsGuard, TestEnv};

/// Run the real bd bound to the TestEnv's HOME/BEADS_DIR (the same store
/// forged's config will read), mirroring `support::raw_bd`'s env discipline.
fn bd_in_env(bd: &Path, env: &TestEnv, args: &[&str]) -> Value {
    let mut c = Command::new(bd);
    c.args(args).env_clear();
    if let Some(p) = std::env::var_os("PATH") {
        c.env("PATH", p);
    }
    if let Some(t) = std::env::var_os("TMPDIR") {
        c.env("TMPDIR", t);
    }
    c.env("HOME", &env.home)
        .env("BEADS_DIR", &env.beads_dir)
        .env("BD_JSON_ENVELOPE", "1")
        .current_dir(&env.beads_dir);
    let out = c.output().expect("spawning real bd");
    assert!(
        out.status.success(),
        "bd {args:?} failed: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    serde_json::from_str(&String::from_utf8_lossy(&out.stdout)).unwrap_or(Value::Null)
}

fn created_id(envelope: &Value) -> String {
    envelope
        .get("data")
        .map(|d| match d {
            Value::Array(items) => items.first().cloned().unwrap_or(Value::Null),
            other => other.clone(),
        })
        .and_then(|d| d.get("id").and_then(Value::as_str).map(str::to_owned))
        .expect("created bead id")
}

#[test]
fn import_beads_round_trips_the_store_byte_identically() {
    // Guard FIRST, per the bd test conventions.
    let _guard = HomeBeadsGuard::new();
    let Some(bd) = support::require_bd() else {
        return;
    };
    let env = TestEnv::new("forged-work-import");
    env.forged(&["init"]);

    // Initialize the real store where forged's BEADS_DIR points. Inert init
    // from a clean cwd, exactly as the merged conventions require.
    let clean_cwd = env.root.join("bd-init-cwd");
    std::fs::create_dir_all(&clean_cwd).expect("clean init cwd");
    let mut init = Command::new(&bd);
    init.args([
        "init",
        "--non-interactive",
        "--quiet",
        "--skip-agents",
        "--skip-hooks",
    ])
    .env_clear()
    .env("HOME", &env.home)
    .env("BEADS_DIR", &env.beads_dir)
    .current_dir(&clean_cwd);
    if let Some(p) = std::env::var_os("PATH") {
        init.env("PATH", p);
    }
    let out = init.output().expect("spawning bd init");
    assert!(
        out.status.success(),
        "bd init failed: {}",
        String::from_utf8_lossy(&out.stderr)
    );

    // Point forged's config at the real bd instead of the shim.
    let config_path = env.anvil.join("config.json");
    let mut config: Value =
        serde_json::from_str(&std::fs::read_to_string(&config_path).expect("read config"))
            .expect("config json");
    config["bd_path"] = Value::String(bd.to_string_lossy().into_owned());
    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&config).expect("config"),
    )
    .expect("write config");

    // Author the store: an epic, a spec-rich child (unicode included), a
    // blocked child gated on it, a closed item, and a claimed item.
    let epic = created_id(&bd_in_env(
        &bd,
        &env,
        &["create", "Import epic", "--type", "epic", "--json"],
    ));
    let rich = created_id(&bd_in_env(
        &bd,
        &env,
        &["create", "Rich child — ünïcode ✓", "--json"],
    ));
    bd_in_env(
        &bd,
        &env,
        &[
            "update",
            &rich,
            "--description",
            "Context with\nnewlines and \"quotes\"",
            "--acceptance",
            "- byte-identical import\n- edges preserved",
            "--design",
            "design § notes",
            "--notes",
            "agent instructions",
            "--json",
        ],
    );
    let gated = created_id(&bd_in_env(&bd, &env, &["create", "Gated child", "--json"]));
    let done = created_id(&bd_in_env(
        &bd,
        &env,
        &["create", "Finished work", "--json"],
    ));
    let held = created_id(&bd_in_env(&bd, &env, &["create", "Held work", "--json"]));
    bd_in_env(
        &bd,
        &env,
        &[
            "dep",
            "add",
            &rich,
            &epic,
            "--type",
            "parent-child",
            "--json",
        ],
    );
    bd_in_env(
        &bd,
        &env,
        &[
            "dep",
            "add",
            &gated,
            &epic,
            "--type",
            "parent-child",
            "--json",
        ],
    );
    bd_in_env(
        &bd,
        &env,
        &["dep", "add", &gated, &rich, "--type", "blocks", "--json"],
    );
    bd_in_env(
        &bd,
        &env,
        &[
            "close", &done, "--actor", "operator", "--reason", "landed", "--json",
        ],
    );
    bd_in_env(
        &bd,
        &env,
        &[
            "update",
            &held,
            "--claim",
            "--actor",
            "forged:import-test:0",
            "--json",
        ],
    );

    // The one-shot import.
    let (code, envelope) = env.forged(&["work", "import-beads"]);
    assert_eq!(code, 0, "{envelope}");
    let result = envelope.get("result").unwrap_or(&envelope);
    assert_eq!(result["alreadyImported"], Value::Bool(false), "{envelope}");
    assert_eq!(result["imported"], 5, "{envelope}");
    assert_eq!(result["verified"], Value::Bool(true), "{envelope}");

    // Byte-fidelity spot checks straight from the ledger.
    let ledger = env.ledger();
    let rich_row = ledger.work_item(&rich).expect("read").expect("imported");
    assert_eq!(rich_row.spec.title, "Rich child — ünïcode ✓");
    assert_eq!(
        rich_row.spec.description,
        "Context with\nnewlines and \"quotes\""
    );
    assert_eq!(
        rich_row.spec.acceptance_criteria,
        "- byte-identical import\n- edges preserved"
    );
    assert_eq!(rich_row.spec.design, "design § notes");
    assert_eq!(rich_row.spec.notes, "agent instructions");
    assert_eq!(rich_row.revision, 1);

    let epic_row = ledger.work_item(&epic).expect("read").expect("imported");
    assert_eq!(epic_row.kind, forged_ledger::WorkKind::Epic);

    let done_row = ledger.work_item(&done).expect("read").expect("imported");
    assert_eq!(done_row.status, forged_ledger::WorkStatus::Closed);

    let held_row = ledger.work_item(&held).expect("read").expect("imported");
    assert_eq!(held_row.assignee.as_deref(), Some("forged:import-test:0"));
    assert_eq!(held_row.status, forged_ledger::WorkStatus::InProgress);
    // Imported custody has no lease row, so the scoped reclaim can always
    // free it.
    assert_eq!(ledger.work_lease(&held).expect("lease"), None);
    let out = ledger
        .reclaim_work_lease(&held, "forged:import-test:0", 0)
        .expect("reclaim imported residue");
    assert_eq!(out.previous_owner.as_deref(), Some("forged:import-test:0"));

    // Edges: the gated child carries its blocker and its parent.
    let deps = ledger.work_dependencies(&gated).expect("deps");
    assert!(
        deps.iter()
            .any(|d| d.id == rich && d.kind == forged_ledger::WorkDepKind::Blocks),
        "{deps:?}"
    );
    assert!(
        deps.iter()
            .any(|d| d.id == epic && d.kind == forged_ledger::WorkDepKind::ParentChild),
        "{deps:?}"
    );
    let children = ledger.work_epic_children(&epic).expect("children");
    assert_eq!(children.len(), 2, "{children:?}");
    ledger.close().expect("close ledger");

    // A second import is the idempotent no-op, not a duplicate.
    let (code, envelope) = env.forged(&["work", "import-beads"]);
    assert_eq!(code, 0, "{envelope}");
    let result = envelope.get("result").unwrap_or(&envelope);
    assert_eq!(result["alreadyImported"], Value::Bool(true), "{envelope}");
}
