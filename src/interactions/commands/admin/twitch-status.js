import { setTwitchStatusEnabled, updateTwitchStatus } from "#systems/twitch.js";
import logger from "#core/logger.js";

export default {
  name: "twitch-status",
  description: "Aktiviere oder deaktiviere den automatischen Twitch-Status",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      "type": 3,
      "choices": [
        {
          "name": "Aktivieren",
          "value": "start",
        },
        {
          "name": "Deaktivieren",
          "value": "stop",
        },
      ],
      "name": "aktion",
      "description": "Wähle, ob du den Auto-Status aktivieren oder deaktivieren willst",
      "required": true,
    },
  ],

  async run(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    const aktion = interaction.options.getString("aktion");

    if (aktion === "start") {
      try {
        await setTwitchStatusEnabled(true);
        await updateTwitchStatus();

        await interaction.editReply({ content: "> `✅` » Automatische Twitch-Status-Aktualisierung wurde **aktiviert**." });
      } catch (err) {
        logger.error("Fehler beim Starten des Twitch-Status:", err);
        await interaction.editReply({ content: `> \`❌\` » Fehler beim Starten des automatischen Status-Updates.\n\n**${err.message}**` });
      }

    } else if (aktion === "stop") {
      await setTwitchStatusEnabled(false);

      await interaction.editReply({ content: "> `🛑` » Automatische Twitch-Status-Aktualisierung wurde **deaktiviert**." });
    }
  },
};
