#![cfg(feature = "failpoints")]

//! Crash recovery for the one-verb dispatch fence. The run, desired row, and
//! approval note are one atomic bundle even when the process dies before the
//! operation response is sealed.

mod support;

use std::process::Stdio;

use forged_ledger::{DesiredSubjectKind, WorkNoteKind};
use serde_json::{json, Value};
use support::TestEnv;

const DISPATCH_CRASH_POINTS: &[&str] = &["run.start.bundle.after"];

#[test]
fn dispatch_crash_after_atomic_bundle_resumes_without_duplicate_approval_notes() {
    for &point in DISPATCH_CRASH_POINTS {
        let label = point.replace('.', "-");
        let env = TestEnv::new(&format!("km-run-dispatch-{label}"));
        assert_eq!(env.forged(&["init"]).0, 0);
        let work_id = format!("dispatch-{label}");
        env.seed_work_spec(
            &work_id,
            "Atomically dispatch one work revision.",
            "- recovery creates no duplicate approval",
        );
        let key = format!("op:test:{label}");
        let args = [
            "run",
            "dispatch",
            "--id",
            &work_id,
            "--basis",
            "failpoint dispatch is approved",
            "--approved-by",
            "failpoint-lead",
            "--override",
            "exercise the dispatch crash fence",
            "--base-ref",
            "main",
            "--idempotency-key",
            &key,
        ];
        let mut crashed = env
            .forged_cmd(&args)
            .env("FORGED_FAILPOINT", point)
            .env("FORGED_FAILPOINT_MODE", "crash")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .expect("spawn dispatch");
        assert!(!crashed.wait().expect("dispatch crash").success());

        let ledger = env.ledger();
        ledger.get_run(&work_id).expect("run effect committed");
        assert!(ledger
            .get_desired_work(DesiredSubjectKind::Run, &work_id)
            .expect("desired lookup")
            .is_some());
        assert_eq!(
            ledger
                .list_work_notes(&work_id, Some(WorkNoteKind::Decision), 100)
                .expect("notes lookup")
                .notes
                .len(),
            2,
            "the override and approval commit with the run"
        );
        ledger.close().expect("close ledger");

        let (code, resumed) = env.forged(&args);
        assert_eq!(code, 0, "resume {point}: {resumed}");
        assert_eq!(resumed["result"]["runId"], json!(work_id));

        let ledger = env.ledger();
        let desired = ledger
            .get_desired_work(DesiredSubjectKind::Run, &work_id)
            .expect("desired lookup")
            .expect("desired work sealed");
        assert_eq!(desired.controller_generation, 0);
        let notes = ledger
            .list_work_notes(&work_id, Some(WorkNoteKind::Decision), 100)
            .expect("decision notes");
        let decisions = notes
            .notes
            .iter()
            .map(|note| serde_json::from_str::<Value>(&note.body_json).expect("decision JSON"))
            .collect::<Vec<_>>();
        assert_eq!(
            decisions
                .iter()
                .filter(|decision| decision["kind"] == json!("approval"))
                .count(),
            1,
            "resume must seal exactly one approval: {decisions:?}"
        );
        ledger.close().expect("close ledger");

        let (code, replayed) = env.forged(&args);
        assert_eq!(code, 0, "replay {point}: {replayed}");
        assert_eq!(replayed["reused"], json!(true));
        let ledger = env.ledger();
        assert_eq!(
            ledger
                .list_work_notes(&work_id, Some(WorkNoteKind::Decision), 100)
                .expect("replayed notes")
                .notes
                .len(),
            2,
            "one lifecycle override plus one approval remain"
        );
    }
}
