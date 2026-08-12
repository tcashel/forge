//! Proto-owned event kinds and their replay parser.
//!
//! Budget, retry deadlines, operation parameters, and quarantined claims all
//! persist through the ledger's append-only event stream under `proto.*`
//! kinds with exact, versioned payloads. The driver calls [`record`] after
//! honoring each `NextAction`; [`parse_proto_events`] replays the stream in
//! `event_id` order.
//!
//! Replay contract: unknown JSON keys are ignored; duplicate payloads for
//! the same logical key are judged by **canonical-JSON equality** — sorted
//! keys, semantic value equality (AMENDED, operator-adjudicated 2026-08-12,
//! aligning with the ledger's canonical-JSON idempotency convention) — and
//! canonically-equal duplicates are ignored; a payload missing a required
//! key, an unknown `schemaVersion`, or a second payload for the same logical
//! key that is canonically DIFFERENT is [`ProtoError::MalformedEvent`].
//! Event kinds outside the proto-owned set (the ledger's own
//! `attempt.state`, `operation.released`, …) are skipped.
//!
//! The writer holds the same invariants as the reader: [`record`] refuses a
//! payload [`parse_proto_events`] would refuse, so no run can persist an
//! event its own replay cannot read back.

use forged_ledger::{EventRow, Ledger};
use forged_types::{GateRow, OperationRequest, PacketResult, Stage, Verdict};
use serde_json::{json, Value};

use crate::error::ProtoError;

/// Which gate pass a `proto.gate` event reports.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GatePhase {
    /// The pre-fix gate run.
    Gate,
    /// The post-fix gate run.
    Regate,
}

impl GatePhase {
    /// The wire string for this phase.
    pub fn as_str(&self) -> &'static str {
        match self {
            GatePhase::Gate => "gate",
            GatePhase::Regate => "regate",
        }
    }
}

/// One parsed proto-owned event.
#[derive(Debug, Clone, PartialEq)]
pub enum ProtoEvent {
    /// `proto.gate` — one gate pass ran; failure is data, never an abort.
    Gate {
        /// Which pass ran.
        phase: GatePhase,
        /// The round the pass belongs to (0 pre-fix, 1 post-fix).
        seq: i64,
        /// Whether every gate command passed.
        passed: bool,
        /// One row per executed gate command.
        rows: Vec<GateRow>,
    },
    /// `proto.pr` — the draft PR was opened.
    Pr {
        /// The PR number.
        number: u64,
        /// Whether the PR is a draft — the engine's structural "draft only"
        /// record.
        is_draft: bool,
        /// The PR's url.
        url: String,
    },
    /// `proto.retry` — the caller granted a transport retry to a packet.
    Retry {
        /// The packet whose attempt transport-failed.
        packet_id: String,
        /// How many transport failures that packet has accumulated.
        transport_failures: u32,
        /// When the packet may be claimed again (30-byte RFC-3339 UTC).
        retry_after: String,
    },
    /// `proto.review` — one review leg's report was recorded.
    Review {
        /// The fan-out's seq.
        seq: i64,
        /// `Stage::ReviewClaude` or `Stage::ReviewCodex` — never another
        /// stage.
        stage: Stage,
        /// The leg's verdict; `None` exactly when `available` is false.
        verdict: Option<Verdict>,
        /// Whether the reviewer was present to think.
        available: bool,
    },
    /// `proto.operation.request` — appended immediately before every
    /// `begin_operation` so an interrupted operation's parameters are
    /// recoverable (`OperationRow` stores only `request_sha256`).
    OperationRequest {
        /// The operation name (the lowercase machine step).
        name: String,
        /// The idempotency key, `<run_id>/<step>/<round>`.
        idempotency_key: String,
        /// The effect class the operation was begun under, as its DDL
        /// string.
        effect_class: String,
        /// The full request, verbatim.
        request: OperationRequest,
    },
    /// `proto.quarantine` — a zombie result was refused at the fence and its
    /// bytes taken into custody. The event preserves the refused claim in
    /// ledger state so the reconciler's harvest-and-verify can check it; the
    /// file destination stays the adapter's contract.
    Quarantine {
        /// The packet the refused result named.
        packet_id: String,
        /// The revoked attempt whose token was refused.
        attempt_id: i64,
        /// The bare file name the bytes were quarantined under.
        name: String,
        /// The refused result, verbatim.
        result: PacketResult,
    },
}

