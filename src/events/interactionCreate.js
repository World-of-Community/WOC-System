import { Events } from "discord.js";
import logger from "#core/logger.js";
import { handleInteractionError, reportError } from "#core/errors.js";
import { resolveComponent } from "../loaders/loadComponents.js";

export default {
  name: Events.InteractionCreate,

  async execute(client, interaction) {
    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) {
        logger.warn(`Unknown command "${interaction.commandName}" from ${interaction.user.tag}`);
        return;
      }

      try {
        await command.run(client, interaction);
      } catch (error) {
        await handleInteractionError(interaction, error, { source: `command:${command.name}` });
      }
      return;
    }

    if (interaction.isAutocomplete()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (typeof command?.autocomplete !== "function") {return;}

      try {
        await command.autocomplete(interaction, client);
      } catch (error) {
        // autocomplete can't be answered with a message
        await reportError(error, {
          source: `autocomplete:${command.name}`,
          user: `${interaction.user.tag} (${interaction.user.id})`,
        });
      }
      return;
    }

    if (interaction.isButton()) {
      await runComponent(client, interaction, client.buttons, "button");
      return;
    }

    if (interaction.isModalSubmit()) {
      await runComponent(client, interaction, client.modals, "modal");
      return;
    }

    if (interaction.isAnySelectMenu()) {
      await runComponent(client, interaction, client.selectMenus, "selectMenu");
    }
  },
};

async function runComponent(client, interaction, registry, kind) {
  const component = resolveComponent(registry, interaction.customId);
  // collector buttons and old messages have no registered handler – that's fine
  if (!component) {
    logger.debug(`No ${kind} registered for customId "${interaction.customId}"`);
    return;
  }

  try {
    await component.run(client, interaction);
  } catch (error) {
    await handleInteractionError(interaction, error, { source: `${kind}:${component.id}` });
  }
}
