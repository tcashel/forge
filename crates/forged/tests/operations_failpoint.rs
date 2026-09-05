#![cfg(feature = "failpoints")]

//! Retry launch response-loss recovery across the durable authorization boundary.

mod support;

use serde_json::json;
use support::TestEnv;

#[test]
fn run_retry_recovers_an_applied_successor_after_response_loss() {
    for site in [
        "run.start.bundle.after",
        "submit.desired.before",
        "submit.desired.after",
    ] {
        let env = TestEnv::new("forged-run-retry-applied");
        env.forged(&["init"]);
        let run_id = "retry-applied";
        env.seed_work_spec(
            run_id,
            "Resume an applied retry bundle.",
            "- authorize exactly one successor",
        );
        let repo = env.repos.repo.to_string_lossy().into_owned();
        assert_eq!(
            env.forged(&[
                "run",
                "start",
                "--work",
                run_id,
                "--repo",
                &repo,
                "--base-ref",
                "main"
            ])
            .0,
            0
        );
        let ledger = env.ledger();
        ledger
            .claim_specific_work(run_id, "forged:retry-applied:0", 300)
            .unwrap();
        ledger
            .set_run_state(
                run_id,
                forged_ledger::RunState::Stopped,
                Some("retry".to_owned()),
            )
            .unwrap();
        ledger.close().unwrap();
        let args = [
            "run",
            "retry",
            "--id",
            run_id,
            "--because",
            "world-changed",
            "--fresh",
            "--idempotency-key",
            "retry-applied-key",
        ];
        let status = env
            .forged_cmd(&args)
            .env("FORGED_FAILPOINT", site)
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(std::process::Stdio::null())
            .stderr(std::process::Stdio::null())
            .status()
            .unwrap();
        assert!(!status.success(), "{site} must crash");
        let ledger = env.ledger();
        let operation = ledger
            .find_operation("run_retry", "retry-applied-key")
            .unwrap()
            .unwrap();
        let successor = ledger
            .run_started_by_operation(&operation.operation_id)
            .unwrap()
            .unwrap();
        assert_eq!(successor.run_id, "retry-applied-r1");
        ledger.close().unwrap();

        let (code, recovered) = env.forged(&args);
        assert_eq!(code, 0, "{site}: applied retry must recover: {recovered}");
        assert_eq!(recovered["operationId"], json!(operation.operation_id));
        assert_eq!(recovered["reused"], json!(true));
        assert_eq!(recovered["result"]["runId"], json!("retry-applied-r1"));
        let ledger = env.ledger();
        assert_eq!(ledger.retry_chain_runs(run_id, 10).unwrap().len(), 2);
        assert!(ledger
            .get_desired_work(forged_ledger::DesiredSubjectKind::Run, "retry-applied-r1")
            .unwrap()
            .is_some());
        assert_eq!(
            ledger
                .list_work_notes(run_id, Some(forged_ledger::WorkNoteKind::Decision), 10)
                .unwrap()
                .notes
                .len(),
            1
        );
        ledger.close().unwrap();
        let (code, replayed) = env.forged(&args);
        assert_eq!(code, 0, "{site}: completed recovery replays: {replayed}");
        assert_eq!(replayed["result"], recovered["result"]);
    }
}
