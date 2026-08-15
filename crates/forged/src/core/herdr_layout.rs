//! Durable per-subject Herdr tab setup, exact placement, and root cleanup.
//!
//! Layout is presentation: every failure here retains the already-selected
//! Herdr transport and never changes provider/controller settlement.

use std::collections::HashMap;
use std::fs::{File, OpenOptions};
use std::io::ErrorKind;
use std::path::Path;
use std::time::Duration;

use forged_host::{
    HerdrCloseOutcome, HerdrControl, HerdrHost, HerdrLayoutInspection, HerdrLayoutTarget,
    HerdrSessionIdentity, HerdrTabCreateError, PreparedSession, HERDR_PROTOCOL_VERSION,
};
use forged_ledger::{
    HerdrLayoutCleanupRelease, HerdrLayoutCleanupRetry, HerdrLayoutCreation,
    HerdrLayoutDegradationReason, HerdrLayoutRow,
};
use forged_types::{
    HerdrLayoutSubjectKind, HerdrLayoutSubjectV1, HerdrLayoutV1, WorkIdentitySubjectKind,
    HERDR_LAYOUT_LABEL_MAX_BYTES, HERDR_LAYOUT_SCHEMA_V1,
};
use fs2::FileExt;
use serde_json::{json, Value};

use crate::config::now_iso;
use crate::core::{on_ledger, Ctx};

const CREATION_LEASE_SECONDS: u64 = 30;
const MUTATION_LEASE_SECONDS: u64 = 30;
const CLEANUP_LEASE_SECONDS: u64 = 60;
const CLEANUP_LIMIT: u32 = 128;
// A successful prepare may spend up to three seconds waiting for the pane's
// shell before ownership can commit. Give ordinary concurrent creators and
// splitters enough time to observe that commit instead of immediately
// degrading into an untargeted workspace split. A crashed holder still
// degrades after a bounded five seconds rather than blocking for its full
// 30-second lease.
const CONTENDED_POLLS: usize = 100;
const CONTENDED_POLL: Duration = Duration::from_millis(50);
const WORKSPACE_LOCK_POLLS: usize = 400;
const DEGRADED_EVENT: &str = "forged.herdr.layout.degraded";

/// A mutation lease held through prepare and durable pane registration.
pub(crate) struct MutationLease {
    layout_id: String,
    token: String,
}

/// Cross-process fence for the pre-existing repository workspace's
/// list-or-create seam. Herdr labels are presentation and are not unique, so
/// two subjects must not both observe an absent label and create duplicates.
/// The file contains no authority and an OS-released crash cannot strand it.
struct WorkspaceResolutionLock(File);

impl Drop for WorkspaceResolutionLock {
    fn drop(&mut self) {
        let _ = FileExt::unlock(&self.0);
    }
}

async fn acquire_workspace_resolution(
    ctx: &Ctx,
    socket_path: &Path,
    workspace_label: &str,
) -> Result<WorkspaceResolutionLock, String> {
    let key = uuid::Uuid::new_v5(
        &uuid::Uuid::NAMESPACE_OID,
        format!("{}\0{workspace_label}", socket_path.to_string_lossy()).as_bytes(),
    );
    let directory = ctx.config.anvil_home.join("runtime/workspace-locks");
    std::fs::create_dir_all(&directory)
        .map_err(|error| format!("creating workspace lock directory: {error}"))?;
    let file = OpenOptions::new()
        .create(true)
        .truncate(false)
        .read(true)
        .write(true)
        .open(directory.join(format!("{key}.lock")))
        .map_err(|error| format!("opening workspace lock: {error}"))?;
    for poll in 0..WORKSPACE_LOCK_POLLS {
        match file.try_lock_exclusive() {
            Ok(()) => return Ok(WorkspaceResolutionLock(file)),
            Err(error)
                if matches!(error.kind(), ErrorKind::WouldBlock)
                    && poll + 1 < WORKSPACE_LOCK_POLLS =>
            {
                tokio::time::sleep(CONTENDED_POLL).await;
            }
            Err(error) if matches!(error.kind(), ErrorKind::WouldBlock) => {
                return Err(
                    "repository workspace resolution remained contended for twenty seconds"
                        .to_owned(),
                )
            }
            Err(error) => return Err(format!("locking repository workspace resolution: {error}")),
        }
    }
    unreachable!("bounded workspace lock loop returns on its final attempt")
}

fn deadline_after(anchor: &str, seconds: u64) -> Option<String> {
    let timestamp = anchor.parse::<jiff::Timestamp>().ok()?;
    let nanos = i128::from(seconds).saturating_mul(1_000_000_000);
    let deadline =
        jiff::Timestamp::from_nanosecond(timestamp.as_nanosecond().saturating_add(nanos)).ok()?;
    Some(forged_proto::widen_rfc3339(&deadline.to_string()))
}

fn work_kind(kind: HerdrLayoutSubjectKind) -> WorkIdentitySubjectKind {
    match kind {
        HerdrLayoutSubjectKind::Run => WorkIdentitySubjectKind::Run,
        HerdrLayoutSubjectKind::Epic => WorkIdentitySubjectKind::Epic,
    }
}

fn truncate_utf8(value: &str, limit: usize) -> &str {
    if value.len() <= limit {
        return value;
    }
    let mut end = limit;
    while !value.is_char_boundary(end) {
        end = end.saturating_sub(1);
    }
    &value[..end]
}

fn display_label(display_title: &str, subject: &HerdrLayoutSubjectV1) -> String {
    let suffix = format!(" [{}:{}]", subject.kind.as_str(), subject.id);
    if suffix.len() >= HERDR_LAYOUT_LABEL_MAX_BYTES {
        return truncate_utf8(suffix.trim(), HERDR_LAYOUT_LABEL_MAX_BYTES).to_owned();
    }
    let available = HERDR_LAYOUT_LABEL_MAX_BYTES - suffix.len();
    format!(
        "{}{}",
        truncate_utf8(display_title.trim(), available),
        suffix
    )
}

