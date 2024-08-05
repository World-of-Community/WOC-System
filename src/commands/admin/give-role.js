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
    
    const user = interaction.options.getMember('user');
    const role = interaction.options.getRole('role');

    // Rollenvergabe
    try {
        const member = await interaction.guild.members.fetch(user);
        await member.roles.add(role);
        interaction.reply({ content: `> \`✅\` » Die <@&${role.id}>-Rolle wurde an ${member} **vergeben**.`, ephemeral: true });
    } catch (error) {
        console.error('Fehler beim Hinzufügen der Rolle:', error);
        interaction.reply({ content: '> `❌` » Ein Fehler ist aufgetreten.', ephemeral: true });
    }
  },
};