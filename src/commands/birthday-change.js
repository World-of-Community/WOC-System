const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday-change')
        .setDescription('» Ändere den Geburtstag eines Nutzers. 🎂')
        .addUserOption(option => option.setName('user').setDescription('» Welchen Nutzer möchtest du ändern?').setRequired(true))
        .addIntegerOption(option => option.setName('tag').setDescription('» An welchem Tag wurde der Nutzer geboren?').setRequired(true))
        .addIntegerOption(option => option.setName('monat').setDescription('» In welchem Monat wurde der Nutzer geboren?').setRequired(true))
        .addIntegerOption(option => option.setName('jahr').setDescription('» In welchem Jahr wurde der Nutzer geboren?').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        // Überprüfen, ob der ausführende Benutzer Berechtigungen hat
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ content: '`❌` » Du hast keine Berechtigung, diesen Befehl zu verwenden.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const tag = interaction.options.getInteger('tag');
        const monat = interaction.options.getInteger('monat');
        const jahr = interaction.options.getInteger('jahr');
        const userId = user.id;

        // Validierung des Geburtsdatums
        if (!isValidDate(tag, monat, jahr)) {
            return interaction.reply({ content: '`❌` » Bitte gib ein gültiges Datum ein.', ephemeral: true });
        }

        // Geburtstag speichern
        const birthdays = JSON.parse(fs.readFileSync('./birthdays.json', 'utf8'));
        birthdays[userId] = { tag, monat, jahr };
        fs.writeFileSync('./birthdays.json', JSON.stringify(birthdays, null, 2));

        interaction.reply({ content: `> \`✅\` » Der Geburtstag von ${user.displayName} wurde geändert und gespeichert!`, ephemeral: true });
    },
};

function isValidDate(day, month, year) {
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}