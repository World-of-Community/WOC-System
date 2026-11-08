import { EmbedBuilder, MessageFlags } from "discord.js";
import { collectEventItem, getActiveEvent } from "#systems/seasonEvents.js";

export default {
  name: "weihnachtsbäume",
  description: "» Sammle täglich Weihnachtsbäume beim Weihnachts-Event! 🎄",
  type: 1,
  options: [],

  async run(client, interaction) {
    const userId = interaction.user.id;
    const eventType = "christmas";

    if (getActiveEvent() !== eventType) {
      return interaction.reply({
        content: "> `🎄` | Das Weihnachts-Event ist aktuell nicht aktiv.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const collected = await collectEventItem(userId, eventType);
    if (!collected) {
      return interaction.reply({
        content: "> `🎄` | Du hast heute bereits einen Weihnachtsbaum gesammelt! Komm morgen wieder.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("`🎄` Frohe Weihnachten!")
      .setDescription(`Du hast **${collected.amount} Weihnachtsbäume** gesammelt! \`🎁\`\n\nInsgesamt hast du nun **${collected.total} Bäume**.`)
      .setColor("Green");

    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
