import { REST, Routes } from "discord.js";
import logger from "#core/logger.js";
import { env, config } from "#config";

// Commands listed in config.json "disabledCommands" stay loaded but are not registered at Discord.
export default async function registerCommands(client) {
  const disabled = new Set((config.disabledCommands ?? []).map((n) => n.toLowerCase()));

  const body = [];
  for (const command of client.slashCommands.values()) {
    if (disabled.has(command.name.toLowerCase())) {
      logger.info(`Command "${command.name}" is disabled, not registering`);
      continue;
    }

    body.push({
      name: command.name,
      description: command.description,
      type: command.type ?? 1,
      options: command.options ?? [],
      default_member_permissions: command.default_member_permissions ?? null,
      dm_permission: command.dm_permission ?? false,
      nsfw: command.nsfw ?? false,
    });
  }

  const rest = new REST({ version: "10" }).setToken(env.discord.token);

  try {
    await rest.put(
      Routes.applicationGuildCommands(env.discord.clientId, env.discord.guildId),
      { body },
    );
    logger.success(`${body.length} slash commands registered`);
  } catch (error) {
    // not fatal, bot keeps running with the previously registered set
    logger.error("Failed to register slash commands:", error);
  }
}
