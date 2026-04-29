/**
 * Forge spec-mode — conversational spec drafting with the bundled
 * forge-planner skill.
 *
 * Spec-mode is a session-scoped toggle (one at a time, like pi's
 * plan-mode). When active:
 *
 * - Tools are restricted to read-only exploration (read, bash with an
 *   allowlist, grep, find, ls). The model cannot edit or write.
 * - Each `before_agent_start` injects the forge-planner skill content
 *   plus repo facts and any JIRA ticket context as a hidden custom
 *   message, so the model is grounded in forge's planning workflow on
 *   every turn.
 * - Each `agent_end` checks the assistant's latest output for a
 *   ```forge-spec fenced block. When the user is ready, /forge-save-spec
 *   (or Alt+S) extracts the latest block, writes the spec to disk
 *   under ~/.forge/specs/<id>.md, and offers to launch.
 * - State is persisted via pi.appendEntry so a resumed pi session can
 *   restore the in-progress draft.
 *
 * Bidirectional JIRA flows are wired through `enterSpecMode`'s options:
 * - jiraKey supplied → Flow B (existing ticket → spec)
 * - idea supplied → Flow A (idea → spec → optional new ticket on save)
 *
 * The save flow handles both: if a JIRA key is associated, prompt to
 * update the ticket; otherwise prompt to create a new one. Either path
 * captures the resulting key into the spec frontmatter.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Key } from "@mariozechner/pi-tui";
import * as jira from "./jira.js";
import { isTmuxAvailable } from "./launch.js";
import { type RepoProfile } from "./repo.js";
import { ForgeStore, type TaskRecord } from "./store.js";

// ─── Bash allowlist for spec-mode / review-mode ───────────────────────────────

/**
 * Allowed bash command prefixes during spec-mode. Spec-mode is read-only
 * by design — the planner shouldn't be touching the working tree, only
 * exploring it.
 *
 * We match on the first token (and second token for `git`/`gh`) so that
 * pipelines like `cat foo | head` still pass once the leading command is
 * approved. The allowlist is deliberately narrow — additions should be
 * deliberate and discussed.
 */
const SPEC_BASH_ALLOWLIST = new Set([
  // file inspection
  "cat", "head", "tail", "less", "more", "wc", "file",
  // search
  "grep", "rg", "find", "fd", "ag",
  // dir listing
  "ls", "pwd", "tree", "stat",
  // text utils
  "echo", "printf", "tr", "cut", "sort", "uniq", "awk", "sed",
  // env / system info
  "uname", "whoami", "date", "uptime", "which", "type", "env",
  // markdown / json
  "jq", "yq",
]);

const SPEC_GIT_ALLOWLIST = new Set([
  "status", "log", "show", "diff", "branch", "blame", "ls-files",
  "ls-tree", "cat-file", "rev-parse", "describe", "tag", "config",
  "remote", "worktree",  // worktree subcommand allowed for `git worktree list` etc — not `git worktree add` (that creates dirs).
]);

const SPEC_GH_ALLOWLIST = new Set([
  "pr", "issue", "repo", "api", "auth", "browse", "label",
]);

/**
 * Decide whether a bash command may run in spec-mode. We consider only
 * the first command in a pipeline / sequence, because the model rarely
 * tries to chain destructive ops and the allowlist is tight enough that
 * the first command is the binding one.
 *
 * Returns `null` if allowed, otherwise a human-readable reason.
 */
