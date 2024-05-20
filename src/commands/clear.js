const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('» Lösche eine bestimmte Anzahl von Nachrichten. 🗑️')
        .addIntegerOption(option => option.setName('anzahl').setDescription('» Wie viele Nachrichten möchtest du löschen?').setRequired(true))
        .addChannelOption(option => option.setName('kanal').setDescription('» In welchen Kanal soll gelöscht werden?').setRequired(false))
        .addStringOption(option => option.setName('grund').setDescription('» Wie lautet die Begründung?').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Korrigierte Berechtigung

    async execute(interaction) {
        const messagedelete = interaction.options.getInteger('anzahl');
        const kanal = interaction.options.getChannel('kanal') || interaction.channel; // Verwendet aktuellen Kanal, wenn keiner angegeben ist
        const grund = interaction.options.getString('grund') || 'Kein Grund angegeben';

        if (messagedelete < 1 || messagedelete > 100) {
            return interaction.reply({ content: '> `❗` » Bitte gib eine Anzahl von Nachrichten zwischen `1 und 100` an.', ephemeral: true });
        }

        try {
            const messages = await kanal.bulkDelete(messagedelete, true);
            const infomessagedeleteembed = new EmbedBuilder()
                .setDescription(`> \`✅\` » Es wurden \`${messages.size}\` Nachrichten gelöscht.\n\nHier ist eine Übersicht des Vorgangs:\n- Anzahl: \`${messages.size}\`\n- Kanal: ${kanal}\n- Grund: \`${grund}\``)
                .setColor('Blurple')
                .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
                .setTimestamp();

            await interaction.reply({ embeds: [infomessagedeleteembed], ephemeral: true });
        } catch (error) {
            console.error('Fehler beim Löschen von Nachrichten:', error);
            interaction.reply({ content: '> `❗` » Beim Versuch, Nachrichten zu löschen, ist ein Fehler aufgetreten.', ephemeral: true });
        }
    },
};