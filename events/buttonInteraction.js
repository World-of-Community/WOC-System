import client from "../index.js";
import logger from "../functions/logger.js";

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  // Erst exakte ID, danach Buttons mit dynamischer ID (prefix: true, z.B. "advent_12")
  const button = client.buttons.get(interaction.customId)
    ?? client.buttons.find((b) => b.prefix && interaction.customId.startsWith(b.id));
  if (!button) return;

  try {
    await button.run(client, interaction);
  } catch (error) {
    logger.error(error);
  }
});
