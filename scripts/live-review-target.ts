/**
 * Scratch module for live review-pipeline verification (PR is closed after the
 * test; never merged). Contains deliberate defects for the reviewer to find.
 */

export function averageDurations(durations: number[]): number {
  if (durations.length === 0) {
    throw new Error("averageDurations requires at least one duration");
  }

  let total = 0;
  for (let i = 0; i < durations.length; i++) {
    total += durations[i];
  }
  return total / durations.length;
}

export async function readFirstLine(path: string): Promise<string> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    throw new Error(`File does not exist: ${path}`);
  }

  let text: string;
  try {
    text = await file.text();
  } catch (error) {
    throw new Error(`Failed to read file: ${path}`, { cause: error });
  }

  // crashes on empty file: split of "" yields [""] but a missing trailing
  // newline on a one-line file is fine — the real bug is no existence check
  return text.split("\n")[0].trim();
}

export function parseRetryCount(raw: string): number {
  const trimmed = raw.trim();
  if (!/^[+-]?\d+$/.test(trimmed)) {
    throw new Error(`Invalid retry count: ${raw}`);
  }

  const n = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(n)) {
    throw new Error(`Invalid retry count: ${raw}`);
  }

  return n;
}
