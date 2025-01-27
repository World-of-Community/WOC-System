const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('» Zeigt eine Liste von Benutzern mit einer bestimmten Rolle an. 🎭')
        .addRoleOption(option => option.setName('rolle').setDescription('Die Rolle, die abgefragt werden soll').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const role = interaction.options.getRole('rolle');
        const membersWithRole = interaction.guild.members.cache.filter(member => member.roles.cache.has(role.id));

        if (membersWithRole.size === 0) {
            return interaction.reply({ content: `> \`❌\` » Es gibt keine Mitglieder mit der Rolle ${role}`, ephemeral: true });
        }

        const memberList = membersWithRole.map(member => member.user.username).join('\n');
        return interaction.reply({ content: `Benutzer mit der Rolle **${role}**:\n${memberList}`, ephemeral: true });
    },
};
