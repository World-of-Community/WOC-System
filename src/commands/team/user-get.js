const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user-get')
    .setDescription('» Findet die ID eines Nutzers anhand des Namens. 🔍')
    .addUserOption(option =>
      option.setName('nutzer')
        .setDescription('Wähle den Benutzer aus, dessen ID du abrufen möchtest.')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Nur für Mitglieder mit der Berechtigung "Manage Roles"

  async execute(interaction) {
    const member = interaction.options.getUser('nutzer');

    // Falls der Benutzer nicht existiert (sehr unwahrscheinlich, da "required: true"), gibt es eine Fehlermeldung
    if (!member) {
      return interaction.reply({ content: '> `❌` » Benutzer konnte nicht gefunden werden.', ephemeral: true });
    }

    // Embed für den gefundenen Benutzer
    const UserEmbed = new EmbedBuilder()
      .setTitle('Benutzer-Informationen')
      .setDescription(`Hier sind die Details zum Nutzer **${member.username}**`)
      .addFields(
        { name: '🆔 Benutzer-ID', value: `\`${member.id}\``, inline: true },
        { name: '👤 Benutzername', value: `${member.username}`, inline: true },
        { name: '🖼️ Avatar', value: `[Profilbild anzeigen](${member.displayAvatarURL({ dynamic: true })})` }
      )
      .setThumbnail(member.displayAvatarURL({ dynamic: true }))
      .setColor('Blue')
      .setFooter({ text: 'Benutzerabfrage', iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [UserEmbed], ephemeral: true });
  },
};