impl ProtoEvent {
    /// The event kind string this variant records under.
    pub fn kind(&self) -> &'static str {
        match self {
            ProtoEvent::Gate { .. } => "proto.gate",
            ProtoEvent::Pr { .. } => "proto.pr",
            ProtoEvent::Retry { .. } => "proto.retry",
            ProtoEvent::Review { .. } => "proto.review",
            ProtoEvent::OperationRequest { .. } => "proto.operation.request",
            ProtoEvent::Quarantine { .. } => "proto.quarantine",
        }
    }

    /// Refuse an event the replay parser would refuse.
    ///
    /// The parser enforces the `proto.review` invariants — a review stage,
    /// and a verdict that is null exactly when the leg was unavailable — and
    /// so does this, at the writer. Persisting a payload that only fails on
    /// the way back out would strand the run: every later `parse_proto_events`
    /// over that stream, including the projection every `advance` reads,
    /// would return `MalformedEvent` with no way to withdraw the row.
    fn validate(&self) -> Result<(), ProtoError> {
        let refuse = |detail: &str| {
            Err(ProtoError::Projection(format!(
                "refusing to record {}: {detail}",
                self.kind()
            )))
        };
        match self {
            ProtoEvent::Review {
                stage,
                verdict,
                available,
                ..
            } => {
                if !matches!(stage, Stage::ReviewClaude | Stage::ReviewCodex) {
                    return refuse("stage is not a review stage");
                }
                if *available == verdict.is_none() {
                    return refuse("verdict must be null exactly when available is false");
                }
                Ok(())
            }
            _ => Ok(()),
        }
    }

    /// The exact versioned payload for this event.
    fn payload(&self) -> Result<Value, ProtoError> {
        self.validate()?;
        let value = match self {
            ProtoEvent::Gate {
                phase,
                seq,
                passed,
                rows,
            } => json!({
                "schemaVersion": 1,
                "phase": phase.as_str(),
                "seq": seq,
                "passed": passed,
                "rows": serde_json::to_value(rows).map_err(to_json_error)?,
            }),
            ProtoEvent::Pr {
                number,
                is_draft,
                url,
            } => json!({
                "schemaVersion": 1,
                "number": number,
                "isDraft": is_draft,
                "url": url,
            }),
            ProtoEvent::Retry {
                packet_id,
                transport_failures,
                retry_after,
            } => json!({
                "schemaVersion": 1,
                "packetId": packet_id,
                "transportFailures": transport_failures,
                "retryAfter": retry_after,
            }),
            ProtoEvent::Review {
                seq,
                stage,
                verdict,
                available,
            } => json!({
                "schemaVersion": 1,
                "seq": seq,
                "stage": serde_json::to_value(stage).map_err(to_json_error)?,
                "verdict": serde_json::to_value(verdict).map_err(to_json_error)?,
                "available": available,
            }),
            ProtoEvent::OperationRequest {
                name,
                idempotency_key,
                effect_class,
                request,
            } => json!({
                "schemaVersion": 1,
                "name": name,
                "idempotencyKey": idempotency_key,
                "effectClass": effect_class,
                "request": serde_json::to_value(request).map_err(to_json_error)?,
            }),
            ProtoEvent::Quarantine {
                packet_id,
                attempt_id,
                name,
                result,
            } => json!({
                "schemaVersion": 1,
                "packetId": packet_id,
                "attemptId": attempt_id,
                "name": name,
                "result": serde_json::to_value(result).map_err(to_json_error)?,
            }),
        };
        Ok(value)
    }

    /// The logical key duplicates are judged under.
    fn logical_key(&self) -> String {
        match self {
            ProtoEvent::Gate { phase, .. } => format!("gate/{}", phase.as_str()),
            ProtoEvent::Pr { .. } => "pr".to_owned(),
            ProtoEvent::Retry {
                packet_id,
                transport_failures,
                ..
            } => format!("retry/{packet_id}/{transport_failures}"),
            ProtoEvent::Review { seq, stage, .. } => {
                format!("review/{}/{seq}", stage_str(*stage))
            }
            ProtoEvent::OperationRequest {
                name,
                idempotency_key,
                ..
            } => format!("op/{name}/{idempotency_key}"),
            ProtoEvent::Quarantine {
                attempt_id, name, ..
            } => format!("quarantine/{attempt_id}/{name}"),
        }
    }
}

fn to_json_error(err: serde_json::Error) -> ProtoError {
    ProtoError::Projection(format!("cannot serialize proto event: {err}"))
}

