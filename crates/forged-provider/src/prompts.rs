//! Prompt stages, the embedded minijinja templates, and findings
//! normalization for the fix stage.

use std::collections::BTreeSet;

use minijinja::{Environment, UndefinedBehavior};
use serde::Serialize;
use serde_json::{json, Value};

use crate::error::ProviderError;

/// The implement-stage template body.
const IMPLEMENT_SRC: &str = include_str!("../templates/implement.md.j2");
/// The review-stage template body (serves both review stages).
const REVIEW_SRC: &str = include_str!("../templates/review.md.j2");
/// The fix-stage template body.
const FIX_SRC: &str = include_str!("../templates/fix.md.j2");

/// Which prompt template a packet renders.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PromptStage {
    /// The implement stage.
    Implement,
    /// The review stage — one template serves both review packets.
    Review,
    /// The auto-fix stage.
    Fix,
}

impl PromptStage {
    /// Map a packet stage onto its template:
    /// `ReviewClaude` | `ReviewCodex` → `Review`.
    pub fn for_stage(stage: forged_types::Stage) -> Self {
        match stage {
            forged_types::Stage::Implement => PromptStage::Implement,
            forged_types::Stage::ReviewClaude | forged_types::Stage::ReviewCodex => {
                PromptStage::Review
            }
            forged_types::Stage::Fix => PromptStage::Fix,
        }
    }

    /// The closed variable schema for this stage: a render context's
    /// top-level keys must be exactly this set.
    pub fn variables(self) -> &'static [&'static str] {
        match self {
            PromptStage::Implement => &[
                "bead_id",
                "worktree",
                "branch",
                "base_ref",
                "spec_path",
                "gate_commands",
                "field_notes",
                "packet_id",
                "result_schema",
            ],
            PromptStage::Review => &[
                "bead_id",
                "pr_number",
                "spec_path",
                "worktree",
                "field_notes",
                "risk_context",
                "packet_id",
                "result_schema",
            ],
            PromptStage::Fix => &[
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
                "result_schema",
            ],
        }
    }

    /// The canonical result-schema string the caller passes as the
    /// `result_schema` variable, so "the right schema string" is
    /// checkable.
    pub fn result_schema(self) -> &'static str {
        match self {
            PromptStage::Implement => "forged.result.implement/1",
            PromptStage::Review => "forged.result.review/1",
            PromptStage::Fix => "forged.result.fix/1",
        }
    }

    /// The template's registry name inside the environment.
    fn template_name(self) -> &'static str {
        match self {
            PromptStage::Implement => "implement",
            PromptStage::Review => "review",
            PromptStage::Fix => "fix",
        }
    }

    /// A canned sample context covering exactly [`PromptStage::variables`],
    /// used by the load-time render-check.
    fn sample_context(self) -> Value {
        match self {
            PromptStage::Implement => json!({
                "bead_id": "bead-1",
                "worktree": "/tmp/worktrees/run-1",
                "branch": "feat/bead-1",
                "base_ref": "main",
                "spec_path": "specs/bead-1.md",
                "gate_commands": ["cargo test --workspace"],
                "field_notes": [],
                "packet_id": "pkt-1",
                "result_schema": self.result_schema(),
            }),
            PromptStage::Review => json!({
                "bead_id": "bead-1",
                "pr_number": 7,
                "spec_path": "specs/bead-1.md",
                "worktree": "/tmp/worktrees/run-1",
                "field_notes": [],
                "risk_context": "Routine change with reversible effects.",
                "packet_id": "pkt-1",
                "result_schema": self.result_schema(),
            }),
            PromptStage::Fix => json!({
                "bead_id": "bead-1",
                "pr_number": 7,
                "worktree": "/tmp/worktrees/run-1",
                "round": 1,
                "total_rounds": 1,
                "gate_commands": ["cargo test --workspace"],
                "push_url": "https://example.invalid/repo.git",
                "findings": [
                    {"severity": "HIGH", "location": "src/x.rs:42", "message": "sample"}
                ],
                "field_notes": [],
                "packet_id": "pkt-1",
                "result_schema": self.result_schema(),
            }),
        }
    }
}

