const { SlashCommandBuilder, PermissionBitField } = require('discord.js');

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

    // Verzögerung prüfen und festlegen
    let delayMs = 0;
    if (delay) {
        try {
            delayMs = ms(delay); // Konvertiere die Zeitangabe (z.B. "5m" zu Millisekunden)
            if (!delayMs) throw new Error('Invalid time format');
        } catch (error) {
            return await interaction.reply({ content: '> `❌` » Bitte gib eine gültige Zeit für die Verzögerung ein (z.B. 10s, 5m, 1h).', ephemeral: true });
        }
    }

    // Nachricht senden, entweder sofort oder mit Verzögerung
    try {
        if (delayMs > 0) {
            await interaction.reply({ content: `> \`⏳\` » Die Nachricht wird in ${delay} gesendet.`, ephemeral: true });
            setTimeout(async () => {
                await channel.send(message);
            }, delayMs);
        } else {
            await channel.send(message);
            await interaction.reply({ content: `> \`✅\` » Die Nachricht wurde erfolgreich gesendet.`, ephemeral: true });
        }
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: `> \`❌\` » Fehler beim Senden der Nachricht.`, ephemeral: true });
    }
  },
};