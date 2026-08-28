//! The gh JSON wrapper: every call is a `gh` subprocess whose `--json` /
//! `gh api` output is parsed into typed structs via serde, and every failure
//! is a typed [`GhError`] — never a panic and never a silently-empty result.
//!
//! `repo` is always the GitHub slug in `owner/name` form, never a filesystem
//! path. `--jq` is forbidden in this crate: it emits bare scalars, not JSON.
//! The client's behavior never depends on the process working directory.

use std::ffi::OsString;
use std::path::PathBuf;

use crate::error::GhError;

/// The gh `--json` fields every PR query requests.
const PR_JSON_FIELDS: &str = "number,state,isDraft,baseRefName,headRefName,url";

/// PR metadata as gh reports it.
#[derive(Debug, Clone, PartialEq, Eq, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PrMeta {
    pub number: u64,
    pub state: String, // gh's OPEN | CLOSED | MERGED, uppercase, unparsed
    pub is_draft: bool,
    pub base_ref_name: String,
    pub head_ref_name: String,
    pub url: String,
}

/// Whether `ensure_finding_comment` posted a new comment or found the marker
/// already present.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CommentOutcome {
    Posted,
    AlreadyPresent,
}

/// The REST repository response; the field is literally `default_branch`, so
/// no camelCase rename on this struct.
#[derive(serde::Deserialize)]
struct RepoMeta {
    default_branch: String,
}

/// One issue comment body — a REST listing entry, and also the shape the
/// create-comment POST replies with.
#[derive(serde::Deserialize)]
struct CommentBody {
    body: String,
}

/// The REST pull-request response mapped into [`PrMeta`].
#[derive(serde::Deserialize)]
struct RestPr {
    number: u64,
    state: String,
    draft: bool,
    base: RestRef,
    head: RestRef,
    html_url: String,
}

#[derive(serde::Deserialize)]
struct RestRef {
    #[serde(rename = "ref")]
    ref_name: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct PrHeadOid {
    head_ref_oid: String,
}

impl From<RestPr> for PrMeta {
    fn from(rest: RestPr) -> Self {
        PrMeta {
            number: rest.number,
            // REST reports lowercase "open"; PrMeta carries gh's uppercase
            // convention.
            state: rest.state.to_ascii_uppercase(),
            is_draft: rest.draft,
            base_ref_name: rest.base.ref_name,
            head_ref_name: rest.head.ref_name,
            url: rest.html_url,
        }
    }
}

/// A client for the `gh` CLI.
#[derive(Debug, Clone)]
pub struct GhClient {
    program: PathBuf,
    env_overrides: Vec<(OsString, OsString)>,
    host: Option<OsString>,
}

impl Default for GhClient {
    fn default() -> Self {
        Self::new()
    }
}

impl GhClient {
    /// Use `gh` from PATH.
    pub fn new() -> Self {
        Self {
            program: PathBuf::from("gh"),
            env_overrides: Vec::new(),
            host: None,
        }
    }

    /// Use an explicit gh program path (tests point this at a fake gh).
    pub fn with_program(program: impl Into<PathBuf>) -> Self {
        Self {
            program: program.into(),
            env_overrides: Vec::new(),
            host: None,
        }
    }

    /// Pin every spawned gh child to `host` through `GH_HOST` without
    /// changing this process's environment.
    pub fn with_host(mut self, host: impl Into<OsString>) -> Self {
        self.host = Some(host.into());
        self
    }

    /// Pin to `host` when one is worth pinning; `None` leaves gh's own
    /// default-host resolution in force (the ssh-alias case).
    pub fn with_host_opt(self, host: Option<impl Into<OsString>>) -> Self {
        match host {
            Some(host) => self.with_host(host),
            None => self,
        }
    }

    /// Test support: override an environment variable on each spawned gh
    /// child only — the test process environment is never mutated.
    #[doc(hidden)]
    pub fn env(mut self, key: impl Into<OsString>, value: impl Into<OsString>) -> Self {
        self.env_overrides.push((key.into(), value.into()));
        self
    }

    /// Fresh fetch of PR metadata via `gh pr view`.
    pub async fn pr_view(&self, repo: &str, number: u64) -> Result<PrMeta, GhError> {
        let number = number.to_string();
        let stdout = self
            .run(&[
                "pr",
                "view",
                &number,
                "--repo",
                repo,
                "--json",
                PR_JSON_FIELDS,
            ])
            .await?;
        parse_json(&stdout)
    }