/// One finding as `fix.md.j2` consumes it. This crate owns normalization,
/// so the template never meets an `Option` and never renders a missing
/// sub-key under strict undefined-behavior.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct RenderedFinding {
    /// Uppercased severity: BLOCKER | HIGH | MEDIUM | LOW.
    pub severity: String,
    /// `"file:line"`, the file alone, or `"?"`.
    pub location: String,
    /// The reviewer's message, verbatim.
    pub message: String,
}

/// Normalize wave 4's findings for the fix template: severity uppercased
/// from [`forged_types::Severity`]; location is `"<file>:<line>"` when both
/// are present, the file alone when `line` is `None`, and `"?"` when `file`
/// is `None` whatever the line holds. [`forged_types::Finding`] has no
/// `source` field, so rendered findings carry none.
pub fn normalize_findings(findings: &[forged_types::Finding]) -> Vec<RenderedFinding> {
    findings
        .iter()
        .map(|finding| {
            let severity = match finding.severity {
                forged_types::Severity::Blocker => "BLOCKER",
                forged_types::Severity::High => "HIGH",
                forged_types::Severity::Medium => "MEDIUM",
                forged_types::Severity::Low => "LOW",
            }
            .to_owned();
            let location = match (&finding.file, finding.line) {
                (Some(file), Some(line)) => format!("{file}:{line}"),
                (Some(file), None) => file.clone(),
                (None, _) => "?".to_owned(),
            };
            RenderedFinding {
                severity,
                location,
                message: finding.message.clone(),
            }
        })
        .collect()
}

/// The three prompt templates, parsed and render-checked at construction
/// under `UndefinedBehavior::Strict`.
#[derive(Debug)]
pub struct PromptTemplates {
    env: Environment<'static>,
}

impl PromptTemplates {
    /// Load the three embedded template bodies.
    pub fn load() -> Result<Self, ProviderError> {
        Self::from_sources(&[
            (PromptStage::Implement, IMPLEMENT_SRC),
            (PromptStage::Review, REVIEW_SRC),
            (PromptStage::Fix, FIX_SRC),
        ])
    }

    /// The single construction path, public so the render-check itself is
    /// testable: builds the environment with `UndefinedBehavior::Strict`
    /// and render-checks every source against a canned sample context, so
    /// a syntax error or an undeclared variable fails HERE, at load, not
    /// at first use.
    pub fn from_sources(sources: &[(PromptStage, &str)]) -> Result<Self, ProviderError> {
        let mut env = Environment::new();
        env.set_undefined_behavior(UndefinedBehavior::Strict);
        for (stage, source) in sources {
            env.add_template_owned(stage.template_name().to_owned(), (*source).to_owned())
                .map_err(|e| ProviderError::Malformed {
                    message: format!("template {}: does not parse: {e}", stage.template_name()),
                })?;
        }
        let templates = Self { env };
        for (stage, _) in sources {
            templates.check_source(*stage)?;
        }
        Ok(templates)
    }

    /// Render one stage. Refuses before rendering unless the context's
    /// top-level keys are exactly [`PromptStage::variables`] — missing and
    /// extra are equally an error.
    pub fn render(&self, stage: PromptStage, context: &Value) -> Result<String, ProviderError> {
        let name = stage.template_name();
        let Value::Object(map) = context else {
            return Err(ProviderError::Malformed {
                message: format!("template {name}: render context is not a JSON object"),
            });
        };
        let expected: BTreeSet<&str> = stage.variables().iter().copied().collect();
        let actual: BTreeSet<&str> = map.keys().map(String::as_str).collect();
        let missing: Vec<&str> = expected.difference(&actual).copied().collect();
        let extra: Vec<&str> = actual.difference(&expected).copied().collect();
        if !missing.is_empty() || !extra.is_empty() {
            return Err(ProviderError::Malformed {
                message: format!(
                    "template {name}: context keys do not match the closed schema \
                     (missing: [{}], extra: [{}])",
                    missing.join(", "),
                    extra.join(", ")
                ),
            });
        }
        let template = self
            .env
            .get_template(name)
            .map_err(|e| ProviderError::Malformed {
                message: format!("template {name}: not loaded: {e}"),
            })?;
        template
            .render(context)
            .map_err(|e| ProviderError::Malformed {
                message: format!("template {name}: render failed: {e}"),
            })
    }

