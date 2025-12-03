const { SlashCommandBuilder, PermissionFlagsBits, PermissionBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reaction-remove')
        .setDescription('» Entfernt Reaktionen von einer bestimmten Nachricht. 📌')
        .addStringOption(option => 
            option.setName('nachrichtid')
                .setDescription('Die ID der Nachricht, von der die Reaktionen entfernt werden sollen.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('emoji1')
                .setDescription('Das erste Emoji, das entfernt werden soll.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('emoji2')
                .setDescription('Das optionale zweite Emoji, das entfernt werden soll.')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const messageId = interaction.options.getString('nachrichtid');
        const emoji1 = interaction.options.getString('emoji1');
        const emoji2 = interaction.options.getString('emoji2');
        
        const channel = interaction.channel;

        try {
            const message = await channel.messages.fetch(messageId);
            if (!message) {
                return interaction.reply({ content: '> `❌` » Nachricht nicht gefunden.', ephemeral: true });
            }

            // Entfernt die erste Reaktion
            const reaction1 = message.reactions.cache.get(emoji1);
            if (reaction1) {
                await reaction1.remove();
            } else {
                return interaction.reply({ content: `> \`❌\` » Reaktion ${emoji1} nicht gefunden.`, ephemeral: true });
            }

            // Entfernt die optionale zweite Reaktion
            if (emoji2) {
                const reaction2 = message.reactions.cache.get(emoji2);
                if (reaction2) {
                    await reaction2.remove();
                } else {
                    return interaction.reply({ content: `> \`❌\` »Reaktion ${emoji2} nicht gefunden.`, ephemeral: true });
                }
            }

            await interaction.reply({ content: '> `✅` » Reaktionen erfolgreich entfernt.', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '> `❗` » Fehler beim Entfernen der Reaktionen.', ephemeral: true });
        }
    },
};
