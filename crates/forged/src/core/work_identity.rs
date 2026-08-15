//! One construction and read path for operator-facing durable identity.
//!
//! Canonical ids remain selectors. Titles and repository labels are display
//! data captured at creation; no projection re-reads Beads to reconstruct
//! them after the fact.

use forged_types::{
    normalize_repository_path, repository_label, work_display_title, WorkIdentityBeadV1,
    WorkIdentityContextV1, WorkIdentityRepositoryV1, WorkIdentitySource, WorkIdentitySubjectKind,
    WorkIdentitySubjectV1, WorkIdentityV1, WORK_IDENTITY_SCHEMA_V1,
};
use serde_json::{Map, Value};

use crate::config::now_iso;
use crate::core::{on_ledger, Ctx, Failure};

/// Normalize one launch-time repository path without consulting the live
/// filesystem. Renaming or replacing a checkout later cannot rewrite the
/// identity stored for historical work.
pub(crate) fn canonical_repository(raw: &str) -> Result<String, Failure> {
    normalize_repository_path(raw).ok_or_else(|| {
        Failure::invalid(format!(
            "repository must be an absolute path that does not escape its root, got {raw:?}"
        ))
    })
}

/// Read an optional `{prefix}Id` / `{prefix}Title` context pair from an
/// internal creation request. A title without a canonical id is never
/// promoted into identity: display text cannot become a join key.
pub(crate) fn context_from_params(
    params: &Map<String, Value>,
    prefix: &str,
) -> Option<WorkIdentityContextV1> {
    let id = params
        .get(&format!("{prefix}Id"))
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())?;
    let title = params
        .get(&format!("{prefix}Title"))
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_owned);
    Some(WorkIdentityContextV1 {
        id: id.to_owned(),
        title,
    })
}

#[allow(clippy::too_many_arguments)]
pub(crate) fn durable_identity(
    kind: WorkIdentitySubjectKind,
    subject_id: &str,
    bead_id: &str,
    bead_title: Option<&str>,
    bead_revision: Option<&str>,
    repository_path: Option<&str>,
    project: Option<WorkIdentityContextV1>,
    epic: Option<WorkIdentityContextV1>,
) -> Result<WorkIdentityV1, Failure> {
    identity(
        WorkIdentitySource::Durable,
        kind,
        subject_id,
        bead_id,
        bead_title,
        bead_revision,
        repository_path,
        project,
        epic,
        None,
    )
}

#[allow(clippy::too_many_arguments)]
pub(crate) fn live_plan_identity(
    kind: WorkIdentitySubjectKind,
    subject_id: &str,
    bead_id: &str,
    bead_title: Option<&str>,
    bead_revision: Option<&str>,
    repository_path: Option<&str>,
    project: Option<WorkIdentityContextV1>,
    epic: Option<WorkIdentityContextV1>,
    captured_at: &str,
) -> Result<WorkIdentityV1, Failure> {
    identity(
        WorkIdentitySource::LivePlan,
        kind,
        subject_id,
        bead_id,
        bead_title,
        bead_revision,
        repository_path,
        project,
        epic,
        Some(captured_at),
    )
}

#[allow(clippy::too_many_arguments)]
fn identity(
    source: WorkIdentitySource,
    kind: WorkIdentitySubjectKind,
    subject_id: &str,
    bead_id: &str,
    bead_title: Option<&str>,
    bead_revision: Option<&str>,
    repository_path: Option<&str>,
    project: Option<WorkIdentityContextV1>,
    epic: Option<WorkIdentityContextV1>,
    captured_at: Option<&str>,
) -> Result<WorkIdentityV1, Failure> {
    let repository = repository_path
        .map(|path| -> Result<WorkIdentityRepositoryV1, Failure> {
            let path = canonical_repository(path)?;
            let label = repository_label(&path).ok_or_else(|| {
                Failure::invalid(format!(
                    "repository path has no deterministic label: {path:?}"
                ))
            })?;
            Ok(WorkIdentityRepositoryV1 { path, label })
        })
        .transpose()?;
    let title = bead_title
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_owned);
    let revision = bead_revision
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_owned);
    let display_title = work_display_title(
        subject_id,
        title.as_deref(),
        repository.as_ref().map(|value| value.label.as_str()),
        project.as_ref(),
        epic.as_ref(),
    );
    let identity = WorkIdentityV1 {
        schema: WORK_IDENTITY_SCHEMA_V1.to_owned(),
        subject: WorkIdentitySubjectV1 {
            kind,
            id: subject_id.to_owned(),
        },
        bead: WorkIdentityBeadV1 {
            id: bead_id.to_owned(),
            title,
            revision,
        },
        repository,
        project,
        epic,
        display_title,
        captured_at: captured_at.map(str::to_owned).unwrap_or_else(now_iso),
        source,
    };
    if source == WorkIdentitySource::LivePlan {
        identity.validate()
    } else {
        identity.validate_for_storage()
    }
    .map_err(|error| Failure::invalid(format!("invalid work identity: {error}")))?;
    Ok(identity)
}

/// Load the one durable identity a projection must share. Missing identity
/// is corruption after migration 015, not permission to consult Beads.
pub(crate) async fn load(
    ctx: &Ctx,
    kind: WorkIdentitySubjectKind,
    id: &str,
) -> Result<WorkIdentityV1, Failure> {
    let id = id.to_owned();
    let query_id = id.clone();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.get_work_identity(kind, &query_id)
    })
    .await?
    .ok_or_else(|| Failure::internal(format!("{kind:?} {id:?} has no durable work identity")))
}
