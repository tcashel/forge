//! One derived work lifecycle. Ledger facts are normalized at the edge and
//! the stage decision itself is a pure function, so every projection uses
//! the same revision binding and precedence.

use std::collections::{BTreeMap, BTreeSet};

use forged_ledger::{
    DesiredState, DesiredSubjectKind, RunOutcome, RunState, WorkItemSnapshot, WorkKind,
    WorkNoteKind, WorkStatus,
};
use forged_types::{
    AdjudicationRefV1, AdjudicationV1, AttentionItemV1, AttentionState, SpecRecommendationsV1,
};

use crate::core::{on_ledger, Ctx, Failure};

#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "lowercase")]
pub(crate) enum LifecycleStage {
    Drafted,
    Critiqued,
    Adjudicated,
    Ready,
    Dispatched,
    Deciding,
    Reviewed,
    Landed,
    Closed,
    Blocked,
    Parked,
}

impl LifecycleStage {
    pub(crate) fn is_at_least_adjudicated(self) -> bool {
        matches!(
            self,
            Self::Adjudicated
                | Self::Ready
                | Self::Dispatched
                | Self::Deciding
                | Self::Reviewed
                | Self::Landed
                | Self::Closed
        )
    }

    pub(crate) const fn as_str(self) -> &'static str {
        match self {
            Self::Drafted => "drafted",
            Self::Critiqued => "critiqued",
            Self::Adjudicated => "adjudicated",
            Self::Ready => "ready",
            Self::Dispatched => "dispatched",
            Self::Deciding => "deciding",
            Self::Reviewed => "reviewed",
            Self::Landed => "landed",
            Self::Closed => "closed",
            Self::Blocked => "blocked",
            Self::Parked => "parked",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct LifecycleBasis {
    pub(crate) revision: i64,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub(crate) note_ids: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) run_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) attention_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct Lifecycle {
    pub(crate) stage: LifecycleStage,
    pub(crate) since: String,
    pub(crate) basis: LifecycleBasis,
}

#[derive(Debug, Clone)]
struct NoteFact {
    note_id: String,
    revision: i64,
    kind: WorkNoteKind,
    body_json: String,
    written_at: String,
}

#[derive(Debug, Clone)]
struct RunFact {
    run_id: String,
    active: bool,
    landed: bool,
    delivered: bool,
    pinned_revision: Option<i64>,
    created_at: String,
    updated_at: String,
    reviewed_at: Option<String>,
}

#[derive(Debug, Clone)]
struct AttentionFact {
    attention_id: String,
    open_decision: bool,
    updated_at: String,
}

#[derive(Debug, Clone)]
struct ChildFact {
    status: WorkStatus,
    lifecycle: Lifecycle,
    run_ids: BTreeSet<String>,
}

#[derive(Debug, Clone)]
struct Facts {
    work_id: String,
    kind: WorkKind,
    status: WorkStatus,
    revision: i64,
    notes_text: String,
    updated_at: String,
    on_frontier: bool,
    notes: Vec<NoteFact>,
    runs: Vec<RunFact>,
    attention: Vec<AttentionFact>,
    children: Vec<ChildFact>,
    epic_dispatched_at: Option<String>,
    epic_reviewed_at: Option<String>,
    epic_landed_at: Option<String>,
}

fn basis(
    revision: i64,
    note_ids: impl IntoIterator<Item = String>,
    run_id: Option<String>,
    attention_id: Option<String>,
) -> LifecycleBasis {
    let mut note_ids = note_ids.into_iter().collect::<Vec<_>>();
    note_ids.sort();
    note_ids.dedup();
    LifecycleBasis {
        revision,
        note_ids,
        run_id,
        attention_id,
    }
}

fn lifecycle(
    facts: &Facts,
    stage: LifecycleStage,
    since: impl Into<String>,
    note_ids: impl IntoIterator<Item = String>,
    run_id: Option<String>,
    attention_id: Option<String>,
) -> Lifecycle {
    Lifecycle {
        stage,
        since: since.into(),
        basis: basis(facts.revision, note_ids, run_id, attention_id),
    }
}

fn unchecked_notes(notes: &str) -> bool {
    notes
        .lines()
        .any(|line| line.trim_start().starts_with("- [ ]"))
}

fn current_recommendation(facts: &Facts) -> Option<&NoteFact> {
    facts
        .notes
        .iter()
        .filter(|note| note.kind == WorkNoteKind::Recommendation && note.revision == facts.revision)
        .max_by(|left, right| {
            (left.written_at.as_str(), left.note_id.as_str())
                .cmp(&(right.written_at.as_str(), right.note_id.as_str()))
        })
}

fn valid_adjudication(facts: &Facts) -> Option<(&NoteFact, &NoteFact)> {
    let adjudication_note = facts
        .notes
        .iter()
        .filter(|note| note.kind == WorkNoteKind::Adjudication)
        .max_by(|left, right| {
            (left.written_at.as_str(), left.note_id.as_str())
                .cmp(&(right.written_at.as_str(), right.note_id.as_str()))
        })?;
    let body = serde_json::from_str(&adjudication_note.body_json).ok()?;
    let adjudication = AdjudicationV1::parse_value(body).ok()?;
    if adjudication.work_item != facts.work_id
        || adjudication_note.revision != facts.revision
        || i64::try_from(adjudication.resulting_revision).ok()? != facts.revision
    {
        return None;
    }
    let recommendation = facts.notes.iter().find(|note| {
        note.note_id == adjudication.recommendation_note_id
            && note.kind == WorkNoteKind::Recommendation
    })?;
    if u64::try_from(recommendation.revision).ok()? != adjudication.critiqued_revision {
        return None;
    }
    let recommendation_body = serde_json::from_str(&recommendation.body_json).ok()?;
    let recommendation_contract = SpecRecommendationsV1::parse_value(recommendation_body).ok()?;
    if recommendation_contract.work_item != facts.work_id {
        return None;
    }
    let mut findings = BTreeSet::new();
    let mut cruxes = BTreeSet::new();
    for disposition in &adjudication.dispositions {
        match &disposition.reference {
            AdjudicationRefV1::Finding(reference)
                if reference.note_id == recommendation.note_id
                    && usize::try_from(reference.index).ok().is_some_and(|index| {
                        index < recommendation_contract.recommendations.len()
                    }) =>
            {
                findings.insert(reference.index);
            }
            AdjudicationRefV1::Crux(reference)
                if reference.note_id == recommendation.note_id
                    && recommendation_contract
                        .cruxes
                        .iter()
                        .any(|crux| crux.id == reference.crux_id) =>
            {
                cruxes.insert(reference.crux_id.as_str());
            }
            _ => return None,
        }
    }
    (findings.len() == recommendation_contract.recommendations.len()
        && cruxes.len() == recommendation_contract.cruxes.len())
    .then_some((adjudication_note, recommendation))
}

fn derive(facts: &Facts) -> Lifecycle {
    if facts.status == WorkStatus::Closed {
        return lifecycle(
            facts,
            LifecycleStage::Closed,
            &facts.updated_at,
            [],
            None,
            None,
        );
    }
    if facts.status == WorkStatus::Deferred {
        let park = facts
            .notes
            .iter()
            .filter(|note| note.kind == WorkNoteKind::Decision)
            .filter_map(|note| {
                let body =
                    serde_json::from_str::<forged_types::DecisionV1>(&note.body_json).ok()?;
                (body.kind == forged_types::DecisionKind::Park && body.choice == "park")
                    .then_some(note)
            })
            .next_back();
        return lifecycle(
            facts,
            LifecycleStage::Parked,
            park.map_or(facts.updated_at.as_str(), |note| note.written_at.as_str()),
            park.into_iter().map(|note| note.note_id.clone()),
            None,
            None,
        );
    }
    if facts.kind == WorkKind::Epic {
        if let Some(since) = &facts.epic_landed_at {
            return lifecycle(facts, LifecycleStage::Landed, since, [], None, None);
        }
        if let Some(since) = &facts.epic_reviewed_at {
            return lifecycle(facts, LifecycleStage::Reviewed, since, [], None, None);
        }
        if let Some(attention) = facts.attention.iter().find(|item| item.open_decision) {
            return lifecycle(
                facts,
                LifecycleStage::Deciding,
                &attention.updated_at,
                [],
                None,
                Some(attention.attention_id.clone()),
            );
        }
        if let Some(since) = &facts.epic_dispatched_at {
            return lifecycle(facts, LifecycleStage::Dispatched, since, [], None, None);
        }
        if facts.status == WorkStatus::Blocked || unchecked_notes(&facts.notes_text) {
            return lifecycle(
                facts,
                LifecycleStage::Blocked,
                &facts.updated_at,
                [],
                None,
                None,
            );
        }
        let open_children = facts
            .children
            .iter()
            .filter(|child| child.status == WorkStatus::Open)
            .collect::<Vec<_>>();
        if !open_children.is_empty()
            && open_children
                .iter()
                .all(|child| child.lifecycle.stage.is_at_least_adjudicated())
        {
            let newest = open_children
                .iter()
                .max_by_key(|child| child.lifecycle.since.as_str())
                .expect("nonempty open children");
            let note_ids = open_children
                .iter()
                .flat_map(|child| child.lifecycle.basis.note_ids.clone());
            return lifecycle(
                facts,
                LifecycleStage::Adjudicated,
                &newest.lifecycle.since,
                note_ids,
                None,
                None,
            );
        }
        return lifecycle(
            facts,
            LifecycleStage::Drafted,
            &facts.updated_at,
            [],
            None,
            None,
        );
    }

    let current_run = facts.runs.last();
    if let Some(run) =
        facts.runs.iter().rev().find(|run| {
            (run.landed || run.delivered) && run.pinned_revision == Some(facts.revision)
        })
    {
        return lifecycle(
            facts,
            LifecycleStage::Landed,
            &run.updated_at,
            [],
            Some(run.run_id.clone()),
            None,
        );
    }
    if let Some(run) = current_run
        .filter(|run| run.reviewed_at.is_some() && run.pinned_revision == Some(facts.revision))
    {
        return lifecycle(
            facts,
            LifecycleStage::Reviewed,
            run.reviewed_at.as_deref().unwrap_or(&run.updated_at),
            [],
            Some(run.run_id.clone()),
            None,
        );
    }
    if let Some(attention) = facts.attention.iter().find(|item| item.open_decision) {
        return lifecycle(
            facts,
            LifecycleStage::Deciding,
            &attention.updated_at,
            [],
            current_run.map(|run| run.run_id.clone()),
            Some(attention.attention_id.clone()),
        );
    }
    if let Some(run) = facts.runs.iter().rev().find(|run| run.active) {
        return lifecycle(
            facts,
            LifecycleStage::Dispatched,
            &run.created_at,
            [],
            Some(run.run_id.clone()),
            None,
        );
    }
    if facts.status == WorkStatus::Blocked || unchecked_notes(&facts.notes_text) {
        return lifecycle(
            facts,
            LifecycleStage::Blocked,
            &facts.updated_at,
            [],
            None,
            None,
        );
    }
    if let Some((adjudication, recommendation)) = valid_adjudication(facts) {
        let notes = [recommendation.note_id.clone(), adjudication.note_id.clone()];
        return lifecycle(
            facts,
            if facts.on_frontier {
                LifecycleStage::Ready
            } else {
                LifecycleStage::Adjudicated
            },
            &adjudication.written_at,
            notes,
            None,
            None,
        );
    }
    if let Some(recommendation) = current_recommendation(facts) {
        return lifecycle(
            facts,
            LifecycleStage::Critiqued,
            &recommendation.written_at,
            [recommendation.note_id.clone()],
            None,
            None,
        );
    }
    lifecycle(
        facts,
        LifecycleStage::Drafted,
        &facts.updated_at,
        [],
        None,
        None,
    )
}

fn decision_attention(item: &AttentionItemV1) -> bool {
    item.state == AttentionState::Open
        && super::attention::classification(item.condition)
            == super::attention::AttentionClass::Decision
}

/// Load lifecycle evidence once per source and join it to the requested work
/// items. Callers pass the attention fold they already computed so list
/// projections never fold attention per row.
pub(crate) async fn project(
    ctx: &Ctx,
    items: &[WorkItemSnapshot],
    attention: &[AttentionItemV1],
) -> Result<BTreeMap<String, Lifecycle>, Failure> {
    let item_ids = items
        .iter()
        .map(|item| item.work_id.clone())
        .collect::<Vec<_>>();
    let epic_ids = items
        .iter()
        .filter(|item| item.kind == WorkKind::Epic)
        .map(|item| item.work_id.clone())
        .collect::<Vec<_>>();
    let snapshot = on_ledger(&ctx.ledger, {
        let item_ids = item_ids.clone();
        let epic_ids = epic_ids.clone();
        move |ledger| {
            ledger.work_lifecycle_snapshot(
                &item_ids,
                &epic_ids,
                "run.protocol-terminal",
                super::epic::EPIC_PR,
            )
        }
    })
    .await?;
    let children = snapshot.children;
    let mut all_items = items
        .iter()
        .map(|item| (item.work_id.clone(), item.clone()))
        .collect::<BTreeMap<_, _>>();
    for child in children.values().flatten() {
        all_items
            .entry(child.work_id.clone())
            .or_insert_with(|| child.clone());
    }
    let notes = snapshot.notes;
    let runs = snapshot.runs;
    let packets = snapshot.packets;
    let desired = snapshot.desired_work;
    let epic_prs = snapshot.epic_pr_events;
    let ready_ids = snapshot.ready_work_ids;
    let mut reviewed_at_by_run = BTreeMap::new();
    for event in snapshot.terminal_events {
        let delivered = serde_json::from_str::<serde_json::Value>(&event.payload_json)
            .ok()
            .and_then(|payload| payload.pointer("/delivery/pr").cloned())
            .is_some_and(|pr| !pr.is_null());
        if delivered {
            if let Some(run_id) = event.run_id {
                reviewed_at_by_run.insert(run_id, event.ts);
            }
        }
    }

    let make_facts = |item: &WorkItemSnapshot, child_facts: Vec<ChildFact>| {
        let item_runs = runs
            .iter()
            .filter(|run| run.work_id == item.work_id)
            .map(|run| {
                let pinned_revision = packets
                    .iter()
                    .rev()
                    .find(|packet| packet.run_id == run.run_id)
                    .and_then(|packet| packet.spec_revision.as_deref())
                    .and_then(|revision| revision.parse::<i64>().ok());
                RunFact {
                    run_id: run.run_id.clone(),
                    active: run.state == RunState::Active,
                    landed: run.terminal_outcome == Some(RunOutcome::Landed),
                    delivered: run.delivery_pr.is_some() && run.delivery_sha.is_some(),
                    pinned_revision,
                    created_at: run.created_at.clone(),
                    updated_at: run.updated_at.clone(),
                    reviewed_at: reviewed_at_by_run.get(&run.run_id).cloned(),
                }
            })
            .collect::<Vec<_>>();
        let child_subjects = child_facts
            .iter()
            .flat_map(|child| child.run_ids.iter().cloned())
            .collect::<BTreeSet<_>>();
        let current_run_id = item_runs.last().map(|run| run.run_id.as_str());
        let item_attention = attention
            .iter()
            .filter(|attention| {
                current_run_id == Some(attention.subject_id.as_str())
                    || (item.kind == WorkKind::Epic
                        && (attention.subject_id == item.work_id
                            || child_subjects.contains(&attention.subject_id)))
            })
            .map(|attention| AttentionFact {
                attention_id: attention.attention_id.clone(),
                open_decision: decision_attention(attention),
                updated_at: attention.updated_at.clone(),
            })
            .collect::<Vec<_>>();
        let epic_landed_at = item_runs
            .iter()
            .rev()
            .find(|run| run.landed && run.pinned_revision == Some(item.revision))
            .map(|run| run.updated_at.clone());
        let epic_dispatched_at = desired
            .iter()
            .find(|row| {
                row.subject_kind == DesiredSubjectKind::Epic
                    && row.subject_id == item.work_id
                    && row.desired_state == DesiredState::Running
            })
            .map(|row| row.updated_at.clone());
        // Only the terminal PR (the one opened against the default branch)
        // means the epic is under review; a rolling epic's assurance PRs carry
        // `terminal: false` and must not mask `dispatched` or `deciding`.
        let epic_reviewed_at = epic_prs
            .iter()
            .rev()
            .filter(|event| event.run_id.as_deref() == Some(item.work_id.as_str()))
            .find(|event| {
                serde_json::from_str::<serde_json::Value>(&event.payload_json)
                    .ok()
                    .and_then(|payload| {
                        payload.get("terminal").and_then(serde_json::Value::as_bool)
                    })
                    == Some(true)
            })
            .map(|event| event.ts.clone());
        Facts {
            work_id: item.work_id.clone(),
            kind: item.kind,
            status: item.status,
            revision: item.revision,
            notes_text: item.spec.notes.clone(),
            updated_at: item.updated_at.clone(),
            on_frontier: ready_ids.contains(&item.work_id),
            notes: notes
                .iter()
                .filter(|note| note.work_id == item.work_id)
                .map(|note| NoteFact {
                    note_id: note.note_id.clone(),
                    revision: note.revision,
                    kind: note.kind,
                    body_json: note.body_json.clone(),
                    written_at: note.written_at.clone(),
                })
                .collect(),
            runs: item_runs,
            attention: item_attention,
            children: child_facts,
            epic_dispatched_at,
            epic_reviewed_at,
            epic_landed_at,
        }
    };

    let mut base = BTreeMap::new();
    for item in all_items
        .values()
        .filter(|item| item.kind != WorkKind::Epic)
    {
        base.insert(item.work_id.clone(), derive(&make_facts(item, Vec::new())));
    }
    let mut projected = BTreeMap::new();
    for item in items {
        let child_facts = children
            .get(&item.work_id)
            .into_iter()
            .flatten()
            .filter_map(|child| {
                base.get(&child.work_id)
                    .cloned()
                    .map(|lifecycle| ChildFact {
                        status: child.status,
                        lifecycle,
                        run_ids: runs
                            .iter()
                            .filter(|run| run.work_id == child.work_id)
                            .map(|run| run.run_id.clone())
                            .collect(),
                    })
            })
            .collect();
        projected.insert(item.work_id.clone(), derive(&make_facts(item, child_facts)));
    }
    Ok(projected)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn facts() -> Facts {
        Facts {
            work_id: "work".to_owned(),
            kind: WorkKind::Task,
            status: WorkStatus::Open,
            revision: 1,
            notes_text: String::new(),
            updated_at: "2026-09-03T12:00:00Z".to_owned(),
            on_frontier: false,
            notes: Vec::new(),
            runs: Vec::new(),
            attention: Vec::new(),
            children: Vec::new(),
            epic_dispatched_at: None,
            epic_reviewed_at: None,
            epic_landed_at: None,
        }
    }

    fn adjudicated_facts(on_frontier: bool) -> Facts {
        let mut facts = facts();
        facts.on_frontier = on_frontier;
        facts.notes = vec![
            NoteFact {
                note_id: "recommendation".to_owned(),
                revision: 1,
                kind: WorkNoteKind::Recommendation,
                body_json: serde_json::json!({
                    "schema": "forged.spec-recommendations/1",
                    "revision": 1,
                    "workItem": "work",
                    "repository": "/repo",
                    "reviewedAt": "2026-09-03T12:00:00Z",
                    "recommendations": [{"target": "spec", "correction": "tighten"}],
                    "cruxes": [{
                        "id": "CRUX-1",
                        "evidence": ["spec"],
                        "options": ["a", "b"],
                        "recommendation": "a"
                    }]
                })
                .to_string(),
                written_at: "2026-09-03T12:01:00Z".to_owned(),
            },
            NoteFact {
                note_id: "adjudication".to_owned(),
                revision: 1,
                kind: WorkNoteKind::Adjudication,
                body_json: serde_json::json!({
                    "schema": "forged.adjudication/1",
                    "revision": 1,
                    "workItem": "work",
                    "critiquedRevision": 1,
                    "recommendationNoteId": "recommendation",
                    "resultingRevision": 1,
                    "dispositions": [
                        {
                            "ref": {"noteId": "recommendation", "index": 0},
                            "disposition": "accept",
                            "reason": "accepted"
                        },
                        {
                            "ref": {"noteId": "recommendation", "cruxId": "CRUX-1"},
                            "disposition": "accept",
                            "reason": "chosen"
                        }
                    ],
                    "cruxes": [{"id": "CRUX-1", "choice": "a", "rationale": "best"}],
                    "adjudicatedAt": "2026-09-03T12:02:00Z",
                    "actor": "operator"
                })
                .to_string(),
                written_at: "2026-09-03T12:02:00Z".to_owned(),
            },
        ];
        facts
    }

    #[test]
    fn stage_table_covers_sequence_holds_and_epic_arm() {
        let mut cases = Vec::new();
        let drafted = facts();
        cases.push((drafted, LifecycleStage::Drafted));

        let mut critiqued = facts();
        critiqued.notes.push(NoteFact {
            note_id: "recommendation".to_owned(),
            revision: 1,
            kind: WorkNoteKind::Recommendation,
            body_json: "{}".to_owned(),
            written_at: critiqued.updated_at.clone(),
        });
        cases.push((critiqued, LifecycleStage::Critiqued));

        cases.push((adjudicated_facts(false), LifecycleStage::Adjudicated));
        cases.push((adjudicated_facts(true), LifecycleStage::Ready));

        let mut blocked = facts();
        blocked.status = WorkStatus::Blocked;
        cases.push((blocked, LifecycleStage::Blocked));

        let mut parked = facts();
        parked.status = WorkStatus::Deferred;
        cases.push((parked, LifecycleStage::Parked));

        let mut dispatched = facts();
        dispatched.runs.push(RunFact {
            run_id: "run".to_owned(),
            active: true,
            landed: false,
            delivered: false,
            pinned_revision: Some(1),
            created_at: dispatched.updated_at.clone(),
            updated_at: dispatched.updated_at.clone(),
            reviewed_at: None,
        });
        cases.push((dispatched, LifecycleStage::Dispatched));

        let mut deciding = facts();
        deciding.attention.push(AttentionFact {
            attention_id: "attention".to_owned(),
            open_decision: true,
            updated_at: deciding.updated_at.clone(),
        });
        cases.push((deciding, LifecycleStage::Deciding));

        let mut reviewed = facts();
        reviewed.runs.push(RunFact {
            run_id: "run".to_owned(),
            active: false,
            landed: false,
            delivered: false,
            pinned_revision: Some(1),
            created_at: reviewed.updated_at.clone(),
            updated_at: reviewed.updated_at.clone(),
            reviewed_at: Some(reviewed.updated_at.clone()),
        });
        cases.push((reviewed, LifecycleStage::Reviewed));

        let mut landed = facts();
        landed.runs.push(RunFact {
            run_id: "run".to_owned(),
            active: false,
            landed: true,
            delivered: true,
            pinned_revision: Some(1),
            created_at: landed.updated_at.clone(),
            updated_at: landed.updated_at.clone(),
            reviewed_at: None,
        });
        cases.push((landed, LifecycleStage::Landed));

        let mut closed = facts();
        closed.status = WorkStatus::Closed;
        cases.push((closed, LifecycleStage::Closed));

        let mut epic = facts();
        epic.kind = WorkKind::Epic;
        let child_lifecycle = derive(&adjudicated_facts(false));
        epic.children.push(ChildFact {
            status: WorkStatus::Open,
            lifecycle: child_lifecycle,
            run_ids: BTreeSet::new(),
        });
        cases.push((epic, LifecycleStage::Adjudicated));

        for (facts, expected) in cases {
            assert_eq!(derive(&facts).stage, expected);
        }
    }

    #[test]
    fn adjudication_is_bound_to_the_resulting_revision() {
        let adjudicated = adjudicated_facts(false);
        assert_eq!(derive(&adjudicated).stage, LifecycleStage::Adjudicated);

        let mut revised = adjudicated;
        revised.revision = 2;
        assert_eq!(derive(&revised).stage, LifecycleStage::Drafted);
    }

    #[test]
    fn execution_and_decision_evidence_precede_a_blocked_hold() {
        let mut running = facts();
        running.status = WorkStatus::Blocked;
        running.notes_text = "- [ ] stale planning hold".to_owned();
        running.runs.push(RunFact {
            run_id: "run-active".to_owned(),
            active: true,
            landed: false,
            delivered: false,
            pinned_revision: Some(1),
            created_at: running.updated_at.clone(),
            updated_at: running.updated_at.clone(),
            reviewed_at: None,
        });
        let projected = derive(&running);
        assert_eq!(projected.stage, LifecycleStage::Dispatched);
        assert_eq!(projected.basis.run_id.as_deref(), Some("run-active"));

        running.runs[0].active = false;
        running.attention.push(AttentionFact {
            attention_id: "decision".to_owned(),
            open_decision: true,
            updated_at: running.updated_at.clone(),
        });
        let projected = derive(&running);
        assert_eq!(projected.stage, LifecycleStage::Deciding);
        assert_eq!(projected.basis.run_id.as_deref(), Some("run-active"));
        assert_eq!(projected.basis.attention_id.as_deref(), Some("decision"));
    }

    #[test]
    fn landed_evidence_is_bound_to_the_current_work_revision() {
        let mut landed = facts();
        landed.runs.push(RunFact {
            run_id: "run-landed".to_owned(),
            active: false,
            landed: true,
            delivered: true,
            pinned_revision: Some(1),
            created_at: landed.updated_at.clone(),
            updated_at: landed.updated_at.clone(),
            reviewed_at: None,
        });
        assert_eq!(derive(&landed).stage, LifecycleStage::Landed);

        landed.revision = 2;
        assert_eq!(derive(&landed).stage, LifecycleStage::Drafted);
        assert_eq!(derive(&landed).basis.revision, 2);
    }
}
