/**
 * JIRA integration for Forge.
 *
 * Wraps the `acli` CLI tool. We use acli (not REST directly) because the
 * user already has it authenticated and configured — no extra credentials
 * to manage in forge.
 *
 * Supported flows:
 * - fetchTicket(key) — Flow B entry: pull summary + description for a key
 *   the user already has, so the planner can use it as source-of-truth.
 * - createTicket(...) — Flow A exit: turn a finalized spec into a new
 *   ticket. Returns the new key for capture into the spec frontmatter.
 * - addComment(key, body) — link a forge spec back to an existing ticket.
 * - updateDescription(key, body) — overwrite ticket description with the
 *   refined spec (for Flow B where the user wants the ticket to be
 *   authoritative).
 *
 * All commands time out at 15s and never throw — they return null/error
 * so the caller can degrade gracefully (JIRA outages shouldn't block spec
 * creation).
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

const ACLI_TIMEOUT_MS = 15_000;

/**
 * JIRA key shape. Two or more uppercase letters, dash, one or more digits.
 * Examples: PROJ-123, ALLM-737. Used to detect when a user-supplied string
 * is a ticket reference rather than a free-form idea.
 */
export const JIRA_KEY_PATTERN = /^[A-Z][A-Z0-9_]+-[0-9]+$/;

export function isJiraKey(s: string): boolean {
  return JIRA_KEY_PATTERN.test(s.trim());
}

function runAcli(args: string[], opts: { input?: string; timeoutMs?: number } = {}): { ok: true; stdout: string } | { ok: false; error: string } {
  try {
    const stdout = execSync(`acli ${args.map((a) => `"${a.replace(/"/g, '\\"')}"`).join(" ")}`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: opts.timeoutMs ?? ACLI_TIMEOUT_MS,
      input: opts.input,
    });
    return { ok: true, stdout: stdout.trim() };
  } catch (e: any) {
    const stderr = (e.stderr ?? "").toString().trim();
    const message = stderr || e.message || String(e);
    return { ok: false, error: message };
  }
}

export interface JiraTicket {
  key: string;
  summary: string;
  description: string;
  /** Raw fetched text, in case JSON parsing failed and we want to surface it. */
  raw?: string;
}

/**
 * Fetch a JIRA ticket's summary + description.
 *
 * Tries the JSON output path first for clean parsing; falls back to the
 * default text output (which is human-formatted) and strips ANSI.
 */
