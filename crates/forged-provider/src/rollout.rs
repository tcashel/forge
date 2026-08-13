//! Codex rollout recovery: find the rollout file for a thread under a
//! caller-supplied codex home and read its cumulative usage.

use std::path::{Path, PathBuf};

use serde_json::{Map, Value};

use crate::error::ProviderError;
use crate::usage::{
    disjoint_input, object_line, optional_token, required_token, PricingBasis, UsageCapture,
    UsageRow,
};

/// Directory recursion cap below each search root (`sessions/` nests
/// `YYYY/MM/DD/`).
const MAX_DEPTH: u32 = 8;

/// Codex only: recover usage for a turn that failed before emitting any.
///
/// Searches `<codex_home>/sessions/**/rollout-*-<thread_id>.jsonl` and then
/// `<codex_home>/archived_sessions/**/rollout-*-<thread_id>.jsonl`. The
/// `codex_home` argument is authoritative: this function reads no
/// environment variables and never expands `~` — resolving the operator
/// default is the caller's job.
///
/// Every filename match is identity-checked before it is parsed: the
/// file's `session_meta` line must carry `payload.session_id` or
/// `payload.id` equal to `thread_id`; a file that fails the check is
/// skipped and the search continues. The first identity-valid match in
/// walk order wins — each directory's entries are visited in
/// lexicographically ascending order, and all of `sessions/` is exhausted
/// before `archived_sessions/` is entered. Zero identity-valid matches
/// across both roots is [`ProviderError::RolloutNotFound`]; an
/// identity-valid match whose events yield no usable usage is `Ok` with
/// zero rows — absent usage is data. `session_ref` is always
/// `Some(thread_id)`, the caller's argument, never a value read back out
/// of the file.
pub async fn recover_usage_from_rollout(
    codex_home: &Path,
    thread_id: &str,
    model: &str,
) -> Result<UsageCapture, ProviderError> {
    validate_thread_id(thread_id)?;
    for root in ["sessions", "archived_sessions"] {
        if let Some(content) = search_root(&codex_home.join(root), thread_id).await? {
            return parse_rollout(&content, thread_id, model);
        }
    }
    Err(ProviderError::RolloutNotFound {
        thread_id: thread_id.to_owned(),
        codex_home: codex_home.display().to_string(),
    })
}

/// Reject a thread id outside `^[A-Za-z0-9-]+$` before searching, so a
/// `../` thread id cannot escape `codex_home`. A producer of
/// [`ProviderError::UnsafeShellLine`], alongside model validation.
fn validate_thread_id(thread_id: &str) -> Result<(), ProviderError> {
    let ok = !thread_id.is_empty()
        && thread_id
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-');
    if ok {
        Ok(())
    } else {
        Err(ProviderError::UnsafeShellLine {
            value: thread_id.to_owned(),
            reason: "thread id must be non-empty and match ^[A-Za-z0-9-]+$".to_owned(),
        })
    }
}

/// Depth-first search below `root` for the first identity-valid rollout
/// file, visiting each directory's entries in lexicographically ascending
/// order. Returns the winning file's content, or `None` when the root
/// holds no identity-valid match (including when the root itself does not
/// exist).
async fn search_root(root: &Path, thread_id: &str) -> Result<Option<String>, ProviderError> {
    let suffix = format!("-{thread_id}.jsonl");
    // LIFO stack of pending entries; children are pushed in reverse sorted
    // order so the lexicographically smallest is processed first, giving a
    // deterministic pre-order walk.
    let mut stack: Vec<(PathBuf, u32)> = vec![(root.to_path_buf(), 0)];
    while let Some((path, depth)) = stack.pop() {
        let is_dir = if depth == 0 {
            true
        } else {
            match tokio::fs::metadata(&path).await {
                Ok(meta) => meta.is_dir(),
                Err(e) if e.kind() == std::io::ErrorKind::NotFound => continue,
                Err(e) => return Err(ProviderError::Io(e)),
            }
        };
        if is_dir {
            if depth > MAX_DEPTH {
                continue;
            }
            let mut read_dir = match tokio::fs::read_dir(&path).await {
                Ok(read_dir) => read_dir,
                Err(e) if e.kind() == std::io::ErrorKind::NotFound => continue,
                Err(e) => return Err(ProviderError::Io(e)),
            };
            let mut children: Vec<PathBuf> = Vec::new();
            loop {
                match read_dir.next_entry().await {
                    Ok(Some(entry)) => children.push(entry.path()),
                    Ok(None) => break,
                    Err(e) => return Err(ProviderError::Io(e)),
                }
            }
            children.sort();
            for child in children.into_iter().rev() {
                stack.push((child, depth + 1));
            }
            continue;
        }
        if !filename_matches(&path, &suffix) {
            continue;
        }
        let content = match tokio::fs::read_to_string(&path).await {
            Ok(content) => content,
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => continue,
            Err(e) => return Err(ProviderError::Io(e)),
        };
        if identity_valid(&content, thread_id) {
            return Ok(Some(content));
        }
    }
    Ok(None)
}

/// Glob `rollout-*-<thread_id>.jsonl` against a candidate's file name.
fn filename_matches(path: &Path, suffix: &str) -> bool {
    let Some(name) = path.file_name().and_then(|n| n.to_str()) else {
        return false;
    };
    name.len() >= "rollout-".len() + suffix.len()
        && name.starts_with("rollout-")
        && name.ends_with(suffix)
}

