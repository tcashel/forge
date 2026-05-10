// Tiny formatting helpers for the PR view. Mirror of the corresponding
// helpers in legacy `src/web/prs.js` (kept identical so styles + labels
// don't shift when the legacy renderer is removed).

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms)) return "—";
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h`;
  return `${Math.round(ms / 86_400_000)}d`;
}

export function ciClass(status: string | null | undefined): string {
  if (status === "SUCCESS") return "pass";
  if (status === "FAILURE" || status === "ERROR") return "fail";
  if (status === "PENDING") return "pend";
  return "none";
}

export function ciLabel(status: string | null | undefined): string {
  if (status === "SUCCESS") return "CI pass";
  if (status === "FAILURE" || status === "ERROR") return "CI fail";
  if (status === "PENDING") return "CI pending";
  return "CI none";
}

export function reviewClass(decision: string | null | undefined): string {
  if (decision === "APPROVED") return "pass";
  if (decision === "CHANGES_REQUESTED") return "fail";
  if (decision === "REVIEW_REQUIRED") return "pend";
  return "none";
}

export function reviewLabel(decision: string | null | undefined): string {
  if (decision === "APPROVED") return "review ok";
  if (decision === "CHANGES_REQUESTED") return "changes";
  if (decision === "REVIEW_REQUIRED") return "review needed";
  return "no review";
}
