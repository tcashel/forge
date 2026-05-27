import type { PlanView, WorkbenchSection } from "../../types";
import { PlanRow } from "./PlanRow";

interface SectionProps {
  section: Exclude<WorkbenchSection, "done">;
  ic: string;
  name: string;
  help: string;
  rows: PlanView[];
}

export function PlanSection({ section, ic, name, help, rows }: SectionProps) {
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
          <PlanRow key={t.id} t={t} />
        ))}
      </div>
    </>
  );
}

interface DoneProps {
  rows: PlanView[];
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
          <PlanRow key={t.id} t={t} />
        ))}
      </div>
    </details>
  );
}
