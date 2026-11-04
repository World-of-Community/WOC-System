import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";

export default {
  id: "shoppass_creator_code",
  prefix: true,

  async run(client, interaction) {
    const modal = new ModalBuilder()
      .setCustomId("shoppass_creator_modal")
      .setTitle("Creator Code");

    const input = new TextInputBuilder()
      .setCustomId("creator_name")
      .setLabel("Name des Creators")
      .setPlaceholder("Creator-Namen eingeben ...")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(32);

    modal.addComponents(
      new ActionRowBuilder().addComponents(input),
    );

    await interaction.showModal(modal);
  },
};
