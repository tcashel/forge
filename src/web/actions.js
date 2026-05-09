import { apiPost } from "./api.js";
import { showToast } from "./dom.js";

export async function runAction(path, opts, afterSuccess) {
  const o = opts || {};
  if (o.confirm && !window.confirm(o.confirm)) return;
  try {
    await apiPost(path, o.body);
    showToast(o.successMsg || "Done", "info");
    if (afterSuccess) await afterSuccess();
  } catch (e) {
    const msg = e.hint ? `${e.message} — ${e.hint}` : e.message || "Action failed";
    showToast(msg, "error");
  }
}

export async function copyCmd(cmd) {
  try {
    await navigator.clipboard.writeText(cmd);
    showToast(`Copied: ${cmd}`, "info");
  } catch {
    showToast(`Copy failed — run manually: ${cmd}`, "error");
  }
}
