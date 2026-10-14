import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default {
  id: "vorschlag_accept",

  async run(client, interaction) {
    const modal = new ModalBuilder()
      .setCustomId("acceptreason")
      .setTitle("✅ | Akzeptieren");

    const input = new TextInputBuilder()
      .setCustomId("grund")
      .setLabel("» Grund")
      .setPlaceholder("Beispiel: Wir haben uns dein Vorschlag...")
      .setMaxLength(60)
      .setRequired(true)
      .setStyle(TextInputStyle.Short);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  },
};
