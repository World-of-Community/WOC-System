const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user-find')
    .setDescription('» Findet einen Benutzer anhand seiner ID. 🔍')
    .addStringOption(option =>
      option.setName('id')
        .setDescription('Die ID des Benutzers, den du suchen möchtest.')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Nur für Mitglieder mit der Berechtigung "Manage Roles"

  async execute(interaction) {
    const memberId = interaction.options.getString('id');

    // Initiale Nachricht, dass der Bot nach dem Benutzer sucht
    await interaction.reply({ content: '> `🔍` » Ich suche nach dem Nutzer, einen Augenblick bitte...', ephemeral: true });

    try {
      // Warten für 3 Sekunden
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Benutzer anhand der ID abrufen
      const member = await interaction.guild.members.fetch(memberId);

      // Prüfen, ob der Nutzer erwähnbar ist
      const mentionStatus = member.permissions.has(PermissionFlagsBits.SendMessages) ? `${member}` : '`❌` Nicht erwähnbar';

      // Embed-Nachricht erstellen
      const UserFindEmbed = new EmbedBuilder()
        .setTitle('Benutzer gefunden')
        .setDescription(`Der Benutzer mit der ID \`${memberId}\` ist **${member.user.username}**.\n\n- Nutzer: ${member.user.displayName}\n- Erwähnung: ${mentionStatus}`)
        .setColor('Green')
        .setThumbnail(member.user.displayAvatarURL())
        .setFooter({ text: 'Benutzerabfrage', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

      await interaction.editReply({ content: '> `✅` » Ich habe den Nutzer erfolgreich gefunden.', embeds: [UserFindEmbed], ephemeral: true });
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzers:', error);

      // Embed für Fehler senden
      const ErrorEmbed = new EmbedBuilder()
        .setTitle('Benutzer nicht gefunden')
        .setDescription('Benutzer konnte nicht gefunden werden.')
        .setColor('Red')
        .setFooter({ text: 'Benutzerabfrage', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

      await interaction.editReply({ content: '> `❌` » Ich konnte den Nutzer nicht finden.', embeds: [ErrorEmbed], ephemeral: true });
    }
  },
};
