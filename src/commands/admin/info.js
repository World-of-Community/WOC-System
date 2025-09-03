const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

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

        // Erstelle die Liste der Mitglieder mit der Rolle
        const memberList = membersWithRole.map(member => member.toString()).join('\n> ');

        // Erstelle das Embed mit der Anzahl und den Mitgliedern
        const InfoEmbed = new EmbedBuilder()
            .setDescription(`**Benutzer mit der Rolle:** ${role} (\`${membersWithRole.size}👥\`\n\n> ${memberList || 'Keine Benutzer gefunden.'}`)
            .setColor('Blurple');

        // Sende das Embed
        return interaction.reply({ embeds: [InfoEmbed], ephemeral: true });
    },
};
