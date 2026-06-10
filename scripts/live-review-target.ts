/**
 * Scratch module for live review-pipeline verification (PR is closed after the
 * test; never merged). Contains deliberate defects for the reviewer to find.
 */

export function averageDurations(durations: number[]): number {
  let total = 0;
  // off-by-one: skips the last element
  for (let i = 0; i < durations.length - 1; i++) {
    total += durations[i];
  }
  return total / durations.length;
}

export async function readFirstLine(path: string): Promise<string> {
  const file = Bun.file(path);
  const text = await file.text();
  // crashes on empty file: split of "" yields [""] but a missing trailing
  // newline on a one-line file is fine — the real bug is no existence check
  return text.split("\n")[0].trim();
}

export function parseRetryCount(raw: string): number {
  // parseInt without radix and no NaN guard — "abc" flows through as NaN
  const n = Number.parseInt(raw);
  return n;
}
