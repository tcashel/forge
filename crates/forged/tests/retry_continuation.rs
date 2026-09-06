//! A successor reuses evidence, not an invented implementation attempt.

mod support;

use forged_ledger::{RunState, SpecFence};
use forged_proto::{machine_idempotency_key, MachineStage, ProtoEvent};
use forged_types::{OperationRequest, Outcome, PacketResult};
use serde_json::{json, Value};
use support::{git, TestEnv};

const SOURCE: &str = "retry-implementation";

fn advance(env: &TestEnv, run: &str) -> Value {
    let (code, response) = env.forged(&["run", "advance", "--run", run]);
    assert_eq!(code, 0, "advance {run}: {response}");
    response["result"]["action"].clone()
}

fn interrupted_source(name: &str, evidence: &str) -> (TestEnv, String, i64) {
    let env = TestEnv::new(name);
    assert_eq!(env.forged(&["init"]).0, 0);
    if evidence.starts_with("gate") {
        configure(&env, |config| config["gate_commands"] = json!(["false"]));
    }
    env.seed_work_spec(
        SOURCE,
        "Implement the bounded change",
        "- a committed change exists",
    );
    let (code, response) = env.forged(&[
        "run",
        "start",
        "--work",
        SOURCE,
        "--repo",
        env.repos.repo.to_str().unwrap(),
        "--base-ref",
        "main",
        "--profile",
        "standard",
    ]);
    assert_eq!(code, 0, "start: {response}");
    if evidence == "missing-base" {
        // Resolve restarted after creating its worktree, before recording
        // the base SHA: existing worktree presence cannot fill that gap.
        tokio::runtime::Runtime::new()
            .unwrap()
            .block_on(forged_git::prepare_worktree(&forged_git::WorktreeSpec {
                repo: env.repos.repo.clone(),
                runs_root: env.anvil.join("runs"),
                run_id: SOURCE.to_owned(),
                branch: format!("forged/{SOURCE}"),
                base: "main".to_owned(),
                expected_base_sha: None,
                start_sha: None,
            }))
            .unwrap();
    }
    assert_eq!(advance(&env, SOURCE), json!({"runMachine": "resolve"}));
    assert!(advance(&env, SOURCE)["openPackets"].is_array());
    let ledger = env.ledger();
    let packet = ledger.list_packets(SOURCE).unwrap().pop().unwrap();
    let claim = ledger
        .claim_packet(
            &packet.packet_id,
            "fixture-worker",
            &SpecFence::Revision {
                revision: packet.spec_revision.clone().unwrap(),
                body_sha256: packet.spec_sha256.clone(),
            },
        )
        .unwrap();
    let worktree = env.anvil.join("runs").join(SOURCE).join("worktree");
    std::fs::write(worktree.join("implemented.txt"), "bounded change\n").unwrap();
    git(&worktree, &["add", "implemented.txt"]);
    git(&worktree, &["commit", "-m", "implement bounded change"]);
    let mut head = git(&worktree, &["rev-parse", "HEAD"]).trim().to_owned();
    ledger
        .complete_packet(
            &packet.packet_id,
            &claim.claim_token,
            &PacketResult {
                schema: "forged.result/1".to_owned(),
                packet_id: packet.packet_id.clone(),
                outcome: Outcome::Implement {
                    implemented: true,
                    commits_ahead: 1,
                    summary: "committed the bounded change".to_owned(),
                    gate_state: Some("pass".to_owned()),
                    note: None,
                },
            },
        )
        .unwrap();
    ledger.close().unwrap();
    assert_eq!(advance(&env, SOURCE), json!({"runMachine": "gate"}));
    if evidence.starts_with("gate") {
        return stopped_gate_source(env, evidence, head, claim.attempt_id);
    }
    if evidence == "post-gate-head" {
        std::fs::write(worktree.join("after-gate.txt"), "changed after the gate\n").unwrap();
        git(&worktree, &["add", "after-gate.txt"]);
        git(&worktree, &["commit", "-m", "change after source gate"]);
        head = git(&worktree, &["rev-parse", "HEAD"]).trim().to_owned();
    }
    if evidence == "missing-gate-head" {
        let connection = rusqlite::Connection::open(env.anvil.join("state.db")).unwrap();
        connection.execute(
            "UPDATE operations SET response_json = json_remove(response_json, '$.result.headSha') \
             WHERE name = 'gate' AND run_id = ?1",
            [SOURCE],
        ).unwrap();
    }
    let ledger = env.ledger();
    let key = machine_idempotency_key(SOURCE, MachineStage::Push, 0);
    forged_proto::record(
        &ledger,
        SOURCE,
        ProtoEvent::OperationRequest {
            name: "push".to_owned(),
            idempotency_key: key.clone(),
            effect_class: "observe-only".to_owned(),
            request: OperationRequest {
                schema_version: 1,
                idempotency_key: key,
                run_id: Some(SOURCE.to_owned()),
                params: if evidence == "missing-head" {
                    json!({"branch": format!("forged/{SOURCE}")})
                } else {
                    json!({"expectedSha": head, "branch": format!("forged/{SOURCE}")})
                }
                .as_object()
                .unwrap()
                .clone(),
            },
        },
    )
    .unwrap();
    // The descriptor-before-claim crash leaves no uncertain remote effect.
    if matches!(evidence, "manual-blocked" | "manual-cancelled") {
        ledger
            .settle_run(
                SOURCE,
                if evidence == "manual-blocked" {
                    forged_ledger::RunOutcome::Blocked
                } else {
                    forged_ledger::RunOutcome::Cancelled
                },
                "operator stopped incorrect implementation".to_owned(),
                None,
                None,
                None,
            )
            .unwrap();
    } else {
        ledger
            .set_run_state(
                SOURCE,
                RunState::Stopped,
                Some(if evidence == "unrelated-stop" {
                    "input-required: implementation needs reconsideration".to_owned()
                } else {
                    "input-required: git push interrupted".to_owned()
                }),
            )
            .unwrap();
    }
    let holder = ledger.work_lease_holder(SOURCE).unwrap().unwrap();
    ledger.close().unwrap();
    // Keep this test independent of retry's separate custody recovery seam.
    env.set_work_field(SOURCE, "status", "open");
    let ledger = env.ledger();
    ledger.release_work_item(SOURCE, &holder).unwrap();
    ledger.close().unwrap();
    (env, head, claim.attempt_id)
}

