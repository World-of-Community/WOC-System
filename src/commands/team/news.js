const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('news')
    .setDescription('Sendet eine Nachricht mit einem Titel im Kanal und per DM an alle Mitglieder.')
    .addChannelOption(option =>
        option.setName('kanal')
          .setDescription('Der Kanal, in dem die Nachricht gesendet werden soll')
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildText) // Nur Textkanäle auswählen
      )
    .addStringOption(option => 
      option.setName('title')
        .setDescription('Der Titel der Nachricht')
        .setRequired(true)
    )
    .addStringOption(option => 
      option.setName('nachricht')
        .setDescription('Die Nachricht, die gesendet werden soll')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Erforderliche Berechtigungen

  async execute(interaction) {
    const kanal = interaction.options.getChannel('kanal');
    const title = interaction.options.getString('title');
    const nachricht = interaction.options.getString('nachricht');
    const embed = new EmbedBuilder()
      .setTitle(title) // Setzt den Titel der Nachricht
      .setDescription(nachricht.replace(/\\n/g, '\n')) // Ersetze \n mit echten Zeilenumbrüchen
      .setColor('Orange')
      .setTimestamp();

    // Sende Nachricht im angegebenen Kanal
    await kanal.send({ embeds: [embed] });

    // Button für die Deaktivierung der Benachrichtigungen
    const disableButton = new ButtonBuilder()
      .setCustomId('disable_news')
      .setLabel('Deaktivieren der Neuigkeiten')
      .setStyle(ButtonStyle.Danger); // Danger-Stil für den Button

    const row = new ActionRowBuilder().addComponents(disableButton);

    // Sende DM an alle Mitglieder als Embed mit Button
    const guildMembers = await interaction.guild.members.fetch();
    guildMembers.forEach(async (member) => {
      if (member.user.bot) return; // Ignoriere Bots

      try {
        const dmChannel = await member.createDM();
        await dmChannel.send({
          embeds: [embed],
          components: [row], // Button hinzufügen
        });
      } catch (error) {
        console.error(`Fehler beim Senden der DM an ${member.user.username}:`, error);
      }
    });

    // Reagiere auf die Interaktion mit einer Bestätigung
    await interaction.reply({ content: 'Die Neuigkeiten wurden gesendet!', ephemeral: true });
  },
};

// Interaktion für den Button
module.exports.buttonInteraction = async (interaction) => {
  if (interaction.customId === 'disable_news') {
    try {
      // Logik zum Deaktivieren der Neuigkeiten (z.B. in der Datenbank oder in einem Array speichern)
      const userId = interaction.user.id;

      // Hier könnte eine Funktion aufgerufen werden, die den Status speichert, z.B. in einer Datenbank
      // oder in einer Datei, um den Benutzer von zukünftigen DMs zu entfernen.
      console.log(`${interaction.user.username} hat die Neuigkeiten deaktiviert.`);

      await interaction.reply({
        content: 'Du wirst keine weiteren Neuigkeiten per DM erhalten.',
        ephemeral: true,
      });
    } catch (error) {
      console.error('Fehler bei der Deaktivierung der Neuigkeiten:', error);
      await interaction.reply({ content: 'Es gab einen Fehler beim Deaktivieren der Neuigkeiten.', ephemeral: true });
    }
  }
};
