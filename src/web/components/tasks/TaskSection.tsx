import type { TaskView, WorkbenchSection } from "../../types";
import { TaskRow } from "./TaskRow";

interface SectionProps {
  section: Exclude<WorkbenchSection, "done">;
  ic: string;
  name: string;
  help: string;
  rows: TaskView[];
}

export function TaskSection({ section, ic, name, help, rows }: SectionProps) {
  // Always-render section headers (matches legacy: counts visible at 0).
  return (
    <>
      <header class="section-h" data-section={section}>
        <span class={`ic ${ic}`} />
        <span class="name">{name}</span>
        <span class="count">{rows.length}</span>
        <span class="help">{help}</span>
      </header>
      <div id={`list-${section}`}>
        {rows.map((t) => (
          <TaskRow key={t.id} t={t} />
        ))}
      </div>
    </>
  );
}

interface DoneProps {
  rows: TaskView[];
}

export function DoneSection({ rows }: DoneProps) {
  if (rows.length === 0) return null;
  return (
    <details class="done-section">
      <summary>
        <span class="chev">›</span>
        <span class="ic done" style="width:8px;height:8px;border-radius:50%;background:var(--done)" />
        <span>Recently done</span>
        <span class="count" style="margin-left:8px">
          {rows.length}
        </span>
      </summary>
      <div id="list-done">
        {rows.map((t) => (
          <TaskRow key={t.id} t={t} />
        ))}
      </div>
    </details>
  );
}
