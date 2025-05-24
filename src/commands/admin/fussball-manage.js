const { SlashCommandBuilder } = require('discord.js');

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
          .setRequired(true)))
    // NEU: Spieler hinzufügen
    .addSubcommand(sub =>
      sub.setName('add-player')
        .setDescription('Füge einen Spieler zu einem Team hinzu')
        .addStringOption(opt =>
          opt.setName('teamname')
          .setDescription('Name des Teams')
          .setRequired(true))
        .addUserOption(opt =>
          opt.setName('spieler')
          .setDescription('Der Spieler, der hinzugefügt werden soll')
          .setRequired(true))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      // ... dein existierender Code ...
    } 
    else if (sub === 'remove') {
      // ... dein existierender Code ...
    }
    else if (sub === 'add-player') {
      const teamName = interaction.options.getString('teamname');
      const user = interaction.options.getUser('spieler');

      const team = await Team.findOne({ name: teamName });
      if (!team) {
        return interaction.reply({
          content: `❌ Team **${teamName}** wurde nicht gefunden.`,
          ephemeral: true,
        });
      }

      // Prüfen, ob Spieler schon im Team ist
      if (team.players.some(p => p.userId === user.id)) {
        return interaction.reply({
          content: `❌ Spieler **${user.tag}** ist bereits im Team **${teamName}**.`,
          ephemeral: true,
        });
      }

      // Spieler hinzufügen
      team.players.push({ userId: user.id, username: user.tag });
      await team.save();

      return interaction.reply({
        content: `✅ Spieler **${user.tag}** wurde zum Team **${teamName}** hinzugefügt.`,
        ephemeral: true,
      });
    }
  }
};
