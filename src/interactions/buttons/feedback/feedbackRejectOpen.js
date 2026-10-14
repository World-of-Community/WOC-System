import { EmbedBuilder } from "discord.js";

export default {
  id: "feedback_reject_open",
  async run(client, interaction) {
    if (!interaction.guild) {return;}

    await interaction.deferUpdate();

    const rejectEmbed = new EmbedBuilder()
      .setTitle("🔓 » Ticket bleibt weiterhin offen")
      .setDescription("Das Ticket bleibt weiterhin geöffnet.")
      .setColor("Red");

    await interaction.editReply({
      embeds: [rejectEmbed],
      components: [],
    });
  },
};
