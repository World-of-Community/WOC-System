const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const NewsStatus = require("../../../Datenbank/newsdb");

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
      .setColor('Orange')
      .setTimestamp();

    // Sende Nachricht im angegebenen Kanal
    await kanal.send({ embeds: [embed] });

    // Button für die Deaktivierung der Benachrichtigungen
    const disableButton = new ButtonBuilder()
      .setCustomId('disable_news')
      .setLabel('Neuigkeiten Deaktivieren')
      .setEmoji('🔕')
      .setStyle(ButtonStyle.Danger); // Danger-Stil für den Button

    const enableButton = new ButtonBuilder()
      .setCustomId('enable_news')
      .setLabel('Neuigkeiten Aktivieren')
      .setEmoji('🔔')
      .setStyle(ButtonStyle.Success); // Success-Stil für den Button

    const row = new ActionRowBuilder().addComponents(disableButton, enableButton);

    // Sende DM nur an den Benutzer, der den Befehl ausführt
    try {
      const dmChannel = await interaction.user.createDM();
      const embedToSend = new EmbedBuilder()
        .setTitle(title) // Setzt den Titel der Nachricht
        .setDescription(nachricht.replace(/\\n/g, '\n')) // Ersetze \n mit echten Zeilenumbrüchen
        .setColor('Orange')
        .setTimestamp();

      await dmChannel.send({
        embeds: [embedToSend],
        components: [row], // Beide Buttons (Deaktivieren/Aktivieren) hinzufügen
      });

      // Bestätigung der Interaktion
      await interaction.reply({ content: '> `📰` » Die Neuigkeiten wurden an dich gesendet!', ephemeral: true });
    } catch (error) {
      console.error(`Fehler beim Senden der DM an ${interaction.user.username}:`, error);
      await interaction.reply({ content: '> `❌` » Es gab einen Fehler beim Senden der Nachricht per DM.', ephemeral: true });
    }
  },
};

// Interaktion für den Button
module.exports.buttonInteraction = async (interaction) => {
  const userId = interaction.user.id;
  try {
    // Hole den News-Status des Benutzers aus der DB
    const newsStatus = await NewsStatus.findOne({ userId });

    if (interaction.customId === 'disable_news') {
      if (newsStatus) {
        newsStatus.isNewsEnabled = false;
        await newsStatus.save(); // Speichere den Status in der DB
      } else {
        // Wenn der Benutzer noch keinen Eintrag hat, erstelle einen
        await NewsStatus.create({ userId, isNewsEnabled: false });
      }

      await interaction.reply({ content: '> `🔕` » Du wirst keine weiteren Neuigkeiten per DM erhalten.', ephemeral: true });
    }

    if (interaction.customId === 'enable_news') {
      if (newsStatus) {
        newsStatus.isNewsEnabled = true;
        await newsStatus.save(); // Speichere den Status in der DB
      } else {
        // Wenn der Benutzer noch keinen Eintrag hat, erstelle einen
        await NewsStatus.create({ userId, isNewsEnabled: true });
      }

      await interaction.reply({ content: '> `🔔` » Du wirst wieder Neuigkeiten per DM erhalten.', ephemeral: true });
    }
  } catch (error) {
    console.error('Fehler bei der Verarbeitung der Button-Interaktion:', error);
    await interaction.reply({ content: '> `❌` » Es gab einen Fehler bei der Verarbeitung der Interaktion.', ephemeral: true });
  }
};
