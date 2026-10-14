import path from "node:path";
import chalk from "chalk";
import logger from "#core/logger.js";
import { walkJsFiles, importFile, relSrc, categoryOf, SRC_DIR } from "./walk.js";
import { createLoadTable } from "./table.js";

const COMMANDS_DIR = path.join(SRC_DIR, "interactions", "commands");

// Command module: { name, description, type, options?, run(client, interaction), autocomplete?(interaction) }
export default async function loadCommands(client) {
  const table = createLoadTable("Slash Commands");
  client.slashCommands.clear();

  for (const file of walkJsFiles(COMMANDS_DIR)) {
    const label = relSrc(file);
    try {
      const command = (await importFile(file)).default;

      if (!command?.name || typeof command.run !== "function") {
        logger.warn(`Command ${label} has no "name" or run() – skipped`);
        table.fail(label);
        continue;
      }

      if (client.slashCommands.has(command.name)) {
        logger.warn(`Duplicate command name "${command.name}" in ${label} – overriding`);
      }

      command.category = categoryOf(file, COMMANDS_DIR);
      command.file = label;
      client.slashCommands.set(command.name, command);
      table.ok(command.name);
    } catch (error) {
      logger.error(`Failed to load command ${label}:`, error);
      table.fail(label);
    }
  }

  table.print(chalk.blue);
  logger.info(`${client.slashCommands.size} slash commands loaded`);
  return client.slashCommands;
}
