const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday-set')
        .setDescription('» Setze deinen Geburtstag. 🎂')
        .addIntegerOption(option => option.setName('tag').setDescription('» An welchen Tag wurdest du geboren?').setRequired(true))
        .addIntegerOption(option => option.setName('monat').setDescription('» In welchen Monat wurdest du geboren?').setRequired(true))
        .addIntegerOption(option => option.setName('jahr').setDescription('» In welchen Jahr wurdest du geboren?').setRequired(false)),

    async execute(interaction) {
        const tag = interaction.options.getInteger('tag');
        const monat = interaction.options.getInteger('monat');
        const jahr = interaction.options.getInteger('jahr');
        const userId = interaction.user.id;

        // Validierung des Geburtsdatums
        if (!isValidDate(tag, monat, jahr)) {
            return interaction.reply({ content: '`❌` » Bitte gib ein gültiges Datum ein.', ephemeral: true });
        }

        // Geburtstag speichern
        const birthdays = JSON.parse(fs.readFileSync('./birthdays.json', 'utf8'));
        birthdays[userId] = { tag, monat, jahr };
        fs.writeFileSync('./birthdays.json', JSON.stringify(birthdays, null, 2));

        interaction.reply({ content: '> `✅` » Dein Geburtstag wurde gespeichert!', ephemeral: true });
    },
};

function isValidDate(day, month, year) {
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}