pub(crate) fn stage_str(stage: Stage) -> &'static str {
    match stage {
        Stage::Implement => "implement",
        Stage::ReviewClaude => "reviewclaude",
        Stage::ReviewCodex => "reviewcodex",
        Stage::Fix => "fix",
    }
}

/// Append one proto event to the run's stream. The driver calls this after
/// honoring each `NextAction`; `advance` itself never writes.
///
/// Refuses, as `ProtoError::Projection`, any event the replay parser would
/// refuse — the writer holds the reader's invariants.
pub fn record(ledger: &Ledger, run_id: &str, event: ProtoEvent) -> Result<(), ProtoError> {
    let payload = event.payload()?;
    ledger.append_event(Some(run_id), event.kind(), payload)?;
    Ok(())
}

/// Normalize an RFC-3339 UTC string (as jiff displays it) to the ledger's
/// fixed-width 30-byte form: exactly nine fractional digits and a `Z`
/// suffix. Ordering comparisons on the widened form are lexicographic.
pub fn widen_rfc3339(s: &str) -> String {
    let body = s.strip_suffix('Z').unwrap_or(s);
    let mut out = String::with_capacity(30);
    match body.find('.') {
        Some(idx) => {
            let (secs, dot_frac) = body.split_at(idx);
            let frac = &dot_frac[1..];
            out.push_str(secs);
            out.push('.');
            let take = frac.len().min(9);
            out.push_str(&frac[..take]);
            for _ in take..9 {
                out.push('0');
            }
        }
        None => {
            out.push_str(body);
            out.push_str(".000000000");
        }
    }
    out.push('Z');
    out
}

/// Replay the proto-owned events out of a run's raw event rows, in
/// `event_id` order, applying the replay contract.
pub fn parse_proto_events(rows: &[EventRow]) -> Result<Vec<ProtoEvent>, ProtoError> {
    let mut seen: std::collections::BTreeMap<String, String> = std::collections::BTreeMap::new();
    let mut out = Vec::new();
    for row in rows {
        let Some(event) = parse_one(row)? else {
            continue;
        };
        let key = event.logical_key();
        // AMENDED (operator-adjudicated 2026-08-12): duplicates are judged by
        // canonical-JSON equality, not raw bytes — key ORDER and whitespace
        // are noise, VALUE differences are not.
        let canonical = canonical_payload(row)?;
        match seen.get(&key) {
            None => {
                seen.insert(key, canonical);
                out.push(event);
            }
            Some(prior) if *prior == canonical => {
                // Canonically equal duplicate: ignored.
            }
            Some(_) => {
                return Err(ProtoError::MalformedEvent {
                    event_id: row.event_id,
                    detail: format!("second differing payload for logical key {key:?}"),
                });
            }
        }
    }
    Ok(out)
}

/// The row's payload in canonical form: parsed to a `Value` — whose object
/// keys are sorted and whose numbers are normalized — and re-serialized, so
/// two payloads compare equal iff they are semantically the same JSON. The
/// key-order test in this module's suite locks that property down.
fn canonical_payload(row: &EventRow) -> Result<String, ProtoError> {
    let value: Value =
        serde_json::from_str(&row.payload_json).map_err(|err| ProtoError::MalformedEvent {
            event_id: row.event_id,
            detail: format!("payload is not JSON: {err}"),
        })?;
    serde_json::to_string(&value).map_err(|err| ProtoError::MalformedEvent {
        event_id: row.event_id,
        detail: format!("payload cannot re-serialize: {err}"),
    })
}

/// Parse one row; `Ok(None)` for kinds outside the proto-owned set.
fn parse_one(row: &EventRow) -> Result<Option<ProtoEvent>, ProtoError> {
    let parser: fn(&EventRow, &Value) -> Result<ProtoEvent, ProtoError> = match row.kind.as_str() {
        "proto.gate" => parse_gate,
        "proto.pr" => parse_pr,
        "proto.retry" => parse_retry,
        "proto.review" => parse_review,
        "proto.operation.request" => parse_operation_request,
        "proto.quarantine" => parse_quarantine,
        _ => return Ok(None),
    };
    let value: Value =
        serde_json::from_str(&row.payload_json).map_err(|err| ProtoError::MalformedEvent {
            event_id: row.event_id,
            detail: format!("payload is not JSON: {err}"),
        })?;
    let version = require(row, &value, "schemaVersion")?
        .as_u64()
        .ok_or_else(|| malformed(row, "schemaVersion is not an integer"))?;
    if version != 1 {
        return Err(malformed(row, &format!("unknown schemaVersion {version}")));
    }
    parser(row, &value).map(Some)
}

