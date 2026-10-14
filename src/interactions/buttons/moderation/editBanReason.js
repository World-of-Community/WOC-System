import { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } from "discord.js";

export default {
  id: "editBanReason_",
  prefix: true,
  async run(client, interaction) {
    const userId = interaction.customId.split("_")[1];

    const modal = new ModalBuilder()
      .setCustomId(`banReasonModal_${userId}`)
      .setTitle("Ban-Grund bearbeiten");

    const banReasonInput = new TextInputBuilder()
      .setCustomId("banReasonInput")
      .setLabel("Neuer Ban-Grund")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Gib hier den neuen Ban-Grund ein")
      .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(banReasonInput);

    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
  },
};