fn configure(env: &TestEnv, change: impl FnOnce(&mut Value)) {
    let path = env.anvil.join("config.json");
    let mut config: Value = serde_json::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap();
    change(&mut config);
    std::fs::write(path, serde_json::to_vec(&config).unwrap()).unwrap();
}

fn stopped_gate_source(
    env: TestEnv,
    scenario: &str,
    head: String,
    attempt: i64,
) -> (TestEnv, String, i64) {
    assert!(advance(&env, SOURCE)["openPackets"].is_array());
    let ledger = env.ledger();
    let packet = ledger
        .list_packets(SOURCE)
        .unwrap()
        .into_iter()
        .find(|packet| packet.stage == forged_types::Stage::Fix)
        .unwrap();
    let claim = ledger
        .claim_packet(
            &packet.packet_id,
            "fixture-repair",
            &SpecFence::Revision {
                revision: packet.spec_revision.clone().unwrap(),
                body_sha256: packet.spec_sha256.clone(),
            },
        )
        .unwrap();
    ledger
        .complete_packet(
            &packet.packet_id,
            &claim.claim_token,
            &PacketResult {
                schema: "forged.result/1".to_owned(),
                packet_id: packet.packet_id.clone(),
                outcome: Outcome::Fix {
                    applied: false,
                    summary: "environment requires repair".to_owned(),
                },
            },
        )
        .unwrap();
    ledger.close().unwrap();
    if scenario == "gate-legacy" {
        // A durable terminal written by the previous protocol, which stopped
        // immediately on a typed no-op instead of running the bounded regate.
        let ledger = env.ledger();
        ledger
            .append_event_kind_once(
                SOURCE,
                "run.protocol-terminal",
                json!({
                    "schemaVersion": 1,
                    "terminal": {"remediationFailed": {"round": 1, "finalVerdict": null}},
                }),
            )
            .unwrap();
        ledger
            .settle_run(
                SOURCE,
                forged_ledger::RunOutcome::Blocked,
                "remediation failed in round 1 with verdict unavailable".to_owned(),
                None,
                None,
                None,
            )
            .unwrap();
        ledger.close().unwrap();
    } else {
        assert_eq!(advance(&env, SOURCE), json!({"runMachine": "regate"}));
        if matches!(
            scenario,
            "gate-revised" | "gate-source-policy" | "gate-source-roster"
        ) {
            configure(&env, |config| {
                config["gate_commands"] = json!(["false", "true"]);
                if scenario == "gate-source-policy" {
                    config["seat_commands"] = json!(["true"]);
                } else if scenario == "gate-source-roster" {
                    config["roster"]["implement"]["model"] = json!("changed-model");
                }
            });
            let verb = if scenario == "gate-source-roster" {
                "revise-roster"
            } else {
                "revise-policy"
            };
            let mut args = vec!["run", verb, "--run", SOURCE, "--reason", "fixture repair"];
            if scenario == "gate-source-roster" {
                args.extend_from_slice(&["--roster", "default"]);
            }
            let (code, response) = env.forged(&args);
            assert_eq!(code, 0, "revise before terminal: {response}");
        }
        assert!(advance(&env, SOURCE)["stop"]["reviewBudgetExhausted"].is_object());
    }
    configure(&env, |config| config["gate_commands"] = json!(["true"]));
    let (code, response) = env.forged(&["work", "reopen", "--id", SOURCE]);
    assert_eq!(code, 0, "reopen: {response}");
    (env, head, attempt)
}