    /// Fresh exact head commit reported by GitHub for one pull request.
    pub async fn pr_head_sha(&self, repo: &str, number: u64) -> Result<String, GhError> {
        let number = number.to_string();
        let stdout = self
            .run(&[
                "pr",
                "view",
                &number,
                "--repo",
                repo,
                "--json",
                "headRefOid",
            ])
            .await?;
        let head: PrHeadOid = parse_json(&stdout)?;
        if head.head_ref_oid.trim().is_empty() {
            return Err(GhError::Json {
                message: "pull request headRefOid is empty".to_owned(),
            });
        }
        Ok(head.head_ref_oid)
    }

    /// Idempotently replace the PR body with exact terminal evidence.
    pub async fn update_pr_body(
        &self,
        repo: &str,
        number: u64,
        body: &str,
    ) -> Result<PrMeta, GhError> {
        let path = format!("repos/{repo}/pulls/{number}");
        let body_field = format!("body={body}");
        let stdout = self
            .run(&["api", "--method", "PATCH", &path, "-f", &body_field])
            .await?;
        let rest: RestPr = parse_json(&stdout)?;
        Ok(rest.into())
    }

    /// The repository default branch via exactly `gh api repos/<repo>` —
    /// never inferred from local refs.
    pub async fn default_branch(&self, repo: &str) -> Result<String, GhError> {
        let path = format!("repos/{repo}");
        let stdout = self.run(&["api", &path]).await?;
        let meta: RepoMeta = parse_json(&stdout)?;
        Ok(meta.default_branch)
    }

    /// The duplicate-PR effect probe: the open PR from `head_branch` onto
    /// `base`, if one exists. The probe filters on base as well as head — an
    /// open PR from the same head to a different base is not "the existing
    /// PR" and must not suppress creation.
    pub async fn pr_list_head(
        &self,
        repo: &str,
        head_branch: &str,
        base: &str,
    ) -> Result<Option<PrMeta>, GhError> {
        let stdout = self
            .run(&[
                "pr",
                "list",
                "--repo",
                repo,
                "--head",
                head_branch,
                "--base",
                base,
                "--state",
                "open",
                "--json",
                PR_JSON_FIELDS,
            ])
            .await?;
        let prs: Vec<PrMeta> = parse_json(&stdout)?;
        Ok(prs.into_iter().next())
    }

    /// Create a draft PR — probe-before-create: when an open PR from `head`
    /// onto the same `base` already exists, return it untouched.
    pub async fn create_draft_pr(
        &self,
        repo: &str,
        head: &str,
        base: &str,
        title: &str,
        body: &str,
    ) -> Result<PrMeta, GhError> {
        if let Some(existing) = self.pr_list_head(repo, head, base).await? {
            return Ok(existing);
        }
        let path = format!("repos/{repo}/pulls");
        let title_field = format!("title={title}");
        let head_field = format!("head={head}");
        let base_field = format!("base={base}");
        let body_field = format!("body={body}");
        let stdout = self
            .run(&[
                "api",
                "--method",
                "POST",
                &path,
                "-f",
                &title_field,
                "-f",
                &head_field,
                "-f",
                &base_field,
                "-f",
                &body_field,
                "-F",
                "draft=true",
            ])
            .await?;
        let rest: RestPr = parse_json(&stdout)?;
        Ok(rest.into())
    }

    /// Idempotently move one draft PR to ready-for-review. The PR must still
    /// target the expected non-default integration branch.
    pub async fn mark_pr_ready(
        &self,
        repo: &str,
        pr_number: u64,
        expected_base: &str,
    ) -> Result<PrMeta, GhError> {
        let current = self.pr_view(repo, pr_number).await?;
        let default = self.default_branch(repo).await?;
        if current.base_ref_name != expected_base || current.base_ref_name == default {
            return Err(GhError::Exec {
                status: None,
                stderr: format!(
                    "refusing to ready PR #{pr_number}: base {:?}, expected non-default {:?}",
                    current.base_ref_name, expected_base
                ),
            });
        }
        if current.state != "OPEN" || !current.is_draft {
            return Ok(current);
        }
        let number = pr_number.to_string();
        self.run(&["pr", "ready", &number, "--repo", repo]).await?;
        self.pr_view(repo, pr_number).await
    }

    /// Idempotently post a finding comment on a PR, deduplicated by a hidden
    /// marker line: `<!-- anvil-finding id=<finding_id> -->`. The listing is
    /// paginated; the match is the whole marker, byte-exact, so id `abc`
    /// cannot collide with `abcd`. A listing that parses into zero pages is
    /// [`GhError::Json`], never an empty comment list — a malformed listing
    /// must not cause a duplicate post — and the POST reply must itself
    /// parse before `Posted` is reported.
    pub async fn ensure_finding_comment(
        &self,
        repo: &str,
        pr_number: u64,
        finding_id: &str,
        body: &str,
    ) -> Result<CommentOutcome, GhError> {
        if self
            .finding_comment_present(repo, pr_number, finding_id)
            .await?
        {
            return Ok(CommentOutcome::AlreadyPresent);
        }
        self.post_finding_comment(repo, pr_number, finding_id, body)
            .await?;
        Ok(CommentOutcome::Posted)
    }

