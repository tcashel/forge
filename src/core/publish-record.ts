/**
 * Publish record — the persisted outcome of publishing review findings to
 * GitHub for one review run.
 *
 * Written as `publish.json` in the review run dir on EVERY run (state
 * `not-requested` when the publish opt-in was off) so the operator can always
 * answer "did my findings reach GitHub?" after the fact. The Workbench review
 * history and `forge review --publish-only` both read it back.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { atomicWriteJSON } from "./atomic-write.ts";

export type FindingPublishStatus =
  | "posted"
  | "already-published"
  /**
   * Not posted because an existing Forge marker comment already anchors at the
   * same path:line. Almost always the same defect re-titled by a re-review
   * (ids are sha1(file|line|title), so a re-title mints a new id); distinct
   * from "already-published", which is verified by marker id, so a genuinely
   * new same-line finding is visible in the record rather than silently
   * conflated.
   */
  | "skipped-colocated"
  | "out-of-diff-posted"
  | "failed";

export interface FindingPublishOutcome {
  id: string;
  status: FindingPublishStatus;
  error?: string;
}

export type PublishState = "published" | "partial" | "failed" | "nothing-new" | "not-requested" | "reconcile-failed";

export interface PublishRecord {
  schemaVersion: 1;
  requested: boolean;
  attemptedAt: string | null;
  state: PublishState;
  posted: number;
  outOfDiff: number;
  skipped: number;
  failed: number;
  error: string | null;
  findings: FindingPublishOutcome[];
  /** Set when the PR head moved between review start and publish. */
  headMoved?: boolean;
}

const PUBLISH_FILE = "publish.json";

export function publishRecordPath(runDir: string): string {
  return path.join(runDir, PUBLISH_FILE);
}

export function readPublishRecord(runDir: string): PublishRecord | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(publishRecordPath(runDir), "utf-8")) as PublishRecord;
    if (!parsed || typeof parsed !== "object" || typeof parsed.state !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePublishRecord(runDir: string, record: PublishRecord): void {
  atomicWriteJSON(publishRecordPath(runDir), record);
}

export function notRequestedRecord(): PublishRecord {
  return {
    schemaVersion: 1,
    requested: false,
    attemptedAt: null,
    state: "not-requested",
    posted: 0,
    outOfDiff: 0,
    skipped: 0,
    failed: 0,
    error: null,
    findings: [],
  };
}
