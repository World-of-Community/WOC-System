const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday-delete')
        .setDescription('» Lösche den Geburtstag eines Nutzers. 🎂')
        .addUserOption(option => option.setName('user').setDescription('» Welchen Nutzer möchtest du löschen?').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {
        // Überprüfen, ob der ausführende Benutzer Berechtigungen hat
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ content: '`❌` » Du hast keine Berechtigung, diesen Befehl zu verwenden.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const userId = user.id;

        // Geburtstag löschen
        const birthdays = JSON.parse(fs.readFileSync('./birthdays.json', 'utf8'));
        if (birthdays[userId]) {
            delete birthdays[userId];
            fs.writeFileSync('./birthdays.json', JSON.stringify(birthdays, null, 2));
            return interaction.reply({ content: `> \`✅\` » Der Geburtstag von ${user.displayName} wurde gelöscht!`, ephemeral: true });
        } else {
            return interaction.reply({ content: `> \`❌\` » Kein gespeicherter Geburtstag für ${user.displayName} gefunden.`, ephemeral: true });
        }
    },
};