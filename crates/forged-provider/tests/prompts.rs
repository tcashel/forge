//! Golden tests for the prompt templates (acceptance criteria 11, 12, 15).

use forged_provider::{
    normalize_findings, PromptStage, PromptTemplates, ProviderError, RenderedFinding,
};
use serde_json::{json, Value};

const IMPLEMENT_SRC: &str = include_str!("../templates/implement.md.j2");

const PACKET_ID: &str = "pkt-golden-7";

fn implement_context() -> Value {
    json!({
        "bead_id": "bead-1",
        "worktree": "/tmp/worktrees/run-1",
        "branch": "feat/bead-1",
        "base_ref": "main",
        "spec_path": "specs/bead-1.md",
        "gate_commands": ["cargo build --workspace --locked", "cargo test --workspace"],
        "field_notes": [],
        "packet_id": PACKET_ID,
        "result_schema": PromptStage::Implement.result_schema(),
    })
}

fn review_context() -> Value {
    json!({
        "bead_id": "bead-1",
        "pr_number": 41,
        "spec_path": "specs/bead-1.md",
        "worktree": "/tmp/worktrees/run-1",
        "field_notes": [],
        "risk_context": "Routine change with reversible effects.",
        "packet_id": PACKET_ID,
        "result_schema": PromptStage::Review.result_schema(),
    })
}

fn fix_context(findings: &[RenderedFinding]) -> Value {
    json!({
        "bead_id": "bead-1",
        "pr_number": 41,
        "worktree": "/tmp/worktrees/run-1",
        "round": 1,
        "total_rounds": 2,
        "gate_commands": ["cargo test --workspace"],
        "push_url": "https://example.invalid/repo.git",
        "findings": findings,
        "field_notes": [],
        "packet_id": PACKET_ID,
        "result_schema": PromptStage::Fix.result_schema(),
    })
}

#[test]
fn load_succeeds() {
    PromptTemplates::load().expect("the three embedded templates load");
}

#[test]
fn a_trailing_typo_variable_fails_at_load_naming_stage_and_variable() {
    let source = format!("{IMPLEMENT_SRC}{{{{ typo }}}}");
    let err = PromptTemplates::from_sources(&[(PromptStage::Implement, &source)])
        .expect_err("an undeclared variable must fail at load");
    let ProviderError::Malformed { message } = &err else {
        panic!("expected Malformed, got {err}");
    };
    assert!(message.contains("implement"), "names the stage: {message}");
    assert!(message.contains("typo"), "names the variable: {message}");
}

#[test]
fn a_syntax_error_fails_at_load() {
    let err = PromptTemplates::from_sources(&[(PromptStage::Review, "{% for x in %}")])
        .expect_err("a syntax error must fail at load");
    assert!(matches!(err, ProviderError::Malformed { .. }), "{err}");
}

#[test]
fn render_succeeds_for_all_three_stages() {
    let templates = PromptTemplates::load().expect("loads");
    let implement = templates
        .render(PromptStage::Implement, &implement_context())
        .expect("implement renders");
    assert!(implement.contains("/tmp/worktrees/run-1"), "worktree path");
    assert!(implement.contains("feat/bead-1"), "branch");
    assert!(implement.contains("cargo build --workspace --locked"));
    assert!(implement.contains("cargo test --workspace"));

    let review = templates
        .render(PromptStage::Review, &review_context())
        .expect("review renders");
    assert!(review.contains("#41"));
    assert!(review.contains("specs/bead-1.md"));
    assert!(
        review.contains("gh pr checks 41 --watch --fail-fast"),
        "review waits for a terminal CI result instead of sampling pending checks"
    );

    let findings = vec![
        RenderedFinding {
            severity: "BLOCKER".to_owned(),
            location: "src/lib.rs:10".to_owned(),
            message: "seam violated".to_owned(),
        },
        RenderedFinding {
            severity: "HIGH".to_owned(),
            location: "?".to_owned(),
            message: "unchecked exit".to_owned(),
        },
    ];
    let fix = templates
        .render(PromptStage::Fix, &fix_context(&findings))
        .expect("fix renders");
    assert!(fix.contains("[BLOCKER] src/lib.rs:10 — seam violated"));
    assert!(fix.contains("[HIGH] ? — unchecked exit"));
    let listed = fix.matches("  - [").count();
    assert_eq!(listed, 2, "fix lists exactly the findings it was given");
}

