const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user-find')
    .setDescription('» Findet einen Benutzer anhand seiner ID. 🔍')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('Die ID des Benutzers, den du suchen möchtest.')
        .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const userId = interaction.options.getString('id');

    try {
      // Benutzer anhand der ID abrufen
      const user = await interaction.guild.members.fetch(userId);

      // Embed-Nachricht erstellen
      const UserFindEmbed = new EmbedBuilder()
        .setTitle('Benutzer gefunden')
        .setDescription(`Der Benutzer mit der ID **${userId}** ist **${user.user.username}**.`)
        .setColor('Blurple')
        .setThumbnail(user.user.displayAvatarURL())
        .setFooter({ text: 'Benutzerabfrage' })
        .setTimestamp();

      // Embed-Nachricht senden
      await interaction.reply({ embeds: [UserFindEmbed], ephemeral: true });
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzers:', error);

      // Embed für Fehler senden
      const ErrorEmbed = new EmbedBuilder()
        .setTitle('Benutzer nicht gefunden')
        .setDescription('Benutzer konnte nicht gefunden werden.')
        .setColor('Blurple')
        .setFooter({ text: 'Benutzerabfrage' })
        .setTimestamp();

      await interaction.reply({ embeds: [ErrorEmbed], ephemeral: true });
    }
  },
};