fn retry(env: &TestEnv, extra: &[&str]) -> String {
    let mut args = vec!["run", "retry", "--id", SOURCE];
    args.extend_from_slice(extra);
    let (code, response) = env.forged(&args);
    assert_eq!(code, 0, "retry: {response}");
    response["result"]["runId"].as_str().unwrap().to_owned()
}

fn resolve_result(env: &TestEnv, run: &str) -> Value {
    let ledger = env.ledger();
    let operation = ledger
        .find_operation(
            "resolve",
            &machine_idempotency_key(run, MachineStage::Resolve, 0),
        )
        .unwrap()
        .unwrap();
    let response: Value =
        serde_json::from_str(operation.response_json.as_deref().unwrap()).unwrap();
    ledger.close().unwrap();
    response["result"].clone()
}

#[test]
fn interrupted_first_push_references_original_attempt_and_runs_fresh_gate() {
    let (env, head, attempt) =
        interrupted_source("retry-continuation-preserves-attempt", "complete");
    let successor = retry(&env, &[]);
    assert_eq!(advance(&env, &successor), json!({"runMachine": "resolve"}));
    let proof = resolve_result(&env, &successor)["implementationReuse"].clone();
    assert_eq!(proof["sourceRunId"], json!(SOURCE));
    assert_eq!(proof["sourceAttemptId"], json!(attempt));
    assert_eq!(proof["headSha"], json!(head));
    assert_eq!(advance(&env, &successor), json!({"runMachine": "gate"}));
    let ledger = env.ledger();
    assert!(ledger.list_packets(&successor).unwrap().is_empty());
    assert_eq!(
        ledger.get_attempt(attempt).unwrap().state,
        forged_ledger::AttemptState::Completed
    );
    assert!(ledger
        .latest_event_of_kind(&successor, "proto.gate")
        .unwrap()
        .is_some());
    assert_eq!(ledger.get_run(SOURCE).unwrap().state, RunState::Stopped);
    ledger.close().unwrap();
}

