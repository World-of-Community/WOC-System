import { finalizeVorschlag, STATUS_PRESETS } from "#systems/vorschlag.js";

export default {
  id: "editreason",

  async run(client, interaction) {
    await finalizeVorschlag(interaction, {
      ...STATUS_PRESETS.edit,
      grund: interaction.fields.getTextInputValue("grund"),
    });
  },
};