export function checkSpecBash(command: string): string | null {
  const trimmed = command.trim();
  if (!trimmed) return null;

  // Reject explicit writes upfront with a clearer message.
  const banned = [/\brm\s/, /\bmv\s/, /\bcp\s/, /\bmkdir\s/, /\btouch\s/, /\bchmod\s/, /\bchown\s/, /\bln\s+-s/, /\b>\s*\S/, /\b>>\s*\S/, /\btee\s/, /\bdd\b/, /\bsudo\b/, /\bnpm\s+install/, /\bnpm\s+i\b/, /\bpnpm\s+install/, /\byarn\s+(install|add)/, /\bpip\s+install/, /\buv\s+(sync|install|add)/, /\bcargo\s+(build|install|add|run)/, /\bgo\s+(get|install|build|run)/, /\bmake\b/, /\bmvn\b/, /\bgradle\b/];
  for (const re of banned) {
    if (re.test(trimmed)) return `spec-mode is read-only — "${trimmed.slice(0, 60)}" looks like a mutating command. Exit spec-mode (save or cancel) before running it.`;
  }

  // Take the first token of the first command (before any |, ;, &&, ||).
  const firstClause = trimmed.split(/[|;&]+/)[0]?.trim() ?? "";
  const tokens = firstClause.split(/\s+/);
  const cmd = tokens[0] ?? "";
  if (!cmd) return null;

  if (cmd === "git") {
    const sub = tokens[1] ?? "";
    if (!SPEC_GIT_ALLOWLIST.has(sub)) {
      return `spec-mode allows only read-only git subcommands; "git ${sub}" is not in the allowlist.`;
    }
    // Block "git worktree add" / "git worktree remove" specifically.
    if (sub === "worktree" && (tokens[2] === "add" || tokens[2] === "remove" || tokens[2] === "prune")) {
      return `spec-mode forbids mutating git worktree operations.`;
    }
    return null;
  }

  if (cmd === "gh") {
    const sub = tokens[1] ?? "";
    if (!SPEC_GH_ALLOWLIST.has(sub)) {
      return `spec-mode allows only the gh subcommands ${[...SPEC_GH_ALLOWLIST].join(", ")}; "gh ${sub}" is not allowed.`;
    }
    return null;
  }

  if (cmd === "acli") {
    // Allow only read-only acli subcommands during spec-mode. Mutations
    // (create, comment create, edit) happen through forge's own UI flow,
    // not through the agent.
    const args = tokens.slice(1).join(" ");
    if (/\b(view|search|list)\b/.test(args)) return null;
    return `spec-mode allows only read-only acli subcommands (view, search, list).`;
  }

  if (SPEC_BASH_ALLOWLIST.has(cmd)) return null;
  return `Command "${cmd}" is not allowlisted for spec-mode.`;
}

// ─── Spec-mode state ──────────────────────────────────────────────────────────

interface SpecModeState {
  active: boolean;
  /** Repo at the time spec-mode was entered. Captured because the user can change cwd. */
  repo: RepoProfile | null;
  /** JIRA ticket attached to this draft, if any. May be set on entry (Flow B) or later (Flow A creates one on save). */
  jiraKey: string | null;
  /** Cached JIRA ticket content for the planner's context, fetched once on entry. */
  jiraContent: string | null;
  /** JIRA ticket URL, captured from acli for the PR body footer. */
  jiraUrl: string | null;
  /** Pre-resolved task id so the spec file location is stable across the conversation. */
  taskId: string | null;
  /** Title of the most recent draft, derived from the spec body. Used for status badge + save flow defaults. */
  lastDraftTitle: string | null;
  /** Have we already prompted on this agent_end? Avoid double-prompting on retries. */
  promptedThisCycle: boolean;
  /**
   * When set, spec-mode is editing an existing saved spec rather than
   * drafting a new one. The task's id, branch, JIRA link, and status are
   * preserved across save, and the planner's context is seeded with the
   * current spec body so the conversation picks up where it left off.
   */
  editingTask: TaskRecord | null;
  /**
   * Absolute path to the working draft file. The planner mutates this
   * file in place via the `edit`/`write` tools instead of re-emitting the
   * full spec in chat every turn (saves a lot of tokens on long
   * iterations). On save we read the file, prepend frontmatter, and copy
   * to the canonical specs/ location.
   */
  draftPath: string | null;
}

const state: SpecModeState = {
  active: false,
  repo: null,
  jiraKey: null,
  jiraContent: null,
  jiraUrl: null,
  taskId: null,
  lastDraftTitle: null,
  promptedThisCycle: false,
  editingTask: null,
  draftPath: null,
};

/**
 * Tools allowed during spec-mode. We allow `edit` and `write` so the
 * planner can mutate the draft file in place — but the tool_call hook
 * below pins those tools to draftPath only, so the planner can't write
 * anywhere else in the working tree.
 */
const SPEC_MODE_TOOLS = ["read", "bash", "grep", "find", "ls", "edit", "write"];
let savedToolsBeforeSpecMode: string[] | null = null;

/** Resolve the drafts directory under ~/.forge/. Created lazily. */
function draftsDir(forgeDir: string): string {
  const dir = path.join(forgeDir, "drafts");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ─── Skill loading ────────────────────────────────────────────────────────────

/**
 * Resolve the directory containing this extension's bundled skills.
 * import.meta.url points at this .ts (or .js after transpile) file; the
 * skills/ directory sits alongside it.
 */
function skillsDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.join(here, "skills");
}

function readSkillFile(relPath: string): string {
  try {
    return fs.readFileSync(path.join(skillsDir(), relPath), "utf-8");
  } catch {
    return "";
  }
}

/**
 * Build the hidden context message injected on every agent turn during
 * spec-mode. We inline the SKILL.md verbatim (so the model has the
 * planner instructions on turn 1 without needing to use a tool first)
 * and then point at the companion files by absolute path so the model
 * can `read` them on demand for progressive disclosure.
 */
