import { cleanupExpired } from "#systems/teammanager.js";

export default {
  name: "teamCleanup",
  cron: "0 0 * * *",

  async execute(client) {
    await cleanupExpired(client);
  },
};
