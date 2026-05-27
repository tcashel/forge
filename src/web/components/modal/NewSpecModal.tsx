// New-spec modal, ported from the inline `<div id="new-spec-modal">`
// in index.html and the modal handlers at the bottom of legacy `app.js`.
//
// All form fields are component-local `useSignal` values. The modal's
// open state lives in `signals/ui.ts:modalOpen`. Polls (repos, tasks)
// only update their data signals; this component re-renders for the
// repo dropdown when repos change, but the textarea and inputs are
// keyed off local signals, so typing-in-progress is preserved.
//
// Phase 8: a left rail hosts <PlannerChat scope="draft" id={draftId}/>.
// The draft is minted lazily on first open via POST /api/plan-chat/draft,
// reused for the lifetime of the modal session, and either promoted onto
// the new spec (on save) or deleted (on close-without-save). The chat's
// "Apply to spec" button lifts the latest assistant fenced markdown into
// the body textarea.
import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { type ApiError, apiPost } from "../../lib/api";
import { CUSTOM_REPO_VALUE } from "../../lib/modal-constants";
import { showToast } from "../../lib/toast";
import { repos } from "../../signals/repos";
import { refreshTasks } from "../../signals/tasks";
import { modalOpen, selectedRepo } from "../../signals/ui";
import type { PlanDraftResponse, RepoView } from "../../types";
import { PlannerChat } from "../chat/PlannerChat";

function repoKey(r: RepoView): string {
  return r.root || r.name || "";
}

function toast(msg: string, kind: "info" | "error" = "info") {
  showToast(msg, kind);
}

interface NewSpecResponse {
  planId: string;
}

