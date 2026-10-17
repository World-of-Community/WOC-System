// env.js must be the first import: it validates .env before anything else loads
import { env } from "./config/env.js";
import chalk from "chalk";
import client from "#client";
import logger from "#core/logger.js";
import { registerProcessHandlers, reportError } from "#core/errors.js";
import { registerShutdownHandlers, shutdown } from "#core/shutdown.js";
import { connectDatabase } from "#db/connection.js";
import { loadSettings } from "#core/settings.js";
import { startDashboardBridge } from "#core/dashboardBridge.js";
import { seedEntries } from "#systems/emojiQuiz.js";
import { loadAll, registerCommands } from "./loaders/index.js";

function printAsciiLogo() {
  // https://patorjk.com – font "ANSI Shadow"
  logger.log(chalk.hex("#ff7b00")("\n" +
    "██╗    ██╗ ██████╗  ██████╗\n" +
    "██║    ██║██╔═══██╗██╔════╝\n" +
    "██║ █╗ ██║██║   ██║██║     \n" +
    "██║███╗██║██║   ██║██║     \n" +
    "╚███╔███╔╝╚██████╔╝╚██████╗\n" +
    " ╚══╝╚══╝  ╚═════╝  ╚═════╝\n" +
    `      WORLD OF COMMUNITY   ${chalk.gray(`(${env.nodeEnv})`)}\n`));
}

async function main() {
  printAsciiLogo();
  logger.setLevel(env.logLevel);

  registerProcessHandlers();
  registerShutdownHandlers(client);

  client.on("error", (error) => reportError(error, { source: "discord:client" }));
  client.on("shardError", (error, shardId) => reportError(error, { source: `discord:shard#${shardId}` }));
  client.on("warn", (message) => logger.warn("Discord:", message));
  client.on("debug", (message) => logger.debug("Discord:", message));

  await connectDatabase();
  await loadSettings();
  await seedEntries();
  await loadAll(client);
  await registerCommands(client);
  await client.login(env.discord.token);
  // never blocks or fails the bot: Redis may be unreachable
  startDashboardBridge(client).catch((error) => logger.warn("Dashboard bridge not started:", error.message));
}

main().catch(async (error) => {
  logger.error("Startup failed:", error);
  await shutdown(client, { reason: "startup error", exitCode: 1 });
});
