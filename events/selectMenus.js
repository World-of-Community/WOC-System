import client from "../index.js";
import logger from "../functions/logger.js";

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isAnySelectMenu()) return;

  const selectMenu = client.selectMenus.get(interaction.customId)
    ?? client.selectMenus.find((m) => m.prefix && interaction.customId.startsWith(m.id));
  if (!selectMenu) return;

  try {
    await selectMenu.run(client, interaction);
  } catch (error) {
    logger.error(error);
  }
});
