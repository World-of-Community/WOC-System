import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

export default {
  id: "partner-modal",
  run: async (client, interaction) => {
    const partnerName = interaction.fields.getTextInputValue("partner-name");
    const partnerBeschreibung = interaction.fields.getTextInputValue("partner-beschreibung");

    const channel = await interaction.client.channels.fetch("1187028500461391984");

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("🤝 » NEUE SERVER PARTNER ANFRAGE")
          .setDescription(
            `${interaction.user} möchte sich als **Server-Partner** bewerben!\n\n` +
                        `> 🔗 **Server-Link**\n${partnerName}\n\n` +
                        `> 💬 **Server-Beschreibung**\n${partnerBeschreibung}`,
          )
          .setColor("Orange"),
      ],
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`partner_accept_${interaction.user.id}`)
            .setLabel("Akzeptieren")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`partner_deny_${interaction.user.id}`)
            .setLabel("Ablehnen")
            .setStyle(ButtonStyle.Danger),
        ),
      ],
    });

    return interaction.reply({
      content: "> ✅ Deine Anfrage wurde abgesendet. Bitte habe etwas Geduld.",
      ephemeral: true,
    });
  },
};
