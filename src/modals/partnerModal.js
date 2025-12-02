const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  // Modal zeigen
  showPartnerModal: async (interaction) => {
    const partnerModal = new ModalBuilder()
      .setTitle("🤝 - BEWERBEN ALS PARTNER")
      .setCustomId("partner-modal");

    const partnernameInput = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("partner-name")
        .setLabel("🔗 - WIE IST DER EINLADUNGSLINK DES SERVERS?")
        .setPlaceholder("https://discord.gg/VxhFXjkrPW")
        .setStyle(TextInputStyle.Short)
        .setRequired(true),
    );

    const partnerbeschreibungInput = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("partner-beschreibung")
        .setLabel("✍️ - BESCHREIBUNG DES SERVERS")
        .setPlaceholder("Wir sind ein allgemeiner Deutscher Discord Server mit Gaming, Community und vielem mehr!")
        .setMinLength(25)
        .setMaxLength(4000)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true),
    );

    partnerModal.addComponents(partnernameInput, partnerbeschreibungInput);
    return interaction.showModal(partnerModal);
  },

  // Modal Submit bearbeiten
  handlePartnerModalSubmit: async (interaction) => {
    if (interaction.customId !== "partner-modal") {return;}

    const partnerName = await interaction.fields.getTextInputValue("partner-name");
    const partnerBeschreibung = await interaction.fields.getTextInputValue("partner-beschreibung");

    const channel = await interaction.client.channels.fetch("1187028500461391984");

    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle("`🤝` » NEUE SERVER PARTNER ANFRAGE")
          .setDescription(`${interaction.user} möchte sich als **Server-Partner** bewerben!\n\n> \`🔗\` » **Server-Link**\n\`${partnerName}\`\n\n> \`💬\` » **Server-Beschreibung**\n\`${partnerBeschreibung}\``)
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

    return interaction.reply({ content: "> `✅` » Deine Anfrage wurde abgesendet, Bitte habe etwas Geduld!", ephemeral: true });
  },
};