function buildPlannerContext(): string {
  const skillBody = readSkillFile("forge-planner/SKILL.md");
  const dir = path.join(skillsDir(), "forge-planner");
  const companions = [
    path.join(dir, "research.md"),
    path.join(dir, "schema.md"),
    path.join(dir, "checklist.md"),
  ];

  const repo = state.repo;
  const lines: string[] = [
    "[FORGE SPEC MODE ACTIVE]",
    "",
    "You are using the forge-planner skill. Its full instructions follow.",
    "Companion files referenced in the SKILL.md sit at these absolute paths — load them with `read` when the workflow says so:",
    ...companions.map((p) => `- ${p}`),
    "",
    "## Skill",
    "",
    skillBody.trim(),
    "",
    "## Repo Facts (from forge's repo profile)",
    "",
  ];

  if (repo) {
    lines.push(`- Repo root: ${repo.root}`);
    lines.push(`- Repo name: ${repo.name}`);
    lines.push(`- Default branch: ${repo.defaultBranch}`);
    lines.push(`- Stack: ${repo.stack}`);
    if (repo.qualityCommands?.length) {
      lines.push(`- Quality commands: ${repo.qualityCommands.join(" && ")}`);
    }
    if (repo.contextContent) {
      lines.push("");
      lines.push("## Project Context (from CLAUDE.md / AGENTS.md)");
      lines.push("");
      lines.push(repo.contextContent.slice(0, 4000));
      if (repo.contextContent.length > 4000) {
        lines.push("");
        lines.push(`(${repo.contextContent.length - 4000} more chars omitted — read the file directly if you need it)`);
      }
    }
  } else {
    lines.push("- (no repo profile loaded)");
  }

  if (state.jiraKey && state.jiraContent) {
    lines.push("");
    lines.push(`## JIRA Ticket — ${state.jiraKey}`);
    lines.push("");
    lines.push("This is the source of truth for what the user wants. Read carefully before drafting. If anything is ambiguous or contradicts what you find in the codebase, ask the user.");
    lines.push("");
    lines.push(state.jiraContent.slice(0, 4000));
    if (state.jiraContent.length > 4000) {
      lines.push("");
      lines.push(`(${state.jiraContent.length - 4000} more chars omitted)`);
    }
  }

  if (state.editingTask) {
    lines.push("");
    lines.push(`## Editing existing spec — not a fresh draft`);
    lines.push("");
    lines.push(`Task id: \`${state.editingTask.id}\``);
    lines.push(`Status: \`${state.editingTask.status}\``);
    lines.push(`Branch: \`${state.editingTask.branch}\``);
    if (state.editingTask.prUrl) lines.push(`Existing PR: ${state.editingTask.prUrl}`);
    lines.push("");
    lines.push("The user is refining a saved spec. Don't rewrite from scratch unless they explicitly ask. On turn 1: read the draft, point out specific weak spots (vague criteria, undefined behavior, missing files), ask what to change.");
  }

  lines.push("");
  lines.push("## Working Draft File");
  lines.push("");
  lines.push("To save tokens on long iterations, **the draft lives in a file**, not in the chat. Read and mutate this file directly with the `read`, `edit`, and `write` tools. Do NOT paste the full spec into chat — the user will read the file directly.");
  lines.push("");
  lines.push(`**Draft path:** \`${state.draftPath ?? "(not set)"}\``);
  lines.push("");
  lines.push("Workflow on each turn:");
  lines.push("  1. If you haven't seen the current draft this turn, `read` it.");
  lines.push("  2. Make the changes the user asked for using `edit` (preferred for surgical changes) or `write` (for full rewrites of the whole file).");
  lines.push("  3. In your chat reply, write **a brief change summary** — 1–3 lines, like a commit message. Do NOT paste the whole spec body. Examples:");
  lines.push("     - \"Added 2 acceptance criteria for the cache miss path; tightened the validation bullet to quote the exact ValidationError string.\"");
  lines.push("     - \"Drafted initial spec at the path above. Research findings: <one-paragraph summary>. Open questions: <bullets>.\"");
  lines.push("  4. The `edit` and `write` tools are restricted to the draft path; you cannot write anywhere else. If you try, the call is blocked.");
  lines.push("");
  lines.push("## Reminders");
  lines.push("");
  lines.push("- Research before drafting. Cite exact file paths.");
  lines.push("- The draft file is the source of truth, not the chat.");
  lines.push("- When the user is satisfied, tell them to press Alt+S or run /forge-save-spec to promote the draft to ~/.forge/specs/.");

  return lines.join("\n");
}