export function NewSpecModal() {
  const open = modalOpen.value;
  const repoList = repos.value;

  const repoSel = useSignal<string>("");
  const repoCustom = useSignal<string>("");
  const title = useSignal<string>("");
  const body = useSignal<string>("");
  const agent = useSignal<string>("");
  const model = useSignal<string>("");
  const autoImprove = useSignal<boolean>(true);
  const submitting = useSignal<boolean>(false);
  // Plan-chat draft lifecycle. Minted on first open, promoted on save,
  // deleted on close-without-save. Stored in a signal so the chat rail
  // re-mounts cleanly when the id flips from null → "d_…".
  const draftId = useSignal<string | null>(null);
  // Tracks whether the most recent close path is a "save" vs "cancel" —
  // the success path of onSubmit sets `promoted=true` so the unmount
  // effect knows not to delete the draft we just promoted.
  const promoted = useRef<boolean>(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const customRef = useRef<HTMLInputElement | null>(null);
  const repoSelRef = useRef<HTMLSelectElement | null>(null);

  // Each time the modal opens: pick a sensible default repo, clear
  // submission state, focus the title (or custom-path) input. Match
  // legacy behavior. Form fields are NOT cleared on open — that
  // preserves intent if the user closes and re-opens by mistake.
  useEffect(() => {
    if (!open) return;
    const known = repoList.filter((r) => !r.stale);
    const selectedView = known.find((r) => repoKey(r) === selectedRepo.value);
    if (selectedView) {
      repoSel.value = selectedView.root;
    } else if (known[0]) {
      repoSel.value = known[0].root;
    } else {
      repoSel.value = CUSTOM_REPO_VALUE;
    }
    submitting.value = false;
    // Focus after the next paint so the input exists.
    setTimeout(() => {
      if (repoSel.value === CUSTOM_REPO_VALUE) customRef.current?.focus();
      else titleRef.current?.focus();
    }, 0);
  }, [open]);

  // Escape closes the modal. Listen on window so it works regardless
  // of which inner element has focus.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        modalOpen.value = false;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Plan-chat draft lifecycle. On first open with no draftId, mint one
  // via POST /api/plan-chat/draft. On close (open flips false), delete
  // any unpromoted draft so we don't litter ~/.forge/plan-drafts.
  useEffect(() => {
    if (!open) {
      // Modal just closed. If a draft was minted but not promoted, ask
      // the server to delete it (and its on-disk transcript).
      const id = draftId.value;
      if (id && !promoted.current) {
        // Fire-and-forget — DELETE failures don't block UX, the boot
        // reaper sweeps stale drafts.
        fetch(`/api/plan-chat/draft/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {
          /* noop */
        });
      }
      draftId.value = null;
      promoted.current = false;
      return;
    }
    // Modal opened and we don't yet have a draft — mint one.
    if (draftId.value) return;
    let cancelled = false;
    apiPost<PlanDraftResponse>("/api/plan-chat/draft", {})
      .then((data) => {
        if (cancelled) return;
        draftId.value = data.draftId;
      })
      .catch((e: ApiError) => {
        if (cancelled) return;
        toast(`Could not start plan-chat: ${e.message || "unknown error"}`, "error");
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Tab-focus trap inside the modal card. Mirrors legacy keydown
  // handler in app.js.
  const onCardKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const card = cardRef.current;
    if (!card) return;
    const nodes = card.querySelectorAll<HTMLElement>(
      'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const visible = Array.from(nodes).filter((el) => !(el as HTMLButtonElement).disabled && el.offsetParent !== null);
    if (visible.length === 0) return;
    const first = visible[0];
    const last = visible[visible.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const onBackdropClick = (e: MouseEvent) => {
    // Only close when the click is on the overlay itself, not bubbled
    // up from the modal card.
    if (e.target === e.currentTarget) {
      modalOpen.value = false;
    }
  };

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    let repoRoot = repoSel.value.trim();
    if (repoRoot === CUSTOM_REPO_VALUE) repoRoot = repoCustom.value.trim();
    const markdown = body.value;
    const titleStr = title.value.trim();
    const agentStr = agent.value;
    const modelStr = model.value.trim();
    const auto = autoImprove.value;

    if (!repoRoot) {
      toast("Pick a repo or enter a custom path.", "error");
      return;
    }
    if (!markdown.trim()) {
      toast("Markdown body is required.", "error");
      return;
    }

    submitting.value = true;
    const reqBody: Record<string, unknown> = {
      markdown,
      repoRoot,
      // Server runs auto-improve unconditionally unless we send false; we
      // POST `autoImprove: false` and run our own improve POST below if
      // the checkbox is on. Matches legacy behavior so the spec save and
      // the optional improve run as decoupled requests.
      autoImprove: false,
    };
    if (titleStr) reqBody.title = titleStr;
    if (agentStr) reqBody.agent = agentStr;
    if (modelStr) reqBody.model = modelStr;

    try {
      const data = await apiPost<NewSpecResponse>("/api/specs", reqBody);
      // Promote the plan-chat draft onto the new spec, if any was
      // minted. Best-effort: if promotion fails (the spec already has a
      // history.json, etc), surface a toast but still close the modal.
      const dId = draftId.value;
      if (dId && data.planId) {
        try {
          await apiPost(`/api/plan-chat/draft/${encodeURIComponent(dId)}/promote`, { planId: data.planId });
          promoted.current = true;
        } catch (err) {
          const e3 = err as ApiError;
          toast(`Plan-chat history not attached: ${e3.message || "promote failed"}`, "error");
        }
      }
      // Reset form so the next open starts blank.
      title.value = "";
      body.value = "";
      agent.value = "";
      model.value = "";
      repoCustom.value = "";
      autoImprove.value = true;
      modalOpen.value = false;
      await refreshTasks();
      if (data.planId) {
        window.__forge?.api?.selectTask?.(data.planId);
      }
      if (auto && data.planId) {
        toast(`Saved ${data.planId} — auto-improve running in background…`, "info");
        apiPost(`/api/plans/${encodeURIComponent(data.planId)}/improve`, {}).catch((err) => {
          const e2 = err as ApiError;
          toast(
            e2.hint ? `Auto-improve failed: ${e2.message} — ${e2.hint}` : `Auto-improve failed: ${e2.message}`,
            "error",
          );
        });
      } else {
        toast(`Saved spec ${data.planId}`, "info");
      }
    } catch (err) {
      const e2 = err as ApiError;
      toast(e2.hint ? `${e2.message} — ${e2.hint}` : e2.message || "Save failed", "error");
      submitting.value = false;
    }
  };

  // When the user picks "Custom path…", focus the custom-path input.
  const onRepoChange = (e: Event) => {
    const value = (e.currentTarget as HTMLSelectElement).value;
    repoSel.value = value;
    if (value === CUSTOM_REPO_VALUE) {
      setTimeout(() => customRef.current?.focus(), 0);
    }
  };

  const known = repoList.filter((r) => !r.stale);
  const isCustom = repoSel.value === CUSTOM_REPO_VALUE;

  // Resolve the absolute repo root the planner subprocess should run
  // in. For known repos the dropdown value IS the absolute root; for
  // the "Custom path…" option, fall back to whatever the user typed
  // (must be absolute — server will reject relative paths with
  // BAD_CWD). When unset, we omit the field entirely so the server
  // keeps its `process.cwd()` fallback.
  const customTrimmed = repoCustom.value.trim();
  const selectedRepoForChat = isCustom
    ? customTrimmed.startsWith("/")
      ? customTrimmed
      : undefined
    : repoSel.value || undefined;

  return (
    // The overlay is a click-only backdrop dismiss target — Escape and
    // the explicit Cancel/Close buttons cover keyboard navigation, so
    // a parallel onKey handler here would just double up.
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop dismiss is a UI affordance
    // biome-ignore lint/a11y/useKeyWithClickEvents: Escape key handled at window level
    <div class="modal-overlay" id="new-spec-modal" hidden={!open} onClick={onBackdropClick}>
      <div
        class="modal-card with-chat"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-spec-title-h"
        ref={cardRef}
        onKeyDown={onCardKeyDown}
      >
        <aside class="modal-chat-rail">
          {draftId.value ? (
            <PlannerChat
              // Re-key on the selected repo so flipping the Repo
              // dropdown mid-modal-session remounts the chat panel —
              // without this an in-flight stream would still be
              // running against the previous repo's filesystem.
              key={`${draftId.value}|${selectedRepoForChat ?? ""}`}
              scope="draft"
              id={draftId.value}
              repoRoot={selectedRepoForChat}
              onApply={(markdown) => {
                body.value = markdown;
                toast("Applied to spec body", "info");
                // Nudge focus into the body textarea so the user can
                // immediately edit the inserted markdown.
                setTimeout(() => bodyRef.current?.focus(), 0);
              }}
            />
          ) : (
            <div class="chat-panel">
              <div class="chat-empty">Starting plan-chat draft…</div>
            </div>
          )}
        </aside>
        <div class="modal-form-col">
          <div class="modal-head">
            <h2 id="new-spec-title-h">New spec</h2>
            <button
              type="button"
              class="close"
              id="new-spec-close"
              aria-label="Close"
              onClick={() => {
                modalOpen.value = false;
              }}
            >
              ×
            </button>
          </div>
          <form id="new-spec-form" onSubmit={onSubmit}>
            <div class="modal-body">
              <div class="field">
                <label for="new-spec-repo">Repo</label>
                <select id="new-spec-repo" ref={repoSelRef} value={repoSel.value} onChange={onRepoChange}>
                  {known.map((r) => (
                    <option key={r.root} value={r.root}>
                      {r.name} ({r.root})
                    </option>
                  ))}
                  <option value={CUSTOM_REPO_VALUE}>Custom path…</option>
                </select>
                <div class="hint">
                  Pick a known repo, or choose <em>Custom path…</em> to register a brand-new one (the server validates
                  it&apos;s a git repo before saving).
                </div>
              </div>
              <div class="field" id="new-spec-repo-custom-wrap" hidden={!isCustom}>
                <label for="new-spec-repo-custom">Custom repo path</label>
                <input
                  id="new-spec-repo-custom"
                  type="text"
                  placeholder="/absolute/path/to/your/git/repo"
                  ref={customRef}
                  value={repoCustom.value}
                  onInput={(e) => {
                    repoCustom.value = (e.currentTarget as HTMLInputElement).value;
                  }}
                />
              </div>
              <div class="field">
                <label for="new-spec-title">
                  Title{" "}
                  <span style="color:var(--dim);font-weight:400;text-transform:none;letter-spacing:0">(optional)</span>
                </label>
                <input
                  id="new-spec-title"
                  type="text"
                  placeholder="feat(scope): short imperative summary, ≤70 chars"
                  maxLength={120}
                  ref={titleRef}
                  value={title.value}
                  onInput={(e) => {
                    title.value = (e.currentTarget as HTMLInputElement).value;
                  }}
                />
                <div class="hint">
                  Defaults to the first H1 in the markdown body. Should match conventional-commit format — Forge uses it
                  verbatim as the PR title.
                </div>
              </div>
              <div class="field">
                <label for="new-spec-body">Markdown body</label>
                <textarea
                  id="new-spec-body"
                  required
                  ref={bodyRef}
                  placeholder={
                    "# feat(scope): short imperative\n\nA paragraph describing the work, why it's needed, and the intended outcome.\n\n## Acceptance criteria\n\n- it does the thing\n- existing tests still pass"
                  }
                  value={body.value}
                  onInput={(e) => {
                    body.value = (e.currentTarget as HTMLTextAreaElement).value;
                  }}
                />
              </div>
              <div class="field-row">
                <div class="field">
                  <label for="new-spec-agent">
                    Agent{" "}
                    <span style="color:var(--dim);font-weight:400;text-transform:none;letter-spacing:0">
                      (optional)
                    </span>
                  </label>
                  <select
                    id="new-spec-agent"
                    value={agent.value}
                    onChange={(e) => {
                      agent.value = (e.currentTarget as HTMLSelectElement).value;
                    }}
                  >
                    <option value="">Use repo default</option>
                    <option value="claude">claude</option>
                    <option value="codex">codex</option>
                    <option value="opencode">opencode</option>
                    <option value="gemini">gemini</option>
                  </select>
                </div>
                <div class="field">
                  <label for="new-spec-model">
                    Model{" "}
                    <span style="color:var(--dim);font-weight:400;text-transform:none;letter-spacing:0">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="new-spec-model"
                    type="text"
                    placeholder="e.g. claude-opus-4-7"
                    value={model.value}
                    onInput={(e) => {
                      model.value = (e.currentTarget as HTMLInputElement).value;
                    }}
                  />
                </div>
              </div>
              <div class="field field-checkbox">
                <input
                  id="new-spec-improve"
                  type="checkbox"
                  checked={autoImprove.value}
                  onChange={(e) => {
                    autoImprove.value = (e.currentTarget as HTMLInputElement).checked;
                  }}
                />
                <label for="new-spec-improve">
                  Run auto-improve in the background after save (two critics + synthesizer; ~1–2 min)
                </label>
              </div>
            </div>
            <div class="modal-foot">
              <button
                type="button"
                class="btn btn-ghost"
                id="new-spec-cancel"
                onClick={() => {
                  modalOpen.value = false;
                }}
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" id="new-spec-submit" disabled={submitting.value}>
                {submitting.value ? "Saving…" : "Save spec"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
