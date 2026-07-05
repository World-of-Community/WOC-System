import "dotenv/config";
import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";
import mongoose from "mongoose";
import fs from "fs";
import logger from "./functions/logger.js";
import chalk from "chalk";

const client = new Client({
  intents: [
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel, Partials.User, Partials.GuildMember, Partials.Message, Partials.Reaction],
});

export default client;

(async () => {
  try {

    printAsciiLogo();

    client.commands = new Collection();
    client.aliases = new Collection();
    client.slashCommands = new Collection();
    client.buttons = new Collection();
    client.modals = new Collection();
    client.selectMenus = new Collection();
    client.contextMenus = new Collection();
    client.allCommands = new Array();

    client.setMaxListeners(100);

    const handlers = fs.readdirSync("./handlers");
    for (const handler of handlers) {
      const handlerModule = await import(`./handlers/${handler}`);
      if (typeof handlerModule.default === "function") {
        await handlerModule.default(client);
      }
    }

    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGO_URI);
    logger.success("🔗  | Datenbank ist verbunden");

    client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    logger.error(error);
  }

})();

client.on("error", (error) => {
  logger.error(error.stack || error);
});

process.on("unhandledRejection", (error) => {
  logger.error(error);
});

function printAsciiLogo() {
  // Website: https://patorjk.com/software/taag/
  // Font: ANSI Shadow

  logger.log(chalk.hex("#ff7b00")("\n\n██╗    ██╗ ██████╗  ██████╗\n" +
    "██║    ██║██╔═══██╗██╔════╝\n" +
    "██║ █╗ ██║██║   ██║██║     \n" +
    "██║███╗██║██║   ██║██║     \n" +
    "╚███╔███╔╝╚██████╔╝╚██████╗\n" +
    " ╚══╝╚══╝  ╚═════╝  ╚═════╝\n" +
    "      WORLD OF COMMUNITY   \n"));
}
