// Single chat bubble — user or assistant. Assistant text is rendered as
// markdown (the planner emits fenced code blocks, lists, etc); user text
// is escaped-and-preserved via white-space:pre-wrap so a typed multiline
// prompt round-trips visually.
import { renderMarkdown } from "../../lib/markdown";
import type { ChatMessage as ChatMessageType } from "../../types";

export function ChatMessage({ m }: { m: ChatMessageType }) {
  const isUser = m.role === "user";
  if (isUser) {
    return (
      <div class="chat-message user">
        <div class="chat-bubble">{m.text}</div>
      </div>
    );
  }
  return (
    <div class="chat-message assistant">
      <div class="chat-bubble" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text || "") }} />
    </div>
  );
}
