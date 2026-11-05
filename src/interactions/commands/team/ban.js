
import { EmbedBuilder, MessageFlags } from "discord.js";
import ms from "ms";
import bandb from "#models/Ban.js";
import logger from "#core/logger.js";
import { settings } from "#core/settings.js";

export default {
  name: "ban",
  description: "» Banne einen User. 🔒",
  type: 1,
  default_member_permissions: "4",

  options: [
    {
      name: "user",
      description: "» Welcher User soll gebannt werden?",
      required: false,
      type: 6,
    },
    {
      name: "id",
      description: "» Discord-ID des Benutzers.",
      required: false,
      type: 3,
    },
    {
      type: 3,
      name: "grund",
      description: "» Wähle einen Grund.",
      required: false,
      choices: [
        { name: "Beleidigung", value: "Beleidigung" },
        { name: "Spam", value: "Spam" },
        { name: "Rassismus", value: "Rassismus" },
        { name: "Regelbruch", value: "Regelbruch" },
        {
          name: "An Verdächtiger Spam Aktivität beteiligt",
          value: "An Verdächtiger Spam Aktivität beteiligt",
        },
        {
          name: "Verdächtiger oder Spam Account",
          value: "Verdächtiger oder Spam Account",
        },
        {
          name: "Gefährdeter oder Gehackter Account",
          value: "Gefährdeter oder Gehackter Account",
        },
        {
          name: "Gegen Serverregeln verstoßen",
          value: "Gegen Serverregeln verstoßen",
        },
      ],
    },
    {
      type: 3,
      name: "eigener-grund",
      description: "» Alternativ: Eigenen Grund eingeben.",
      required: false,
    },
    {
      type: 3,
      name: "dauer",
      description: "» Gebe eine Dauer an.",
      required: false,
      choices: [
        { name: "🕒 » 15 Minuten", value: "15m" },
        { name: "🕒 » 30 Minuten", value: "30m" },
        { name: "🕒 » 45 Minuten", value: "45m" },
        { name: "🕒 » 1 Stunde", value: "1h" },
        { name: "🕒 » 2 Stunden", value: "2h" },
        { name: "🕒 » 6 Stunden", value: "6h" },
        { name: "⛔ » PERMANENT", value: "PERMANENT" },
      ],
    },
  ],

  async run(client, interaction) {
    const selectedUser = interaction.options.getUser("user");
    const userId = interaction.options.getString("id")?.trim();

    // Benutzer überprüfen
    if (!selectedUser && !userId) {
      return interaction.reply({
        content: "> `❌` » Bitte wähle einen Benutzer aus oder gebe eine Discord-ID an.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (selectedUser && userId) {
      return interaction.reply({
        content: "> `❌` » Bitte verwende entweder einen Benutzer oder eine Discord-ID, nicht beides.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const targetId = selectedUser?.id || userId;

    if (!/^\d{17,20}$/.test(targetId)) {
      return interaction.reply({
        content: "> `❌` » Die angegebene Discord-ID ist ungültig.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (targetId === interaction.user.id) {
      return interaction.reply({
        content: "> `❌` » Du kannst dich nicht selbst bannen.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (targetId === client.user.id) {
      return interaction.reply({
        content: "> `❌` » Ich kann mich nicht selbst bannen.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const selectedReason = interaction.options.getString("grund");
    const customReason = interaction.options.getString("eigener-grund");

    const reason = (customReason || selectedReason || "Kein Grund angegeben").trim();

    if (reason.length > 500) {
      return interaction.reply({
        content: "> `❌` » Der Bann-Grund darf maximal 500 Zeichen lang sein.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const durationInput =
      interaction.options.getString("dauer") || "PERMANENT";

    const durationMs =
      durationInput !== "PERMANENT" ? ms(durationInput) : null;

    if (durationInput !== "PERMANENT" &&
        (!durationMs || !Number.isFinite(durationMs))) {
      return interaction.reply({
        content: "> `❌` » Die angegebene Bann-Dauer ist ungültig.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const durationToSave = durationMs ?? -1;

    const startTime = Date.now();
    const endTime =
      durationToSave !== -1
        ? startTime + durationToSave
        : null;

    // Rollen und Log-Channel
    const banRole = interaction.guild.roles.cache.get(
      settings.get("roles.banned")
    );

    const memberRole = interaction.guild.roles.cache.get(
      settings.get("roles.member")
    );

    const newmemberRole = interaction.guild.roles.cache.get(
      settings.get("roles.newMember")
    );

    const logChannel = interaction.guild.channels.cache.get(
      settings.get("channels.serverLogs")
    );

    const thread = logChannel?.threads.cache.get(
      settings.get("logThreads.moderation")
    );

    if (!thread) {
      return interaction.reply({
        content: "> `❌` » Der Moderations-Log-Thread wurde nicht gefunden.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Benutzer und Servermitglied laden
    let user;
    let member = null;

    try {
      user = selectedUser || await client.users.fetch(targetId);

      member = await interaction.guild.members.fetch({
        user: targetId,
        force: true,
      }).catch(() => null);
    } catch {
      return interaction.reply({
        content: "> `❌` » Der Benutzer konnte nicht gefunden werden.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Prüfen, ob bereits gebannt
    const existingBan = await interaction.guild.bans.fetch(targetId).catch(() => null);

    if (existingBan) {
      return interaction.reply({
        content: "> `❌` » Dieser Benutzer ist bereits gebannt.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Bei Servermitgliedern Rollen überprüfen
    if (member) {
      if (!member.bannable) {
        return interaction.reply({
          content: "> `❌` » Ich kann diesen Benutzer aufgrund seiner Rollen nicht bannen.",
          flags: MessageFlags.Ephemeral,
        });
      }

      if (!banRole || !memberRole || !newmemberRole) {
        return interaction.reply({
          content: "> `❌` » Eine oder mehrere benötigte Rollen wurden nicht gefunden.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    // Discord-Bann durchführen
    try {
      await interaction.guild.members.ban(targetId, {
        reason: reason,
      });
    } catch (err) {
      logger.error("Fehler beim Discord-Bann:", err);

      return interaction.reply({
        content: "> `❌` » Der Benutzer konnte nicht gebannt werden.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Datenbankeintrag speichern
    try {
      await new bandb({
        creator: interaction.user.id,
        userId: targetId,
        reason,
        duration: durationToSave,
        startTime,
        endTime,
      }).save();
    } catch (err) {
      logger.error("Fehler beim Speichern des Banns in der Datenbank:", err);

      // Discord-Bann rückgängig machen, wenn Speicherung fehlschlägt
      await interaction.guild.members.unban(targetId).catch(() => {});

      return interaction.reply({
        content: "> `❌` » Fehler beim Speichern des Banns in der Datenbank. Der Discord-Bann wurde rückgängig gemacht.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Rollen bei Servermitgliedern entfernen bzw. Ban-Rolle setzen
    // Hinweis: Nach einem Discord-Bann ist das Mitglied nicht mehr im Server.
    // Die Ban-Rolle kann deshalb nicht mehr zugewiesen werden.

    const createdAt = `<t:${Math.round(user.createdTimestamp / 1000)}:F>`;

    const durationText =
      durationToSave === -1
        ? "Permanent"
        : ms(durationToSave, { long: true });

    const banEmbed = new EmbedBuilder()
      .setTitle(`⛔ - ${user.username} wurde gebannt.`)
      .setDescription(
        `${user} wurde von ${interaction.user} gebannt.\n\n` +
        `👤 **Benutzer Informationen:**\n` +
        `> **Grund:** \`${reason}\`\n` +
        `> **Dauer:** \`${durationText}\`\n` +
        `> **Benutzername:** ${user.tag} (\`${targetId}\`)\n` +
        `> **Account erstellt am:** ${createdAt}\n` +
        `> **Servermitglied:** ${member ? "Ja" : "Nein"}`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor("Red")
      .setFooter({
        text: `© ${interaction.guild.name} | Bann-System`,
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    // Moderations-Log
    try {
      await thread.send({
        embeds: [banEmbed],
      });
    } catch (err) {
      logger.error("Fehler beim Senden des Bann-Logs:", err);
    }

    return interaction.reply({
      content: `> \`✅\` » <@${targetId}> wurde erfolgreich gebannt.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};