#[test]
fn retry_does_not_reuse_changed_or_missing_evidence() {
    for scenario in [
        "rebase",
        "fresh",
        "spec",
        "policy",
        "base",
        "head",
        "dirty",
        "missing-head",
        "missing-base",
        "manual-blocked",
        "manual-cancelled",
        "unrelated-stop",
        "post-gate-head",
        "missing-gate-head",
    ] {
        let (env, head, _) =
            interrupted_source(&format!("retry-continuation-{scenario}"), scenario);
        match scenario {
            "spec" => env.set_work_field(SOURCE, "notes", "An additional requirement"),
            "policy" => {
                let path = env.anvil.join("config.json");
                let mut config: Value =
                    serde_json::from_str(&std::fs::read_to_string(&path).unwrap()).unwrap();
                config["gate_commands"] = json!(["true", "true"]);
                std::fs::write(path, serde_json::to_vec(&config).unwrap()).unwrap();
            }
            "base" | "head" => {
                let repo = if scenario == "base" {
                    env.repos.origin.clone()
                } else {
                    env.anvil.join("runs").join(SOURCE).join("worktree")
                };
                std::fs::write(repo.join("later.txt"), "later commit\n").unwrap();
                git(&repo, &["add", "later.txt"]);
                git(&repo, &["commit", "-m", "later change"]);
            }
            _ => {}
        }
        let extra = match scenario {
            "rebase" => vec!["--because", "rebase"],
            "fresh" => vec!["--fresh"],
            _ => vec![],
        };
        let successor = retry(&env, &extra);
        if scenario == "dirty" {
            let prepared = tokio::runtime::Runtime::new()
                .unwrap()
                .block_on(forged_git::prepare_worktree(&forged_git::WorktreeSpec {
                    repo: env.repos.repo.clone(),
                    runs_root: env.anvil.join("runs"),
                    run_id: successor.clone(),
                    branch: format!("forged/{successor}"),
                    base: "main".to_owned(),
                    expected_base_sha: None,
                    start_sha: Some(head),
                }))
                .unwrap();
            std::fs::write(
                prepared.worktree.join("unclaimed.txt"),
                "uncommitted work\n",
            )
            .unwrap();
        }
        advance(&env, &successor);
        assert!(
            resolve_result(&env, &successor)
                .get("implementationReuse")
                .is_none(),
            "{scenario}"
        );
        assert_eq!(
            advance(&env, &successor)["openPackets"][0]["stage"],
            json!("implement"),
            "{scenario}"
        );
    }
}

#[test]
fn gate_recovery_reuses_original_implementation_under_fresh_assurance() {
    for scenario in ["gate", "gate-revised", "gate-legacy"] {
        let (env, head, attempt) = interrupted_source(&format!("retry-{scenario}"), scenario);
        let ledger = env.ledger();
        let terminal = ledger
            .latest_event_of_kind(SOURCE, "run.protocol-terminal")
            .unwrap()
            .unwrap();
        ledger.close().unwrap();
        let successor = retry(&env, &[]);
        advance(&env, &successor);
        let proof = resolve_result(&env, &successor)["implementationReuse"].clone();
        assert_eq!(
            proof["sourceAttemptId"],
            json!(attempt),
            "{scenario}: {proof}"
        );
        assert_eq!(proof["headSha"], json!(head));
        assert_eq!(advance(&env, &successor), json!({"runMachine": "gate"}));
        env.set_scenario("reviewclaude", "approve", 10);
        env.set_scenario("reviewcodex", "approve", 10);
        let (code, response) = env.forged(&["run", "drive", "--run", &successor]);
        assert_eq!(code, 0, "{scenario}: {response}");
        assert!(
            response["result"]["terminal"]["done"].is_object(),
            "{scenario}: {response}"
        );
        let ledger = env.ledger();
        let packets = ledger.list_packets(&successor).unwrap();
        assert!(!packets.is_empty(), "fresh review must run");
        assert!(packets.iter().all(|packet| matches!(
            packet.stage,
            forged_types::Stage::ReviewClaude | forged_types::Stage::ReviewCodex
        )));
        assert_eq!(
            ledger.get_attempt(attempt).unwrap().state,
            forged_ledger::AttemptState::Completed
        );
        assert_eq!(
            ledger
                .latest_event_of_kind(SOURCE, "run.protocol-terminal")
                .unwrap()
                .unwrap()
                .payload_json,
            terminal.payload_json,
            "source terminal is immutable"
        );
        assert_eq!(
            ledger.get_run(&successor).unwrap().terminal_outcome,
            Some(forged_ledger::RunOutcome::Clean)
        );
        ledger.close().unwrap();
        let worktree = env.anvil.join("runs").join(&successor).join("worktree");
        assert_eq!(git(&worktree, &["rev-parse", "HEAD"]).trim(), head);
    }
}

