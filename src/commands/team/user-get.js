const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user-get')
    .setDescription('» Listet alle Mitglieder des Servers mit ID auf. 🔍')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Nur für Mitglieder mit der Berechtigung "Manage Roles"

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true }); // Verzögerte Antwort, falls es länger dauert

    try {
      const members = await interaction.guild.members.fetch(); // Alle Mitglieder abrufen
      const memberList = members.map(member => `> 🆔 \`${member.id}\` | 👤 **${member.user.username}** | ${member}`).join('\n');

      if (memberList.length > 4000) {
        return interaction.editReply({ content: '> `⚠️` » Die Mitgliederliste ist zu lang, um sie hier anzuzeigen!', ephemeral: true });
      }

      // Embed mit allen Mitgliedern
      const UserListEmbed = new EmbedBuilder()
        .setTitle(`👥 Server-Mitglieder (${members.size})`)
        .setDescription(memberList || 'Keine Mitglieder gefunden.')
        .setColor('Blue')
        .setFooter({ text: 'Benutzerabfrage', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

      await interaction.editReply({ embeds: [UserListEmbed] });
    } catch (error) {
      console.error('Fehler beim Abrufen der Mitglieder:', error);
      await interaction.editReply({ content: '> `❌` » Es gab einen Fehler beim Abrufen der Mitglieder.', ephemeral: true });
    }
  },
};
