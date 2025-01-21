const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('news')
    .setDescription('Sendet eine Nachricht mit einem Titel im Kanal und per DM an den auslösenden Benutzer.')
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
    .addChannelOption(option =>
      option.setName('kanal')
        .setDescription('Der Kanal, in dem die Nachricht gesendet werden soll')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText) // Nur Textkanäle auswählen
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Erforderliche Berechtigungen

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const nachricht = interaction.options.getString('nachricht');
    const kanal = interaction.options.getChannel('kanal');
    const embed = new EmbedBuilder()
      .setTitle(title) // Setzt den Titel der Nachricht
      .setDescription(nachricht.replace(/\\n/g, '\n')) // Ersetze \n mit echten Zeilenumbrüchen
      .setColor('#0099ff')
      .setTimestamp();

    // Sende Nachricht im angegebenen Kanal
    await kanal.send({ embeds: [embed] });

    // Button für die Deaktivierung der Benachrichtigungen
    const disableButton = new ButtonBuilder()
      .setCustomId('disable_news')
      .setLabel('Deaktivieren der Neuigkeiten')
      .setStyle(ButtonStyle.Danger); // Danger-Stil für den Button

    const enableButton = new ButtonBuilder()
      .setCustomId('enable_news')
      .setLabel('Neuigkeiten Aktivieren')
      .setStyle(ButtonStyle.Success); // Success-Stil für den Button

    const row = new ActionRowBuilder().addComponents(disableButton, enableButton);

    // Sende DM nur an den Benutzer, der den Befehl ausführt
    try {
      const dmChannel = await interaction.user.createDM();
      const embedToSend = new EmbedBuilder()
        .setTitle(title) // Setzt den Titel der Nachricht
        .setDescription(nachricht.replace(/\\n/g, '\n')) // Ersetze \n mit echten Zeilenumbrüchen
        .setColor('#0099ff')
        .setTimestamp();

      await dmChannel.send({
        embeds: [embedToSend],
        components: [row], // Beide Buttons (Deaktivieren/Aktivieren) hinzufügen
      });

      // Bestätigung der Interaktion
      await interaction.reply({ content: '> `📰` » Die Neuigkeiten wurden an dich gesendet!', ephemeral: true });
    } catch (error) {
      console.error(`Fehler beim Senden der DM an ${interaction.user.username}:`, error);
      await interaction.reply({ content: 'Es gab einen Fehler beim Senden der Nachricht per DM.', ephemeral: true });
    }
  },
};

// Interaktion für den Button
module.exports.buttonInteraction = async (interaction) => {
  if (interaction.customId === 'disable_news') {
    try {
      const userId = interaction.user.id;
      // Hier könnte eine Liste oder Datenbank verwendet werden, um den Status zu speichern
      console.log(`${interaction.user.username} hat die Neuigkeiten deaktiviert.`);

      // Antwort auf die Button-Interaktion
      await interaction.update({
        content: 'Du wirst keine weiteren Neuigkeiten per DM erhalten.',
        components: [], // Entferne die Buttons
        ephemeral: true,
      });
    } catch (error) {
      console.error('Fehler bei der Deaktivierung der Neuigkeiten:', error);
      await interaction.reply({ content: 'Es gab einen Fehler beim Deaktivieren der Neuigkeiten.', ephemeral: true });
    }
  }

  if (interaction.customId === 'enable_news') {
    try {
      const userId = interaction.user.id;
      // Hier könnte eine Funktion zum Wiederaktivieren der Neuigkeiten aufgerufen werden
      console.log(`${interaction.user.username} hat die Neuigkeiten wieder aktiviert.`);

      // Antwort auf die Button-Interaktion
      await interaction.update({
        content: 'Du wirst wieder Neuigkeiten per DM erhalten.',
        components: [], // Entferne die Buttons
        ephemeral: true,
      });
    } catch (error) {
      console.error('Fehler bei der Aktivierung der Neuigkeiten:', error);
      await interaction.reply({ content: 'Es gab einen Fehler beim Aktivieren der Neuigkeiten.', ephemeral: true });
    }
  }
};

