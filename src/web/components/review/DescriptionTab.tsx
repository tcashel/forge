import type { PrReviewBundle } from "../../types";
import { MarkdownViewer } from "../MarkdownViewer";
import { DigestCard } from "./DigestCard";

export function DescriptionTab({ bundle, repoRoot }: { bundle: PrReviewBundle; repoRoot: string }) {
  const body = bundle.pr.body ?? "";
  return (
    <div class="review-description">
      <DigestCard bundle={bundle} repoRoot={repoRoot} />
      {body.trim() ? (
        <MarkdownViewer markdown={body} class="review-md" />
      ) : (
        <p class="review-tab-empty">This PR has no description.</p>
      )}
    </div>
  );
}
