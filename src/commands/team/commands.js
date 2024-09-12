const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path'); // Import path for better path handling

module.exports = {
    data: new SlashCommandBuilder()
        .setName('command-status')
        .setDescription('» Listet dir alle Befehle auf.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        // Pfad zu den Befehlen
        const commandsPath = path.resolve(__dirname, '../commands');
        
        // Liste der Befehle und deren Status (🟢 oder 🔴)
        const commandList = interaction.client.commands.map(command => {
            let status = '🟢'; // Standardmäßig auf "funktioniert" setzen
            try {
                // Überprüfen, ob die Datei existiert
                const commandPath = path.join(commandsPath, `${command.data.name}.js`);
                if (!fs.existsSync(commandPath)) {
                    console.error(`Datei nicht gefunden: ${commandPath}`); // Fehlerprotokollierung
                    status = '🔴'; // Falls die Datei nicht existiert, setze den Status auf rot
                }
            } catch (error) {
                console.error(`Fehler beim Überprüfen der Datei: ${error.message}`); // Fehlerprotokollierung
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