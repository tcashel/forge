//! Usage capture value types and the strict token-field readers both
//! parsers share.

use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

use crate::error::ProviderError;

/// What one captured provider run reported about itself.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageCapture {
    /// The session identifier the capture carried (claude `session_id`,
    /// codex `thread_id`), when any event named one.
    pub session_ref: Option<String>,
    /// Zero or more usage rows. Zero rows means the capture carried no
    /// usage — absence is data, not an error.
    pub rows: Vec<UsageRow>,
}

/// One usage row: token counters and cost for one model in one capture.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UsageRow {
    /// The driver that produced the row: `"claude"`, `"codex"`, or `"pi"`
    /// — never the model, and never a provider field read out of the capture.
    pub provider: String,
    /// The model the row is attributed to. The caller's argument
    /// everywhere except the claude `modelUsage` branch, whose keys name
    /// each row's model.
    pub model: String,
    /// Input tokens billed at the *uncached* rate — never a total.
    ///
    /// The three input buckets on this row are DISJOINT for every
    /// provider: `input_tokens + cache_read_tokens + cache_write_tokens`
    /// is the prompt size. Claude reports them that way natively; codex
    /// reports a total with the cache buckets as subsets of it, so its
    /// parsers subtract them back out through [`disjoint_input`]. Storing
    /// two conventions in one field would make any cross-provider sum —
    /// and every cost computed from one — silently wrong.
    pub input_tokens: u64,
    /// Output tokens produced.
    pub output_tokens: u64,
    /// Cache-read tokens, when the capture declared the field.
    pub cache_read_tokens: Option<u64>,
    /// Cache-write tokens — the one optional token field on both
    /// providers; absence maps to `None`, never to 0.
    pub cache_write_tokens: Option<u64>,
    /// Billed cost in USD, when the capture carried one.
    pub cost_usd: Option<f64>,
    /// Where `cost_usd` came from.
    pub pricing_basis: PricingBasis,
    /// Primary rate-limit consumption percentage — only ever present on
    /// rows recovered from a codex rollout.
    pub rate_limit_used_percent: Option<f64>,
    /// Server-side web searches the turn performed, when the capture
    /// counted them. Billed per call rather than per token, so it is
    /// carried alongside the token buckets and never folded into them.
    /// `None` means the capture never said; `Some(0)` means it said zero.
    pub web_search_requests: Option<u64>,
}

/// Where a row's `cost_usd` came from. Field-for-field alignable with
/// `forged_ledger::NewUsage`, which wave 4 maps into.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PricingBasis {
    /// The provider reported a billed cost.
    Billed,
    /// The cost was imputed from API rates. Never produced in v0; exists
    /// so the ledger's `pricing_basis` column has a total mapping.
    ImputedApiRate,
    /// No cost is known.
    None,
}

impl PricingBasis {
    /// The stable string form: `"billed"` | `"imputed_api_rate"` |
    /// `"none"` — identical to the serde serialization.
    pub fn as_str(self) -> &'static str {
        match self {
            PricingBasis::Billed => "billed",
            PricingBasis::ImputedApiRate => "imputed_api_rate",
            PricingBasis::None => "none",
        }
    }
}

/// Read a required token field: missing, null, or not a non-negative
/// integer representable as `u64` is `Malformed`.
pub(crate) fn required_token(
    obj: &Map<String, Value>,
    key: &str,
    context: &str,
) -> Result<u64, ProviderError> {
    match obj.get(key) {
        None => Err(ProviderError::Malformed {
            message: format!("{context}: required token field {key} is missing"),
        }),
        Some(value) => value.as_u64().ok_or_else(|| ProviderError::Malformed {
            message: format!("{context}: token field {key} is not a non-negative integer: {value}"),
        }),
    }
}

/// Read an optional token field: absent or null maps to `None`, never to 0
/// and never to an error; present but not a non-negative integer is
/// `Malformed`.
pub(crate) fn optional_token(
    obj: &Map<String, Value>,
    key: &str,
    context: &str,
) -> Result<Option<u64>, ProviderError> {
    match obj.get(key) {
        None | Some(Value::Null) => Ok(None),
        Some(value) => value
            .as_u64()
            .map(Some)
            .ok_or_else(|| ProviderError::Malformed {
                message: format!(
                    "{context}: token field {key} is not a non-negative integer: {value}"
                ),
            }),
    }
}