async fn record_degradation(ctx: &Ctx, subject: &HerdrLayoutSubjectV1, detail: impl Into<String>) {
    let id = subject.id.clone();
    let kind = subject.kind.as_str().to_owned();
    let detail = truncate_utf8(&detail.into(), 2_048).to_owned();
    let _ = on_ledger(&ctx.ledger, move |ledger| {
        ledger.append_event(
            Some(&id),
            DEGRADED_EVENT,
            json!({
                "schema": "forged.herdr-layout.degradation/1",
                "subject": {"kind": kind, "id": id},
                "detail": detail,
            }),
        )
    })
    .await;
}

async fn best_effort_close_root(row: &HerdrLayoutRow, root_pane_id: &str) {
    if root_pane_id.is_empty() {
        return;
    }
    let identity =
        HerdrSessionIdentity::from_durable(root_pane_id, row.socket_path.clone(), row.protocol);
    if let Ok(control) = HerdrControl::connect_for(&identity).await {
        let _ = control.close_owned(&identity).await;
    }
}

async fn degrade_creation(
    ctx: &Ctx,
    row: &HerdrLayoutRow,
    token: &str,
    reason: HerdrLayoutDegradationReason,
    detail: &str,
    locator: Option<(&str, &str)>,
) {
    let id = row.layout_id.clone();
    let token = token.to_owned();
    let detail_owned = truncate_utf8(detail, 2_048).to_owned();
    let locator = locator.map(|(tab, root)| (tab.to_owned(), root.to_owned()));
    let _ = on_ledger(&ctx.ledger, move |ledger| {
        ledger.degrade_herdr_layout_creation(
            &id,
            &token,
            reason,
            &detail_owned,
            locator
                .as_ref()
                .map(|(tab, root)| (tab.as_str(), root.as_str())),
        )
    })
    .await;
}

async fn create_reserved(
    ctx: &Ctx,
    host: &HerdrHost,
    row: HerdrLayoutRow,
    creation_token: &str,
    cwd: &Path,
    env: &HashMap<String, String>,
) -> Option<HerdrLayoutRow> {
    let created = match host
        .create_layout_tab(&row.workspace_id, &row.display_label, cwd, env)
        .await
    {
        Ok(created) => created,
        Err(HerdrTabCreateError::Refused(error)) => {
            let detail = error.to_string();
            degrade_creation(
                ctx,
                &row,
                creation_token,
                HerdrLayoutDegradationReason::RegistrationFailed,
                &detail,
                None,
            )
            .await;
            record_degradation(ctx, &row_subject(&row), detail).await;
            return None;
        }
        Err(HerdrTabCreateError::Ambiguous(error)) => {
            let detail = error.to_string();
            degrade_creation(
                ctx,
                &row,
                creation_token,
                HerdrLayoutDegradationReason::CreationAmbiguous,
                &detail,
                None,
            )
            .await;
            record_degradation(ctx, &row_subject(&row), detail).await;
            return None;
        }
    };
    let complete = !created.tab_id.is_empty() && !created.root_pane_id.is_empty();
    if created.workspace_id != row.workspace_id || !complete {
        let detail = "tab.create returned coordinates outside the reserved workspace or incomplete exact ids";
        if complete {
            best_effort_close_root(&row, &created.root_pane_id).await;
        }
        degrade_creation(
            ctx,
            &row,
            creation_token,
            HerdrLayoutDegradationReason::RegistrationFailed,
            detail,
            complete.then_some((created.tab_id.as_str(), created.root_pane_id.as_str())),
        )
        .await;
        record_degradation(ctx, &row_subject(&row), detail).await;
        return None;
    }
    let identity = HerdrLayoutV1 {
        schema: HERDR_LAYOUT_SCHEMA_V1.to_owned(),
        layout_id: row.layout_id.clone(),
        revision: row.revision,
        subject: row_subject(&row),
        socket_path: row.socket_path.clone(),
        protocol: row.protocol,
        workspace_id: row.workspace_id.clone(),
        tab_id: created.tab_id.clone(),
        root_pane_id: created.root_pane_id.clone(),
        display_label: row.display_label.clone(),
        predecessor_layout_id: row.predecessor_layout_id.clone(),
    };
    let token = creation_token.to_owned();
    let registered = on_ledger(&ctx.ledger, move |ledger| {
        ledger.register_herdr_layout(&identity, &token)
    })
    .await;
    match registered {
        Ok(row) => Some(row),
        Err(error) => {
            best_effort_close_root(&row, &created.root_pane_id).await;
            let detail = format!("persisting exact tab/root coordinates failed: {error}");
            degrade_creation(
                ctx,
                &row,
                creation_token,
                HerdrLayoutDegradationReason::RegistrationFailed,
                &detail,
                Some((created.tab_id.as_str(), created.root_pane_id.as_str())),
            )
            .await;
            record_degradation(ctx, &row_subject(&row), detail).await;
            None
        }
    }
}

fn row_subject(row: &HerdrLayoutRow) -> HerdrLayoutSubjectV1 {
    HerdrLayoutSubjectV1 {
        kind: row.subject_kind,
        id: row.subject_id.clone(),
    }
}

