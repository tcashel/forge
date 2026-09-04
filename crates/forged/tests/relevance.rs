mod support;

use forged_ledger::RunOutcome;
use serde_json::{json, Value};
use std::collections::BTreeSet;
use support::operator_store::{ActionSiteKind, ACTION_SITES};
use support::{fabricate_run, TestEnv};

fn result(env: &TestEnv, args: &[&str]) -> Value {
    let (code, response) = env.forged(args);
    assert_eq!(code, 0, "{args:?}: {response}");
    response["result"].clone()
}

fn settle(env: &TestEnv, run: &str, outcome: RunOutcome, successor: Option<&str>) {
    let ledger = env.ledger();
    let (pr, sha) = if outcome == RunOutcome::Landed {
        (Some(42), Some("a".repeat(40)))
    } else {
        (None, None)
    };
    ledger
        .settle_run(
            run,
            outcome,
            format!("relevance fixture {}", outcome.as_str()),
            pr,
            sha,
            successor.map(str::to_owned),
        )
        .expect("settle relevance fixture");
    ledger.close().expect("close ledger");
}

fn actions<'a>(value: &'a Value, path: &[&str]) -> &'a [Value] {
    let mut current = value;
    for segment in path {
        current = &current[*segment];
    }
    current.as_array().expect("action array")
}

fn should_count(actions: &[Value]) -> usize {
    actions
        .iter()
        .filter(|action| action["class"] == json!("should"))
        .count()
}

#[test]
fn terminal_subjects_advertise_no_should_and_closed_work_keeps_repair() {
    let env = TestEnv::new("forged-action-relevance");
    assert_eq!(env.forged(&["init"]).0, 0);

    env.set_work_field("relevance-closed", "status", "closed");
    let closed = result(&env, &["work", "show", "--id", "relevance-closed"]);
    let closed_actions = actions(&closed, &["nextActions"]);
    assert_eq!(should_count(closed_actions), 0);
    assert_eq!(closed_actions[0]["verb"], json!("work reopen"));
    assert_eq!(closed_actions[0]["class"], json!("repair"));

    fabricate_run(&env, "relevance-cancelled");
    settle(&env, "relevance-cancelled", RunOutcome::Cancelled, None);
    fabricate_run(&env, "relevance-landed");
    settle(&env, "relevance-landed", RunOutcome::Landed, None);
    fabricate_run(&env, "relevance-successor");
    fabricate_run(&env, "relevance-superseded");
    settle(
        &env,
        "relevance-superseded",
        RunOutcome::Superseded,
        Some("relevance-successor"),
    );

    for run in [
        "relevance-cancelled",
        "relevance-landed",
        "relevance-superseded",
    ] {
        let status = result(&env, &["run", "status", "--run", run]);
        let projected = actions(&status, &["run", "nextActions"]);
        assert_eq!(should_count(projected), 0, "{run}: {status}");
    }
}

#[test]
fn the_shared_registry_names_every_emitter_and_direct_remedy_builder() {
    let manifest = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
    let mut emitters = Vec::new();
    let mut remedies = Vec::new();
    let mut constructors = Vec::new();
    for site in ACTION_SITES {
        let source = std::fs::read_to_string(manifest.join(site.path))
            .unwrap_or_else(|error| panic!("{}: {error}", site.path));
        assert!(
            source.contains(site.marker),
            "missing registry site {site:?}"
        );
        match site.kind {
            ActionSiteKind::Emitter => emitters.push(site.marker),
            ActionSiteKind::Remedy => remedies.push(site.marker),
            ActionSiteKind::Constructor => constructors.push(site.marker),
        }
    }
    assert_eq!(
        emitters,
        [
            "pub(crate) fn projection_actions(",
            "pub(crate) fn run_projection_actions(",
            "pub(crate) fn recommendation_actions(",
        ]
    );
    assert_eq!(
        remedies,
        [
            "fn keyless_resubmit_remedy(",
            "fn action_remedy(",
            "pause scheduling before abandoning the epic",
            "reopen the work item before retrying",
            "Narrow the frontier with --repo or request a bounded page with --limit",
        ]
    );
    assert_eq!(
        constructors,
        [
            "fn work_remedy(",
            "pub(crate) fn retry_action_with_class(",
            "fn classified_action(",
            "pub(crate) fn work_supersede_action(",
        ]
    );

    let registered = ACTION_SITES
        .iter()
        .filter_map(|site| {
            site.literal_ordinal
                .map(|ordinal| (site.path.to_owned(), ordinal))
        })
        .collect::<BTreeSet<_>>();
    let mut discovered = BTreeSet::new();
    let mut pending = vec![manifest.join("src")];
    while let Some(path) = pending.pop() {
        for entry in
            std::fs::read_dir(&path).unwrap_or_else(|error| panic!("{}: {error}", path.display()))
        {
            let entry = entry.expect("source directory entry");
            let path = entry.path();
            if path.is_dir() {
                pending.push(path);
                continue;
            }
            if path.extension().and_then(|extension| extension.to_str()) != Some("rs") {
                continue;
            }
            let source = std::fs::read_to_string(&path)
                .unwrap_or_else(|error| panic!("{}: {error}", path.display()));
            let relative = path
                .strip_prefix(manifest)
                .expect("source under manifest")
                .to_string_lossy()
                .into_owned();
            let mut ordinal = 0;
            for line in source.lines() {
                if line
                    .find("OperationActionV1 {")
                    .is_some_and(|offset| !line[..offset].contains("->"))
                {
                    discovered.insert((relative.clone(), ordinal));
                    ordinal += 1;
                }
            }
        }
    }
    assert_eq!(
        discovered, registered,
        "every direct OperationActionV1 literal must be classified in ACTION_SITES"
    );
}
