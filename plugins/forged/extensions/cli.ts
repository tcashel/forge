import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateHead } from "@earendil-works/pi-coding-agent";

export interface ForgedEnvelope {
  ok: boolean;
  operationId?: string;
  result?: Record<string, unknown>;
  error?: {
    code?: string;
    message?: string;
    recoverable?: boolean;
    detail?: unknown;
  };
}

export interface ForgedCall {
  envelope: ForgedEnvelope;
  result: Record<string, any>;
  argv: string[];
}

const MAX_MODEL_BYTES = 48 * 1024;
const MAX_MODEL_LINES = 1200;

export function forgedBinary(): string {
  return process.env.FORGED_BIN?.trim() || "forged";
}

export async function callForged(
  pi: ExtensionAPI,
  args: string[],
  signal?: AbortSignal,
  timeout = 30_000,
): Promise<ForgedCall> {
  const binary = forgedBinary();
  let execution: { stdout: string; stderr: string; code: number; killed: boolean };
  try {
    execution = await pi.exec(binary, args, { signal, timeout });
  } catch (error) {
    throw new Error(
      `Cannot execute ${binary}. Install the Forged binary separately or set FORGED_BIN. ${String(error)}`,
    );
  }

  const stdout = execution.stdout.trim();
  let envelope: ForgedEnvelope;
  try {
    envelope = JSON.parse(stdout) as ForgedEnvelope;
  } catch {
    const diagnostic = execution.stderr.trim() || stdout || `exit ${execution.code}`;
    throw new Error(`Forged returned no valid operation envelope: ${diagnostic}`);
  }

  if (!envelope.ok) {
    const code = envelope.error?.code ?? `EXIT_${execution.code}`;
    const message = envelope.error?.message ?? execution.stderr.trim() ?? "Forged operation failed";
    throw new Error(`${code}: ${message}`);
  }
  if (!envelope.result || typeof envelope.result !== "object" || Array.isArray(envelope.result)) {
    throw new Error("Forged returned a successful envelope without an object result");
  }

  return { envelope, result: envelope.result, argv: [binary, ...args] };
}

export function modelText(value: unknown): string {
  const serialized = JSON.stringify(value, null, 2);
  const truncated = truncateHead(serialized, {
    maxBytes: MAX_MODEL_BYTES,
    maxLines: MAX_MODEL_LINES,
  });
  if (!truncated.truncated) return truncated.content;
  return `${truncated.content}\n\n[Structured Forge result truncated for model context; full value remains in tool details.]`;
}

export function asToolResult(call: ForgedCall) {
  return {
    content: [{ type: "text" as const, text: modelText(call.result) }],
    details: {
      schema: (call.result as { schema?: string }).schema,
      result: call.result,
      operationId: call.envelope.operationId,
      argv: call.argv,
    },
  };
}

export function addOptional(args: string[], flag: string, value: unknown): void {
  if (typeof value === "string" && value.trim()) args.push(flag, value);
  else if (typeof value === "number" && Number.isFinite(value)) args.push(flag, String(value));
}
