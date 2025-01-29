const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const NewsStatus = require("../../../Datenbank/newsdb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('news')
    .setDescription('» Sendet eine Nachricht mit einem Titel im Kanal und per DM an alle Mitglieder. 📰')
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
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const nachricht = interaction.options.getString('nachricht');
    const kanal = interaction.options.getChannel('kanal');
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(nachricht.replace(/\\n/g, '\n'))
      .setColor('Orange')
      .setFooter({ text: `${guild.name} - Neuigkeiten System`, iconURL: `${guild.iconURL()}`})
      .setTimestamp();

    // Nachricht im Kanal senden
    await kanal.send({ embeds: [embed] });

    // Button für das Deaktivieren/Aktivieren von News
    const disableButton = new ButtonBuilder()
      .setCustomId('disable_news')
      .setLabel('Neuigkeiten Deaktivieren')
      .setEmoji('🔕')
      .setStyle(ButtonStyle.Secondary);

    const enableButton = new ButtonBuilder()
      .setCustomId('enable_news')
      .setLabel('Neuigkeiten Aktivieren')
      .setEmoji('🔔')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(disableButton, enableButton);

    // Nachricht per DM an alle Mitglieder senden
    const members = await guild.members.fetch();
    let dmSentCount = 0;
    let dmFailedCount = 0;

    for (const member of members.values()) {
      if (member.user.bot) continue; // Keine Bots anschreiben
      
      const newsStatus = await NewsStatus.findOne({ userId: member.id });
      if (newsStatus && !newsStatus.isNewsEnabled) continue; // Überspringe, falls deaktiviert

      try {
        const dmChannel = await member.user.createDM();
        await dmChannel.send({ embeds: [embed], components: [row] });
        dmSentCount++;
      } catch (error) {
        console.error(`Fehler beim Senden der DM an ${member.user.username}:`, error);
        dmFailedCount++;
      }
    }

    await interaction.reply({ 
      content: `> \`📰\` » Die Neuigkeiten wurden an \`${dmSentCount}👥\` Mitglieder gesendet. An \`${dmFailedCount}👥\` konnten nicht erreicht werden.`,
      ephemeral: true 
    });
  },
};
