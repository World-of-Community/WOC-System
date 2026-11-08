import { EmbedBuilder, MessageFlags } from "discord.js";
import { collectEventItem, getActiveEvent } from "#systems/seasonEvents.js";

export default {
  name: "raketen",
  description: "» Sammle täglich Raketen beim Silvester-Event! 🎆",
  type: 1,
  options: [],

  async run(client, interaction) {
    const userId = interaction.user.id;
    const eventType = "newyear";

    if (getActiveEvent() !== eventType) {
      return interaction.reply({
        content: "> `🎆` | Das Silvester-Event ist aktuell nicht aktiv.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const collected = await collectEventItem(userId, eventType);
    if (!collected) {
      return interaction.reply({
        content: "> `🎆` | Du hast heute bereits alle Raketen gesammelt! Komm morgen wieder.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("`🎇` Frohes neues Jahr!")
      .setDescription(`Du hast **${collected.amount} Raketen** eingesammelt! \`🎆\`\n\nInsgesamt hast du nun **${collected.total} Raketen**.`)
      .setColor("Blue");

    return interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
