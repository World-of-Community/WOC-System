const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('command-status')
        .setDescription('» Listet dir alle Befehle auf.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        // Pfad zu den Befehlen
        const commandsPath = path.resolve(__dirname, '../commands');

        // Funktion zum rekursiven Durchsuchen von Verzeichnissen
        const getCommandFiles = (dir) => {
            let results = [];
            const list = fs.readdirSync(dir);
            list.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat && stat.isDirectory()) {
                    results = results.concat(getCommandFiles(filePath)); // Rekursion für Unterverzeichnisse
                } else if (file.endsWith('.js')) {
                    results.push(filePath);
                }
            });
            return results;
        };

        // Alle Befehlsdateien finden
        const commandFiles = getCommandFiles(commandsPath);

        // Liste der Befehle und deren Status (🟢 oder 🔴)
        const commandList = interaction.client.commands.map(command => {
            let status = '🟢'; // Standardmäßig auf "funktioniert" setzen
            try {
                // Überprüfen, ob die Datei existiert
                const commandPath = path.join(commandsPath, `${command.data.name}.js`);
                if (!commandFiles.includes(commandPath)) {
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
