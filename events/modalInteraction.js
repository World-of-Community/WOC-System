import client from "../index.js";
import logger from "../functions/logger.js";

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isModalSubmit()) return;

  // Erst exakte ID, danach Modals mit dynamischer ID (prefix: true, z.B. "verify-modal_1234")
  const modal = client.modals.get(interaction.customId)
    ?? client.modals.find((m) => m.prefix && interaction.customId.startsWith(m.id));
  if (!modal) return;

  try {
    await modal.run(client, interaction);
  } catch (error) {
    logger.error(error);
  }
});
