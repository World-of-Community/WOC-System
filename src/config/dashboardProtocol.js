// Redis contract between the bot and the separate WOC-Dashboard repo. Keep both copies of this file in sync.

export const KEYS = Object.freeze({
  snapshot: "woc:snapshot",
  schema: "woc:schema",
  commandChannel: "woc:cmd",
  result: (id) => `woc:res:${id}`,
});

export const SNAPSHOT_INTERVAL = 30_000;
export const SNAPSHOT_TTL = 90;

// Commands the dashboard may send to the bot: { id, type, payload }
export const COMMANDS = Object.freeze({
  settingsReload: "settings:reload",
  settingsSet: "settings:set",
  commandsSync: "commands:sync",
  emojiQuizReview: "emojiquiz:review",
  usersResolve: "users:resolve",
});
