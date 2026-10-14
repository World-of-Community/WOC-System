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
      required: true,
      type: 6,
    },
    {
      type: 3,
      choices: [
        {
          name: "Beleidigung",
          value: "Beleidigung",
        },
        {
          name: "Spam",
          value: "Spam",
        },
        {
          name: "Rassismus",
          value: "Rassismus",
        },
        {
          name: "Regelbruch",
          value: "Regelbruch",
        },
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
      name: "grund",
      description: "» Wähle einen Grund oder gebe einen eigenen an",
      required: false,
    },
    {
      type: 3,
      name: "eigener-grund",
      description: "» Alternativ: Eigenen Grund eingeben",
      required: false,
    },
    {
      type: 3,
      choices: [
        {
          name: "🕒 » 15 Minuten",
          value: "15m",
        },
        {
          name: "🕒 » 30 Minuten",
          value: "30m",
        },
        {
          name: "🕒 » 45 Minuten",
          value: "45m",
        },
        {
          name: "🕒 » 1 Stunde",
          value: "1h",
        },
        {
          name: "🕒 » 2 Stunden",
          value: "2h",
        },
        {
          name: "🕒 » 6 Stunden",
          value: "6h",
        },
        {
          name: "⛔ » PERMANENT",
          value: "PERMANENT",
        },
      ],
      name: "dauer",
      description: "» Gebe eine Dauer an (z.B. 5d 30m)",
      required: false,
    },
  ],

  async run(client, interaction) {
    const member = interaction.options.getMember("user");
    if (!member) {
      return interaction.reply({ content: "> `❌` » Der Benutzer konnte nicht gefunden werden.", flags: MessageFlags.Ephemeral });
    }

    if (!member.bannable) {
      return interaction.reply({ content: "> `❌` » Ich kann diesen Benutzer nicht bannen.", flags: MessageFlags.Ephemeral });
    }

    const selectedReason = interaction.options.getString("grund");
    const customReason = interaction.options.getString("eigener-grund");
    const reason = customReason || selectedReason || "Kein Grund angegeben";
    const durationInput = interaction.options.getString("dauer") || "PERMANENT";

    const banRole = interaction.guild.roles.cache.get(settings.get("roles.banned"));
    const memberRole = interaction.guild.roles.cache.get(settings.get("roles.member"));
    const newmemberRole = interaction.guild.roles.cache.get(settings.get("roles.newMember"));
    const logChannel = interaction.guild.channels.cache.get(settings.get("channels.serverLogs"));
    const thread = logChannel?.threads.cache.get(settings.get("logThreads.moderation"));

    const missing = [];
    if (!banRole) {missing.push("Ban-Rolle");}
    if (!memberRole) {missing.push("Mitglieder-Rolle");}
    if (!newmemberRole) {missing.push("Neue Mitglieder-Rolle");}
    if (!thread) {missing.push("Log-Thread");}
    if (missing.length > 0) {
      return interaction.reply({ content: `> \`❌\` » Folgendes wurde nicht gefunden: ${missing.join(", ")}`, flags: MessageFlags.Ephemeral });
    }

    const durationMs = durationInput !== "PERMANENT" ? ms(durationInput) : null;

    // Dauer als Number speichern: -1 = Permanent
    const durationToSave = durationMs !== null ? durationMs : -1;

    const startTime = Date.now();
    const endTime = durationToSave !== -1 ? startTime + durationToSave : null;

    try {
      await member.roles.add(banRole);
      await member.roles.remove(memberRole).catch(() => { });
      await member.roles.remove(newmemberRole).catch(() => { });
    } catch {
      return interaction.reply({ content: "> `❌` » Fehler beim Zuweisen oder Entfernen von Rollen.", flags: MessageFlags.Ephemeral });
    }

    const createdAt = `<t:${Math.round(member.user.createdTimestamp / 1000)}>`;
    const joinedAt = `<t:${Math.round(member.joinedTimestamp / 1000)}>`;
    const durationText = durationToSave === -1 ? "Permanent" : ms(durationToSave, { long: true });

    const banEmbed = new EmbedBuilder()
      .setTitle(`\`⛔\` - ${member.displayName} wurde gebannt.`)
      .setDescription(`${member} wurde von ${interaction.user} gebannt.\n\n\`👤\` **Benutzer Informationen:**\n> **Grund:** \`${reason}\`\n> **Dauer:** \`${durationText}\`\n> **Benutzername:** ${member.user.tag} (\`${member.id}\`)\n> **Account erstellt am:** ${createdAt}\n> **Beigetreten am:** ${joinedAt}`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setColor("Red")
      .setFooter({ text: `© ${interaction.guild.name} | Bann-System`, iconURL: interaction.client.user.displayAvatarURL() });

    try {
      await new bandb({
        creator: interaction.user.id,
        userId: member.id,
        reason,
        duration: durationToSave,
        startTime,
        endTime,
      }).save();
    } catch (err) {
      logger.error("Fehler beim Speichern des Banns in der Datenbank:", err);
      return interaction.reply({ content: "> `❌` » Fehler beim Speichern des Banns in der Datenbank. Details in der Konsole.", flags: MessageFlags.Ephemeral });
    }

    await thread.send({ embeds: [banEmbed] });
    await interaction.reply({ content: `> \`✅\` » ${member} wurde erfolgreich gebannt.`, flags: MessageFlags.Ephemeral });
  },
};
