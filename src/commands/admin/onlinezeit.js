const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const onlineMap = require("../../Maps/onlinemap");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('onlinezeit-manage')
    .setDescription('» Verwalte die Onlinezeit eines Nutzers.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub.setName('add')
        .setDescription('» Onlinezeit hinzufügen.')
        .addUserOption(opt => opt.setName('nutzer').setDescription('» Nutzer').setRequired(true))
        .addIntegerOption(opt => opt.setName('stunden').setDescription('» Stunden hinzufügen').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('remove')
        .setDescription('» Onlinezeit entfernen.')
        .addUserOption(opt => opt.setName('nutzer').setDescription('» Nutzer').setRequired(true))
        .addIntegerOption(opt => opt.setName('stunden').setDescription('» Stunden entfernen').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('set')
        .setDescription('» Onlinezeit festlegen.')
        .addUserOption(opt => opt.setName('nutzer').setDescription('» Nutzer').setRequired(true))
        .addIntegerOption(opt => opt.setName('stunden').setDescription('» Neue Onlinezeit (in Stunden)').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('edit')
        .setDescription('» Onlinezeit manuell verändern.')
        .addUserOption(opt => opt.setName('nutzer').setDescription('» Nutzer').setRequired(true))
        .addIntegerOption(opt =>
          opt.setName('millisekunden')
            .setDescription('» Wert (positiv oder negativ) in Millisekunden')
            .setRequired(true))
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser('nutzer');
    const userData = await userdb.findOne({ userID: user.id }) || new userdb({ userID: user.id, onlineTime: 0 });

    let message = '';

    switch (subcommand) {
      case 'add': {
        const hours = interaction.options.getInteger('stunden');
        const ms = hours * 3600000;
        userData.onlineTime += ms;
        message = `> \`✅\` » ${user} wurde eine Onlinezeit von \`${hours}h\` hinzugefügt.`;
        break;
      }

      case 'remove': {
        const hours = interaction.options.getInteger('stunden');
        const ms = hours * 3600000;
        userData.onlineTime = Math.max(0, userData.onlineTime - ms);
        message = `> \`✅\` » \`${hours}h\` von der Onlinezeit von ${user.username} entfernt.`;
        break;
      }

      case 'set': {
        const hours = interaction.options.getInteger('stunden');
        const ms = hours * 3600000;
        userData.onlineTime = ms;
        message = `> \`✅\` » Die Onlinezeit von ${user} wurde auf \`${hours}h\` gesetzt.`;
        break;
      }

      case 'edit': {
        const ms = interaction.options.getInteger('millisekunden');
        userData.onlineTime += ms;
        if (userData.onlineTime < 0) userData.onlineTime = 0;
        const totalHours = Math.floor(userData.onlineTime / 3600000);
        const sign = ms >= 0 ? 'hinzugefügt' : 'abgezogen';
        message = `> \`✅\` » Onlinezeit von ${user} wurde um \`${ms}ms\` ${sign}. Neue Onlinezeit: \`${totalHours}h\`.`;
        break;
      }
    }

    // 🟩 Immer aktualisieren: letzte Aktivität auf jetzt setzen
    userData.lastOnline = new Date();

    await userData.save();
    await interaction.reply({ content: message, ephemeral: true });
  }
};
