// Thin API wrapper. Server returns `{ ok, data, error }` envelopes; legacy
// callers throw with `code` / `hint` populated on failures, and we keep
// that contract so existing toast logic still surfaces backend hints.
import type { PlanView } from "../types";

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
