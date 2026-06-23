// Test entry for the DiffPane browser smoke test. Built with the Workbench's
// preact-compat alias plugin (see build-aliases.ts) so @git-diff-view runs
// under Preact exactly as it does in production, then executed in happy-dom.
import "preact/compat";
import { render } from "preact";
import { createElement } from "preact/compat";
import { DiffPane } from "../../../src/web/components/review/DiffPane";
import { toggleViewedFile } from "../../../src/web/signals/review";
import type { ForgeFinding, PrReviewBundle } from "../../../src/web/types";

export function mount(root: HTMLElement, bundle: PrReviewBundle, findings: ForgeFinding[]): void {
  render(createElement(DiffPane, { bundle, findings }), root);
}

export { toggleViewedFile };
