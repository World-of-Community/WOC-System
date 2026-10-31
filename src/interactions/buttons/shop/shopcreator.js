import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";

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
  new ActionRowBuilder().addComponents(input)
);

return interaction.showModal(modal);