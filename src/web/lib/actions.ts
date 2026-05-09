// Action helpers used by Preact task components. Mirrors legacy `actions.js`
// but takes a `refresh` callback instead of importing app-state directly.
import { type ApiError, apiPost } from "./api";

function toast(msg: string, kind: "info" | "error" = "info") {
  window.__forge?.legacy?.showToast?.(msg, kind);
}

export interface ActionOptions {
  successMsg?: string;
  confirm?: string;
  body?: unknown;
}

export async function runAction(path: string, opts: ActionOptions = {}, afterSuccess?: () => void | Promise<void>) {
  if (opts.confirm && !window.confirm(opts.confirm)) return;
  try {
    await apiPost(path, opts.body);
    toast(opts.successMsg || "Done", "info");
    if (afterSuccess) await afterSuccess();
  } catch (e) {
    const err = e as ApiError;
    const msg = err.hint ? `${err.message} — ${err.hint}` : err.message || "Action failed";
    toast(msg, "error");
  }
}

export async function copyCmd(cmd: string) {
  try {
    await navigator.clipboard.writeText(cmd);
    toast(`Copied: ${cmd}`, "info");
  } catch {
    toast(`Copy failed — run manually: ${cmd}`, "error");
  }
}
