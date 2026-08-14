//! Where a run's spec comes from, and how it is pinned.
//!
//! The bead is the source of truth: its `description`,
//! `acceptance_criteria`, `design`, and `notes` fields ARE the spec body,
//! assembled here in one documented order so every seat of a packet reads
//! identical bytes. The digest of THAT body is the packet's drift fence,
//! replacing the file hash; the bead's opaque `revision` rides along as
//! bookkeeping only, because bd mints a new one on every write to the bead
//! — forged's own lease claim included — and a fence that moved for a
//! lease write would refuse the run its own crash resume.
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

/// A description with forged's own LEADING pointer block removed.
///
/// `spec:` and `repo:` are addressing, not prose, WHERE FORGED WROTE THEM —
/// at the top. A bead whose description is nothing but that block carries no
/// spec of its own and still belongs to the file route, and one that carries
/// both must not open its seat's spec with a stray addressing line.
///
/// Everywhere else a pointer-shaped line is prose and REACHES THE SEAT
/// verbatim, on purpose.
///
/// The block is only ever the contiguous run of pointer (and blank) lines
/// the writer put at the TOP, and stripping stops at the first line that is
/// neither. Deleting pointer-shaped lines wherever they appear would silently
/// destroy prose — a spec body legitimately says `repo:` inside a fenced
/// block or a bullet, and a seat handed a body with lines quietly missing
/// builds the wrong thing.
fn prose(description: &str) -> String {
    let mut lines = description.lines().peekable();
    while let Some(line) = lines.peek() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with("spec:") || trimmed.starts_with("repo:") {
            lines.next();
        } else {
            break;
        }
    }
    lines.collect::<Vec<_>>().join("\n")
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
    /// Human work context copied from the Bead for provider prompts. This is
    /// explanatory only: the rendered body above remains the requirements
    /// contract and the ledger fence remains the execution authority.
    pub bead_context: Vec<String>,
}