async fn verify_registered(
    host: &HerdrHost,
    row: &HerdrLayoutRow,
    current_workspace_id: &str,
) -> Result<(), HerdrLayoutDegradationReason> {
    if row.workspace_id != current_workspace_id {
        return Err(HerdrLayoutDegradationReason::VerificationMismatch);
    }
    let Some(root) = row.root_pane_id.as_deref() else {
        return Err(HerdrLayoutDegradationReason::VerificationMismatch);
    };
    match host.inspect_layout(root).await {
        Ok(HerdrLayoutInspection::Missing) => {
            Err(HerdrLayoutDegradationReason::VerificationMissing)
        }
        Ok(HerdrLayoutInspection::Present(snapshot))
            if snapshot.workspace_id == row.workspace_id
                && row.tab_id.as_deref() == Some(snapshot.tab_id.as_str())
                && snapshot.panes.iter().any(|pane| pane.pane_id == root) =>
        {
            Ok(())
        }
        Ok(HerdrLayoutInspection::Present(_)) => {
            Err(HerdrLayoutDegradationReason::VerificationMismatch)
        }
        Err(_) => Err(HerdrLayoutDegradationReason::PlacementFailed),
    }
}

async fn await_contended_registration(ctx: &Ctx, row: &HerdrLayoutRow) -> Option<HerdrLayoutRow> {
    for _ in 0..CONTENDED_POLLS {
        tokio::time::sleep(CONTENDED_POLL).await;
        let query_subject = row_subject(row);
        let query_socket = row.socket_path.clone();
        let protocol = row.protocol;
        if let Ok(Some(current)) = on_ledger(&ctx.ledger, move |ledger| {
            ledger.get_active_herdr_layout(query_subject, &query_socket, protocol)
        })
        .await
        {
            if current.lifecycle_state == forged_ledger::HerdrLayoutLifecycleState::Registered {
                return Some(current);
            }
        }
    }
    None
}

/// Add a durable layout target to an already-selected Herdr host. Every
/// failure returns the same host without a target, preserving HostPolicy.
pub(crate) async fn configure(
    ctx: &Ctx,
    host: HerdrHost,
    fallback_workspace_label: &str,
    subject: HerdrLayoutSubjectV1,
    cwd: &Path,
    env: &HashMap<String, String>,
) -> (HerdrHost, Option<MutationLease>) {
    let identity = match super::work_identity::load(ctx, work_kind(subject.kind), &subject.id).await
    {
        Ok(identity) => identity,
        Err(error) => {
            record_degradation(ctx, &subject, error.to_string()).await;
            return (host, None);
        }
    };
    // An epic child can only join the parent epic's frozen repository
    // workspace. The child run's cwd is execution input, not authority to
    // move a durable epic layout between workspaces.
    let workspace_label = identity
        .repository
        .as_ref()
        .and_then(|repository| crate::adapters::execute::workspace_label_for_repo(&repository.path))
        .unwrap_or_else(|| fallback_workspace_label.to_owned());
    let host = host.with_workspace(workspace_label.clone());
    let workspace_guard =
        match acquire_workspace_resolution(ctx, host.socket_path(), &workspace_label).await {
            Ok(guard) => guard,
            Err(error) => {
                record_degradation(ctx, &subject, error).await;
                return (host, None);
            }
        };
    let workspace_id = match host.ensure_workspace(&workspace_label).await {
        Ok(id) => id,
        Err(error) => {
            drop(workspace_guard);
            record_degradation(ctx, &subject, error.to_string()).await;
            return (host, None);
        }
    };
    drop(workspace_guard);
    let label = display_label(&identity.display_title, &subject);
    let creation_token = format!("layout-create:{}", uuid::Uuid::now_v7());
    let now = now_iso();
    let Some(lease_until) = deadline_after(&now, CREATION_LEASE_SECONDS) else {
        record_degradation(ctx, &subject, "could not calculate layout creation lease").await;
        return (host, None);
    };
    let reserve_subject = subject.clone();
    let socket_path = match host.socket_path().to_str() {
        Some(path) => path.to_owned(),
        None => {
            record_degradation(ctx, &subject, "Herdr socket path is not UTF-8").await;
            return (host, None);
        }
    };
    let mut creation = match on_ledger(&ctx.ledger, {
        let socket_path = socket_path.clone();
        let workspace_id = workspace_id.clone();
        let label = label.clone();
        let creation_token = creation_token.clone();
        let now = now.clone();
        let lease_until = lease_until.clone();
        move |ledger| {
            ledger.reserve_herdr_layout_creation(
                reserve_subject,
                &socket_path,
                HERDR_PROTOCOL_VERSION,
                &workspace_id,
                &label,
                &creation_token,
                &now,
                &lease_until,
            )
        }
    })
    .await
    {
        Ok(value) => value,
        Err(error) => {
            record_degradation(ctx, &subject, error.to_string()).await;
            return (host, None);
        }
    };

    let mut replacement_attempted = false;
    let row = match creation {
        HerdrLayoutCreation::Reserved(row) => {
            let Some(row) = create_reserved(ctx, &host, row, &creation_token, cwd, env).await
            else {
                return (host, None);
            };
            row
        }
        HerdrLayoutCreation::Existing(row) => row,
        HerdrLayoutCreation::Contended(row) => {
            let Some(resolved) = await_contended_registration(ctx, &row).await else {
                record_degradation(
                    ctx,
                    &subject,
                    format!("layout creation remains contended by {}", row.layout_id),
                )
                .await;
                return (host, None);
            };
            resolved
        }
    };
    let registered = match verify_registered(&host, &row, &workspace_id).await {
        Ok(()) => row,
        Err(HerdrLayoutDegradationReason::PlacementFailed) => {
            record_degradation(
                ctx,
                &subject,
                "exact pane.layout verification was unavailable; retained standing layout without replacement",
            )
            .await;
            return (host, None);
        }
        Err(reason) if !replacement_attempted => {
            replacement_attempted = true;
            let detail = match reason {
                HerdrLayoutDegradationReason::VerificationMissing => {
                    "exact durable root returned pane_not_found"
                }
                _ => "exact pane.layout did not match durable workspace/tab/root",
            };
            let replacement_token = format!("layout-replace:{}", uuid::Uuid::now_v7());
            let replace_now = now_iso();
            let Some(replace_lease) = deadline_after(&replace_now, CREATION_LEASE_SECONDS) else {
                record_degradation(ctx, &subject, detail).await;
                return (host, None);
            };
            let row_id = row.layout_id.clone();
            let workspace = workspace_id.clone();
            let token = replacement_token.clone();
            let detail_owned = detail.to_owned();
            creation = match on_ledger(&ctx.ledger, move |ledger| {
                ledger.replace_herdr_layout(
                    &row_id,
                    reason,
                    &detail_owned,
                    &workspace,
                    &token,
                    &replace_now,
                    &replace_lease,
                )
            })
            .await
            {
                Ok(value) => value,
                Err(error) => {
                    record_degradation(ctx, &subject, error.to_string()).await;
                    return (host, None);
                }
            };
            // A replacement owns a distinct reservation token and the helper
            // never recurses, enforcing exactly one replacement per configure.
            return configure_reserved_replacement(
                ctx,
                host,
                creation,
                replacement_token,
                subject,
                workspace_id,
                cwd,
                env,
                replacement_attempted,
            )
            .await;
        }
        Err(_) => {
            record_degradation(
                ctx,
                &subject,
                "replacement layout failed exact verification",
            )
            .await;
            return (host, None);
        }
    };
    target_with_mutation(ctx, host, registered, subject).await
}

