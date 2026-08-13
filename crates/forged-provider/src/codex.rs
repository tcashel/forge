//! The codex driver: the `codex exec` shell line and the event-stream usage
//! parser.

use forged_types::{Sandbox, WorkPacket};
use serde_json::{Map, Value};

use crate::error::ProviderError;
use crate::invocation::{
    validate_embedded_path, validate_model, Invocation, PacketDirs, ProviderDriver,
};
use crate::usage::{
    disjoint_input, object_line, optional_token, required_token, PricingBasis, UsageCapture,
    UsageRow,
};

/// The closed set of reasoning efforts the codex CLI accepts. The closed
/// set is what makes the single-quoted TOML `-c` value safe to embed in a
/// shell line.
const EFFORTS: [&str; 5] = ["minimal", "low", "medium", "high", "xhigh"];

/// Runs one packet through the `codex` CLI.
///
/// This driver does not inspect `packet.provider_hints.provider`: picking
/// which driver runs a packet is the wave-4 caller's job, and handing a
/// packet to the wrong driver is a caller bug this crate does not detect
/// and does not report.
#[derive(Debug, Clone, PartialEq)]
pub struct CodexDriver;

impl ProviderDriver for CodexDriver {
    fn name(&self) -> &'static str {
        "codex"
    }

    fn invocation(
        &self,
        packet: &WorkPacket,
        dirs: &PacketDirs,
        _claim_token: &str,
    ) -> Result<Invocation, ProviderError> {
        let prompt_path = dirs.prompt();
        let stdout_path = dirs.stdout();
        let last_path = dirs.last_message();
        let prompt = validate_embedded_path(&prompt_path)?;
        let stdout = validate_embedded_path(&stdout_path)?;
        let last = validate_embedded_path(&last_path)?;
        let model = &packet.provider_hints.model;
        validate_model(model)?;
        let sandbox = match packet.provider_hints.sandbox {
            Sandbox::ReadOnly => "read-only",
            Sandbox::WorkspaceWrite => "workspace-write",
        };
        let effort_arg = match packet.provider_hints.effort.as_deref() {
            None => String::new(),
            Some(effort) if EFFORTS.contains(&effort) => {
                format!(" -c 'model_reasoning_effort=\"{effort}\"'")
            }
            Some(effort) => {
                return Err(ProviderError::UnsupportedEffort {
                    effort: effort.to_owned(),
                })
            }
        };
        let shell_line = format!(
            "codex exec --json --skip-git-repo-check --sandbox {sandbox} \
             -m {model}{effort_arg} -o {last} - < {prompt} > {stdout}"
        );
        Ok(Invocation {
            shell_line,
            prompt_path,
            stdout_path,
            session_hint: None,
        })
    }

    fn parse_usage(&self, stdout: &str, model: &str) -> Result<UsageCapture, ProviderError> {
        let mut session_ref: Option<String> = None;
        let mut last_turn: Option<Map<String, Value>> = None;
        for line in stdout.lines() {
            let Some(obj) = object_line(line) else {
                continue;
            };
            match obj.get("type").and_then(Value::as_str) {
                Some("thread.started") => {
                    if let Some(Value::String(tid)) = obj.get("thread_id") {
                        session_ref = Some(tid.clone());
                    }
                }
                Some("turn.completed") => last_turn = Some(obj),
                _ => {}
            }
        }
        let Some(turn) = last_turn else {
            return Ok(UsageCapture {
                session_ref,
                rows: Vec::new(),
            });
        };
        let context = "codex turn.completed usage";
        let usage = match turn.get("usage") {
            None | Some(Value::Null) => {
                return Ok(UsageCapture {
                    session_ref,
                    rows: Vec::new(),
                })
            }
            Some(Value::Object(usage)) => usage,
            Some(other) => {
                return Err(ProviderError::Malformed {
                    message: format!("{context}: usage is not an object: {other}"),
                })
            }
        };
        let total_input = required_token(usage, "input_tokens", context)?;
        let cache_read = required_token(usage, "cached_input_tokens", context)?;
        let cache_write = optional_token(usage, "cache_write_input_tokens", context)?;
        let rows = vec![UsageRow {
            provider: "codex".to_owned(),
            model: model.to_owned(),
            input_tokens: disjoint_input(
                total_input,
                cache_read,
                cache_write.unwrap_or(0),
                context,
            )?,
            output_tokens: required_token(usage, "output_tokens", context)?,
            cache_read_tokens: Some(cache_read),
            cache_write_tokens: cache_write,
            cost_usd: None,
            pricing_basis: PricingBasis::None,
            rate_limit_used_percent: None,
        }];
        Ok(UsageCapture { session_ref, rows })
    }
}
