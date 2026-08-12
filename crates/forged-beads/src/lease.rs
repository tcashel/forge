//! The lease operations: claim, heartbeat, and the scoped reclaim.
//!
//! Argv per operation is frozen exactly as probe-verified:
//! - claim specific bead: `bd update <id> --claim --actor <holder> --json`
//! - claim from frontier: `bd ready --claim --actor <holder> --json`
//! - heartbeat: `bd heartbeat <id> --actor <holder> --json`
//! - reclaim: `bd reclaim --older-than <dur> --id <bead> --assignee <holder>
//!   --json`
//!
//! Claim success is NEVER inferred from exit status: bd 1.2.1's own
//! regression notes (tests/regression/DISCOVERY.md, BUG-10) record a refused
//! claim exiting 0. After every claim the returned envelope is read and the
//! issue's assignee must equal the holder.
//!
//! Anti-steal: bd protects live claims from `--claim` theft, and `bd update`
//! offers a documented force-flag bypass — this crate NEVER passes that flag
//! (acceptance-tested by source grep). Holder strings are opaque here
//! (callers use the epic's `<provider>:<session-or-host>:<pid>` format
//! verbatim as the bd actor); only non-empty and no-newline are validated.

use serde_json::Value;

use crate::classify::BdError;
use crate::config::BdConfig;
use crate::envelope;
use crate::invoke::{self, WriteOp};

/// bd 1.2.1's lease TTL, hardcoded at 5 minutes (`DefaultLeaseTTL`, bd source
/// `internal/storage/issueops/lease.go`; the per-claim override is
/// context-internal, not reachable from the CLI).
pub const BD_LEASE_TTL_S: u64 = 300;

/// The epic's frozen timing equation: the reclaim grace window (counted from
/// lease EXPIRY, not from last heartbeat) for a stage budget. Reclaim fires
/// at TTL + older_than, so `older_than = stage_budget - TTL`, saturating
/// at 0. Note an unexpired lease is unreclaimable even at `--older-than 0s`
/// (probe-verified).
pub fn reclaim_older_than(stage_budget_s: u64) -> u64 {
    stage_budget_s.saturating_sub(BD_LEASE_TTL_S)
}

/// A successfully claimed bead.
#[derive(Debug, Clone)]
pub struct ClaimedBead {
    /// The bead id.
    pub id: String,
    /// The confirmed assignee (equals the claiming holder).
    pub assignee: String,
    /// The full parsed envelope data for the claim call.
    pub raw: Value,
}

/// The outcome of a scoped reclaim. A scoped reclaim of an UNEXPIRED lease
/// succeeds with an empty reclaimed list (exit 0, `scoped: true`, nothing
/// reclaimed, original assignee intact) — that is the refusal shape, not an
/// error, and surfaces here as `previous_owner: None`.
#[derive(Debug, Clone)]
pub struct ReclaimOutcome {
    /// Whether bd confirmed the reclaim was scoped (expect `true`).
    pub scoped: bool,
    /// The reclaimed entry's previous owner — present only on non-empty
    /// reclaimed entries.
    pub previous_owner: Option<String>,
    /// The full parsed envelope data for the reclaim call.
    pub raw: Value,
}

fn validate_holder(holder: &str) -> Result<(), BdError> {
    if holder.is_empty() || holder.contains('\n') {
        return Err(BdError::Beads {
            context: "holder validation".to_string(),
            exit: None,
            stdout: String::new(),
            stderr: format!("holder must be non-empty with no newline, got {holder:?}"),
        });
    }
    Ok(())
}

enum ClaimCheck {
    Claimed(ClaimedBead),
    HeldBy(Option<String>),
    Inconclusive,
}

/// Read the claim envelope and confirm the assignee. `data` may be an array
/// (observed: `bd update --claim` and `bd show` wrap the issue in an array)
/// or an object; resolve defensively.
fn verify_claim(fallback_id: &str, holder: &str, data: &Value) -> ClaimCheck {
    let Some(obj) = envelope::first_obj(data) else {
        return ClaimCheck::Inconclusive;
    };
    let id = obj
        .get("id")
        .and_then(Value::as_str)
        .unwrap_or(fallback_id)
        .to_string();
    match obj.get("assignee").and_then(Value::as_str) {
        Some(a) if a == holder => ClaimCheck::Claimed(ClaimedBead {
            id,
            assignee: a.to_string(),
            raw: data.clone(),
        }),
        Some(a) if !a.is_empty() => ClaimCheck::HeldBy(Some(a.to_string())),
        _ => ClaimCheck::Inconclusive,
    }
}

