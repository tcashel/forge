import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type OpencodeConfig = {
  skills?: { paths?: string[]; urls?: string[] };
  command?: Record<
    string,
    { template: string; description?: string; agent?: string; model?: string; subtask?: boolean }
  >;
};

type CommandDefinition = {
  name: string;
  description?: string;
  template: string;
};

const pluginRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(pluginRoot, "..");
const skillsPath = path.join(repoRoot, "cc-plugin", "skills");
const commandsPath = path.join(pluginRoot, "commands");

function parseCommand(filePath: string): CommandDefinition {
  const name = path.basename(filePath, ".md");
  const raw = readFileSync(filePath, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { name, template: raw.trim() };

  const frontmatter = match[1];
  const template = match[2].trim().replaceAll("{{FORGE_SKILLS_PATH}}", skillsPath);
  const description = frontmatter
    .split("\n")
    .map((line) => line.match(/^description:\s*(.*)$/)?.[1]?.trim())
    .find(Boolean);

  return { name, description, template };
}

function loadCommands(): CommandDefinition[] {
  if (!existsSync(commandsPath)) return [];
  return readdirSync(commandsPath)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => parseCommand(path.join(commandsPath, name)));
}

export const ForgePlugin = async () => {
  const commands = loadCommands();

  return {
    config: async (config: OpencodeConfig) => {
      config.skills ??= {};
      config.skills.paths ??= [];
      if (!config.skills.paths.includes(skillsPath)) config.skills.paths.push(skillsPath);

      config.command ??= {};
      for (const command of commands) {
        config.command[command.name] ??= {
          template: command.template,
          description: command.description,
        };
      }
    },
  };
};

export default ForgePlugin;
