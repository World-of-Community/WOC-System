import { EmbedBuilder } from "discord.js";

export default {
  id: "partner_accept",
  prefix: true,
  run: async (client, interaction) => {
    const id = interaction.customId.split("_")[2];
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
    return interaction.reply({ content: `> \`❗\` » Die Server-Partner Anfrage wurde von **${interaction.user.displayName}** angenommen. \`✅\``, ephemeral: true });
  },
};
