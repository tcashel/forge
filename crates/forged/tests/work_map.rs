//! Work Map keeps current plan truth, durable execution truth, and their
//! coordinates distinct while remaining bounded and observational.

mod support;

use std::collections::BTreeMap;

use serde_json::{json, Value};
use support::{fabricate_run, TestEnv};

fn fabricate_run_for_work(env: &TestEnv, run_id: &str, work_id: &str) {
    let ledger = env.ledger();
    ledger
        .create_run(forged_ledger::NewRun {
            run_id: forged_types::RunId::new(run_id).expect("run id"),
            work_id: work_id.to_owned(),
            repo: env.repos.repo.to_string_lossy().into_owned(),
            base_ref: env.repos.base.clone(),
            branch: format!("forged/{run_id}"),
        })
        .expect("create run");
    ledger.close().expect("close ledger");
}

fn nodes(response: &Value) -> BTreeMap<String, Value> {
    response["result"]["nodes"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(|node| {
            let kind = node.pointer("/workRef/kind")?.as_str()?;
            let id = node.pointer("/workRef/id")?.as_str()?;
            Some((format!("{kind}:{id}"), node.clone()))
        })
        .collect()
}

fn edge(response: &Value, source: &str, kind: &str, target: &str) -> Value {
    response["result"]["edges"]
        .as_array()
        .into_iter()
        .flatten()
        .find(|item| {
            let source_key = format!(
                "{}:{}",
                item.pointer("/source/kind")
                    .and_then(Value::as_str)
                    .unwrap_or_default(),
                item.pointer("/source/id")
                    .and_then(Value::as_str)
                    .unwrap_or_default()
            );
            let target_key = format!(
                "{}:{}",
                item.pointer("/target/kind")
                    .and_then(Value::as_str)
                    .unwrap_or_default(),
                item.pointer("/target/id")
                    .and_then(Value::as_str)
                    .unwrap_or_default()
            );
            source_key == source && item["kind"] == json!(kind) && target_key == target
        })
        .cloned()
        .unwrap_or_else(|| panic!("missing edge {source} -{kind}-> {target}: {response}"))
}

#[test]
fn map_preserves_plan_twins_multiple_executions_and_native_edge_direction() {
    let env = TestEnv::new("forged-work-map-authorities");
    env.forged(&["init"]);
    let repository = env.repos.repo.to_string_lossy().into_owned();
    fabricate_run_for_work(&env, "exec-one", "shared-bead");
    fabricate_run_for_work(&env, "exec-two", "shared-bead");

    env.set_work_field("shared-bead", "title", "Current renamed plan title");
    env.set_work_field("shared-bead", "status", "in_progress");
    env.set_work_repository("shared-bead", &repository);
    env.set_work_field("plan-next", "title", "Next plan");
    env.set_work_field("plan-next", "status", "blocked");
    env.set_work_field("plan-next", "parent", "epic-boundary");
    env.set_work_repository("epic-boundary", "/tmp/a-different-repository");
    env.set_work_field(
        "plan-next",
        "dependencies",
        r#"[{"id":"foundation-boundary","dependency_type":"blocks","status":"closed"}]"#,
    );
    env.set_work_repository("plan-next", &repository);
    env.set_work_field("other-repo", "status", "open");
    env.set_work_repository("other-repo", "/tmp/a-different-repository");

    let (code, response) = env.forged(&[
        "work",
        "map",
        "--scope",
        "repository",
        "--repository",
        &repository,
        "--max-nodes",
        "50",
    ]);
    assert_eq!(code, 0, "work map: {response}");
    assert_eq!(response["result"]["schema"], "forged.work-map/1");
    let rows = nodes(&response);
    for key in [
        "run:exec-one",
        "run:exec-two",
        "plan:shared-bead",
        "plan:plan-next",
        "plan:epic-boundary",
        "plan:foundation-boundary",
    ] {
        assert!(rows.contains_key(key), "missing {key}: {response}");
    }
    assert!(
        !rows.contains_key("plan:other-repo"),
        "scope leaked: {response}"
    );
    assert_eq!(
        rows["run:exec-one"]["identity"]["bead"]["id"],
        "shared-bead"
    );
    assert!(
        rows["plan:shared-bead"]["identity"]["displayTitle"]
            .as_str()
            .is_some_and(|title| title.starts_with("Current renamed plan title")),
        "current plan title remains visible: {response}"
    );
    assert_ne!(
        rows["run:exec-one"]["identity"]["displayTitle"],
        rows["plan:shared-bead"]["identity"]["displayTitle"],
        "current rename cannot rewrite captured durable display identity"
    );
    assert_eq!(
        rows["plan:shared-bead"]["queue"]["desired"]["source"],
        "none"
    );
    assert_eq!(
        rows["plan:shared-bead"]["queue"]["admission"]["source"],
        "none"
    );
    assert_eq!(rows["run:exec-one"]["detailTarget"]["subjectKind"], "run");
    assert_eq!(rows["plan:shared-bead"]["detailTarget"], Value::Null);

    edge(
        &response,
        "run:exec-one",
        "execution-of",
        "plan:shared-bead",
    );
    edge(
        &response,
        "run:exec-two",
        "execution-of",
        "plan:shared-bead",
    );
    assert_eq!(
        edge(
            &response,
            "plan:plan-next",
            "parent-child",
            "plan:epic-boundary"
        )["contextOnly"],
        true
    );
    assert_eq!(
        edge(
            &response,
            "plan:plan-next",
            "blocks",
            "plan:foundation-boundary"
        )["contextOnly"],
        true
    );
    assert_eq!(rows["plan:epic-boundary"]["contextOnly"], true);
    assert_eq!(rows["plan:foundation-boundary"]["contextOnly"], true);

    // The bounded discovery-plus-hydrate contract is structural in the
    // in-process store; no argv trace exists to count.
}

/// `supersedes` survives the map as itself. Collapsing it into `related`
/// would lose the one fact the edge carries — which plan replaced which —
/// and promoting it into a blocker would invent a prerequisite out of
/// history.
#[test]
fn a_supersedes_edge_keeps_its_native_kind_and_direction() {
    let env = TestEnv::new("forged-work-map-supersedes");
    env.forged(&["init"]);
    let repository = env.repos.repo.to_string_lossy().into_owned();

    env.set_work_field("plan-replacement", "title", "Replacement slice");
    env.set_work_field("plan-replacement", "status", "open");
    env.set_work_field(
        "plan-replacement",
        "dependencies",
        r#"[{"id":"plan-superseded","dependency_type":"supersedes","status":"open"}]"#,
    );
    env.set_work_repository("plan-replacement", &repository);
    // The superseded work must be genuinely outside the hydrated scope for
    // the boundary-context claim to mean anything.
    env.set_work_repository("plan-superseded", "/tmp/a-different-repository");

    let (code, response) = env.forged(&[
        "work",
        "map",
        "--scope",
        "repository",
        "--repository",
        &repository,
    ]);
    assert_eq!(code, 0, "work map: {response}");
    assert_eq!(
        response["result"]["sourceHealth"]["plan"]["state"], "available",
        "a provenance edge cannot degrade the plan source: {response}"
    );
    let provenance = edge(
        &response,
        "plan:plan-replacement",
        "supersedes",
        "plan:plan-superseded",
    );
    assert_eq!(provenance["evidence"], json!(["plan.dependencies"]));
    assert_eq!(
        provenance["contextOnly"], true,
        "the superseded bead is outside the hydrated scope, so it is boundary context: {response}"
    );
    let rows = nodes(&response);
    assert_eq!(rows["plan:plan-superseded"]["contextOnly"], true);
    assert_eq!(
        rows["plan:plan-superseded"]["plan"]["status"], "open",
        "boundary context carries the status the edge reported: {response}"
    );
    assert_eq!(
        rows["plan:plan-replacement"]["plan"]["readiness"], "ready",
        "provenance never changes graph readiness: {response}"
    );
    assert_eq!(
        response["result"]["graphHealth"],
        json!({
            "healthy": true,
            "cycleNodes": [],
            "danglingTargets": [],
            "missingBlockerStatus": [],
        }),
        "a supersedes edge is never missing-blocker health: {response}"
    );
}

#[test]
fn epic_scope_unions_native_and_legacy_children() {
    let env = TestEnv::new("forged-work-map-epic");
    env.forged(&["init"]);
    env.set_work_field("epic-map", "type", "epic");
    env.set_work_field("epic-map", "status", "open");
    env.set_work_field(
        "epic-map",
        "dependencies",
        r#"[{"id":"legacy-child","title":"Legacy child","status":"open","issue_type":"task","dependency_type":"related"}]"#,
    );
    env.set_work_field("native-child", "status", "open");
    env.set_work_field("native-child", "parent", "epic-map");
    env.set_work_field(
        "native-child",
        "dependencies",
        r#"[{"id":"epic-map","dependency_type":"parent-child","status":"open"}]"#,
    );
    env.set_work_field("legacy-child", "status", "open");
    let (code, response) = env.forged(&["work", "map", "--scope", "epic", "--epic-id", "epic-map"]);
    assert_eq!(code, 0, "epic map: {response}");
    let rows = nodes(&response);
    for key in ["plan:epic-map", "plan:native-child", "plan:legacy-child"] {
        assert!(rows.contains_key(key), "missing {key}: {response}");
    }
    assert_eq!(
        edge(
            &response,
            "plan:native-child",
            "parent-child",
            "plan:epic-map",
        )["evidence"],
        json!(["plan.parent", "plan.dependencies"]),
        "byte-identical native coordinates are emitted once with both origins"
    );
    edge(&response, "plan:epic-map", "related", "plan:legacy-child");
}

#[test]
fn a_run_whose_plan_work_is_absent_marks_an_unresolved_coordinate() {
    let env = TestEnv::new("forged-work-map-outage");
    env.forged(&["init"]);
    fabricate_run(&env, "outage-run");

    let (code, response) = env.forged(&["work", "map", "--source", "durable"]);
    assert_eq!(code, 0, "the store answers: {response}");
    assert_eq!(
        response["result"]["sourceHealth"]["ledger"]["state"],
        "available"
    );
    assert_eq!(
        response["result"]["sourceHealth"]["beads"]["state"],
        "available"
    );
    assert_eq!(
        response["result"]["sourceHealth"]["plan"]["state"],
        "available"
    );
    let rows = nodes(&response);
    assert!(rows.contains_key("run:outage-run"), "{response}");
    assert!(
        !rows.contains_key("plan:bead-outage-run"),
        "no invented plan: {response}"
    );
    assert_eq!(
        response["result"]["graphHealth"]["danglingTargets"][0],
        json!({"schema":"forged.work-ref/1","kind":"plan","id":"bead-outage-run"})
    );
}

#[test]
fn known_closed_execution_target_is_bounded_context_not_false_dangling() {
    let env = TestEnv::new("forged-work-map-closed-target");
    env.forged(&["init"]);
    fabricate_run(&env, "closed-target");
    env.set_work_field("bead-closed-target", "status", "closed");

    let (code, response) = env.forged(&["work", "map", "--source", "durable"]);
    assert_eq!(code, 0, "closed target context: {response}");
    let rows = nodes(&response);
    assert_eq!(rows["plan:bead-closed-target"]["contextOnly"], true);
    assert_eq!(rows["plan:bead-closed-target"]["plan"]["status"], "closed");
    assert_eq!(
        edge(
            &response,
            "run:closed-target",
            "execution-of",
            "plan:bead-closed-target"
        )["contextOnly"],
        true
    );
    assert_eq!(response["result"]["graphHealth"]["healthy"], true);
    assert_eq!(
        response["result"]["graphHealth"]["danglingTargets"],
        json!([])
    );
}

#[test]
fn graph_cap_refuses_without_returning_a_partial_map() {
    let env = TestEnv::new("forged-work-map-cap");
    env.forged(&["init"]);
    for id in ["plan-a", "plan-b", "plan-c"] {
        env.set_work_field(id, "status", "open");
    }
    let (code, response) = env.forged(&["work", "map", "--max-nodes", "2"]);
    assert_ne!(code, 0, "cap overflow must refuse: {response}");
    assert_eq!(response["error"]["code"], "GRAPH_SCOPE_TOO_LARGE");
    assert!(response["result"].is_null(), "no partial graph: {response}");
    assert!(response["error"]["message"]
        .as_str()
        .is_some_and(|message| message.contains("narrow scope")));
    // The N+1 discovery contract, at the one surface that states it: the
    // bound is proved by discovering exactly limit+1, never the whole store.
    assert!(
        response["error"]["message"]
            .as_str()
            .is_some_and(|message| message.contains("at least 3 live-plan nodes")),
        "the refusal reports the N+1 probe, not a full count: {response}"
    );
}

#[test]
fn graph_health_names_cycle_members_without_marking_their_ancestor() {
    let env = TestEnv::new("forged-work-map-cycle");
    env.forged(&["init"]);
    for (id, dependency) in [
        ("plan-a", "plan-b"),
        ("plan-b", "plan-c"),
        ("plan-c", "plan-b"),
    ] {
        env.set_work_field(id, "status", "open");
        env.set_work_field(
            id,
            "dependencies",
            &format!(r#"[{{"id":"{dependency}","dependency_type":"related","status":"open"}}]"#),
        );
    }

    let (code, response) = env.forged(&["work", "map"]);
    assert_eq!(code, 0, "cycle is graph health data: {response}");
    let cycles = response["result"]["graphHealth"]["cycleNodes"]
        .as_array()
        .expect("cycle coordinates");
    let ids = cycles
        .iter()
        .filter_map(|reference| reference["id"].as_str())
        .collect::<Vec<_>>();
    assert_eq!(ids, vec!["plan-b", "plan-c"], "{response}");
    assert_eq!(response["result"]["graphHealth"]["healthy"], false);
}

#[test]
fn plan_twins_cannot_inherit_durable_only_attention() {
    let env = TestEnv::new("forged-work-map-attention-routing");
    env.forged(&["init"]);
    fabricate_run_for_work(&env, "same-id", "same-id");
    env.set_work_field("same-id", "status", "blocked");
    let ledger = env.ledger();
    ledger
        .append_event(
            Some("same-id"),
            "proto.quarantine",
            json!({"reason":"durable event evidence"}),
        )
        .expect("durable attention event");
    ledger.close().expect("close ledger");

    let (code, response) = env.forged(&["work", "map"]);
    assert_eq!(code, 0, "attention map: {response}");
    let rows = nodes(&response);
    let durable = rows["run:same-id"]["attention"]
        .as_array()
        .expect("durable attention");
    let plan = rows["plan:same-id"]["attention"]
        .as_array()
        .expect("plan attention");
    assert!(
        durable
            .iter()
            .any(|item| item["condition"] == "quarantined"),
        "durable event remains on its exact run: {response}"
    );
    assert!(
        durable.iter().all(
            |item| item["evidenceRefs"]
                .as_array()
                .is_some_and(|references| references
                    .iter()
                    .all(|reference| reference["kind"] != "bead"))
        ),
        "plan-owned Bead evidence cannot leak onto the durable twin: {response}"
    );
    assert_eq!(
        plan.len(),
        1,
        "only Beads attention belongs on plan: {response}"
    );
    assert_eq!(plan[0]["condition"], "blocked");
    assert_eq!(plan[0]["evidenceRefs"][0]["kind"], "bead");
}

/// An epic work is minted as a `plan` reference so every `execution-of`,
/// `parent-child` and dependency target keeps resolving. `counts.epics`
/// therefore reads subject kind, and deliberately overlaps `counts.plan`.
#[test]
fn a_live_plan_epic_counts_as_an_epic_while_its_reference_stays_a_plan() {
    let env = TestEnv::new("forged-work-map-epic-count");
    env.forged(&["init"]);
    let repository = env.repos.repo.to_string_lossy().into_owned();
    fabricate_run(&env, "count-run");
    env.set_work_repository("bead-count-run", &repository);
    env.set_work_field("bead-count-run", "status", "in_progress");
    env.set_work_field("count-epic", "title", "Counted epic");
    env.set_work_field("count-epic", "type", "epic");
    env.set_work_field("count-epic", "status", "open");
    env.set_work_repository("count-epic", &repository);

    let (code, response) = env.forged(&[
        "work",
        "map",
        "--scope",
        "repository",
        "--repository",
        &repository,
    ]);
    assert_eq!(code, 0, "work map: {response}");
    let counts = &response["result"]["counts"];
    assert!(
        counts["epics"].as_u64().expect("epic count") >= 1,
        "a live-plan epic bead counts as an epic: {response}"
    );
    let rows = nodes(&response);
    // `plan` and `runs` still key off the REFERENCE kind, unchanged. Only
    // `epics` moved to subject kind, so it overlaps `plan` by exactly the
    // epic node rather than partitioning the graph.
    let by_ref = |kind: &str| {
        rows.values()
            .filter(|node| node["workRef"]["kind"] == json!(kind))
            .count() as u64
    };
    assert_eq!(counts["plan"], json!(by_ref("plan")), "{response}");
    assert_eq!(counts["runs"], json!(by_ref("run")), "{response}");
    let plan_count = counts["plan"].as_u64().expect("plan count");
    let run_count = counts["runs"].as_u64().expect("run count");
    let node_count = counts["nodes"].as_u64().expect("node count");
    let epic_count = counts["epics"].as_u64().expect("epic count");
    assert_eq!(
        plan_count + run_count,
        node_count,
        "reference kinds still partition the graph: {response}"
    );
    assert_ne!(
        plan_count + run_count + epic_count,
        node_count,
        "plan + runs + epics == nodes no longer holds: {response}"
    );
    let epic = &rows["plan:count-epic"];
    assert_eq!(
        epic["workRef"]["kind"],
        json!("plan"),
        "re-keying the reference would dangle every edge that targets it: {response}"
    );
    assert_eq!(epic["identity"]["subject"]["kind"], json!("epic"));
    // `decorate_titles` runs after the live-plan entries are pushed, so a
    // plan node carries the plan work's real title rather than null.
    assert_eq!(
        epic["titleSource"]["source"],
        json!("identity.displayTitle")
    );
    assert!(
        epic["titleSource"]["value"]
            .as_str()
            .expect("plan node title")
            .contains("Counted epic"),
        "{epic}"
    );
    assert_eq!(
        response["result"]["graphHealth"]["healthy"],
        json!(true),
        "{response}"
    );
}
