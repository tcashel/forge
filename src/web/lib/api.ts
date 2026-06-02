// Thin API wrapper. Server returns `{ ok, data, error }` envelopes; legacy
// callers throw with `code` / `hint` populated on failures, and we keep
// that contract so existing toast logic still surfaces backend hints.
import type { UsageSummary } from "../../core/usage";
import type { ActivityDetailResponse, AgentActivityRow, PlanView, UsageFilterState } from "../types";

export class ApiError extends Error {
  code: string;
  hint: string | null;
  constructor(message: string, code: string, hint: string | null) {
    super(message);
    this.code = code;
    this.hint = hint;
  }
}

interface Envelope<T> {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string; hint?: string | null };
}

async function readEnvelope<T>(res: Response, path: string): Promise<T> {
  let body: Envelope<T> | null = null;
  try {
    body = (await res.json()) as Envelope<T>;
  } catch {
    body = null;
  }
  if (!res.ok || !body || body.ok !== true) {
    const code = body?.error?.code || `HTTP_${res.status}`;
    const message = body?.error?.message || `Request failed: ${path}`;
    throw new ApiError(message, code, body?.error?.hint ?? null);
  }
  return body.data as T;
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { accept: "application/json" } });
  return readEnvelope<T>(res, path);
}

export async function apiPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  return readEnvelope<T>(res, path);
}

export interface PlansResponse {
  plans: PlanView[];
}

export function getPlans(repo?: string): Promise<PlansResponse> {
  const q = repo ? `?repo=${encodeURIComponent(repo)}` : "";
  return apiGet<PlansResponse>(`/api/plans${q}`);
}

export interface AgentActivityResponse {
  rows: AgentActivityRow[];
}

export interface FetchAgentActivityParams {
  state?: string;
  purpose?: string;
  agent?: string;
  repo?: string;
  since?: string;
  limit?: number;
}

export function fetchAgentActivity(params: FetchAgentActivityParams = {}): Promise<AgentActivityResponse> {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    q.set(k, String(v));
  }
  const qs = q.toString();
  return apiGet<AgentActivityResponse>(`/api/agent-activity${qs ? `?${qs}` : ""}`);
}

export function fetchAgentActivityDetail(sessionId: string): Promise<ActivityDetailResponse> {
  return apiGet<ActivityDetailResponse>(`/api/agent-activity/${encodeURIComponent(sessionId)}`);
}

export type { UsageSummary } from "../../core/usage";

/** Fetch aggregated usage for the dashboard. `window` maps to a server since-bound. */
export function fetchUsage(filters: UsageFilterState): Promise<UsageSummary> {
  const q = new URLSearchParams();
  q.set("window", filters.window);
  for (const k of ["repo", "spec", "model", "agent", "purpose"] as const) {
    const v = filters[k];
    if (v) q.set(k, v);
  }
  return apiGet<UsageSummary>(`/api/usage?${q.toString()}`);
}
