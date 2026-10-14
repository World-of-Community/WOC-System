import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  ActivityType,
  PermissionFlagsBits,
} from "discord.js";
import mongoose from "mongoose";
import fs from "fs";
import logger from "./functions/logger.js";
import chalk from "chalk";
import { syncStreamerRoleForMember } from "./functions/streamerRole.js";

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
  // Website: https://patorjk.com
  // Font: ANSI Shadow

  logger.log(chalk.hex("#ff7b00")("\n\n" +
    "██╗    ██╗ ██████╗  ██████╗\n" +
    "██║    ██║██╔═══██╗██╔════╝\n" +
    "██║ █╗ ██║██║   ██║██║     \n" +
    "██║███╗██║██║   ██║██║     \n" +
    "╚███╔███╔╝╚██████╔╝╚██████╗\n" +
    " ╚══╝╚══╝  ╚═════╝  ╚═════╝\n" +
    "      WORLD OF COMMUNITY   \n"));
}

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) {return;}
  if (message.content.trim().toLowerCase() !== "!teststream") {return;}

  const member = message.member;
  if (!member) {
    await message.reply("❌ Kein Guild-Member für den Test gefunden.");
    return;
  }

  if (!member.permissions.has(PermissionFlagsBits.ManageRoles)) {
    await message.reply("❌ Du brauchst die Berechtigung `Rollen verwalten` für `!teststream`.");
    return;
  }

  const testStreamingActivity = {
    type: ActivityType.Streaming,
    name: "WOC Teststream",
    url: "https://twitch.tv/worldofcommunity",
    details: "Simulierter Stream via !teststream",
  };

  const result = await syncStreamerRoleForMember(
    member,
    [testStreamingActivity],
    "teststream",
  );

  if (result.status === "added_role") {
    await message.reply("✅ Test erfolgreich: Streaming-Rolle wurde real vergeben.");
    return;
  }

  if (result.status === "already_had_role") {
    await message.reply("ℹ️ Test erfolgreich: Streaming erkannt, Rolle war bereits vorhanden.");
    return;
  }

  await message.reply(`❌ Test fehlgeschlagen: ${result.status}.`);
});
