const { Client, GatewayIntentBits, Partials } = require("discord.js");
const mongoose = require("mongoose");
const config = require("./config");
const { Logger } = require("./utils");
const { CommandHandler, EventHandler, ButtonHandler, ModalHandler } = require("./handlers");
const {
  AdventService,
  BirthdayService,
  GiveawayService,
  LoggingService,
  VoiceService,
  CronService,
} = require("./services");
const { deployCommands } = require("./deployCommands");

/**
 * Haupteinstiegspunkt des Bots
 * Initialisiert Client, lädt Handler und startet Services
 */

// Client initialisieren
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
  partials: [
    Partials.Channel,
    Partials.User,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
  ],
});

// Event Listener Limit erhöhen
client.setMaxListeners(20);

// Handler initialisieren
const commandHandler = new CommandHandler(client);
const eventHandler = new EventHandler(client);
const buttonHandler = new ButtonHandler(client);
const modalHandler = new ModalHandler(client);

// Services initialisieren
let services = {};

/**
 * Initialisiert die Datenbank
 */
async function connectDatabase() {
  try {
    await mongoose.connect(config.mongodb.uri);
    Logger.success("Datenbank verbunden");

    mongoose.connection.on("error", (err) => {
      Logger.error("MongoDB Verbindungsfehler", err);
    });

    mongoose.connection.on("disconnected", () => {
      Logger.warning("MongoDB Verbindung getrennt");
    });
  } catch (error) {
    Logger.error("Fehler beim Verbinden zur Datenbank", error);
    process.exit(1);
  }
}

/**
 * Lädt alle Handler
 */
function loadHandlers() {
  Logger.info("Lade Handler...");

  // Deploy Commands
  deployCommands();

  // Lade Commands
  commandHandler.load();

  // Lade Events
  eventHandler.load();

  // Lade Button Handler
  buttonHandler.load();

  // Lade Modal Handler
  modalHandler.load();

  // Handler global verfügbar machen
  client.buttonHandler = buttonHandler;
  client.modalHandler = modalHandler;

  Logger.success("Alle Handler geladen");
}

/**
 * Startet alle Services
 */
function startServices() {
  Logger.info("Starte Services...");

  services = {
    advent: new AdventService(client),
    birthday: new BirthdayService(client),
    giveaway: new GiveawayService(client),
    logging: new LoggingService(client),
    voice: new VoiceService(client),
    cron: new CronService(client),
  };

  // Starte Services
  services.advent.start();
  services.birthday.start();
  services.giveaway.start();
  services.cron.start();

  // Services global verfügbar machen
  client.services = services;

  Logger.success("Alle Services gestartet");
}

/**
 * Lädt bestehende Handler-Funktionen (für Kompatibilität)
 */
function loadLegacyHandlers() {
  const fs = require("fs");
  const functionFolder = fs.readdirSync("./src/functions");

  for (const folder of functionFolder) {
    const functionFiles = fs
      .readdirSync(`./src/functions/${folder}`)
      .filter((file) => file.endsWith(".js"));

    for (const file of functionFiles) {
      try {
        require(`./functions/${folder}/${file}`)(client);
      } catch (error) {
        Logger.error(`Fehler beim Laden von Legacy-Handler: ${folder}/${file}`, error);
      }
    }
  }

  // Vorschlag System (falls vorhanden)
  if (typeof client.vorschlag === "function") {
    client.vorschlag();
  }

  // Team Handler
  if (typeof client.handleErfolg === "function") {
    client.handleErfolg();
  }

  if (typeof client.manageTeam === "function") {
    client.manageTeam();
  }
}

/**
 * Graceful Shutdown Handler
 */
function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    Logger.warning(`${signal} empfangen, fahre Bot herunter...`);

    // Logge Bot Offline
    if (services.logging) {
      await services.logging.logBotOffline();
    }

    // Stoppe Services
    if (services.giveaway) {
      services.giveaway.stop();
    }

    if (services.cron) {
      services.cron.stop();
    }

    // Schließe Datenbank
    await mongoose.connection.close();
    Logger.info("Datenbankverbindung geschlossen");

    // Logout Bot
    client.destroy();
    Logger.info("Bot heruntergefahren");

    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("unhandledRejection", (error) => {
    Logger.error("Unhandled Rejection", error);
  });
}

/**
 * Hauptfunktion - Startet den Bot
 */
async function main() {
  try {
    Logger.info("Starte Bot...");
    Logger.info(`Node Version: ${process.version}`);
    Logger.info(`Discord.js Version: ${require("discord.js").version}`);

    // Verbinde Datenbank
    await connectDatabase();

    // Lade Handler
    loadHandlers();

    // Lade Legacy-Handler (für Kompatibilität)
    loadLegacyHandlers();

    // Setup Graceful Shutdown
    setupGracefulShutdown();

    // Login
    await client.login(config.discord.token);

    // Starte Services nachdem Bot ready ist
    client.once("ready", () => {
      Logger.success(`Bot eingeloggt als ${client.user.tag}`);
      startServices();

      // Logge Bot Online
      if (services.logging) {
        services.logging.logBotOnline();
      }
    });

  } catch (error) {
    Logger.error("Kritischer Fehler beim Starten des Bots", error);
    process.exit(1);
  }
}

// Export für andere Module
module.exports = { client };

// Starte Bot
main();
