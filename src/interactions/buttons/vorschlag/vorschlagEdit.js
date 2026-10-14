import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default {
  id: "vorschlag_edit",

  async run(client, interaction) {
    const modal = new ModalBuilder()
      .setCustomId("editreason")
      .setTitle("⚙️ | In Planung");

    const input = new TextInputBuilder()
      .setCustomId("grund")
      .setLabel("» Grund")
      .setMaxLength(60)
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  },
};