#[allow(clippy::too_many_arguments)]
async fn configure_reserved_replacement(
    ctx: &Ctx,
    host: HerdrHost,
    creation: HerdrLayoutCreation,
    creation_token: String,
    subject: HerdrLayoutSubjectV1,
    workspace_id: String,
    cwd: &Path,
    env: &HashMap<String, String>,
    replacement_attempted: bool,
) -> (HerdrHost, Option<MutationLease>) {
    if !replacement_attempted {
        record_degradation(ctx, &subject, "layout replacement was not durably bounded").await;
        return (host, None);
    }
    let row = match creation {
        HerdrLayoutCreation::Reserved(row) => row,
        HerdrLayoutCreation::Existing(row) => row,
        HerdrLayoutCreation::Contended(contended) => {
            let Some(registered) = await_contended_registration(ctx, &contended).await else {
                record_degradation(
                    ctx,
                    &subject,
                    "replacement layout reservation remained contended for five seconds",
                )
                .await;
                return (host, None);
            };
            registered
        }
    };
    let row = if row.lifecycle_state == forged_ledger::HerdrLayoutLifecycleState::Registered {
        row
    } else {
        let Some(row) = create_reserved(ctx, &host, row, &creation_token, cwd, env).await else {
            return (host, None);
        };
        row
    };
    if verify_registered(&host, &row, &workspace_id).await.is_err() {
        record_degradation(
            ctx,
            &subject,
            "replacement layout failed exact verification",
        )
        .await;
        return (host, None);
    }
    target_with_mutation(ctx, host, row, subject).await
}

async fn target_with_mutation(
    ctx: &Ctx,
    host: HerdrHost,
    row: HerdrLayoutRow,
    subject: HerdrLayoutSubjectV1,
) -> (HerdrHost, Option<MutationLease>) {
    let token = format!("layout-mutate:{}", uuid::Uuid::now_v7());
    let mut claimed = None;
    for poll in 0..CONTENDED_POLLS {
        let now = now_iso();
        let Some(lease_until) = deadline_after(&now, MUTATION_LEASE_SECONDS) else {
            record_degradation(ctx, &subject, "could not calculate layout mutation lease").await;
            return (host, None);
        };
        let row_id = row.layout_id.clone();
        let claim_token = token.clone();
        match on_ledger(&ctx.ledger, move |ledger| {
            ledger.claim_herdr_layout_mutation(&row_id, &claim_token, &now, &lease_until)
        })
        .await
        {
            Ok(Some(row)) => {
                claimed = Some(row);
                break;
            }
            Ok(None) if poll + 1 < CONTENDED_POLLS => {
                tokio::time::sleep(CONTENDED_POLL).await;
            }
            Ok(None) => {}
            Err(error) => {
                record_degradation(ctx, &subject, error.to_string()).await;
                return (host, None);
            }
        }
    }
    let Some(claimed) = claimed else {
        record_degradation(
            ctx,
            &subject,
            "layout mutation lease remained contended for five seconds",
        )
        .await;
        return (host, None);
    };
    let layout_id = claimed.layout_id.clone();
    let pane_layout_id = layout_id.clone();
    let owned = on_ledger(&ctx.ledger, move |ledger| {
        ledger.list_unreleased_owned_panes_for_layout(&pane_layout_id)
    })
    .await;
    let owned = match owned {
        Ok(owned) => owned,
        Err(error) => {
            let finish_id = layout_id.clone();
            let finish_token = token.clone();
            let _ = on_ledger(&ctx.ledger, move |ledger| {
                ledger.finish_herdr_layout_mutation(
                    &finish_id,
                    &finish_token,
                    Some("could not read exact owned panes"),
                )
            })
            .await;
            record_degradation(ctx, &subject, error.to_string()).await;
            return (host, None);
        }
    };
    let identity = match claimed.identity() {
        Ok(identity) => identity,
        Err(error) => {
            let detail = error.to_string();
            finish_mutation(
                ctx,
                Some(MutationLease {
                    layout_id: layout_id.clone(),
                    token: token.clone(),
                }),
                None,
                Some(&detail),
            )
            .await;
            record_degradation(ctx, &subject, detail).await;
            return (host, None);
        }
    };
    let target = match HerdrLayoutTarget::new(
        identity.layout_id.clone(),
        identity.workspace_id,
        identity.tab_id,
        identity.root_pane_id,
        owned,
    ) {
        Ok(target) => target,
        Err(error) => {
            let detail = error.to_string();
            finish_mutation(
                ctx,
                Some(MutationLease {
                    layout_id: layout_id.clone(),
                    token: token.clone(),
                }),
                None,
                Some(&detail),
            )
            .await;
            record_degradation(ctx, &subject, detail).await;
            return (host, None);
        }
    };
    (
        host.with_layout(target),
        Some(MutationLease { layout_id, token }),
    )
}

