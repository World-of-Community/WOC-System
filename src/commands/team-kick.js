const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team-kick')
        .setDescription('» Entfernt einen Benutzer aus dem Server-Team. ❌')
        .addUserOption(option => option.setName('user').setDescription('Der Benutzer, der gekickt werden soll.').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('Die Rolle, die entfernt werden soll.').setRequired(true)),

    async execute(interaction) {
        const member = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        const targetChannel = interaction.guild.channels.cache.get('1173986308641804338'); // Kanal-ID einfügen

        if (!member || !role || !targetChannel) {
            return interaction.reply('Fehler beim Verarbeiten des Befehls.');
        }
        
        try {
            await member.roles.remove(role);
            await member.kick();

            const KickEmbed = new EmbedBuilder()
                .setTitle('`❌` | __TEAMMITGLIED ENTFERNT__')
                .setDescription(`Der Nutzer ${member} wurde von ${interaction.user.displayName} aus dem Server-Team **Entfernt**.`)
                .setColor('Red');

            targetChannel.send({ embeds: [KickEmbed] });
            await interaction.reply({ content: '> \`✅\` » Das Teammitglied wurde aus dem Server-Team **Entfernt.**', ephemeral: true });
        } catch (error) {
            console.error('Fehler beim Kicken des Benutzers:', error);
            interaction.reply({ content: `> \`❌\` » Es ist ein Fehler aufgetreten.`, ephemeral: true });
        }
    },
};