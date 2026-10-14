import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default {
  id: "vorschlag_delice",

  async run(client, interaction) {
    const modal = new ModalBuilder()
      .setCustomId("delicereason")
      .setTitle("❌ | Ablehnen");

    const input = new TextInputBuilder()
      .setCustomId("grund")
      .setLabel("» Grund")
      .setPlaceholder("Beispiel: Existiert schon")
      .setMaxLength(60)
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  },
};
