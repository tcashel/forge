// Single chat component used in two integration points:
//   - Plan tab on each task → scope="spec", id=taskId
//   - New-spec modal left rail → scope="draft", id=draftId
//
// Owns history hydration, the in-progress streaming bubble, the
// composer, and history wipe. The composer is a `<textarea>` bound to a
// component-local `useSignal("")` — Preact never replaces the node so
// focus survives streaming, polls, and parent re-renders. SSE consumes
// `lib/sse.ts:startChatStream` (POST + ReadableStream parser).
import { type Signal, useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import { type ApiError, apiGet, apiPost } from "../../lib/api";
import { type ChatMeta, type ChatRateLimit, startChatStream } from "../../lib/sse";
import { showToast } from "../../lib/toast";
import type { ChatBlock, ChatMessage as ChatMessageType, PlanHistoryResponse } from "../../types";
import { ChatMessage } from "./ChatMessage";
import { ChatToolCard } from "./ChatToolCard";

type Scope = "spec" | "draft";

function historyUrl(scope: Scope, id: string): string {
  return scope === "spec"
    ? `/api/specs/${encodeURIComponent(id)}/plan-history`
    : `/api/plan-chat/draft/${encodeURIComponent(id)}/history`;
}

function messageUrl(scope: Scope, id: string): string {
  return scope === "spec"
    ? `/api/specs/${encodeURIComponent(id)}/plan-chat`
    : `/api/plan-chat/draft/${encodeURIComponent(id)}/message`;
}

function abortUrl(scope: Scope, id: string): string {
  return scope === "spec"
    ? `/api/specs/${encodeURIComponent(id)}/plan-chat/abort`
    : `/api/plan-chat/draft/${encodeURIComponent(id)}/abort`;
}

function wipeUrl(scope: Scope, id: string): string | null {
  // Only the spec scope exposes DELETE plan-history. For drafts, the
  // server clears history when the draft is deleted (modal close).
  if (scope === "spec") return `/api/specs/${encodeURIComponent(id)}/plan-history`;
  return null;
}

interface PlannerChatProps {
  scope: Scope;
  id: string;
  /** Optional callback for the "Apply to spec" affordance — only the
   *  draft-scope mount in NewSpecModal wires this up. */
  onApply?: (markdown: string) => void;
  /**
   * Absolute path of the repo the planner subprocess should run in.
   *
   * - **Draft scope**: required for the spawned `claude` to explore the
   *   right tree. Without it the server falls back to `process.cwd()`,
   *   which is almost always wrong (= the directory `forge serve` was
   *   launched from).
   * - **Spec scope**: optional. The server resolves `repoRoot` from
   *   the task record, so passing it is a no-op symmetry with draft.
   */
  repoRoot?: string;
}

export function PlannerChat({ scope, id, onApply, repoRoot }: PlannerChatProps) {
  // Server-side history (hydrated on mount + after each turn). Local
  // signals only — no global signal, since two modals could coexist
  // (Plan tab open + new-spec modal in the future).
  const messages = useSignal<ChatMessageType[]>([]);
  const draft = useSignal<string>("");
  // Live blocks for the in-flight assistant turn. We mutate a single
  // signal array so partial-text frames can update the open text block
  // and tool_use / tool_result frames can land in order. Cleared on
  // turn close — finalized blocks are appended via `messages` after
  // history refresh.
  const streamingBlocks = useSignal<ChatBlock[]>([]);
  const streamingMeta = useSignal<ChatMeta | null>(null);
  const streamingRate = useSignal<ChatRateLimit | null>(null);
  const isStreaming = useSignal<boolean>(false);
  const loading = useSignal<boolean>(true);
  const error = useSignal<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  // Track an active AbortController so the user-initiated Stop button
  // can cancel in-flight, and so unmount cleans up properly.
  const abortRef = useRef<AbortController | null>(null);

  // Hydrate history whenever scope/id changes (switching tasks should
  // refresh, opening the modal should fetch the empty draft history).
  useEffect(() => {
    let cancelled = false;
    loading.value = true;
    error.value = null;
    apiGet<PlanHistoryResponse>(historyUrl(scope, id))
      .then((data) => {
        if (cancelled) return;
        messages.value = data.messages ?? [];
        loading.value = false;
        // Defer scroll until after Preact paints the new messages.
        requestAnimationFrame(scrollToBottom);
      })
      .catch((e: ApiError) => {
        if (cancelled) return;
        error.value = e.message || "Failed to load chat history.";
        loading.value = false;
      });
    return () => {
      cancelled = true;
      // Cancel any in-flight stream when the consumer swaps tasks/scope.
      if (abortRef.current) {
        try {
          abortRef.current.abort();
        } catch {
          /* noop */
        }
        abortRef.current = null;
      }
    };
  }, [scope, id]);

  // Auto-scroll on streaming token append. Only nudge to bottom if the
  // user is already near the bottom — preserves intentional scroll-up
  // for re-reading earlier replies.
  useEffect(() => {
    void streamingBlocks.value;
    void messages.value;
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) requestAnimationFrame(scrollToBottom);
  });

  function scrollToBottom() {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  async function refreshHistory(): Promise<void> {
    // Throw on failure — `send()` relies on the rejection to route to its
    // local-fallback path (splice receivedFullText into the optimistic
    // user message) when a refresh after `done` fails. Swallowing here
    // would leave the user with only the optimistic user turn and no
    // assistant reply.
    const data = await apiGet<PlanHistoryResponse>(historyUrl(scope, id));
    messages.value = data.messages ?? [];
  }

  async function send(): Promise<void> {
    const text = draft.value.trim();
    if (!text || isStreaming.value) return;
    // Snapshot then clear so the textarea is immediately empty —
    // matches every other chat client and keeps the composer ready for
    // a follow-up.
    draft.value = "";
    error.value = null;

    // Optimistically render the user message (the server appends it
    // synchronously before spawning, so this just hides latency).
    const userMsg: ChatMessageType = {
      id: `tmp_${Date.now().toString(36)}`,
      role: "user",
      text,
      ts: new Date().toISOString(),
    };
    messages.value = [...messages.value, userMsg];

    streamingBlocks.value = [];
    streamingMeta.value = null;
    streamingRate.value = null;
    isStreaming.value = true;
    const controller = new AbortController();
    abortRef.current = controller;

    let receivedDone = false;
    let receivedFullText = "";

    // Mutable working copy — we replace `streamingBlocks.value` with a
    // shallow clone on every change so signal subscribers re-render.
    let workingBlocks: ChatBlock[] = [];
    const flush = () => {
      streamingBlocks.value = workingBlocks.slice();
    };

    try {
      await startChatStream({
        url: messageUrl(scope, id),
        body: repoRoot ? { message: text, repoRoot } : { message: text },
        signal: controller.signal,
        listeners: {
          onMeta: (meta) => {
            streamingMeta.value = meta;
          },
          onTextDelta: (e) => {
            // Stream-json emits a fresh full snapshot per text block.
            // If the current open block is text, replace it; otherwise
            // open a new text block at the end.
            const last = workingBlocks[workingBlocks.length - 1];
            if (last && last.type === "text") {
              workingBlocks = workingBlocks.slice(0, -1).concat({ type: "text", text: e.text });
            } else {
              workingBlocks = workingBlocks.concat({ type: "text", text: e.text });
            }
            flush();
          },
          onToolUse: (e) => {
            workingBlocks = workingBlocks.concat({ type: "tool_use", id: e.toolUseId, name: e.name, input: e.input });
            flush();
          },
          onToolResult: (e) => {
            workingBlocks = workingBlocks.concat({
              type: "tool_result",
              toolUseId: e.toolUseId,
              output: e.output,
              isError: e.isError,
              truncated: e.truncated || undefined,
            });
            flush();
          },
          onRateLimit: (e) => {
            streamingRate.value = e;
          },
          onDone: (final) => {
            receivedDone = true;
            const fallback = workingBlocks
              .filter((b): b is { type: "text"; text: string } => b.type === "text")
              .map((b) => b.text)
              .join("\n")
              .trim();
            receivedFullText = final.fullText || fallback;
          },
          onError: (msg) => {
            error.value = msg;
          },
        },
      });
    } finally {
      isStreaming.value = false;
      abortRef.current = null;
      streamingBlocks.value = [];
      streamingMeta.value = null;
      streamingRate.value = null;
      if (receivedDone) {
        // Refresh from disk so we get the server-assigned id + ts. If
        // the network round-trip fails (rare), fall back to splicing
        // the local fullText so the user still sees their reply.
        try {
          await refreshHistory();
        } catch {
          messages.value = [
            ...messages.value,
            {
              id: `tmp_a_${Date.now().toString(36)}`,
              role: "assistant",
              text: receivedFullText,
              ts: new Date().toISOString(),
            },
          ];
        }
      } else {
        // Stream ended without `done` (error or abort). Re-sync from
        // server so the optimistic user message reflects whatever
        // actually persisted. Best-effort — surface failures via the
        // banner but don't blow up the finally block.
        try {
          await refreshHistory();
        } catch (e) {
          const apiErr = e as ApiError;
          error.value = apiErr.message || "Failed to refresh history.";
        }
      }
      requestAnimationFrame(scrollToBottom);
    }
  }

  async function stop(): Promise<void> {
    if (!isStreaming.value) return;
    try {
      await apiPost(abortUrl(scope, id), {});
    } catch (e) {
      const apiErr = e as ApiError;
      // Surface but don't bail — local AbortController still cleans up.
      showToast(`Could not abort: ${apiErr.message || "unknown error"}`, "error");
    }
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {
        /* noop */
      }
      abortRef.current = null;
    }
  }

  async function wipe(): Promise<void> {
    const url = wipeUrl(scope, id);
    if (!url) return;
    if (!confirm("Wipe this plan-chat history? This can't be undone.")) return;
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      messages.value = [];
      streamingBlocks.value = [];
      showToast("Plan-chat history wiped.", "info");
    } catch (e) {
      showToast(`Wipe failed: ${e instanceof Error ? e.message : String(e)}`, "error");
    }
  }

  function handleApply(): void {
    if (!onApply) return;
    const md = extractLastFenced(messages.value);
    if (!md) {
      showToast("No fenced code block in the latest assistant reply.", "error");
      return;
    }
    onApply(md);
  }

  // Cmd/Ctrl+Enter submits; plain Enter inserts a newline so multi-line
  // prompts are easy to write.
  function onComposerKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <div class="chat-panel">
      <div class="chat-head">
        <h3>Planner</h3>
        <div class="chat-head-actions">
          {scope === "spec" ? (
            <button type="button" class="btn sm btn-ghost" onClick={() => void wipe()} disabled={isStreaming.value}>
              Wipe history
            </button>
          ) : null}
        </div>
      </div>
      <div class="chat-scroll" ref={scrollRef}>
        {loading.value ? (
          <div class="chat-empty">Loading history…</div>
        ) : messages.value.length === 0 && !isStreaming.value ? (
          <div class="chat-empty">
            Ask the planner anything about your task — refining acceptance criteria, breaking work into steps, or
            sanity-checking a design.
          </div>
        ) : null}
        {messages.value.map((m) => (
          <ChatMessage key={m.id} m={m} />
        ))}
        {isStreaming.value ? (
          <StreamingBubble blocks={streamingBlocks.value} meta={streamingMeta.value} rate={streamingRate.value} />
        ) : null}
        {error.value ? <div class="chat-error">{error.value}</div> : null}
      </div>
      <ChatComposer
        draft={draft}
        disabled={isStreaming.value || loading.value}
        onSubmit={() => void send()}
        onStop={() => void stop()}
        onApply={onApply ? handleApply : undefined}
        showApply={!!onApply}
        isStreaming={isStreaming.value}
        onKeyDown={onComposerKeyDown}
      />
    </div>
  );
}

