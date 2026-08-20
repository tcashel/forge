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

/// Which authority answered for one operator row's display title.
///
/// The wire strings are part of the contract and are pinned explicitly; the
/// derived form would emit `beadsLive` and falsify the seam consumers read.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum WorkTitleSource {
    /// The frozen `identity.displayTitle` already carried a Bead title.
    #[serde(rename = "identity.displayTitle")]
    Identity,
    /// A current bounded Beads read answered for an identity that froze
    /// without a title.
    #[serde(rename = "beads.title")]
    BeadsLive,
    /// No authority ever titled this work; `value` is the id form.
    #[serde(rename = "unknown")]
    Unknown,
}

/// One resolved display title, beside — never instead of — frozen identity.
///
/// `known == false` is the only way to distinguish "no authority ever titled
/// this" from "we have a title", and is what lets a consumer render the id
/// form as an id rather than present it as a title.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkTitleV1 {
    pub known: bool,
    pub value: String,
    pub source: WorkTitleSource,
    pub bead_id: String,
}

/// Resolve one display title for an operator row without rewriting identity.
///
/// A frozen Bead title wins and yields `identity.display_title` verbatim, so
/// the sibling can never contradict launch evidence. Only an identity that
/// froze titleless consults `live`, and it is formatted through
/// [`work_display_title`] so both title strings format identically.
pub fn resolve_work_title(identity: &WorkIdentityV1, live: Option<&str>) -> WorkTitleV1 {
    let frozen = identity
        .bead
        .title
        .as_deref()
        .map(str::trim)
        .filter(|title| !title.is_empty());
    if frozen.is_some() {
        return WorkTitleV1 {
            known: true,
            value: identity.display_title.clone(),
            source: WorkTitleSource::Identity,
            bead_id: identity.bead.id.clone(),
        };
    }
    match live.map(str::trim).filter(|title| !title.is_empty()) {
        Some(title) => WorkTitleV1 {
            known: true,
            value: work_display_title(
                &identity.subject.id,
                Some(title),
                identity
                    .repository
                    .as_ref()
                    .map(|value| value.label.as_str()),
                identity.project.as_ref(),
                identity.epic.as_ref(),
            ),
            source: WorkTitleSource::BeadsLive,
            bead_id: identity.bead.id.clone(),
        },
        None => WorkTitleV1 {
            known: false,
            value: identity.display_title.clone(),
            source: WorkTitleSource::Unknown,
            bead_id: identity.bead.id.clone(),
        },
    }
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

    fn titleless_identity() -> WorkIdentityV1 {
        let epic = WorkIdentityContextV1 {
            id: "epic-1".to_owned(),
            title: Some("Operations".to_owned()),
        };
        WorkIdentityV1 {
            schema: WORK_IDENTITY_SCHEMA_V1.to_owned(),
            subject: WorkIdentitySubjectV1 {
                kind: WorkIdentitySubjectKind::Run,
                id: "run-1".to_owned(),
            },
            bead: WorkIdentityBeadV1 {
                id: "bead-1".to_owned(),
                title: None,
                revision: None,
            },
            repository: Some(WorkIdentityRepositoryV1 {
                path: "/Users/tripp/repositories/forge".to_owned(),
                label: "repositories/forge".to_owned(),
            }),
            project: None,
            epic: Some(epic),
            display_title: "Operations / run-1 [repositories/forge]".to_owned(),
            captured_at: "2026-08-19T00:00:00.000000000Z".to_owned(),
            source: WorkIdentitySource::LegacyFallback,
        }
    }

    #[test]
    fn a_frozen_title_wins_and_never_contradicts_identity() {
        let mut identity = titleless_identity();
        identity.bead.title = Some("Frozen".to_owned());
        identity.display_title = work_display_title(
            "run-1",
            Some("Frozen"),
            Some("repositories/forge"),
            None,
            identity.epic.as_ref(),
        );
        let resolved = resolve_work_title(&identity, Some("Renamed since launch"));
        assert_eq!(resolved.source, WorkTitleSource::Identity);
        assert_eq!(resolved.value, identity.display_title);
        assert!(resolved.known);
        assert_eq!(resolved.bead_id, "bead-1");
    }

    #[test]
    fn a_live_title_is_formatted_exactly_as_identity_would_have_frozen_it() {
        let identity = titleless_identity();
        let resolved = resolve_work_title(&identity, Some("Repair the bead read"));
        assert_eq!(resolved.source, WorkTitleSource::BeadsLive);
        assert!(resolved.known);
        assert_eq!(
            resolved.value,
            work_display_title(
                &identity.subject.id,
                Some("Repair the bead read"),
                identity
                    .repository
                    .as_ref()
                    .map(|value| value.label.as_str()),
                identity.project.as_ref(),
                identity.epic.as_ref(),
            )
        );
        // No authority answers, so the id form is reported as unknown rather
        // than presented as a title.
        let blank = resolve_work_title(&identity, Some("   "));
        assert_eq!(blank.source, WorkTitleSource::Unknown);
        assert!(!blank.known);
        assert_eq!(blank.value, identity.display_title);
    }

    #[test]
    fn the_three_title_sources_serialize_to_their_pinned_wire_strings() {
        for (source, wire) in [
            (WorkTitleSource::Identity, "\"identity.displayTitle\""),
            (WorkTitleSource::BeadsLive, "\"beads.title\""),
            (WorkTitleSource::Unknown, "\"unknown\""),
        ] {
            assert_eq!(serde_json::to_string(&source).expect("closed source"), wire);
            assert_eq!(
                serde_json::from_str::<WorkTitleSource>(wire).expect("closed source"),
                source
            );
        }
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
