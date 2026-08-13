//! Where a run's spec comes from, and how it is pinned.
//!
//! The bead is the source of truth: its `description`,
//! `acceptance_criteria`, `design`, and `notes` fields ARE the spec body,
//! assembled here in one documented order so every seat of a packet reads
//! identical bytes. The bead's opaque `revision` is the packet's drift
//! fence, replacing the file hash.
//!
//! `--spec <path>` is deprecated but still honored for one release, so a
//! file-sourced run keeps working with the hash fence it was opened under.
//!
//! BD READ BUDGET: exactly one bead read per packet open and one per claim,
//! never one per seat — the bd gate lock is shared with live runs, and a
//! read storm during a wave would contend with an epic scheduler's own bd
//! traffic.

use std::path::Path;

use forged_beads::{BdError, IssueSummary};
use forged_ledger::SpecFence;
use forged_types::{ErrorCode, SpecRef};

use crate::adapters::execute::sha256_file;
use crate::core::{Ctx, Failure};

/// The file a bead-sourced packet's body is materialized into, inside the
/// packet directory the seat already works from.
pub const BEAD_SPEC_FILE: &str = "spec.md";

/// One spec section: the bd field name it maps to, and how to read it.
type Section = (&'static str, fn(&IssueSummary) -> String);

/// The spec sections, in the order they are assembled, paired with the bead
/// field each one comes from.
const SECTIONS: [Section; 4] = [
    ("description", |issue| prose(&issue.description)),
    ("acceptance_criteria", |issue| {
        issue.acceptance_criteria.clone()
    }),
    ("design", |issue| issue.design.clone()),
    ("notes", |issue| issue.notes.clone()),
];

/// A description with forged's own pointer lines removed.
///
/// `spec:` and `repo:` are addressing, not prose: a bead whose description
/// is nothing but pointers carries no spec of its own and still belongs to
/// the file route, and one that carries both must not hand its seat a stray
/// pointer line.
fn prose(description: &str) -> String {
    description
        .lines()
        .filter(|line| {
            let trimmed = line.trim();
            !(trimmed.starts_with("spec:") || trimmed.starts_with("repo:"))
        })
        .collect::<Vec<_>>()
        .join("\n")
}

/// The heading each section is rendered under.
const HEADINGS: [&str; 4] = [
    "",
    "## Acceptance Criteria",
    "## Implementation Notes",
    "## Agent Instructions",
];

/// Where a run's spec body comes from.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SpecSource {
    /// The bead's own fields — the supported route.
    Bead(String),
    /// A markdown file at this path — deprecated, honored for one release.
    File(String),
}

/// A spec resolved once, for one packet open or one claim.
#[derive(Debug, Clone, PartialEq)]
pub struct ResolvedSpec {
    /// The rendered body, present only for a bead-sourced spec; a
    /// file-sourced one is already on disk where the seat expects it.
    pub body: Option<String>,
    /// SHA-256 over the bytes the seat reads.
    pub sha256: String,
    /// The fence this spec is pinned by.
    pub fence: SpecFence,
}

impl ResolvedSpec {
    /// The pinned bead revision, or `None` for a file-sourced spec.
    pub fn revision(&self) -> Option<String> {
        match &self.fence {
            SpecFence::Revision(revision) => Some(revision.clone()),
            SpecFence::Sha256(_) => None,
        }
    }
}

/// Assemble the spec body from a bead's fields, in the documented section
/// order. Deterministic by construction: the same bead revision always
/// renders the same bytes, which is what lets the revision fence stand in
/// for a content hash.
pub fn render_body(issue: &IssueSummary) -> String {
    let mut out = String::new();
    for (index, (_, field)) in SECTIONS.iter().enumerate() {
        let rendered = field(issue);
        let text = rendered.trim();
        if text.is_empty() {
            continue;
        }
        if !out.is_empty() {
            out.push('\n');
        }
        let heading = HEADINGS[index];
        if !heading.is_empty() {
            out.push_str(heading);
            out.push_str("\n\n");
        }
        out.push_str(text);
        out.push('\n');
    }
    out
}

/// The bead fields a spec needs that this bead leaves empty, named as bd
/// names them. An empty return means the bead carries a spec.
pub fn empty_spec_fields(issue: &IssueSummary) -> Vec<&'static str> {
    SECTIONS
        .iter()
        .filter(|(_, field)| field(issue).trim().is_empty())
        .map(|(name, _)| *name)
        .collect::<Vec<_>>()
}

