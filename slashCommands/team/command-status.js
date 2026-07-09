import { EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../../functions/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "command-status",
  description: "» Listet dir alle Befehle auf.",
  type: 1,
  default_member_permissions: "268435456",
  options: [],

  async run(client, interaction) {
    // Pfad zu den Befehlen
    const commandsPath = path.resolve(__dirname, "../");
    logger.info(`Befehle Verzeichnis: ${commandsPath}`); // Debug-Ausgabe

    // Funktion zum rekursiven Durchsuchen von Verzeichnissen
    const getCommandFiles = (dir) => {
      let results = [];
      try {
        const list = fs.readdirSync(dir);
        list.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat && stat.isDirectory()) {
            results = results.concat(getCommandFiles(filePath)); // Rekursion für Unterverzeichnisse
          } else if (file.endsWith(".js")) {
            results.push(filePath);
          }
        });
      } catch (error) {
        logger.error(`Fehler beim Durchsuchen von ${dir}: ${error.message}`); // Fehlerprotokollierung
      }
      return results;
    };

    // Alle Befehlsdateien finden
    const commandFiles = getCommandFiles(commandsPath);
    logger.info(`Gefundene Befehlsdateien: ${commandFiles.join(", ")}`); // Debug-Ausgabe

    // Liste der Befehle und deren Status (🟢 oder 🔴)
    const commandList = interaction.client.commands.map(command => {
      let status = "🟢"; // Standardmäßig auf "funktioniert" setzen
      try {
        // Erstelle den Pfad zur Befehlsdatei
        const commandFilePath = path.join(commandsPath, `${command.data.name}.js`);

        // Überprüfen, ob der Pfad in der Liste der gefundenen Befehlsdateien enthalten ist
        if (!commandFiles.some(file => file.includes(command.data.name))) {
          logger.error(`Datei nicht gefunden: ${commandFilePath}`); // Fehlerprotokollierung
          status = "🔴"; // Falls die Datei nicht existiert, setze den Status auf rot
        }
      } catch (error) {
        logger.error(`Fehler beim Überprüfen der Datei: ${error.message}`); // Fehlerprotokollierung
        status = "🔴"; // Falls ein Fehler auftritt, setze den Status auf rot
      }
      return `(\`${status}\`) - \`/${command.data.name}\``; // Befehl und Status
    }).join("\n"); // Liste untereinander

    // Erstelle das Embed
    const commandEmbed = new EmbedBuilder()
      .setTitle("Befehle")
      .setDescription(`Hier sind alle Befehle (Status):\n\n${commandList}`)
      .setColor("Blurple")
      .setFooter({ text: `${interaction.guild.name} - Befehle`, iconURL: interaction.guild.iconURL() })
      .setTimestamp();

    // Sende das Embed als Antwort
    await interaction.reply({ embeds: [commandEmbed], ephemeral: true });
  },
};