impl ResolvedSpec {
    /// The observed bead revision, or `None` for a file-sourced spec.
    pub fn revision(&self) -> Option<String> {
        match &self.fence {
            SpecFence::Revision { revision, .. } => Some(revision.clone()),
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

/// The sections a spec body cannot do without, as indices into [`SECTIONS`]:
/// prose Context and Acceptance Criteria. `design` and `notes` are
/// commentary — a seat handed those two alone gets no statement of what it
/// is building and no test of when it is done.
const REQUIRED_SECTIONS: [usize; 2] = [0, 1];

/// The required spec fields this bead leaves empty, named as bd names them.
/// An empty return is exactly [`carries_spec`].
pub fn missing_spec_fields(issue: &IssueSummary) -> Vec<&'static str> {
    REQUIRED_SECTIONS
        .iter()
        .map(|index| SECTIONS[*index])
        .filter(|(_, field)| field(issue).trim().is_empty())
        .map(|(name, _)| name)
        .collect::<Vec<_>>()
}

/// Whether this bead carries a spec of its own: BOTH required sections
/// populated, not merely one of the four.
///
/// The bar is deliberately the whole spec, not any fragment of one. A bead
/// with a valid `spec:` pointer and a stray `design` note would otherwise
/// freeze bead-sourced, never read the file it points at, and hand its seat
/// a body with no Context and no Acceptance Criteria. `false` is the bead
/// that must still point at a spec file.
pub fn carries_spec(issue: &IssueSummary) -> bool {
    missing_spec_fields(issue).is_empty()
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

/// A bd read that failed on the spec path is never drift and never
/// terminal for the run: bd's answer, or its silence, says nothing about
/// whether the spec changed. `SpecDrift` is deliberately unreachable here.
///
/// Only a call bd never ANSWERED is recoverable ([`BdError::is_transport`]).
/// A deleted or mistyped bead id is a refusal, not an outage: charging it to
/// the bounded budget would burn every retry and its backoff before the run
/// reported the one thing the operator can act on. The `transport:` prefix
/// is load-bearing — it is what classifies a stored fail note as transport —
/// so only a genuinely unanswered call may carry it.
pub(crate) fn read_failure(context: &str, err: BdError) -> Failure {
    let code = match &err {
        BdError::Contention { .. } => ErrorCode::BeadsContention,
        _ => ErrorCode::BeadsError,
    };
    let recoverable = err.is_transport();
    let label = if recoverable {
        "transport"
    } else {
        "bd refused"
    };
    Failure {
        code,
        message: format!("{label}: {context}: {err}"),
        recoverable,
    }
}

/// The refusal a bead carrying no spec earns.
///
/// It names the bead and EVERY required field that bead left empty, so one
/// reading tells the operator exactly what to write. `design` and `notes`
/// are commentary and are never named: their absence is not a defect.
fn no_spec_refusal(bead_id: &str, missing: &[&'static str]) -> Failure {
    Failure::invalid(format!(
        "bead {bead_id} carries no spec: {} {} empty",
        missing.join(", "),
        if missing.len() == 1 { "is" } else { "are" }
    ))
}

/// Read one bead, budgeting exactly one bd call.
pub(crate) async fn read_bead(ctx: &Ctx, bead_id: &str) -> Result<IssueSummary, Failure> {
    forged_beads::show_issue(&ctx.config.bd_config(), bead_id)
        .await
        .map_err(|err| read_failure(&format!("reading bead {bead_id}"), err))
}

/// Resolve a bead into a spec: one read, rendered body, revision fence.
///
/// Refused when the bead carries no spec — a seat handed a body with no
/// Context or no Acceptance Criteria is worse than a run that never
/// started, so the refusal names the bead and every required field it left
/// empty.
pub async fn resolve_bead(ctx: &Ctx, bead_id: &str) -> Result<ResolvedSpec, Failure> {
    let issue = read_bead(ctx, bead_id).await?;
    resolve_issue(&issue)
}

/// Resolve an issue already read at a lifecycle boundary. Run start uses
/// this after its readiness check so validating the spec does not pay for a
/// second `bd show`; packet open and claim still re-read independently.
pub(crate) fn resolve_issue(issue: &IssueSummary) -> Result<ResolvedSpec, Failure> {
    let bead_id = &issue.id;
    let missing = missing_spec_fields(&issue);
    if !missing.is_empty() {
        return Err(no_spec_refusal(bead_id, &missing));
    }
    let revision = issue.revision.clone().ok_or_else(|| {
        Failure::invalid(format!(
            "bead {bead_id} reports no revision; a bead-sourced spec cannot be fenced without one"
        ))
    })?;
    let body = render_body(&issue);
    let body_sha256 = sha256_bytes(body.as_bytes());
    let mut bead_context = vec![
        format!("Bead title: {}", issue.title),
        format!("Bead issue type: {}", issue.issue_type),
    ];
    bead_context.extend(
        issue
            .metadata
            .iter()
            .map(|(key, value)| format!("Bead metadata {key}: {value}")),
    );
    Ok(ResolvedSpec {
        sha256: body_sha256.clone(),
        body: Some(body),
        fence: SpecFence::Revision {
            revision,
            body_sha256,
        },
        bead_context,
    })
}

/// Resolve a spec file: the deprecated route, fenced by content hash.
pub fn resolve_file(path: &str) -> Result<ResolvedSpec, Failure> {
    let sha256 = sha256_file(Path::new(path))?;
    Ok(ResolvedSpec {
        body: None,
        fence: SpecFence::Sha256(sha256.clone()),
        sha256,
        bead_context: Vec::new(),
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
///
/// The comparison is over the RENDERED BODY, matching the ledger's own
/// fence: bd's revision moves on every write to the bead, and `claim_packet`
/// re-pins the row's `spec_revision` when it does, so the revision a caller
/// read before its claim is stale by construction. The bytes are not.
pub fn assert_pinned(spec: &SpecRef, resolved: &ResolvedSpec) -> Result<(), Failure> {
    if spec.revision.is_none() {
        return Ok(());
    }
    if resolved.sha256 != spec.sha256 {
        return Err(Failure::refused(
            ErrorCode::SpecDrift,
            format!(
                "bead moved off the body this packet pins: rendered {}, pinned {}",
                resolved.sha256, spec.sha256
            ),
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
            assignee: None,
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
    fn missing_spec_fields_names_every_required_empty_field_as_bd_names_it() {
        let mut issue = issue();
        assert!(missing_spec_fields(&issue).is_empty());
        // Commentary alone is not a spec: the two required sections are.
        issue.notes = "   \n".to_owned();
        issue.design = String::new();
        assert!(
            missing_spec_fields(&issue).is_empty(),
            "design and notes are optional"
        );
        issue.description = String::new();
        assert_eq!(missing_spec_fields(&issue), vec!["description"]);
        issue.acceptance_criteria = String::new();
        assert_eq!(
            missing_spec_fields(&issue),
            vec!["description", "acceptance_criteria"]
        );
    }

    #[test]
    fn the_refusal_names_the_bead_and_every_empty_required_field() {
        let mut issue = issue();
        issue.description = String::new();
        let one = no_spec_refusal("bead-1", &missing_spec_fields(&issue));
        assert!(one.message.contains("bead-1"), "{one}");
        assert!(one.message.contains("description is empty"), "{one}");
        assert!(
            !one.message.contains("acceptance_criteria"),
            "a populated field is not named: {one}"
        );

        issue.acceptance_criteria = "  ".to_owned();
        let both = no_spec_refusal("bead-1", &missing_spec_fields(&issue));
        assert!(both.message.contains("bead-1"), "{both}");
        assert!(
            both.message.contains("description")
                && both.message.contains("acceptance_criteria")
                && both.message.contains("are empty"),
            "both empty required fields must be named: {both}"
        );

        // Commentary is never named, however empty it is.
        issue.design = String::new();
        issue.notes = String::new();
        let still = no_spec_refusal("bead-1", &missing_spec_fields(&issue));
        assert!(
            !still.message.contains("design") && !still.message.contains("notes"),
            "commentary absence is not a defect: {still}"
        );
    }

    #[test]
    fn a_bead_with_only_commentary_does_not_carry_a_spec() {
        // The epic child this guards: a valid `spec:` pointer plus a stray
        // `design` note. Preferring the bead here would hand the seat a body
        // with no Context and no Acceptance Criteria and never read the file.
        let mut issue = issue();
        issue.description = "spec: /specs/child.md".to_owned();
        issue.acceptance_criteria = String::new();
        assert!(
            !carries_spec(&issue),
            "a `design` note beside a pointer is not a spec"
        );
        assert_eq!(
            missing_spec_fields(&issue),
            vec!["description", "acceptance_criteria"]
        );

        // Context beside the pointer, but still no acceptance criteria: just
        // as partial, and still the file's job.
        issue.description = "spec: /specs/child.md\n## Context\n\nwhy this exists".to_owned();
        assert!(!carries_spec(&issue), "context alone is not a spec");
        issue.acceptance_criteria = "- it works".to_owned();
        assert!(
            carries_spec(&issue),
            "both required sections present: the bead is the spec"
        );
    }

    #[test]
    fn a_bd_outage_on_the_spec_path_is_recoverable_and_never_drift() {
        let failure = read_failure(
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
    fn a_bead_bd_says_does_not_exist_fails_fast_instead_of_burning_the_budget() {
        // bd 1.2.1's probe-verified refusal for an unknown id: exit 1 with
        // the envelope still delivered. A deleted or mistyped bead id must
        // reach the operator now, not after three backoffs.
        let failure = read_failure(
            "reading bead bead-typo",
            BdError::Beads {
                context: "bd show bead-typo".to_owned(),
                exit: Some(1),
                stdout: "{\"data\":{\"error\":\"no issues found matching the provided IDs\"},\
                         \"schema_version\":1}\n"
                    .to_owned(),
                stderr: "Error fetching bead-typo: no issue found".to_owned(),
            },
        );
        assert!(
            !failure.recoverable,
            "a bead that does not exist is an answer, not an outage: {failure}"
        );
        assert_ne!(failure.code, ErrorCode::SpecDrift);
        assert!(
            !failure.message.starts_with("transport: "),
            "the transport prefix classifies a stored fail note: {failure}"
        );
    }

    #[test]
    fn only_the_leading_pointer_block_is_stripped_from_a_description() {
        let body = render_body(&IssueSummary {
            description: "spec: /specs/x.md\nrepo: /repos/forge\n\n## Context\n\n\
                          repo: is also how the packet names its checkout, and this \
                          line is prose."
                .to_owned(),
            ..issue()
        });
        assert!(
            body.contains("repo: is also how the packet names its checkout"),
            "a mid-body pointer-shaped line is prose and must survive: {body}"
        );
        assert!(
            !body.contains("/specs/x.md") && !body.contains("/repos/forge"),
            "the leading pointer block is addressing, not prose: {body}"
        );
    }

    #[test]
    fn assert_pinned_refuses_a_moved_body_and_ignores_file_specs() {
        let pinned = SpecRef {
            path: "/runs/r/packets/implementation/0/spec.md".to_owned(),
            sha256: "cafe".to_owned(),
            revision: Some("7".to_owned()),
        };
        let moved = ResolvedSpec {
            body: Some("new".to_owned()),
            sha256: "beef".to_owned(),
            fence: SpecFence::Revision {
                revision: "8".to_owned(),
                body_sha256: "beef".to_owned(),
            },
            bead_context: Vec::new(),
        };
        let failure = assert_pinned(&pinned, &moved).expect_err("must refuse");
        assert_eq!(failure.code, ErrorCode::SpecDrift);

        // A moved WRITE TOKEN over the same body is not drift: bd mints a
        // revision on every write, forged's own lease claim included, and
        // `claim_packet` has already re-pinned the row by the time a seat
        // gets here.
        let relabelled = ResolvedSpec {
            sha256: "cafe".to_owned(),
            fence: SpecFence::Revision {
                revision: "8".to_owned(),
                body_sha256: "cafe".to_owned(),
            },
            ..moved.clone()
        };
        assert!(
            assert_pinned(&pinned, &relabelled).is_ok(),
            "a revision that moved without the body must not read as drift"
        );

        // A file-sourced packet is fenced by the ledger's hash comparison
        // alone; nothing is materialized for it to disagree with.
        let file = SpecRef {
            revision: None,
            ..pinned.clone()
        };
        assert!(assert_pinned(&file, &moved).is_ok());
    }
}