fn malformed(row: &EventRow, detail: &str) -> ProtoError {
    ProtoError::MalformedEvent {
        event_id: row.event_id,
        detail: detail.to_owned(),
    }
}

fn require<'v>(row: &EventRow, value: &'v Value, key: &str) -> Result<&'v Value, ProtoError> {
    value
        .get(key)
        .ok_or_else(|| malformed(row, &format!("missing required key {key:?}")))
}

fn require_str(row: &EventRow, value: &Value, key: &str) -> Result<String, ProtoError> {
    require(row, value, key)?
        .as_str()
        .map(str::to_owned)
        .ok_or_else(|| malformed(row, &format!("{key} is not a string")))
}

fn require_bool(row: &EventRow, value: &Value, key: &str) -> Result<bool, ProtoError> {
    require(row, value, key)?
        .as_bool()
        .ok_or_else(|| malformed(row, &format!("{key} is not a bool")))
}

fn require_i64(row: &EventRow, value: &Value, key: &str) -> Result<i64, ProtoError> {
    require(row, value, key)?
        .as_i64()
        .ok_or_else(|| malformed(row, &format!("{key} is not an integer")))
}

fn require_u64(row: &EventRow, value: &Value, key: &str) -> Result<u64, ProtoError> {
    require(row, value, key)?
        .as_u64()
        .ok_or_else(|| malformed(row, &format!("{key} is not an unsigned integer")))
}

fn parse_gate(row: &EventRow, value: &Value) -> Result<ProtoEvent, ProtoError> {
    let phase = match require_str(row, value, "phase")?.as_str() {
        "gate" => GatePhase::Gate,
        "regate" => GatePhase::Regate,
        other => return Err(malformed(row, &format!("unknown gate phase {other:?}"))),
    };
    let rows: Vec<GateRow> = serde_json::from_value(require(row, value, "rows")?.clone())
        .map_err(|err| malformed(row, &format!("rows do not parse as GateRow: {err}")))?;
    Ok(ProtoEvent::Gate {
        phase,
        seq: require_i64(row, value, "seq")?,
        passed: require_bool(row, value, "passed")?,
        rows,
    })
}

fn parse_pr(row: &EventRow, value: &Value) -> Result<ProtoEvent, ProtoError> {
    Ok(ProtoEvent::Pr {
        number: require_u64(row, value, "number")?,
        is_draft: require_bool(row, value, "isDraft")?,
        url: require_str(row, value, "url")?,
    })
}

fn parse_retry(row: &EventRow, value: &Value) -> Result<ProtoEvent, ProtoError> {
    let transport_failures = u32::try_from(require_u64(row, value, "transportFailures")?)
        .map_err(|_| malformed(row, "transportFailures does not fit u32"))?;
    Ok(ProtoEvent::Retry {
        packet_id: require_str(row, value, "packetId")?,
        transport_failures,
        retry_after: require_str(row, value, "retryAfter")?,
    })
}

fn parse_review(row: &EventRow, value: &Value) -> Result<ProtoEvent, ProtoError> {
    let stage: Stage = serde_json::from_value(require(row, value, "stage")?.clone())
        .map_err(|err| malformed(row, &format!("stage does not parse: {err}")))?;
    if !matches!(stage, Stage::ReviewClaude | Stage::ReviewCodex) {
        return Err(malformed(row, "stage is not a review stage"));
    }
    let verdict_value = require(row, value, "verdict")?;
    let verdict: Option<Verdict> = serde_json::from_value(verdict_value.clone())
        .map_err(|err| malformed(row, &format!("verdict does not parse: {err}")))?;
    let available = require_bool(row, value, "available")?;
    if available == verdict.is_none() {
        return Err(malformed(
            row,
            "verdict must be null exactly when available is false",
        ));
    }
    Ok(ProtoEvent::Review {
        seq: require_i64(row, value, "seq")?,
        stage,
        verdict,
        available,
    })
}

