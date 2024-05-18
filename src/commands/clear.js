const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('» Lösche eine bestimmte Anzahl von Nachrichten.')
        .addIntegerOption(option => option.setName('nachrichten').setDescription('» Wie viele Nachrichten möchtest du löschen?').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const nachrichtenZuLöschen = interaction.options.getInteger('nachrichten');

        if (!nachrichtenZuLöschen || nachrichtenZuLöschen < 1 || nachrichtenZuLöschen > 100) {
            return interaction.reply('> `❗` » Bitte gib eine Anzahl von Nachrichten zwischen `1 und 100` an.');
        }

        try {
            // Ersetze dies durch deinen tatsächlichen Code zum Löschen von Nachrichten
            await interaction.reply(`> \`✅\` » Es wurden ${nachrichtenZuLöschen} Nachrichten gelöscht.`);
        } catch (error) {
            console.error('Fehler beim Löschen von Nachrichten:', error);
            interaction.reply('> `❗` » Beim Versuch, Nachrichten zu löschen, ist ein Fehler aufgetreten.');
        }
    },
};