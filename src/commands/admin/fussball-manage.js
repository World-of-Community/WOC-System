const { SlashCommandBuilder } = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb'); // Pfad anpassen
const fs = require('fs');
const path = require('path');

// Optional: Teamicons persistent in JSON-Datei speichern
const teamIconPath = path.join(__dirname, '../../../json/teamIcons.json');
let teamIcons = fs.existsSync(teamIconPath) ? require(teamIconPath) : {};

function saveIcons() {
  fs.writeFileSync(teamIconPath, JSON.stringify(teamIcons, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-manage')
    .setDescription('Verwalte Fußballteams')
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('Füge ein Fußballteam hinzu')
        .addStringOption(opt =>
          opt.setName('teamname')
            .setDescription('Name des Teams')
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('emoji')
            .setDescription('Emoji/Icon für das Team')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('Entferne ein Fußballteam')
        .addStringOption(opt =>
          opt.setName('teamname')
            .setDescription('Name des Teams')
            .setRequired(true))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const teamName = interaction.options.getString('teamname');

    if (sub === 'add') {
      const emoji = interaction.options.getString('emoji');

      const exists = await Team.findOne({ name: teamName });
      if (exists) {
        return interaction.reply({
          content: `❌ Team **${teamName}** existiert bereits.`,
          ephemeral: true,
        });
      }

      const newTeam = new Team({
        name: teamName,
        league: 'Pro League',
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        yellowCards: 0,
        redCards: 0
      });

      await newTeam.save();
      teamIcons[teamName] = emoji;
      saveIcons();

      return interaction.reply({
        content: `✅ Team **${teamName}** mit Emoji ${emoji} wurde zur Pro League hinzugefügt.`,
        ephemeral: true,
      });
    }

    if (sub === 'remove') {
      const deleted = await Team.findOneAndDelete({ name: teamName });
      if (!deleted) {
        return interaction.reply({
          content: `❌ Team **${teamName}** wurde nicht gefunden.`,
          ephemeral: true,
        });
      }

      if (teamIcons[teamName]) {
        delete teamIcons[teamName];
        saveIcons();
      }

      return interaction.reply({
        content: `🗑️ Team **${teamName}** wurde erfolgreich entfernt.`,
        ephemeral: true,
      });
    }
  }
};