#[test]
fn implement_render_names_the_closed_gate_state_contract() {
    let rendered = PromptTemplates::load()
        .expect("loads")
        .render(PromptStage::Implement, &implement_context())
        .expect("implement renders");
    // Whitespace-normalized so a template reflow cannot fail an intact
    // contract: the assertion pins the words, not the wrap points.
    let flattened = rendered.split_whitespace().collect::<Vec<_>>().join(" ");
    assert!(
        flattened.contains("gateState is exactly \"pass\" or \"fail\" (or null when unknown)"),
        "the prompt names the closed machine vocabulary: {rendered}"
    );
    assert!(
        flattened.contains("put articulate gate detail in summary/note"),
        "the prompt directs prose to free-text fields: {rendered}"
    );
    assert!(
        rendered.contains("\"gateState\": \"pass\""),
        "the result example uses a valid closed value: {rendered}"
    );
}

#[test]
fn a_context_missing_one_variable_errors() {
    let templates = PromptTemplates::load().expect("loads");
    let Value::Object(mut context) = implement_context() else {
        unreachable!()
    };
    context.remove("branch");
    let err = templates
        .render(PromptStage::Implement, &Value::Object(context))
        .expect_err("a missing variable must be refused");
    let ProviderError::Malformed { message } = &err else {
        panic!("expected Malformed, got {err}");
    };
    assert!(message.contains("branch"), "{message}");
}

#[test]
fn a_context_with_one_extra_key_errors() {
    let templates = PromptTemplates::load().expect("loads");
    let Value::Object(mut context) = implement_context() else {
        unreachable!()
    };
    context.insert("surprise".to_owned(), json!("x"));
    let err = templates
        .render(PromptStage::Implement, &Value::Object(context))
        .expect_err("an extra key must be refused");
    let ProviderError::Malformed { message } = &err else {
        panic!("expected Malformed, got {err}");
    };
    assert!(message.contains("surprise"), "{message}");
}

#[test]
fn normalize_findings_covers_all_three_location_shapes() {
    let findings = [
        forged_types::Finding {
            severity: forged_types::Severity::Blocker,
            file: Some("src/x.rs".to_owned()),
            line: Some(42),
            message: "a".to_owned(),
        },
        forged_types::Finding {
            severity: forged_types::Severity::Medium,
            file: Some("src/x.rs".to_owned()),
            line: None,
            message: "b".to_owned(),
        },
        forged_types::Finding {
            severity: forged_types::Severity::Low,
            file: None,
            line: Some(9),
            message: "c".to_owned(),
        },
    ];
    let rendered = normalize_findings(&findings);
    let locations: Vec<&str> = rendered.iter().map(|f| f.location.as_str()).collect();
    assert_eq!(locations, vec!["src/x.rs:42", "src/x.rs", "?"]);
    let severities: Vec<&str> = rendered.iter().map(|f| f.severity.as_str()).collect();
    assert_eq!(severities, vec!["BLOCKER", "MEDIUM", "LOW"]);
}

#[test]
fn every_rendered_template_carries_the_result_contract() {
    let templates = PromptTemplates::load().expect("loads");
    let cases = [
        (
            PromptStage::Implement,
            implement_context(),
            "forged.result.implement/1",
        ),
        (
            PromptStage::Review,
            review_context(),
            "forged.result.review/1",
        ),
        (
            PromptStage::Fix,
            fix_context(&[RenderedFinding {
                severity: "HIGH".to_owned(),
                location: "?".to_owned(),
                message: "x".to_owned(),
            }]),
            "forged.result.fix/1",
        ),
    ];
    for (stage, context, schema) in cases {
        assert_eq!(stage.result_schema(), schema);
        let rendered = templates.render(stage, &context).expect("renders");
        assert!(
            rendered.contains("forged-result"),
            "{schema}: carries the fence tag"
        );
        assert!(
            rendered.contains(schema),
            "{schema}: carries the schema string"
        );
        assert!(
            rendered.contains(PACKET_ID),
            "{schema}: carries the rendered packet_id"
        );
    }
}

#[test]
fn stage_variable_schemas_are_closed_and_exact() {
    assert_eq!(
        PromptStage::Implement.variables(),
        [
            "bead_id",
            "worktree",
            "branch",
            "base_ref",
            "spec_path",
            "gate_commands",
            "field_notes",
            "packet_id",
            "result_schema"
        ]
    );
    assert_eq!(
        PromptStage::Review.variables(),
        [
            "bead_id",
            "pr_number",
            "spec_path",
            "worktree",
            "field_notes",
            "risk_context",
            "packet_id",
            "result_schema"
        ]
    );
    assert_eq!(
        PromptStage::Fix.variables(),
        [
            "bead_id",
            "pr_number",
            "worktree",
            "round",
            "total_rounds",
            "gate_commands",
            "push_url",
            "findings",
            "field_notes",
            "packet_id",
            "result_schema"
        ]
    );
}
