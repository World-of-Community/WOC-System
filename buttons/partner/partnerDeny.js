import { EmbedBuilder } from "discord.js";

export default {
  id: "partner_deny_",
  prefix: true,
  run: async (client, interaction) => {
    const id = interaction.customId.split("_")[2];
    const user = await interaction.client.users.fetch(id);

    await user.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("`❌` » ANFRAGE ABGELEHNT")
          .setDescription(`> » Deine Server-Partner Bewerbung auf **${interaction.guild.name}** wurde abgelehnt. \`❌\``)
          .setColor("Red"),
      ],
    });

    await interaction.message.edit({ components: [] });
    return interaction.reply({ content: `> \`❗\` » Die Server-Partner Anfrage wurde von **${interaction.user.displayName}** abgelehnt.`, ephemeral: true });
  },
};
