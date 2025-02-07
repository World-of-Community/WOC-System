const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setcustomstatus')
        .setDescription('Setzt eine benutzerdefinierte Statusnachricht für den Bot')
        .addStringOption(option => 
            option.setName('status')
                .setDescription('Die Statusnachricht, die angezeigt werden soll')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        const status = interaction.options.getString('status');

        try {
            await interaction.client.user.setPresence({
                activities: [{ name: status, type: 4 }], // Typ 4 = benutzerdefinierter Status
                status: 'online' // Kann auf 'idle', 'dnd' oder 'invisible' gesetzt werden
            });

            await interaction.reply({ content: `Benutzerdefinierter Status gesetzt: **${status}**`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Fehler beim Setzen des benutzerdefinierten Status.', ephemeral: true });
        }
    },
};