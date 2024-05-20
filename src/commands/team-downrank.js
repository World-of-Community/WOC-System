const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team-downrank')
        .setDescription('» Setzt einen Benutzer auf eine niedrigere Rolle. 🔽')
        .addUserOption(option => option.setName('user').setDescription('» Der Benutzer, der herabgestuft werden soll.').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('» Die Rolle, auf die der Benutzer herabgestuft werden soll.').setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.Administrator),

    async execute(interaction) {
        const member = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        const targetChannel = interaction.guild.channels.cache.get('1173986308641804338'); // Kanal-ID einfügen
        
        if (!user || !role || !targetChannel) {
            return interaction.reply('Fehler beim Verarbeiten des Befehls.');
        }
        
        try {
            await member.roles.remove(role);

            const RangUpdateembed = new EmbedBuilder()
                .setTitle('`🔽` | __TEAMMITGLIED RANGUPDATE__')
                .setDescription(`Der Nutzer ${member} wurde auf die Rolle ${role} herabgestuft.`)
                .setColor('Blurple')

            const targetChannel = interaction.guild.channels.cache.get(targetChannel);

            targetChannel.send({ embeds: [RangUpdateembed] });
            await interaction.reply({ content: '> \`✅\` » Das Teammitglied wurde **herabgestuft.**', ephemeral: true });
        } catch (error) {
            console.error('Fehler beim Herabstufen des Benutzers:', error);
            interaction.reply({ content: `> \`❌\` » Es ist ein Fehler aufgetreten.`, ephemeral: true });
        }
    },
};