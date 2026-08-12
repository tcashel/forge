//! Parser for bd's JSON envelope.
//!
//! With `BD_JSON_ENVELOPE=1` pinned on every bd child, stdout of a successful
//! call is one JSON object `{ "data": ..., "schema_version": 1 }`. Rules, all
//! probe-verified against bd 1.2.1 (build `634cbbc4`):
//!
//! - `schema_version` must equal 1 — anything else is a typed error upstream.
//! - `data: null` means EMPTY LIST for list-shaped commands (`bd gate list
//!   --json` on a fresh DB returns `data: null`; `bd list --json` on an empty
//!   initialized store returns `data: []` — both are the empty list here).
//! - `bd show <id> --json` returns `data` as an ARRAY — take the first
//!   element. Only show is pinned to an array: every other enveloped command
//!   resolves `data` defensively via `first_obj`.
//!
//! Everything here is CRATE-INTERNAL: the frozen public surface hands
//! consumers typed result structs, each carrying the call's parsed `data` in
//! its own `raw` field, so no caller needs the parser itself.
//! - stderr may carry warnings even on success (bd 1.2.1 routinely emits a
//!   `beads.role not configured (GH#2950)` warning): stderr content alone is
//!   never failure — exit status plus stdout parse govern.
//! - A FAILING call emits the envelope with an error instead of plain data.
//!   The spec'd shape is `{ "error": <string or object>, "schema_version": 1 }`;
//!   the shape actually observed from bd 1.2.1 nests it under `data`:
//!   `{"data":{"error":"1 of 1 issues failed to update","failed":[{"id":
//!   "beads-1al","error":"updating issue: issue already claimed by doctor"}]},
//!   "schema_version":1}` (probe: second `--claim` by another actor, exit 1).
//!   `extract_error` handles both shapes and folds `failed[].error` entries
//!   into the returned string.

use serde_json::Value;

/// A leniently parsed envelope: never fails, records what it saw so the
/// classifier can match text and the spines can decide success strictly.
pub(crate) struct Lenient {
    /// The `data` payload, when the `data` key was present (may be `Null`).
    pub data: Option<Value>,
    /// The envelope's error string, when one was present (either shape).
    pub error: Option<String>,
    /// Whether stdout parsed as JSON at all.
    pub parsed: bool,
    /// Whether `schema_version` equalled 1 (only meaningful when `parsed`).
    pub schema_ok: bool,
}

/// Parse stdout leniently: a non-JSON or wrong-schema payload is recorded,
/// not an error — the caller decides what that means for its operation.
pub(crate) fn parse_lenient(stdout: &str) -> Lenient {
    match serde_json::from_str::<Value>(stdout) {
        Ok(v) => {
            let schema_ok = v.get("schema_version").and_then(Value::as_i64) == Some(1);
            let error = extract_error(&v);
            let data = v.get("data").cloned();
            Lenient {
                data,
                error,
                parsed: true,
                schema_ok,
            }
        }
        Err(_) => Lenient {
            data: None,
            error: None,
            parsed: false,
            schema_ok: false,
        },
    }
}

/// Resolve enveloped `data` defensively: returns `data` itself when it is an
/// object, `data[0]` when it is an array, `None` otherwise.
///
/// Observed bd 1.2.1 shapes motivating this: `bd create ... --json` returns
/// `data` as an OBJECT (`{"id":"beads-1al","title":"doctor probe",...}`) while
/// `bd show <id> --json` and `bd update <id> --claim ... --json` return `data`
/// as an ARRAY of one issue object.
pub(crate) fn first_obj(data: &Value) -> Option<&Value> {
    match data {
        Value::Object(_) => Some(data),
        Value::Array(items) => items.first(),
        _ => None,
    }
}

/// Interpret `data` as a list: `null` is the empty list (probe-verified:
/// `bd gate list --json` on a fresh DB), an array is itself, anything else is
/// not list-shaped.
pub(crate) fn as_list(data: &Value) -> Option<Vec<Value>> {
    match data {
        Value::Null => Some(Vec::new()),
        Value::Array(items) => Some(items.clone()),
        _ => None,
    }
}

/// Extract the envelope's error string, handling both the spec'd top-level
/// `error` key and the `data.error` (+ `data.failed[].error`) shape bd 1.2.1
/// actually emits.
pub(crate) fn extract_error(root: &Value) -> Option<String> {
    if let Some(e) = root.get("error") {
        return Some(stringify(e));
    }
    let data = root.get("data")?;
    let e = data.get("error")?;
    let mut s = stringify(e);
    if let Some(failed) = data.get("failed").and_then(Value::as_array) {
        for entry in failed {
            if let Some(fe) = entry.get("error").and_then(Value::as_str) {
                s.push_str("; ");
                s.push_str(fe);
            }
        }
    }
    Some(s)
}

fn stringify(v: &Value) -> String {
    v.as_str().map_or_else(|| v.to_string(), str::to_string)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn schema_version_must_be_one() {
        let l = parse_lenient(r#"{"data": {}, "schema_version": 2}"#);
        assert!(l.parsed);
        assert!(!l.schema_ok);
        let ok = parse_lenient(r#"{"data": {}, "schema_version": 1}"#);
        assert!(ok.parsed);
        assert!(ok.schema_ok);
    }

    #[test]
    fn unparseable_stdout_is_recorded_not_fatal() {
        let l = parse_lenient("Error: something non-JSON");
        assert!(!l.parsed);
        assert!(l.data.is_none());
        assert!(l.error.is_none());
    }

    #[test]
    fn data_null_means_empty_list() {
        let l = parse_lenient(r#"{"data": null, "schema_version": 1}"#);
        let data = l.data.expect("data key present");
        assert_eq!(as_list(&data), Some(Vec::new()));
    }

    #[test]
    fn array_data_is_a_list_and_object_is_not() {
        assert_eq!(as_list(&json!([1, 2])).map(|v| v.len()), Some(2));
        assert_eq!(as_list(&json!({"id": "x"})), None);
    }

    #[test]
    fn show_returns_array_first_obj_takes_first() {
        // Observed: bd show beads-1al --json wraps the issue in an array.
        let data = json!([{"id": "beads-1al", "assignee": "doctor"}]);
        let obj = first_obj(&data).expect("first element");
        assert_eq!(obj.get("id").and_then(Value::as_str), Some("beads-1al"));
        // An object resolves to itself (bd create shape).
        let data = json!({"id": "beads-2la"});
        assert_eq!(
            first_obj(&data)
                .and_then(|o| o.get("id"))
                .and_then(Value::as_str),
            Some("beads-2la")
        );
        assert!(first_obj(&json!(null)).is_none());
        assert!(first_obj(&json!([])).is_none());
    }

    #[test]
    fn extracts_top_level_error() {
        let l = parse_lenient(r#"{"error": "boom", "schema_version": 1}"#);
        assert_eq!(l.error.as_deref(), Some("boom"));
    }

    #[test]
    fn extracts_nested_data_error_with_failed_entries() {
        // Observed bd 1.2.1 failure envelope for a refused claim.
        let l = parse_lenient(
            r#"{"data":{"error":"1 of 1 issues failed to update","failed":[{"id":"beads-1al","error":"updating issue: issue already claimed by doctor"}]},"schema_version":1}"#,
        );
        let e = l.error.expect("error extracted");
        assert!(e.contains("1 of 1 issues failed to update"));
        assert!(e.contains("already claimed by doctor"));
    }
}