/// Release the durable geometry lease after ownership registration (or
/// rollback). Failure is diagnostic-only and never changes the session result.
pub(crate) async fn finish_mutation(
    ctx: &Ctx,
    lease: Option<MutationLease>,
    prepared: Option<&PreparedSession>,
    prepare_error: Option<&str>,
) {
    let Some(lease) = lease else {
        return;
    };
    let degradation = prepared
        .and_then(PreparedSession::herdr_layout_degradation)
        .or(prepare_error)
        .map(|detail| truncate_utf8(detail, 2_048).to_owned());
    let _ = on_ledger(&ctx.ledger, move |ledger| {
        ledger.finish_herdr_layout_mutation(&lease.layout_id, &lease.token, degradation.as_deref())
    })
    .await;
}

fn row_json(row: &HerdrLayoutRow) -> Value {
    json!({
        "layoutId": row.layout_id,
        "revision": row.revision,
        "subject": {"kind": row.subject_kind.as_str(), "id": row.subject_id},
        "endpoint": {"socketPath": row.socket_path, "protocol": row.protocol},
        "workspaceId": row.workspace_id,
        "tabId": row.tab_id,
        "rootPaneId": row.root_pane_id,
        "displayLabel": row.display_label,
        "lifecycle": row.lifecycle_state.as_str(),
        "degradationReason": row.degradation_reason.map(|reason| reason.as_str()),
        "lastError": row.last_error,
        "predecessorLayoutId": row.predecessor_layout_id,
        "cleanup": {
            "state": row.cleanup_state.as_str(),
            "reason": row.cleanup_reason.map(|reason| reason.as_str()),
            "release": row.cleanup_release.map(|release| release.as_str()),
            "retryUsed": row.cleanup_retry_used,
            "retryBudget": row.cleanup_retry_budget,
            "nextWakeAt": row.next_cleanup_at,
            "lastError": row.last_cleanup_error,
        },
    })
}

pub(crate) async fn status(ctx: &Ctx, subject: HerdrLayoutSubjectV1) -> Value {
    let projection_kind = match subject.kind {
        HerdrLayoutSubjectKind::Run => WorkIdentitySubjectKind::Run,
        HerdrLayoutSubjectKind::Epic => WorkIdentitySubjectKind::Epic,
    };
    let projections =
        super::herdr_projection::status_for_subject(ctx, projection_kind, &subject.id).await;
    match on_ledger(&ctx.ledger, move |ledger| {
        ledger.list_herdr_layouts_for_subject(subject)
    })
    .await
    {
        Ok(rows) => {
            let active = rows
                .iter()
                .rev()
                .find(|row| {
                    matches!(
                        row.lifecycle_state,
                        forged_ledger::HerdrLayoutLifecycleState::Creating
                            | forged_ledger::HerdrLayoutLifecycleState::Registered
                    )
                })
                .map(row_json)
                .unwrap_or(Value::Null);
            json!({
                "schema": "forged.herdr-layout.status/1",
                "active": active,
                "history": rows.iter().map(row_json).collect::<Vec<_>>(),
                "projections": projections,
            })
        }
        Err(error) => json!({
            "schema": "forged.herdr-layout.status/1",
            "active": Value::Null,
            "history": [],
            "projections": projections,
            "error": error.to_string(),
        }),
    }
}

/// Reconcile independently-safe layout roots after pane cleanup.
pub(crate) async fn reconcile(ctx: &Ctx) -> Value {
    let requested = on_ledger(&ctx.ledger, |ledger| {
        ledger.request_ready_herdr_layout_cleanup()
    })
    .await;
    let requested = match requested {
        Ok(rows) => rows,
        Err(error) => {
            return json!({
                "schema": "forged.herdr-layout-cleanup.report/1",
                "requested": 0,
                "effects": [],
                "error": error.to_string(),
            })
        }
    };
    let now = now_iso();
    let due_now = now.clone();
    let due = match on_ledger(&ctx.ledger, move |ledger| {
        ledger.list_due_herdr_layout_cleanup(&due_now, CLEANUP_LIMIT)
    })
    .await
    {
        Ok(rows) => rows,
        Err(error) => {
            return json!({
                "schema": "forged.herdr-layout-cleanup.report/1",
                "requested": requested.len(),
                "effects": [],
                "error": error.to_string(),
            })
        }
    };
    let mut effects = Vec::new();
    for row in due {
        let token = format!("layout-cleanup:{}", uuid::Uuid::now_v7());
        let claim_now = now_iso();
        let Some(lease_until) = deadline_after(&claim_now, CLEANUP_LEASE_SECONDS) else {
            continue;
        };
        let id = row.layout_id.clone();
        let claim_token = token.clone();
        let claimed = on_ledger(&ctx.ledger, move |ledger| {
            ledger.claim_herdr_layout_cleanup(&id, &claim_token, &claim_now, &lease_until)
        })
        .await;
        let Ok(Some(claimed)) = claimed else {
            continue;
        };
        let Some(root) = claimed.root_pane_id.clone() else {
            continue;
        };
        let identity =
            HerdrSessionIdentity::from_durable(root, claimed.socket_path.clone(), claimed.protocol);
        let outcome = match HerdrControl::connect_for(&identity).await {
            Ok(control) => control.close_owned(&identity).await,
            Err(error) => Err(error),
        };
        match outcome {
            Ok(close) => {
                let release = match close {
                    HerdrCloseOutcome::Closed => HerdrLayoutCleanupRelease::Closed,
                    HerdrCloseOutcome::AlreadyMissing => HerdrLayoutCleanupRelease::PaneNotFound,
                };
                let id = claimed.layout_id.clone();
                let ack_token = token.clone();
                let ack = on_ledger(&ctx.ledger, move |ledger| {
                    ledger.ack_herdr_layout_cleanup(&id, &ack_token, release)
                })
                .await;
                effects.push(json!({
                    "layoutId": claimed.layout_id,
                    "outcome": if ack.is_ok() { release.as_str() } else { "ack-failed" },
                    "error": ack.err().map(|error| error.to_string()),
                }));
            }
            Err(error) => {
                let detail = error.to_string();
                let id = claimed.layout_id.clone();
                let retry_token = token.clone();
                let retry_now = now_iso();
                let retry = on_ledger(&ctx.ledger, move |ledger| {
                    ledger.retry_herdr_layout_cleanup(&id, &retry_token, &retry_now, &detail)
                })
                .await;
                let outcome = match retry {
                    Ok(HerdrLayoutCleanupRetry::Scheduled(_)) => "retry-wait",
                    Ok(HerdrLayoutCleanupRetry::Exhausted(_)) => "attention",
                    Err(_) => "retry-record-failed",
                };
                effects.push(json!({
                    "layoutId": claimed.layout_id,
                    "outcome": outcome,
                    "error": error.to_string(),
                }));
            }
        }
    }
    json!({
        "schema": "forged.herdr-layout-cleanup.report/1",
        "requested": requested.len(),
        "effects": effects,
    })
}

