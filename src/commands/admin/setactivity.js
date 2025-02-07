const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setcustomstatus')
        .setDescription('Setzt eine benutzerdefinierte Statusnachricht für den Bot')
        .addStringOption(option =>
            option.setName('status')
                .setDescription('Die Statusnachricht, die angezeigt werden soll')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('presence')
                .setDescription('Der Online-Status des Bots')
                .setRequired(true)
                .addChoices(
                    { name: 'Online', value: 'online' },
                    { name: 'AFK (Idle)', value: 'idle' },
                    { name: 'Bitte nicht stören (DND)', value: 'dnd' },
                    { name: 'Unsichtbar (Offline)', value: 'invisible' }
                )
        ),

    async execute(interaction) {
        const status = interaction.options.getString('status');
        const presence = interaction.options.getString('presence');

        try {
            await interaction.client.user.setPresence({
                activities: [{ name: status, type: 4 }], // Typ 4 = Benutzerdefinierter Status
                status: presence
            });

            await interaction.reply({ 
                content: `Benutzerdefinierter Status gesetzt: **${status}**\nOnline-Status: **${presence}**`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Fehler beim Setzen des Status.', ephemeral: true });
        }
    },
};