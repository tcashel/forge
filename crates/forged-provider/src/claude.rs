//! The claude driver: the `claude -p` shell line and the stream-json usage
//! parser.

use forged_types::{claude_session_id, WorkPacket};
use serde_json::{Map, Value};

use crate::error::ProviderError;
use crate::invocation::ProviderDriver;
use crate::invocation::{validate_embedded_path, validate_model, Invocation, PacketDirs};
use crate::usage::{
    object_line, optional_cost, optional_token, required_token, PricingBasis, UsageCapture,
    UsageRow,
};

/// Runs one packet through the `claude` CLI.
///
/// This driver does not inspect `packet.provider_hints.provider`: picking
/// which driver runs a packet is the wave-4 caller's job, and handing a
/// packet to the wrong driver is a caller bug this crate does not detect
/// and does not report.
///
/// `provider_hints.sandbox` is ignored — the claude CLI has no read-only
/// mode, so review-stage read-onlyness is carried by the prompt, not the
/// flags. `provider_hints.effort` is likewise ignored — the claude CLI has
/// no reasoning-effort flag — so [`ClaudeDriver::invocation`] never returns
/// [`ProviderError::UnsupportedEffort`], not even for an unknown effort.
#[derive(Debug, Clone, PartialEq)]
pub struct ClaudeDriver;

impl ProviderDriver for ClaudeDriver {
    fn name(&self) -> &'static str {
        "claude"
    }

    fn invocation(
        &self,
        packet: &WorkPacket,
        dirs: &PacketDirs,
        claim_token: &str,
    ) -> Result<Invocation, ProviderError> {
        let prompt_path = dirs.prompt();
        let stdout_path = dirs.stdout();
        let prompt = validate_embedded_path(&prompt_path)?;
        let stdout = validate_embedded_path(&stdout_path)?;
        let model = &packet.provider_hints.model;
        validate_model(model)?;
        let session_id = claude_session_id(claim_token);
        let shell_line = format!(
            "claude -p --output-format stream-json --verbose \
             --dangerously-skip-permissions --session-id {session_id} \
             --model {model} < {prompt} > {stdout}"
        );
        Ok(Invocation {
            shell_line,
            prompt_path,
            stdout_path,
            session_hint: Some(session_id),
        })
    }

    fn parse_usage(&self, stdout: &str, model: &str) -> Result<UsageCapture, ProviderError> {
        let mut session_ref: Option<String> = None;
        let mut last_result: Option<Map<String, Value>> = None;
        for line in stdout.lines() {
            let Some(obj) = object_line(line) else {
                continue;
            };
            if let Some(Value::String(sid)) = obj.get("session_id") {
                session_ref = Some(sid.clone());
            }
            if obj.get("type").and_then(Value::as_str) == Some("result") {
                last_result = Some(obj);
            }
        }
        let Some(result) = last_result else {
            return Ok(UsageCapture {
                session_ref,
                rows: Vec::new(),
            });
        };
        let rows = match result.get("modelUsage") {
            Some(Value::Object(model_usage)) if !model_usage.is_empty() => {
                self.model_usage_rows(model_usage)?
            }
            _ => self.single_row(&result, model)?,
        };
        Ok(UsageCapture { session_ref, rows })
    }
}

impl ClaudeDriver {
    /// One row per `modelUsage` key, sorted by model ascending.
    fn model_usage_rows(
        &self,
        model_usage: &Map<String, Value>,
    ) -> Result<Vec<UsageRow>, ProviderError> {
        let mut rows = Vec::with_capacity(model_usage.len());
        for (model_name, entry) in model_usage {
            let context = format!("claude result modelUsage[{model_name}]");
            let Value::Object(entry) = entry else {
                return Err(ProviderError::Malformed {
                    message: format!("{context}: entry is not an object"),
                });
            };
            let cost_usd = optional_cost(entry, "costUSD");
            rows.push(UsageRow {
                provider: "claude".to_owned(),
                model: model_name.clone(),
                web_search_requests: optional_token(entry, "webSearchRequests", &context)?,
                input_tokens: required_token(entry, "inputTokens", &context)?,
                output_tokens: required_token(entry, "outputTokens", &context)?,
                cache_read_tokens: Some(required_token(entry, "cacheReadInputTokens", &context)?),
                cache_write_tokens: optional_token(entry, "cacheCreationInputTokens", &context)?,
                pricing_basis: if cost_usd.is_some() {
                    PricingBasis::Billed
                } else {
                    PricingBasis::None
                },
                cost_usd,
                rate_limit_used_percent: None,
            });
        }
        rows.sort_by(|a, b| a.model.cmp(&b.model));
        Ok(rows)
    }

    /// The single-row branch: one row from the result event's `usage`
    /// object, or zero rows when it carries none — absence is data.
    fn single_row(
        &self,
        result: &Map<String, Value>,
        model: &str,
    ) -> Result<Vec<UsageRow>, ProviderError> {
        let context = "claude result usage";
        let usage = match result.get("usage") {
            None | Some(Value::Null) => return Ok(Vec::new()),
            Some(Value::Object(usage)) => usage,
            Some(other) => {
                return Err(ProviderError::Malformed {
                    message: format!("{context}: usage is not an object: {other}"),
                })
            }
        };
        let cost_usd = optional_cost(result, "total_cost_usd");
        // `server_tool_use` is the single-row branch's only web-search
        // counter; the per-model branch reads `webSearchRequests` instead.
        let web_search_requests = match usage.get("server_tool_use") {
            Some(Value::Object(tools)) => optional_token(
                tools,
                "web_search_requests",
                "claude result server_tool_use",
            )?,
            _ => None,
        };
        Ok(vec![UsageRow {
            provider: "claude".to_owned(),
            model: model.to_owned(),
            web_search_requests,
            input_tokens: required_token(usage, "input_tokens", context)?,
            output_tokens: required_token(usage, "output_tokens", context)?,
            cache_read_tokens: Some(required_token(usage, "cache_read_input_tokens", context)?),
            cache_write_tokens: optional_token(usage, "cache_creation_input_tokens", context)?,
            pricing_basis: if cost_usd.is_some() {
                PricingBasis::Billed
            } else {
                PricingBasis::None
            },
            cost_usd,
            rate_limit_used_percent: None,
        }])
    }
}
