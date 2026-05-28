import { selectedComments } from "../../signals/review";

export function BatchBar() {
  const count = selectedComments.value.size;
  if (count === 0) return null;
  return (
    <div class="review-batch-bar">
      <span class="review-batch-count">{count} selected</span>
      <button
        type="button"
        class="btn btn-primary"
        disabled
        data-disabled-reason="phase-2"
        title="Wires up in a later commit"
      >
        Fix {count} selected
      </button>
    </div>
  );
}
