import { EmbedBuilder } from "discord.js";

export default {
  id: "ticket_erledigt",
  run: async (client, interaction) => {
    const mention = interaction.message.content;
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription("Danke für deine Meldung, wir haben es erledigt oder in Bearbeitung genommen.");

    return interaction.reply({ content: mention, embeds: [embed] });
  },
};
