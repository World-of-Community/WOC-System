import "dotenv/config";
import fs from "fs";
import path from "path";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isBlockedCommand = (name = "") => {
    const normalized = name.toLowerCase();
    return normalized.includes("coin")
        || normalized.includes("leaderboard")
        || normalized === "season-pass"
        || normalized === "daily";
};

const deployCommands = async function deploy() {

    const configFile = fs.readFileSync(path.resolve(__dirname, 'json/config.json'), 'utf-8');
    const config = JSON.parse(configFile);
    const commands = [];

    // Funktion zum rekursiven Durchsuchen von Verzeichnissen
    const readCommands = async (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                await readCommands(fullPath);  // Rekursiv in das Unterverzeichnis gehen
            } else if (file.endsWith(".js")) {
                const commandModule = await import(pathToFileURL(fullPath).href);
                const command = commandModule.default || commandModule;
                if (command.data) {
                    if (isBlockedCommand(command.data.name)) {
                        continue;
                    }
                    commands.push(command.data.toJSON());
                }
            }
        }
    };

    await readCommands(path.resolve(__dirname, "commands"));

    const restClient = new REST({ version: "10" }).setToken(config.token);

    try {
        await restClient.put(Routes.applicationGuildCommands(config.application, config.server), { body: commands });
        console.log("✅  | Successfully registered Commands!");
    } catch (error) {
        console.error(error);
    }
};

export { deployCommands };