/// Identity check: the file's `session_meta` line carries
/// `payload.session_id` or `payload.id` equal to `thread_id` — pre-0.146
/// rollouts carry only `id`, so either key satisfies the check. A failed
/// check is never `Malformed`; the caller just skips the file.
fn identity_valid(content: &str, thread_id: &str) -> bool {
    for line in content.lines() {
        let Some(obj) = object_line(line) else {
            continue;
        };
        if obj.get("type").and_then(Value::as_str) != Some("session_meta") {
            continue;
        }
        let Some(Value::Object(payload)) = obj.get("payload") else {
            return false;
        };
        return ["session_id", "id"]
            .iter()
            .any(|key| payload.get(*key).and_then(Value::as_str) == Some(thread_id));
    }
    false
}

/// Parse an identity-valid rollout: cumulative usage from the last
/// `token_count` event with a non-null `info`, and the primary rate-limit
/// percentage from the last `token_count` line carrying one, whether or
/// not that same line carried usage.
fn parse_rollout(
    content: &str,
    thread_id: &str,
    model: &str,
) -> Result<UsageCapture, ProviderError> {
    let mut usage_info: Option<Value> = None;
    let mut used_percent: Option<f64> = None;
    for line in content.lines() {
        let Some(obj) = object_line(line) else {
            continue;
        };
        if obj.get("type").and_then(Value::as_str) != Some("event_msg") {
            continue;
        }
        let Some(Value::Object(payload)) = obj.get("payload") else {
            continue;
        };
        if payload.get("type").and_then(Value::as_str) != Some("token_count") {
            continue;
        }
        if let Some(percent) = payload
            .get("rate_limits")
            .and_then(|limits| limits.get("primary"))
            .and_then(|primary| primary.get("used_percent"))
            .and_then(Value::as_f64)
        {
            used_percent = Some(percent);
        }
        match payload.get("info") {
            None | Some(Value::Null) => {}
            Some(info) => usage_info = Some(info.clone()),
        }
    }
    let session_ref = Some(thread_id.to_owned());
    let Some(info) = usage_info else {
        return Ok(UsageCapture {
            session_ref,
            rows: Vec::new(),
        });
    };
    let context = "codex rollout token_count info.total_token_usage";
    let usage: &Map<String, Value> = match info.get("total_token_usage") {
        Some(Value::Object(usage)) => usage,
        _ => {
            return Err(ProviderError::Malformed {
                message: format!("{context}: missing or not an object"),
            })
        }
    };
    let total_input = required_token(usage, "input_tokens", context)?;
    let cache_read = required_token(usage, "cached_input_tokens", context)?;
    let cache_write = optional_token(usage, "cache_write_input_tokens", context)?;
    let rows = vec![UsageRow {
        provider: "codex".to_owned(),
        model: model.to_owned(),
        input_tokens: disjoint_input(total_input, cache_read, cache_write.unwrap_or(0), context)?,
        output_tokens: required_token(usage, "output_tokens", context)?,
        cache_read_tokens: Some(cache_read),
        cache_write_tokens: cache_write,
        cost_usd: None,
        pricing_basis: PricingBasis::None,
        rate_limit_used_percent: used_percent,
    }];
    Ok(UsageCapture { session_ref, rows })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn thread_id_charset_rule() {
        assert!(validate_thread_id("019fee71-c88f-70f0-bc8c-a5f35827deb4").is_ok());
        for bad in ["", "../escape", "a b", "id;x", "id/x", "id.x"] {
            assert!(
                matches!(
                    validate_thread_id(bad),
                    Err(ProviderError::UnsafeShellLine { .. })
                ),
                "{bad:?} should be unsafe"
            );
        }
    }

    #[test]
    fn filename_glob_requires_both_anchors() {
        let suffix = "-tid-1.jsonl";
        assert!(filename_matches(
            Path::new("/x/rollout-2026-08-10T21-31-02-tid-1.jsonl"),
            suffix
        ));
        assert!(!filename_matches(Path::new("/x/rollout-tid-1.txt"), suffix));
        assert!(!filename_matches(
            Path::new("/x/other-2026-tid-1.jsonl"),
            suffix
        ));
        assert!(!filename_matches(
            Path::new("/x/rollout-tid-2.jsonl"),
            suffix
        ));
    }

    #[test]
    fn identity_check_accepts_either_key_and_fails_closed() {
        let with_session_id =
            r#"{"type":"session_meta","payload":{"session_id":"tid-1","id":"other"}}"#;
        let with_id_only = r#"{"type":"session_meta","payload":{"id":"tid-1"}}"#;
        let wrong = r#"{"type":"session_meta","payload":{"session_id":"tid-9","id":"tid-9"}}"#;
        let no_meta = r#"{"type":"turn_context","payload":{"model":"m"}}"#;
        assert!(identity_valid(with_session_id, "tid-1"));
        assert!(identity_valid(with_id_only, "tid-1"));
        assert!(!identity_valid(wrong, "tid-1"));
        assert!(!identity_valid(no_meta, "tid-1"));
        assert!(!identity_valid("", "tid-1"));
    }
}