    /// Observe whether the exact generated marker is the FIRST line of an
    /// existing issue comment. Later body lines are untrusted presentation,
    /// never delivery evidence.
    pub async fn finding_comment_present(
        &self,
        repo: &str,
        pr_number: u64,
        finding_id: &str,
    ) -> Result<bool, GhError> {
        let marker = format!("<!-- anvil-finding id={finding_id} -->");
        let path = format!("repos/{repo}/issues/{pr_number}/comments");

        let stdout = self.run(&["api", &path, "--paginate"]).await?;
        // `--paginate` concatenates one JSON array per page; deserialize the
        // stream of `[{ "body": ... }]` pages. Even a PR with no comments is
        // one `[]` page, so zero parsed pages means gh's stdout was not the
        // promised JSON (empty or whitespace-only) — treating that as an
        // empty listing would silently post a duplicate comment.
        let mut comments: Vec<CommentBody> = Vec::new();
        let mut pages = 0usize;
        let stream = serde_json::Deserializer::from_slice(&stdout);
        for page in stream.into_iter::<Vec<CommentBody>>() {
            let page = page.map_err(|e| GhError::Json {
                message: e.to_string(),
            })?;
            pages += 1;
            comments.extend(page);
        }
        if pages == 0 {
            return Err(GhError::Json {
                message: "comment listing produced no JSON pages: \
                          empty stdout is not an empty comment list"
                    .to_owned(),
            });
        }
        let already_present = comments
            .iter()
            .any(|comment| comment.body.lines().next() == Some(marker.as_str()));
        Ok(already_present)
    }

    /// Post one marker-bearing issue comment. Marker-shaped lines in the
    /// presentation body are quoted so they cannot impersonate another
    /// finding if this body is later inspected independently.
    pub async fn post_finding_comment(
        &self,
        repo: &str,
        pr_number: u64,
        finding_id: &str,
        body: &str,
    ) -> Result<(), GhError> {
        let marker = format!("<!-- anvil-finding id={finding_id} -->");
        let path = format!("repos/{repo}/issues/{pr_number}/comments");
        let safe_body = body
            .lines()
            .map(|line| {
                if line.starts_with("<!-- anvil-finding id=") && line.ends_with(" -->") {
                    format!("> {line}")
                } else {
                    line.to_owned()
                }
            })
            .collect::<Vec<_>>()
            .join("\n");
        let body_field = format!("body={marker}\n{safe_body}");
        let stdout = self
            .run(&["api", "--method", "POST", &path, "-f", &body_field])
            .await?;
        // The POST reply is the created comment; parse it so a malformed
        // response is GhError::Json, never a blind `Posted`.
        let _created: CommentBody = parse_json(&stdout)?;
        Ok(())
    }

    /// Run gh with `args` and classify the outcome. Returns raw stdout bytes
    /// on a zero exit. Crate-internal so mutations (the merge invocation) can
    /// only be reached through their guarded public wrappers.
    pub(crate) async fn run(&self, args: &[&str]) -> Result<Vec<u8>, GhError> {
        let mut cmd = tokio::process::Command::new(&self.program);
        cmd.args(args).stdin(std::process::Stdio::null());
        for (key, value) in &self.env_overrides {
            cmd.env(key, value);
        }
        if let Some(host) = &self.host {
            // Apply the pin last so it overrides both the ambient process
            // environment and any test-only generic override.
            cmd.env("GH_HOST", host);
        }
        let output = cmd.output().await.map_err(|e| GhError::Exec {
            status: None,
            stderr: format!("failed to spawn gh: {e}"),
        })?;
        if output.status.success() {
            return Ok(output.stdout);
        }
        let stderr = String::from_utf8_lossy(&output.stderr).into_owned();
        let status = output.status.code();
        if status == Some(4) || stderr.contains("HTTP 401") || stderr.contains("HTTP 403") {
            return Err(GhError::Auth);
        }
        if stderr.contains("HTTP 404") {
            return Err(GhError::NotFound);
        }
        Err(GhError::Exec { status, stderr })
    }
}

fn parse_json<T: serde::de::DeserializeOwned>(bytes: &[u8]) -> Result<T, GhError> {
    serde_json::from_slice(bytes).map_err(|e| GhError::Json {
        message: e.to_string(),
    })
}
