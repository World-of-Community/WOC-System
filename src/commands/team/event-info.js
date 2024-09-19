const { SlashCommandBuilder, PermissionBitField } = require('discord.js');
const ms = require('ms'); // Falls du eine Zeit wie "5m" oder "10s" akzeptieren möchtest

module.exports = {
    data: new SlashCommandBuilder()
        .setName('event-info')
        .setDescription('» Sende eine Info Event Nachricht. 💬')
        .addChannelOption(option => option.setName('kanal').setDescription('Der Kanal, in den die Nachricht gesendet werden soll').setRequired(true))
        .addStringOption(option => option.setName('nachricht').setDescription('Die Nachricht, die gesendet werden soll').setRequired(true))
        .addStringOption(option =>  option.setName('starten').setDescription('Wann soll die Nachricht gesendet werden? (z.B. 5s, 10m, 1h)').setRequired(false)),

async execute(interaction) {

    // Hole die Kanal- und Nachrichtenoptionen
    const channel = interaction.options.getChannel('kanal');
    const message = interaction.options.getString('nachricht');
    const delay = interaction.options.getString('starten'); // Zeitstring für Verzögerung

    // Zeit umwandeln
    const delayMs = ms(delay);
    if (!delayMs) {
        return await interaction.reply({ content: '> `❌` » Bitte gib eine gültige Zeit für die Verzögerung ein (z.B. 10s, 5m, 1h).', ephemeral: true });
    }

    // Berechnung des Enddatums
    const endDate = new Date(Date.now() + delayMs);
    const timestamp = Math.floor(endDate / 1000); // Unix-Timestamp für Discord

    // Erste Nachricht mit Timestamp senden
    await interaction.reply({ content: `> \`⏳\` » Die Nachricht wird <t:${timestamp}:R> gesendet.`, ephemeral: true });

    // Countdown mit Verzögerung
    setTimeout(async () => {
        await channel.send(message);
        await interaction.editReply({ content: `> \`✅\` » Die Nachricht wurde erfolgreich gesendet.`, ephemeral: true });
    }, delayMs);
  },
};