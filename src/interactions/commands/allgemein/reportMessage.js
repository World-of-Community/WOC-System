import { EmbedBuilder, time, MessageFlags } from "discord.js";
import { settings } from "#core/settings.js";

export default {
  name: "Nachricht melden",
  type: 3,
  options: [],

  async run(client, interaction) {
    const reportLog = interaction.guild.channels.cache.get(settings.get("channels.reports"));

    const embed = new EmbedBuilder()
      .setTitle(`\`📝\` | Neuer Report von ${interaction.user.displayName}`)
      .setDescription(`${interaction.targetMessage.author} wurde von ${interaction.user} gemeldet.\n\n> \`👤\` - **BENUTZER INFORMATIONEN**\n\`✍️\` » Nachricht: ${interaction.targetMessage.url}\n\`📑\` » Inhalt: ${interaction.targetMessage.content.slice(0, 400)}\n\`📌\` » Benutzername: ${interaction.targetMessage.author.displayName} (\`${interaction.targetMessage.author.id}\`) (${interaction.targetMessage.author})\n\n\`⏰\` » Account erstellt am: ${time(interaction.targetMessage.author.createdAt)}\n\`⏰\` » Beigetreten am: ${time(interaction.targetMessage.member.joinedAt)}`)
      .setColor("Red")
      .setFooter({ text: `© ${interaction.guild.name} - Report System`, iconURL: `${interaction.guild.iconURL()}` })
      .setTimestamp();

    reportLog.send({
      embeds: [embed],
    });

    interaction.reply({ flags: MessageFlags.Ephemeral, content: ":white_check_mark: Erfolgreich gemeldet!"});
  },
};
