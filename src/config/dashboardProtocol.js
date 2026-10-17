// Redis contract between the bot and the dashboard (dashboard/). Both sides import this file.

export const KEYS = Object.freeze({
  snapshot: "woc:snapshot",
  commandChannel: "woc:cmd",
  result: (id) => `woc:res:${id}`,
});

export const SNAPSHOT_INTERVAL = 30_000;
export const SNAPSHOT_TTL = 90;

// Commands the dashboard may send to the bot: { id, type, payload }
export const COMMANDS = Object.freeze({
  settingsReload: "settings:reload",
  commandsSync: "commands:sync",
  emojiQuizReview: "emojiquiz:review",
});
