require("dotenv").config();

/**
 * Zentrale Konfigurationsverwaltung
 * Lädt alle Umgebungsvariablen und stellt sie zur Verfügung
 */
const config = {
  // Discord Bot
  discord: {
    token: process.env.DISCORD_TOKEN,
    applicationId: process.env.APPLICATION_ID,
    guildId: process.env.GUILD_ID,
  },

  // MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI,
  },

  // Channels
  channels: {
    changelog: process.env.CHANGELOG_CHANNEL,
    autoDelete: process.env.AUTO_DELETE_CHANNEL,
    vorschlaege: process.env.VORSCHLAEGE_CHANNEL,
    threads: process.env.THREADS_CHANNEL,
    willkommen: process.env.WILLKOMMEN_CHANNEL,
    banLog: process.env.BAN_LOG_CHANNEL,
  },

  // Categories
  categories: {
    category1: process.env.CATEGORY_1,
    category2: process.env.CATEGORY_2,
    category3: process.env.CATEGORY_3,
    category4: process.env.CATEGORY_4,
    category5: process.env.CATEGORY_5,
  },

  // Server
  server: {
    vanity: process.env.VANITY_URL,
    tag: process.env.SERVER_TAG,
  },

  // Roles
  roles: {
    vanityTag: process.env.VANITY_TAG_ROLE,
    vanity: process.env.VANITY_ROLE,
    verify: process.env.VERIFY_ROLE,
    ban: process.env.BAN_ROLE,
    member: process.env.MEMBER_ROLE,
    changelog: process.env.CHANGELOG_ROLE,
    bump: process.env.BUMP_ROLE,
    emojis: process.env.EMOJI_ROLES?.split(",") || [],
  },
};

// Validierung der kritischen Konfigurationswerte
function validateConfig() {
  const required = [
    { key: "discord.token", value: config.discord.token },
    { key: "discord.applicationId", value: config.discord.applicationId },
    { key: "discord.guildId", value: config.discord.guildId },
    { key: "mongodb.uri", value: config.mongodb.uri },
  ];

  const missing = required.filter(item => !item.value);

  if (missing.length > 0) {
    console.error("❌ Fehlende Konfigurationswerte:");
    missing.forEach(item => console.error(`   - ${item.key}`));
    console.error("\n💡 Bitte überprüfe deine .env Datei");
    process.exit(1);
  }
}

validateConfig();

module.exports = config;
