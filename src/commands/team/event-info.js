const { SlashCommandBuilder, PermissionBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('event-info')
        .setDescription('Sende eine Info Event Nachricht. 💬')
        .addChannelOption(option => option.setName('kanal').setDescription('Der Kanal, in den die Nachricht gesendet werden soll').setRequired(true))
        .addStringOption(option => option.setName('nachricht').setDescription('Die Nachricht, die gesendet werden soll').setRequired(true)),

async execute(interaction) {

    // Hole die Kanal- und Nachrichtenoptionen
    const channel = interaction.options.getChannel('kanal');
    const message = interaction.options.getString('nachricht');

    // Überprüfe, ob der angegebene Kanal ein Textkanal ist
    if (!channel || !channel.isTextBased()) {
        return await interaction.reply({ content: '> `❌` » Bitte wähle einen gültigen Textkanal aus.', ephemeral: true });
    }

    // Sende die Nachricht in den ausgewählten Kanal
    try {
        await channel.send(message);
        await interaction.reply({ content: `> \`✅\` » Die Nachricht wurde erfolgreich gesendet.`, ephemeral: true });
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: `> \`❌\` » Fehler beim Senden der Nachricht.`, ephemeral: true });
    }
  },
};