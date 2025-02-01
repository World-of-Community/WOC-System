const { SlashCommandBuilder } = require('discord.js');
const EventDropAndUser = require("../../../Datenbank/EventDropAndUserdb");  // Das kombinierte EventDropAndUser Schema

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eventdrop')
    .setDescription('Verwalte Event-Drops')
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('» Startet die Gewinn-Drops für das Event. ✅')
        .addChannelOption(option =>
          option.setName('kanal')
            .setDescription('Wähle einen Textkanal für die Event-Drops')
            .setRequired(true)
            .addChannelTypes(0)  // Nur Textkanäle erlauben
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('stop')
        .setDescription('» Stoppt die Gewinn-Drops für das Event. ❌')
        .addChannelOption(option =>
          option.setName('kanal')
            .setDescription('Wähle einen Textkanal für die Event-Drops')
            .setRequired(true)
            .addChannelTypes(0)  // Nur Textkanäle erlauben
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('check')
        .setDescription('» Zeigt die gesammelten Gewinne eines Benutzers an')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('reset')
        .setDescription('» Setzt die Gewinne eines Benutzers zurück')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Benutzer, dessen Gewinne zurückgesetzt werden')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    // Berechtigungsprüfung: Nur Admins oder bestimmte Rollen dürfen ausführen
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply({ content: '> `❌` » Du hast keine Berechtigung, diesen Befehl auszuführen.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const selectedChannel = interaction.options.getChannel('kanal');

    if (selectedChannel && selectedChannel.type !== 'GUILD_TEXT') {
      return interaction.reply({ content: '> `❗` » Bitte wähle einen Textkanal aus.', ephemeral: true });
    }

    try {
      if (subcommand === 'start') {
        // Aktivieren der Event-Drops im ausgewählten Kanal
        await EventDropAndUser.findOneAndUpdate(
          { event: 'active' },
          { status: 'active', channelId: selectedChannel.id },
          { upsert: true }
        );
        return interaction.reply({ content: `> \`✅\` » Die Gewinn-Drops wurden **gestartet** im Kanal ${selectedChannel.name}!`, ephemeral: true });
      }

      if (subcommand === 'stop') {
        // Deaktivieren der Event-Drops im ausgewählten Kanal
        await EventDropAndUser.findOneAndUpdate(
          { event: 'active' },
          { status: 'inactive', channelId: selectedChannel.id }
        );
        return interaction.reply({ content: `> \`✅\` » Die Gewinn-Drops wurden **gestoppt** im Kanal ${selectedChannel.name}!`, ephemeral: true });
      }

      if (subcommand === 'check') {
        // Zeige die gesammelten Gewinne des Benutzers an
        const eventData = await EventDropAndUser.findOne({ event: 'active' });
        if (!eventData) {
          return interaction.reply({ content: '> `❌` » Es läuft aktuell kein Event-Drop.', ephemeral: true });
        }

        const user = eventData.users.find(u => u.userId === interaction.user.id);
        if (!user || !user.eventDrops || user.eventDrops.length === 0) {
          return interaction.reply({ content: '> `❌` » Du hast noch keine Gewinne gesammelt.', ephemeral: true });
        }

        return interaction.reply({ content: `> \`📌\` » Deine gesammelten Gewinne: ${user.eventDrops.join(', ')}`, ephemeral: true });
      }

      if (subcommand === 'reset') {
        // Gewinne des Benutzers zurücksetzen
        const targetUser = interaction.options.getUser('user');
        const eventData = await EventDropAndUser.findOne({ event: 'active' });

        if (!eventData) {
          return interaction.reply({ content: '> `❌` » Es läuft aktuell kein Event-Drop.', ephemeral: true });
        }

        const userToReset = eventData.users.find(u => u.userId === targetUser.id);
        if (!userToReset || !userToReset.eventDrops || userToReset.eventDrops.length === 0) {
          return interaction.reply({ content: '> `❌` » Dieser Benutzer hat keine Gewinne zu resetten.', ephemeral: true });
        }

        // Gewinne zurücksetzen
        userToReset.eventDrops = [];
        await eventData.save();
        return interaction.reply({ content: `> \`✅\` » Die gesammelten Gewinne von ${targetUser.tag} wurden erfolgreich zurückgesetzt.`, ephemeral: true });
      }
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: '> `❌` » Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.', ephemeral: true });
    }
  },
};
