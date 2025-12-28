const { SlashCommandBuilder, PermissionFlagsBits, ActivityType } = require("discord.js");

let statusInterval; // globale Variable zum Speichern des Intervalls

const DEFAULT_ACTIVITY = { name: "💖 | mit WOC", type: ActivityType.Playing };

/**
 * Startet den automatischen Statuswechsel für den Bot.
 * @param {Client} client Der Discord Client
 * @param {Guild} guild Die Discord-Gilde (Server)
 */
function startStatusCycle(client, guild) {
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
      console.error("Fehler im Status-Cycle:", error);
    }
  }, 60000); // alle 1 Minute
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setcustomstatus")
    .setDescription("Setzt eine benutzerdefinierte Statusnachricht für den Bot oder setzt sie zurück")
    .addStringOption(option =>
      option.setName("status")
        .setDescription("Die Statusnachricht, die angezeigt werden soll")
        .setRequired(false),
    )
    .addStringOption(option =>
      option.setName("presence")
        .setDescription("Der Online-Status des Bots")
        .setRequired(false)
        .addChoices(
          { name: "Online", value: "online" },
          { name: "AFK (Idle)", value: "idle" },
          { name: "Bitte nicht stören (DND)", value: "dnd" },
          { name: "Unsichtbar (Offline)", value: "invisible" },
          { name: "Zurücksetzen (Standard)", value: "reset" },
        ),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /**
     * Command-Handler für den /setcustomstatus Befehl
     */
  async execute(interaction) {
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
          ephemeral: true,
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
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: "Fehler beim Setzen des Status.", ephemeral: true });
    }
  },
  // Exportiere auch startStatusCycle, damit du ihn beim Bot-Start aufrufen kannst
  startStatusCycle,
};
