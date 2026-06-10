import type { PrReviewBundle } from "../../types";
import { MarkdownViewer } from "../MarkdownViewer";

export function DescriptionTab({ bundle }: { bundle: PrReviewBundle }) {
  const body = bundle.pr.body ?? "";
  return (
    <div class="review-description">
      {body.trim() ? (
        <MarkdownViewer markdown={body} class="review-md" />
      ) : (
        <p class="review-tab-empty">This PR has no description.</p>
      )}
    </div>
  );
}
