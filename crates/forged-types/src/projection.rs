//! Shared, additive contracts for operator-facing projections.
//!
//! Durable records deliberately keep their pre-1.0 spelling. These helpers
//! add the provider-neutral `work*` names only after a value has crossed the
//! storage boundary.

use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ProjectionSubjectKind {
    Work,
    Run,
    Epic,
    Attempt,
    Attention,
    Portfolio,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct ProjectionSubjectV1 {
    pub id: String,
    pub kind: ProjectionSubjectKind,
    pub title: Option<String>,
    pub repository: Option<String>,
    pub revision: Option<String>,
}

/// Add same-value `work*` siblings for every legacy `bead*` projection key.
///
/// This is intentionally a JSON-boundary operation. Calling it while writing
/// durable bodies would violate their byte-stability contract.
pub fn add_work_twins(value: &mut Value) {
    match value {
        Value::Array(values) => {
            for value in values {
                add_work_twins(value);
            }
        }
        Value::Object(object) => {
            for value in object.values_mut() {
                add_work_twins(value);
            }
            let twins = object
                .iter()
                .filter_map(|(key, value)| twin_key(key).map(|key| (key, value.clone())))
                .collect::<Vec<_>>();
            for (key, value) in twins {
                object.entry(key).or_insert(value);
            }
        }
        _ => {}
    }
}

pub fn with_work_twins(mut value: Value) -> Value {
    add_work_twins(&mut value);
    value
}

fn twin_key(key: &str) -> Option<String> {
    if key == "bead" || key == "beads" {
        return Some("work".to_owned());
    }
    key.strip_prefix("beads")
        .filter(|suffix| {
            suffix.starts_with(|character: char| character.is_ascii_uppercase())
                || suffix.starts_with('_')
        })
        .or_else(|| {
            key.strip_prefix("bead").filter(|suffix| {
                suffix.starts_with(|character: char| character.is_ascii_uppercase())
                    || suffix.starts_with('_')
            })
        })
        .map(|suffix| format!("work{suffix}"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn work_twins_are_recursive_additive_and_same_value() {
        let original = json!({
            "bead": {"id": "ore-1"},
            "nested": [{
                "beadId": "ore-1",
                "bead_id": "ore-1",
                "beads": "2026-01-01T00:00:00Z",
                "beadsStatus": "available"
            }],
            "beaded": false,
            "workId": "already-present"
        });
        let projected = with_work_twins(original.clone());
        assert_eq!(projected["bead"], projected["work"]);
        assert_eq!(projected["nested"][0]["beadId"], json!("ore-1"));
        assert_eq!(projected["nested"][0]["workId"], json!("ore-1"));
        assert_eq!(projected["nested"][0]["work_id"], json!("ore-1"));
        assert_eq!(
            projected["nested"][0]["beads"],
            projected["nested"][0]["work"]
        );
        assert_eq!(projected["nested"][0]["workStatus"], json!("available"));
        assert_eq!(projected["workId"], json!("already-present"));
        assert!(projected.get("worked").is_none());
        assert_eq!(original.get("work"), None);
    }
}
