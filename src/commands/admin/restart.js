const { SlashCommandBuilder, PermissionFlagsBits, Client, GatewayIntentBits } = require('discord.js');

// Globale Variablen zum Speichern der Kanal- und Nachrichten-ID
let lastChannelId = null;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`${client.user.tag} ist online!`);

    // Sende die Nachricht, dass der Bot wieder online ist
    if (lastChannelId) {
        try {
            const channel = await client.channels.fetch(lastChannelId);

            if (channel) {
                await channel.send('> `✅` » Der Bot ist wieder online und einsatzbereit.');
            }
        } catch (error) {
            console.error('Fehler beim Senden der Wieder-Online-Nachricht:', error);
        }

        // Variablen zurücksetzen
        lastChannelId = null;
    }
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('» Startet den Bot neu.')
        .addStringOption(option =>
            option.setName('bestätigung')
                .setDescription('Bestätige mit "ja"')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const confirmation = interaction.options.getString('bestätigung');

        if (confirmation !== 'ja') {
            return interaction.reply({ content: '> `❗` » Du musst mit "ja" bestätigen, um den Bot neu zu starten.', ephemeral: true });
        }

        // Speichere die Kanal-ID für die spätere Verwendung
        lastChannelId = interaction.channel.id;

        await interaction.reply({ content: '> `🕒` » Der Bot wird neu gestartet...' });

        // Beende den Prozess nach einer kurzen Verzögerung
        setTimeout(() => {
            process.exit(); // Beendet den Prozess
        }, 2000);
    },
};