pub(crate) async fn earliest_wake(ctx: &Ctx, now: &str) -> Option<String> {
    let now = now.to_owned();
    on_ledger(&ctx.ledger, move |ledger| {
        ledger.earliest_herdr_layout_cleanup_wake(&now)
    })
    .await
    .ok()
    .flatten()
}

#[cfg(test)]
mod tests {
    use std::collections::{BTreeMap, HashMap};
    use std::os::unix::fs::PermissionsExt;
    use std::sync::{Arc, Mutex};

    use forged_host::HerdrHost;
    use forged_ledger::{Ledger, NewRun};
    use forged_types::{RunId, WorkIdentitySubjectKind};
    use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
    use tokio::net::UnixListener;

    use super::*;

    #[derive(Default)]
    struct MockState {
        workspace_label: Option<String>,
        tab_count: u32,
        roots: BTreeMap<String, String>,
        closed: Vec<String>,
        methods: Vec<String>,
        unexpected: Vec<String>,
    }

    async fn dynamic_herdr(socket: &Path) -> Arc<Mutex<MockState>> {
        let listener = UnixListener::bind(socket).expect("bind dynamic Herdr");
        let state = Arc::new(Mutex::new(MockState::default()));
        let server = Arc::clone(&state);
        tokio::spawn(async move {
            while let Ok((stream, _)) = listener.accept().await {
                let state = Arc::clone(&server);
                tokio::spawn(async move {
                    let (read, mut write) = stream.into_split();
                    let mut lines = BufReader::new(read).lines();
                    while let Ok(Some(line)) = lines.next_line().await {
                        let Ok(request) = serde_json::from_str::<Value>(&line) else {
                            continue;
                        };
                        let id = request["id"].as_str().unwrap_or_default().to_owned();
                        let method = request["method"].as_str().unwrap_or_default().to_owned();
                        let params = request["params"].clone();
                        let result = {
                            let mut state = state.lock().expect("dynamic state");
                            state.methods.push(method.clone());
                            match method.as_str() {
                                "ping" => json!({"type": "pong", "version": "test",
                                    "protocol": 19, "capabilities": {}}),
                                "events.subscribe" => json!({"type": "ok"}),
                                "workspace.list" => {
                                    let workspaces = state.workspace_label.as_ref().map_or_else(
                                        Vec::new,
                                        |label| {
                                            vec![json!({
                                                "workspace_id": "workspace:repo",
                                                "label": label,
                                            })]
                                        },
                                    );
                                    json!({"type": "workspace_list", "workspaces": workspaces})
                                }
                                "workspace.create" => {
                                    let label =
                                        params["label"].as_str().unwrap_or_default().to_owned();
                                    if state.workspace_label.is_some() {
                                        state.unexpected.push(
                                            "duplicate workspace.create for one repository"
                                                .to_owned(),
                                        );
                                    }
                                    state.workspace_label = Some(label.clone());
                                    json!({"workspace": {"workspace_id": "workspace:repo",
                                        "label": label}})
                                }
                                "tab.create" => {
                                    state.tab_count += 1;
                                    let tab = format!("tab:{}", state.tab_count);
                                    let root = format!("root:{}", state.tab_count);
                                    state.roots.insert(root.clone(), tab.clone());
                                    json!({"type": "tab_created",
                                        "tab": {"workspace_id": "workspace:repo",
                                            "tab_id": tab},
                                        "root_pane": {"pane_id": root}})
                                }
                                "pane.layout" => {
                                    let root = params["pane_id"].as_str().unwrap_or_default();
                                    match state.roots.get(root) {
                                        Some(tab) => json!({"type": "pane_layout", "layout": {
                                            "workspace_id": "workspace:repo", "tab_id": tab,
                                            "zoomed": false,
                                            "area": {"x": 0, "y": 0,
                                                "width": 120, "height": 40},
                                            "focused_pane_id": root,
                                            "panes": [{"pane_id": root, "focused": false,
                                                "rect": {"x": 0, "y": 0,
                                                    "width": 120, "height": 40}}],
                                            "splits": []}}),
                                        None => {
                                            state.unexpected.push(format!(
                                                "pane.layout queried unknown root {root:?}"
                                            ));
                                            json!({"type": "pane_layout", "layout": {
                                                "workspace_id": "unknown", "tab_id": "unknown",
                                                "panes": []}})
                                        }
                                    }
                                }
                                "pane.close" => {
                                    let pane =
                                        params["pane_id"].as_str().unwrap_or_default().to_owned();
                                    state.roots.remove(&pane);
                                    state.closed.push(pane);
                                    json!({"type": "ok"})
                                }
                                other => {
                                    state.unexpected.push(format!("unexpected method {other}"));
                                    json!({"type": "ok"})
                                }
                            }
                        };
                        if method == "workspace.list" {
                            // Widen the absent-list/create race so the
                            // cross-process repository lock test is
                            // deterministic rather than scheduler-lucky.
                            tokio::time::sleep(Duration::from_millis(50)).await;
                        }
                        let response = json!({"id": id, "result": result});
                        if write
                            .write_all(format!("{response}\n").as_bytes())
                            .await
                            .is_err()
                        {
                            return;
                        }
                        if method != "events.subscribe" {
                            return;
                        }
                    }
                });
            }
        });
        state
    }

