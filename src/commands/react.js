const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('react')
        .setDescription('» Reagiere auf eine Nachricht mit Emojis.')
        .addStringOption(option => option.setName('nachrichtid').setDescription('» Die ID der Nachricht.').setRequired(true))
        .addStringOption(option => option.setName('emoji1').setDescription('» Das erste Emoji.').setRequired(true))
        .addStringOption(option => option.setName('emoji2').setDescription('» Das zweite Emoji.').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Updated permission

    async execute(interaction) {
        const messageId = interaction.options.getString('nachrichtid');
        const emoji1 = interaction.options.getString('emoji1');
        const emoji2 = interaction.options.getString('emoji2');

        try {
            const targetMessage = await interaction.channel.messages.fetch(messageId);
            await targetMessage.react(emoji1);

            if (emoji2) {
                await targetMessage.react(emoji2);
            }

            interaction.reply({ content: '> `✅` » Reaktion erfolgreich hinzugefügt.', ephemeral: true });
        } catch (error) {
            console.error('Fehler beim Reagieren auf die Nachricht:', error);

            let errorMessage = '> `❗` » Beim Versuch, auf die Nachricht zu reagieren, ist ein Fehler aufgetreten.';
            if (error.code === 10008) { // Unknown Message
                errorMessage = '> `❗` » Die Nachricht mit der angegebenen ID wurde nicht gefunden.';
            } else if (error.code === 50013) { // Missing Permissions
                errorMessage = '> `❗` » Mir fehlen die Berechtigungen, um auf diese Nachricht zu reagieren.';
            }

            interaction.reply({ content: errorMessage, ephemeral: true });
        }
    },
};
