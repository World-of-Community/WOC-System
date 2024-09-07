const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commands')
        .setDescription('» Listet dir alle Befehle auf.'),

    async execute(interaction) {

        // Liste der Befehle und deren Status (🟢 oder 🔴)
        const commandList = interaction.client.commands.map(command => {
            let status = '🟢'; // Standardmäßig auf "funktioniert" setzen
            try {
                // Überprüfen, ob die Datei existiert
                const commandPath = `./commands/${command.data.name}.js`;
                if (!fs.existsSync(commandPath)) {
                    status = '🔴'; // Falls die Datei nicht existiert, setze den Status auf rot
                }
            } catch (error) {
                status = '🔴'; // Falls ein Fehler auftritt, setze den Status auf rot
            }
            return `(\`${status}\`) - \`/${command.data.name}\``; // Befehl und Status
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