/// Claim a specific bead for `holder`.
///
/// Observed success envelope (bd 1.2.1, `bd update beads-1al --claim --actor
/// doctor --json`): `data` is an ARRAY whose first element carries
/// `"assignee": "doctor"`, `"status": "in_progress"`, and
/// `"lease_expires_at"`. A zero exit with an absent or different assignee is
/// [`BdError::LeaseHeld`]; inconclusive data is settled by a re-read of
/// `bd show <id> --json`.
pub async fn claim_specific(
    bd: &BdConfig,
    bead: &str,
    holder: &str,
) -> Result<ClaimedBead, BdError> {
    validate_holder(holder)?;
    let op = WriteOp::Claim {
        bead: Some(bead.to_string()),
        actor: holder.to_string(),
    };
    let args = ["update", bead, "--claim", "--actor", holder, "--json"];
    let data = invoke::write(bd, op, &args).await?;
    match verify_claim(bead, holder, &data) {
        ClaimCheck::Claimed(cb) => Ok(cb),
        ClaimCheck::HeldBy(observed) => Err(BdError::LeaseHeld {
            bead: bead.to_string(),
            holder: observed,
        }),
        ClaimCheck::Inconclusive => {
            let show = invoke::read(bd, &["show", bead, "--json"]).await;
            match show.as_ref().map(|d| verify_claim(bead, holder, d)) {
                Ok(ClaimCheck::Claimed(cb)) => Ok(cb),
                Ok(ClaimCheck::HeldBy(observed)) => Err(BdError::LeaseHeld {
                    bead: bead.to_string(),
                    holder: observed,
                }),
                _ => Err(BdError::Beads {
                    context: format!("bd update {bead} (claim verification)"),
                    exit: None,
                    stdout: data.to_string(),
                    stderr: "claim returned no confirmable assignee".to_string(),
                }),
            }
        }
    }
}

/// Claim the next ready bead from the frontier for `holder`.
///
/// `Ok(None)` is the probe-verified race-loser / frontier-empty result: the
/// loser gets an empty result (`data: []`, exit 0), no error, no double
/// claim. Observed winner envelope: `data` is an array whose first element
/// carries the claimed issue with `"assignee"` set to the actor.
///
/// Non-empty data that names a bead without confirming the assignee is
/// settled by a re-read of `bd show <id> --json`, exactly as
/// [`claim_specific`] does: only the requested holder counts as a claim, and
/// an unconfirmable one is [`BdError::LeaseHeld`].
pub async fn claim_ready(bd: &BdConfig, holder: &str) -> Result<Option<ClaimedBead>, BdError> {
    validate_holder(holder)?;
    let op = WriteOp::Claim {
        bead: None,
        actor: holder.to_string(),
    };
    let args = ["ready", "--claim", "--actor", holder, "--json"];
    let data = invoke::write(bd, op, &args).await?;
    if let Some(items) = envelope::as_list(&data) {
        if items.is_empty() {
            return Ok(None);
        }
    }
    match verify_claim("", holder, &data) {
        ClaimCheck::Claimed(cb) => Ok(Some(cb)),
        ClaimCheck::HeldBy(observed) => Err(BdError::LeaseHeld {
            bead: envelope::first_obj(&data)
                .and_then(|o| o.get("id"))
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_string(),
            holder: observed,
        }),
        // Non-empty data that names a bead but confirms no assignee: the
        // claim contract says re-read that id and decide from bd, never from
        // the ambiguous response. Only the requested holder counts as a
        // claim; anything else is LeaseHeld with whatever holder was
        // observed — an unverified claim must never surface as a generic
        // failure the caller could mistake for a transient one.
        ClaimCheck::Inconclusive => match envelope::first_obj(&data)
            .and_then(|o| o.get("id"))
            .and_then(Value::as_str)
        {
            Some(id) => {
                let show = invoke::read(bd, &["show", id, "--json"]).await;
                match show.as_ref().map(|d| verify_claim(id, holder, d)) {
                    Ok(ClaimCheck::Claimed(cb)) => Ok(Some(cb)),
                    Ok(ClaimCheck::HeldBy(observed)) => Err(BdError::LeaseHeld {
                        bead: id.to_string(),
                        holder: observed,
                    }),
                    _ => Err(BdError::LeaseHeld {
                        bead: id.to_string(),
                        holder: None,
                    }),
                }
            }
            // No id at all: there is nothing to re-read, so this is a genuine
            // protocol failure rather than a contested lease.
            None => Err(BdError::Beads {
                context: "bd ready --claim (claim verification)".to_string(),
                exit: None,
                stdout: data.to_string(),
                stderr: "frontier claim returned data with no bead id and no confirmable assignee"
                    .to_string(),
            }),
        },
    }
}

