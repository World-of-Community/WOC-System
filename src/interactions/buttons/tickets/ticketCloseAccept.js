import { EmbedBuilder } from "discord.js";

export default {
  id: "ticket_close_accept",
  run: async (client, interaction) => {
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setDescription("Das Ticket wird in `5 Sekunden` geschlossen.");

    await interaction.update({ embeds: [embed], components: [] });
    setTimeout(async () => {
      await interaction.channel.delete().catch(() => {});
    }, 5000);
  },
};
