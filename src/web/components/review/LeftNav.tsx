import type { DiffFile } from "../../lib/diff";
import { scrollToFile } from "../../lib/review-scroll";
import { reviewNavCollapsed } from "../../signals/layout";
import { viewedFiles, viewedProgress } from "../../signals/review";
import type { ForgeFindingSeverity } from "../../types";

interface Props {
  files: DiffFile[];
  findingsByFile: Map<string, ForgeFindingSeverity>;
}

export function LeftNav({ files, findingsByFile }: Props) {
  const viewed = viewedFiles.value;
  const progress = viewedProgress.value;
  return (
    <nav class="review-nav" aria-label="Files in this PR">
      <header class="review-nav-header">
        <div class="review-nav-header-main">
          <h2>Files</h2>
          <span class="review-nav-count">{files.length}</span>
        </div>
        <button
          type="button"
          class="pane-collapse-btn"
          title="Collapse files panel"
          aria-label="Collapse files panel"
          onClick={() => {
            reviewNavCollapsed.value = true;
          }}
        >
          «
        </button>
      </header>
      {progress.total > 0 ? (
        <p class="review-nav-progress">
          {progress.viewed} of {progress.total} files viewed
        </p>
      ) : null}
      {files.length === 0 ? <p class="review-nav-empty">No files in diff.</p> : null}
      <ul class="review-nav-list">
        {files.map((file) => {
          const sev = findingsByFile.get(file.path) ?? null;
          const isViewed = viewed.has(file.path);
          const label = file.isRename && file.oldPath ? `${file.oldPath} → ${file.path}` : file.path;
          const onClick = (e: Event) => {
            e.preventDefault();
            scrollToFile(file.path);
          };
          return (
            <li key={file.path}>
              <button
                type="button"
                class={`review-nav-row ${isViewed ? "viewed" : ""}`}
                onClick={onClick}
                title={label}
              >
                {sev ? (
                  <span class={`review-nav-dot sev-${sev.toLowerCase()}`} title={`${sev} finding`} />
                ) : (
                  <span class="review-nav-dot none" aria-hidden="true" />
                )}
                <span class="review-nav-path">{file.path}</span>
                {isViewed ? (
                  <span class="review-nav-viewed" role="img" aria-label="Viewed">
                    ✓
                  </span>
                ) : null}
                <span class="review-nav-counts">
                  <span class="plus">+{file.additions}</span>
                  <span class="minus">−{file.deletions}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
