import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { Team, Match, ProLeagueEmbed } from '../../../Datenbank/fussballdb.js';

export default {
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
          .setRequired(true)))
    // Spieler hinzufügen als STRING (kein User)
    .addSubcommand(sub =>
      sub.setName('add-player')
        .setDescription('Füge einen Spieler zu einem Team hinzu')
        .addStringOption(opt =>
          opt.setName('teamname')
          .setDescription('Name des Teams')
          .setRequired(true))
        .addStringOption(opt =>
          opt.setName('spieler')
          .setDescription('Name des Spielers')
          .setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      // ... existierender Code ...
    }
    else if (sub === 'remove') {
      // ... existierender Code ...
    }
    else if (sub === 'add-player') {
      const teamName = interaction.options.getString('teamname');
      const spielerName = interaction.options.getString('spieler');

      const team = await Team.findOne({ name: teamName });
      if (!team) {
        return interaction.reply({
          content: `❌ Team **${teamName}** wurde nicht gefunden.`,
          ephemeral: true,
        });
      }

      if (!team.players) team.players = [];

      if (team.players.includes(spielerName)) {
        return interaction.reply({
          content: `> ⚠️ Spieler **${spielerName}** ist bereits im Team **${teamName}**.`,
          ephemeral: true,
        });
      }

      team.players.push(spielerName);
      await team.save();

      return interaction.reply({
        content: `> \`✅\` Spieler **${spielerName}** wurde zum Team **${teamName}** hinzugefügt.`,
        ephemeral: true,
      });
    }
  }
};