export function fetchTicket(key: string): JiraTicket | null {
  if (!isJiraKey(key)) return null;
  // Try JSON first for clean parsing
  const jsonResult = runAcli(["jira", "workitem", "view", key, "--fields", "summary,description", "--json"]);
  if (jsonResult.ok) {
    try {
      const parsed = JSON.parse(jsonResult.stdout) as {
        key?: string;
        fields?: { summary?: string; description?: string | { content?: any[] } };
      };
      const summary = parsed.fields?.summary ?? "";
      // Description can be an Atlassian Document Format (ADF) object.
      // We don't try to render ADF — just stringify it so the planner can
      // still see the structure and the user can interpret it.
      let description = "";
      const rawDesc = parsed.fields?.description;
      if (typeof rawDesc === "string") {
        description = rawDesc;
      } else if (rawDesc && typeof rawDesc === "object") {
        description = JSON.stringify(rawDesc, null, 2);
      }
      if (summary || description) {
        return { key, summary, description, raw: jsonResult.stdout };
      }
    } catch {
      // fall through to text fallback
    }
  }
  // Text fallback — strip ANSI, return verbatim. Less structured but
  // always readable.
  const textResult = runAcli(["jira", "workitem", "view", key, "--fields", "summary,description"]);
  if (!textResult.ok) return null;
  const cleaned = textResult.stdout.replace(/\x1b\[[0-9;]*m/g, "").trim();
  if (!cleaned) return null;
  return { key, summary: "", description: cleaned, raw: cleaned };
}

export interface CreateTicketRequest {
  summary: string;
  description: string;
  project: string;
  /** "Task", "Story", "Bug", etc. Defaults to "Task". */
  type?: string;
  /** Comma-separated labels to attach (forge always adds "forge"). */
  labels?: string[];
  /** Assign to "@me" by default; override here. */
  assignee?: string;
  /** Parent epic/story key. */
  parent?: string;
}

export interface CreateTicketResult {
  key: string;
  url?: string;
}

/**
 * Create a new JIRA ticket from a spec. Description is written to a temp
 * file (acli's --description-file flag) so we don't have to escape
 * arbitrary markdown on the command line.
 *
 * Returns the new ticket key on success. acli's --json output gives us
 * the key and URL cleanly.
 */
export function createTicket(req: CreateTicketRequest): CreateTicketResult | { error: string } {
  const tmpFile = path.join(os.tmpdir(), `forge-jira-${Date.now()}-${Math.random().toString(36).slice(2)}.md`);
  fs.writeFileSync(tmpFile, req.description, "utf-8");

  try {
    const labels = ["forge", ...(req.labels ?? [])];
    const args = [
      "jira",
      "workitem",
      "create",
      "--summary",
      req.summary,
      "--description-file",
      tmpFile,
      "--project",
      req.project,
      "--type",
      req.type ?? "Task",
      "--label",
      labels.join(","),
      "--assignee",
      req.assignee ?? "@me",
      "--json",
    ];
    if (req.parent) {
      args.push("--parent", req.parent);
    }

    const result = runAcli(args, { timeoutMs: 30_000 });
    if (!result.ok) {
      return { error: `acli create failed: ${result.error}` };
    }

    // acli --json output for create varies by version; try a few shapes.
    try {
      const parsed = JSON.parse(result.stdout);
      const key = parsed.key ?? parsed.issueKey ?? parsed.workItem?.key;
      const url = parsed.url ?? parsed.self ?? parsed.workItem?.url;
      if (key) return { key, url };
    } catch {
      // Fall through — try to extract a key from text output
    }

    // Best-effort key extraction from text: look for an uppercase-dash-digits token
    const match = result.stdout.match(/\b[A-Z][A-Z0-9_]+-[0-9]+\b/);
    if (match) return { key: match[0] };

    return { error: `Could not parse new ticket key from acli output: ${result.stdout.slice(0, 200)}` };
  } finally {
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  }
}

/**
 * Append a comment to an existing JIRA ticket. Body is written via temp
 * file for the same escaping reasons as create.
 */
export function addComment(key: string, body: string): { ok: true } | { error: string } {
  if (!isJiraKey(key)) return { error: `Not a JIRA key: ${key}` };
  const tmpFile = path.join(os.tmpdir(), `forge-jira-comment-${Date.now()}-${Math.random().toString(36).slice(2)}.md`);
  fs.writeFileSync(tmpFile, body, "utf-8");
  try {
    const result = runAcli(
      ["jira", "workitem", "comment", "create", "--key", key, "--body-file", tmpFile],
      { timeoutMs: 20_000 },
    );
    if (!result.ok) return { error: `acli comment failed: ${result.error}` };
    return { ok: true };
  } finally {
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  }
}

/**
 * Replace the description of an existing JIRA ticket with the given body.
 * Used in Flow B when the refined spec should become the canonical
 * ticket description.
 */
export function updateDescription(key: string, body: string): { ok: true } | { error: string } {
  if (!isJiraKey(key)) return { error: `Not a JIRA key: ${key}` };
  const tmpFile = path.join(os.tmpdir(), `forge-jira-update-${Date.now()}-${Math.random().toString(36).slice(2)}.md`);
  fs.writeFileSync(tmpFile, body, "utf-8");
  try {
    const result = runAcli(
      ["jira", "workitem", "edit", "--key", key, "--description-file", tmpFile, "--yes"],
      { timeoutMs: 20_000 },
    );
    if (!result.ok) return { error: `acli edit failed: ${result.error}` };
    return { ok: true };
  } finally {
    try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
  }
}

/**
 * Test whether acli is available and configured. Used at extension start
 * so we can hide JIRA prompts for users who don't have it.
 */
export function isJiraAvailable(): boolean {
  try {
    execSync("which acli", { stdio: "pipe", timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}
