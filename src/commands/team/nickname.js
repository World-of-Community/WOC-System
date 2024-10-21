const { SlashCommandBuilder, PermissionFlagsBits, PermissionBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nick')
        .setDescription('Verwalte Nicknamen für Benutzer')
        .addSubcommand(subcommand => subcommand.setName('set').setDescription('Setze einen neuen Nicknamen für einen Benutzer')
        .addStringOption(option =>  option.setName('nickname').setDescription('Der neue Nickname').setRequired(true))
        .addUserOption(option =>  option.setName('benutzer').setDescription('Der Benutzer, dessen Nickname geändert werden soll').setRequired(false)))
        .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Entferne den Nicknamen eines Benutzers')
        .addUserOption(option =>  option.setName('benutzer').setDescription('Der Benutzer, dessen Nickname entfernt werden soll').setRequired(false)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageNickNames),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('benutzer') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        if (!member) {
            return interaction.reply({ content: '> `❌` » Benutzer nicht gefunden.', ephemeral: true });
        }

        try {
            if (subcommand === 'set') {
                const nickname = interaction.options.getString('nickname');
                await member.setNickname(nickname);
                await interaction.reply({ content: `> \`✅\` » Der Nickname von \`${user.username}\` wurde erfolgreich auf \`${nickname}\` gesetzt.`, ephemeral: true });
            } else if (subcommand === 'remove') {
                await member.setNickname(null); // Setzt den Nicknamen zurück
                await interaction.reply(`> \`✅\` » Der Nickname von ${user.username} wurde erfolgreich entfernt.`);
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '> `❌` » Ich habe keine Berechtigung, den Nicknamen dieses Benutzers zu ändern.', ephemeral: true });
        }
    }
};