/// Whether this bead carries a spec of its own — any one populated section
/// is enough. `false` is the bead that must still point at a spec file.
pub fn carries_spec(issue: &IssueSummary) -> bool {
    empty_spec_fields(issue).len() < SECTIONS.len()
}

/// SHA-256 hex over in-memory bytes.
fn sha256_bytes(bytes: &[u8]) -> String {
    use sha2::{Digest, Sha256};
    let mut hex = String::with_capacity(64);
    for byte in Sha256::digest(bytes) {
        use std::fmt::Write as _;
        let _ = write!(hex, "{byte:02x}");
    }
    hex
}

/// A bd read that failed on the spec path is TRANSPORT, never drift and
/// never terminal: bd being unreachable says nothing about whether the spec
/// changed. `recoverable` puts it on the caller's existing bounded-retry
/// budget; `SpecDrift` is deliberately unreachable from here.
fn transport(context: &str, err: BdError) -> Failure {
    let code = match &err {
        BdError::Contention { .. } => ErrorCode::BeadsContention,
        _ => ErrorCode::BeadsError,
    };
    Failure {
        code,
        message: format!("transport: {context}: {err}"),
        recoverable: true,
    }
}

/// Read one bead, budgeting exactly one bd call.
async fn read_bead(ctx: &Ctx, bead_id: &str) -> Result<IssueSummary, Failure> {
    forged_beads::show_issue(&ctx.config.bd_config(), bead_id)
        .await
        .map_err(|err| transport(&format!("reading bead {bead_id}"), err))
}

/// Resolve a bead into a spec: one read, rendered body, revision fence.
///
/// Refused when the bead carries no spec at all — a seat handed an empty
/// spec is worse than a run that never started, so the refusal names the
/// bead and every empty field.
pub async fn resolve_bead(ctx: &Ctx, bead_id: &str) -> Result<ResolvedSpec, Failure> {
    let issue = read_bead(ctx, bead_id).await?;
    if !carries_spec(&issue) {
        return Err(Failure::invalid(format!(
            "bead {bead_id} carries no spec: {} are all empty",
            empty_spec_fields(&issue).join(", ")
        )));
    }
    let revision = issue.revision.clone().ok_or_else(|| {
        Failure::invalid(format!(
            "bead {bead_id} reports no revision; a bead-sourced spec cannot be fenced without one"
        ))
    })?;
    let body = render_body(&issue);
    Ok(ResolvedSpec {
        sha256: sha256_bytes(body.as_bytes()),
        body: Some(body),
        fence: SpecFence::Revision(revision),
    })
}

/// Resolve a spec file: the deprecated route, fenced by content hash.
pub fn resolve_file(path: &str) -> Result<ResolvedSpec, Failure> {
    let sha256 = sha256_file(Path::new(path))?;
    Ok(ResolvedSpec {
        body: None,
        fence: SpecFence::Sha256(sha256.clone()),
        sha256,
    })
}

/// Resolve whichever source a run was started from.
pub async fn resolve(ctx: &Ctx, source: &SpecSource) -> Result<ResolvedSpec, Failure> {
    match source {
        SpecSource::Bead(bead_id) => resolve_bead(ctx, bead_id).await,
        SpecSource::File(path) => resolve_file(path),
    }
}

/// Re-resolve the spec an already-open packet pins, for the claim that is
/// about to fence on it. One bd read per claim, not per seat.
pub async fn resolve_for_packet(
    ctx: &Ctx,
    spec: &SpecRef,
    bead_id: &str,
) -> Result<ResolvedSpec, Failure> {
    match spec.revision {
        Some(_) => resolve_bead(ctx, bead_id).await,
        None => resolve_file(&spec.path),
    }
}

/// Write a bead-sourced body where its seat will read it. A file-sourced
/// spec is already on disk and is never rewritten.
pub fn materialize(spec: &ResolvedSpec, path: &Path) -> Result<(), Failure> {
    let Some(body) = &spec.body else {
        return Ok(());
    };
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| Failure::internal(format!("creating {}: {e}", parent.display())))?;
    }
    std::fs::write(path, body)
        .map_err(|e| Failure::internal(format!("writing spec {}: {e}", path.display())))
}

