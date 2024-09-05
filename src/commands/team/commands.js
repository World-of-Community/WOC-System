const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-commands')
        .setDescription('» Listet dir alle Befehle auf.'),

    async execute(interaction) {

        // Liste der Befehle und deren Status (🟢 oder 🔴)
        const commandList = interaction.client.commands.map(command => {
            // Überprüfen, ob der Befehl funktioniert (kein Fehler beim Laden)
            let status;
            try {
                // Hier wäre es besser, nicht erneut zu require, sondern einfach die Existenz zu prüfen
                require.resolve(`../commands/${command.data.name}.js`);
                status = '🟢';  // Befehl funktioniert
            } catch (error) {
                status = '🔴';  // Befehl funktioniert nicht
            }
            return `/${command.data.name} - (\`${status}\`)`; // Befehl und Status ohne Backticks
        }).join('\n'); // Liste untereinander

        // Erstelle das Embed
        const commandEmbed = new EmbedBuilder()
            .setTitle('Befehle')
            .setDescription(`Hier sind alle Befehle (Status):\n\n${commandList}`)
            .setColor('Blurple')
            .setFooter({ text: `${interaction.guild.name} - Befehle`, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        // Sende das Embed als Antwort
        await interaction.reply({ embeds: [commandEmbed], ephemeral: true });
    },
};
