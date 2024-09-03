const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-role')
        .setDescription('» Entferne eine Rolle eines Nutzers. ❌')
        .addUserOption(option => option.setName('user').setDescription('» Der Nutzer, von dem die Rolle entfernt werden soll.').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('» Die Rolle, die entfernt werden soll.').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

async execute(interaction) {

    const member = interaction.options.getMember('user') || interaction.member;
    const role = interaction.options.getRole('role');

    try {
        // Entferne die angegebene Rolle vom Mitglied
        await member.roles.remove(role);
        await interaction.reply({ content: `> \`✅\` » Die Rolle <@&${role.id}> wurde von ${member} **entfernt**.`, ephemeral: true });
    } catch (error) {
        console.error('Fehler beim Entfernen der Rolle:', error);
        await interaction.reply({ content: '> `❌` » Es gab einen Fehler beim Entfernen der Rolle.', ephemeral: true });
    } 
},
};