const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const ms = require("ms");
const bandb = require("../../../Datenbank/bandb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("» Banne einen User. 🔒")
    .addUserOption(option =>
      option.setName("user").setDescription("» Welcher User soll gebannt werden?").setRequired(true))
    .addStringOption(option =>
      option.setName("grund")
        .setDescription("» Wähle einen Grund oder gebe einen eigenen an")
        .addChoices(
          { name: "Beleidigung", value: "Beleidigung" },
          { name: "Spam", value: "Spam" },
          { name: "Rassismus", value: "Rassismus" },
          { name: "Regelbruch", value: "Regelbruch" },
          { name: "An Verdächtiger Spam Aktivität beteiligt", value: "An Verdächtiger Spam Aktivität beteiligt" },
          { name: "Verdächtiger oder Spam Account", value: "Verdächtiger oder Spam Account" },
          { name: "Gefährdeter oder Gehackter Account", value: "Gefährdeter oder Gehackter Account" },
          { name: "Gegen Serverregeln verstoßen", value: "Gegen Serverregeln verstoßen" },
        )
        .setRequired(false))
    .addStringOption(option =>
      option.setName("eigener-grund")
        .setDescription("» Alternativ: Eigenen Grund eingeben")
        .setRequired(false))
    .addStringOption(option =>
      option.setName("dauer").setDescription("» Gebe eine Dauer an (z.B. 5d 30m)")
        .addChoices(
          { name: "🕒 » 15 Minuten", value: "15m" },
          { name: "🕒 » 30 Minuten", value: "30m" },
          { name: "🕒 » 45 Minuten", value: "45m" },
          { name: "🕒 » 1 Stunde", value: "1h" },
          { name: "🕒 » 2 Stunden", value: "2h" },
          { name: "🕒 » 6 Stunden", value: "6h" },
          { name: "⛔ » PERMANENT", value: "PERMANENT" },
        ).setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const member = interaction.options.getMember("user");
    if (!member) {
      return interaction.reply({ content: "> `❌` » Der Benutzer konnte nicht gefunden werden.", ephemeral: true });
    }

    if (!member.bannable) {
      return interaction.reply({ content: "> `❌` » Ich kann diesen Benutzer nicht bannen.", ephemeral: true });
    }

    const selectedReason = interaction.options.getString("grund");
    const customReason = interaction.options.getString("eigener-grund");
    const reason = customReason || selectedReason || "Kein Grund angegeben";
    const durationInput = interaction.options.getString("dauer") || "PERMANENT";

    const banRole = interaction.guild.roles.cache.get("886989738244964362");
    const memberRole = interaction.guild.roles.cache.get("815920703067914290");
    const newmemberRole = interaction.guild.roles.cache.get("1222122625594294272");
    const logChannel = interaction.guild.channels.cache.get("1263436406655680513");
    const thread = logChannel?.threads.cache.get("1269998219266490538");

    const missing = [];
    if (!banRole) {missing.push("Ban-Rolle");}
    if (!memberRole) {missing.push("Mitglieder-Rolle");}
    if (!newmemberRole) {missing.push("Neue Mitglieder-Rolle");}
    if (!thread) {missing.push("Log-Thread");}
    if (missing.length > 0) {
      return interaction.reply({ content: `> ❌ » Folgendes wurde nicht gefunden: ${missing.join(", ")}`, ephemeral: true });
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
      return interaction.reply({ content: "> `❌` » Fehler beim Zuweisen oder Entfernen von Rollen.", ephemeral: true });
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
        startTime: startTime,
        endTime: endTime,
      }).save();
    } catch (err) {
      console.error("Fehler beim Speichern des Banns in der Datenbank:", err);
      return interaction.reply({ content: "> `❌` » Fehler beim Speichern des Banns in der Datenbank. Details in der Konsole.", ephemeral: true });
    }

    await thread.send({ embeds: [banEmbed] });
    await interaction.reply({ content: `> \`✅\` » ${member} wurde erfolgreich gebannt.`, ephemeral: true });
  },
};
