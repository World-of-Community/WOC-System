import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

export default {
  id: "partner",

  run: async (client, interaction) => {
    // Partner-Modal absenden
    if (
      interaction.isModalSubmit() &&
      interaction.customId === "partner-modal"
    ) {
      const partnerName = interaction.fields.getTextInputValue("partner-name");
      const mitglieder = interaction.fields.getTextInputValue(
        "partner-mitglieder",
      );
      const thema = interaction.fields.getTextInputValue("partner-thema");
      const kategorie = interaction.fields.getTextInputValue(
        "partner-kategorie",
      );
      const partnerBeschreibung = interaction.fields.getTextInputValue(
        "partner-beschreibung",
      );

      const channel = await interaction.client.channels.fetch(
        "1187028500461391984",
      );

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("🤝 » NEUE SERVER PARTNER ANFRAGE")
            .setDescription(
              `${interaction.user} möchte sich als **Server-Partner** bewerben!\n\n` +
                `> \`🔗\` **Server-Link**\n${partnerName}\n\n` +
                `> \`👥\` **Mitgliederanzahl**\n${mitglieder}\n\n` +
                `> \`🎮\` **Thema**\n${thema}\n\n` +
                `> \`📁\` **Kategorie**\n${kategorie}\n\n` +
                `> \`💬\` **Server-Beschreibung**\n${partnerBeschreibung}`,
            )
            .setColor("Orange")
            .setTimestamp(),
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("partner_accept")
              .setLabel("Akzeptieren")
              .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
              .setCustomId("partner_deny")
              .setLabel("Ablehnen")
              .setStyle(ButtonStyle.Danger),
          ),
        ],
      });

      return interaction.reply({
        content: "> `✅` » Deine Anfrage wurde abgesendet. Bitte habe etwas Geduld.",
        ephemeral: true,
      });
    }

    // Partneranfrage annehmen oder ablehnen
    if (
      interaction.isButton() &&
      ["partner_accept", "partner_deny"].includes(interaction.customId)
    ) {
      const angenommen = interaction.customId === "partner_accept";
      const embed = EmbedBuilder.from(interaction.message.embeds[0]);

      embed.setDescription(
        `${embed.data.description}\n\n` +
          `> ${angenommen ? "✅" : "❌"} **Status**\n` +
          `Die Anfrage wurde von ${interaction.user} **${
            angenommen ? "angenommen" : "abgelehnt"
          }**.`,
      );

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("partner_accept")
          .setLabel(angenommen ? "Angenommen" : "Akzeptieren")
          .setStyle(ButtonStyle.Success)
          .setDisabled(true),

        new ButtonBuilder()
          .setCustomId("partner_deny")
          .setLabel(angenommen ? "Ablehnen" : "Abgelehnt")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true),
      );

      return interaction.update({
        embeds: [embed],
        components: [buttons],
      });
    }
  },
};
