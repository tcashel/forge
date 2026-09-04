//! The Pi driver: a provider-neutral Pi CLI invocation and JSON-event usage parser.

use forged_types::WorkPacket;
use serde_json::Value;

use crate::command::{provider_argv, ProviderKindV1};
use crate::error::ProviderError;
use crate::invocation::{
    validate_effort, validate_embedded_path, validate_model, Invocation, PacketDirs, ProviderDriver,
};
use crate::usage::{object_line, required_token, PricingBasis, UsageCapture, UsageRow};

/// Runs one packet through the provider-neutral `pi` CLI.
#[derive(Debug, Clone, PartialEq)]
pub struct PiDriver;

impl ProviderDriver for PiDriver {
    fn name(&self) -> &'static str {
        "pi"
    }

    fn invocation(
        &self,
        packet: &WorkPacket,
        dirs: &PacketDirs,
        _claim_token: &str,
    ) -> Result<Invocation, ProviderError> {
        let prompt_path = dirs.prompt();
        let stdout_path = dirs.stdout_working();
        validate_embedded_path(&prompt_path)?;
        validate_embedded_path(&stdout_path)?;
        let model = &packet.provider_hints.model;
        validate_model(model)?;
        if let Some(effort) = packet.provider_hints.effort.as_deref() {
            validate_effort(effort)?;
        }
        // Skills and context files deliberately remain enabled. Extension
        // discovery is disabled because extension code is an unrecorded
        // executable surface, unlike repository skill/context prose.
        let argv = provider_argv(
            ProviderKindV1::Pi,
            packet.provider_hints.sandbox,
            model,
            packet.provider_hints.effort.as_deref(),
            None,
            None,
        );
        Ok(Invocation {
            argv,
            prompt_path,
            stdout_path,
            session_hint: None,
        })
    }

    fn parse_usage(&self, stdout: &str, model: &str) -> Result<UsageCapture, ProviderError> {
        let mut input_tokens = 0u64;
        let mut output_tokens = 0u64;
        let mut cache_read_tokens = 0u64;
        let mut cache_write_tokens = 0u64;
        let mut messages = 0u64;

        for line in stdout.lines() {
            let Some(event) = object_line(line) else {
                continue;
            };
            if event.get("type").and_then(Value::as_str) != Some("message_end") {
                continue;
            }
            let Some(message) = event.get("message").and_then(Value::as_object) else {
                continue;
            };
            if message.get("role").and_then(Value::as_str) != Some("assistant") {
                continue;
            }
            let Some(usage) = message.get("usage").and_then(Value::as_object) else {
                continue;
            };
            let context = "pi message_end assistant usage";
            input_tokens = input_tokens.saturating_add(required_token(usage, "input", context)?);
            output_tokens = output_tokens.saturating_add(required_token(usage, "output", context)?);
            cache_read_tokens =
                cache_read_tokens.saturating_add(required_token(usage, "cacheRead", context)?);
            cache_write_tokens =
                cache_write_tokens.saturating_add(required_token(usage, "cacheWrite", context)?);
            messages = messages.saturating_add(1);
        }

        let rows = (messages > 0)
            .then(|| UsageRow {
                provider: "pi".to_owned(),
                model: model.to_owned(),
                input_tokens,
                output_tokens,
                cache_read_tokens: Some(cache_read_tokens),
                cache_write_tokens: Some(cache_write_tokens),
                // Pi calculates catalogue cost; it is not a provider bill.
                // Forge's own dated rate card may impute this row later.
                cost_usd: None,
                pricing_basis: PricingBasis::None,
                rate_limit_used_percent: None,
                web_search_requests: None,
            })
            .into_iter()
            .collect();
        Ok(UsageCapture {
            session_ref: None,
            rows,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use forged_types::{
        Deliverable, ProviderHints, Sandbox, SpecRef, Stage, StageContract, WorkPacket,
    };
    use serde_json::json;
    use std::path::PathBuf;

    fn packet(sandbox: Sandbox, effort: Option<&str>) -> WorkPacket {
        WorkPacket {
            schema: "forged.packet/1".to_owned(),
            packet_id: "run/implementation/0".to_owned(),
            run_id: "run".to_owned(),
            work_id: "bead".to_owned(),
            stage: Stage::Implement,
            execution: None,
            lane_seq: None,
            spec: SpecRef {
                path: "/tmp/spec".to_owned(),
                sha256: "0".repeat(64),
                revision: None,
            },
            worktree: PathBuf::from("/tmp/worktree"),
            branch: "work/run".to_owned(),
            base_ref: "main".to_owned(),
            contract: StageContract {
                instructions: "implement".to_owned(),
                gate_commands: Vec::new(),
                deliverable: Deliverable::CommitsInWorktree,
                budget_s: 60,
                seat_commands: Vec::new(),
            },
            result_schema: "forged.result.implement/1".to_owned(),
            provider_hints: ProviderHints {
                provider: "pi".to_owned(),
                model: "anthropic/claude-sonnet-4-5".to_owned(),
                effort: effort.map(str::to_owned),
                sandbox,
            },
            field_notes: Vec::new(),
        }
    }

    #[test]
    fn invocation_keeps_skills_and_context_enabled() {
        let dirs = PacketDirs::new("/tmp/run/packets/implementation/0", 1);
        let invocation = PiDriver
            .invocation(
                &packet(Sandbox::WorkspaceWrite, Some("high")),
                &dirs,
                "token",
            )
            .expect("invocation");
        let line = invocation.shell_line().expect("shell line");
        assert!(line.contains("--no-extensions"));
        assert!(line.contains("--approve"));
        assert!(line.contains("--thinking high"));
        assert!(!line.contains("--no-skills"));
        assert!(!line.contains("--no-context-files"));
        assert!(!line.contains("--tools"));

        let read_only = PiDriver
            .invocation(&packet(Sandbox::ReadOnly, None), &dirs, "token")
            .expect("read-only invocation");
        let line = read_only.shell_line().expect("read-only shell line");
        assert!(line.contains("--tools read,grep,find,ls"));
        assert!(!line.contains("bash"));
    }

    #[test]
    fn parser_sums_final_assistant_usage_and_ignores_catalogue_cost() {
        let first = json!({
            "type": "message_end",
            "message": {
                "role": "assistant",
                "usage": {"input": 10, "output": 2, "cacheRead": 4, "cacheWrite": 1,
                    "cost": {"total": 99.0}}
            }
        });
        let tool = json!({"type":"message_end","message":{"role":"toolResult"}});
        let second = json!({
            "type": "message_end",
            "message": {
                "role": "assistant",
                "usage": {"input": 3, "output": 5, "cacheRead": 7, "cacheWrite": 0}
            }
        });
        let capture = PiDriver
            .parse_usage(
                &format!("{first}\n{tool}\nnot json\n{second}\n"),
                "anthropic/claude-sonnet-4-5",
            )
            .expect("capture");
        assert_eq!(capture.rows.len(), 1);
        let row = &capture.rows[0];
        assert_eq!(row.input_tokens, 13);
        assert_eq!(row.output_tokens, 7);
        assert_eq!(row.cache_read_tokens, Some(11));
        assert_eq!(row.cache_write_tokens, Some(1));
        assert_eq!(row.cost_usd, None);
        assert_eq!(row.pricing_basis, PricingBasis::None);
    }

    #[test]
    fn malformed_usage_is_refused_and_absence_is_empty() {
        let malformed = json!({
            "type":"message_end",
            "message":{"role":"assistant","usage":{"input":"1","output":1,"cacheRead":0,"cacheWrite":0}}
        });
        assert!(matches!(
            PiDriver.parse_usage(&malformed.to_string(), "p/m"),
            Err(ProviderError::Malformed { .. })
        ));
        assert!(PiDriver
            .parse_usage("{\"type\":\"agent_settled\"}\n", "p/m")
            .expect("empty")
            .rows
            .is_empty());
    }
}