// ─── Composer ──────────────────────────────────────────────────────────────
// Split out so the textarea node has a stable identity even when the
// scroll area re-renders on every streaming token. Preact reuses the
// same DOM element when the JSX shape is stable, but isolating the
// composer makes the focus-stability invariant explicit.

interface ChatComposerProps {
  draft: Signal<string>;
  disabled: boolean;
  isStreaming: boolean;
  onSubmit: () => void;
  onStop: () => void;
  onApply?: () => void;
  showApply: boolean;
  onKeyDown: (e: KeyboardEvent) => void;
}

function ChatComposer(props: ChatComposerProps) {
  return (
    <div class="chat-composer">
      <textarea
        class="chat-input"
        placeholder={props.isStreaming ? "Streaming reply… press Stop to cancel." : "Message the planner (⌘↵ to send)"}
        rows={3}
        value={props.draft.value}
        onInput={(e) => {
          props.draft.value = (e.currentTarget as HTMLTextAreaElement).value;
        }}
        onKeyDown={props.onKeyDown}
      />
      <div class="chat-composer-actions">
        {props.showApply ? (
          <button
            type="button"
            class="btn sm btn-secondary"
            onClick={() => props.onApply?.()}
            disabled={props.isStreaming}
            title="Copy the latest assistant reply's fenced markdown block into the spec body"
          >
            Apply to spec
          </button>
        ) : null}
        <span style="flex:1" />
        {props.isStreaming ? (
          <button type="button" class="btn sm btn-danger" onClick={props.onStop}>
            Stop
          </button>
        ) : (
          <button
            type="button"
            class="btn sm btn-primary"
            onClick={props.onSubmit}
            disabled={props.disabled || props.draft.value.trim().length === 0}
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Streaming bubble ──────────────────────────────────────────────────────
// Renders the in-flight assistant turn: meta header (cwd · model), then
// each block in order — text as markdown, tool_use as a collapsible card
// pre-paired with its tool_result if one has arrived. A blinking cursor
// trails the active text block; "thinking…" placeholder when nothing has
// streamed yet.

interface StreamingBubbleProps {
  blocks: ChatBlock[];
  meta: ChatMeta | null;
  rate: ChatRateLimit | null;
}

function StreamingBubble({ blocks, meta, rate }: StreamingBubbleProps) {
  // Pair tool_use → tool_result by id so the card opens with its output.
  const resultsById = new Map<string, Extract<ChatBlock, { type: "tool_result" }>>();
  for (const b of blocks) if (b.type === "tool_result") resultsById.set(b.toolUseId, b);

  const segments = blocks.filter((b) => b.type !== "tool_result");
  const hasContent = segments.length > 0;

  return (
    <div class="chat-message assistant streaming">
      <div class="chat-bubble">
        {meta ? (
          <div class="chat-stream-meta">
            <span class="chat-stream-meta-label">Working in</span>
            <span class="chat-stream-meta-val">{meta.cwd ?? "(unknown cwd)"}</span>
            {meta.model ? (
              <>
                <span class="chat-stream-meta-sep">·</span>
                <span class="chat-stream-meta-val">{meta.model}</span>
              </>
            ) : null}
          </div>
        ) : null}
        {!hasContent ? <span class="chat-pending">thinking…</span> : null}
        {segments.map((b, i) => {
          if (b.type === "text") {
            return (
              <p key={`t-${i}`} class="chat-stream-text">
                {b.text}
                {i === segments.length - 1 ? <span class="chat-cursor" /> : null}
              </p>
            );
          }
          if (b.type === "tool_use") {
            return <ChatToolCard key={`tu-${b.id}`} use={b} result={resultsById.get(b.id) ?? null} />;
          }
          return null;
        })}
        {rate?.status && rate.status !== "allowed" ? (
          <div class="chat-stream-rate">rate-limit: {rate.status}</div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Find the last fenced code block in the most recent assistant message.
 *  Prefers ```forge-spec or ```markdown over a generic fence. Returns
 *  the inner content (without the fences) trimmed. */
export function extractLastFenced(messages: ChatMessageType[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "assistant") continue;
    const md = extractFromText(m.text);
    if (md !== null) return md;
  }
  return null;
}

function extractFromText(text: string): string | null {
  // Match all triple-fence blocks (with or without a language tag) and
  // pick the best candidate: prefer forge-spec → markdown → last block.
  const re = /```([^\n]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  let last: { tag: string; body: string } | null = null;
  let preferred: { tag: string; body: string } | null = null;
  // biome-ignore lint/suspicious/noAssignInExpressions: regex iteration idiom
  while ((match = re.exec(text)) !== null) {
    const tag = (match[1] || "").trim().toLowerCase();
    const body = match[2];
    last = { tag, body };
    if (tag === "forge-spec" || tag === "markdown" || tag === "md") preferred = { tag, body };
  }
  const chosen = preferred ?? last;
  if (!chosen) return null;
  return chosen.body.replace(/\n+$/, "");
}
