import { finalizeVorschlag, STATUS_PRESETS } from "#systems/vorschlag.js";

export default {
  id: "vorschlag_duplicate",

  async run(client, interaction) {
    await finalizeVorschlag(interaction, STATUS_PRESETS.duplicate);
  },
};
