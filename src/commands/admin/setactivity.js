const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setactivity')
        .setDescription('Setzt die Aktivität des Bots')
        .addStringOption(option => 
            option.setName('type')
                .setDescription('Der Aktivitätstyp (PLAYING, STREAMING, LISTENING, WATCHING, COMPETING)')
                .setRequired(true)
                .addChoices(
                    { name: 'Spielt', value: 'PLAYING' },
                    { name: 'Streamt', value: 'STREAMING' },
                    { name: 'Hört zu', value: 'LISTENING' },
                    { name: 'Schaut', value: 'WATCHING' },
                    { name: 'Wettkämpft', value: 'COMPETING' }
                )
        )
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name der Aktivität')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        const type = interaction.options.getString('type');
        const name = interaction.options.getString('name');

        try {
            await interaction.client.user.setActivity(name, { type });

            await interaction.reply({ content: `Die Aktivität wurde auf **${type.toLowerCase()} ${name}** gesetzt.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Fehler beim Setzen der Aktivität.', ephemeral: true });
        }
    },
};