// ─── Title / slug helpers ──────────────────────────────────────────────────────

function extractTitle(specBody: string): string {
  const m = specBody.match(/^#\s+(.+)$/m);
  return m?.[1]?.trim() ?? "Untitled spec";
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

// ─── Status badge / persistence ───────────────────────────────────────────────

function setStatus(ctx: ExtensionContext): void {
  if (state.active) {
    const titleHint = state.lastDraftTitle ? ` "${state.lastDraftTitle.slice(0, 30)}"` : "";
    const jiraHint = state.jiraKey ? ` ← ${state.jiraKey}` : "";
    ctx.ui.setStatus("forge-spec-mode", ctx.ui.theme.fg("warning", `📝 spec${titleHint}${jiraHint}`));
  } else {
    ctx.ui.setStatus("forge-spec-mode", undefined);
  }
}

function persist(pi: ExtensionAPI): void {
  pi.appendEntry("forge-spec-mode", {
    active: state.active,
    repoRoot: state.repo?.root ?? null,
    jiraKey: state.jiraKey,
    taskId: state.taskId,
    lastDraftTitle: state.lastDraftTitle,
  });
}

// ─── Public API: enter / exit / save ──────────────────────────────────────────

export interface EnterSpecModeOptions {
  repo: RepoProfile;
  /** Existing JIRA key (Flow B). The harness fetches the ticket and seeds the conversation. */
  jiraKey?: string;
  /** Initial idea text to seed the conversation as the first user message (Flow A). */
  idea?: string;
  /**
   * Resume editing an existing saved spec. The draft file is seeded with
   * the existing spec body (sans frontmatter), the task id/branch/JIRA
   * link are preserved, and the planner is instructed to refine rather
   * than rewrite.
   */
  editingTask?: TaskRecord;
}

export async function enterSpecMode(
  pi: ExtensionAPI,
  ctx: ExtensionContext,
  store: ForgeStore,
  options: EnterSpecModeOptions,
): Promise<void> {
  if (state.active) {
    ctx.ui.notify("Already in spec-mode. Save or cancel the current draft first.", "warning");
    return;
  }

  const editing = options.editingTask;
  state.active = true;
  state.repo = options.repo;
  state.editingTask = editing ?? null;
  state.jiraKey = (editing?.jiraTicket || options.jiraKey?.trim() || null) as string | null;
  state.jiraContent = null;
  state.taskId = editing?.id ?? null;
  state.lastDraftTitle = editing?.title ?? null;
  state.promptedThisCycle = false;

  // ── Set up the working draft file ─────────────────────────────────────
  // For new specs, use a timestamp-keyed draft path until save (when
  // we'll mint a proper task id from the title). For edits, use the
  // task id directly so resumes find the same file.
  const dDir = draftsDir(store.forgeDir);
  if (editing) {
    state.draftPath = path.join(dDir, `${editing.id}.md`);
    // Seed the draft with the existing spec body if it doesn't already
    // exist. If a previous edit session left a draft on disk, prefer
    // that (resume the unsaved work) over the canonical spec body.
    if (!fs.existsSync(state.draftPath)) {
      const fullSpec = store.getSpec(editing.id);
      const body = fullSpec ? fullSpec.replace(/^---\n[\s\S]*?\n---\n*/, "").trim() : "";
      fs.writeFileSync(state.draftPath, body, "utf-8");
    }
  } else {
    const draftId = `draft-${Date.now().toString(36)}`;
    state.draftPath = path.join(dDir, `${draftId}.md`);
    fs.writeFileSync(state.draftPath, "", "utf-8");
  }

  // Save current tools so we can restore on exit.
  savedToolsBeforeSpecMode = pi.getActiveTools();
  pi.setActiveTools(SPEC_MODE_TOOLS);

  // Fetch JIRA ticket if we have a key (either Flow B entry or editing
  // a task that already has one linked). Done synchronously so the
  // planner sees it on turn 1.
  if (state.jiraKey) {
    if (!jira.isJiraAvailable()) {
      ctx.ui.notify(`acli not available — entering spec-mode without JIRA context for ${state.jiraKey}`, "warning");
    } else {
      ctx.ui.notify(`Fetching ${state.jiraKey}…`, "info");
      const ticket = jira.fetchTicket(state.jiraKey);
      if (!ticket) {
        ctx.ui.notify(`Could not fetch ${state.jiraKey} — entering spec-mode without ticket context`, "warning");
      } else {
        state.jiraContent = [
          ticket.summary ? `Summary: ${ticket.summary}` : null,
          ticket.description ? `\nDescription:\n${ticket.description}` : null,
        ].filter(Boolean).join("\n");
        state.jiraUrl = ticket.url;
      }
    }
  }

  setStatus(ctx);
  persist(pi);

  // Welcome message in chat scrollback so the user knows mode is active.
  const repoLabel = ctx.ui.theme.fg("accent", options.repo.name);
  const jiraLabel = state.jiraKey ? ` linked to ${ctx.ui.theme.fg("accent", state.jiraKey)}` : "";
  const editLabel = editing ? ` (editing “${ctx.ui.theme.fg("accent", editing.title)}”)` : "";
  pi.sendMessage(
    {
      customType: "forge-spec-mode-banner",
      content:
        `📝 **Forge spec-mode** active for ${repoLabel}${jiraLabel}${editLabel}.\n\n` +
        `Working draft: \`${state.draftPath}\`\n\n` +
        `The planner edits this file directly via the \`edit\` and \`write\` tools — no need to re-emit the whole spec in chat each turn (saves tokens, faster iteration). Open the file in another editor any time to see the rendered draft.\n\n` +
        `Press **Alt+S** or run **\`/forge-save-spec\`** to promote the draft. **\`/forge-cancel-spec\`** to exit (the draft file stays on disk so you can resume).`,
      display: true,
    },
    { triggerTurn: false },
  );

  // Seed the first user turn.
  if (editing) {
    pi.sendUserMessage(
      `I want to refine the existing spec for “${editing.title}”. The current draft is at \`${state.draftPath}\`. Read it first, then point out specific weak spots (vague criteria, undefined behavior, missing files, wrong file paths). Ask me what to change. Don't rewrite the whole thing on turn 1.`,
    );
    return;
  }

  // Seed for new drafts. Two paths:
  // (a) Flow A with an idea → send the idea so the planner kicks off research.
  // (b) Flow B (JIRA) → send a stub so the planner knows to start from the ticket.
  // (c) Otherwise → don't auto-trigger a turn; let the user type.
  if (options.idea?.trim()) {
    const seed = options.idea.trim();
    pi.sendUserMessage(
      `Idea: ${seed}\n\nResearch the repo, then write the initial draft to \`${state.draftPath}\` using the \`write\` tool. In your reply, summarize what you found and what you drafted (1–3 lines), and ask me about anything ambiguous before refining further.`,
    );
  } else if (state.jiraKey && state.jiraContent) {
    pi.sendUserMessage(
      `Plan a spec for ${state.jiraKey}. The ticket content is in your context. Research the repo, then write the initial draft to \`${state.draftPath}\` using the \`write\` tool. Tell me what files you explored and ask any clarifying questions before refining.`,
    );
  }
}

export function exitSpecMode(
  pi: ExtensionAPI,
  ctx: ExtensionContext,
  options: { deleteDraft?: boolean } = {},
): void {
  if (!state.active) return;

  // Optionally clean up the draft file. Default is to KEEP it so the
  // user can resume an in-progress draft (cancel != throw away).
  if (options.deleteDraft && state.draftPath) {
    try { fs.unlinkSync(state.draftPath); } catch { /* ignore */ }
  }

  state.active = false;
  state.repo = null;
  state.jiraKey = null;
  state.jiraContent = null;
  state.jiraUrl = null;
  state.taskId = null;
  state.lastDraftTitle = null;
  state.promptedThisCycle = false;
  state.editingTask = null;
  state.draftPath = null;

  if (savedToolsBeforeSpecMode) {
    pi.setActiveTools(savedToolsBeforeSpecMode);
    savedToolsBeforeSpecMode = null;
  }
  setStatus(ctx);
  persist(pi);
}

/**
 * Read the working draft file, prepend frontmatter, and promote it to
 * the canonical specs/ location. This is the "commit" step in the
 * draft → promote pattern: the planner has been mutating the draft
 * file in place during the conversation; this is where it lands.
 *
 * Bidirectional JIRA flow lives here:
 * - If state.jiraKey is set → ask whether to update the ticket (Flow B exit).
 * - Otherwise → ask whether to create a new ticket (Flow A exit).
 *
 * Returns the saved TaskRecord, or null if the draft was empty / save
 * was cancelled.
 */
export async function saveSpec(
  pi: ExtensionAPI,
  ctx: ExtensionContext,
  store: ForgeStore,
): Promise<TaskRecord | null> {
  if (!state.active) {
    ctx.ui.notify("Not in spec-mode.", "error");
    return null;
  }
  const repo = state.repo;
  if (!repo || !state.draftPath) {
    ctx.ui.notify("Spec-mode lost its repo or draft reference — exiting without save.", "error");
    exitSpecMode(pi, ctx);
    return null;
  }

  // Read the spec body straight from the draft file. The chat history
  // contains short change summaries, not the spec body.
  let specBody: string;
  try {
    specBody = fs.readFileSync(state.draftPath, "utf-8").trim();
  } catch (e: any) {
    ctx.ui.notify(`Could not read draft at ${state.draftPath}: ${e?.message ?? e}`, "error");
    return null;
  }
  if (!specBody) {
    ctx.ui.notify(
      `Draft file at ${state.draftPath} is empty. Ask the planner to write the spec first, then save again.`,
      "error",
    );
    return null;
  }
  // Strip any frontmatter the planner accidentally wrote in.
  specBody = specBody.replace(/^---\n[\s\S]*?\n---\n*/, "").trim();
  if (!specBody) {
    ctx.ui.notify(`Draft has only frontmatter — no spec body to save.`, "error");
    return null;
  }

  const editing = state.editingTask;
  const title = extractTitle(specBody);
  // When editing, preserve the existing branch (the agent may already
  // have a worktree on it). For new specs, derive a branch from the title.
  const suggestedBranch = editing?.branch ?? `feat/${slugify(title)}`;
  const taskId = state.taskId ?? editing?.id ?? store.generateId(title);
  state.taskId = taskId;
  state.lastDraftTitle = title;

  // ── Optional: bidirectional JIRA ─────────────────────────────────────
  let jiraKey = state.jiraKey;
  if (jira.isJiraAvailable()) {
    if (jiraKey) {
      // Flow B exit — ticket already linked. Offer to update.
      const choice = await ctx.ui.select(`JIRA ${jiraKey} is linked. What should I do with it?`, [
        "Add a comment linking the spec",
        "Replace ticket description with the spec body",
        "Leave the ticket alone",
      ]);
      if (choice?.startsWith("Add a comment")) {
        const res = jira.addComment(jiraKey, `Forge spec drafted (${taskId}):\n\n${specBody}`);
        if ("error" in res) ctx.ui.notify(`JIRA comment failed: ${res.error}`, "warning");
        else ctx.ui.notify(`Comment added to ${jiraKey}.`, "success");
      } else if (choice?.startsWith("Replace ticket")) {
        const res = jira.updateDescription(jiraKey, specBody);
        if ("error" in res) ctx.ui.notify(`JIRA update failed: ${res.error}`, "warning");
        else ctx.ui.notify(`${jiraKey} description updated.`, "success");
      }
    } else {
      // Flow A exit — no ticket yet. Offer to create one.
      const choice = await ctx.ui.select("Create a JIRA ticket from this spec?", [
        "Yes — create new ticket",
        "Link to an existing ticket",
        "No — skip JIRA",
      ]);
      if (choice?.startsWith("Yes")) {
        const created = await promptCreateJira(ctx, store, repo, title, specBody);
        if (created) {
          jiraKey = created.key;
          state.jiraUrl = created.url ?? null;
        }
      } else if (choice?.startsWith("Link")) {
        const linked = ctx.ui.input
          ? await ctx.ui.input("JIRA ticket key:", { placeholder: "e.g. PROJ-123" })
          : null;
        if (linked && jira.isJiraKey(linked.trim())) {
          const newKey = linked.trim();
          jiraKey = newKey;
          // Fetch the ticket to capture its URL for the PR footer
          const linkedTicket = jira.fetchTicket(newKey);
          if (linkedTicket?.url) state.jiraUrl = linkedTicket.url;
          // Add a comment so the JIRA side knows about the spec
          const res = jira.addComment(newKey, `Forge spec drafted (${taskId}):\n\n${specBody}`);
          if ("error" in res) ctx.ui.notify(`JIRA comment failed: ${res.error}`, "warning");
        } else if (linked) {
          ctx.ui.notify(`"${linked}" is not a valid JIRA key — skipping link.`, "warning");
        }
      }
    }
  }

  // ── Build frontmatter and write to disk ──────────────────────────────
  // When editing, preserve original createdAt + lifecycle status. For new
  // specs, mint fresh ones. Either way the planner doesn't see frontmatter —
  // forge owns it.
  const createdAt = editing?.createdAt ?? new Date().toISOString();
  const taskStatus = editing?.status ?? "draft";
  const frontmatter = [
    "---",
    `id: ${taskId}`,
    `repo: ${repo.root}`,
    `repoName: ${repo.name}`,
    `createdAt: ${createdAt}`,
    `status: ${taskStatus}`,
    `suggestedAgent: ${editing?.agent ?? "pi"}`,
    `suggestedModel: ${editing?.model ?? "claude-opus-4-6"}`,
    `suggestedBranch: ${suggestedBranch}`,
    jiraKey ? `jiraTicket: ${jiraKey}` : null,
    state.jiraUrl ? `jiraUrl: ${state.jiraUrl}` : null,
    "---",
  ]
    .filter(Boolean)
    .join("\n");
  const fullSpec = `${frontmatter}\n\n${specBody}\n`;
  const specFile = store.writeSpec(taskId, fullSpec);

  // For new specs, build a fresh TaskRecord. For edits, preserve the
  // existing record's lifecycle fields (worktree, tmuxSession, prUrl,
  // launchedAt, etc.) so we don't accidentally orphan a running task.
  const task: TaskRecord = editing
    ? {
        ...editing,
        title,
        branch: suggestedBranch,
        jiraTicket: jiraKey ?? editing.jiraTicket,
        specFile,
      }
    : {
        id: taskId,
        title,
        repoRoot: repo.root,
        repoName: repo.name,
        branch: suggestedBranch,
        worktree: null,
        status: "draft",
        agent: null,
        model: null,
        createdAt,
        launchedAt: null,
        completedAt: null,
        prUrl: null,
        prNumber: null,
        tmuxSession: null,
        logFile: null,
        jiraTicket: jiraKey ?? null,
        specFile,
      };
  store.upsertTask(task);
  ctx.ui.notify(editing ? `Spec updated: ${title}` : `Spec saved: ${title}`, "success");

  // The draft has been promoted; remove it from drafts/ to keep that
  // directory clean. The canonical spec lives in ~/.forge/specs/.
  if (state.draftPath) {
    try { fs.unlinkSync(state.draftPath); } catch { /* ignore */ }
  }

  // Exit spec-mode before launch (which will use full tools).
  exitSpecMode(pi, ctx);
  return task;
}

/**
 * Prompt the user for project key / type, then call jira.createTicket.
 * Returns the new ticket key on success, null on cancel/error. Remembers
 * the chosen project + type for this repo so subsequent saves don't ask
 * again.
 */
async function promptCreateJira(
  ctx: ExtensionContext,
  store: ForgeStore,
  repo: RepoProfile,
  title: string,
  specBody: string,
): Promise<{ key: string; url?: string } | null> {
  if (!ctx.ui.input) {
    ctx.ui.notify("Cannot create JIRA ticket — interactive input not available.", "warning");
    return null;
  }
  const remembered = store.getRepoConfig(repo.root);
  const project = (
    await ctx.ui.input("JIRA project key:", {
      placeholder: "e.g. PROJ",
      value: remembered.jiraProject ?? "",
    })
  )?.trim();
  if (!project) return null;

  const type =
    (
      await ctx.ui.input("Ticket type:", {
        placeholder: "Task | Story | Bug",
        value: remembered.jiraType ?? "Task",
      })
    )?.trim() || "Task";

  ctx.ui.notify(`Creating ${project} ${type} from spec…`, "info");
  const res = jira.createTicket({
    project,
    type,
    summary: title,
    description: specBody,
  });
  if ("error" in res) {
    ctx.ui.notify(`JIRA create failed: ${res.error}`, "error");
    return null;
  }

  // Remember preferences for this repo
  store.setRepoConfig(repo.root, { jiraProject: project, jiraType: type });
  ctx.ui.notify(`Created ${res.key}.`, "success");
  return { key: res.key, url: res.url };
}

// ─── Wire-up: register hooks, commands, shortcut ──────────────────────────────

/**
 * Install all spec-mode hooks. Idempotent — call once at extension load.
 *
 * Hooks check `state.active` at the top so they're free when spec-mode
 * is off. The plan-mode pattern.
 */
export function installSpecMode(pi: ExtensionAPI, store: ForgeStore): void {
  // Block destructive bash while in spec-mode.
  pi.on("tool_call", async (event) => {
    if (!state.active) return;
    if (event.toolName !== "bash") return;
    const command = (event.input as any)?.command as string | undefined;
    if (!command) return;
    const reason = checkSpecBash(command);
    if (reason) {
      return { block: true, reason };
    }
  });

  // Inject the planner skill content + repo facts on every agent turn.
  pi.on("before_agent_start", async () => {
    if (!state.active) return;
    return {
      message: {
        customType: "forge-spec-mode-context",
        content: buildPlannerContext(),
        display: false,
      },
    };
  });

  // After each agent turn, peek at the draft file to update the status
  // badge title. We DON'T auto-save — the user has to press Alt+S or
  // /forge-save-spec. The chat history no longer carries the spec body
  // (planner edits the file directly), so we read the file.
  pi.on("agent_end", async (_event, ctx) => {
    if (!state.active || !state.draftPath) return;
    try {
      const body = fs.readFileSync(state.draftPath, "utf-8");
      if (body.trim()) {
        const stripped = body.replace(/^---\n[\s\S]*?\n---\n*/, "");
        state.lastDraftTitle = extractTitle(stripped);
        setStatus(ctx);
      }
    } catch {
      /* draft may not exist yet on turn 1 — fine */
    }
  });

  // Filter out spec-mode context messages from being sent back as
  // history when spec-mode exits — they're large and irrelevant once
  // we're back in normal chat.
  pi.on("context", async (event) => {
    if (state.active) return;
    return {
      messages: event.messages.filter((m: any) => {
        const msg = m as { customType?: string };
        return (
          msg.customType !== "forge-spec-mode-context" &&
          msg.customType !== "forge-spec-mode-banner"
        );
      }),
    };
  });

  // Restore state on session start (e.g. resume a session that was
  // mid-draft). We don't auto-resume the active flag — the user has to
  // explicitly re-enter spec-mode if they want to continue. We just
  // restore preferences.
  pi.on("session_start", async (_event, ctx) => {
    setStatus(ctx);
  });

  // ── Commands ──────────────────────────────────────────────────────────
  pi.registerCommand("forge-save-spec", {
    description: "Promote the in-progress Forge draft to a saved spec and (optionally) launch",
    handler: async (_args, ctx) => {
      if (!state.active) {
        ctx.ui.notify("Not in spec-mode.", "warning");
        return;
      }
      const task = await saveSpec(pi, ctx as ExtensionContext, store);
      if (task) {
        await maybeLaunch(pi, ctx as ExtensionContext, store, task);
      }
    },
  });

  pi.registerCommand("forge-cancel-spec", {
    description: "Exit Forge spec-mode (the draft file is preserved on disk for resume)",
    handler: async (_args, ctx) => {
      if (!state.active) {
        ctx.ui.notify("Not in spec-mode.", "warning");
        return;
      }
      const draftPath = state.draftPath;
      const choice = await ctx.ui.select("What about the working draft?", [
        "Keep draft for later",
        "Delete draft",
      ]);
      const deleteDraft = choice === "Delete draft";
      exitSpecMode(pi, ctx as ExtensionContext, { deleteDraft });
      ctx.ui.notify(
        deleteDraft
          ? "Spec-mode exited. Draft deleted."
          : `Spec-mode exited. Draft kept at ${draftPath ?? "(unknown)"}.`,
        "info",
      );
    },
  });

  // Alt+S to save the spec. We previously used Ctrl+S, but that collides
  // with pi's built-in `app.models.save` and produces a startup conflict
  // warning. Ctrl+Shift+* chords get eaten by some terminals, so Alt+S is
  // the next-cleanest "save" chord that's free of conflicts.
  pi.registerShortcut(Key.alt("s"), {
    description: "Save the current Forge spec (when in spec-mode)",
    handler: async (ctx) => {
      if (!state.active) return; // silently ignore outside spec-mode
      const task = await saveSpec(pi, ctx as ExtensionContext, store);
      if (task) {
        await maybeLaunch(pi, ctx as ExtensionContext, store, task);
      }
    },
  });
}

// ─── Optional launch step after save ──────────────────────────────────────────

async function maybeLaunch(
  pi: ExtensionAPI,
  ctx: ExtensionContext,
  store: ForgeStore,
  task: TaskRecord,
): Promise<void> {
  if (!isTmuxAvailable()) {
    ctx.ui.notify(
      `Spec saved. tmux not available, so cannot launch — install tmux and run /forge-launch later.`,
      "info",
    );
    return;
  }

  const launch = await ctx.ui.confirm(
    "Launch agent now?",
    `Spec: ${task.title}\nThis will create a worktree on \`${task.branch}\` and start a tmux session.`,
  );
  if (!launch) {
    ctx.ui.notify(`Saved as draft. Launch later via /forge-launch or the dashboard.`, "info");
    return;
  }

  const repo = state.repo ?? { root: task.repoRoot, name: task.repoName } as any;
  // We let runLaunchWizard ask the agent / model questions. For maximum
  // smoothness later we could carry suggestedAgent/suggestedModel and
  // skip those prompts; for now keep the existing wizard.
  const { runLaunchWizardOrFail } = await import("./index.js").catch(() => ({ runLaunchWizardOrFail: undefined as any }));
  if (runLaunchWizardOrFail) {
    await runLaunchWizardOrFail(store, ctx as any, task, repo);
  } else {
    ctx.ui.notify(`Run /forge-launch to launch ${task.title}.`, "info");
  }
}
