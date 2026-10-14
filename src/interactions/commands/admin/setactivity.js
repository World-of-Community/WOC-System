import { ActivityType, MessageFlags } from "discord.js";
import logger from "#core/logger.js";

let statusInterval; // globale Variable zum Speichern des Intervalls

// Standard-Aktivität, bis der automatische Statuswechsel übernimmt
const DEFAULT_ACTIVITY = { name: "World Of Community", type: ActivityType.Playing };

/**
 * Startet den automatischen Statuswechsel für den Bot.
 * @param {Client} client Der Discord Client
 * @param {Guild} guild Die Discord-Gilde (Server)
 */
export function startStatusCycle(client, guild) {
  if (statusInterval) {clearInterval(statusInterval);}

  statusInterval = setInterval(async () => {
    try {
      await guild.members.fetch();

      // Filtere alle Online-Mitglieder (ohne Bots)
      const onlineMembers = guild.members.cache.filter(m =>
        !m.user.bot &&
                ["online", "idle", "dnd"].includes(m.presence?.status),
      );

      if (onlineMembers.size === 0) {return;}

      const randomMember = onlineMembers.random();
      const username = randomMember.user.username || randomMember.user.tag;

      const customStatus = `💖 | mit ${username}`;
      await client.user.setActivity(customStatus, { type: ActivityType.Playing });

    } catch (error) {
      logger.error("Fehler im Status-Cycle:", error);
    }
  }, 60000); // alle 1 Minute
}

export default {
  name: "setcustomstatus",
  description: "Setzt eine benutzerdefinierte Statusnachricht für den Bot oder setzt sie zurück",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      type: 3,
      name: "status",
      description: "Die Statusnachricht, die angezeigt werden soll",
      required: false,
    },
    {
      type: 3,
      choices: [
        {
          name: "Online",
          value: "online",
        },
        {
          name: "AFK (Idle)",
          value: "idle",
        },
        {
          name: "Bitte nicht stören (DND)",
          value: "dnd",
        },
        {
          name: "Unsichtbar (Offline)",
          value: "invisible",
        },
        {
          name: "Zurücksetzen (Standard)",
          value: "reset",
        },
      ],
      name: "presence",
      description: "Der Online-Status des Bots",
      required: false,
    },
  ],

  /**
     * Command-Handler für den /setcustomstatus Befehl
     */
  async run(client, interaction) {
    const status = interaction.options.getString("status");
    let presence = interaction.options.getString("presence");

    try {
      if (presence === "reset" || !presence) {presence = "online";}

      if (!status || status.toLowerCase() === "reset") {
        // Status zurücksetzen: Standard-Aktivität setzen und automatischen Zyklus starten
        await interaction.client.user.setPresence({
          activities: [DEFAULT_ACTIVITY],
          status: presence,
        });

        // Automatischen Statuswechsel starten (oder neu starten)
        startStatusCycle(interaction.client, interaction.guild);

        await interaction.reply({
          content: "Status wurde auf Standard zurückgesetzt. Automatischer Statuswechsel läuft wieder.",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        // Manuellen Status setzen, automatischen Statuswechsel stoppen
        if (statusInterval) {clearInterval(statusInterval);}

        await interaction.client.user.setPresence({
          activities: [{ name: status, type: ActivityType.Custom }],
          status: presence,
        });

        await interaction.reply({
          content: `Benutzerdefinierter Status gesetzt: **${status}**\nOnline-Status: **${presence}**`,
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (error) {
      logger.error(error);
      await interaction.reply({ content: "Fehler beim Setzen des Status.", flags: MessageFlags.Ephemeral });
    }
  },
  // Exportiere auch startStatusCycle, damit du ihn beim Bot-Start aufrufen kannst
  startStatusCycle,
};
