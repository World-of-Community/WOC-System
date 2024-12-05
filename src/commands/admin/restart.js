const { SlashCommandBuilder, PermissionFlagsBits, PermissionBitField } = require('discord.js');

let lastChannelId = null; // Zum Speichern der Kanal-ID
let lastMessageId = null; // Zum Speichern der Nachrichten-ID

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

        await interaction.reply({ content: '> `🕒` » Der Bot wird neu gestartet...', ephemeral: true });

        // Warte kurz, um sicherzustellen, dass die Antwort gesendet wurde
        setTimeout(() => {
            process.exit(); // Beendet den Prozess
        }, 2000);
    },
};
