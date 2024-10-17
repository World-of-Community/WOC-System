const { SlashCommandBuilder, PermissionFlagsBits, PermissionBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nick')
        .setDescription('» Verwalte deinen Nicknamen.')
        .addSubcommand(subcommand => subcommand.setName('set').setDescription('» Ändere deinen Nicknamen. 📌')
        .addStringOption(option =>  option.setName('name').setDescription('Der neue Nickname').setRequired(true)))
        .addSubcommand(subcommand => subcommand.setName('remove').setDescription('» Entferne deinen Nicknamen und setze ihn auf den Standard zurück. 📌'))
        .setDefaultMemberPermissions(PermissionFlagsBits.setNickname),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'set') {
            const newNick = interaction.options.getString('name');

            try {
                await interaction.member.setNickname(newNick);
                await interaction.reply({ content: `> \`✅\` » Dein Nickname wurde zu **${newNick}** geändert!`, ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '> `❌` » Ich konnte deinen Nickname nicht ändern. Stelle sicher, dass ich die erforderlichen Berechtigungen habe.', ephemeral: true });
            }
        } else if (subcommand === 'remove') {
            try {
                await interaction.member.setNickname(null); // Setzt den Nicknamen auf den Standard zurück
                await interaction.reply({ content: '> `✅` » Dein Nickname wurde erfolgreich zurückgesetzt!', ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '> `❌` » Ich konnte deinen Nickname nicht zurücksetzen. Stelle sicher, dass ich die erforderlichen Berechtigungen habe.', ephemeral: true });
            }
        }
    },
};