    /// The load-time check for one source: every variable the template
    /// looks up must be in the stage's closed schema, and the source must
    /// render against the canned sample context under strict
    /// undefined-behavior.
    fn check_source(&self, stage: PromptStage) -> Result<(), ProviderError> {
        let name = stage.template_name();
        let template = self
            .env
            .get_template(name)
            .map_err(|e| ProviderError::Malformed {
                message: format!("template {name}: not loaded: {e}"),
            })?;
        let allowed: BTreeSet<&str> = stage.variables().iter().copied().collect();
        let undeclared: BTreeSet<String> = template
            .undeclared_variables(false)
            .into_iter()
            .filter(|var| !allowed.contains(var.as_str()))
            .collect();
        if !undeclared.is_empty() {
            let vars: Vec<String> = undeclared.into_iter().collect();
            return Err(ProviderError::Malformed {
                message: format!(
                    "template {name}: uses variables outside the {name} schema: {}",
                    vars.join(", ")
                ),
            });
        }
        template
            .render(stage.sample_context())
            .map_err(|e| ProviderError::Malformed {
                message: format!("template {name}: sample render-check failed: {e}"),
            })?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn finding(
        severity: forged_types::Severity,
        file: Option<&str>,
        line: Option<u32>,
    ) -> forged_types::Finding {
        forged_types::Finding {
            severity,
            file: file.map(str::to_owned),
            line,
            message: "seam violated".to_owned(),
        }
    }

    #[test]
    fn normalize_findings_maps_all_three_location_shapes() {
        let rendered = normalize_findings(&[
            finding(forged_types::Severity::Blocker, Some("src/x.rs"), Some(42)),
            finding(forged_types::Severity::Medium, Some("src/x.rs"), None),
            finding(forged_types::Severity::Low, None, None),
            finding(forged_types::Severity::High, None, Some(7)),
        ]);
        assert_eq!(
            rendered,
            vec![
                RenderedFinding {
                    severity: "BLOCKER".to_owned(),
                    location: "src/x.rs:42".to_owned(),
                    message: "seam violated".to_owned(),
                },
                RenderedFinding {
                    severity: "MEDIUM".to_owned(),
                    location: "src/x.rs".to_owned(),
                    message: "seam violated".to_owned(),
                },
                RenderedFinding {
                    severity: "LOW".to_owned(),
                    location: "?".to_owned(),
                    message: "seam violated".to_owned(),
                },
                RenderedFinding {
                    severity: "HIGH".to_owned(),
                    location: "?".to_owned(),
                    message: "seam violated".to_owned(),
                },
            ]
        );
    }

    #[test]
    fn fix_template_renders_a_no_location_finding_under_strict_mode() {
        let templates = PromptTemplates::load().expect("templates load");
        let rendered_findings =
            normalize_findings(&[finding(forged_types::Severity::High, None, None)]);
        let context = serde_json::json!({
            "bead_id": "bead-1",
            "pr_number": 7,
            "worktree": "/tmp/worktrees/run-1",
            "round": 1,
            "total_rounds": 1,
            "gate_commands": ["cargo test --workspace"],
            "push_url": "https://example.invalid/repo.git",
            "findings": rendered_findings,
            "field_notes": [],
            "packet_id": "pkt-1",
            "result_schema": PromptStage::Fix.result_schema(),
        });
        let rendered = templates
            .render(PromptStage::Fix, &context)
            .expect("renders");
        assert!(rendered.contains("[HIGH] ? — seam violated"));
    }

    #[test]
    fn for_stage_folds_both_review_stages() {
        assert_eq!(
            PromptStage::for_stage(forged_types::Stage::Implement),
            PromptStage::Implement
        );
        assert_eq!(
            PromptStage::for_stage(forged_types::Stage::ReviewClaude),
            PromptStage::Review
        );
        assert_eq!(
            PromptStage::for_stage(forged_types::Stage::ReviewCodex),
            PromptStage::Review
        );
        assert_eq!(
            PromptStage::for_stage(forged_types::Stage::Fix),
            PromptStage::Fix
        );
    }
}
