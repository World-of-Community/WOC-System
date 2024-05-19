const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team-kick')
        .setDescription('» Entfernt einen Benutzer aus dem Server-Team. ❌')
        .addUserOption(option => option.setName('user').setDescription('» Der Benutzer, der entfernt werden soll.').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('» Die Rolle, die entfernt werden soll.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('» Der Grund für das Entfernen aus dem Team.').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const member = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        const reason = interaction.options.getString('reason') || 'Kein Grund angegeben';
        const targetChannel = interaction.guild.channels.cache.get('1173986308641804338'); // Kanal-ID einfügen

        if (!member || !role || !targetChannel) {
            return interaction.reply('Fehler beim Verarbeiten des Befehls.');
        }
        
        try {
            // Entferne die Rolle und kicke den Benutzer
            await member.roles.remove(role);

            // Erstelle das Embed für die DM
            const dmEmbed = new EmbedBuilder()
                .setTitle('`❗` | __DU WURDEST AUS DEM SERVER-TEAM ENTLASSEN__')
                .setDescription(`Hallo ${member}, Du wurdest aus dem Server-Team entlassen.\n\nGrund: \`${reason}\``)
                .setColor('Red');

            // Sende eine DM an den Benutzer
            try {
                await member.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.error('Fehler beim Senden der DM:', dmError);
            }

            // Erstelle das Embed mit den Informationen über den Kick
            const kickEmbed = new EmbedBuilder()
                .setTitle('`❌` | __TEAMMITGLIED ENTFERNT__')
                .setDescription(`Der Nutzer ${member} wurde von ${interaction.user.displayName} aus dem Server-Team **Entfernt**.\n\nGrund: \`${reason}\``)
                .setColor('Red');

            targetChannel.send({ embeds: [kickEmbed] });
            await interaction.reply({ content: '> \`✅\` » Das Teammitglied wurde aus dem Server-Team **Entfernt.**', ephemeral: true });
        } catch (error) {
            console.error('Fehler beim Kicken des Benutzers:', error);
            interaction.reply({ content: `> \`❌\` » Es ist ein Fehler aufgetreten.`, ephemeral: true });
        }
    },
};