/// Heartbeat a held lease. Owner-only: a wrong actor is refused, and a
/// refusal maps to [`BdError::HeartbeatRefused`] — callers treat it as
/// "lease lost" and never retry it as contention.
///
/// Observed success envelope (bd 1.2.1): `data` is an object
/// `{"id": "beads-1al", "owner": "doctor", "status": "heartbeat"}`.
pub async fn heartbeat(bd: &BdConfig, bead: &str, holder: &str) -> Result<(), BdError> {
    validate_holder(holder)?;
    let op = WriteOp::Heartbeat {
        bead: bead.to_string(),
        actor: holder.to_string(),
    };
    let args = ["heartbeat", bead, "--actor", holder, "--json"];
    invoke::write(bd, op, &args).await.map(|_| ())
}

/// Render the `--older-than` grace window as a Go `time.ParseDuration` token
/// (`{n}s`) — a bare integer is a parse error.
fn older_than_token(older_than_s: u64) -> String {
    format!("{older_than_s}s")
}

/// Scoped reclaim of an expired lease. Scoping is mandatory and
/// type-enforced: this signature requires both the bead id and the expected
/// previous holder, so an unscoped or half-scoped reclaim is unconstructible.
///
/// Observed envelope for the unexpired-lease refusal shape (bd 1.2.1,
/// `bd reclaim --older-than 0s --id beads-1al --assignee doctor --json`):
/// `data` is `{"count": 0, "reclaimed": null, "scoped": true}` with exit 0 —
/// nothing reclaimed, original assignee intact. `previous_owner` appears only
/// on non-empty reclaimed entries.
pub async fn reclaim(
    bd: &BdConfig,
    bead: &str,
    previous_holder: &str,
    older_than_s: u64,
) -> Result<ReclaimOutcome, BdError> {
    validate_holder(previous_holder)?;
    let token = older_than_token(older_than_s);
    let op = WriteOp::Other {
        bead: Some(bead.to_string()),
        actor: Some(previous_holder.to_string()),
    };
    let args = [
        "reclaim",
        "--older-than",
        &token,
        "--id",
        bead,
        "--assignee",
        previous_holder,
        "--json",
    ];
    let data = invoke::write(bd, op, &args).await?;
    let obj = envelope::first_obj(&data);
    let scoped = obj
        .and_then(|o| o.get("scoped"))
        .and_then(Value::as_bool)
        .unwrap_or(false);
    let previous_owner = obj
        .and_then(|o| o.get("reclaimed"))
        .and_then(Value::as_array)
        .and_then(|entries| entries.first())
        .and_then(|e| e.get("previous_owner"))
        .and_then(Value::as_str)
        .map(str::to_string);
    Ok(ReclaimOutcome {
        scoped,
        previous_owner,
        raw: data,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn reclaim_older_than_is_the_frozen_timing_equation() {
        assert_eq!(reclaim_older_than(600), 300);
        assert_eq!(reclaim_older_than(300), 0);
        assert_eq!(reclaim_older_than(60), 0, "saturates at 0");
        assert_eq!(reclaim_older_than(0), 0);
        assert_eq!(BD_LEASE_TTL_S, 300);
    }

    #[test]
    fn older_than_renders_a_go_duration_token() {
        assert_eq!(older_than_token(0), "0s");
        assert_eq!(older_than_token(1), "1s");
        assert_eq!(older_than_token(300), "300s");
    }

    #[test]
    fn verify_claim_reads_the_assignee_never_exit_status() {
        let data = json!([{"id": "beads-1al", "assignee": "me"}]);
        assert!(matches!(
            verify_claim("beads-1al", "me", &data),
            ClaimCheck::Claimed(_)
        ));
        let held = json!([{"id": "beads-1al", "assignee": "other"}]);
        match verify_claim("beads-1al", "me", &held) {
            ClaimCheck::HeldBy(h) => assert_eq!(h.as_deref(), Some("other")),
            _ => panic!("expected HeldBy"),
        }
        let inconclusive = json!([{"id": "beads-1al"}]);
        assert!(matches!(
            verify_claim("beads-1al", "me", &inconclusive),
            ClaimCheck::Inconclusive
        ));
        assert!(matches!(
            verify_claim("beads-1al", "me", &json!(null)),
            ClaimCheck::Inconclusive
        ));
    }

    #[test]
    fn holder_validation_rejects_empty_and_newlines() {
        assert!(validate_holder("claude:host:123").is_ok());
        assert!(validate_holder("").is_err());
        assert!(validate_holder("a\nb").is_err());
    }
}
