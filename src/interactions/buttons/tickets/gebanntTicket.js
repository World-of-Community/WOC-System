import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default {
  id: "gebannt-ticket",
  run: async (client, interaction) => {
    if (!interaction.guild) {return;}

    const gebanntModal = new ModalBuilder()
      .setTitle("⛔ - ENTBANNUNGSTICKET")
      .setCustomId("gebannt-modal");

    const BanngrundInput = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("banngrund")
        .setLabel("Gebe deinen Banngrund an")
        .setPlaceholder("Wieso wurdest du gebannt?")
        .setStyle(TextInputStyle.Short)
        .setRequired(true),
    );

    const EntbannungsbeschreibungInput = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("entbannungsbeschreibung")
        .setLabel("Wieso möchtest du wieder entbannt werden?")
        .setPlaceholder("Gebe hier deine Entbannungsbeschreibung an.")
        .setMinLength(5)
        .setMaxLength(4000)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true),
    );

    gebanntModal.addComponents(BanngrundInput, EntbannungsbeschreibungInput);
    return interaction.showModal(gebanntModal);
  },
};
