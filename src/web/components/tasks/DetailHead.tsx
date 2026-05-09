import { copyCmd, runAction } from "../../lib/actions";
import { statClass } from "../../lib/format";
import { currentTab, refreshTasks } from "../../signals/tasks";
import { selectedRepo } from "../../signals/ui";
import type { TaskView } from "../../types";

interface ActionDef {
  label: string;
  cls: string;
  action: ActionId;
}

type ActionId =
  | "tail-log"
  | "open-log"
  | "view-spec"
  | "review-critique"
  | "copy-attach"
  | "open-pr"
  | "launch"
  | "critique"
  | "kill";

function actionsFor(t: TaskView): ActionDef[] {
  const items: ActionDef[] = [];
  if (t.section === "running") {
    items.push({ label: "Tail log", cls: "btn-primary", action: "tail-log" });
    if (t.tmuxAlive) items.push({ label: "Attach tmux", cls: "btn-secondary", action: "copy-attach" });
    if (t.prUrl) items.push({ label: "Open PR draft", cls: "btn-ghost", action: "open-pr" });
    items.push({ label: "Kill", cls: "btn-ghost", action: "kill" });
  } else if (t.kind === "critique-ready") {
    items.push({ label: "Review critique", cls: "btn-attention", action: "review-critique" });
    items.push({ label: "Launch anyway", cls: "btn-secondary", action: "launch" });
  } else if (t.kind === "failed") {
    items.push({ label: "Open log", cls: "btn-primary", action: "open-log" });
    items.push({ label: "View spec", cls: "btn-secondary", action: "view-spec" });
    items.push({ label: "Re-launch", cls: "btn-ghost", action: "launch" });
  } else if (t.section === "ready") {
    items.push({ label: "Launch", cls: "btn-primary", action: "launch" });
    items.push({ label: "Critique", cls: "btn-secondary", action: "critique" });
    items.push({ label: "View spec", cls: "btn-ghost", action: "view-spec" });
  } else if (t.section === "drafting") {
    items.push({ label: "View spec", cls: "btn-primary", action: "view-spec" });
    items.push({ label: "Run critique", cls: "btn-secondary", action: "critique" });
    items.push({ label: "Launch", cls: "btn-ghost", action: "launch" });
  } else if (t.section === "done") {
    if (t.prUrl) items.push({ label: "Open PR", cls: "btn-primary", action: "open-pr" });
    items.push({ label: "View spec", cls: "btn-secondary", action: "view-spec" });
  }
  return items;
}

function dispatch(t: TaskView, action: ActionId): void | Promise<void> {
  switch (action) {
    case "tail-log":
    case "open-log":
      currentTab.value = "log";
      return;
    case "view-spec":
      currentTab.value = "spec";
      return;
    case "review-critique":
      currentTab.value = "critique";
      return;
    case "copy-attach":
      return copyCmd(`forge attach ${t.id}`);
    case "open-pr":
      if (t.prUrl) window.open(t.prUrl, "_blank");
      return;
    case "launch":
      return runAction(
        `/api/tasks/${encodeURIComponent(t.id)}/launch`,
        { successMsg: `Launching ${t.id}…` },
        refreshTasks,
      );
    case "critique":
      return runAction(
        `/api/tasks/${encodeURIComponent(t.id)}/critique`,
        { successMsg: `Critique queued for ${t.id}` },
        refreshTasks,
      );
    case "kill":
      return runAction(
        `/api/tasks/${encodeURIComponent(t.id)}/kill`,
        {
          successMsg: `Killed ${t.id}`,
          confirm: "Kill this run?\n\nThe tmux session will be terminated and the task marked failed.",
        },
        refreshTasks,
      );
  }
}

function ActionButton({ t, def }: { t: TaskView; def: ActionDef }) {
  const onClick = async (e: MouseEvent) => {
    const btn = e.currentTarget as HTMLButtonElement;
    if (btn.disabled) return;
    const result = dispatch(t, def.action);
    if (result && typeof (result as Promise<void>).then === "function") {
      btn.disabled = true;
      const original = btn.textContent;
      btn.textContent = "Working…";
      try {
        await result;
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
    }
  };
  return (
    <button type="button" class={`btn ${def.cls}`} data-action={def.action} onClick={onClick}>
      {def.label}
    </button>
  );
}

export function DetailHead({ t }: { t: TaskView }) {
  const acts = actionsFor(t);
  return (
    <div class="detail-head" id="detail-head">
      <div class="row1">
        <span class={`stat-pill ${statClass(t)}`}>{t.statLabel}</span>
        {t.kind === "critique-ready" ? (
          <span style="color:var(--attention);font-size:11.5px;font-weight:600">● critique waiting</span>
        ) : null}
        {t.tmuxAlive ? <span style="color:var(--running);font-size:11.5px;font-weight:600">● tmux alive</span> : null}
      </div>
      <h1>{t.title}</h1>
      <div class="meta">
        {t.agentLabel ? (
          <span>
            <b>Agent</b> {t.agentLabel}
          </span>
        ) : null}
        {t.branch ? (
          <span>
            <b>Branch</b> <span class="branch">{t.branch}</span>
          </span>
        ) : null}
        {t.age && t.age !== "—" ? (
          <span>
            <b>Age</b> {t.age}
          </span>
        ) : null}
        {t.prNumber ? (
          <span>
            <b>PR</b>{" "}
            {t.prUrl ? (
              <a href={t.prUrl} target="_blank" rel="noreferrer" style="color:var(--primary)">
                #{t.prNumber}
              </a>
            ) : (
              `#${t.prNumber}`
            )}
          </span>
        ) : null}
        {!selectedRepo.value ? (
          <span>
            <b>Repo</b> {t.repo}
          </span>
        ) : null}
      </div>
      <div class="detail-actions">
        {acts.map((a) => (
          <ActionButton key={a.action} t={t} def={a} />
        ))}
      </div>
    </div>
  );
}
