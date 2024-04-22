const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give-role')
        .setDescription('» Gebe einem Nutzer eine Rolle. 🎭')
        .addUserOption(option => option.setName('user').setDescription('» Welcher User soll es sein?').setRequired(true))
        .addRoleOption(option => option.setName('rolle').setDescription('» Welche Rolle soll der User bekommen?').setRequired(true)).setRequired(true),

async execute(interaction) {
    // Überprüfen, ob der Nutzer die Berechtigung hat, Rollen zu vergeben
    if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
        return interaction.reply({ content: '> `❌` » Du hast keine Berechtigung, Rollen zu vergeben.', ephemeral: true });
    }

    const targetUser = interaction.options.get('user').value;
    const role = interaction.options.get('role').role;

    // Rollenvergabe
    try {
        const guild = interaction.guild;
        const member = await guild.members.fetch(targetUser);
        await member.roles.add(role);
        interaction.reply({ content: `> \`✅\` » Die <@&${role.name}>-Rolle wurde an <@${member}> vergeben.`, ephemeral: true });
    } catch (error) {
        console.error('Fehler beim Hinzufügen der Rolle:', error);
        interaction.reply({ content: '> `❌` » Ein Fehler ist aufgetreten.', ephemeral: true });
    }
},
};