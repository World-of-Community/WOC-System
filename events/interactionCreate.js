import client from "../index.js";
import logger from "../functions/logger.js";

const ERROR_MESSAGE = "> `❌` » Es ist ein Fehler beim ausführen aufgetreten!\n> `📌` » Bitte gebe einem Teammitglied bescheid oder Öffne ein Ticket im <#819555839362072606>";

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
    const slashCommand = client.slashCommands.get(interaction.commandName);
    if (!slashCommand) return;

    try {
      await slashCommand.run(client, interaction);
    } catch (error) {
      logger.error(error);

      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({ content: ERROR_MESSAGE });
        } else {
          await interaction.reply({ content: ERROR_MESSAGE, ephemeral: true });
        }
      } catch (replyError) {
        logger.error(replyError);
      }
    }
  } else if (interaction.isAutocomplete()) {
    const slashCommand = client.slashCommands.get(interaction.commandName);
    if (!slashCommand?.autocomplete) return;

    try {
      await slashCommand.autocomplete(interaction);
    } catch (error) {
      logger.error(error);
    }
  }
});