/// Refuse to hand a seat bytes the packet is not pinned to.
///
/// Only bead-sourced packets are checked: their body is materialized from a
/// read that the ledger did not fence (the adoption path claims nothing), so
/// this is the check that keeps every seat of one packet byte-identical.
pub fn assert_pinned(spec: &SpecRef, resolved: &ResolvedSpec) -> Result<(), Failure> {
    let Some(pinned) = &spec.revision else {
        return Ok(());
    };
    if resolved.fence != SpecFence::Revision(pinned.clone()) {
        return Err(Failure::refused(
            ErrorCode::SpecDrift,
            format!("bead moved off the revision this packet pins ({pinned})"),
        ));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn issue() -> IssueSummary {
        IssueSummary {
            id: "bead-1".to_owned(),
            title: "a slice".to_owned(),
            description: "## Context\n\nwhy this exists".to_owned(),
            status: "open".to_owned(),
            issue_type: "task".to_owned(),
            acceptance_criteria: "- it works".to_owned(),
            design: "touch `core/spec.rs`".to_owned(),
            notes: "commit as you go".to_owned(),
            spec_id: None,
            metadata: Default::default(),
            revision: Some("-6192208415116251521".to_owned()),
        }
    }

    #[test]
    fn the_body_follows_the_documented_section_order() {
        let body = render_body(&issue());
        let context = body.find("why this exists").expect("description");
        let acceptance = body.find("## Acceptance Criteria").expect("acceptance");
        let design = body.find("## Implementation Notes").expect("design");
        let notes = body.find("## Agent Instructions").expect("notes");
        assert!(
            context < acceptance && acceptance < design && design < notes,
            "sections must render description, acceptance, design, notes: {body}"
        );
    }

    #[test]
    fn the_body_is_byte_identical_for_the_same_bead() {
        let issue = issue();
        assert_eq!(render_body(&issue), render_body(&issue.clone()));
    }

    #[test]
    fn an_empty_field_contributes_no_heading() {
        let mut issue = issue();
        issue.design = String::new();
        let body = render_body(&issue);
        assert!(
            !body.contains("## Implementation Notes"),
            "an empty field must not leave a bare heading: {body}"
        );
        assert!(body.contains("## Agent Instructions"), "{body}");
    }

    #[test]
    fn empty_spec_fields_names_every_empty_field_as_bd_names_it() {
        let mut issue = issue();
        assert!(empty_spec_fields(&issue).is_empty());
        issue.description = String::new();
        issue.notes = "   \n".to_owned();
        assert_eq!(empty_spec_fields(&issue), vec!["description", "notes"]);
        issue.acceptance_criteria = String::new();
        issue.design = String::new();
        assert_eq!(
            empty_spec_fields(&issue),
            vec!["description", "acceptance_criteria", "design", "notes"]
        );
    }

    #[test]
    fn a_bd_outage_on_the_spec_path_is_recoverable_and_never_drift() {
        let failure = transport(
            "reading bead bead-1",
            BdError::Timeout {
                context: "bd show".to_owned(),
                after_s: 30,
            },
        );
        assert!(failure.recoverable, "a bd outage must stay retryable");
        assert_ne!(
            failure.code,
            ErrorCode::SpecDrift,
            "an unreachable bd says nothing about whether the spec changed"
        );
        assert!(failure.message.starts_with("transport: "), "{failure}");
    }

    #[test]
    fn assert_pinned_refuses_a_bead_that_moved_and_ignores_file_specs() {
        let pinned = SpecRef {
            path: "/runs/r/packets/implementation/0/spec.md".to_owned(),
            sha256: "cafe".to_owned(),
            revision: Some("7".to_owned()),
        };
        let moved = ResolvedSpec {
            body: Some("new".to_owned()),
            sha256: "beef".to_owned(),
            fence: SpecFence::Revision("8".to_owned()),
        };
        let failure = assert_pinned(&pinned, &moved).expect_err("must refuse");
        assert_eq!(failure.code, ErrorCode::SpecDrift);
        let same = ResolvedSpec {
            fence: SpecFence::Revision("7".to_owned()),
            ..moved.clone()
        };
        assert!(assert_pinned(&pinned, &same).is_ok());
        // A file-sourced packet is fenced by the ledger's hash comparison
        // alone; nothing is materialized for it to disagree with.
        let file = SpecRef {
            revision: None,
            ..pinned.clone()
        };
        assert!(assert_pinned(&file, &moved).is_ok());
    }
}
