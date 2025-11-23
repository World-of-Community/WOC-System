const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const AsciiTable = require('ascii-table');
const { Logger } = require('../utils');

/**
 * Command Handler
 * Lädt alle Slash Commands aus dem commands Ordner
 */
class CommandHandler {
    constructor(client) {
        this.client = client;
        this.client.commands = new Collection();
    }

    /**
     * Lädt alle Commands
     */
    load() {
        const table = new AsciiTable()
            .setHeading('Slash Commands', 'Status')
            .setBorder('|', '=', '0', '0');

        const commandsPath = path.resolve(__dirname, '../commands');
        this.readCommands(commandsPath, table);

        console.log(table.toString());
        Logger.success(`${this.client.commands.size} Commands geladen`);
    }

    /**
     * Liest Commands rekursiv aus Verzeichnis
     */
    readCommands(dir, table) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
            const fullPath = path.join(dir, file);

            if (fs.statSync(fullPath).isDirectory()) {
                this.readCommands(fullPath, table);
            } else if (file.endsWith('.js')) {
                try {
                    const command = require(fullPath);

                    if (command.data && command.data.name) {
                        this.client.commands.set(command.data.name, command);
                        table.addRow(command.data.name, '✅');
                    } else {
                        table.addRow(file.split('.js')[0], '⛔');
                        Logger.warning(`Command ${file} hat keine gültige data oder name Property`);
                    }
                } catch (error) {
                    table.addRow(file.split('.js')[0], '⛔');
                    Logger.error(`Fehler beim Laden von Command ${file}`, error);
                }
            }
        }
    }

    /**
     * Lädt einen einzelnen Command neu
     */
    reload(commandName) {
        try {
            const command = this.client.commands.get(commandName);
            if (!command) {
                return { success: false, error: 'Command nicht gefunden' };
            }

            // Lösche aus require cache
            const commandPath = require.resolve(`../commands/${commandName}.js`);
            delete require.cache[commandPath];

            // Lade Command neu
            const reloadedCommand = require(commandPath);
            this.client.commands.set(commandName, reloadedCommand);

            Logger.success(`Command ${commandName} neu geladen`);
            return { success: true };
        } catch (error) {
            Logger.error(`Fehler beim Neuladen von Command ${commandName}`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Gibt Command-Statistiken zurück
     */
    getStats() {
        const categories = {};

        for (const command of this.client.commands.values()) {
            const category = command.category || 'Unbekannt';
            categories[category] = (categories[category] || 0) + 1;
        }

        return {
            total: this.client.commands.size,
            categories
        };
    }
}

module.exports = CommandHandler;
