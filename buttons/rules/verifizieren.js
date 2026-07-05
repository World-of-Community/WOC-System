import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default {
  id: "verifizieren",
  run: async (client, interaction) => {
    const rndNumber = Math.floor(Math.random() * 999) + 1000;
    const verifyNumber = rndNumber.toString();

    // Der Code wird in der Modal-ID mitgegeben und beim Absenden
    // in modals/verifyModal.js gegen die Eingabe geprüft
    const verifyModal = new ModalBuilder()
      .setTitle("Verifiziere dich!")
      .setCustomId(`verify-modal_${verifyNumber}`);

    const verifyInput = new TextInputBuilder()
      .setCustomId("verifyInput")
      .setLabel(`Dein Verifizierungscode: ${verifyNumber}`)
      .setMinLength(4)
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(verifyInput);
    verifyModal.addComponents(row);
    await interaction.showModal(verifyModal);
  },
};