    fn config(root: &Path) -> crate::config::ForgedConfig {
        let bd = root.join("bd");
        std::fs::write(&bd, "#!/bin/sh\nexit 1\n").expect("bd stub");
        std::fs::set_permissions(&bd, std::fs::Permissions::from_mode(0o755)).expect("bd mode");
        crate::config::ForgedConfig {
            anvil_home: root.to_path_buf(),
            runs_root: root.join("runs"),
            db_path: root.join("state.db"),
            config_path: root.join("config.json"),
            config_file_read: false,
            roster: HashMap::new(),
            profiles: BTreeMap::new(),
            rosters: BTreeMap::new(),
            default_profile: "standard".to_owned(),
            default_roster: "default".to_owned(),
            gate_commands: Vec::new(),
            stage_budget_s: HashMap::new(),
            transport_retry_budget: 3,
            bd_path: bd,
            beads_dir: root.join("beads"),
            codex_home: root.join("codex"),
            host_policy: crate::config::HostPolicy::Off,
            herdr_sock: None,
            pricing: crate::pricing::default_rate_card(),
            admission: crate::config::AdmissionPolicy::default(),
        }
    }

    fn seed_epic(ctx: &Ctx, id: &str, title: &str, repository: &str) {
        let identity = crate::core::work_identity::durable_identity(
            WorkIdentitySubjectKind::Epic,
            id,
            id,
            Some(title),
            Some("revision:1"),
            Some(repository),
            None,
            None,
        )
        .expect("epic identity");
        ctx.ledger
            .append_epic_started_with_identity(
                id,
                json!({
                    "epicId": id,
                    "title": title,
                    "specRevision": "revision:1",
                    "repo": repository,
                }),
                identity,
            )
            .expect("epic identity bundle");
    }

    #[test]
    fn label_is_bounded_unicode_safe_and_retains_canonical_context() {
        let subject = HerdrLayoutSubjectV1 {
            kind: HerdrLayoutSubjectKind::Epic,
            id: "beads-zws".to_owned(),
        };
        let label = display_label(&"wide 🦀 title ".repeat(30), &subject);
        assert!(label.len() <= HERDR_LAYOUT_LABEL_MAX_BYTES);
        assert!(label.ends_with(" [epic:beads-zws]"));
        assert!(std::str::from_utf8(label.as_bytes()).is_ok());
    }

