require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

//const isBlockedCommand = (name = "") => {
//    const normalized = name.toLowerCase();
//    return normalized.includes("coin")
//        || normalized.includes("leaderboard")
//        || normalized === "season-pass"
//        || normalized === "daily";
//};

const deployCommands = async function deploy() {

    const file = fs.readFileSync(path.resolve(__dirname, 'json/config.json'), 'utf-8');
    const config = JSON.parse(file);
    const commands = [];

    // Funktion zum rekursiven Durchsuchen von Verzeichnissen
    const readCommands = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                readCommands(fullPath);  // Rekursiv in das Unterverzeichnis gehen
            } else if (file.endsWith(".js")) {
                const command = require(fullPath);
                //if (command.data) {
                //    if (isBlockedCommand(command.data.name)) {
                //        continue;
                //    }
                //    commands.push(command.data.toJSON());
                //}
            }
        }
    };

    readCommands(path.resolve(__dirname, "commands"));

    const restClient = new REST({ version: "10" }).setToken(config.token);

    try {
        await restClient.put(Routes.applicationGuildCommands(config.application, config.server), { body: commands });
        console.log("✅  | Successfully registered Commands!");
    } catch (error) {
        console.error(error);
    }
};

module.exports = { deployCommands };
