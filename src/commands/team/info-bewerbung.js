const { SlashCommandBuilder, PermissionBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info-bewerbung')
        .setDescription('» Sendet eine Info Bewerbungsnachricht. 💬'),

async execute(interaction) {
     
    await interaction.channel.send('Das Zuständige Teammitglied wird sich zeitnah darum kümmern, wir bitten daher um Geduld.', );

    await interaction.reply({ content: `> \`✅\` » Die Nachricht wurde erfolgreich gesendet`, ephemeral: true })
  },
};