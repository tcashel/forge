/**
 * Minimal blocking pickers for CLI subcommands that need to disambiguate
 * (e.g. "multiple matches — pick one"). Reads from stdin in cooked mode,
 * one line per prompt. Exits 1 if stdin isn't a TTY and no default exists.
 */

import * as readline from "node:readline";

export async function pickFromList<T>(
  prompt: string,
  items: T[],
  render: (t: T, i: number) => string,
): Promise<T | null> {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];

  process.stderr.write(`${prompt}\n`);
  items.forEach((item, i) => {
    process.stderr.write(`  ${i + 1}. ${render(item, i)}\n`);
  });
  process.stderr.write(`> `);

  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  const answer = await new Promise<string>((resolve) => {
    rl.once("line", (line) => {
      rl.close();
      resolve(line.trim());
    });
  });

  const idx = Number.parseInt(answer, 10) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx >= items.length) return null;
  return items[idx];
}

export async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}