    #[tokio::test]
    async fn subjects_share_one_repo_workspace_get_distinct_tabs_and_reuse_exact_layouts() {
        let root = tempfile::tempdir().expect("root");
        let socket = root.path().join("herdr.sock");
        let mock = dynamic_herdr(&socket).await;
        let ctx = Ctx {
            config: config(root.path()),
            ledger: Ledger::open(&root.path().join("state.db")).expect("ledger"),
        };
        let repository = root.path().to_str().expect("repository path");
        seed_epic(&ctx, "epic-a", "Colliding title", repository);
        seed_epic(&ctx, "epic-b", "Colliding title", repository);
        ctx.ledger
            .create_run(NewRun {
                run_id: RunId::new("direct-run").expect("run id"),
                bead_id: "bead-direct".to_owned(),
                repo: repository.to_owned(),
                base_ref: "main".to_owned(),
                branch: "work/direct-run".to_owned(),
            })
            .expect("direct run");
        let cwd = root.path();
        let env = HashMap::new();
        let workspace_label = "forged-layout-test";

        for (kind, id) in [
            (HerdrLayoutSubjectKind::Epic, "epic-a"),
            // A new host models a later controller generation. This exact
            // subject must reuse its durable tab rather than create another.
            (HerdrLayoutSubjectKind::Epic, "epic-a"),
            (HerdrLayoutSubjectKind::Epic, "epic-b"),
            (HerdrLayoutSubjectKind::Run, "direct-run"),
        ] {
            let host = HerdrHost::connect(&socket, root.path().join(format!("status-{id}")))
                .await
                .expect("connect")
                .with_workspace(workspace_label);
            let (_host, lease) = configure(
                &ctx,
                host,
                workspace_label,
                HerdrLayoutSubjectV1 {
                    kind,
                    id: id.to_owned(),
                },
                cwd,
                &env,
            )
            .await;
            assert!(lease.is_some(), "{kind:?} {id} got no exact layout lease");
            finish_mutation(&ctx, lease, None, None).await;
        }

        // A separate process may still be finishing prepare + durable pane
        // registration. Ordinary contention waits for that short lease and
        // then remains exactly targeted; it must not immediately mutate an
        // arbitrary current tab through the legacy split path.
        let standing = ctx
            .ledger
            .get_active_herdr_layout(
                HerdrLayoutSubjectV1 {
                    kind: HerdrLayoutSubjectKind::Epic,
                    id: "epic-a".to_owned(),
                },
                socket.to_str().expect("socket path"),
                HERDR_PROTOCOL_VERSION,
            )
            .expect("active layout")
            .expect("standing layout");
        let held_now = now_iso();
        let held_until = deadline_after(&held_now, MUTATION_LEASE_SECONDS).expect("deadline");
        ctx.ledger
            .claim_herdr_layout_mutation(
                &standing.layout_id,
                "other-process",
                &held_now,
                &held_until,
            )
            .expect("claim external mutation")
            .expect("external mutation winner");
        let release_ledger = ctx.ledger.clone();
        let release_id = standing.layout_id.clone();
        let releaser = tokio::spawn(async move {
            tokio::time::sleep(Duration::from_millis(150)).await;
            release_ledger
                .finish_herdr_layout_mutation(&release_id, "other-process", None)
                .expect("release external mutation");
        });
        let host = HerdrHost::connect(&socket, root.path().join("status-contended"))
            .await
            .expect("connect")
            .with_workspace(workspace_label);
        let (_host, lease) = configure(
            &ctx,
            host,
            workspace_label,
            HerdrLayoutSubjectV1 {
                kind: HerdrLayoutSubjectKind::Epic,
                id: "epic-a".to_owned(),
            },
            cwd,
            &env,
        )
        .await;
        releaser.await.expect("release task");
        assert!(lease.is_some(), "short contention must retain exact layout");
        finish_mutation(&ctx, lease, None, None).await;

        let a = ctx
            .ledger
            .list_herdr_layouts_for_subject(HerdrLayoutSubjectV1 {
                kind: HerdrLayoutSubjectKind::Epic,
                id: "epic-a".to_owned(),
            })
            .expect("epic a layout");
        let b = ctx
            .ledger
            .list_herdr_layouts_for_subject(HerdrLayoutSubjectV1 {
                kind: HerdrLayoutSubjectKind::Epic,
                id: "epic-b".to_owned(),
            })
            .expect("epic b layout");
        let run = ctx
            .ledger
            .list_herdr_layouts_for_subject(HerdrLayoutSubjectV1 {
                kind: HerdrLayoutSubjectKind::Run,
                id: "direct-run".to_owned(),
            })
            .expect("run layout");
        assert_eq!(a.len(), 1, "controller restart must reuse one layout");
        assert_eq!(b.len(), 1);
        assert_eq!(run.len(), 1);
        assert_eq!(a[0].workspace_id, "workspace:repo");
        assert_eq!(b[0].workspace_id, "workspace:repo");
        assert_eq!(run[0].workspace_id, "workspace:repo");
        assert_ne!(a[0].tab_id, b[0].tab_id);
        assert_ne!(a[0].tab_id, run[0].tab_id);
        assert_ne!(a[0].display_label, b[0].display_label);
        assert!(a[0].display_label.contains("epic-a"));
        assert!(b[0].display_label.contains("epic-b"));

        let run_root = run[0].root_pane_id.clone().expect("registered run root");
        let epic_a_root = a
            .last()
            .and_then(|row| row.root_pane_id.clone())
            .expect("registered epic root");
        ctx.ledger
            .set_run_state(
                "direct-run",
                forged_ledger::RunState::Stopped,
                Some("done".to_owned()),
            )
            .expect("terminal run");
        let cleanup = reconcile(&ctx).await;
        assert_eq!(cleanup["effects"][0]["outcome"], "closed");
        assert_eq!(
            ctx.ledger
                .get_herdr_layout(&run[0].layout_id)
                .expect("run cleanup row")
                .expect("run layout")
                .cleanup_state,
            forged_ledger::HerdrLayoutCleanupState::Released
        );

        let state = mock.lock().expect("dynamic state");
        assert_eq!(state.tab_count, 3, "one tab per canonical subject");
        assert_eq!(
            state
                .methods
                .iter()
                .filter(|method| method.as_str() == "workspace.create")
                .count(),
            1,
            "repository workspace is reused"
        );
        assert_eq!(state.closed, vec![run_root]);
        assert!(
            state.roots.contains_key(&epic_a_root),
            "terminal cleanup must not close another subject's exact root"
        );
        assert!(state.unexpected.is_empty(), "{:?}", state.unexpected);
    }

    #[tokio::test]
    async fn concurrent_subjects_serialize_repository_workspace_resolution() {
        let root = tempfile::tempdir().expect("root");
        let socket = root.path().join("herdr.sock");
        let mock = dynamic_herdr(&socket).await;
        let ctx = Ctx {
            config: config(root.path()),
            ledger: Ledger::open(&root.path().join("state.db")).expect("ledger"),
        };
        let repository = root.path().to_str().expect("repository path");
        seed_epic(&ctx, "concurrent-a", "Concurrent", repository);
        seed_epic(&ctx, "concurrent-b", "Concurrent", repository);
        let label = "forged-concurrent-repo";
        let first = HerdrHost::connect(&socket, root.path().join("status-a"))
            .await
            .expect("first host")
            .with_workspace(label);
        let second = HerdrHost::connect(&socket, root.path().join("status-b"))
            .await
            .expect("second host")
            .with_workspace(label);
        let env = HashMap::new();
        let (first, second) = tokio::join!(
            configure(
                &ctx,
                first,
                label,
                HerdrLayoutSubjectV1 {
                    kind: HerdrLayoutSubjectKind::Epic,
                    id: "concurrent-a".to_owned(),
                },
                root.path(),
                &env,
            ),
            configure(
                &ctx,
                second,
                label,
                HerdrLayoutSubjectV1 {
                    kind: HerdrLayoutSubjectKind::Epic,
                    id: "concurrent-b".to_owned(),
                },
                root.path(),
                &env,
            )
        );
        assert!(first.1.is_some());
        assert!(second.1.is_some());
        finish_mutation(&ctx, first.1, None, None).await;
        finish_mutation(&ctx, second.1, None, None).await;

        let state = mock.lock().expect("dynamic state");
        assert_eq!(state.tab_count, 2);
        assert_eq!(
            state
                .methods
                .iter()
                .filter(|method| method.as_str() == "workspace.create")
                .count(),
            1,
            "concurrent subjects must not duplicate the repository workspace"
        );
        assert!(state.unexpected.is_empty(), "{:?}", state.unexpected);
    }
}