fn parse_operation_request(row: &EventRow, value: &Value) -> Result<ProtoEvent, ProtoError> {
    let request: OperationRequest = serde_json::from_value(require(row, value, "request")?.clone())
        .map_err(|err| malformed(row, &format!("request does not parse: {err}")))?;
    Ok(ProtoEvent::OperationRequest {
        name: require_str(row, value, "name")?,
        idempotency_key: require_str(row, value, "idempotencyKey")?,
        effect_class: require_str(row, value, "effectClass")?,
        request,
    })
}

fn parse_quarantine(row: &EventRow, value: &Value) -> Result<ProtoEvent, ProtoError> {
    let result: PacketResult = serde_json::from_value(require(row, value, "result")?.clone())
        .map_err(|err| malformed(row, &format!("result does not parse: {err}")))?;
    Ok(ProtoEvent::Quarantine {
        packet_id: require_str(row, value, "packetId")?,
        attempt_id: require_i64(row, value, "attemptId")?,
        name: require_str(row, value, "name")?,
        result,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn row(event_id: i64, kind: &str, payload: Value) -> EventRow {
        raw_row(event_id, kind, &payload.to_string())
    }

    /// A row whose payload bytes are given verbatim — `json!` sorts object
    /// keys on the way in, so key order can only be varied by hand.
    fn raw_row(event_id: i64, kind: &str, payload_json: &str) -> EventRow {
        EventRow {
            event_id,
            ts: "2026-08-12T00:00:00.000000000Z".to_owned(),
            run_id: Some("run-1".to_owned()),
            kind: kind.to_owned(),
            payload_json: payload_json.to_owned(),
        }
    }

    #[test]
    fn widen_rfc3339_pads_truncates_and_passes_through() {
        assert_eq!(
            widen_rfc3339("2026-08-11T18:46:15Z"),
            "2026-08-11T18:46:15.000000000Z"
        );
        assert_eq!(
            widen_rfc3339("2026-08-11T18:46:15.123Z"),
            "2026-08-11T18:46:15.123000000Z"
        );
        assert_eq!(
            widen_rfc3339("2026-08-11T18:46:15.123456789Z"),
            "2026-08-11T18:46:15.123456789Z"
        );
    }

    #[test]
    fn unknown_kinds_are_skipped() {
        let rows = vec![row(1, "attempt.state", json!({"new": "running"}))];
        assert_eq!(parse_proto_events(&rows).expect("parses"), vec![]);
    }

    #[test]
    fn unknown_json_keys_are_ignored() {
        let rows = vec![row(
            1,
            "proto.pr",
            json!({"schemaVersion": 1, "number": 7, "isDraft": true, "url": "u", "zz": 9}),
        )];
        let parsed = parse_proto_events(&rows).expect("parses");
        assert_eq!(
            parsed,
            vec![ProtoEvent::Pr {
                number: 7,
                is_draft: true,
                url: "u".to_owned()
            }]
        );
    }

    #[test]
    fn missing_required_key_is_malformed() {
        let rows = vec![row(
            3,
            "proto.pr",
            json!({"schemaVersion": 1, "number": 7, "url": "u"}),
        )];
        let err = parse_proto_events(&rows).expect_err("must refuse");
        assert!(
            matches!(err, ProtoError::MalformedEvent { event_id: 3, .. }),
            "{err}"
        );
    }

    #[test]
    fn unknown_schema_version_is_malformed() {
        let rows = vec![row(
            4,
            "proto.pr",
            json!({"schemaVersion": 2, "number": 7, "isDraft": true, "url": "u"}),
        )];
        let err = parse_proto_events(&rows).expect_err("must refuse");
        assert!(matches!(err, ProtoError::MalformedEvent { .. }), "{err}");
    }

    #[test]
    fn canonically_equal_duplicates_collapse_and_differing_ones_refuse() {
        let payload = json!({"schemaVersion": 1, "number": 7, "isDraft": true, "url": "u"});
        let rows = vec![
            row(1, "proto.pr", payload.clone()),
            row(2, "proto.pr", payload),
        ];
        assert_eq!(parse_proto_events(&rows).expect("parses").len(), 1);

        let rows = vec![
            row(
                1,
                "proto.pr",
                json!({"schemaVersion": 1, "number": 7, "isDraft": true, "url": "u"}),
            ),
            row(
                2,
                "proto.pr",
                json!({"schemaVersion": 1, "number": 8, "isDraft": true, "url": "u"}),
            ),
        ];
        let err = parse_proto_events(&rows).expect_err("must refuse");
        assert!(
            matches!(err, ProtoError::MalformedEvent { event_id: 2, .. }),
            "{err}"
        );
    }

    // The amended rule is canonical-JSON equality, so a re-serialized
    // duplicate whose keys landed in a different order is the same event —
    // and an unknown extra key, which the parser ignores, is not.
    #[test]
    fn duplicates_are_judged_canonically_not_by_raw_bytes() {
        let mut rows = vec![
            raw_row(
                1,
                "proto.retry",
                r#"{"schemaVersion":1,"packetId":"run-1/fix/1","transportFailures":1,
                    "retryAfter":"2026-08-12T00:00:30.000000000Z"}"#,
            ),
            raw_row(
                2,
                "proto.retry",
                r#"{ "retryAfter": "2026-08-12T00:00:30.000000000Z", "transportFailures": 1,
                     "packetId": "run-1/fix/1", "schemaVersion": 1 }"#,
            ),
        ];
        assert_ne!(
            rows[0].payload_json, rows[1].payload_json,
            "the fixture must differ in raw bytes for this test to mean anything"
        );
        assert_eq!(
            parse_proto_events(&rows).expect("parses").len(),
            1,
            "key order and whitespace are not differences"
        );

        // A canonically different second payload under the same logical key
        // still refuses: same packet and count, a moved deadline.
        rows[1] = row(
            2,
            "proto.retry",
            json!({"schemaVersion": 1, "packetId": "run-1/fix/1",
                   "transportFailures": 1, "retryAfter": "2026-08-12T00:01:00.000000000Z"}),
        );
        let err = parse_proto_events(&rows).expect_err("must refuse");
        assert!(
            matches!(err, ProtoError::MalformedEvent { event_id: 2, .. }),
            "{err}"
        );
    }

    #[test]
    fn the_writer_refuses_what_the_parser_would_refuse() {
        // A verdict alongside `available: false` is exactly the payload
        // `parse_review` rejects, so it never reaches the ledger.
        let err = ProtoEvent::Review {
            seq: 1,
            stage: Stage::ReviewCodex,
            verdict: Some(Verdict::Approve),
            available: false,
        }
        .payload()
        .expect_err("must refuse");
        assert!(matches!(err, ProtoError::Projection(_)), "{err}");

        let err = ProtoEvent::Review {
            seq: 1,
            stage: Stage::ReviewClaude,
            verdict: None,
            available: true,
        }
        .payload()
        .expect_err("must refuse");
        assert!(matches!(err, ProtoError::Projection(_)), "{err}");

        let err = ProtoEvent::Review {
            seq: 1,
            stage: Stage::Implement,
            verdict: Some(Verdict::Approve),
            available: true,
        }
        .payload()
        .expect_err("must refuse");
        assert!(matches!(err, ProtoError::Projection(_)), "{err}");

        // The honest absence still records.
        ProtoEvent::Review {
            seq: 1,
            stage: Stage::ReviewCodex,
            verdict: None,
            available: false,
        }
        .payload()
        .expect("an absent leg is recordable");
    }

    #[test]
    fn review_verdict_must_be_null_exactly_when_unavailable() {
        let bad_available = json!({
            "schemaVersion": 1, "seq": 1, "stage": "reviewclaude",
            "verdict": null, "available": true
        });
        let bad_absent = json!({
            "schemaVersion": 1, "seq": 1, "stage": "reviewcodex",
            "verdict": "approve", "available": false
        });
        for payload in [bad_available, bad_absent] {
            let rows = vec![row(1, "proto.review", payload)];
            let err = parse_proto_events(&rows).expect_err("must refuse");
            assert!(matches!(err, ProtoError::MalformedEvent { .. }), "{err}");
        }
        let good = json!({
            "schemaVersion": 1, "seq": 1, "stage": "reviewcodex",
            "verdict": null, "available": false
        });
        let parsed = parse_proto_events(&[row(1, "proto.review", good)]).expect("parses");
        assert_eq!(
            parsed,
            vec![ProtoEvent::Review {
                seq: 1,
                stage: Stage::ReviewCodex,
                verdict: None,
                available: false
            }]
        );
    }

    #[test]
    fn non_review_stage_in_review_event_is_malformed() {
        let rows = vec![row(
            1,
            "proto.review",
            json!({
                "schemaVersion": 1, "seq": 1, "stage": "implement",
                "verdict": "approve", "available": true
            }),
        )];
        let err = parse_proto_events(&rows).expect_err("must refuse");
        assert!(matches!(err, ProtoError::MalformedEvent { .. }), "{err}");
    }
}
