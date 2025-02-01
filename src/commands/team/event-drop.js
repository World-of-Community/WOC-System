const { SlashCommandBuilder } = require('discord.js');
const EventDropAndUser = require("../../../Datenbank/EventDropAndUserdb");

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

    if (subcommand === 'start') {
      // Aktivieren der Event-Drops im ausgewählten Kanal
      await EventDropAndUser.findOneAndUpdate({ event: 'active' }, { status: 'active', channelId: selectedChannel.id }, { upsert: true });
      return interaction.reply({ content: `> \`✅\` » Die Gewinn-Drops wurden **gestartet** im Kanal ${selectedChannel.name}!`, ephemeral: true });
    }

    if (subcommand === 'stop') {
      // Deaktivieren der Event-Drops im ausgewählten Kanal
      await EventDropAndUser.findOneAndUpdate({ event: 'active' }, { status: 'inactive', channelId: selectedChannel.id });
      return interaction.reply({ content: `> \`✅\` » Die Gewinn-Drops wurden **gestoppt** im Kanal ${selectedChannel.name}!`, ephemeral: true });
    }

    if (subcommand === 'check') {
      // Zeige die gesammelten Gewinne des Benutzers an
      const user = await EventDropAndUser.findOne({ userId: interaction.user.id });
      if (!user || !user.eventDrops || user.eventDrops.length === 0) {
        return interaction.reply({ content: '> `❌` » Du hast noch keine Gewinne gesammelt.', ephemeral: true });
      }
      return interaction.reply({ content: `> \`📌\` » Deine gesammelten Gewinne: ${user.eventDrops.join(', ')}`, ephemeral: true });
    }

    if (subcommand === 'reset') {
      // Gewinne des Benutzers zurücksetzen
      const targetUser = interaction.options.getUser('user');
      const userToReset = await EventDropAndUser.findOne({ userId: targetUser.id });

      if (!userToReset || !userToReset.eventDrops || userToReset.eventDrops.length === 0) {
        return interaction.reply({ content: '> `❌` » Dieser Benutzer hat keine Gewinne zu resetten.', ephemeral: true });
      }

      userToReset.eventDrops = [];
      await userToReset.save();
      return interaction.reply({ content: `> \`✅\` » Die gesammelten Gewinne von ${targetUser.tag} wurden erfolgreich zurückgesetzt.`, ephemeral: true });
    }

    // Preis zufällig aus den Levels 1 bis 5 auswählen
    if (subcommand === 'event') {
      const levels = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      const user = await EventDropAndUser.findOne({ userId: interaction.user.id });

      // Gewinne speichern
      if (!user) {
        const newUser = new EventDropAndUser({
          userId: interaction.user.id,
          eventDrops: [randomLevel],
        });
        await newUser.save();
      } else {
        user.eventDrops.push(randomLevel);
        await user.save();
      }

      return interaction.reply({ content: `> \`🏆\` » Du hast **${randomLevel}** gewonnen!`, ephemeral: true });
    }
  },
};
