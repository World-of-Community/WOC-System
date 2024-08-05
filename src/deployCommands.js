require("dotenv").config();
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

const deployCommands = async function deploy() {

    const file = fs.readFileSync('src/json/config.json', 'utf-8');
    const config = JSON.parse(file);
    const commands = [];

    // Funktion zum rekursiven Durchsuchen von Verzeichnissen
    const readCommands = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = `${dir}/${file}`;
            if (fs.statSync(fullPath).isDirectory()) {
                readCommands(fullPath);  // Rekursiv in das Unterverzeichnis gehen
            } else if (file.endsWith(".js")) {
                const command = require(fullPath);
                if (command.data) {
                    commands.push(command.data.toJSON());
                }
            }
        }
    };

    readCommands("./src/commands");

    const restClient = new REST({ version: "10" }).setToken(config.token);

    restClient.put(Routes.applicationGuildCommands(config.application, config.server), { body: commands })
        .then(() => console.log("Successfully registered Commands!"))
        .catch(console.error);
};

module.exports = { deployCommands };
