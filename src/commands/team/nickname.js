const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nick')
        .setDescription('» Verwalte Nicknamen.')
        .addSubcommand(subcommand => 
            subcommand.setName('set')
                .setDescription('» Ändere den Nicknamen eines Benutzers. 📌')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('Der Benutzer, dessen Nickname geändert werden soll')
                        .setRequired(false))
                .addStringOption(option => 
                    option.setName('name')
                        .setDescription('Der neue Nickname')
                        .setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand.setName('remove')
                .setDescription('» Entferne den Nicknamen eines Benutzers und setze ihn auf den Standard zurück. 📌')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('Der Benutzer, dessen Nickname zurückgesetzt werden soll')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const targetUser = interaction.options.getMember('user') || interaction.member; // Nimmt den ausführenden Benutzer, falls kein Zielbenutzer angegeben ist.

        if (subcommand === 'set') {
            const newNick = interaction.options.getString('name');
            try {
                await targetUser.setNickname(newNick);
                await interaction.reply({ content: `> \`✅\` » Der Nickname von ${targetUser} wurde zu \`${newNick}\` geändert!`, ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '> `❌` » Ich konnte den Nicknamen nicht ändern. Stelle sicher, dass ich die erforderlichen Berechtigungen habe.', ephemeral: true });
            }
        } else if (subcommand === 'remove') {
            try {
                await targetUser.setNickname(null); // Setzt den Nicknamen auf den Standard zurück
                await interaction.reply({ content: `> \`✅\` » Der Nickname von ${targetUser} wurde erfolgreich zurückgesetzt!`, ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '> `❌` » Ich konnte den Nicknamen nicht zurücksetzen. Stelle sicher, dass ich die erforderlichen Berechtigungen habe.', ephemeral: true });
            }
        }
    },
};
