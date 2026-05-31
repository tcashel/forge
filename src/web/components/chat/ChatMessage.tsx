// Single chat bubble — user or assistant. Assistant text is rendered as
// markdown (the planner emits fenced code blocks, lists, etc); user text
// is escaped-and-preserved via white-space:pre-wrap so a typed multiline
// prompt round-trips visually.
//
// When the assistant message carries a `blocks` array (stream-json
// histories), we render text + tool_use cards in order. When it doesn't
// (legacy histories persisted before stream-json was wired up), we fall
// back to the plain markdown path on `m.text`.
import type { VNode } from "preact";
import type { ChatBlock, ChatMessage as ChatMessageType } from "../../types";
import { MarkdownViewer } from "../MarkdownViewer";
import { ChatToolCard } from "./ChatToolCard";

export function ChatMessage({ m }: { m: ChatMessageType }) {
  const isUser = m.role === "user";
  if (isUser) {
    return (
      <div class="chat-message user">
        <div class="chat-bubble">{m.text}</div>
      </div>
    );
  }
  const blocks = m.blocks;
  const useBlocks = Array.isArray(blocks) && blocks.length > 0;
  return (
    <div class="chat-message assistant">
      <div class="chat-bubble">
        {useBlocks ? renderBlocks(blocks as ChatBlock[]) : <BubbleMarkdown text={m.text || ""} />}
      </div>
    </div>
  );
}

function BubbleMarkdown({ text }: { text: string }) {
  return <MarkdownViewer markdown={text} class="chat-markdown" />;
}

function renderBlocks(blocks: ChatBlock[]) {
  // Pair tool_use blocks with their tool_result by toolUseId so the card
  // gets both sides at once. tool_result blocks aren't rendered on their
  // own — they're folded into the matching card.
  const resultsById = new Map<string, Extract<ChatBlock, { type: "tool_result" }>>();
  for (const b of blocks) if (b.type === "tool_result") resultsById.set(b.toolUseId, b);

  const out: VNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === "text") {
      out.push(<BubbleMarkdown key={`t-${i}`} text={b.text} />);
    } else if (b.type === "tool_use") {
      out.push(<ChatToolCard key={`tu-${b.id}`} use={b} result={resultsById.get(b.id) ?? null} />);
    }
    // tool_result handled via the pairing above.
  }
  return out;
}
