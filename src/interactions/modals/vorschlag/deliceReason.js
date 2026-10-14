import { finalizeVorschlag, STATUS_PRESETS } from "#systems/vorschlag.js";

export default {
  id: "delicereason",

  async run(client, interaction) {
    await finalizeVorschlag(interaction, {
      ...STATUS_PRESETS.delice,
      grund: interaction.fields.getTextInputValue("grund"),
    });
  },
};
