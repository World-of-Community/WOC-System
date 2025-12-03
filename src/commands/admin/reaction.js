const { SlashCommandBuilder, PermissionFlagsBits, PermissionBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reaction')
        .setDescription('» Fügt Reaktionen zu einer Nachricht hinzu. 📌')
        .addStringOption(option => 
            option.setName('messageid')
                .setDescription('Die ID der Nachricht, zu der Reaktionen hinzugefügt werden sollen.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('emoji1')
                .setDescription('Das erste Emoji')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('emoji2')
                .setDescription('Das zweite Emoji (optional)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const messageId = interaction.options.getString('messageid');
        const emoji1 = interaction.options.getString('emoji1');
        const emoji2 = interaction.options.getString('emoji2');

        try {
            // Nachricht mit der angegebenen ID abrufen
            const message = await interaction.channel.messages.fetch(messageId);
            
            if (!message) {
                return interaction.reply({ content: '> `❗` » Die Nachricht mit dieser ID konnte nicht gefunden werden.', ephemeral: true });
            }

            // Reaktionen hinzufügen
            await message.react(emoji1);

            if (emoji2) {
                await message.react(emoji2);
            }

            return interaction.reply({ content: '> `✅` » Reaktionen wurden erfolgreich hinzugefügt!', ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '> `❌` » Es gab ein Problem beim Hinzufügen der Reaktionen. Bitte überprüfe die Nachricht-ID und die Emojis.', ephemeral: true });
        }
    },
};