/// Convert a codex-style input total into the disjoint uncached count
/// [`UsageRow::input_tokens`] stores.
///
/// OpenAI's prompt-caching contract makes `cached_input_tokens` and
/// `cache_write_input_tokens` subsets of `input_tokens`; the three
/// categories partition the prompt and are billed at 0.1x, 1.25x, and 1x
/// the uncached rate respectively. Subsets that exceed their total are
/// `Malformed` — a clamp here would understate the uncached tokens, which
/// are the most expensive of the three.
pub(crate) fn disjoint_input(
    total: u64,
    cache_read: u64,
    cache_write: u64,
    context: &str,
) -> Result<u64, ProviderError> {
    total
        .checked_sub(cache_read)
        .and_then(|rest| rest.checked_sub(cache_write))
        .ok_or_else(|| ProviderError::Malformed {
            message: format!(
                "{context}: cached ({cache_read}) plus cache-write ({cache_write}) \
                 tokens exceed input_tokens ({total})"
            ),
        })
}

/// Read an optional cost field: only a JSON number counts; null, absence,
/// or any other shape degrades to `None`, never an error.
pub(crate) fn optional_cost(obj: &Map<String, Value>, key: &str) -> Option<f64> {
    obj.get(key).and_then(Value::as_f64)
}

/// Parse one captured line as a JSON object; anything else is `None` and
/// the caller skips the line.
pub(crate) fn object_line(line: &str) -> Option<Map<String, Value>> {
    match serde_json::from_str::<Value>(line) {
        Ok(Value::Object(obj)) => Some(obj),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn pricing_basis_as_str_and_serde_agree_for_all_three_variants() {
        for basis in [
            PricingBasis::Billed,
            PricingBasis::ImputedApiRate,
            PricingBasis::None,
        ] {
            let serialized = serde_json::to_value(basis).expect("serializes");
            assert_eq!(serialized, json!(basis.as_str()));
            let back: PricingBasis = serde_json::from_value(serialized).expect("deserializes");
            assert_eq!(back, basis);
        }
        assert_eq!(PricingBasis::Billed.as_str(), "billed");
        assert_eq!(PricingBasis::ImputedApiRate.as_str(), "imputed_api_rate");
        assert_eq!(PricingBasis::None.as_str(), "none");
    }

    #[test]
    fn usage_row_serializes_camel_case() {
        let row = UsageRow {
            provider: "codex".to_owned(),
            model: "gpt".to_owned(),
            web_search_requests: Some(2),
            input_tokens: 10,
            output_tokens: 2,
            cache_read_tokens: Some(4),
            cache_write_tokens: None,
            cost_usd: None,
            pricing_basis: PricingBasis::None,
            rate_limit_used_percent: None,
        };
        let value = serde_json::to_value(&row).expect("serializes");
        assert_eq!(value["inputTokens"], json!(10));
        assert_eq!(value["cacheReadTokens"], json!(4));
        assert_eq!(value["cacheWriteTokens"], json!(null));
        assert_eq!(value["pricingBasis"], json!("none"));
        assert_eq!(value["rateLimitUsedPercent"], json!(null));
        let back: UsageRow = serde_json::from_value(value).expect("deserializes");
        assert_eq!(back, row);
    }

    #[test]
    fn required_token_rejects_wrong_types_and_negatives() {
        let obj = json!({"ok": 5, "s": "5", "neg": -1, "frac": 1.5, "nul": null});
        let Value::Object(obj) = obj else {
            unreachable!()
        };
        assert_eq!(required_token(&obj, "ok", "t").expect("reads"), 5);
        for key in ["s", "neg", "frac", "nul", "missing"] {
            assert!(
                matches!(
                    required_token(&obj, key, "t"),
                    Err(ProviderError::Malformed { .. })
                ),
                "{key} should be malformed"
            );
        }
    }

    #[test]
    fn optional_token_maps_absence_to_none_and_rejects_malformation() {
        let obj = json!({"ok": 0, "s": "0", "nul": null});
        let Value::Object(obj) = obj else {
            unreachable!()
        };
        assert_eq!(optional_token(&obj, "ok", "t").expect("reads"), Some(0));
        assert_eq!(optional_token(&obj, "nul", "t").expect("reads"), None);
        assert_eq!(optional_token(&obj, "missing", "t").expect("reads"), None);
        assert!(matches!(
            optional_token(&obj, "s", "t"),
            Err(ProviderError::Malformed { .. })
        ));
    }

    #[test]
    fn optional_cost_only_accepts_numbers() {
        let obj = json!({"n": 0.5, "nul": null, "s": "0.5"});
        let Value::Object(obj) = obj else {
            unreachable!()
        };
        assert_eq!(optional_cost(&obj, "n"), Some(0.5));
        assert_eq!(optional_cost(&obj, "nul"), None);
        assert_eq!(optional_cost(&obj, "s"), None);
        assert_eq!(optional_cost(&obj, "missing"), None);
    }

    #[test]
    fn object_line_skips_non_objects() {
        assert!(object_line("{\"a\":1}").is_some());
        assert!(object_line("[1,2]").is_none());
        assert!(object_line("not json").is_none());
        assert!(object_line("42").is_none());
        assert!(object_line("").is_none());
    }
}
