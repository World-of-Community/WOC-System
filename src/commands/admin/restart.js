const { SlashCommandBuilder, PermissionFlagsBits, Client, GatewayIntentBits } = require('discord.js');

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

        // Sende die Nachricht und speichere Kanal- und Nachrichten-ID
        const message = await interaction.reply({ content: '> `🕒` » Der Bot wird neu gestartet...', fetchReply: true, ephemeral: true });
        lastChannelId = interaction.channel.id;
        lastMessageId = message.id;

        // Bearbeite die Nachricht, dass der Bot wieder online ist
        if (lastChannelId && lastMessageId) {
            try {
                const channel = await client.channels.fetch(lastChannelId);
                const message = await channel.messages.fetch(lastMessageId);

                if (message) {
                    await message.edit({ content: '> `✅` » Der Bot ist wieder online und einsatzbereit.', ephemeral: true });
                }
            } catch (error) {
                console.error('Fehler beim Bearbeiten der Wieder-Online-Nachricht:', error);
            }

            // Variablen zurücksetzen
            //lastChannelId = null;
            //lastMessageId = null;
        }

        // Beende den Prozess nach einer kurzen Verzögerung
        setTimeout(() => {
            process.exit(); // Beendet den Prozess
        }, 2000);
    },
};
