import { EmbedBuilder, MessageFlags } from "discord.js";

export default {
  id: "partner_accept",
  prefix: true,
  async run(client, interaction) {
    const id = interaction.customId.split("_")[2];
    if (!/^\d{17,20}$/.test(id ?? "")) {
      return interaction.reply({ content: "> `❌` » Die Bewerber-ID ist ungültig.", flags: MessageFlags.Ephemeral });
    }

    const user = await interaction.client.users.fetch(id);

    await user.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("`✅` » ANFRAGE ANGENOMMEN")
          .setDescription(`> » Deine Server-Partner Bewerbung auf **[${interaction.guild.name}](https://discord.gg/686M8Cxsaa)** wurde angenommen.\n\n> Bitte öffne noch ein Ticket und wähle \`Normaler Support\` aus.`)
          .setColor("Green"),
      ],
    });

    await interaction.message.edit({ components: [] });
    return interaction.reply({ content: `> \`❗\` » Die Server-Partner Anfrage wurde von **${interaction.user.displayName}** angenommen. \`✅\``, flags: MessageFlags.Ephemeral });
  },
};
