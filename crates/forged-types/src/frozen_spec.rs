//! Immutable Bead specification retained by an approved run launch.

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

/// First durable frozen-Bead-spec schema.
pub const FROZEN_BEAD_SPEC_SCHEMA_V1: &str = "forged.frozen-bead-spec/1";

/// Exact provider-facing Bead content captured at the approval boundary.
///
/// The opaque Beads revision binds this snapshot to the operator's approval;
/// the body digest lets every later packet independently reject corrupted
/// durable bytes. Human context is frozen too because it is included in the
/// provider prompt even though the body remains the normative contract.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct FrozenBeadSpecV1 {
    /// Versioned wire schema.
    pub schema: String,
    /// Exact Bead id whose fields produced the snapshot.
    pub bead_id: String,
    /// Opaque Beads revision observed when approval was granted.
    pub revision: String,
    /// Provider-facing rendered specification bytes.
    pub body: String,
    /// SHA-256 of `body`.
    pub body_sha256: String,
    /// Explanatory Bead context copied into provider prompts.
    pub bead_context: Vec<String>,
}

impl FrozenBeadSpecV1 {
    /// Validate identity, schema, and content integrity before execution.
    pub fn validate(&self) -> Result<(), String> {
        if self.schema != FROZEN_BEAD_SPEC_SCHEMA_V1 {
            return Err(format!(
                "unsupported frozen Bead spec schema {:?}",
                self.schema
            ));
        }
        if self.bead_id.trim().is_empty() || self.revision.trim().is_empty() {
            return Err("frozen Bead spec requires beadId and revision".to_owned());
        }
        let actual = sha256_hex(self.body.as_bytes());
        if self.body_sha256 != actual {
            return Err("frozen Bead spec body digest mismatch".to_owned());
        }
        Ok(())
    }
}

/// Lowercase SHA-256 hex over arbitrary bytes.
pub fn sha256_hex(bytes: &[u8]) -> String {
    let mut hex = String::with_capacity(64);
    for byte in Sha256::digest(bytes) {
        use std::fmt::Write as _;
        let _ = write!(hex, "{byte:02x}");
    }
    hex
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn frozen_spec_validates_its_exact_body() {
        let mut spec = FrozenBeadSpecV1 {
            schema: FROZEN_BEAD_SPEC_SCHEMA_V1.to_owned(),
            bead_id: "bead-1".to_owned(),
            revision: "opaque-revision".to_owned(),
            body: "approved bytes\n".to_owned(),
            body_sha256: sha256_hex(b"approved bytes\n"),
            bead_context: vec!["Bead title: approved".to_owned()],
        };
        assert!(spec.validate().is_ok());
        spec.body.push_str("drift");
        assert_eq!(
            spec.validate().expect_err("drift must refuse"),
            "frozen Bead spec body digest mismatch"
        );
    }
}
