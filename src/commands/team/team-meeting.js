const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const Meeting = require('../../../Datenbank/meetingdb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('team-meeting')
    .setDescription('Verwaltet Team-Meetings')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(sub =>
      sub.setName('create')
        .setDescription('» Erstellt ein neues Team-Meeting. ➕')
        .addStringOption(opt => opt.setName('beschreibung').setDescription('Beschreibung des Team-Meetings').setRequired(true))
        .addStringOption(opt => opt.setName('datum').setDescription('Datum des Team-Meetings (z.b. 25.05.2025 12:00)').setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('edit')
        .setDescription('» Editiert ein Team-Meeting. ✍️')
        .addStringOption(opt => opt.setName('beschreibung').setDescription('Neue Beschreibung').setRequired(true))
        .addStringOption(opt => opt.setName('datum').setDescription('Neues Datum').setRequired(true))
        .addStringOption(opt => opt.setName('messageid').setDescription('ID des Team-Meeting-Embeds').setRequired(false)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('» Löscht ein Team-Meeting. 🗑️')
        .addStringOption(opt => opt.setName('messageid').setDescription('ID des Team-Meeting-Embeds').setRequired(false))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'create') {
      const description = interaction.options.getString('beschreibung');
      const datum = interaction.options.getString('datum');

      const dateObj = new Date(datum);
      if (isNaN(dateObj.getTime())) {
        return interaction.reply({ content: '> `❌` » Ungültiges Datum.', ephemeral: true });
      }
      const unixTimestamp = Math.floor(dateObj.getTime() / 1000);

      const embed = new EmbedBuilder()
        .setTitle('`📅` Eine Team-Besprechung wurde geplant')
        .setDescription(
          `> **Datum:** <t:${unixTimestamp}:F>\n` +
          `> **Beschreibung:** ${description || 'Keine Beschreibung angegeben.'}`
        )
        .setColor('Orange')
        .setFooter({ text: `Team-Besprechung von ${interaction.member ? interaction.member.displayName : interaction.user.tag}` });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('meeting_join')
          .setLabel('Teilnehmen')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('meeting_leave')
          .setLabel('Nicht teilnehmen')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('meeting_show')
          .setLabel('Teilnehmer')
          .setStyle(ButtonStyle.Primary),
      );

      const channel = interaction.channel;
      const message = await channel.send({ embeds: [embed], components: [row] });

      const newMeeting = new Meeting({
        guildId: interaction.guildId,
        channelId: channel.id,
        messageId: message.id,
        description,
        time: datum,
        participants: [],
        nonParticipants: [],
      });
      await newMeeting.save();

      await interaction.reply({ content: '> `✅` » Team-Meeting wurde erfolgreich erstellt!', ephemeral: true });
    }
    else if (sub === 'edit') {
      const description = interaction.options.getString('beschreibung');
      const datum = interaction.options.getString('datum');
      const messageId = interaction.options.getString('messageid');

      const dateObj = new Date(datum);
      if (isNaN(dateObj.getTime())) {
        return interaction.reply({ content: '> `❌` » Ungültiges Datum.', ephemeral: true });
      }
      const unixTimestamp = Math.floor(dateObj.getTime() / 1000);

      let meeting;
      if (messageId) {
        meeting = await Meeting.findOne({ guildId: interaction.guildId, messageId });
      } else {
        meeting = await Meeting.findOne({ guildId: interaction.guildId }).sort({ _id: -1 });
      }

      if (!meeting) return interaction.reply({ content: '> `❌` » Kein Team-Meeting gefunden.', ephemeral: true });

      meeting.description = description;
      meeting.time = datum;
      await meeting.save();

      const channel = await interaction.guild.channels.fetch(meeting.channelId);
      const msg = await channel.messages.fetch(meeting.messageId);

      const embed = new EmbedBuilder()
        .setTitle('`📅` Team-Meeting (bearbeitet)')
        .setDescription(description)
        .addFields({ name: 'Datum', value: `<t:${unixTimestamp}:f>`, inline: false })
        .setColor('Blue')
        .setFooter({ text: `Meeting von ${interaction.user.tag}` });

      await msg.edit({ embeds: [embed] });

      await interaction.reply({ content: '> `✅` » Team-Meeting wurde erfolgreich bearbeitet!', ephemeral: true });
    }
    else if (sub === 'remove') {
      const messageId = interaction.options.getString('messageid');

      let meeting;
      if (messageId) {
        meeting = await Meeting.findOne({ guildId: interaction.guildId, messageId });
      } else {
        meeting = await Meeting.findOne({ guildId: interaction.guildId }).sort({ _id: -1 });
      }
      if (!meeting) return interaction.reply({ content: '> `❌` » Kein Team-Meeting gefunden.', ephemeral: true });

      const channel = await interaction.guild.channels.fetch(meeting.channelId);
      try {
        const msg = await channel.messages.fetch(meeting.messageId);
        await msg.delete();
      } catch {}

      await meeting.deleteOne();

      await interaction.reply({ content: '> `✅` » Team-Meeting wurde erfolgreich gelöscht!', ephemeral: true });
    }
  },
};
