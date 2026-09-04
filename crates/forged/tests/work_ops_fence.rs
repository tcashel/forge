//! The typed work surface's derived idempotency keys and strict parameter
//! reads: keyless repetition re-executes when durable state moved, and a
//! present-but-malformed value refuses instead of silently taking a default.

mod support;

use serde_json::{json, Value};
use support::{McpClient, TestEnv};

fn result(env: &TestEnv, args: &[&str]) -> Value {
    let (code, envelope) = env.forged(args);
    assert_eq!(code, 0, "{args:?}: {envelope}");
    envelope["result"].clone()
}

#[test]
fn keyless_updates_at_successive_revisions_both_land() {
    let env = TestEnv::new("forged-work-fence-update");
    assert_eq!(env.forged(&["init"]).0, 0);
    result(
        &env,
        &["work", "create", "--id", "fence-upd", "--title", "v1"],
    );
    // The expected revision is part of the derived key, so the ordinary
    // keyless read-edit-write loop never collides with its own first write.
    let two = result(
        &env,
        &[
            "work",
            "update",
            "--id",
            "fence-upd",
            "--expected-revision",
            "1",
            "--title",
            "v2",
        ],
    );
    assert_eq!(two["work"]["revision"], json!(2));
    let three = result(
        &env,
        &[
            "work",
            "update",
            "--id",
            "fence-upd",
            "--expected-revision",
            "2",
            "--title",
            "v3",
        ],
    );
    assert_eq!(three["work"]["revision"], json!(3));
    assert_eq!(three["work"]["spec"]["title"], json!("v3"));
}

#[test]
fn a_keyless_verb_reexecutes_after_the_item_moves() {
    let env = TestEnv::new("forged-work-fence-verbs");
    assert_eq!(env.forged(&["init"]).0, 0);
    result(
        &env,
        &["work", "create", "--id", "fence-verb", "--title", "cycle"],
    );
    let closed = result(
        &env,
        &["work", "close", "--id", "fence-verb", "--reason", "first"],
    );
    assert_eq!(closed["work"]["status"], json!("closed"));
    let reopened = result(&env, &["work", "reopen", "--id", "fence-verb"]);
    assert_eq!(reopened["work"]["status"], json!("open"));
    // The derived key is salted with the current revision: this keyless
    // close must EXECUTE against the reopened item, not replay the stored
    // first-close response over a still-open row.
    let again = result(
        &env,
        &["work", "close", "--id", "fence-verb", "--reason", "second"],
    );
    assert_eq!(again["work"]["status"], json!("closed"));
    let shown = result(&env, &["work", "show", "--id", "fence-verb"]);
    assert_eq!(shown["work"]["status"], json!("closed"), "{shown}");
}

#[test]
fn keyless_links_of_distinct_kinds_share_a_pair() {
    let env = TestEnv::new("forged-work-fence-link");
    assert_eq!(env.forged(&["init"]).0, 0);
    result(&env, &["work", "create", "--id", "fence-a", "--title", "a"]);
    result(&env, &["work", "create", "--id", "fence-b", "--title", "b"]);
    result(
        &env,
        &[
            "work", "link", "--from", "fence-a", "--to", "fence-b", "--kind", "related",
        ],
    );
    // A different kind on the same pair is a distinct edge, not an
    // idempotency conflict with the first link.
    result(
        &env,
        &[
            "work", "link", "--from", "fence-a", "--to", "fence-b", "--kind", "blocks",
        ],
    );
    let shown = result(&env, &["work", "show", "--id", "fence-a"]);
    let kinds: Vec<&str> = shown["dependencies"]
        .as_array()
        .expect("deps")
        .iter()
        .filter(|dep| dep["id"] == json!("fence-b"))
        .filter_map(|dep| dep["kind"].as_str())
        .collect();
    assert!(
        kinds.contains(&"related") && kinds.contains(&"blocks"),
        "{kinds:?}"
    );
}

#[test]
fn malformed_params_refuse_instead_of_defaulting() {
    let env = TestEnv::new("forged-work-fence-strict");
    assert_eq!(env.forged(&["init"]).0, 0);
    let mut mcp = McpClient::new(&env, None);
    let refuse = |mcp: &mut McpClient, name: &str, params: Value, why: &str| {
        let reply = mcp.call_tool(name, params);
        assert_eq!(reply["ok"], json!(false), "{why}: {reply}");
        assert_eq!(reply["error"]["code"], json!("INVALID_REQUEST"), "{reply}");
    };
    // A numeric kind must refuse, never silently mint a task; a string
    // priority must refuse, never silently drop the priority.
    refuse(
        &mut mcp,
        "work_create",
        json!({"id": "fence-strict", "title": "t", "kind": 7}),
        "numeric kind",
    );
    refuse(
        &mut mcp,
        "work_create",
        json!({"id": "fence-strict", "title": "t", "priority": "3"}),
        "string priority",
    );
    // Nothing was created by either refusal.
    let (code, shown) = env.forged(&["work", "show", "--id", "fence-strict"]);
    assert_ne!(code, 0, "no item may exist after refusals: {shown}");
    // A numeric spec field on update must refuse, never mint a no-op
    // revision.
    result(
        &env,
        &["work", "create", "--id", "fence-strict", "--title", "t"],
    );
    refuse(
        &mut mcp,
        "work_update",
        json!({"id": "fence-strict", "expectedRevision": 1, "title": 5}),
        "numeric title",
    );
    refuse(
        &mut mcp,
        "work_update",
        json!({"id": "fence-strict", "expectedRevision": 1, "priority": "3"}),
        "string update priority",
    );
    let shown = result(&env, &["work", "show", "--id", "fence-strict"]);
    assert_eq!(shown["work"]["revision"], json!(1), "no revision minted");
}
