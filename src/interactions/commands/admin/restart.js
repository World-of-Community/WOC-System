import logger from "#core/logger.js";
import { shutdown } from "#core/shutdown.js";

// Relies on the process manager (pm2 / systemd / nodemon) restarting the bot after exit
export default {
  name: "restart",
  description: "» Startet den Bot neu. (Admin/Dev Only)",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      type: 3,
      name: "bestätigung",
      description: "Bestätige mit \"ja\"",
      required: true,
    },
  ],

  async run(client, interaction) {
    if (interaction.options.getString("bestätigung") !== "ja") {
      return interaction.reply({ content: '> `❗` » Du musst mit "ja" bestätigen, um den Bot neu zu starten.', ephemeral: true });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    await interaction.reply({ content: `> \`🕒\` » Der Bot wird neu gestartet... (<t:${timestamp}:R>) (Max. 30 Sekunden)`, ephemeral: true });
    logger.warn(`Restart requested by ${interaction.user.tag}`);

    setTimeout(() => shutdown(client, { reason: "restart command" }), 2000);
  },
};
