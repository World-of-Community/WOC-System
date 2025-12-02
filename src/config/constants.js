/**
 * Konstanten für den Bot
 * Zentrale Stelle für Magic Numbers, Strings und andere Konstanten
 */

const COLORS = {
  PRIMARY: 0x5865F2,      // Discord Blurple
  SUCCESS: 0x57F287,      // Grün
  WARNING: 0xFEE75C,      // Gelb
  ERROR: 0xED4245,        // Rot
  INFO: 0x3498DB,         // Blau
  SECONDARY: 0x99AAB5,    // Grau
};

const EMOJIS = {
  SUCCESS: "✅",
  ERROR: "❌",
  WARNING: "⚠️",
  INFO: "ℹ️",
  LOADING: "⏳",
  COIN: "🪙",
  STAR: "⭐",
  TROPHY: "🏆",
  ARROW_RIGHT: "➡️",
  ARROW_LEFT: "⬅️",
  CHECK: "✓",
  CROSS: "✗",
};

const LIMITS = {
  EMBED_TITLE: 256,
  EMBED_DESCRIPTION: 4096,
  EMBED_FIELDS: 25,
  EMBED_FIELD_NAME: 256,
  EMBED_FIELD_VALUE: 1024,
  EMBED_FOOTER: 2048,
  EMBED_AUTHOR: 256,
  MESSAGE_CONTENT: 2000,
};

const TIMEOUTS = {
  BUTTON_COLLECTOR: 60000,        // 1 Minute
  MODAL_TIMEOUT: 300000,          // 5 Minuten
  MESSAGE_DELETE: 10000,          // 10 Sekunden
  EPHEMERAL_REPLY: 5000,          // 5 Sekunden
};

const COOLDOWNS = {
  COMMAND_DEFAULT: 3000,          // 3 Sekunden
  DAILY: 86400000,                // 24 Stunden
  GIVEAWAY_CREATE: 300000,        // 5 Minuten
};

const PERMISSIONS = {
  ADMINISTRATOR: "Administrator",
  MANAGE_GUILD: "ManageGuild",
  MANAGE_ROLES: "ManageRoles",
  MANAGE_CHANNELS: "ManageChannels",
  KICK_MEMBERS: "KickMembers",
  BAN_MEMBERS: "BanMembers",
  MANAGE_MESSAGES: "ManageMessages",
  MODERATE_MEMBERS: "ModerateMembers",
};

const TEAM_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MODERATOR: "moderator",
  SUPPORTER: "supporter",
};

module.exports = {
  COLORS,
  EMOJIS,
  LIMITS,
  TIMEOUTS,
  COOLDOWNS,
  PERMISSIONS,
  TEAM_ROLES,
};
