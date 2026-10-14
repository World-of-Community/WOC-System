import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import bandb from "#models/Ban.js";
import Timeout from "#models/Timeout.js";
import Warn from "#models/Warning.js";

export default {
  id: "banReasonModal_",
  prefix: true,
  async run(client, interaction) {
    const userId = interaction.customId.split("_")[1];
    const newReason = interaction.fields.getTextInputValue("banReasonInput");

    let userData = await bandb.findOne({ userId });
    if (!userData) {
      userData = new bandb({ userId, reason: newReason });
    } else {
      userData.reason = newReason;
    }
    await userData.save();

    const guild = interaction.guild;
    const user = await client.users.fetch(userId);
    const member = await guild.members.fetch(userId).catch(() => null);

    const [timeoutCount, warnCount] = await Promise.all([
      Timeout.countDocuments({ userId, guildId: guild.id }).catch(() => 0),
      Warn.countDocuments({ userId, guildId: guild.id }).catch(() => 0),
    ]);

    const banColor = 0xED4245;
    const banEmoji = "`🔴`";

    const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}>`;
    const joinedAt = member?.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}>` : "`Nicht auf dem Server`";

    const embed = new EmbedBuilder()
      .setTitle(`\`👤\` Informationen über ${member?.displayName || user.username}`)
      .setColor(banColor)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setDescription(
        "**`📌` Benutzerinformationen**\n" +
                `> \`👤\` » Benutzername: \`${user.username}\`\n` +
                `> \`🆔\` » Benutzer-ID: \`${user.id}\`\n` +
                `> \`🏷️\` » Anzeigename: \`${member?.displayName || "Nicht auf dem Server"}\`\n\n` +
                "**`⏰` Mitglied Seit**\n" +
                `> \`📅\` » Erstellt: ${createdAt}\n` +
                `> \`📅\` » Beigetreten: ${joinedAt}\n\n` +
                "**`👮` Moderation**\n" +
                `> \`⛔\` » Bannstatus: ${banEmoji} **Gebannt**\n` +
                `> \`📄\` » Grund: \`${newReason}\`\n` +
                `> \`🔇\` » Timeouts: \`${timeoutCount}\`\n` +
                `> \`❗\` » Warnungen: \`${warnCount}\``,
      )
      .setFooter({ text: `${guild.name} | Userinfo`, iconURL: guild.iconURL() || user.displayAvatarURL() })
      .setTimestamp();

    const components = [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`editBanReason_${user.id}`)
          .setLabel("📝 Ban-Grund ändern")
          .setStyle(ButtonStyle.Secondary),
      ),
    ];

    try {
      if (interaction.message) {
        await interaction.update({ embeds: [embed], components });
      } else {
        await interaction.reply({ content: "Ban-Grund wurde aktualisiert.", flags: MessageFlags.Ephemeral });
      }
    } catch {
      await interaction.reply({ content: "Ban-Grund wurde aktualisiert.", flags: MessageFlags.Ephemeral });
    }
  },
};
