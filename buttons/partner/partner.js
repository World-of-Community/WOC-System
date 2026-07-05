import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default {
  id: "partner",
  run: async (client, interaction) => {
    const partnerModal = new ModalBuilder()
      .setTitle("🤝 - BEWERBEN ALS PARTNER")
      .setCustomId("partner-modal");

    const partnernameInput = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("partner-name")
        .setLabel("🔗 - WIE IST DER EINLADUNGSLINK DES SERVERS?")
        .setPlaceholder("https://discord.gg/xxxxx")
        .setStyle(TextInputStyle.Short)
        .setRequired(true),
    );

    const partnerbeschreibungInput = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("partner-beschreibung")
        .setLabel("✍️ - BESCHREIBUNG DES SERVERS")
        .setPlaceholder("Wir sind ein deutscher Discord Server mit Community & Gaming …")
        .setMinLength(25)
        .setMaxLength(4000)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true),
    );

    partnerModal.addComponents(partnernameInput, partnerbeschreibungInput);
    return interaction.showModal(partnerModal);
  },
};
