const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('react')
        .setDescription('» Reagiere auf eine Nachricht mit Emojis.')
        .addStringOption(option => option.setName('nachrichtid').setDescription('» Die ID der Nachricht.').setRequired(true))
        .addStringOption(option => option.setName('emoji1').setDescription('» Das erste Emoji.').setRequired(true))
        .addStringOption(option => option.setName('emoji2').setDescription('» Das zweite Emoji.').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const messageId = interaction.options.getString('nachrichtid');
        const emoji1 = interaction.options.getString('emoji1');
        const emoji2 = interaction.options.getString('emoji2');

        try {
            const targetMessage = await interaction.channel.messages.fetch(messageId);
            await targetMessage.react(emoji1);
            await targetMessage.react(emoji2);
            interaction.reply({ content: '> `✅` » Reaktion erfolgreich hinzugefügt.', ephemeral: true });
        } catch (error) {
            console.error('Fehler Reaktion zu der Nachricht:', error);
            interaction.reply({ content: '> `❗` » Beim Versuch, auf die Nachricht zu reagieren, ist ein Fehler aufgetreten.', ephemeral: true });
        }
    },
};