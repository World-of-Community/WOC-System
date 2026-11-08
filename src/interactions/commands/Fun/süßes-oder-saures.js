import { EmbedBuilder, MessageFlags } from "discord.js";
import { collectEventItem, getActiveEvent } from "#systems/seasonEvents.js";

export default {
  name: "süßes-oder-saures",
  description: "» Sammle täglich Kürbisse beim Halloween-Event! 🎃",
  type: 1,
  options: [],

  async run(client, interaction) {
    const userId = interaction.user.id;
    const eventType = "halloween";

    if (getActiveEvent() !== eventType) {
      return interaction.reply({
        content: "> `🎃` | Das Halloween-Event ist aktuell nicht aktiv.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const collected = await collectEventItem(userId, eventType);
    if (!collected) {
      return interaction.reply({
        content: "> `🎃` | Du hast heute bereits alle Kürbisse gesammelt! Komm morgen wieder.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("`🎃` Süßes oder Saures!")
      .setDescription(`Du hast heute **${collected.amount} Kürbisse** gesammelt! \`🎃\`\n\nInsgesamt hast du nun **${collected.total} Kürbisse**.`)
      .setColor("Orange");

    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
