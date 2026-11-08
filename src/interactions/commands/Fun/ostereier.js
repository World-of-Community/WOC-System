import { EmbedBuilder, MessageFlags } from "discord.js";
import { collectEventItem, getActiveEvent } from "#systems/seasonEvents.js";

export default {
  name: "ostereier",
  description: "» Sammle täglich Ostereier beim Oster-Event! 🐣",
  type: 1,
  options: [],

  async run(client, interaction) {
    const userId = interaction.user.id;
    const eventType = "easter";

    if (getActiveEvent() !== eventType) {
      return interaction.reply({
        content: "> `🐇` | Das Oster-Event ist aktuell nicht aktiv.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const collected = await collectEventItem(userId, eventType);
    if (!collected) {
      return interaction.reply({
        content: "> `🐇` | Du hast heute bereits alle Ostereier gesammelt! Komm morgen wieder.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("`🐣` Ostereiersuche!")
      .setDescription(`Du hast **${collected.amount} Ostereier** gefunden! \`🥚\`\n\nInsgesamt hast du nun **${collected.total} Ostereier**.`)
      .setColor("Green");

    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
