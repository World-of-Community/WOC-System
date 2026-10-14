import { EmbedBuilder } from "discord.js";

export default {
  id: "ticket_close_deny",
  async run(client, interaction) {
    const embed = new EmbedBuilder()
      .setColor("Red")
      .setDescription(`${interaction.user} hat sich dazu entschieden nicht das Ticket zu schließen`);

    return interaction.update({ embeds: [embed], components: [] });
  },
};
