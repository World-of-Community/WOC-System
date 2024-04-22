const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-role')
        .setDescription('» Entferne eine Rolle eines Nutzers. ❌')
        .addRoleOption(option => option.setName('rolle').setDescription('» Die Rolle, die entfernt werden soll.'))
        .addUserOption(option => option.setName('user').setDescription('» Der Nutzer, von dem die Rolle entfernt werden soll.').setRequired(true)),

async execute(interaction) {
    // Prüfe, ob der Benutzer Administrator ist
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
        return interaction.reply({ content: '> `❌` » Du hast nicht die erforderlichen Berechtigungen, um diesen Befehl auszuführen.', ephemeral: true });
    }

    // Hole das Mitglied, dem die Rolle entfernt werden soll
    const member = interaction.options.getMember('user') || interaction.member;

    // Hole die Rolle, die entfernt werden soll
    const role = interaction.options.getRole('rolle');

    try {
        // Entferne die angegebene Rolle vom Mitglied
        await member.roles.remove(role);
        await interaction.reply({ content: `> \`✅\` » Die Rolle <@&${role.name}> wurde von <@${member}> entfernt.`, ephemeral: true });
    } catch (error) {
        console.error('Fehler beim Entfernen der Rolle:', error);
        await interaction.reply({ content: '> `❌` » Es gab einen Fehler beim Entfernen der Rolle.', ephemeral: true });
    } 
},
};