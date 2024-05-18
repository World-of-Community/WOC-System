const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give-role')
        .setDescription('» Gebe einem Nutzer eine Rolle. 🎭')
        .addUserOption(option => option.setName('user').setDescription('» Welcher User soll es sein?').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('» Welche Rolle soll der User bekommen?').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

async execute(interaction) {
    // Überprüfen, ob der Nutzer die Berechtigung hat, Rollen zu vergeben
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
        return interaction.reply({ content: '> `❌` » Du hast keine Berechtigung, Rollen zu vergeben.', ephemeral: true });
    }
    
    const user = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');


    // Rollenvergabe
    try {
        const guild = interaction.guild;
        const member = await guild.members.fetch(user);
        await member.roles.add(role);
        interaction.reply({ content: `> \`✅\` » Die <@&${role.id}>-Rolle wurde an ${member} **vergeben**.`, ephemeral: true });
    } catch (error) {
        console.error('Fehler beim Hinzufügen der Rolle:', error);
        interaction.reply({ content: '> `❌` » Ein Fehler ist aufgetreten.', ephemeral: true });
    }
},
};