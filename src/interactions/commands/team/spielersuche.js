import {EmbedBuilder} from "discord.js";
import logger from "#core/logger.js";
import { settings } from "#core/settings.js";

export default {
  name: "spielersuche",
  description: "Startet das automatische Spielersuche-System (täglich um 00:00 Uhr)",
  type: 1,
  default_member_permissions: "268435456",
  options: [],

  async run(client, interaction) {
    const allowedChannelId = settings.get("channels.playerSearch"); // Spielersuche-Channel

    if (interaction.channel.id !== allowedChannelId) {
      return interaction.reply({
        content: "> `❌` » Dieser Befehl kann nur in einem bestimmten Channel verwendet werden.",
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: "> `✅` » Das Spielersuche-System wurde gestartet und sendet jeden Tag um 00:00 Uhr automatisch eine neue Nachricht.",
      ephemeral: true,
    });

    const channel = interaction.channel;
    let currentMessage;

    function sendeSpielersuche() {
      const SpielersucheEmbed = new EmbedBuilder()
        .setTitle("🎮 Spielersuche System")
        .setDescription(
          "Hier kannst du deinen Spielpartner finden, benutze `/game <rolle>` und finde deinen Spielpartner.\n\n" +
          "Server Spielmodi\n\n" +
          `- <@&${settings.get("gameRoles.knockbackFfa")}>\n` +
          `- <@&${settings.get("gameRoles.rageMode")}>\n` +
          `- <@&${settings.get("gameRoles.jumpNRun")}>\n\n` +
          "Für erweiterte Spielersuche\n\n" +
          `- <@&${settings.get("gameRoles.roblox")}>\n` +
          `- <@&${settings.get("gameRoles.rocketLeague")}>\n` +
          `- <@&${settings.get("gameRoles.gta5")}>\n` +
          `- <@&${settings.get("gameRoles.minecraft")}>\n` +
          `- <@&${settings.get("gameRoles.fifa")}>\n` +
          `- <@&${settings.get("gameRoles.lol")}>\n` +
          `- <@&${settings.get("gameRoles.valorant")}>\n` +
          `- <@&${settings.get("gameRoles.fortnite")}>`,
        )
        .setColor("Blurple");

      channel.send({ embeds: [SpielersucheEmbed] })
        .then(msg => {
          currentMessage = msg;
        })
        .catch(logger.error);
    }

    function getMillisUntilNextMidnight() {
      const now = new Date();
      const nextMidnight = new Date();
      nextMidnight.setHours(0, 0, 0, 0);
      nextMidnight.setDate(nextMidnight.getDate() + 1); // immer nächster Tag um 0 Uhr
      return nextMidnight.getTime() - now.getTime();
    }

    // Starte initiale Wartezeit bis Mitternacht
    setTimeout(() => {
      if (currentMessage && currentMessage.deletable) {
        currentMessage.delete().catch(logger.error);
      }

      setTimeout(() => {
        sendeSpielersuche();
      }, 5000); // 5 Sekunden nach dem Löschen

      // Wiederhole das Ganze alle 24 Stunden
      setInterval(() => {
        if (currentMessage && currentMessage.deletable) {
          currentMessage.delete().catch(logger.error);
        }

        setTimeout(() => {
          sendeSpielersuche();
        }, 5000); // 5 Sekunden später neu senden
      }, 24 * 60 * 60 * 1000); // Alle 24 Stunden

    }, getMillisUntilNextMidnight());

    // Sofort einmal senden beim Start
    sendeSpielersuche();
  },
};
