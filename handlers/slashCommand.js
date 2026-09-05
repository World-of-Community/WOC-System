import "dotenv/config";
import fs from "fs";
import logger from "../functions/logger.js";
import chalk from "chalk";
import { pathToFileURL } from "url";
import path from "path";

import { Routes } from "discord-api-types/v10";
import { REST } from "@discordjs/rest";

import AsciiTable from "ascii-table";
const table = new AsciiTable().setHeading("Slash Commands", "Stats").setBorder("|", "=", "0", "0");

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

// Diese Commands werden geladen, aber nicht bei Discord registriert
// (übernommen aus dem alten deployCommands.js)
const isBlockedCommand = (name = "") => {
  const normalized = name.toLowerCase();

  normalized === "season-pass"
    || normalized === "daily";
};

export default async (client) => {
  const slashCommands = [];

  const slashCommandsPath = path.resolve("./slashCommands/");
  const dirs = fs.readdirSync(slashCommandsPath);

  for (const dir of dirs) {
    const dirPath = path.join(slashCommandsPath, dir);
    const files = fs.readdirSync(dirPath).filter(file => file.endsWith(".js"));

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      try {
        const slashCommand = (await import(pathToFileURL(filePath).href)).default;

        if (!slashCommand?.name) {
          table.addRow(file.split(".js")[0], "⛔");
          continue;
        }

        client.slashCommands.set(slashCommand.name, slashCommand);

        if (isBlockedCommand(slashCommand.name)) {
          table.addRow(slashCommand.name, "⏭️");
          continue;
        }

        slashCommands.push({
          name: slashCommand.name,
          description: slashCommand.description,
          type: slashCommand.type,
          options: slashCommand.options ? slashCommand.options : null,
          default_permission: slashCommand.default_permission ? slashCommand.default_permission : null,
          default_member_permissions: slashCommand.default_member_permissions ?? null,
          dm_permission: slashCommand.dm_permission,
          nsfw: slashCommand.nsfw,
        });

        table.addRow(slashCommand.name, "✅");
      } catch (error) {
        logger.error(`Error loading command ${file}: ${error.message}`);
        table.addRow(file.split(".js")[0], "⛔");
      }
    }
  }
  logger.log(chalk.blue(table.toString()));

  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
      { body: slashCommands },
    );

    logger.log(chalk.yellow("Slash Commands • Registered"));
  } catch (error) {
    logger.error(error);
  }
};
