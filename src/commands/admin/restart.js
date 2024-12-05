const { SlashCommandBuilder, PermissionFlagsBits, Client, GatewayIntentBits } = require('discord.js');

// Globale Variablen für die Speicherung der Kanal- und Nachrichten-ID
let lastChannelId = null;
let lastMessageId = null;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`${client.user.tag} ist online!`);

    // Aktuellen Unix-Timestamp generieren
    const timestamp = Math.floor(Date.now() / 1000);

    // Bearbeite die Nachricht, dass der Bot wieder online ist
    if (lastChannelId && lastMessageId) {
        try {
            const channel = await client.channels.fetch(lastChannelId);
            const message = await channel.messages.fetch(lastMessageId);

            if (message) {
                await message.edit({ content: `> \`✅\` » Der Bot ist wieder online und einsatzbereit. (hochgefahren um <t:${timestamp}:R>)`, ephemeral: true });
            }
        } catch (error) {
            console.error('Fehler beim Bearbeiten der Wieder-Online-Nachricht:', error);
        }

        // Variablen zurücksetzen
        lastChannelId = null;
        lastMessageId = null;
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

        // Aktuellen Unix-Timestamp generieren
        const timestamp = Math.floor(Date.now() / 1000);

        // Sende die Nachricht und speichere Kanal- und Nachrichten-ID
        const message = await interaction.reply({ content: `> \`🕒\` » Der Bot wird neu gestartet... (<t:${timestamp}:R>)`, fetchReply: true, ephemeral: true });
        lastChannelId = interaction.channel.id;
        lastMessageId = message.id;

        // Beende den Prozess nach einer kurzen Verzögerung
        setTimeout(() => {
            process.exit(); // Beendet den Prozess
        }, 2000);
    },
};
