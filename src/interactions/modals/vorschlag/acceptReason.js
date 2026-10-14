import { finalizeVorschlag, STATUS_PRESETS } from "#systems/vorschlag.js";

export default {
  id: "acceptreason",

  async run(client, interaction) {
    await finalizeVorschlag(interaction, {
      ...STATUS_PRESETS.accept,
      grund: interaction.fields.getTextInputValue("grund"),
    });
  },
};
