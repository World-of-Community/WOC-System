const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('command-status')
        .setDescription('» Listet dir alle Befehle auf.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        
        const commandsPath = path.resolve(__dirname, '../commands');
        console.log(`Befehle Verzeichnis: ${commandsPath}`);

        // Funktion zum rekursiven Durchsuchen von Verzeichnissen
        const getCommandFiles = (dir) => {
            let results = [];
            try {
                const list = fs.readdirSync(dir);
                list.forEach(file => {
                    const filePath = path.join(dir, file);
                    const stat = fs.statSync(filePath);
                    if (stat && stat.isDirectory()) {
                        results = results.concat(getCommandFiles(filePath));
                    } else if (file.endsWith('.js')) {
                        results.push(filePath);
                    }
                });
            } catch (error) {
                console.error(`Fehler beim Durchsuchen von ${dir}: ${error.message}`);
            }
            return results;
        };

        // Alle Befehlsdateien finden
        const commandFiles = getCommandFiles(commandsPath);
        console.log(`Gefundene Befehlsdateien: ${commandFiles.join(', ')}`);

        // Liste der Befehle und deren Status (🟢 oder 🔴)
        const commandList = interaction.client.commands.map(command => {
            let status = '🟢'; // Standardmäßig auf "funktioniert" setzen
            try {
                // Erstelle den Pfad zur Befehlsdatei
                const commandFilePath = path.join(commandsPath, `${command.data.name}.js`);
                
                // Überprüfen, ob der Pfad in der Liste der gefundenen Befehlsdateien enthalten ist
                if (!commandFiles.some(file => file.includes(command.data.name))) {
                    console.error(`Datei nicht gefunden: ${commandFilePath}`); 
                    status = '🔴'; // Falls die Datei nicht existiert, setze den Status auf rot
                }
            } catch (error) {
                console.error(`Fehler beim Überprüfen der Datei: ${error.message}`);
                status = '🔴'; // Falls ein Fehler auftritt, setze den Status auf rot
            }
            return `(\`${status}\`) - \`/${command.data.name}\``;
        }).join('\n');

        const commandEmbed = new EmbedBuilder()
            .setTitle('Befehle')
            .setDescription(`Hier sind alle Befehle (Status):\n\n${commandList}`)
            .setColor('Blurple')
            .setFooter({ text: `${interaction.guild.name} - Befehle`, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [commandEmbed], ephemeral: true });
    },
};

