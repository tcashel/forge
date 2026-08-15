//! Stable, human-readable identity for operator-facing work projections.
//!
//! Canonical ids remain selectors. This value is display context captured at
//! launch, so a later Bead rename or outage cannot rewrite execution history.

use std::path::{Component, Path};

use serde::{Deserialize, Serialize};

/// The only durable work-identity schema understood by this version.
pub const WORK_IDENTITY_SCHEMA_V1: &str = "forged.work-identity/1";

/// The two durable top-level work subjects Forged projects.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum WorkIdentitySubjectKind {
    Run,
    Epic,
}

impl WorkIdentitySubjectKind {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Run => "run",
            Self::Epic => "epic",
        }
    }
}

/// Where the display facts came from.
///
/// `LivePlan` is valid only in an in-memory projection. The ledger rejects it
/// so a current Beads read can never masquerade as frozen execution history.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum WorkIdentitySource {
    Durable,
    LivePlan,
    LegacyFallback,
}

impl WorkIdentitySource {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Durable => "durable",
            Self::LivePlan => "live-plan",
            Self::LegacyFallback => "legacy-fallback",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkIdentitySubjectV1 {
    pub kind: WorkIdentitySubjectKind,
    pub id: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkIdentityBeadV1 {
    pub id: String,
    pub title: Option<String>,
    /// Opaque Beads revision token. Equality only; never ordered or parsed.
    pub revision: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkIdentityRepositoryV1 {
    /// Lexically normalized absolute path. No filesystem lookup is involved.
    pub path: String,
    /// Deterministic last-two-component label derived from `path`.
    pub label: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkIdentityContextV1 {
    pub id: String,
    pub title: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkIdentityV1 {
    pub schema: String,
    pub subject: WorkIdentitySubjectV1,
    pub bead: WorkIdentityBeadV1,
    pub repository: Option<WorkIdentityRepositoryV1>,
    pub project: Option<WorkIdentityContextV1>,
    pub epic: Option<WorkIdentityContextV1>,
    pub display_title: String,
    pub captured_at: String,
    pub source: WorkIdentitySource,
}

/// A closed validation failure. Stored values are never repaired or widened
/// while decoding; callers must construct the exact versioned contract.
#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
pub enum WorkIdentityValidationError {
    #[error("unsupported work identity schema {0:?}")]
    UnsupportedSchema(String),
    #[error("work identity field {0} must be non-empty")]
    EmptyField(&'static str),
    #[error("repository path must be an absolute lexical path")]
    InvalidRepositoryPath,
    #[error("repository path is not in canonical lexical form")]
    NonCanonicalRepositoryPath,
    #[error("repository label does not match its canonical path")]
    RepositoryLabelMismatch,
    #[error("display title does not match deterministic identity precedence")]
    DisplayTitleMismatch,
    #[error("live-plan work identity cannot be persisted")]
    LivePlanCannotBeStored,
}

impl WorkIdentityV1 {
    /// Validate the complete shared wire value, including deterministic path,
    /// label, and display-title derivation.
    pub fn validate(&self) -> Result<(), WorkIdentityValidationError> {
        if self.schema != WORK_IDENTITY_SCHEMA_V1 {
            return Err(WorkIdentityValidationError::UnsupportedSchema(
                self.schema.clone(),
            ));
        }
        require_nonempty("subject.id", &self.subject.id)?;
        require_nonempty("bead.id", &self.bead.id)?;
        require_optional_nonempty("bead.title", self.bead.title.as_deref())?;
        require_optional_nonempty("bead.revision", self.bead.revision.as_deref())?;
        require_context("project", self.project.as_ref())?;
        require_context("epic", self.epic.as_ref())?;
        require_nonempty("displayTitle", &self.display_title)?;
        require_nonempty("capturedAt", &self.captured_at)?;

        if let Some(repository) = &self.repository {
            require_nonempty("repository.path", &repository.path)?;
            require_nonempty("repository.label", &repository.label)?;
            let normalized = normalize_repository_path(&repository.path)
                .ok_or(WorkIdentityValidationError::InvalidRepositoryPath)?;
            if normalized != repository.path {
                return Err(WorkIdentityValidationError::NonCanonicalRepositoryPath);
            }
            if repository_label(&normalized).as_deref() != Some(repository.label.as_str()) {
                return Err(WorkIdentityValidationError::RepositoryLabelMismatch);
            }
        }

        let expected = work_display_title(
            &self.subject.id,
            self.bead.title.as_deref(),
            self.repository.as_ref().map(|value| value.label.as_str()),
            self.project.as_ref(),
            self.epic.as_ref(),
        );
        if expected != self.display_title {
            return Err(WorkIdentityValidationError::DisplayTitleMismatch);
        }
        Ok(())
    }

    /// Validate a value crossing the durable-storage boundary.
    pub fn validate_for_storage(&self) -> Result<(), WorkIdentityValidationError> {
        self.validate()?;
        if self.source == WorkIdentitySource::LivePlan {
            return Err(WorkIdentityValidationError::LivePlanCannotBeStored);
        }
        Ok(())
    }
}

fn require_nonempty(field: &'static str, value: &str) -> Result<(), WorkIdentityValidationError> {
    if value.trim().is_empty() {
        Err(WorkIdentityValidationError::EmptyField(field))
    } else {
        Ok(())
    }
}

fn require_optional_nonempty(
    field: &'static str,
    value: Option<&str>,
) -> Result<(), WorkIdentityValidationError> {
    if value.is_some_and(|value| value.trim().is_empty()) {
        Err(WorkIdentityValidationError::EmptyField(field))
    } else {
        Ok(())
    }
}

fn require_context(
    field: &'static str,
    value: Option<&WorkIdentityContextV1>,
) -> Result<(), WorkIdentityValidationError> {
    let Some(value) = value else {
        return Ok(());
    };
    require_nonempty(
        match field {
            "project" => "project.id",
            _ => "epic.id",
        },
        &value.id,
    )?;
    require_optional_nonempty(
        match field {
            "project" => "project.title",
            _ => "epic.title",
        },
        value.title.as_deref(),
    )
}

/// Canonicalize an absolute repository path without touching the filesystem.
///
/// Duplicate separators and `.` are removed; `..` pops one ordinary
/// component but never crosses the root. Relative paths and non-UTF-8 paths
/// are rejected. Symlinks are intentionally not resolved.
pub fn normalize_repository_path(path: &str) -> Option<String> {
    let path = Path::new(path);
    if !path.is_absolute() {
        return None;
    }
    let mut parts = Vec::new();
    for component in path.components() {
        match component {
            Component::RootDir => {}
            Component::CurDir => {}
            Component::ParentDir => {
                parts.pop()?;
            }
            Component::Normal(value) => parts.push(value.to_str()?.to_owned()),
            Component::Prefix(_) => return None,
        }
    }
    if parts.is_empty() {
        Some("/".to_owned())
    } else {
        Some(format!("/{}", parts.join("/")))
    }
}

/// Deterministic short repository label: the last two non-empty path
/// components, or the sole component for a one-component absolute path.
pub fn repository_label(path: &str) -> Option<String> {
    let normalized = normalize_repository_path(path)?;
    let parts: Vec<&str> = normalized
        .split('/')
        .filter(|part| !part.is_empty())
        .collect();
    match parts.as_slice() {
        [] => None,
        [only] => Some((*only).to_owned()),
        _ => Some(parts[parts.len() - 2..].join("/")),
    }
}

/// Apply one display-title precedence across durable and live projections.
///
/// Context titles precede a Bead title when it exists. Without a Bead title,
/// context precedes the canonical subject id. Repository context is appended
/// last and is never part of selection or identity joins.
pub fn work_display_title(
    subject_id: &str,
    bead_title: Option<&str>,
    repository_label: Option<&str>,
    project: Option<&WorkIdentityContextV1>,
    epic: Option<&WorkIdentityContextV1>,
) -> String {
    let context_titles = [project, epic]
        .into_iter()
        .flatten()
        .filter(|context| context.id != subject_id)
        .filter_map(|context| context.title.as_deref())
        .map(str::trim)
        .filter(|title| !title.is_empty());
    let mut parts: Vec<&str> = context_titles.collect();
    match bead_title.map(str::trim).filter(|title| !title.is_empty()) {
        Some(title) => parts.push(title),
        None => parts.push(subject_id.trim()),
    }
    let mut display = parts.join(" / ");
    if let Some(label) = repository_label
        .map(str::trim)
        .filter(|label| !label.is_empty())
    {
        display.push_str(" [");
        display.push_str(label);
        display.push(']');
    }
    display
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn enums_and_objects_fail_closed() {
        assert!(serde_json::from_str::<WorkIdentitySubjectKind>("\"packet\"").is_err());
        assert!(serde_json::from_str::<WorkIdentitySource>("\"beads\"").is_err());
        assert!(
            serde_json::from_value::<WorkIdentitySubjectV1>(serde_json::json!({
                "kind": "run",
                "id": "run-1",
                "future": true
            }))
            .is_err()
        );
    }

    #[test]
    fn repository_normalization_is_lexical_and_labels_last_two_components() {
        assert_eq!(
            normalize_repository_path("/Users/tripp//repositories/./forge/../forge"),
            Some("/Users/tripp/repositories/forge".to_owned())
        );
        assert_eq!(
            repository_label("/Users/tripp/repositories/forge"),
            Some("repositories/forge".to_owned())
        );
        assert_eq!(repository_label("/forge"), Some("forge".to_owned()));
        assert_eq!(repository_label("/"), None);
        assert_eq!(normalize_repository_path("relative/repo"), None);
        assert_eq!(normalize_repository_path("/../../etc"), None);
    }

    #[test]
    fn display_precedence_is_deterministic() {
        let project = WorkIdentityContextV1 {
            id: "project-1".to_owned(),
            title: Some("Control Plane".to_owned()),
        };
        let epic = WorkIdentityContextV1 {
            id: "epic-1".to_owned(),
            title: Some("Operations".to_owned()),
        };
        assert_eq!(
            work_display_title(
                "run-1",
                Some("Identity"),
                Some("repositories/forge"),
                Some(&project),
                Some(&epic),
            ),
            "Control Plane / Operations / Identity [repositories/forge]"
        );
        assert_eq!(
            work_display_title("run-1", None, None, Some(&project), Some(&epic)),
            "Control Plane / Operations / run-1"
        );
        assert_eq!(
            work_display_title("run-1", Some("Identity"), None, None, None),
            "Identity"
        );
        assert_eq!(work_display_title("run-1", None, None, None, None), "run-1");
    }

    #[test]
    fn validation_rejects_noncanonical_or_live_storage() {
        let mut identity = WorkIdentityV1 {
            schema: WORK_IDENTITY_SCHEMA_V1.to_owned(),
            subject: WorkIdentitySubjectV1 {
                kind: WorkIdentitySubjectKind::Run,
                id: "run-1".to_owned(),
            },
            bead: WorkIdentityBeadV1 {
                id: "bead-1".to_owned(),
                title: Some("Identity".to_owned()),
                revision: Some("opaque".to_owned()),
            },
            repository: Some(WorkIdentityRepositoryV1 {
                path: "/Users/tripp/repositories/forge".to_owned(),
                label: "repositories/forge".to_owned(),
            }),
            project: None,
            epic: None,
            display_title: "Identity [repositories/forge]".to_owned(),
            captured_at: "2026-08-14T00:00:00.000000000Z".to_owned(),
            source: WorkIdentitySource::Durable,
        };
        identity.validate_for_storage().expect("durable identity");
        identity.source = WorkIdentitySource::LivePlan;
        assert_eq!(
            identity.validate_for_storage(),
            Err(WorkIdentityValidationError::LivePlanCannotBeStored)
        );
        identity.source = WorkIdentitySource::Durable;
        identity.repository.as_mut().expect("repository").path =
            "/Users/tripp/repositories/./forge".to_owned();
        assert_eq!(
            identity.validate(),
            Err(WorkIdentityValidationError::NonCanonicalRepositoryPath)
        );
    }
}
