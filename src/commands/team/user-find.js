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

    // Initiale Nachricht, dass der Bot nach dem Benutzer sucht
    await interaction.reply({ content: '> `🔍` » Ich suche nach dem Nutzer, einen Augenblick bitte...', ephemeral: true });

    try {
      // Warten für 3 Sekunden
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Benutzer anhand der ID abrufen
      const user = await interaction.guild.members.fetch(userId);

      // Embed-Nachricht erstellen
      const UserFindEmbed = new EmbedBuilder()
        .setTitle('Benutzer gefunden')
        .setDescription(`Der Benutzer mit der ID \`${userId}\` ist **${user.user.username}**.\n\n- Nutzer: ${member}`)
        .setColor('Green')
        .setThumbnail(user.user.displayAvatarURL())
        .setFooter({ text: 'Benutzerabfrage' })
        .setTimestamp();

      // Embed-Nachricht senden
      await interaction.editReply({ content: '> `✅` » Ich habe den Nutzer erfolgreich gefunden.', embeds: [UserFindEmbed], ephemeral: true });
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzers:', error);

      // Embed für Fehler senden
      const ErrorEmbed = new EmbedBuilder()
        .setTitle('Benutzer nicht gefunden')
        .setDescription('Benutzer konnte nicht gefunden werden.')
        .setColor('Red')
        .setFooter({ text: 'Benutzerabfrage' })
        .setTimestamp();

      await interaction.editReply({ content: '> `❌` » Ich konnte den Nutzer nicht finden.', embeds: [ErrorEmbed], ephemeral: true });
    }
  },
};