#[test]
fn gate_recovery_denies_changed_contract_or_candidate_evidence() {
    for scenario in [
        "fresh",
        "spec-amended",
        "rebase",
        "spec",
        "base",
        "source-head",
        "source-dirty",
        "successor-head",
        "successor-dirty",
        "moved-after-retry",
        "policy",
        "roster",
        "source-policy",
        "source-roster",
        "missing-terminal",
        "manual-stop",
        "provider-stop",
        "missing-gate",
        "missing-gate-head",
        "review",
        "push",
        "draftpr",
        "fix-applied",
        "fix-missing-result",
        "amendment",
    ] {
        let (env, head, _) = interrupted_source(
            &format!("retry-gate-deny-{scenario}"),
            &format!("gate-{scenario}"),
        );
        let source_tree = env.anvil.join("runs").join(SOURCE).join("worktree");
        match scenario {
            "spec" => env.set_work_field(SOURCE, "notes", "Additional requirement"),
            "base" | "source-head" => {
                let tree = if scenario == "base" {
                    &env.repos.origin
                } else {
                    &source_tree
                };
                commit_change(tree);
            }
            "source-dirty" => {
                std::fs::write(source_tree.join("unfinished.txt"), "unfinished").unwrap()
            }
            "policy" => configure(&env, |config| config["seat_commands"] = json!(["true"])),
            "roster" => configure(&env, |config| {
                config["roster"]["implement"]["model"] = json!("changed-model")
            }),
            "missing-terminal" | "manual-stop" | "provider-stop" => {
                let connection = rusqlite::Connection::open(env.anvil.join("state.db")).unwrap();
                connection
                    .execute(
                        "DELETE FROM events WHERE run_id = ?1 AND kind = 'run.protocol-terminal'",
                        [SOURCE],
                    )
                    .unwrap();
                if scenario == "provider-stop" {
                    let ledger = env.ledger();
                    ledger.append_event_kind_once(SOURCE, "run.protocol-terminal", json!({
                        "schemaVersion": 1, "terminal": {"providerUnavailable": {"stage": "remediation", "attempts": 1}}
                    })).unwrap();
                    ledger.close().unwrap();
                }
            }
            "missing-gate" | "missing-gate-head" => {
                let connection = rusqlite::Connection::open(env.anvil.join("state.db")).unwrap();
                connection.execute(if scenario == "missing-gate" {
                    "DELETE FROM operations WHERE run_id = ?1 AND name = 'gate'"
                } else {
                    "UPDATE operations SET response_json = json_remove(response_json, '$.result.headSha') WHERE run_id = ?1 AND name = 'gate'"
                }, [SOURCE]).unwrap();
            }
            "review" | "fix-applied" | "fix-missing-result" | "amendment" => {
                let connection = rusqlite::Connection::open(env.anvil.join("state.db")).unwrap();
                if scenario == "review" {
                    connection.execute("UPDATE packets SET stage = 'reviewclaude' WHERE run_id = ?1 AND stage = 'fix'", [SOURCE]).unwrap();
                } else {
                    let outcome = match scenario {
                        "fix-applied" => {
                            json!({"fix": {"applied": true, "summary": "changed source"}})
                        }
                        "amendment" => {
                            json!({"specAmendment": {"amendment": {"summary": "decision", "evidence": "missing target", "proposedChange": "new scope"}}})
                        }
                        _ => Value::Null,
                    };
                    connection.execute("UPDATE attempts SET result_json = json_set(result_json, '$.outcome', json(?1)) WHERE packet_id IN (SELECT packet_id FROM packets WHERE run_id = ?2 AND stage = 'fix')",
                        [serde_json::to_string(&outcome).unwrap(), SOURCE.to_owned()]).unwrap();
                }
            }
            "push" | "draftpr" => {
                let ledger = env.ledger();
                forged_proto::record(
                    &ledger,
                    SOURCE,
                    ProtoEvent::OperationRequest {
                        name: scenario.to_owned(),
                        idempotency_key: format!("{SOURCE}/{scenario}/0"),
                        effect_class: "observe-only".to_owned(),
                        request: OperationRequest {
                            schema_version: 1,
                            idempotency_key: format!("{SOURCE}/{scenario}/0"),
                            run_id: Some(SOURCE.to_owned()),
                            params: json!({"expectedSha": head}).as_object().unwrap().clone(),
                        },
                    },
                )
                .unwrap();
                ledger.close().unwrap();
            }
            _ => {}
        }
        let extra: &[&str] = match scenario {
            "fresh" => &["--fresh"],
            "rebase" => &["--because", "rebase"],
            "spec-amended" => &["--because", "spec-amended"],
            _ => &[],
        };
        let successor = retry(&env, extra);
        if scenario == "moved-after-retry" {
            commit_change(&source_tree);
        }
        if matches!(scenario, "successor-head" | "successor-dirty") {
            let prepared = tokio::runtime::Runtime::new()
                .unwrap()
                .block_on(forged_git::prepare_worktree(&forged_git::WorktreeSpec {
                    repo: env.repos.repo.clone(),
                    runs_root: env.anvil.join("runs"),
                    run_id: successor.clone(),
                    branch: format!("forged/{successor}"),
                    base: "main".to_owned(),
                    expected_base_sha: None,
                    start_sha: Some(head),
                }))
                .unwrap();
            if scenario == "successor-head" {
                commit_change(&prepared.worktree);
            } else {
                std::fs::write(prepared.worktree.join("unfinished.txt"), "unfinished").unwrap();
            }
        }
        if scenario == "successor-head" {
            // Worktree preparation fences its recorded start before reuse is
            // considered. A moved pre-existing successor must stop outright.
            let (code, response) = env.forged(&["run", "advance", "--run", &successor]);
            assert_eq!(code, 1, "{scenario}: {response}");
            assert!(
                response["error"]["message"]
                    .as_str()
                    .unwrap()
                    .starts_with("base sha mismatch:"),
                "{scenario}: {response}"
            );
            let ledger = env.ledger();
            assert!(ledger.list_packets(&successor).unwrap().is_empty());
            ledger.close().unwrap();
            continue;
        }
        advance(&env, &successor);
        assert!(
            resolve_result(&env, &successor)
                .get("implementationReuse")
                .is_none(),
            "{scenario}"
        );
        assert_eq!(
            advance(&env, &successor)["openPackets"][0]["stage"],
            json!("implement"),
            "{scenario}"
        );
    }
}

fn commit_change(tree: &std::path::Path) {
    std::fs::write(tree.join("later.txt"), "later change").unwrap();
    git(tree, &["add", "later.txt"]);
    git(tree, &["commit", "-m", "later change"]);
}
